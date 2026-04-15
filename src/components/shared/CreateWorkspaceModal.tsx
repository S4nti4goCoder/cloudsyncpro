import { useState } from 'react'
import { Loader2, FolderPlus } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { useCreateWorkspace } from '@/hooks/useWorkspaces'
import { workspaceService } from '@/services/workspaceService'
import { cn } from '@/lib/utils'

interface CreateWorkspaceModalProps {
  open: boolean
  onClose: () => void
}

export function CreateWorkspaceModal({ open, onClose }: CreateWorkspaceModalProps) {
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const { mutate: createWorkspace, isPending } = useCreateWorkspace()

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim()) return

    createWorkspace(
      {
        name: name.trim(),
        description: description.trim() || undefined,
        slug: workspaceService.generateSlug(name),
      },
      {
        onSuccess: () => {
          setName('')
          setDescription('')
          onClose()
        },
      }
    )
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-3 mb-1">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10">
              <FolderPlus className="h-5 w-5 text-primary" />
            </div>
            <DialogTitle className="text-lg">Nuevo espacio de trabajo</DialogTitle>
          </div>
          <DialogDescription>
            Crea un espacio de trabajo para tu equipo o proyecto.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          <div className="space-y-1.5">
            <label htmlFor="ws-name" className="text-sm font-medium text-foreground">
              Nombre <span className="text-destructive">*</span>
            </label>
            <input
              id="ws-name"
              type="text"
              placeholder="Ej: Marketing, Desarrollo, Diseño..."
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={isPending}
              autoFocus
              maxLength={80}
              className={cn(
                'flex h-10 w-full rounded-lg border border-input bg-background px-3 py-2',
                'text-sm placeholder:text-muted-foreground',
                'focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent',
                'disabled:cursor-not-allowed disabled:opacity-50 transition-colors'
              )}
            />
          </div>

          <div className="space-y-1.5">
            <label htmlFor="ws-description" className="text-sm font-medium text-foreground">
              Descripción <span className="text-muted-foreground text-xs font-normal">(opcional)</span>
            </label>
            <textarea
              id="ws-description"
              placeholder="¿Para qué es este espacio de trabajo?"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              disabled={isPending}
              maxLength={200}
              rows={3}
              className={cn(
                'flex w-full rounded-lg border border-input bg-background px-3 py-2',
                'text-sm placeholder:text-muted-foreground resize-none',
                'focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent',
                'disabled:cursor-not-allowed disabled:opacity-50 transition-colors'
              )}
            />
          </div>

          <div className="flex gap-3 pt-2">
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
              type="submit"
              disabled={isPending || !name.trim()}
              className={cn(
                'flex-1 flex items-center justify-center gap-2 h-10 rounded-lg',
                'bg-primary text-primary-foreground text-sm font-medium',
                'hover:bg-primary/90 transition-colors',
                'disabled:cursor-not-allowed disabled:opacity-50'
              )}
            >
              {isPending && <Loader2 className="h-4 w-4 animate-spin" />}
              Crear espacio
            </button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}