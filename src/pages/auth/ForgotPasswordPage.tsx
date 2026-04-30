import { useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import { ArrowLeft, ArrowRight, CheckCircle2, Loader2, Mail } from "lucide-react";
import { authService } from "@/services/authService";
import { cn } from "@/lib/utils";
import { isValidEmail } from "@/utils/validation";
import { usePageTitle } from "@/hooks/usePageTitle";

export default function ForgotPasswordPage() {
  usePageTitle("Recuperar contraseña");
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!email.trim()) {
      setError("Ingresa tu correo");
      return;
    }
    if (!isValidEmail(email)) {
      setError("Correo inválido");
      return;
    }

    setIsLoading(true);
    try {
      await authService.resetPassword(email.trim());
      setSent(true);
    } catch (err) {
      toast.error(
        err instanceof Error
          ? err.message
          : "No se pudo enviar el correo de recuperación",
      );
    } finally {
      setIsLoading(false);
    }
  }

  if (sent) {
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
              Revisa tu correo
            </h1>
            <p className="text-sm text-gray-500 leading-relaxed">
              Si <span className="font-medium text-gray-900">{email}</span>{" "}
              está registrado, te enviamos un enlace para restablecer tu
              contraseña. Revisa tu bandeja de entrada y la carpeta de spam.
            </p>
          </div>
          <Link
            to="/login"
            className="inline-flex items-center gap-2 rounded-xl bg-[#082563] px-6 h-11 text-sm font-medium text-white hover:bg-[#0a2d75] transition-all duration-150 shadow-sm shadow-blue-900/20"
          >
            Volver a iniciar sesión
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen w-full flex items-center justify-center bg-white px-4 py-8">
      <div className="w-full max-w-sm animate-fade-in">
        <Link
          to="/login"
          className="inline-flex items-center gap-1.5 mb-8 text-sm text-gray-500 hover:text-gray-700 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Volver a iniciar sesión
        </Link>

        <div className="mb-8 space-y-1.5">
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
            Recuperar contraseña
          </h1>
          <p className="text-sm text-gray-500">
            Ingresa tu correo y te enviaremos un enlace para restablecer tu
            contraseña.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label
              htmlFor="email"
              className="text-sm font-medium text-gray-700"
            >
              Correo electrónico
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                id="email"
                type="email"
                autoComplete="email"
                placeholder="tu@ejemplo.com"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (error) setError(null);
                }}
                disabled={isLoading}
                aria-invalid={!!error}
                className={cn(
                  "flex h-11 w-full rounded-xl border bg-gray-50/50 pl-10 pr-4",
                  "text-sm text-gray-900 placeholder:text-gray-400",
                  "focus:outline-none focus:ring-2 focus:bg-white",
                  "disabled:cursor-not-allowed disabled:opacity-50 transition-all duration-150",
                  error
                    ? "border-red-500 focus:ring-red-500/20 focus:border-red-500"
                    : "border-gray-200 focus:ring-blue-500/20 focus:border-blue-500",
                )}
              />
            </div>
            {error && <p className="text-xs text-red-600">{error}</p>}
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
                Enviar enlace
                <ArrowRight className="h-4 w-4" />
              </>
            )}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-gray-500">
          ¿Recordaste tu contraseña?{" "}
          <Link
            to="/login"
            className="font-semibold text-blue-600 hover:text-blue-700 transition-colors"
          >
            Inicia sesión
          </Link>
        </p>
      </div>
    </main>
  );
}
