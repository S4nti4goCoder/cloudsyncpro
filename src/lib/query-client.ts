import { QueryClient } from '@tanstack/react-query'

/**
 * Global React Query client with sensible defaults for CloudSyncPro.
 */
export const queryClient = new QueryClient({
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