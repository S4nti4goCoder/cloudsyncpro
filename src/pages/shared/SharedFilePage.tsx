import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  Download,
  Lock,
  FileIcon,
  ImageIcon,
  FileTextIcon,
  FileVideoIcon,
  FileAudioIcon,
  Cloud,
  AlertCircle,
  Loader2,
  Eye,
} from 'lucide-react'
import { shareService } from '@/services/shareService'
import { formatFileSize, getFileColor } from '@/utils/fileUtils'
import { useAuthStore } from '@/store/authStore'
import { cn } from '@/lib/utils'

interface SharedFileData {
  share_id: string
  resource_id: string
  resource_type: string
  share_type: string
  permissions: string[]
  expires_at: string | null
  has_password: boolean
  file_name: string
  file_size: number
  file_mime_type: string
  file_extension: string
  file_r2_key: string
}

export default function SharedFilePage() {
  const { token } = useParams<{ token: string }>()
  const navigate = useNavigate()
  const isAuthenticated = useAuthStore((s) => s.user !== null)
  const isInitialized = useAuthStore((s) => s.isInitialized)

  const [sharedFile, setSharedFile] = useState<SharedFileData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [needsPassword, setNeedsPassword] = useState(false)
  const [password, setPassword] = useState('')
  const [passwordError, setPasswordError] = useState(false)
  const [isVerifying, setIsVerifying] = useState(false)
  const [isUnlocked, setIsUnlocked] = useState(false)

  useEffect(() => {
    if (!token) return

    async function loadShare() {
      try {
        const data = await shareService.getSharedFile(token!)
        if (!data) {
          setError('Este enlace no existe o ha expirado.')
          return
        }

        // Check if requires auth
        if (data.share_type === 'user' && isInitialized && !isAuthenticated) {
          navigate(`/login?redirect=/shared/${token}`)
          return
        }

        setSharedFile(data as SharedFileData)

        if (data.has_password) {
          setNeedsPassword(true)
        } else {
          setIsUnlocked(true)
        }
      } catch {
        setError('No se pudo cargar el archivo compartido.')
      } finally {
        setIsLoading(false)
      }
    }

    if (isInitialized) {
      void loadShare()
    }
  }, [token, isInitialized, isAuthenticated, navigate])

  async function handlePasswordSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!token || !password) return

    setIsVerifying(true)
    setPasswordError(false)

    try {
      const isValid = await shareService.verifyPassword(token, password)
      if (isValid) {
        setIsUnlocked(true)
        setNeedsPassword(false)
      } else {
        setPasswordError(true)
      }
    } catch {
      setPasswordError(true)
    } finally {
      setIsVerifying(false)
    }
  }

  const publicUrl = sharedFile
    ? `${import.meta.env.VITE_R2_PUBLIC_URL}/${sharedFile.file_r2_key}`
    : ''

  const canDownload = sharedFile?.permissions.includes('share') ?? false

  if (isLoading || !isInitialized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background px-6">
        <div className="text-center space-y-4 max-w-sm">
          <div className="flex justify-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-destructive/10">
              <AlertCircle className="h-8 w-8 text-destructive" />
            </div>
          </div>
          <h2 className="text-xl font-bold text-foreground">Enlace no válido</h2>
          <p className="text-sm text-muted-foreground">{error}</p>
          <button
            onClick={() => navigate('/')}
            className="rounded-lg bg-primary px-4 h-10 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
          >
            Ir al inicio
          </button>
        </div>
      </div>
    )
  }

  if (needsPassword && !isUnlocked) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background px-6">
        <div className="w-full max-w-sm space-y-6">
          <div className="text-center space-y-3">
            <div className="flex justify-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10">
                <Lock className="h-8 w-8 text-primary" />
              </div>
            </div>
            <h2 className="text-xl font-bold text-foreground">Archivo protegido</h2>
            <p className="text-sm text-muted-foreground">
              Ingresa la contraseña para acceder al archivo.
            </p>
          </div>

          <form onSubmit={handlePasswordSubmit} className="space-y-3">
            <input
              type="password"
              placeholder="Contraseña"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoFocus
              className={cn(
                'flex h-10 w-full rounded-lg border bg-background px-3 py-2',
                'text-sm placeholder:text-muted-foreground',
                'focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent',
                passwordError ? 'border-destructive' : 'border-input'
              )}
            />
            {passwordError && (
              <p className="text-xs text-destructive">Contraseña incorrecta</p>
            )}
            <button
              type="submit"
              disabled={isVerifying || !password}
              className={cn(
                'flex w-full items-center justify-center gap-2 h-10 rounded-lg',
                'bg-primary text-primary-foreground text-sm font-medium',
                'hover:bg-primary/90 transition-colors',
                'disabled:cursor-not-allowed disabled:opacity-50'
              )}
            >
              {isVerifying && <Loader2 className="h-4 w-4 animate-spin" />}
              Acceder
            </button>
          </form>
        </div>
      </div>
    )
  }

  if (!sharedFile || !isUnlocked) return null

  const colorClass = getFileColor(sharedFile.file_mime_type)
  const FileTypeIcon = getFileTypeIconComponent(sharedFile.file_mime_type)

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-background/95 backdrop-blur sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
              <Cloud className="h-4 w-4 text-white" />
            </div>
            <span className="text-base font-semibold text-foreground">CloudSyncPro</span>
          </div>
          {!isAuthenticated && (
            <button
              onClick={() => navigate('/login')}
              className="rounded-lg border border-border px-4 h-9 text-sm font-medium hover:bg-muted transition-colors"
            >
              Iniciar sesión
            </button>
          )}
        </div>
      </header>

      {/* Content */}
      <main className="max-w-4xl mx-auto px-6 py-12">
        <div className="flex flex-col items-center gap-8">
          {/* File info */}
          <div className="flex flex-col items-center gap-4 text-center">
            <div className={cn(
              'flex h-20 w-20 items-center justify-center rounded-2xl',
              colorClass
            )}>
              <FileTypeIcon className="h-10 w-10" />
            </div>
            <div className="space-y-1">
              <h1 className="text-2xl font-bold text-foreground">
                {sharedFile.file_name}
              </h1>
              <p className="text-sm text-muted-foreground">
                {formatFileSize(sharedFile.file_size)} · {sharedFile.file_extension.toUpperCase()}
              </p>
            </div>

            <div className="flex items-center gap-3">
              {canDownload && (
                
                 <a href={publicUrl}
                  download={sharedFile.file_name}
                  className={cn(
                    'flex items-center gap-2 rounded-lg bg-primary px-5 h-10',
                    'text-sm font-medium text-primary-foreground',
                    'hover:bg-primary/90 transition-colors'
                  )}
                >
                  <Download className="h-4 w-4" />
                  Descargar
                </a>
              )}
              
               <a href={publicUrl}
                target="_blank"
                rel="noopener noreferrer"
                className={cn(
                  'flex items-center gap-2 rounded-lg border border-border px-5 h-10',
                  'text-sm font-medium text-foreground',
                  'hover:bg-muted transition-colors'
                )}
              >
                <Eye className="h-4 w-4" />
                Ver archivo
              </a>
            </div>
          </div>

          {/* Preview */}
          <div className="w-full rounded-2xl border border-border overflow-hidden bg-muted/30">
            {sharedFile.file_mime_type.startsWith('image/') && (
              <img
                src={publicUrl}
                alt={sharedFile.file_name}
                className="w-full max-h-150 object-contain"
              />
            )}

            {sharedFile.file_mime_type === 'application/pdf' && (
              <iframe
                src={publicUrl}
                className="w-full"
                style={{ height: '600px' }}
                title={sharedFile.file_name}
              />
            )}

            {sharedFile.file_mime_type.startsWith('video/') && (
              <video
                src={publicUrl}
                controls
                className="w-full max-h-150"
              >
                Tu navegador no soporta la reproducción de video.
              </video>
            )}

            {sharedFile.file_mime_type.startsWith('audio/') && (
              <div className="flex items-center justify-center p-8">
                <audio src={publicUrl} controls className="w-full max-w-md">
                  Tu navegador no soporta la reproducción de audio.
                </audio>
              </div>
            )}

            {!sharedFile.file_mime_type.startsWith('image/') &&
             sharedFile.file_mime_type !== 'application/pdf' &&
             !sharedFile.file_mime_type.startsWith('video/') &&
             !sharedFile.file_mime_type.startsWith('audio/') && (
              <div className="flex flex-col items-center justify-center py-16 text-center px-6">
                <FileIcon className="h-12 w-12 text-muted-foreground/30 mb-3" />
                <p className="text-sm text-muted-foreground">
                  No hay previsualización disponible para este tipo de archivo.
                </p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}

function getFileTypeIconComponent(mimeType: string) {
  if (mimeType.startsWith('image/')) return ImageIcon
  if (mimeType.startsWith('video/')) return FileVideoIcon
  if (mimeType.startsWith('audio/')) return FileAudioIcon
  if (mimeType === 'application/pdf') return FileTextIcon
  return FileIcon
}