import { Component, type ErrorInfo, type ReactNode } from "react";
import { AlertTriangle, RotateCw } from "lucide-react";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false, error: null };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    if (import.meta.env.DEV) {
      // eslint-disable-next-line no-console
      console.error("ErrorBoundary caught:", error, info);
    }
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  render() {
    if (!this.state.hasError) return this.props.children;

    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4 py-8 animate-fade-in">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-destructive/10 mb-6">
          <AlertTriangle className="h-6 w-6 text-destructive" />
        </div>

        <p className="text-xs font-medium tracking-[0.2em] text-muted-foreground uppercase">
          Algo salió mal
        </p>
        <h1 className="mt-2 text-3xl sm:text-4xl font-bold text-foreground tracking-tight text-center">
          Error inesperado
        </h1>
        <p className="mt-4 max-w-md text-center text-sm text-muted-foreground leading-relaxed">
          Ocurrió un problema al cargar la aplicación. Recarga la página para
          intentarlo de nuevo. Si el problema persiste, contacta a soporte.
        </p>

        {import.meta.env.DEV && this.state.error && (
          <pre className="mt-4 max-w-xl overflow-auto rounded-lg border border-border bg-muted/30 p-3 text-[11px] text-muted-foreground">
            {this.state.error.message}
          </pre>
        )}

        <button
          type="button"
          onClick={this.handleReset}
          className="mt-8 flex items-center justify-center gap-2 rounded-lg bg-primary px-4 h-10 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
        >
          <RotateCw className="h-4 w-4" />
          Recargar página
        </button>
      </div>
    );
  }
}
