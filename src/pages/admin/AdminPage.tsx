import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Users,
  HardDrive,
  FileIcon,
  Shield,
  Search,
  ChevronDown,
  AlertCircle,
} from 'lucide-react'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { useAuthStore } from '@/store/authStore'
import { useAdminUsers, useSystemStats, useUpdateUserRole } from '@/hooks/useAdmin'
import { formatFileSize } from '@/utils/fileUtils'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Skeleton } from '@/components/ui/skeleton'
import { Pagination } from '@/components/shared/Pagination'

const PAGE_SIZE = 6
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { cn } from '@/lib/utils'

const ROLES = ['superadmin', 'admin', 'editor', 'viewer'] as const
type Role = typeof ROLES[number]

const ROLE_COLORS: Record<Role, string> = {
  superadmin: 'bg-red-500/10 text-red-500',
  admin: 'bg-orange-500/10 text-orange-500',
  editor: 'bg-blue-500/10 text-blue-500',
  viewer: 'bg-muted text-muted-foreground',
}

export default function AdminPage() {
  const navigate = useNavigate()
  const profile = useAuthStore((s) => s.profile)
  const currentUserId = useAuthStore((s) => s.user?.id)
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)

  const { data: users, isLoading: usersLoading } = useAdminUsers()
  const { data: stats, isLoading: statsLoading } = useSystemStats()
  const { mutate: updateRole } = useUpdateUserRole()

  // Guard: only superadmin and admin can access
  if (profile?.role !== 'superadmin' && profile?.role !== 'admin') {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-destructive/10 mb-4">
          <AlertCircle className="h-8 w-8 text-destructive" />
        </div>
        <h2 className="text-lg font-semibold text-foreground mb-2">Acceso denegado</h2>
        <p className="text-sm text-muted-foreground mb-6">
          No tienes permisos para acceder al panel de administración.
        </p>
        <button
          onClick={() => navigate('/dashboard')}
          className="rounded-lg bg-primary px-4 h-9 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
        >
          Ir al dashboard
        </button>
      </div>
    )
  }

  const filteredUsers = (users ?? []).filter((u) =>
    (u.full_name ?? '').toLowerCase().includes(search.toLowerCase()) ||
    (u.email ?? '').toLowerCase().includes(search.toLowerCase())
  )
  const pageCount = Math.max(1, Math.ceil(filteredUsers.length / PAGE_SIZE))
  const safePage = Math.min(page, pageCount)
  const visibleUsers = filteredUsers.slice(
    (safePage - 1) * PAGE_SIZE,
    safePage * PAGE_SIZE,
  )

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground tracking-tight">
            Panel de administración
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Gestiona usuarios y supervisa el sistema
          </p>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-primary/10 self-start">
          <Shield className="h-4 w-4 text-primary" />
          <span className="text-xs font-medium text-primary capitalize">{profile?.role}</span>
        </div>
      </div>

      {/* System stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard
          title="Usuarios"
          value={stats?.total_users ?? 0}
          format="number"
          icon={Users}
          color="text-blue-500 bg-blue-500/10"
          isLoading={statsLoading}
        />
        <StatCard
          title="Archivos"
          value={stats?.total_files ?? 0}
          format="number"
          icon={FileIcon}
          color="text-purple-500 bg-purple-500/10"
          isLoading={statsLoading}
        />
        <StatCard
          title="Almacenamiento"
          value={stats?.total_storage ?? 0}
          format="size"
          icon={HardDrive}
          color="text-green-500 bg-green-500/10"
          isLoading={statsLoading}
        />
        <StatCard
          title="Workspaces"
          value={stats?.total_workspaces ?? 0}
          format="number"
          icon={Shield}
          color="text-orange-500 bg-orange-500/10"
          isLoading={statsLoading}
        />
      </div>

      {/* Users table */}
      <div className="space-y-3">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
            Usuarios ({filteredUsers.length})
          </p>
          <div className="flex items-center gap-2 rounded-lg border border-input bg-muted/50 px-3 h-8 w-full sm:w-auto">
            <Search className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
            <input
              type="text"
              placeholder="Buscar usuario..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="bg-transparent text-sm text-foreground placeholder:text-muted-foreground focus:outline-none flex-1 sm:w-40"
            />
          </div>
        </div>

        <div className="rounded-xl border border-border bg-card overflow-hidden">
          {/* Table header — desktop only */}
          <div className="hidden lg:grid grid-cols-12 gap-4 px-4 py-2.5 border-b border-border bg-muted/30">
            <p className="col-span-4 text-xs font-medium text-muted-foreground">Usuario</p>
            <p className="col-span-2 text-xs font-medium text-muted-foreground">Rol</p>
            <p className="col-span-2 text-xs font-medium text-muted-foreground">Archivos</p>
            <p className="col-span-2 text-xs font-medium text-muted-foreground">Almacenamiento</p>
            <p className="col-span-2 text-xs font-medium text-muted-foreground">Registrado</p>
          </div>

          {/* Table body */}
          {usersLoading ? (
            <div className="p-4 space-y-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-12 w-full rounded-lg" />
              ))}
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Users className="h-8 w-8 text-muted-foreground/30 mb-2" />
              <p className="text-sm text-muted-foreground">No se encontraron usuarios</p>
            </div>
          ) : (
            <div className="divide-y divide-border">
              {visibleUsers.map((user) => {
                const initials = (user.full_name ?? user.email ?? 'U')
                  .split(' ')
                  .map((n) => n[0])
                  .slice(0, 2)
                  .join('')
                  .toUpperCase()

                const isCurrentUser = user.id === currentUserId
                const roleColor = ROLE_COLORS[user.role as Role] ?? ROLE_COLORS.viewer

                return (
                  <div
                    key={user.id}
                    className="flex flex-col gap-3 px-4 py-3 hover:bg-muted/30 transition-colors lg:grid lg:grid-cols-12 lg:gap-4 lg:items-center"
                  >
                    {/* User + Role (mobile row 1) */}
                    <div className="flex items-center gap-3 min-w-0 lg:col-span-4">
                      <Avatar className="h-8 w-8 shrink-0">
                        <AvatarImage src={user.avatar_url ?? ''} />
                        <AvatarFallback className="bg-[#0f172a] text-white text-xs">
                          {initials}
                        </AvatarFallback>
                      </Avatar>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium text-foreground truncate">
                          {user.full_name ?? 'Sin nombre'}
                          {isCurrentUser && (
                            <span className="ml-1.5 text-[10px] text-primary">(tú)</span>
                          )}
                        </p>
                        <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                      </div>
                    </div>

                    {/* Role */}
                    <div className="lg:col-span-2">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <button
                            disabled={isCurrentUser}
                            className={cn(
                              'flex items-center gap-1.5 rounded-lg px-2 py-1 text-xs font-medium transition-colors',
                              roleColor,
                              !isCurrentUser && 'hover:opacity-80 cursor-pointer',
                              isCurrentUser && 'cursor-default'
                            )}
                          >
                            <span className="capitalize">{user.role}</span>
                            {!isCurrentUser && <ChevronDown className="h-3 w-3" />}
                          </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="start" className="w-36">
                          {ROLES.map((role) => (
                            <DropdownMenuItem
                              key={role}
                              onClick={() => updateRole({ userId: user.id, role })}
                              className={cn(
                                'capitalize text-xs',
                                user.role === role && 'font-semibold'
                              )}
                            >
                              <span className={cn(
                                'flex h-5 w-5 items-center justify-center rounded-md mr-2',
                                ROLE_COLORS[role]
                              )}>
                                <Shield className="h-3 w-3" />
                              </span>
                              {role}
                            </DropdownMenuItem>
                          ))}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>

                    {/* Files */}
                    <div className="flex items-center justify-between gap-2 lg:col-span-2 lg:block">
                      <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider lg:hidden">
                        Archivos
                      </span>
                      <p className="text-sm text-foreground">{user.files_count}</p>
                    </div>

                    {/* Storage */}
                    <div className="flex items-center justify-between gap-2 lg:col-span-2 lg:block">
                      <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider lg:hidden">
                        Almacenamiento
                      </span>
                      <p className="text-sm text-foreground">{formatFileSize(user.storage_used)}</p>
                    </div>

                    {/* Date */}
                    <div className="flex items-center justify-between gap-2 lg:col-span-2 lg:block">
                      <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider lg:hidden">
                        Registrado
                      </span>
                      <p className="text-xs text-muted-foreground">
                        {format(new Date(user.created_at), 'd MMM yyyy', { locale: es })}
                      </p>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
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
      </div>
    </div>
  )
}

// ============================================
// StatCard
// ============================================

interface StatCardProps {
  title: string
  value: number
  format: 'number' | 'size'
  icon: React.ElementType
  color: string
  isLoading: boolean
}

function StatCard({ title, value, format: fmt, icon: Icon, color, isLoading }: StatCardProps) {
  return (
    <div className="rounded-xl border border-border bg-card p-4 space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-xs font-medium text-muted-foreground">{title}</p>
        <div className={cn('flex h-7 w-7 items-center justify-center rounded-lg', color)}>
          <Icon className="h-3.5 w-3.5" />
        </div>
      </div>
      {isLoading ? (
        <Skeleton className="h-7 w-20 rounded-md" />
      ) : (
        <p className="text-2xl font-bold text-foreground">
          {fmt === 'size' ? formatFileSize(value) : value.toLocaleString()}
        </p>
      )}
    </div>
  )
}