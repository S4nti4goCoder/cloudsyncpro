import { S3Client, PutObjectCommand } from 'npm:@aws-sdk/client-s3'
import { getSignedUrl } from 'npm:@aws-sdk/s3-request-presigner'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { fileName, fileType, fileSize, workspaceId, folderId } = await req.json() as {
      fileName: string
      fileType: string
      fileSize: number
      workspaceId: string
      folderId: string | null
    }

    if (!fileName || !fileType || !workspaceId) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

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

    return new Response(
      JSON.stringify({
        presignedUrl,
        r2Key,
        publicUrl: `${Deno.env.get('R2_PUBLIC_URL')}/${r2Key}`,
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )
  } catch (error) {
    console.error('Error:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})