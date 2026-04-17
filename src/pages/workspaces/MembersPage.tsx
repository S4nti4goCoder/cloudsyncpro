import { useState } from "react";
import {
  Users,
  UserPlus,
  Shield,
  ChevronDown,
  Trash2,
  Crown,
  Search,
  Loader2,
  Mail,
} from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { useAuthStore } from "@/store/authStore";
import { useWorkspaceStore, getActiveWorkspace } from "@/store/workspaceStore";
import { useWorkspaces } from "@/hooks/useWorkspaces";
import {
  useWorkspaceMembers,
  useInviteMember,
  useUpdateMemberRole,
  useRemoveMember,
} from "@/hooks/useMembers";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import type { UserRole } from "@/types/authTypes";
import type { WorkspaceMemberWithProfile } from "@/services/memberService";

const ROLES: UserRole[] = ["admin", "editor", "viewer"];

const ROLE_CONFIG: Record<string, { label: string; color: string; description: string }> = {
  admin: {
    label: "Admin",
    color: "bg-orange-500/10 text-orange-500",
    description: "Gestión completa del workspace",
  },
  editor: {
    label: "Editor",
    color: "bg-blue-500/10 text-blue-500",
    description: "Crear, editar y compartir archivos",
  },
  viewer: {
    label: "Viewer",
    color: "bg-muted text-muted-foreground",
    description: "Solo lectura",
  },
  superadmin: {
    label: "Superadmin",
    color: "bg-red-500/10 text-red-500",
    description: "Acceso total al sistema",
  },
};

