import { useState } from 'react'
import { Link } from 'react-router-dom'
import { toast } from 'sonner'
import { Eye, EyeOff, Cloud, Loader2 } from 'lucide-react'
import { authService } from '@/services/auth.service'
import { cn } from '@/lib/utils'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isGoogleLoading, setIsGoogleLoading] = useState(false)

  async function handleEmailLogin(e: React.FormEvent) {
    e.preventDefault()
    if (!email || !password) {
      toast.error('Por favor completa todos los campos')
      return
    }
    setIsLoading(true)
    try {
      await authService.signInWithEmail(email, password)
      toast.success('¡Bienvenido de nuevo!')
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Error al iniciar sesión')
    } finally {
      setIsLoading(false)
    }
  }

  async function handleGoogleLogin() {
    setIsGoogleLoading(true)
    try {
      await authService.signInWithGoogle()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Error al iniciar sesión con Google')
      setIsGoogleLoading(false)
    }
  }

  return (
    <div className="min-h-screen w-full flex">
      {/* Panel izquierdo — branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-[#0A2540] flex-col justify-between p-12">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-500">
            <Cloud className="h-5 w-5 text-white" />
          </div>
          <span className="text-xl font-semibold text-white">CloudSyncPro</span>
        </div>

        <div className="space-y-6">
          <div className="space-y-3">
            <h1 className="text-4xl font-bold text-white leading-tight">
              Tus archivos,<br />en todas partes.
            </h1>
            <p className="text-lg text-blue-200/80 leading-relaxed max-w-md">
              Gestiona, comparte y colabora en archivos de forma segura con tu equipo — desde cualquier lugar del mundo.
            </p>
          </div>

          <div className="space-y-3">
            {[
              'Almacenamiento cifrado de extremo a extremo',
              'Colaboración en tiempo real',
              'Permisos y roles avanzados',
              'Registro completo de actividad',
            ].map((feature) => (
              <div key={feature} className="flex items-center gap-3">
                <div className="h-1.5 w-1.5 rounded-full bg-blue-400" />
                <span className="text-sm text-blue-100/70">{feature}</span>
              </div>
            ))}
          </div>
        </div>

        <p className="text-xs text-blue-200/40">
          © {new Date().getFullYear()} CloudSyncPro. Todos los derechos reservados.
        </p>
      </div>

      {/* Panel derecho — formulario */}
      <div className="flex flex-1 flex-col items-center justify-center px-6 py-12 bg-background">
        <div className="w-full max-w-sm space-y-8">
          {/* Logo mobile */}
          <div className="flex items-center gap-3 lg:hidden">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#0A2540]">
              <Cloud className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-semibold text-foreground">CloudSyncPro</span>
          </div>

          <div className="space-y-2">
            <h2 className="text-2xl font-bold text-foreground">Iniciar sesión</h2>
            <p className="text-sm text-muted-foreground">
              Bienvenido de nuevo. Ingresa tus credenciales para continuar.
            </p>
          </div>

          {/* Google OAuth */}
          <button
            onClick={handleGoogleLogin}
            disabled={isGoogleLoading || isLoading}
            className={cn(
              'flex w-full items-center justify-center gap-3 rounded-lg border border-border',
              'bg-background px-4 py-2.5 text-sm font-medium text-foreground',
              'transition-colors hover:bg-muted disabled:cursor-not-allowed disabled:opacity-50'
            )}
          >
            {isGoogleLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <svg className="h-4 w-4" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
            )}
            Continuar con Google
          </button>

          {/* Divisor */}
          <div className="flex items-center gap-3">
            <div className="h-px flex-1 bg-border" />
            <span className="text-xs text-muted-foreground">o</span>
            <div className="h-px flex-1 bg-border" />
          </div>

          {/* Formulario email */}
          <form onSubmit={handleEmailLogin} className="space-y-4">
            <div className="space-y-1.5">
              <label htmlFor="email" className="text-sm font-medium text-foreground">
                Correo electrónico
              </label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                placeholder="tu@ejemplo.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isLoading || isGoogleLoading}
                className={cn(
                  'flex h-10 w-full rounded-lg border border-input bg-background px-3 py-2',
                  'text-sm text-foreground placeholder:text-muted-foreground',
                  'focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent',
                  'disabled:cursor-not-allowed disabled:opacity-50 transition-colors'
                )}
              />
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label htmlFor="password" className="text-sm font-medium text-foreground">
                  Contraseña
                </label>
                <Link
                  to="/forgot-password"
                  className="text-xs text-blue-500 hover:text-blue-600 transition-colors"
                >
                  ¿Olvidaste tu contraseña?
                </Link>
              </div>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isLoading || isGoogleLoading}
                  className={cn(
                    'flex h-10 w-full rounded-lg border border-input bg-background px-3 py-2 pr-10',
                    'text-sm text-foreground placeholder:text-muted-foreground',
                    'focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent',
                    'disabled:cursor-not-allowed disabled:opacity-50 transition-colors'
                  )}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading || isGoogleLoading}
              className={cn(
                'flex w-full items-center justify-center gap-2 rounded-lg',
                'bg-[#0A2540] px-4 py-2.5 text-sm font-medium text-white',
                'hover:bg-[#0d2f4e] transition-colors',
                'disabled:cursor-not-allowed disabled:opacity-50',
                'focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2'
              )}
            >
              {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
              Iniciar sesión
            </button>
          </form>

          <p className="text-center text-sm text-muted-foreground">
            ¿No tienes cuenta?{' '}
            <Link
              to="/register"
              className="font-medium text-blue-500 hover:text-blue-600 transition-colors"
            >
              Regístrate
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}