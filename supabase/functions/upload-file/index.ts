import { S3Client, PutObjectCommand } from 'npm:@aws-sdk/client-s3'
import { getSignedUrl } from 'npm:@aws-sdk/s3-request-presigner'
import { createClient } from 'npm:@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  })
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) return json({ error: 'Missing Authorization' }, 401)

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: authHeader } } },
    )

    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) return json({ error: 'Unauthorized' }, 401)

    const { fileName, fileType, fileSize, workspaceId, folderId } = await req.json() as {
      fileName: string
      fileType: string
      fileSize: number
      workspaceId: string
      folderId: string | null
    }

    if (!fileName || !fileType || !workspaceId) {
      return json({ error: 'Missing required fields' }, 400)
    }

    const { data: canEdit, error: rpcError } = await supabase.rpc(
      'has_workspace_edit_permission',
      { p_workspace_id: workspaceId },
    )
    if (rpcError) return json({ error: 'Permission check failed' }, 500)
    if (!canEdit) return json({ error: 'Forbidden: insufficient role' }, 403)

    const timestamp = Date.now()
    const sanitizedName = fileName.replace(/[^a-zA-Z0-9._-]/g, '-')
    const r2Key = `${workspaceId}/${folderId ?? 'root'}/${timestamp}-${sanitizedName}`

    const s3Client = new S3Client({
      region: 'auto',
      endpoint: Deno.env.get('R2_ENDPOINT'),
      credentials: {
        accessKeyId: Deno.env.get('R2_ACCESS_KEY_ID') ?? '',
        secretAccessKey: Deno.env.get('R2_SECRET_ACCESS_KEY') ?? '',
      },
    })

    const command = new PutObjectCommand({
      Bucket: Deno.env.get('R2_BUCKET_NAME'),
      Key: r2Key,
      ContentType: fileType,
      ContentLength: fileSize,
    })

    const presignedUrl = await getSignedUrl(s3Client, command, {
      expiresIn: 3600,
    })

    return json({
      presignedUrl,
      r2Key,
      publicUrl: `${Deno.env.get('R2_PUBLIC_URL')}/${r2Key}`,
    })
  } catch (error) {
    console.error('Error:', error)
    return json({ error: 'Internal server error' }, 500)
  }
})
