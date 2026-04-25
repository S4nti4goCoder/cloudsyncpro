import { useState } from "react";
import {
  Moon,
  Sun,
  Monitor,
  LogOut,
  User,
  ChevronDown,
  Settings,
  Check,
  Menu,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { useTheme } from "@/hooks/useTheme";
import { authService } from "@/services/authService";
import { useAuthStore } from "@/store/authStore";
import { useUIStore } from "@/store/uiStore";
import { SearchBar } from "@/components/shared/SearchBar";
import { NotificationsDropdown } from "@/components/shared/NotificationsDropdown";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

type ThemeOption = "light" | "dark" | "system";

const THEME_OPTIONS: {
  value: ThemeOption;
  label: string;
  icon: React.ElementType;
}[] = [
  { value: "light", label: "Claro", icon: Sun },
  { value: "dark", label: "Oscuro", icon: Moon },
  { value: "system", label: "Sistema", icon: Monitor },
];

export function Header() {
  const navigate = useNavigate();
  const { theme, setTheme } = useTheme();
  const sidebarCollapsed = useUIStore((s) => s.sidebarCollapsed);
  const setMobileSidebarOpen = useUIStore((s) => s.setMobileSidebarOpen);
  const notificationsInApp = useUIStore((s) => s.notificationsInApp);
  const profile = useAuthStore((s) => s.profile);
  const user = useAuthStore((s) => s.user);
  const [confirmSignOut, setConfirmSignOut] = useState(false);
  const [signingOut, setSigningOut] = useState(false);

  const displayName = profile?.full_name ?? user?.email ?? "Usuario";
  const avatarUrl = profile?.avatar_url ?? "";
  const initials = displayName
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  async function handleSignOut() {
    setSigningOut(true);
    try {
      await authService.signOut();
      navigate("/login");
      toast.success("Sesión cerrada correctamente");
    } catch {
      toast.error("Error al cerrar sesión");
    } finally {
      setSigningOut(false);
      setConfirmSignOut(false);
    }
  }

  return (
    <header
      className={cn(
        "fixed right-0 top-0 z-20 flex h-16 items-center gap-1 sm:gap-2 md:gap-4 border-b border-border bg-background/95 backdrop-blur px-2 sm:px-3 md:px-6 transition-all duration-300",
        "left-0",
        sidebarCollapsed ? "lg:left-16" : "lg:left-64",
      )}
    >
      {/* Mobile menu button */}
      <button
        onClick={() => setMobileSidebarOpen(true)}
        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground transition-colors lg:hidden"
        aria-label="Abrir menú"
      >
        <Menu className="h-5 w-5" />
      </button>

      {/* Search */}
      <div className="flex flex-1 items-center min-w-0">
        <SearchBar />
      </div>

      {/* Actions */}
      <div className="flex items-center gap-0.5 sm:gap-2 shrink-0">
        {/* Theme selector */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              className="flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
              aria-label="Cambiar tema"
            >
              {theme === "dark" ? (
                <Moon className="h-4 w-4" />
              ) : theme === "light" ? (
                <Sun className="h-4 w-4" />
              ) : (
                <Monitor className="h-4 w-4" />
              )}
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-40">
            <DropdownMenuLabel className="text-xs font-medium text-muted-foreground">
              Tema
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            {THEME_OPTIONS.map(({ value, label, icon: Icon }) => (
              <DropdownMenuItem
                key={value}
                onClick={() => setTheme(value)}
                className="justify-between"
              >
                <span className="flex items-center gap-2">
                  <Icon className="h-3.5 w-3.5" />
                  {label}
                </span>
                {theme === value && <Check className="h-3.5 w-3.5" />}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Notifications */}
        {notificationsInApp && <NotificationsDropdown />}

        {/* User menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex items-center gap-1 sm:gap-2 rounded-lg px-1 sm:px-2 py-1.5 hover:bg-muted transition-colors">
              <Avatar className="h-7 w-7">
                <AvatarImage src={avatarUrl} alt={displayName} />
                <AvatarFallback className="bg-[#0f172a] text-white text-xs">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <div className="hidden md:flex flex-col items-start">
                <span className="text-xs font-medium text-foreground leading-none">
                  {displayName.split(" ")[0]}
                </span>
              </div>
              <ChevronDown className="hidden sm:block h-3 w-3 text-muted-foreground" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col gap-1">
                <p className="text-sm font-medium">{displayName}</p>
                <p className="text-xs text-muted-foreground">{user?.email}</p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => navigate("/settings/profile")}>
              <User className="mr-2 h-4 w-4" />
              Mi perfil
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => navigate("/settings")}>
              <Settings className="mr-2 h-4 w-4" />
              Configuración
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => setConfirmSignOut(true)}
              className="text-red-500 focus:text-red-500"
            >
              <LogOut className="mr-2 h-4 w-4" />
              Cerrar sesión
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <ConfirmDialog
        open={confirmSignOut}
        onClose={() => setConfirmSignOut(false)}
        onConfirm={handleSignOut}
        title="Cerrar sesión"
        description="¿Seguro que quieres cerrar sesión? Tendrás que volver a iniciar sesión para acceder."
        confirmLabel="Cerrar sesión"
        variant="destructive"
        isPending={signingOut}
        icon={<LogOut className="h-5 w-5 text-destructive" />}
      />
    </header>
  );
}