export default function MembersPage() {
  const currentUserId = useAuthStore((s) => s.user?.id);
  const { activeWorkspaceId } = useWorkspaceStore();
  const { data: workspaces } = useWorkspaces();
  const activeWorkspace = getActiveWorkspace(
    workspaces ?? [],
    activeWorkspaceId,
  );
  const workspaceId = activeWorkspace?.id ?? "";
  const isOwner = activeWorkspace?.owner_id === currentUserId;

  const { data: members, isLoading } = useWorkspaceMembers(workspaceId);
  const { mutate: inviteMember, isPending: inviting } = useInviteMember(workspaceId);
  const { mutate: updateRole } = useUpdateMemberRole(workspaceId);
  const { mutate: removeMember } = useRemoveMember(workspaceId);

  const [search, setSearch] = useState("");
  const [showInvite, setShowInvite] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState<UserRole>("editor");
  const [removingMember, setRemovingMember] = useState<WorkspaceMemberWithProfile | null>(null);

  // Current user's role in this workspace
  const currentMember = members?.find((m) => m.user_id === currentUserId);
  const canManage = isOwner || currentMember?.role === "admin";

  const filteredMembers = (members ?? []).filter(
    (m) =>
      (m.user?.full_name ?? "").toLowerCase().includes(search.toLowerCase()) ||
      (m.user?.email ?? "").toLowerCase().includes(search.toLowerCase()),
  );

  function handleInvite() {
    if (!inviteEmail.trim()) return;
    inviteMember(
      { email: inviteEmail.trim(), role: inviteRole },
      {
        onSuccess: () => {
          setInviteEmail("");
          setShowInvite(false);
        },
      },
    );
  }

  return (
    <div className="space-y-5 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground tracking-tight">
            Miembros
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {activeWorkspace?.name ?? "Sin workspace"} ·{" "}
            {members?.length ?? 0}{" "}
            {(members?.length ?? 0) === 1 ? "miembro" : "miembros"}
          </p>
        </div>

        {canManage && (
          <button
            onClick={() => setShowInvite(true)}
            className="flex items-center gap-2 rounded-lg bg-primary px-3 h-9 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
          >
            <UserPlus className="h-4 w-4" />
            Invitar
          </button>
        )}
      </div>

      {/* Invite form */}
      {showInvite && (
        <div className="flex items-end gap-3 p-4 rounded-xl border border-primary/30 bg-primary/5 animate-fade-in">
          <div className="flex-1 space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground">
              Email del usuario
            </label>
            <div className="flex items-center gap-2 rounded-lg border border-input bg-background px-3 h-9">
              <Mail className="h-3.5 w-3.5 text-muted-foreground" />
              <input
                type="email"
                placeholder="usuario@ejemplo.com"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleInvite();
                  if (e.key === "Escape") setShowInvite(false);
                }}
                autoFocus
                className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground">
              Rol
            </label>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  className={cn(
                    "flex items-center gap-2 rounded-lg border border-input px-3 h-9 text-sm font-medium transition-colors hover:bg-muted",
                    ROLE_CONFIG[inviteRole].color,
                  )}
                >
                  <Shield className="h-3.5 w-3.5" />
                  {ROLE_CONFIG[inviteRole].label}
                  <ChevronDown className="h-3 w-3" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-52">
                {ROLES.map((role) => (
                  <DropdownMenuItem
                    key={role}
                    onClick={() => setInviteRole(role)}
                    className="flex flex-col items-start gap-0.5"
                  >
                    <span className={cn("text-xs font-medium", ROLE_CONFIG[role].color)}>
                      {ROLE_CONFIG[role].label}
                    </span>
                    <span className="text-[10px] text-muted-foreground">
                      {ROLE_CONFIG[role].description}
                    </span>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => {
                setShowInvite(false);
                setInviteEmail("");
              }}
              className="rounded-lg px-3 h-9 text-sm text-muted-foreground hover:bg-muted transition-colors"
            >
              Cancelar
            </button>
            <button
              onClick={handleInvite}
              disabled={!inviteEmail.trim() || inviting}
              className="flex items-center gap-2 rounded-lg bg-primary px-3 h-9 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50 transition-colors"
            >
              {inviting && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
              Agregar
            </button>
          </div>
        </div>
      )}

      {/* Search */}
      {(members?.length ?? 0) > 5 && (
        <div className="flex items-center gap-2 rounded-lg border border-input bg-muted/50 px-3 h-9 max-w-xs">
          <Search className="h-3.5 w-3.5 text-muted-foreground" />
          <input
            type="text"
            placeholder="Buscar miembro..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="bg-transparent text-sm text-foreground placeholder:text-muted-foreground focus:outline-none flex-1"
          />
        </div>
      )}

      {/* Permissions legend */}
      <div className="flex flex-wrap gap-3">
        {ROLES.map((role) => (
          <div
            key={role}
            className="flex items-center gap-2 rounded-lg border border-border px-3 py-2"
          >
            <div
              className={cn(
                "flex h-5 w-5 items-center justify-center rounded-md",
                ROLE_CONFIG[role].color,
              )}
            >
              <Shield className="h-3 w-3" />
            </div>
            <div>
              <p className="text-xs font-medium text-foreground">
                {ROLE_CONFIG[role].label}
              </p>
              <p className="text-[10px] text-muted-foreground">
                {ROLE_CONFIG[role].description}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Members list */}
      {isLoading ? (
        <div className="rounded-xl border border-border bg-card overflow-hidden">
          <div className="p-4 space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-14 w-full rounded-lg" />
            ))}
          </div>
        </div>
      ) : filteredMembers.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-muted mb-4">
            <Users className="h-7 w-7 text-muted-foreground" />
          </div>
          <h3 className="text-base font-semibold text-foreground mb-1">
            {search ? "Sin resultados" : "Sin miembros"}
          </h3>
          <p className="text-sm text-muted-foreground max-w-xs">
            {search
              ? "No se encontraron miembros con ese criterio."
              : "Invita usuarios para colaborar en este workspace."}
          </p>
        </div>
      ) : (
        <div className="rounded-xl border border-border bg-card divide-y divide-border overflow-hidden">
          {filteredMembers.map((member) => (
            <MemberRow
              key={member.id}
              member={member}
              isOwner={member.user_id === activeWorkspace?.owner_id}
              isCurrentUser={member.user_id === currentUserId}
              canManage={canManage}
              onChangeRole={(role) =>
                updateRole({ memberId: member.id, role })
              }
              onRemove={() => setRemovingMember(member)}
            />
          ))}
        </div>
      )}

      {/* Confirm remove */}
      <ConfirmDialog
        open={removingMember !== null}
        title="Eliminar miembro"
        description={`¿Estás seguro de que quieres eliminar a ${removingMember?.user?.full_name ?? removingMember?.user?.email ?? "este usuario"} del workspace?`}
        confirmLabel="Eliminar"
        onConfirm={() => {
          if (removingMember) {
            removeMember(removingMember.id);
            setRemovingMember(null);
          }
        }}
        onCancel={() => setRemovingMember(null)}
      />
    </div>
  );
}

