import { useState } from 'react'
import {
  Bell,
  Mail,
  AlertTriangle,
  Trash2,
  Loader2,
} from 'lucide-react'
import { useUIStore } from '@/store/uiStore'
import { useAuthStore } from '@/store/authStore'
import { useDeleteAccount } from '@/hooks/useProfile'
import { Switch } from '@/components/ui/switch'
import { cn } from '@/lib/utils'
import { usePageTitle } from '@/hooks/usePageTitle'

export default function SettingsPage() {
  usePageTitle('Configuración')
  return (
    <div className="max-w-2xl space-y-8 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-foreground tracking-tight">
          Configuración
        </h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          Gestiona las preferencias generales de tu cuenta.
        </p>
      </div>

      <NotificationsSection />
      <DangerZoneSection />
    </div>
  )
}

function NotificationsSection() {
  const notificationsInApp = useUIStore((s) => s.notificationsInApp)
  const notificationsEmail = useUIStore((s) => s.notificationsEmail)
  const setNotificationsInApp = useUIStore((s) => s.setNotificationsInApp)
  const setNotificationsEmail = useUIStore((s) => s.setNotificationsEmail)

  return (
    <section className="rounded-xl border border-border bg-card p-6">
      <h2 className="text-sm font-semibold text-foreground mb-5">
        Notificaciones
      </h2>

      <div className="space-y-5">
        <SettingRow
          icon={Bell}
          title="Notificaciones en la app"
          description="Recibí avisos dentro de la aplicación cuando haya actividad nueva."
        >
          <Switch
            size="lg"
            checked={notificationsInApp}
            onCheckedChange={setNotificationsInApp}
          />
        </SettingRow>

        <SettingRow
          icon={Mail}
          title="Notificaciones por email"
          description="Recibí un resumen por correo. Próximamente disponible."
          disabled
        >
          <Switch
            size="lg"
            checked={notificationsEmail}
            onCheckedChange={setNotificationsEmail}
            disabled
          />
        </SettingRow>
      </div>
    </section>
  )
}

interface SettingRowProps {
  icon: React.ElementType
  title: string
  description: string
  disabled?: boolean
  children: React.ReactNode
}

function SettingRow({
  icon: Icon,
  title,
  description,
  disabled,
  children,
}: SettingRowProps) {
  return (
    <div
      className={cn(
        'flex items-start gap-4',
        disabled && 'opacity-60'
      )}
    >
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-muted">
        <Icon className="h-4 w-4 text-muted-foreground" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-foreground">{title}</p>
        <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">
          {description}
        </p>
      </div>
      <div className="shrink-0 pt-0.5">{children}</div>
    </div>
  )
}

function DangerZoneSection() {
  const [showModal, setShowModal] = useState(false)

  return (
    <section className="rounded-xl border border-destructive/30 bg-destructive/5 p-6">
      <div className="flex items-center gap-2 mb-4">
        <AlertTriangle className="h-4 w-4 text-destructive" />
        <h2 className="text-sm font-semibold text-destructive">Zona de peligro</h2>
      </div>

      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-foreground">
            Eliminar mi cuenta
          </p>
          <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">
            Se borrarán de forma permanente tu perfil, workspaces, archivos y
            compartidos. Esta acción no se puede deshacer.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setShowModal(true)}
          className={cn(
            'flex items-center gap-1.5 rounded-md px-3 h-9 shrink-0',
            'text-xs font-medium text-destructive border border-destructive/30',
            'hover:bg-destructive/10 transition-colors'
          )}
        >
          <Trash2 className="h-3.5 w-3.5" />
          Eliminar cuenta
        </button>
      </div>

      {showModal && (
        <DeleteAccountModal onClose={() => setShowModal(false)} />
      )}
    </section>
  )
}

function DeleteAccountModal({ onClose }: { onClose: () => void }) {
  const user = useAuthStore((s) => s.user)
  const [confirmEmail, setConfirmEmail] = useState('')
  const { mutate: deleteAccount, isPending } = useDeleteAccount()

  const emailMatches =
    !!user?.email &&
    confirmEmail.trim().toLowerCase() === user.email.toLowerCase()

  function handleConfirm() {
    if (!emailMatches) return
    deleteAccount(confirmEmail.trim(), {
      onSuccess: () => {
        window.location.href = '/login'
      },
    })
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="w-full max-w-md rounded-xl bg-popover ring-1 ring-foreground/10 p-5 space-y-4">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-destructive/10">
            <AlertTriangle className="h-5 w-5 text-destructive" />
          </div>
          <h3 className="text-base font-semibold text-foreground">
            Eliminar cuenta
          </h3>
        </div>

        <p className="text-sm text-muted-foreground leading-relaxed">
          Para confirmar, escribí tu correo{' '}
          <span className="font-medium text-foreground">{user?.email}</span> en
          el campo de abajo. Esta acción es <strong>irreversible</strong>.
        </p>

        <input
          type="email"
          autoFocus
          value={confirmEmail}
          onChange={(e) => setConfirmEmail(e.target.value)}
          disabled={isPending}
          placeholder="tu@email.com"
          className={cn(
            'flex h-10 w-full rounded-lg border border-input bg-background px-3 py-2',
            'text-sm placeholder:text-muted-foreground',
            'focus:outline-none focus:ring-2 focus:ring-destructive focus:border-transparent',
            'disabled:cursor-not-allowed disabled:opacity-50 transition-colors'
          )}
        />

        <div className="flex gap-3 pt-1">
          <button
            type="button"
            onClick={onClose}
            disabled={isPending}
            className={cn(
              'flex-1 h-10 rounded-lg border border-border text-sm font-medium',
              'text-muted-foreground hover:bg-muted transition-colors',
              'disabled:cursor-not-allowed disabled:opacity-50'
            )}
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            disabled={!emailMatches || isPending}
            className={cn(
              'flex-1 flex items-center justify-center gap-2 h-10 rounded-lg',
              'bg-destructive text-white text-sm font-medium',
              'hover:bg-destructive/90 transition-colors',
              'disabled:cursor-not-allowed disabled:opacity-50'
            )}
          >
            {isPending && <Loader2 className="h-4 w-4 animate-spin" />}
            Eliminar cuenta
          </button>
        </div>
      </div>
    </div>
  )
}
