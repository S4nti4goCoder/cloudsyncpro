import { S3Client, DeleteObjectsCommand } from 'npm:@aws-sdk/client-s3'
import { createClient } from 'npm:@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers':
    'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  })
}

// 30 days in ms — files in trash older than this are eligible for auto-purge.
const AUTO_PURGE_AGE_MS = 30 * 24 * 60 * 60 * 1000

type Mode = 'user_ids' | 'user_workspace_trash' | 'auto_purge'

interface RequestBody {
  mode: Mode
  ids?: string[]
  workspaceId?: string
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? ''
    const anonKey = Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''

    const body = (await req.json().catch(() => ({}))) as RequestBody
    const { mode, ids, workspaceId } = body

    if (!mode) return json({ error: 'Missing "mode" field' }, 400)

    // Admin client always runs the actual writes — RLS is checked upfront via
    // the user's JWT (when applicable) before we let the admin do anything.
    const adminClient = createClient(supabaseUrl, serviceKey)

    // Resolve which file rows to purge based on mode + caller identity.
    let rowsToPurge: Array<{ id: string; r2_key: string; workspace_id: string }> = []

    if (mode === 'auto_purge') {
      // Cron-only path: the scheduled HTTP call sends a shared secret via the
      // X-Cron-Secret header, matched against the CRON_SECRET env var. Using a
      // dedicated secret (instead of the service_role key) avoids coupling to
      // Supabase's key-format migrations.
      const cronSecret = Deno.env.get('CRON_SECRET') ?? ''
      const provided = req.headers.get('x-cron-secret') ?? ''
      if (!cronSecret || provided !== cronSecret) {
        return json({ error: 'auto_purge requires valid cron secret' }, 403)
      }

      const cutoff = new Date(Date.now() - AUTO_PURGE_AGE_MS).toISOString()
      const { data, error } = await adminClient
        .from('files')
        .select('id, r2_key, workspace_id')
        .eq('status', 'deleted')
        .lt('updated_at', cutoff)

      if (error) return json({ error: error.message }, 500)
      rowsToPurge = data ?? []
    } else {
      // User-initiated path: verify JWT and that caller has edit permission.
      const authHeader = req.headers.get('Authorization')
      if (!authHeader) return json({ error: 'Missing Authorization' }, 401)

      const userClient = createClient(supabaseUrl, anonKey, {
        global: { headers: { Authorization: authHeader } },
      })

      const { data: { user }, error: userError } = await userClient.auth.getUser()
      if (userError || !user) return json({ error: 'Unauthorized' }, 401)

      if (mode === 'user_ids') {
        if (!ids?.length) return json({ error: 'Missing ids' }, 400)

        // Load rows — RLS must allow the user to see them. If RLS filters them
        // out we simply won't get them back and they won't be purged.
        const { data, error } = await userClient
          .from('files')
          .select('id, r2_key, workspace_id, status')
          .in('id', ids)
          .eq('status', 'deleted')

        if (error) return json({ error: error.message }, 500)

        // Verify edit permission per workspace touched.
        const workspaceIds = Array.from(new Set((data ?? []).map((r) => r.workspace_id)))
        for (const wsId of workspaceIds) {
          const { data: canEdit } = await userClient.rpc(
            'has_workspace_edit_permission',
            { p_workspace_id: wsId },
          )
          if (!canEdit) return json({ error: 'Forbidden' }, 403)
        }
        rowsToPurge = data ?? []
      } else if (mode === 'user_workspace_trash') {
        if (!workspaceId) return json({ error: 'Missing workspaceId' }, 400)

        const { data: canEdit } = await userClient.rpc(
          'has_workspace_edit_permission',
          { p_workspace_id: workspaceId },
        )
        if (!canEdit) return json({ error: 'Forbidden' }, 403)

        const { data, error } = await userClient
          .from('files')
          .select('id, r2_key, workspace_id')
          .eq('workspace_id', workspaceId)
          .eq('status', 'deleted')

        if (error) return json({ error: error.message }, 500)
        rowsToPurge = data ?? []
      } else {
        return json({ error: 'Invalid mode' }, 400)
      }
    }

    if (rowsToPurge.length === 0) {
      return json({ purged: 0, blobs_deleted: 0 })
    }

    // Delete R2 blobs — up to 1000 per DeleteObjects batch.
    const s3Client = new S3Client({
      region: 'auto',
      endpoint: Deno.env.get('R2_ENDPOINT'),
      credentials: {
        accessKeyId: Deno.env.get('R2_ACCESS_KEY_ID') ?? '',
        secretAccessKey: Deno.env.get('R2_SECRET_ACCESS_KEY') ?? '',
      },
    })
    const bucket = Deno.env.get('R2_BUCKET_NAME')

    let blobsDeleted = 0
    const blobKeys = rowsToPurge.map((r) => r.r2_key).filter(Boolean)

    for (let i = 0; i < blobKeys.length; i += 1000) {
      const chunk = blobKeys.slice(i, i + 1000)
      try {
        const res = await s3Client.send(
          new DeleteObjectsCommand({
            Bucket: bucket,
            Delete: { Objects: chunk.map((Key) => ({ Key })), Quiet: true },
          }),
        )
        blobsDeleted += chunk.length - (res.Errors?.length ?? 0)
        if (res.Errors?.length) {
          console.error('purge-files R2 errors:', res.Errors)
        }
      } catch (err) {
        console.error('purge-files R2 batch failed:', err)
        // Don't abort the whole purge on R2 errors — we still want the DB
        // rows cleaned so the UI doesn't show ghost trash entries forever.
      }
    }

    // Delete DB rows.
    const idsToDelete = rowsToPurge.map((r) => r.id)
    const { error: delError } = await adminClient
      .from('files')
      .delete()
      .in('id', idsToDelete)

    if (delError) return json({ error: delError.message }, 500)

    return json({ purged: idsToDelete.length, blobs_deleted: blobsDeleted })
  } catch (error) {
    console.error('purge-files error:', error)
    const message = error instanceof Error ? error.message : 'Unknown error'
    return json({ error: message }, 500)
  }
})
