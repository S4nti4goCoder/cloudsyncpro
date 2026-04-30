import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import {
  ArrowRight,
  CheckCircle2,
  Eye,
  EyeOff,
  Loader2,
  Lock,
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import { cn } from "@/lib/utils";
import { getPasswordError } from "@/utils/validation";
import { usePageTitle } from "@/hooks/usePageTitle";

export default function ResetPasswordPage() {
  usePageTitle("Restablecer contraseña");
  const navigate = useNavigate();

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [hasRecoverySession, setHasRecoverySession] = useState<boolean | null>(
    null,
  );
  const [errors, setErrors] = useState<{ password?: string; confirm?: string }>(
    {},
  );

  // Supabase puts a recovery token in the URL hash and (if valid) signs the
  // user in with a temporary session. If we don't see one, the link expired
  // or was tampered with.
  useEffect(() => {
    const { data: subscription } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (event === "PASSWORD_RECOVERY" || (event === "SIGNED_IN" && session)) {
          setHasRecoverySession(true);
        }
      },
    );

    supabase.auth.getSession().then(({ data: { session } }) => {
      setHasRecoverySession(!!session);
    });

    return () => subscription.subscription.unsubscribe();
  }, []);

  function validate(): boolean {
    const next: { password?: string; confirm?: string } = {};
    const passwordError = getPasswordError(password);
    if (passwordError) next.password = passwordError;
    if (password !== confirm) next.confirm = "Las contraseñas no coinciden";
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;

    setIsLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({ password });
      if (error) throw error;
      setDone(true);
      // Redirect to login after a moment
      setTimeout(() => navigate("/login"), 2500);
    } catch (err) {
      toast.error(
        err instanceof Error
          ? err.message
          : "No se pudo actualizar la contraseña",
      );
    } finally {
      setIsLoading(false);
    }
  }

  // Loading the recovery session check
  if (hasRecoverySession === null) {
    return (
      <main className="min-h-screen w-full flex items-center justify-center bg-white">
        <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
      </main>
    );
  }

  // Invalid / expired link
  if (!hasRecoverySession && !done) {
    return (
      <main className="min-h-screen w-full flex items-center justify-center bg-white px-4 py-8">
        <div className="w-full max-w-sm text-center space-y-5 animate-fade-in">
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
            Enlace inválido o expirado
          </h1>
          <p className="text-sm text-gray-500 leading-relaxed">
            El enlace para restablecer la contraseña no es válido o ya
            expiró. Solicita uno nuevo.
          </p>
          <Link
            to="/forgot-password"
            className="inline-flex items-center gap-2 rounded-xl bg-[#082563] px-6 h-11 text-sm font-medium text-white hover:bg-[#0a2d75] transition-all duration-150 shadow-sm shadow-blue-900/20"
          >
            Solicitar nuevo enlace
          </Link>
        </div>
      </main>
    );
  }

  // Success
  if (done) {
    return (
      <main className="min-h-screen w-full flex items-center justify-center bg-white px-4 py-8">
        <div className="w-full max-w-sm text-center space-y-5 animate-fade-in">
          <div className="flex justify-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-green-50">
              <CheckCircle2 className="h-8 w-8 text-green-500" />
            </div>
          </div>
          <div className="space-y-2">
            <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
              Contraseña actualizada
            </h1>
            <p className="text-sm text-gray-500 leading-relaxed">
              Ya puedes iniciar sesión con tu nueva contraseña.
            </p>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen w-full flex items-center justify-center bg-white px-4 py-8">
      <div className="w-full max-w-sm animate-fade-in">
        <div className="mb-8 space-y-1.5">
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
            Nueva contraseña
          </h1>
          <p className="text-sm text-gray-500">
            Elige una contraseña segura. Mínimo 8 caracteres.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label
              htmlFor="password"
              className="text-sm font-medium text-gray-700"
            >
              Nueva contraseña
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                autoComplete="new-password"
                placeholder="Mín. 8 caracteres"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (errors.password)
                    setErrors((p) => ({ ...p, password: undefined }));
                }}
                disabled={isLoading}
                aria-invalid={!!errors.password}
                className={cn(
                  "flex h-11 w-full rounded-xl border bg-gray-50/50 pl-10 pr-10",
                  "text-sm text-gray-900 placeholder:text-gray-400",
                  "focus:outline-none focus:ring-2 focus:bg-white",
                  "disabled:cursor-not-allowed disabled:opacity-50 transition-all duration-150",
                  errors.password
                    ? "border-red-500 focus:ring-red-500/20 focus:border-red-500"
                    : "border-gray-200 focus:ring-blue-500/20 focus:border-blue-500",
                )}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-1 top-1/2 -translate-y-1/2 flex h-9 w-9 items-center justify-center rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
                aria-label={
                  showPassword ? "Ocultar contraseña" : "Mostrar contraseña"
                }
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>
            {errors.password && (
              <p className="text-xs text-red-600">{errors.password}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <label
              htmlFor="confirm"
              className="text-sm font-medium text-gray-700"
            >
              Confirmar contraseña
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                id="confirm"
                type={showPassword ? "text" : "password"}
                autoComplete="new-password"
                placeholder="Repite la contraseña"
                value={confirm}
                onChange={(e) => {
                  setConfirm(e.target.value);
                  if (errors.confirm)
                    setErrors((p) => ({ ...p, confirm: undefined }));
                }}
                disabled={isLoading}
                aria-invalid={!!errors.confirm}
                className={cn(
                  "flex h-11 w-full rounded-xl border bg-gray-50/50 pl-10 pr-4",
                  "text-sm text-gray-900 placeholder:text-gray-400",
                  "focus:outline-none focus:ring-2 focus:bg-white",
                  "disabled:cursor-not-allowed disabled:opacity-50 transition-all duration-150",
                  errors.confirm
                    ? "border-red-500 focus:ring-red-500/20 focus:border-red-500"
                    : "border-gray-200 focus:ring-blue-500/20 focus:border-blue-500",
                )}
              />
            </div>
            {errors.confirm && (
              <p className="text-xs text-red-600">{errors.confirm}</p>
            )}
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className={cn(
              "flex w-full items-center justify-center gap-2 rounded-xl h-11",
              "bg-[#082563] text-sm font-medium text-white",
              "hover:bg-[#0a2d75] active:scale-[0.99] transition-all duration-150",
              "disabled:cursor-not-allowed disabled:opacity-50",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2",
              "shadow-sm shadow-blue-900/20",
            )}
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <>
                Actualizar contraseña
                <ArrowRight className="h-4 w-4" />
              </>
            )}
          </button>
        </form>
      </div>
    </main>
  );
}