function MemberRow({
  member,
  isOwner,
  isCurrentUser,
  canManage,
  onChangeRole,
  onRemove,
}: {
  member: WorkspaceMemberWithProfile;
  isOwner: boolean;
  isCurrentUser: boolean;
  canManage: boolean;
  onChangeRole: (role: UserRole) => void;
  onRemove: () => void;
}) {
  const userName = member.user?.full_name ?? member.user?.email ?? "Usuario";
  const initials = userName
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
  const roleConfig = ROLE_CONFIG[member.role] ?? ROLE_CONFIG.viewer;

  return (
    <div className="flex items-center gap-4 px-4 py-3.5 hover:bg-muted/30 transition-colors">
      {/* Avatar */}
      <Avatar className="h-9 w-9 shrink-0">
        <AvatarImage src={member.user?.avatar_url ?? ""} />
        <AvatarFallback className="bg-[#0f172a] text-white text-xs">
          {initials}
        </AvatarFallback>
      </Avatar>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p className="text-sm font-medium text-foreground truncate">
            {userName}
          </p>
          {isOwner && (
            <span className="flex items-center gap-1 text-[10px] font-medium text-amber-500">
              <Crown className="h-3 w-3" />
              Owner
            </span>
          )}
          {isCurrentUser && (
            <span className="text-[10px] text-primary font-medium">(tú)</span>
          )}
        </div>
        <p className="text-xs text-muted-foreground truncate">
          {member.user?.email} · Desde{" "}
          {format(new Date(member.joined_at), "d MMM yyyy", { locale: es })}
        </p>
      </div>

      {/* Role */}
      <div>
        {canManage && !isOwner && !isCurrentUser ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                className={cn(
                  "flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium transition-colors hover:opacity-80",
                  roleConfig.color,
                )}
              >
                <Shield className="h-3 w-3" />
                {roleConfig.label}
                <ChevronDown className="h-3 w-3" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-52">
              {ROLES.map((role) => (
                <DropdownMenuItem
                  key={role}
                  onClick={() => onChangeRole(role)}
                  className={cn(
                    "flex flex-col items-start gap-0.5",
                    member.role === role && "font-semibold",
                  )}
                >
                  <span
                    className={cn(
                      "text-xs font-medium",
                      ROLE_CONFIG[role].color,
                    )}
                  >
                    {ROLE_CONFIG[role].label}
                  </span>
                  <span className="text-[10px] text-muted-foreground">
                    {ROLE_CONFIG[role].description}
                  </span>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          <span
            className={cn(
              "flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium",
              roleConfig.color,
            )}
          >
            <Shield className="h-3 w-3" />
            {roleConfig.label}
          </span>
        )}
      </div>

      {/* Remove */}
      {canManage && !isOwner && !isCurrentUser && (
        <button
          onClick={onRemove}
          className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
        >
          <Trash2 className="h-3.5 w-3.5" />
        </button>
      )}
    </div>
  );
}
