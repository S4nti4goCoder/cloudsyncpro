import { Link, useLocation } from 'react-router-dom'
import {
  LayoutDashboard,
  FolderOpen,
  Users,
  Settings,
  ChevronLeft,
  ChevronRight,
  Cloud,
  Archive,
  Trash2,
  Share2,
  Shield,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useUIStore } from '@/store/uiStore'
import { useAuthStore } from '@/store/authStore'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip'

interface NavItem {
  label: string
  icon: React.ElementType
  href: string
}

const navItems: NavItem[] = [
  { label: 'Dashboard', icon: LayoutDashboard, href: '/dashboard' },
  { label: 'Mis archivos', icon: FolderOpen, href: '/files' },
  { label: 'Compartidos', icon: Share2, href: '/shared' },
  { label: 'Espacios de trabajo', icon: Users, href: '/workspaces' },
  { label: 'Archivados', icon: Archive, href: '/archived' },
  { label: 'Papelera', icon: Trash2, href: '/trash' },
]

const adminItems: NavItem[] = [
  { label: 'Administración', icon: Shield, href: '/admin' },
]

const bottomItems: NavItem[] = [
  { label: 'Configuración', icon: Settings, href: '/settings' },
]

export function Sidebar() {
  const location = useLocation()
  const { sidebarCollapsed, toggleSidebar } = useUIStore()
  const isAdmin = useAuthStore(
    (s) => s.profile?.role === 'admin' || s.profile?.role === 'superadmin'
  )

  function isActive(href: string) {
    return location.pathname.startsWith(href)
  }

  const allItems = [...navItems, ...(isAdmin ? adminItems : [])]

  return (
    <aside
      className={cn(
        'fixed left-0 top-0 z-30 flex h-full flex-col transition-all duration-300',
        'hidden lg:flex',
        sidebarCollapsed ? 'w-16' : 'w-64'
      )}
      style={{ backgroundColor: '#0f172a' }}
    >
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

      {/* Nav items */}
      <nav className="flex flex-1 flex-col gap-0.5 overflow-y-auto px-3 py-4">
        {allItems.map((item) => (
          <NavLink
            key={item.href}
            item={item}
            collapsed={sidebarCollapsed}
            active={isActive(item.href)}
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
          />
        ))}
      </div>

      {/* Collapse button — floating on edge */}
      <button
        onClick={toggleSidebar}
        className={cn(
          'absolute -right-3 top-20 z-40',
          'flex h-6 w-6 items-center justify-center',
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
  )
}

interface NavLinkProps {
  item: NavItem
  collapsed: boolean
  active: boolean
}

function NavLink({ item, collapsed, active }: NavLinkProps) {
  const Icon = item.icon

  const linkContent = (
    <Link
      to={item.href}
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