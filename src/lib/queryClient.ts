import { QueryClient, QueryCache, MutationCache } from '@tanstack/react-query'
import { captureError } from '@/lib/sentry'

/**
 * Global React Query client with sensible defaults for CloudSyncPro.
 *
 * QueryCache and MutationCache forward unhandled errors to Sentry.
 * Errors that components handle locally (via mutation onError) still
 * reach Sentry — that's intentional, so we know what's failing in prod.
 */
export const queryClient = new QueryClient({
  queryCache: new QueryCache({
    onError: (error, query) => {
      captureError(error, { queryKey: query.queryKey });
    },
  }),
  mutationCache: new MutationCache({
    onError: (error, _vars, _ctx, mutation) => {
      captureError(error, { mutationKey: mutation.options.mutationKey });
    },
  }),
  defaultOptions: {
    queries: {
      // Data is considered fresh for 1 minute
      staleTime: 1000 * 60,
      // Cache is kept for 5 minutes
      gcTime: 1000 * 60 * 5,
      // Retry once on failure (not 3 times — avoids hammering the server)
      retry: 1,
      // Don't refetch on window focus in development
      refetchOnWindowFocus: import.meta.env.PROD,
    },
    mutations: {
      retry: 0,
    },
  },
})