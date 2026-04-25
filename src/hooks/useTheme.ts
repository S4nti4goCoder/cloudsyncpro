import { useEffect } from 'react'
import { useUIStore } from '@/store/uiStore'

export function useTheme() {
  const { theme, setTheme } = useUIStore()

  useEffect(() => {
    const root = document.documentElement

    if (theme !== 'system') {
      root.classList.toggle('dark', theme === 'dark')
      return
    }

    const mq = window.matchMedia('(prefers-color-scheme: dark)')
    const apply = () => root.classList.toggle('dark', mq.matches)
    apply()
    mq.addEventListener('change', apply)
    return () => mq.removeEventListener('change', apply)
  }, [theme])

  function toggleTheme() {
    setTheme(theme === 'dark' ? 'light' : 'dark')
  }

  return { theme, setTheme, toggleTheme }
}