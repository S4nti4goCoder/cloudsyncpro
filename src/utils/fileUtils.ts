/**
 * Returns a human-readable file size string.
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`
}

/**
 * Returns an icon name based on mime type.
 */
export function getFileIcon(mimeType: string): string {
  if (mimeType.startsWith('image/')) return 'image'
  if (mimeType.startsWith('video/')) return 'video'
  if (mimeType.startsWith('audio/')) return 'audio'
  if (mimeType === 'application/pdf') return 'pdf'
  if (mimeType.includes('spreadsheet') || mimeType.includes('excel')) return 'spreadsheet'
  if (mimeType.includes('presentation') || mimeType.includes('powerpoint')) return 'presentation'
  if (mimeType.includes('word') || mimeType.includes('document')) return 'document'
  if (mimeType.includes('zip') || mimeType.includes('rar') || mimeType.includes('tar')) return 'archive'
  if (mimeType.includes('text/')) return 'text'
  return 'file'
}

/**
 * Returns a color class based on file type.
 */
export function getFileColor(mimeType: string): string {
  const icon = getFileIcon(mimeType)
  const colors: Record<string, string> = {
    image: 'text-purple-500 bg-purple-500/10',
    video: 'text-pink-500 bg-pink-500/10',
    audio: 'text-orange-500 bg-orange-500/10',
    pdf: 'text-red-500 bg-red-500/10',
    spreadsheet: 'text-green-500 bg-green-500/10',
    presentation: 'text-orange-500 bg-orange-500/10',
    document: 'text-blue-500 bg-blue-500/10',
    archive: 'text-yellow-500 bg-yellow-500/10',
    text: 'text-gray-500 bg-gray-500/10',
    file: 'text-gray-500 bg-gray-500/10',
  }
  return colors[icon] ?? colors['file']
}