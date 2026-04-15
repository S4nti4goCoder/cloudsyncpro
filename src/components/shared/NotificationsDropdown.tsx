import { useState } from "react";
import {
  Bell,
  Check,
  CheckCheck,
  Info,
  AlertCircle,
  CheckCircle2,
  AlertTriangle,
  X,
} from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  useNotifications,
  useUnreadCount,
  useMarkAsRead,
  useMarkAllAsRead,
} from "@/hooks/useNotifications";
import { cn } from "@/lib/utils";
import type { Notification } from "@/types/authTypes";

export function NotificationsDropdown() {
  const [open, setOpen] = useState(false);
  const { data: notifications, isLoading } = useNotifications();
  const unreadCount = useUnreadCount();
  const { mutate: markAsRead } = useMarkAsRead();
  const { mutate: markAllAsRead } = useMarkAllAsRead();

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          className="relative flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
          aria-label="Notificaciones"
        >
          <Bell className="h-4 w-4" />
          {unreadCount > 0 && (
            <span className="absolute right-1.5 top-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[9px] font-bold text-primary-foreground">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
        </button>
      </PopoverTrigger>
      <PopoverContent
        align="end"
        className="w-80 p-0 overflow-hidden"
        sideOffset={8}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-border">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-semibold text-foreground">
              Notificaciones
            </h3>
            {unreadCount > 0 && (
              <span className="flex h-5 items-center justify-center rounded-full bg-primary/10 px-1.5 text-[10px] font-medium text-primary">
                {unreadCount} nuevas
              </span>
            )}
          </div>
          {unreadCount > 0 && (
            <button
              onClick={() => markAllAsRead()}
              className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              <CheckCheck className="h-3.5 w-3.5" />
              Marcar todas
            </button>
          )}
        </div>

        {/* Content */}
        <div className="max-h-80 overflow-y-auto">
          {isLoading && (
            <div className="flex items-center justify-center py-8">
              <div className="h-5 w-5 animate-spin rounded-full border-2 border-primary border-t-transparent" />
            </div>
          )}

          {!isLoading && (!notifications || notifications.length === 0) && (
            <div className="flex flex-col items-center justify-center py-10 text-center px-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-muted mb-3">
                <Bell className="h-6 w-6 text-muted-foreground/50" />
              </div>
              <p className="text-sm font-medium text-foreground">
                Sin notificaciones
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Te avisaremos cuando haya actividad
              </p>
            </div>
          )}

          {notifications && notifications.length > 0 && (
            <div className="divide-y divide-border">
              {notifications.map((notification) => (
                <NotificationItem
                  key={notification.id}
                  notification={notification}
                  onRead={() => markAsRead(notification.id)}
                />
              ))}
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}

interface NotificationItemProps {
  notification: Notification;
  onRead: () => void;
}

function NotificationItem({ notification, onRead }: NotificationItemProps) {
  const Icon = getNotificationIcon(notification.type);
  const iconClass = getNotificationIconClass(notification.type);

  return (
    <div
      className={cn(
        "flex items-start gap-3 px-4 py-3 transition-colors",
        !notification.is_read
          ? "bg-primary/5 hover:bg-primary/10"
          : "hover:bg-muted/50",
      )}
    >
      <div
        className={cn(
          "flex h-7 w-7 shrink-0 items-center justify-center rounded-lg mt-0.5",
          iconClass,
        )}
      >
        <Icon className="h-3.5 w-3.5" />
      </div>

      <div className="flex-1 min-w-0 space-y-0.5">
        <p
          className={cn(
            "text-sm leading-tight",
            !notification.is_read
              ? "font-medium text-foreground"
              : "text-foreground",
          )}
        >
          {notification.title}
        </p>
        <p className="text-xs text-muted-foreground leading-relaxed">
          {notification.message}
        </p>
        <p className="text-[10px] text-muted-foreground/60">
          {format(new Date(notification.created_at), "d MMM 'a las' HH:mm", {
            locale: es,
          })}
        </p>
      </div>

      {!notification.is_read && (
        <button
          onClick={onRead}
          className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground transition-colors mt-0.5"
          aria-label="Marcar como leída"
        >
          <Check className="h-3.5 w-3.5" />
        </button>
      )}

      {notification.is_read && (
        <X className="h-3.5 w-3.5 text-muted-foreground/30 shrink-0 mt-1" />
      )}
    </div>
  );
}

function getNotificationIcon(type: string) {
  switch (type) {
    case "success":
      return CheckCircle2;
    case "warning":
      return AlertTriangle;
    case "error":
      return AlertCircle;
    default:
      return Info;
  }
}

function getNotificationIconClass(type: string): string {
  switch (type) {
    case "success":
      return "bg-green-500/10 text-green-500";
    case "warning":
      return "bg-yellow-500/10 text-yellow-500";
    case "error":
      return "bg-red-500/10 text-red-500";
    default:
      return "bg-blue-500/10 text-blue-500";
  }
}
