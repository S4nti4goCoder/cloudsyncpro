import { supabase } from '@/lib/supabase'

interface PresignedUrlResponse {
  presignedUrl: string
  r2Key: string
  publicUrl: string
}

interface UploadFileInput {
  file: File
  workspaceId: string
  folderId: string | null
  onProgress?: (progress: number) => void
}

export const uploadService = {
  /**
   * Get a presigned URL from the Edge Function
   */
  async getPresignedUrl(
    fileName: string,
    fileType: string,
    fileSize: number,
    workspaceId: string,
    folderId: string | null
  ): Promise<PresignedUrlResponse> {
    const { data: { session } } = await supabase.auth.getSession()

    const response = await fetch(
      `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/upload-file`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session?.access_token}`,
          'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY,
        },
        body: JSON.stringify({ fileName, fileType, fileSize, workspaceId, folderId }),
      }
    )

    if (!response.ok) {
      const error = await response.json() as { error?: string }
      throw new Error(error.error ?? 'Error al obtener presigned URL')
    }

    return response.json() as Promise<PresignedUrlResponse>
  },

  /**
   * Upload a file directly to R2 using the presigned URL
   */
  async uploadToR2(
    presignedUrl: string,
    file: File,
    onProgress?: (progress: number) => void
  ): Promise<void> {
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest()

      xhr.upload.addEventListener('progress', (e) => {
        if (e.lengthComputable && onProgress) {
          const progress = Math.round((e.loaded / e.total) * 100)
          onProgress(progress)
        }
      })

      xhr.addEventListener('load', () => {
        if (xhr.status === 200) {
          resolve()
        } else {
          reject(new Error(`Upload failed with status ${xhr.status}`))
        }
      })

      xhr.addEventListener('error', () => reject(new Error('Upload failed')))

      xhr.open('PUT', presignedUrl)
      xhr.setRequestHeader('Content-Type', file.type)
      xhr.send(file)
    })
  },

  /**
   * Register the file in the database after upload
   */
  async registerFile(input: {
    name: string
    originalName: string
    size: number
    mimeType: string
    extension: string
    r2Key: string
    workspaceId: string
    folderId: string | null
    uploadedBy: string
  }) {
    const { data, error } = await supabase
      .from('files')
      .insert({
        name: input.name,
        original_name: input.originalName,
        size: input.size,
        mime_type: input.mimeType,
        extension: input.extension,
        r2_key: input.r2Key,
        workspace_id: input.workspaceId,
        folder_id: input.folderId,
        uploaded_by: input.uploadedBy,
        status: 'active',
        metadata: {},
        version: 1,
      })
      .select()
      .single()

    if (error) throw error
    return data
  },

  /**
   * Full upload flow: presigned URL → upload to R2 → register in DB
   */
  async uploadFile({
    file,
    workspaceId,
    folderId,
    onProgress,
  }: UploadFileInput) {
    const extension = file.name.includes('.') ? (file.name.split('.').pop() ?? '') : ''

    // 1. Get presigned URL
    const { presignedUrl, r2Key } = await this.getPresignedUrl(
      file.name,
      file.type,
      file.size,
      workspaceId,
      folderId
    )

    // 2. Upload to R2
    await this.uploadToR2(presignedUrl, file, onProgress)

    // 3. Register in database
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('No authenticated user')

    return await this.registerFile({
      name: file.name,
      originalName: file.name,
      size: file.size,
      mimeType: file.type || 'application/octet-stream',
      extension,
      r2Key,
      workspaceId,
      folderId,
      uploadedBy: user.id,
    })
  },
}