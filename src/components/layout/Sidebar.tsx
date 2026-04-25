import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import {
  LayoutDashboard,
  FolderOpen,
  Users,
  UserCog,
  Settings,
  ChevronLeft,
  ChevronRight,
  Cloud,
  Archive,
  Trash2,
  Share2,
  Shield,
  ChevronsUpDown,
  Check,
  Plus,
  Activity,
  Star,
  X,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useUIStore } from '@/store/uiStore'
import { useAuthStore } from '@/store/authStore'
import { useWorkspaceStore, getActiveWorkspace } from '@/store/workspaceStore'
import { useWorkspaces } from '@/hooks/useWorkspaces'
import { CreateWorkspaceModal } from '@/components/shared/CreateWorkspaceModal'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'

interface NavItem {
  label: string
  icon: React.ElementType
  href: string
}

const navItems: NavItem[] = [
  { label: 'Dashboard', icon: LayoutDashboard, href: '/dashboard' },
  { label: 'Mis archivos', icon: FolderOpen, href: '/files' },
  { label: 'Favoritos', icon: Star, href: '/favorites' },
  { label: 'Compartidos', icon: Share2, href: '/shared' },
  { label: 'Espacios de trabajo', icon: Users, href: '/workspaces' },
  { label: 'Actividad', icon: Activity, href: '/activity' },
  { label: 'Archivados', icon: Archive, href: '/archived' },
  { label: 'Papelera', icon: Trash2, href: '/trash' },
  { label: 'Miembros', icon: UserCog, href: '/members' },
]

const adminItems: NavItem[] = [
  { label: 'Administración', icon: Shield, href: '/admin' },
]

const bottomItems: NavItem[] = [
  { label: 'Configuración', icon: Settings, href: '/settings' },
]

