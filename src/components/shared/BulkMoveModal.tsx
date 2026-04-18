import { useState } from 'react'
import { Folder, Home, ChevronRight, Loader2 } from 'lucide-react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { useAllFolders } from '@/hooks/useFolders'
import { cn } from '@/lib/utils'
import type { Folder as FolderType } from '@/types/authTypes'

interface BulkMoveModalProps {
  open: boolean
  onClose: () => void
  workspaceId: string
  count: number
  excludeFolderIds?: string[]
  onMove: (targetFolderId: string | null) => void
  isPending?: boolean
}

interface FolderNode {
  folder: FolderType
  children: FolderNode[]
}

function buildTree(folders: FolderType[]): FolderNode[] {
  const map = new Map<string, FolderNode>()
  const roots: FolderNode[] = []

  for (const folder of folders) {
    map.set(folder.id, { folder, children: [] })
  }

  for (const folder of folders) {
    const node = map.get(folder.id)!
    if (folder.parent_id && map.has(folder.parent_id)) {
      map.get(folder.parent_id)!.children.push(node)
    } else {
      roots.push(node)
    }
  }

  return roots
}

export function BulkMoveModal({
  open,
  onClose,
  workspaceId,
  count,
  excludeFolderIds = [],
  onMove,
  isPending,
}: BulkMoveModalProps) {
  const [selected, setSelected] = useState<string | null | undefined>(undefined)
  const { data: folders, isLoading } = useAllFolders(workspaceId)

  const excluded = new Set(excludeFolderIds)
  const filtered = folders?.filter((f) => !excluded.has(f.id)) ?? []
  const tree = buildTree(filtered)

  function handleConfirm() {
    if (selected === undefined) return
    onMove(selected)
  }

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Mover {count} {count === 1 ? 'elemento' : 'elementos'}</DialogTitle>
          <DialogDescription>Elegí la carpeta destino</DialogDescription>
        </DialogHeader>

        <div className="max-h-64 overflow-y-auto rounded-lg border border-border">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <div className="p-1">
              <button
                type="button"
                onClick={() => setSelected(null)}
                className={cn(
                  'flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm transition-colors',
                  selected === null
                    ? 'bg-primary/10 text-primary font-medium'
                    : 'text-foreground hover:bg-muted',
                )}
              >
                <Home className="h-4 w-4 shrink-0" />
                Raíz
              </button>

              {tree.map((node) => (
                <FolderTreeItem
                  key={node.folder.id}
                  node={node}
                  selected={selected ?? null}
                  onSelect={setSelected}
                  depth={0}
                />
              ))}
            </div>
          )}
        </div>

        <div className="flex gap-3 pt-1">
          <button
            type="button"
            onClick={onClose}
            disabled={isPending}
            className={cn(
              'flex-1 h-9 rounded-lg border border-border text-sm font-medium',
              'text-muted-foreground hover:bg-muted transition-colors',
              'disabled:cursor-not-allowed disabled:opacity-50',
            )}
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            disabled={isPending || selected === undefined}
            className={cn(
              'flex-1 flex items-center justify-center gap-2 h-9 rounded-lg',
              'bg-primary text-primary-foreground text-sm font-medium',
              'hover:bg-primary/90 transition-colors',
              'disabled:cursor-not-allowed disabled:opacity-50',
            )}
          >
            {isPending && <Loader2 className="h-4 w-4 animate-spin" />}
            Mover aquí
          </button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

function FolderTreeItem({
  node,
  selected,
  onSelect,
  depth,
}: {
  node: FolderNode
  selected: string | null
  onSelect: (id: string) => void
  depth: number
}) {
  const [expanded, setExpanded] = useState(false)
  const hasChildren = node.children.length > 0

  return (
    <div>
      <button
        type="button"
        onClick={() => onSelect(node.folder.id)}
        className={cn(
          'flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm transition-colors',
          selected === node.folder.id
            ? 'bg-primary/10 text-primary font-medium'
            : 'text-foreground hover:bg-muted',
        )}
        style={{ paddingLeft: `${12 + depth * 16}px` }}
      >
        {hasChildren ? (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation()
              setExpanded(!expanded)
            }}
            className="shrink-0 -ml-1"
          >
            <ChevronRight
              className={cn(
                'h-3.5 w-3.5 text-muted-foreground transition-transform',
                expanded && 'rotate-90',
              )}
            />
          </button>
        ) : (
          <span className="w-3.5 shrink-0" />
        )}
        <Folder className="h-4 w-4 text-blue-400 shrink-0" />
        <span className="truncate">{node.folder.name}</span>
      </button>

      {expanded &&
        hasChildren &&
        node.children.map((child) => (
          <FolderTreeItem
            key={child.folder.id}
            node={child}
            selected={selected}
            onSelect={onSelect}
            depth={depth + 1}
          />
        ))}
    </div>
  )
}
