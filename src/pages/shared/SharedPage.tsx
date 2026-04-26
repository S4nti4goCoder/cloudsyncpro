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
  Inbox,
  ExternalLink,
  Download,
  Users,
} from 'lucide-react'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { toast } from 'sonner'
import { useMyShares, useSharedWithMe, useDeactivateShare } from '@/hooks/useShares'
import { shareService } from '@/services/shareService'
import { ConfirmDialog } from '@/components/shared/ConfirmDialog'
import { Pagination } from '@/components/shared/Pagination'
import { Skeleton } from '@/components/ui/skeleton'
import { usePageTitle } from '@/hooks/usePageTitle'

const PAGE_SIZE = 6
import { cn } from '@/lib/utils'
import { formatFileSize } from '@/utils/fileUtils'
import type { FileShare } from '@/types/authTypes'

type EnrichedShare = FileShare & { resource_name: string }
type InboundShare = FileShare & {
  resource_name: string
  sharer_name: string
  file_size?: number
  mime_type?: string
}

type Tab = 'mine' | 'with-me'

export default function SharedPage() {
  usePageTitle('Compartidos')
  const [tab, setTab] = useState<Tab>('mine')

  return (
    <div className="space-y-5 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-foreground tracking-tight">
          Compartidos
        </h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          Gestiona enlaces compartidos por ti y archivos compartidos contigo.
        </p>
      </div>

      <div className="flex items-center gap-1 rounded-lg border border-border p-0.5 w-fit">
        <button
          onClick={() => setTab('mine')}
          className={cn(
            'flex items-center gap-2 rounded-md px-3 h-8 text-xs font-medium transition-colors',
            tab === 'mine'
              ? 'bg-background shadow-sm text-foreground'
              : 'text-muted-foreground hover:text-foreground',
          )}
        >
          <Link2 className="h-3.5 w-3.5" />
          Por mí
        </button>
        <button
          onClick={() => setTab('with-me')}
          className={cn(
            'flex items-center gap-2 rounded-md px-3 h-8 text-xs font-medium transition-colors',
            tab === 'with-me'
              ? 'bg-background shadow-sm text-foreground'
              : 'text-muted-foreground hover:text-foreground',
          )}
        >
          <Inbox className="h-3.5 w-3.5" />
          Conmigo
        </button>
      </div>

      {tab === 'mine' ? <MineTab /> : <WithMeTab />}
    </div>
  )
}

function MineTab() {
  const { data: shares, isLoading } = useMyShares()
  const { mutate: deactivateShare, isPending } = useDeactivateShare()
  const [deactivatingShare, setDeactivatingShare] = useState<EnrichedShare | null>(null)
  const [page, setPage] = useState(1)

  const isEmpty = !isLoading && !shares?.length
  const total = shares?.length ?? 0
  const pageCount = Math.max(1, Math.ceil(total / PAGE_SIZE))
  const safePage = Math.min(page, pageCount)
  const visibleShares = ((shares ?? []) as EnrichedShare[]).slice(
    (safePage - 1) * PAGE_SIZE,
    safePage * PAGE_SIZE,
  )

  function handleCopyLink(token: string) {
    const url = shareService.buildShareUrl(token)
    navigator.clipboard.writeText(url)
    toast.success('Enlace copiado al portapapeles')
  }

  if (isLoading) {
    return (
      <div className="space-y-2">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-16 rounded-xl" />
        ))}
      </div>
    )
  }

  if (isEmpty) {
    return (
      <EmptyState
        icon={<Link2 className="h-8 w-8 text-muted-foreground" />}
        title="No hay enlaces compartidos"
        description="Cuando compartas archivos o carpetas, los enlaces activos aparecerán aquí."
      />
    )
  }

  return (
    <>
      <p className="text-xs text-muted-foreground">
        {shares!.length} {shares!.length === 1 ? 'enlace activo' : 'enlaces activos'}
      </p>
      <div className="space-y-2">
        {visibleShares.map((share) => (
          <ShareCard
            key={share.id}
            share={share}
            onCopy={() => handleCopyLink(share.token!)}
            onDeactivate={() => setDeactivatingShare(share)}
          />
        ))}
      </div>

      <Pagination
        page={safePage}
        pageCount={pageCount}
        onPageChange={(p) => {
          setPage(p)
          if (typeof window !== 'undefined') {
            window.scrollTo({ top: 0, behavior: 'smooth' })
          }
        }}
      />

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
    </>
  )
}

