import { useEffect } from 'react'
import { useUIStore } from '@/store/uiStore'

export function useTheme() {
  const { theme, setTheme } = useUIStore()

  useEffect(() => {
    const root = document.documentElement

    if (theme === 'system') {
      const systemDark = window.matchMedia('(prefers-color-scheme: dark)').matches
      root.classList.toggle('dark', systemDark)
    } else {
      root.classList.toggle('dark', theme === 'dark')
    }
  }, [theme])

  function toggleTheme() {
    setTheme(theme === 'dark' ? 'light' : 'dark')
  }

  return { theme, setTheme, toggleTheme }
}