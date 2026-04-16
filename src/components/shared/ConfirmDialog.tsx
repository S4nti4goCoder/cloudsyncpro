import { Loader2, AlertTriangle } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { cn } from '@/lib/utils'

interface ConfirmDialogProps {
  open: boolean
  onClose: () => void
  onConfirm: () => void
  title: string
  description?: React.ReactNode
  confirmLabel?: string
  cancelLabel?: string
  variant?: 'destructive' | 'default'
  isPending?: boolean
  icon?: React.ReactNode
}

export function ConfirmDialog({
  open,
  onClose,
  onConfirm,
  title,
  description,
  confirmLabel = 'Confirmar',
  cancelLabel = 'Cancelar',
  variant = 'default',
  isPending = false,
  icon,
}: ConfirmDialogProps) {
  const destructive = variant === 'destructive'

  return (
    <Dialog open={open} onOpenChange={(v) => !v && !isPending && onClose()}>
      <DialogContent className="sm:max-w-md" showCloseButton={false}>
        <DialogHeader>
          <div className="flex items-center gap-3 mb-1">
            <div
              className={cn(
                'flex h-9 w-9 shrink-0 items-center justify-center rounded-lg',
                destructive ? 'bg-destructive/10' : 'bg-primary/10'
              )}
            >
              {icon ?? (
                <AlertTriangle
                  className={cn(
                    'h-5 w-5',
                    destructive ? 'text-destructive' : 'text-primary'
                  )}
                />
              )}
            </div>
            <DialogTitle className="text-lg">{title}</DialogTitle>
          </div>
          {description && (
            <DialogDescription>{description}</DialogDescription>
          )}
        </DialogHeader>

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
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isPending}
            className={cn(
              'flex-1 flex items-center justify-center gap-2 h-10 rounded-lg',
              'text-sm font-medium transition-colors',
              'disabled:cursor-not-allowed disabled:opacity-50',
              destructive
                ? 'bg-destructive text-white hover:bg-destructive/90'
                : 'bg-primary text-primary-foreground hover:bg-primary/90'
            )}
          >
            {isPending && <Loader2 className="h-4 w-4 animate-spin" />}
            {confirmLabel}
          </button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