function WithMeTab() {
  const { data: shares, isLoading } = useSharedWithMe()
  const [page, setPage] = useState(1)

  const isEmpty = !isLoading && !shares?.length
  const total = shares?.length ?? 0
  const pageCount = Math.max(1, Math.ceil(total / PAGE_SIZE))
  const safePage = Math.min(page, pageCount)
  const visibleShares = (shares ?? []).slice(
    (safePage - 1) * PAGE_SIZE,
    safePage * PAGE_SIZE,
  )

  if (isLoading) {
    return (
      <div className="space-y-2">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-16 rounded-xl" />
        ))}
      </div>
    )
  }

  if (isEmpty) {
    return (
      <EmptyState
        icon={<Inbox className="h-8 w-8 text-muted-foreground" />}
        title="Nada compartido contigo todavía"
        description="Cuando otros miembros te compartan archivos o carpetas directamente, aparecerán aquí."
      />
    )
  }

  return (
    <>
      <p className="text-xs text-muted-foreground">
        {shares!.length} {shares!.length === 1 ? 'recurso compartido' : 'recursos compartidos'}
      </p>
      <div className="space-y-2">
        {visibleShares.map((share) => (
          <InboundShareCard key={share.id} share={share} />
        ))}
      </div>

      <Pagination
        page={safePage}
        pageCount={pageCount}
        onPageChange={(p) => {
          setPage(p)
          if (typeof window !== 'undefined') {
            window.scrollTo({ top: 0, behavior: 'smooth' })
          }
        }}
      />
    </>
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
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10">
        {share.resource_type === 'folder' ? (
          <Folder className="h-5 w-5 text-blue-400" />
        ) : (
          <FileIcon className="h-5 w-5 text-primary" />
        )}
      </div>

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

      <div className="flex items-center gap-1 shrink-0 lg:opacity-0 lg:group-hover:opacity-100 transition-opacity">
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

function InboundShareCard({ share }: { share: InboundShare }) {
  const isFolder = share.resource_type === 'folder'
  const permissions = (share.permissions as string[]) ?? []
  const isExpired = share.expires_at && new Date(share.expires_at) < new Date()
  const publicUrl = share.token
    ? shareService.buildShareUrl(share.token)
    : undefined

  return (
    <div
      className={cn(
        'group flex items-center gap-4 rounded-xl border border-border bg-card p-4 transition-colors hover:border-primary/20',
        isExpired && 'opacity-60'
      )}
    >
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10">
        {isFolder ? (
          <Folder className="h-5 w-5 text-blue-400" />
        ) : (
          <FileIcon className="h-5 w-5 text-primary" />
        )}
      </div>

      <div className="flex-1 min-w-0 space-y-1">
        <p className="text-sm font-medium text-foreground truncate">
          {share.resource_name}
        </p>
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-muted-foreground">
          <span className="flex items-center gap-1">
            <Users className="h-3 w-3" />
            De {share.sharer_name}
          </span>
          <span>
            {format(new Date(share.created_at), "d MMM yyyy, HH:mm", { locale: es })}
          </span>
          {share.file_size !== undefined && (
            <span>{formatFileSize(share.file_size)}</span>
          )}
          {permissions.length > 0 && (
            <span className="capitalize">{permissions.join(', ')}</span>
          )}
          {share.expires_at && (
            <span className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {isExpired
                ? 'Expirado'
                : `Expira ${format(new Date(share.expires_at), "d MMM yyyy", { locale: es })}`}
            </span>
          )}
        </div>
      </div>

      {publicUrl && !isExpired && (
        <div className="flex items-center gap-1 shrink-0 lg:opacity-0 lg:group-hover:opacity-100 transition-opacity">
          <a
            href={publicUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex h-8 w-8 items-center justify-center rounded-md hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
            title="Abrir recurso"
          >
            <ExternalLink className="h-4 w-4" />
          </a>
          {!isFolder && (
            <a
              href={publicUrl}
              className="flex h-8 w-8 items-center justify-center rounded-md hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
              title="Descargar"
            >
              <Download className="h-4 w-4" />
            </a>
          )}
        </div>
      )}
    </div>
  )
}

function EmptyState({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode
  title: string
  description: string
}) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center animate-fade-in">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-muted mb-4">
        {icon}
      </div>
      <h3 className="text-base font-semibold text-foreground mb-1">{title}</h3>
      <p className="text-sm text-muted-foreground max-w-xs">{description}</p>
    </div>
  )
}
