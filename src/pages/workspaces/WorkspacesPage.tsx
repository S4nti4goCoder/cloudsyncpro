import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Users,
  Plus,
  FolderOpen,
  MoreHorizontal,
  Pencil,
  Trash2,
  Crown,
} from 'lucide-react'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { useWorkspaces, useDeleteWorkspace } from '@/hooks/useWorkspaces'
import { useAuthStore } from '@/store/authStore'
import { useWorkspaceStore, getActiveWorkspace } from '@/store/workspaceStore'
import { CreateWorkspaceModal } from '@/components/shared/CreateWorkspaceModal'
import { ConfirmDialog } from '@/components/shared/ConfirmDialog'
import { cn } from '@/lib/utils'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import type { Workspace } from '@/types/authTypes'

export default function WorkspacesPage() {
  const navigate = useNavigate()
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [workspaceToDelete, setWorkspaceToDelete] = useState<Workspace | null>(null)
  const { data: workspaces, isLoading } = useWorkspaces()
  const { mutate: deleteWorkspace, isPending: deleting } = useDeleteWorkspace()
  const userId = useAuthStore((s) => s.user?.id)
  const { activeWorkspaceId, setActiveWorkspaceId } = useWorkspaceStore()
  const activeWorkspace = getActiveWorkspace(workspaces ?? [], activeWorkspaceId)

  function handleSelectWorkspace(workspace: Workspace) {
    setActiveWorkspaceId(workspace.id)
    navigate('/dashboard')
  }

  function confirmDelete() {
    if (!workspaceToDelete) return
    deleteWorkspace(workspaceToDelete.id, {
      onSuccess: () => setWorkspaceToDelete(null),
    })
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground tracking-tight">
            Espacios de trabajo
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Gestiona tus espacios de trabajo y colabora con tu equipo.
          </p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className={cn(
            'flex items-center justify-center gap-2 rounded-lg bg-primary px-4 h-10 self-start',
            'text-sm font-medium text-primary-foreground',
            'hover:bg-primary/90 transition-colors',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring'
          )}
        >
          <Plus className="h-4 w-4" />
          Nuevo espacio
        </button>
      </div>

      {/* Active workspace banner */}
      {activeWorkspace && (
        <div className="flex items-center gap-3 rounded-xl border border-primary/20 bg-primary/5 px-4 py-3">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10">
            <FolderOpen className="h-4 w-4 text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-foreground">Espacio activo</p>
            <p className="text-xs text-muted-foreground truncate">{activeWorkspace.name}</p>
          </div>
          <Badge variant="secondary" className="text-xs shrink-0">Activo</Badge>
        </div>
      )}

      {/* Workspaces grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-40 rounded-xl" />
          ))}
        </div>
      ) : !workspaces?.length ? (
        <EmptyState onCreate={() => setShowCreateModal(true)} />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {workspaces.map((workspace) => (
            <WorkspaceCard
              key={workspace.id}
              workspace={workspace}
              isActive={workspace.id === activeWorkspace?.id}
              isOwner={workspace.owner_id === userId}
              onSelect={() => handleSelectWorkspace(workspace)}
              onDelete={() => setWorkspaceToDelete(workspace)}
            />
          ))}
        </div>
      )}

      <CreateWorkspaceModal
        open={showCreateModal}
        onClose={() => setShowCreateModal(false)}
      />

      <ConfirmDialog
        open={!!workspaceToDelete}
        onClose={() => setWorkspaceToDelete(null)}
        onConfirm={confirmDelete}
        title="Eliminar espacio de trabajo"
        description={
          <>
            ¿Seguro que quieres eliminar{' '}
            <span className="font-medium text-foreground">
              {workspaceToDelete?.name}
            </span>
            ? Esta acción no se puede deshacer y se perderán todos los archivos
            y carpetas asociados.
          </>
        }
        confirmLabel="Eliminar espacio"
        variant="destructive"
        isPending={deleting}
        icon={<Trash2 className="h-5 w-5 text-destructive" />}
      />
    </div>
  )
}

interface WorkspaceCardProps {
  workspace: Workspace
  isActive: boolean
  isOwner: boolean
  onSelect: () => void
  onDelete: () => void
}

function WorkspaceCard({ workspace, isActive, isOwner, onSelect, onDelete }: WorkspaceCardProps) {
  return (
    <div
      className={cn(
        'group relative flex flex-col rounded-xl border bg-card p-5 transition-all duration-150',
        'hover:border-primary/30 hover:shadow-sm cursor-pointer',
        isActive ? 'border-primary/30 shadow-sm' : 'border-border'
      )}
      onClick={onSelect}
    >
      {/* Card header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
          <Users className="h-5 w-5 text-primary" />
        </div>

        <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
          {isActive && (
            <Badge variant="secondary" className="text-xs">Activo</Badge>
          )}
          {isOwner && (
            <Crown className="h-3.5 w-3.5 text-yellow-500" />
          )}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                className={cn(
                  'flex h-7 w-7 items-center justify-center rounded-md',
                  'text-muted-foreground hover:bg-muted hover:text-foreground',
                  'lg:opacity-0 lg:group-hover:opacity-100 transition-all'
                )}
                aria-label="Opciones"
              >
                <MoreHorizontal className="h-4 w-4" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-44">
              <DropdownMenuItem onClick={onSelect}>
                <FolderOpen className="mr-2 h-4 w-4" />
                Abrir
              </DropdownMenuItem>
              {isOwner && (
                <>
                  <DropdownMenuItem>
                    <Pencil className="mr-2 h-4 w-4" />
                    Editar
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={onDelete}
                    className="text-destructive focus:text-destructive"
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Eliminar
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Card content */}
      <div className="flex-1 space-y-1">
        <h3 className="font-semibold text-foreground leading-tight line-clamp-1">
          {workspace.name}
        </h3>
        {workspace.description && (
          <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
            {workspace.description}
          </p>
        )}
      </div>

      {/* Card footer */}
      <div className="mt-4 pt-4 border-t border-border flex items-center justify-between">
        <span className="text-xs text-muted-foreground">
          {format(new Date(workspace.created_at), "d MMM yyyy", { locale: es })}
        </span>
        <span className="text-xs text-primary font-medium opacity-0 group-hover:opacity-100 transition-opacity">
          Abrir →
        </span>
      </div>
    </div>
  )
}

function EmptyState({ onCreate }: { onCreate: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center animate-fade-in">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-muted mb-4">
        <Users className="h-8 w-8 text-muted-foreground" />
      </div>
      <h3 className="text-base font-semibold text-foreground mb-1">
        Sin espacios de trabajo
      </h3>
      <p className="text-sm text-muted-foreground max-w-xs mb-6">
        Crea tu primer espacio de trabajo para empezar a gestionar tus archivos.
      </p>
      <button
        onClick={onCreate}
        className={cn(
          'flex items-center gap-2 rounded-lg bg-primary px-4 h-10',
          'text-sm font-medium text-primary-foreground',
          'hover:bg-primary/90 transition-colors'
        )}
      >
        <Plus className="h-4 w-4" />
        Crear espacio de trabajo
      </button>
    </div>
  )
}