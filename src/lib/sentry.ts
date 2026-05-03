import * as Sentry from "@sentry/react";

const SENTRY_DSN = import.meta.env.VITE_SENTRY_DSN as string | undefined;

/**
 * Initialize Sentry for error monitoring.
 *
 * No-ops when VITE_SENTRY_DSN is not set, so the app runs normally in
 * development or when no monitoring is configured. Set the env var in
 * production (Vercel) to enable error capture.
 */
export function initSentry() {
  if (!SENTRY_DSN) return;

  Sentry.init({
    dsn: SENTRY_DSN,
    environment: import.meta.env.MODE,
    integrations: [
      Sentry.browserTracingIntegration(),
      Sentry.replayIntegration({
        maskAllText: false,
        blockAllMedia: false,
      }),
    ],
    // Performance monitoring — sample 10% of transactions to stay within free tier
    tracesSampleRate: 0.1,
    // Session replays — only on error
    replaysSessionSampleRate: 0,
    replaysOnErrorSampleRate: 1.0,
    // Filter out noise
    ignoreErrors: [
      // Browser extensions
      "ResizeObserver loop limit exceeded",
      "ResizeObserver loop completed with undelivered notifications",
      // Network errors that aren't actionable
      "NetworkError",
      "Failed to fetch",
    ],
  });
}

/**
 * Attach the current authenticated user to Sentry events.
 * Call after login.
 */
export function setSentryUser(user: { id: string; email?: string | null } | null) {
  if (!SENTRY_DSN) return;
  if (user) {
    Sentry.setUser({ id: user.id, email: user.email ?? undefined });
  } else {
    Sentry.setUser(null);
  }
}

/**
 * Manually capture an exception (e.g. from a try/catch).
 */
export function captureError(error: unknown, context?: Record<string, unknown>) {
  if (!SENTRY_DSN) return;
  Sentry.captureException(error, context ? { extra: context } : undefined);
}
