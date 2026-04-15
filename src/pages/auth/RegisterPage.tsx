import { useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import {
  Eye,
  EyeOff,
  Loader2,
  ArrowRight,
  CheckCircle2,
  Mail,
  Lock,
  User,
} from "lucide-react";
import { authService } from "@/services/authService";
import { cn } from "@/lib/utils";

export default function RegisterPage() {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [registered, setRegistered] = useState(false);

  const passwordStrength = getPasswordStrength(password);

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault();
    if (!fullName || !email || !password) {
      toast.error("Por favor completa todos los campos");
      return;
    }
    if (password.length < 8) {
      toast.error("La contraseña debe tener al menos 8 caracteres");
      return;
    }
    setIsLoading(true);
    try {
      await authService.signUpWithEmail(email, password, fullName);
      setRegistered(true);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Error al crear la cuenta",
      );
    } finally {
      setIsLoading(false);
    }
  }

  async function handleGoogleLogin() {
    setIsGoogleLoading(true);
    try {
      await authService.signInWithGoogle();
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Error al iniciar sesión con Google",
      );
      setIsGoogleLoading(false);
    }
  }

  if (registered) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-white px-6">
        <div className="w-full max-w-sm text-center space-y-5 animate-fade-in">
          <div className="flex justify-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-green-50">
              <CheckCircle2 className="h-8 w-8 text-green-500" />
            </div>
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl font-bold text-gray-900 tracking-tight">
              ¡Cuenta creada!
            </h2>
            <p className="text-sm text-gray-500 leading-relaxed">
              Revisa tu correo electrónico para confirmar tu cuenta antes de
              iniciar sesión.
            </p>
          </div>
          <Link
            to="/login"
            className="inline-flex items-center gap-2 rounded-xl bg-[#082563] px-6 h-11 text-sm font-medium text-white hover:bg-[#0a2d75] transition-all duration-150 shadow-sm shadow-blue-900/20"
          >
            Ir a iniciar sesión
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full flex bg-white">
      {/* Panel izquierdo */}
      <div
        className="hidden lg:flex lg:w-[45%] flex-col justify-between p-12 relative overflow-hidden"
        style={{
          background:
            "linear-gradient(135deg, #0f172a 0%, #082563 50%, #1e40af 100%)",
        }}
      >
        {/* Decoration */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div
            className="absolute -top-32 -right-32 w-96 h-96 rounded-full opacity-10"
            style={{
              background: "radial-gradient(circle, #60a5fa, transparent)",
            }}
          />
          <div
            className="absolute bottom-0 -left-20 w-72 h-72 rounded-full opacity-10"
            style={{
              background: "radial-gradient(circle, #3b82f6, transparent)",
            }}
          />
          <svg
            className="absolute inset-0 w-full h-full opacity-5"
            xmlns="http://www.w3.org/2000/svg"
          >
            <defs>
              <pattern
                id="grid2"
                width="40"
                height="40"
                patternUnits="userSpaceOnUse"
              >
                <path
                  d="M 40 0 L 0 0 0 40"
                  fill="none"
                  stroke="white"
                  strokeWidth="0.5"
                />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid2)" />
          </svg>
        </div>

        {/* Logo */}
        <div className="relative flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-500 shadow-lg shadow-blue-500/30">
            <svg
              className="h-5 w-5 text-white"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M18 10h-1.26A8 8 0 1 0 9 20h9a5 5 0 0 0 0-10z" />
            </svg>
          </div>
          <span className="text-lg font-semibold text-white tracking-tight">
            CloudSyncPro
          </span>
        </div>

        {/* Content */}
        <div className="relative space-y-8">
          <div className="space-y-4">
            <h1 className="text-5xl font-bold text-white leading-[1.1] tracking-tight">
              Empieza gratis
              <br />
              <span className="text-blue-400">hoy mismo.</span>
            </h1>
            <p className="text-base text-blue-100/70 leading-relaxed max-w-sm">
              Crea tu cuenta y reúne los archivos de tu equipo en un solo lugar
              seguro.
            </p>
          </div>

          <div className="space-y-3">
            {[
              "Gratis para empezar",
              "Sin tarjeta de crédito",
              "Invita a tu equipo al instante",
              "Cancela cuando quieras",
            ].map((feature) => (
              <div key={feature} className="flex items-center gap-3">
                <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-blue-500/20">
                  <div className="h-1.5 w-1.5 rounded-full bg-blue-400" />
                </div>
                <span className="text-sm text-blue-100/60">{feature}</span>
              </div>
            ))}
          </div>
        </div>

        <p className="relative text-xs text-blue-200/30">
          © {new Date().getFullYear()} CloudSyncPro. Todos los derechos
          reservados.
        </p>
      </div>

      {/* Panel derecho */}
      <div className="flex flex-1 flex-col items-center justify-center px-8 py-12">
        <div className="w-full max-w-100 animate-fade-in">
          {/* Mobile logo */}
          <div className="flex items-center gap-2.5 mb-10 lg:hidden">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#082563]">
              <svg
                className="h-4 w-4 text-white"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M18 10h-1.26A8 8 0 1 0 9 20h9a5 5 0 0 0 0-10z" />
              </svg>
            </div>
            <span className="text-base font-semibold text-gray-900">
              CloudSyncPro
            </span>
          </div>

          <div className="mb-8 space-y-1.5">
            <h2 className="text-2xl font-bold text-gray-900 tracking-tight">
              Crear cuenta
            </h2>
            <p className="text-sm text-gray-500">
              Comienza gratis. Sin tarjeta de crédito.
            </p>
          </div>

          {/* Google */}
          <button
            onClick={handleGoogleLogin}
            disabled={isGoogleLoading || isLoading}
            className={cn(
              "flex w-full items-center justify-center gap-3 rounded-xl border border-gray-200",
              "bg-white px-4 h-11 text-sm font-medium text-gray-700",
              "hover:bg-gray-50 hover:border-gray-300 transition-all duration-150",
              "shadow-sm disabled:cursor-not-allowed disabled:opacity-50",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500",
            )}
          >
            {isGoogleLoading ? (
              <Loader2 className="h-4 w-4 animate-spin text-gray-400" />
            ) : (
              <svg className="h-4 w-4" viewBox="0 0 24 24">
                <path
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  fill="#4285F4"
                />
                <path
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  fill="#34A853"
                />
                <path
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  fill="#FBBC05"
                />
                <path
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  fill="#EA4335"
                />
              </svg>
            )}
            Continuar con Google
          </button>

          <div className="flex items-center gap-3 my-6">
            <div className="h-px flex-1 bg-gray-100" />
            <span className="text-xs text-gray-400 font-medium">
              O continúa con email
            </span>
            <div className="h-px flex-1 bg-gray-100" />
          </div>

          <form onSubmit={handleRegister} className="space-y-4">
            <div className="space-y-1.5">
              <label
                htmlFor="fullName"
                className="text-sm font-medium text-gray-700"
              >
                Nombre completo
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  id="fullName"
                  type="text"
                  autoComplete="name"
                  placeholder="Juan Pérez"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  disabled={isLoading || isGoogleLoading}
                  className={cn(
                    "flex h-11 w-full rounded-xl border border-gray-200 bg-gray-50/50 pl-10 pr-4",
                    "text-sm text-gray-900 placeholder:text-gray-400",
                    "focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white",
                    "disabled:cursor-not-allowed disabled:opacity-50 transition-all duration-150",
                  )}
                />
              </div>
            </div>

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
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isLoading || isGoogleLoading}
                  className={cn(
                    "flex h-11 w-full rounded-xl border border-gray-200 bg-gray-50/50 pl-10 pr-4",
                    "text-sm text-gray-900 placeholder:text-gray-400",
                    "focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white",
                    "disabled:cursor-not-allowed disabled:opacity-50 transition-all duration-150",
                  )}
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label
                htmlFor="password"
                className="text-sm font-medium text-gray-700"
              >
                Contraseña
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="new-password"
                  placeholder="Mín. 8 caracteres"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isLoading || isGoogleLoading}
                  className={cn(
                    "flex h-11 w-full rounded-xl border border-gray-200 bg-gray-50/50 pl-10 pr-10",
                    "text-sm text-gray-900 placeholder:text-gray-400",
                    "focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white",
                    "disabled:cursor-not-allowed disabled:opacity-50 transition-all duration-150",
                  )}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
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

              {password.length > 0 && (
                <div className="space-y-1.5 animate-fade-in">
                  <div className="flex gap-1">
                    {[1, 2, 3, 4].map((level) => (
                      <div
                        key={level}
                        className={cn(
                          "h-1 flex-1 rounded-full transition-all duration-300",
                          level <= passwordStrength.score
                            ? passwordStrength.color
                            : "bg-gray-100",
                        )}
                      />
                    ))}
                  </div>
                  <p className="text-xs text-gray-400">
                    Seguridad:{" "}
                    <span className="font-medium text-gray-600">
                      {passwordStrength.label}
                    </span>
                  </p>
                </div>
              )}
            </div>

            <button
              type="submit"
              disabled={isLoading || isGoogleLoading}
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
                  Crear cuenta
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-gray-500">
            ¿Ya tienes cuenta?{" "}
            <Link
              to="/login"
              className="font-semibold text-blue-600 hover:text-blue-700 transition-colors"
            >
              Inicia sesión
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

function getPasswordStrength(password: string): {
  score: number;
  label: string;
  color: string;
} {
  let score = 0;
  if (password.length >= 8) score++;
  if (password.length >= 12) score++;
  if (/[A-Z]/.test(password) && /[a-z]/.test(password)) score++;
  if (/[0-9]/.test(password) && /[^A-Za-z0-9]/.test(password)) score++;

  const levels = [
    { label: "Débil", color: "bg-red-400" },
    { label: "Regular", color: "bg-orange-400" },
    { label: "Buena", color: "bg-yellow-400" },
    { label: "Fuerte", color: "bg-green-500" },
  ];

  return { score, ...(levels[Math.max(0, score - 1)] ?? levels[0]) };
}