export function Sidebar() {
  const location = useLocation()
  const {
    sidebarCollapsed,
    toggleSidebar,
    mobileSidebarOpen,
    setMobileSidebarOpen,
  } = useUIStore()
  const isAdmin = useAuthStore(
    (s) => s.profile?.role === 'admin' || s.profile?.role === 'superadmin'
  )
  const { activeWorkspaceId, setActiveWorkspaceId } = useWorkspaceStore()
  const { data: workspaces } = useWorkspaces()
  const activeWorkspace = getActiveWorkspace(workspaces ?? [], activeWorkspaceId)
  const [workspaceOpen, setWorkspaceOpen] = useState(false)
  const [showCreateModal, setShowCreateModal] = useState(false)

  function isActive(href: string) {
    return location.pathname.startsWith(href)
  }

  function closeMobile() {
    setMobileSidebarOpen(false)
  }

  const allItems = [...navItems, ...(isAdmin ? adminItems : [])]

  return (
    <>
      {/* Mobile backdrop */}
      {mobileSidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/50 lg:hidden"
          onClick={closeMobile}
          aria-hidden="true"
        />
      )}

      <aside
        className={cn(
          'fixed left-0 top-0 z-40 flex h-full flex-col transition-transform duration-300 lg:z-30 lg:transition-all',
          'w-64 lg:w-auto',
          sidebarCollapsed ? 'lg:w-16' : 'lg:w-64',
          mobileSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        )}
        style={{ backgroundColor: '#0f172a' }}
      >
        {/* Mobile close button */}
        <button
          onClick={closeMobile}
          className="absolute right-3 top-3 z-10 flex h-8 w-8 items-center justify-center rounded-lg text-white/60 hover:bg-white/10 hover:text-white transition-colors lg:hidden"
          aria-label="Cerrar menú"
        >
          <X className="h-4 w-4" />
        </button>
        {/* Logo */}
        <div
          className={cn(
            'flex h-16 items-center border-b border-white/10',
            sidebarCollapsed ? 'justify-center px-4' : 'px-5'
          )}
        >
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-blue-500">
              <Cloud className="h-4 w-4 text-white" />
            </div>
            {!sidebarCollapsed && (
              <span className="text-base font-semibold text-white">
                CloudSyncPro
              </span>
            )}
          </div>
        </div>

        {/* Workspace selector */}
        {!sidebarCollapsed && (
          <div className="px-3 py-3 border-b border-white/10">
            <Popover open={workspaceOpen} onOpenChange={setWorkspaceOpen}>
              <PopoverTrigger asChild>
                <button
                  className={cn(
                    'flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2',
                    'text-left transition-colors hover:bg-white/10',
                    'focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-white/20'
                  )}
                >
                  <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-blue-500/20">
                    <Users className="h-3.5 w-3.5 text-blue-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-white truncate">
                      {activeWorkspace?.name ?? 'Seleccionar workspace'}
                    </p>
                    <p className="text-[10px] text-white/40">Espacio activo</p>
                  </div>
                  <ChevronsUpDown className="h-3.5 w-3.5 shrink-0 text-white/40" />
                </button>
              </PopoverTrigger>
              <PopoverContent
                className="w-[calc(100vw-2rem)] sm:w-64 p-1.5"
                align="start"
                side="bottom"
                sideOffset={8}
                collisionPadding={16}
              >
                <div className="px-2 py-1.5 mb-1">
                  <p className="text-xs font-medium text-muted-foreground">
                    Espacios de trabajo
                  </p>
                </div>

                <div className="space-y-0.5 max-h-48 overflow-y-auto">
                  {workspaces?.map((workspace) => (
                    <button
                      key={workspace.id}
                      onClick={() => {
                        setActiveWorkspaceId(workspace.id)
                        setWorkspaceOpen(false)
                      }}
                      className={cn(
                        'flex w-full items-center gap-2.5 rounded-md px-2 py-1.5',
                        'text-sm transition-colors hover:bg-muted',
                        activeWorkspace?.id === workspace.id && 'bg-muted'
                      )}
                    >
                      <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-primary/10">
                        <Users className="h-3.5 w-3.5 text-primary" />
                      </div>
                      <span className="flex-1 text-left truncate text-foreground">
                        {workspace.name}
                      </span>
                      {activeWorkspace?.id === workspace.id && (
                        <Check className="h-3.5 w-3.5 text-primary shrink-0" />
                      )}
                    </button>
                  ))}
                </div>

                <div className="border-t border-border mt-1.5 pt-1.5">
                  <button
                    onClick={() => {
                      setWorkspaceOpen(false)
                      setShowCreateModal(true)
                    }}
                    className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-sm text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    Nuevo espacio de trabajo
                  </button>
                </div>
              </PopoverContent>
            </Popover>
          </div>
        )}

        {/* Collapsed workspace indicator */}
        {sidebarCollapsed && (
          <div className="flex justify-center py-3 border-b border-white/10">
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="flex h-7 w-7 items-center justify-center rounded-md bg-blue-500/20 cursor-pointer">
                  <Users className="h-3.5 w-3.5 text-blue-400" />
                </div>
              </TooltipTrigger>
              <TooltipContent side="right">
                {activeWorkspace?.name ?? 'Sin workspace'}
              </TooltipContent>
            </Tooltip>
          </div>
        )}

        {/* Nav items */}
        <nav className="flex flex-1 flex-col gap-0.5 overflow-y-auto px-3 py-4">
          {allItems.map((item) => (
            <NavLink
              key={item.href}
              item={item}
              collapsed={sidebarCollapsed}
              active={isActive(item.href)}
              onNavigate={closeMobile}
            />
          ))}
        </nav>

        {/* Bottom items */}
        <div className="border-t border-white/10 px-3 py-3 space-y-0.5">
          {bottomItems.map((item) => (
            <NavLink
              key={item.href}
              item={item}
              collapsed={sidebarCollapsed}
              active={isActive(item.href)}
              onNavigate={closeMobile}
            />
          ))}
        </div>

        {/* Collapse button - desktop only */}
        <button
          onClick={toggleSidebar}
          className={cn(
            'absolute -right-3 top-20 z-40',
            'hidden lg:flex h-6 w-6 items-center justify-center',
            'rounded-full border border-border bg-background shadow-md',
            'text-muted-foreground hover:text-foreground transition-colors'
          )}
          aria-label={sidebarCollapsed ? 'Expandir sidebar' : 'Colapsar sidebar'}
        >
          {sidebarCollapsed ? (
            <ChevronRight className="h-3 w-3" />
          ) : (
            <ChevronLeft className="h-3 w-3" />
          )}
        </button>
      </aside>

      <CreateWorkspaceModal
        open={showCreateModal}
        onClose={() => setShowCreateModal(false)}
      />
    </>
  )
}

interface NavLinkProps {
  item: NavItem
  collapsed: boolean
  active: boolean
  onNavigate?: () => void
}

function NavLink({ item, collapsed, active, onNavigate }: NavLinkProps) {
  const Icon = item.icon

  const linkContent = (
    <Link
      to={item.href}
      onClick={onNavigate}
      className={cn(
        'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all duration-150',
        collapsed ? 'justify-center' : '',
        active
          ? 'bg-white/15 text-white'
          : 'text-white/60 hover:bg-white/10 hover:text-white'
      )}
      aria-label={collapsed ? item.label : undefined}
    >
      <Icon className="h-4 w-4 shrink-0" />
      {!collapsed && <span>{item.label}</span>}
    </Link>
  )

  if (collapsed) {
    return (
      <Tooltip>
        <TooltipTrigger asChild>{linkContent}</TooltipTrigger>
        <TooltipContent side="right">{item.label}</TooltipContent>
      </Tooltip>
    )
  }

  return linkContent
}