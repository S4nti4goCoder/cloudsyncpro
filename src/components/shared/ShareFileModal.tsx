import { useState } from "react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import {
  Link,
  Lock,
  Globe,
  Users,
  Copy,
  Check,
  Trash2,
  Plus,
  Loader2,
  Calendar,
  Eye,
  Download,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  useShares,
  useCreateShare,
  useDeactivateShare,
} from "@/hooks/useShares";
import { shareService } from "@/services/shareService";
import { cn } from "@/lib/utils";
import type { FileRecord } from "@/types/authTypes";

interface ShareFileModalProps {
  file: FileRecord | null;
  open: boolean;
  onClose: () => void;
}

export function ShareFileModal({ file, open, onClose }: ShareFileModalProps) {
  const [shareType, setShareType] = useState<"public" | "user">("public");
  const [hasExpiry, setHasExpiry] = useState(false);
  const [expiryDate, setExpiryDate] = useState("");
  const [hasPassword, setHasPassword] = useState(false);
  const [password, setPassword] = useState("");
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [allowDownload, setAllowDownload] = useState(true);

  const { data: shares, isLoading: sharesLoading } = useShares(file?.id ?? "");
  const { mutate: createShare, isPending: creating } = useCreateShare(
    file?.id ?? "",
  );
  const { mutate: deactivateShare } = useDeactivateShare();

  function handleCreate() {
    createShare(
      {
        shareType,
        permissions: allowDownload ? ["view", "share"] : ["view"],
        expiresAt:
          hasExpiry && expiryDate ? new Date(expiryDate).toISOString() : null,
        password: hasPassword && password ? password : null,
      },
      {
        onSuccess: () => {
          setHasExpiry(false);
          setExpiryDate("");
          setHasPassword(false);
          setPassword("");
        },
      },
    );
  }

  async function handleCopy(token: string, id: string) {
    const url = shareService.buildShareUrl(token);
    await navigator.clipboard.writeText(url);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <div className="flex items-center gap-3 mb-1">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10">
              <Link className="h-5 w-5 text-primary" />
            </div>
            <div className="min-w-0">
              <DialogTitle className="text-base">Compartir archivo</DialogTitle>
              <p className="text-xs text-muted-foreground truncate mt-0.5">
                {file?.name}
              </p>
            </div>
          </div>
          <DialogDescription>
            Crea un enlace para compartir este archivo.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-5 mt-2">
          {/* Share type */}
          <div className="space-y-2">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Tipo de acceso
            </p>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => setShareType("public")}
                className={cn(
                  "flex items-center gap-2.5 rounded-xl border p-3 text-left transition-all",
                  shareType === "public"
                    ? "border-primary/50 bg-primary/5"
                    : "border-border hover:bg-muted",
                )}
              >
                <Globe
                  className={cn(
                    "h-4 w-4 shrink-0",
                    shareType === "public"
                      ? "text-primary"
                      : "text-muted-foreground",
                  )}
                />
                <div>
                  <p className="text-xs font-medium text-foreground">Público</p>
                  <p className="text-[10px] text-muted-foreground">
                    Cualquier persona
                  </p>
                </div>
              </button>
              <button
                onClick={() => setShareType("user")}
                className={cn(
                  "flex items-center gap-2.5 rounded-xl border p-3 text-left transition-all",
                  shareType === "user"
                    ? "border-primary/50 bg-primary/5"
                    : "border-border hover:bg-muted",
                )}
              >
                <Users
                  className={cn(
                    "h-4 w-4 shrink-0",
                    shareType === "user"
                      ? "text-primary"
                      : "text-muted-foreground",
                  )}
                />
                <div>
                  <p className="text-xs font-medium text-foreground">Privado</p>
                  <p className="text-[10px] text-muted-foreground">
                    Solo registrados
                  </p>
                </div>
              </button>
            </div>
          </div>

          {/* Options */}
          <div className="space-y-3 rounded-xl border border-border p-3">
            {/* Allow download */}
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-2 min-w-0">
                <Download className="h-4 w-4 text-muted-foreground shrink-0" />
                <div className="min-w-0">
                  <p className="text-sm font-medium text-foreground">
                    Permitir descarga
                  </p>
                  <p className="text-xs text-muted-foreground">
                    El usuario puede descargar
                  </p>
                </div>
              </div>
              <button
                type="button"
                role="switch"
                aria-checked={allowDownload}
                onClick={() => setAllowDownload(!allowDownload)}
                className={cn(
                  "relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200",
                  allowDownload ? "bg-primary" : "bg-muted-foreground/30",
                )}
              >
                <span
                  className={cn(
                    "pointer-events-none inline-block h-4 w-4 rounded-full bg-white shadow-lg transform transition-transform duration-200",
                    allowDownload ? "translate-x-4" : "translate-x-0",
                  )}
                />
              </button>
            </div>

            <div className="h-px bg-border" />

            {/* Expiry */}
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-2 min-w-0">
                <Calendar className="h-4 w-4 text-muted-foreground shrink-0" />
                <div className="min-w-0">
                  <p className="text-sm font-medium text-foreground">
                    Fecha de expiración
                  </p>
                  <p className="text-xs text-muted-foreground">
                    El enlace expira automáticamente
                  </p>
                </div>
              </div>
              <button
                type="button"
                role="switch"
                aria-checked={hasExpiry}
                onClick={() => setHasExpiry(!hasExpiry)}
                className={cn(
                  "relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200",
                  hasExpiry ? "bg-primary" : "bg-muted-foreground/30",
                )}
              >
                <span
                  className={cn(
                    "pointer-events-none inline-block h-4 w-4 rounded-full bg-white shadow-lg transform transition-transform duration-200",
                    hasExpiry ? "translate-x-4" : "translate-x-0",
                  )}
                />
              </button>
            </div>

            {hasExpiry && (
              <input
                type="datetime-local"
                value={expiryDate}
                onChange={(e) => setExpiryDate(e.target.value)}
                min={new Date().toISOString().slice(0, 16)}
                className={cn(
                  "flex h-9 w-full rounded-lg border border-input bg-background px-3 py-2",
                  "text-sm text-foreground",
                  "focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent",
                  "transition-colors",
                )}
              />
            )}

            <div className="h-px bg-border" />

            {/* Password */}
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-2 min-w-0">
                <Lock className="h-4 w-4 text-muted-foreground shrink-0" />
                <div className="min-w-0">
                  <p className="text-sm font-medium text-foreground">
                    Proteger con contraseña
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Requiere contraseña para acceder
                  </p>
                </div>
              </div>
              <button
                type="button"
                role="switch"
                aria-checked={hasPassword}
                onClick={() => setHasPassword(!hasPassword)}
                className={cn(
                  "relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200",
                  hasPassword ? "bg-primary" : "bg-muted-foreground/30",
                )}
              >
                <span
                  className={cn(
                    "pointer-events-none inline-block h-4 w-4 rounded-full bg-white shadow-lg transform transition-transform duration-200",
                    hasPassword ? "translate-x-4" : "translate-x-0",
                  )}
                />
              </button>
            </div>

            {hasPassword && (
              <input
                type="text"
                placeholder="Contraseña del enlace"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={cn(
                  "flex h-9 w-full rounded-lg border border-input bg-background px-3 py-2",
                  "text-sm text-foreground placeholder:text-muted-foreground",
                  "focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent",
                  "transition-colors",
                )}
              />
            )}
          </div>

          {/* Create button */}
          <button
            onClick={handleCreate}
            disabled={
              creating ||
              (hasPassword && !password) ||
              (hasExpiry && !expiryDate)
            }
            className={cn(
              "flex w-full items-center justify-center gap-2 h-10 rounded-lg",
              "bg-primary text-primary-foreground text-sm font-medium",
              "hover:bg-primary/90 transition-colors",
              "disabled:cursor-not-allowed disabled:opacity-50",
            )}
          >
            {creating ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Plus className="h-4 w-4" />
            )}
            Crear enlace
          </button>

          {/* Existing shares */}
          {sharesLoading ? (
            <div className="flex justify-center py-4">
              <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
            </div>
          ) : (
            shares &&
            shares.length > 0 && (
              <div className="space-y-2">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Enlaces activos
                </p>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {shares.map((share) => (
                    <div
                      key={share.id}
                      className="flex items-center gap-2 rounded-xl border border-border p-3"
                    >
                      <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-muted">
                        {share.share_type === "public" ? (
                          <Globe className="h-3.5 w-3.5 text-muted-foreground" />
                        ) : (
                          <Users className="h-3.5 w-3.5 text-muted-foreground" />
                        )}
                      </div>

                      <div className="flex-1 min-w-0 space-y-0.5">
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs font-medium text-foreground">
                            {share.share_type === "public"
                              ? "Público"
                              : "Privado"}
                          </span>
                          {share.password && (
                            <Lock className="h-3 w-3 text-muted-foreground" />
                          )}
                          {share.permissions.includes("view") && (
                            <Eye className="h-3 w-3 text-muted-foreground" />
                          )}
                        </div>
                        {share.expires_at && (
                          <p className="text-[10px] text-muted-foreground">
                            Expira:{" "}
                            {format(
                              new Date(share.expires_at),
                              "d MMM yyyy HH:mm",
                              { locale: es },
                            )}
                          </p>
                        )}
                      </div>

                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          onClick={() =>
                            handleCopy(share.token ?? "", share.id)
                          }
                          className="flex h-7 w-7 items-center justify-center rounded-md hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                          aria-label="Copiar enlace"
                        >
                          {copiedId === share.id ? (
                            <Check className="h-3.5 w-3.5 text-green-500" />
                          ) : (
                            <Copy className="h-3.5 w-3.5" />
                          )}
                        </button>
                        <button
                          onClick={() => deactivateShare(share.id)}
                          className="flex h-7 w-7 items-center justify-center rounded-md hover:bg-muted text-muted-foreground hover:text-destructive transition-colors"
                          aria-label="Desactivar enlace"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
