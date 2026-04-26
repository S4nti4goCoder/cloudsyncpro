import { useRef, useState } from 'react'
import {
  User,
  Mail,
  Camera,
  Trash2,
  Loader2,
  KeyRound,
  Save,
} from 'lucide-react'
import { useAuthStore } from '@/store/authStore'
import {
  useUpdateProfile,
  useUploadAvatar,
  useRemoveAvatar,
  useUpdatePassword,
} from '@/hooks/useProfile'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { ConfirmDialog } from '@/components/shared/ConfirmDialog'
import { cn } from '@/lib/utils'
import { usePageTitle } from '@/hooks/usePageTitle'

const MIN_PASSWORD_LENGTH = 6

export default function ProfilePage() {
  usePageTitle('Mi perfil')
  const user = useAuthStore((s) => s.user)
  const profile = useAuthStore((s) => s.profile)

  if (!user || !profile) {
    return (
      <div className="flex h-full items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="max-w-2xl space-y-8 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-foreground tracking-tight">
          Mi perfil
        </h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          Gestiona tu información personal y la seguridad de tu cuenta.
        </p>
      </div>

      <AvatarSection />
      <ProfileInfoSection />
      <PasswordSection />
    </div>
  )
}

function AvatarSection() {
  const user = useAuthStore((s) => s.user)!
  const profile = useAuthStore((s) => s.profile)!
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [showRemoveConfirm, setShowRemoveConfirm] = useState(false)

  const { mutate: uploadAvatar, isPending: uploading } = useUploadAvatar()
  const { mutate: removeAvatar, isPending: removing } = useRemoveAvatar()

  const pending = uploading || removing
  const hasAvatar = !!profile.avatar_url

  const displayName = profile.full_name ?? user.email ?? 'Usuario'
  const initials = displayName
    .split(' ')
    .map((n) => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    uploadAvatar({ userId: user.id, file })
    e.target.value = ''
  }

  function handleConfirmRemove() {
    removeAvatar(user.id, { onSuccess: () => setShowRemoveConfirm(false) })
  }

  return (
    <section className="rounded-xl border border-border bg-card p-6">
      <div className="flex items-center gap-5">
        <div className="relative">
          <Avatar className="h-20 w-20">
            <AvatarImage src={profile.avatar_url ?? ''} alt={displayName} />
            <AvatarFallback className="bg-[#0f172a] text-white text-xl">
              {initials}
            </AvatarFallback>
          </Avatar>
          {pending && (
            <div className="absolute inset-0 flex items-center justify-center rounded-full bg-black/40">
              <Loader2 className="h-5 w-5 animate-spin text-white" />
            </div>
          )}
        </div>

        <div className="flex-1">
          <h2 className="text-sm font-semibold text-foreground">
            Foto de perfil
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            JPG, PNG, WebP o GIF. Máximo 2 MB.
          </p>

          <div className="flex gap-2 mt-3">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={pending}
              className={cn(
                'flex items-center gap-1.5 rounded-md px-3 h-8',
                'text-xs font-medium text-foreground border border-border',
                'hover:bg-muted transition-colors',
                'disabled:cursor-not-allowed disabled:opacity-50'
              )}
            >
              <Camera className="h-3.5 w-3.5" />
              {hasAvatar ? 'Cambiar' : 'Subir'}
            </button>
            {hasAvatar && (
              <button
                type="button"
                onClick={() => setShowRemoveConfirm(true)}
                disabled={pending}
                className={cn(
                  'flex items-center gap-1.5 rounded-md px-3 h-8',
                  'text-xs font-medium text-destructive border border-destructive/30',
                  'hover:bg-destructive/10 transition-colors',
                  'disabled:cursor-not-allowed disabled:opacity-50'
                )}
              >
                <Trash2 className="h-3.5 w-3.5" />
                Eliminar
              </button>
            )}
          </div>
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif"
          onChange={handleFileChange}
          className="hidden"
        />
      </div>

      <ConfirmDialog
        open={showRemoveConfirm}
        onClose={() => setShowRemoveConfirm(false)}
        onConfirm={handleConfirmRemove}
        title="Eliminar foto de perfil"
        description="¿Seguro que quieres eliminar tu foto de perfil? Se volverá a mostrar las iniciales."
        confirmLabel="Eliminar"
        variant="destructive"
        isPending={removing}
        icon={<Trash2 className="h-5 w-5 text-destructive" />}
      />
    </section>
  )
}

function ProfileInfoSection() {
  const user = useAuthStore((s) => s.user)!
  const profile = useAuthStore((s) => s.profile)!
  const [fullName, setFullName] = useState(profile.full_name ?? '')

  const { mutate: updateProfile, isPending } = useUpdateProfile()

  const trimmed = fullName.trim()
  const canSave =
    trimmed.length > 0 && trimmed !== (profile.full_name ?? '').trim()

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!canSave) return
    updateProfile({ userId: user.id, full_name: trimmed })
  }

  return (
    <section className="rounded-xl border border-border bg-card p-6">
      <h2 className="text-sm font-semibold text-foreground mb-4">
        Información personal
      </h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-1.5">
          <label
            htmlFor="full_name"
            className="text-xs font-medium text-foreground flex items-center gap-1.5"
          >
            <User className="h-3.5 w-3.5 text-muted-foreground" />
            Nombre completo
          </label>
          <input
            id="full_name"
            type="text"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            disabled={isPending}
            maxLength={80}
            placeholder="Tu nombre"
            className={cn(
              'flex h-10 w-full rounded-lg border border-input bg-background px-3 py-2',
              'text-sm placeholder:text-muted-foreground',
              'focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent',
              'disabled:cursor-not-allowed disabled:opacity-50 transition-colors'
            )}
          />
        </div>

        <div className="space-y-1.5">
          <label
            htmlFor="email"
            className="text-xs font-medium text-foreground flex items-center gap-1.5"
          >
            <Mail className="h-3.5 w-3.5 text-muted-foreground" />
            Correo electrónico
          </label>
          <input
            id="email"
            type="email"
            value={user.email ?? ''}
            readOnly
            className={cn(
              'flex h-10 w-full rounded-lg border border-input bg-muted/40 px-3 py-2',
              'text-sm text-muted-foreground cursor-not-allowed'
            )}
          />
          <p className="text-[11px] text-muted-foreground">
            No se puede modificar desde aquí.
          </p>
        </div>

        <div className="flex justify-end pt-2">
          <button
            type="submit"
            disabled={!canSave || isPending}
            className={cn(
              'flex items-center gap-2 rounded-lg bg-primary px-4 h-10',
              'text-sm font-medium text-primary-foreground',
              'hover:bg-primary/90 transition-colors',
              'disabled:cursor-not-allowed disabled:opacity-50'
            )}
          >
            {isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Save className="h-4 w-4" />
            )}
            Guardar cambios
          </button>
        </div>
      </form>
    </section>
  )
}

