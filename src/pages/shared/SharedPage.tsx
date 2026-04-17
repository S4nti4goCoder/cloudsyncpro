import { useState } from 'react'
import {
  Link2,
  Lock,
  Globe,
  Copy,
  Unlink,
  FileIcon,
  Folder,
  Clock,
  Shield,
} from 'lucide-react'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { toast } from 'sonner'
import { useMyShares, useDeactivateShare } from '@/hooks/useShares'
import { shareService } from '@/services/shareService'
import { ConfirmDialog } from '@/components/shared/ConfirmDialog'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'
import type { FileShare } from '@/types/authTypes'

type EnrichedShare = FileShare & { resource_name: string }

export default function SharedPage() {
  const { data: shares, isLoading } = useMyShares()
  const { mutate: deactivateShare, isPending } = useDeactivateShare()
  const [deactivatingShare, setDeactivatingShare] = useState<EnrichedShare | null>(null)

  const isEmpty = !isLoading && !shares?.length

  function handleCopyLink(token: string) {
    const url = shareService.buildShareUrl(token)
    navigator.clipboard.writeText(url)
    toast.success('Enlace copiado al portapapeles')
  }

  return (
    <div className="space-y-5 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-foreground tracking-tight">
          Compartidos
        </h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          Enlaces activos que compartiste con otros.
        </p>
      </div>

      {isLoading ? (
        <div className="space-y-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-16 rounded-xl" />
          ))}
        </div>
      ) : isEmpty ? (
        <div className="flex flex-col items-center justify-center py-20 text-center animate-fade-in">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-muted mb-4">
            <Link2 className="h-8 w-8 text-muted-foreground" />
          </div>
          <h3 className="text-base font-semibold text-foreground mb-1">
            No hay enlaces compartidos
          </h3>
          <p className="text-sm text-muted-foreground max-w-xs">
            Cuando compartas archivos o carpetas, los enlaces activos aparecerán aquí.
          </p>
        </div>
      ) : (
        <>
          <p className="text-xs text-muted-foreground">
            {shares!.length} {shares!.length === 1 ? 'enlace activo' : 'enlaces activos'}
          </p>
          <div className="space-y-2">
            {(shares as EnrichedShare[])!.map((share) => (
              <ShareCard
                key={share.id}
                share={share}
                onCopy={() => handleCopyLink(share.token)}
                onDeactivate={() => setDeactivatingShare(share)}
              />
            ))}
          </div>
        </>
      )}

      <ConfirmDialog
        open={deactivatingShare !== null}
        onClose={() => setDeactivatingShare(null)}
        onConfirm={() => {
          if (!deactivatingShare) return
          deactivateShare(deactivatingShare.id, {
            onSuccess: () => {
              setDeactivatingShare(null)
              toast.success('Enlace desactivado')
            },
          })
        }}
        title="Desactivar enlace"
        description={
          <>
            El enlace para <strong>{deactivatingShare?.resource_name}</strong> dejará de funcionar.
            Las personas con el link ya no podrán acceder al recurso.
          </>
        }
        confirmLabel="Desactivar"
        variant="destructive"
        isPending={isPending}
        icon={<Unlink className="h-5 w-5 text-destructive" />}
      />
    </div>
  )
}

function ShareCard({
  share,
  onCopy,
  onDeactivate,
}: {
  share: EnrichedShare
  onCopy: () => void
  onDeactivate: () => void
}) {
  const isPublic = share.share_type === 'public'
  const hasPassword = !!share.password
  const isExpired = share.expires_at && new Date(share.expires_at) < new Date()
  const permissions = (share.permissions as string[]) ?? []

  return (
    <div
      className={cn(
        'group flex items-center gap-4 rounded-xl border border-border bg-card p-4 transition-colors hover:border-primary/20',
        isExpired && 'opacity-60'
      )}
    >
      {/* Resource icon */}
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10">
        {share.resource_type === 'folder' ? (
          <Folder className="h-5 w-5 text-blue-400" />
        ) : (
          <FileIcon className="h-5 w-5 text-primary" />
        )}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0 space-y-1">
        <div className="flex items-center gap-2">
          <p className="text-sm font-medium text-foreground truncate">
            {share.resource_name}
          </p>
          <span
            className={cn(
              'inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium shrink-0',
              isPublic
                ? 'bg-emerald-500/10 text-emerald-500'
                : 'bg-amber-500/10 text-amber-500'
            )}
          >
            {isPublic ? (
              <Globe className="h-2.5 w-2.5" />
            ) : (
              <Lock className="h-2.5 w-2.5" />
            )}
            {isPublic ? 'Público' : 'Privado'}
          </span>
          {hasPassword && (
            <span className="inline-flex items-center gap-1 rounded-full bg-muted px-2 py-0.5 text-[10px] font-medium text-muted-foreground shrink-0">
              <Shield className="h-2.5 w-2.5" />
              Contraseña
            </span>
          )}
        </div>

        <div className="flex items-center gap-3 text-[11px] text-muted-foreground">
          <span>
            Creado {format(new Date(share.created_at), "d MMM yyyy, HH:mm", { locale: es })}
          </span>
          {share.expires_at && (
            <span className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {isExpired
                ? 'Expirado'
                : `Expira ${format(new Date(share.expires_at), "d MMM yyyy", { locale: es })}`}
            </span>
          )}
          {permissions.length > 0 && (
            <span className="capitalize">
              {permissions.join(', ')}
            </span>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-1 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          type="button"
          onClick={onCopy}
          className="flex h-8 w-8 items-center justify-center rounded-md hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
          title="Copiar enlace"
        >
          <Copy className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={onDeactivate}
          className="flex h-8 w-8 items-center justify-center rounded-md hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors"
          title="Desactivar enlace"
        >
          <Unlink className="h-4 w-4" />
        </button>
      </div>
    </div>
  )
}
