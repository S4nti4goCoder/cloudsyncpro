import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface UIState {
  sidebarCollapsed: boolean
  mobileSidebarOpen: boolean
  theme: 'light' | 'dark' | 'system'
  notificationsInApp: boolean
  notificationsEmail: boolean
}

interface UIActions {
  toggleSidebar: () => void
  setSidebarCollapsed: (collapsed: boolean) => void
  setMobileSidebarOpen: (open: boolean) => void
  setTheme: (theme: 'light' | 'dark' | 'system') => void
  setNotificationsInApp: (enabled: boolean) => void
  setNotificationsEmail: (enabled: boolean) => void
}

type UIStore = UIState & UIActions

export const useUIStore = create<UIStore>()(
  persist(
    (set) => ({
      sidebarCollapsed: false,
      mobileSidebarOpen: false,
      theme: 'system',
      notificationsInApp: true,
      notificationsEmail: false,

      toggleSidebar: () =>
        set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),
      setSidebarCollapsed: (collapsed) =>
        set({ sidebarCollapsed: collapsed }),
      setMobileSidebarOpen: (open) => set({ mobileSidebarOpen: open }),
      setTheme: (theme) => set({ theme }),
      setNotificationsInApp: (enabled) => set({ notificationsInApp: enabled }),
      setNotificationsEmail: (enabled) => set({ notificationsEmail: enabled }),
    }),
    {
      name: 'ui-store',
      partialize: (state) => ({
        sidebarCollapsed: state.sidebarCollapsed,
        theme: state.theme,
        notificationsInApp: state.notificationsInApp,
        notificationsEmail: state.notificationsEmail,
      }),
    }
  )
)