function PasswordSection() {
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState<string | null>(null)

  const { mutate: updatePassword, isPending } = useUpdatePassword()

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)

    if (newPassword.length < MIN_PASSWORD_LENGTH) {
      setError(`La contraseña debe tener al menos ${MIN_PASSWORD_LENGTH} caracteres.`)
      return
    }
    if (newPassword !== confirmPassword) {
      setError('Las contraseñas no coinciden.')
      return
    }

    updatePassword(newPassword, {
      onSuccess: () => {
        setNewPassword('')
        setConfirmPassword('')
      },
    })
  }

  return (
    <section className="rounded-xl border border-border bg-card p-6">
      <div className="flex items-center gap-2 mb-4">
        <KeyRound className="h-4 w-4 text-muted-foreground" />
        <h2 className="text-sm font-semibold text-foreground">
          Cambiar contraseña
        </h2>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-1.5">
          <label
            htmlFor="new_password"
            className="text-xs font-medium text-foreground"
          >
            Nueva contraseña
          </label>
          <input
            id="new_password"
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            disabled={isPending}
            placeholder="Mínimo 6 caracteres"
            autoComplete="new-password"
            className={cn(
              'flex h-10 w-full rounded-lg border border-input bg-background px-3 py-2',
              'text-sm placeholder:text-muted-foreground',
              'focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent',
              'disabled:cursor-not-allowed disabled:opacity-50 transition-colors'
            )}
          />
        </div>

        <div className="space-y-1.5">
          <label
            htmlFor="confirm_password"
            className="text-xs font-medium text-foreground"
          >
            Confirmar contraseña
          </label>
          <input
            id="confirm_password"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            disabled={isPending}
            placeholder="Repetí la contraseña"
            autoComplete="new-password"
            className={cn(
              'flex h-10 w-full rounded-lg border border-input bg-background px-3 py-2',
              'text-sm placeholder:text-muted-foreground',
              'focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent',
              'disabled:cursor-not-allowed disabled:opacity-50 transition-colors'
            )}
          />
        </div>

        {error && (
          <p className="text-xs text-destructive">{error}</p>
        )}

        <div className="flex justify-end pt-2">
          <button
            type="submit"
            disabled={!newPassword || !confirmPassword || isPending}
            className={cn(
              'flex items-center gap-2 rounded-lg bg-primary px-4 h-10',
              'text-sm font-medium text-primary-foreground',
              'hover:bg-primary/90 transition-colors',
              'disabled:cursor-not-allowed disabled:opacity-50'
            )}
          >
            {isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <KeyRound className="h-4 w-4" />
            )}
            Actualizar contraseña
          </button>
        </div>
      </form>
    </section>
  )
}
