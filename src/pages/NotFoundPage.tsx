import { Link } from "react-router-dom";
import { Cloud, Home, ArrowLeft } from "lucide-react";
import { useAuthStore } from "@/store/authStore";
import { usePageTitle } from "@/hooks/usePageTitle";

export default function NotFoundPage() {
  usePageTitle("Página no encontrada");
  const isAuthenticated = useAuthStore((s) => s.user !== null);
  const homeHref = isAuthenticated ? "/dashboard" : "/login";

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-background px-4 py-8 animate-fade-in">
      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 mb-6">
        <Cloud className="h-6 w-6 text-primary" />
      </div>

      <p className="text-xs font-medium tracking-[0.2em] text-muted-foreground uppercase">
        Error 404
      </p>
      <h1 className="mt-2 text-4xl sm:text-5xl font-bold text-foreground tracking-tight text-center">
        Página no encontrada
      </h1>
      <p className="mt-4 max-w-md text-center text-sm text-muted-foreground leading-relaxed">
        La URL que intentaste abrir no existe o fue movida. Verifica la
        dirección o vuelve al inicio.
      </p>

      <div className="mt-8 flex flex-col sm:flex-row items-center gap-2 w-full max-w-xs sm:w-auto">
        <button
          type="button"
          onClick={() => window.history.back()}
          className="flex w-full sm:w-auto items-center justify-center gap-2 rounded-lg border border-border bg-background px-4 h-10 text-sm font-medium text-foreground hover:bg-muted transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Volver atrás
        </button>
        <Link
          to={homeHref}
          className="flex w-full sm:w-auto items-center justify-center gap-2 rounded-lg bg-primary px-4 h-10 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
        >
          <Home className="h-4 w-4" />
          {isAuthenticated ? "Ir al dashboard" : "Ir al login"}
        </Link>
      </div>
    </main>
  );
}
