export type FileCategory = 'document' | 'image' | 'video'

const DOCUMENT_EXTENSIONS = new Set([
  'pdf', 'doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx', 'txt',
])
const IMAGE_EXTENSIONS = new Set([
  'jpg', 'jpeg', 'png', 'webp', 'gif', 'svg', 'heic',
])
const VIDEO_EXTENSIONS = new Set([
  'mp4', 'mov', 'avi', 'webm', 'mkv',
])

// Limits per folder for folder-upload flow (stricter than storage).
export const UPLOAD_LIMITS = {
  document: 20,
  image: 30,
  video: 2,
} as const

// Limits per folder in long-term storage (enforced on upload AND move).
export const STORAGE_LIMITS = {
  document: 30,
  image: 50,
  video: 20,
} as const

export const MAX_UPLOAD_TOTAL_BYTES = 1024 * 1024 * 1024 // 1 GB
export const MAX_FOLDER_DEPTH = 10

const WINDOWS_RESERVED = new Set([
  'CON', 'PRN', 'AUX', 'NUL',
  'COM1', 'COM2', 'COM3', 'COM4', 'COM5', 'COM6', 'COM7', 'COM8', 'COM9',
  'LPT1', 'LPT2', 'LPT3', 'LPT4', 'LPT5', 'LPT6', 'LPT7', 'LPT8', 'LPT9',
])

export function getExtension(filename: string): string {
  const dot = filename.lastIndexOf('.')
  if (dot === -1 || dot === filename.length - 1) return ''
  return filename.slice(dot + 1).toLowerCase()
}

export function categorize(filename: string): FileCategory | null {
  const ext = getExtension(filename)
  if (!ext) return null
  if (DOCUMENT_EXTENSIONS.has(ext)) return 'document'
  if (IMAGE_EXTENSIONS.has(ext)) return 'image'
  if (VIDEO_EXTENSIONS.has(ext)) return 'video'
  return null
}

export const CATEGORY_LABEL: Record<FileCategory, string> = {
  document: 'documentos',
  image: 'imágenes',
  video: 'videos',
}

/**
 * Validate a filename (not full path) against anti-malicious rules.
 * Returns null if ok, error message otherwise.
 */
export function validateFileName(name: string): string | null {
  if (!name.trim()) return 'El nombre no puede estar vacío'
  if (name.length > 255) return 'El nombre es demasiado largo (máx 255 caracteres)'

  // Path traversal / separators.
  if (name.includes('..') || name.includes('/') || name.includes('\\')) {
    return 'El nombre contiene caracteres no permitidos'
  }

  // Control characters (ASCII 0-31).
  if (/[\x00-\x1f]/.test(name)) {
    return 'El nombre contiene caracteres de control'
  }

  // Windows reserved names (check base name, case-insensitive).
  const base = name.split('.')[0]?.toUpperCase() ?? ''
  if (WINDOWS_RESERVED.has(base)) {
    return `"${name}" es un nombre reservado del sistema`
  }

  return null
}

/**
 * Validate a folder name (no dot check but still path-safe).
 */
export function validateFolderName(name: string): string | null {
  if (!name.trim()) return 'El nombre no puede estar vacío'
  if (name.length > 255) return 'El nombre es demasiado largo'
  if (name.includes('..') || name.includes('/') || name.includes('\\')) {
    return 'El nombre contiene caracteres no permitidos'
  }
  if (/[\x00-\x1f]/.test(name)) return 'El nombre contiene caracteres de control'
  const upper = name.toUpperCase()
  if (WINDOWS_RESERVED.has(upper)) {
    return `"${name}" es un nombre reservado del sistema`
  }
  return null
}

/**
 * Validate a single file for upload: must have an allowed extension and safe name.
 */
export function validateFile(file: { name: string; size: number }): string | null {
  const nameErr = validateFileName(file.name)
  if (nameErr) return nameErr

  if (file.size === 0) return `"${file.name}" está vacío`

  const category = categorize(file.name)
  if (!category) {
    const ext = getExtension(file.name)
    return `Tipo de archivo no permitido${ext ? ` (.${ext})` : ''}: "${file.name}"`
  }

  return null
}

/**
 * Count files by category in a list.
 */
export function countByCategory(
  files: { name: string }[],
): Record<FileCategory, number> {
  const counts: Record<FileCategory, number> = { document: 0, image: 0, video: 0 }
  for (const f of files) {
    const cat = categorize(f.name)
    if (cat) counts[cat] += 1
  }
  return counts
}

/**
 * Validate that adding `incoming` files to a target folder that already has
 * `existing` files of each category will not exceed STORAGE_LIMITS.
 */
export function validateStorageCapacity(
  incoming: { name: string }[],
  existing: Record<FileCategory, number>,
): string | null {
  const incomingCounts = countByCategory(incoming)
  for (const cat of ['document', 'image', 'video'] as const) {
    const total = existing[cat] + incomingCounts[cat]
    const limit = STORAGE_LIMITS[cat]
    if (total > limit) {
      const remaining = Math.max(0, limit - existing[cat])
      return `No se puede subir: la carpeta ya tiene ${existing[cat]}/${limit} ${CATEGORY_LABEL[cat]}. Solo se pueden añadir ${remaining} más.`
    }
  }
  return null
}

/**
 * Upload-time limit validation for a folder-upload flow — each folder
 * (root or subfolder) can only bring ≤ UPLOAD_LIMITS per category.
 */
export function validateUploadBatchPerFolder(
  filesInFolder: { name: string }[],
): string | null {
  const counts = countByCategory(filesInFolder)
  for (const cat of ['document', 'image', 'video'] as const) {
    if (counts[cat] > UPLOAD_LIMITS[cat]) {
      return `Máximo por carpeta: ${UPLOAD_LIMITS.document} documentos, ${UPLOAD_LIMITS.image} imágenes, ${UPLOAD_LIMITS.video} videos (encontrados ${counts[cat]} ${CATEGORY_LABEL[cat]})`
    }
  }
  return null
}

/**
 * Validate total size of an upload batch.
 */
export function validateTotalSize(files: { size: number }[]): string | null {
  const total = files.reduce((acc, f) => acc + f.size, 0)
  if (total > MAX_UPLOAD_TOTAL_BYTES) {
    return `La subida supera el límite de 1 GB`
  }
  return null
}

/**
 * Validate folder depth from a relative path (segments separated by "/").
 */
export function validateDepth(relativePath: string): string | null {
  const segments = relativePath.split('/').filter(Boolean)
  if (segments.length > MAX_FOLDER_DEPTH) {
    return `Profundidad máxima de carpetas: ${MAX_FOLDER_DEPTH} niveles`
  }
  return null
}
