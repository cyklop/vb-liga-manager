'use client'

import { createContext, useContext, useEffect, useState } from 'react'

type Theme = 'light' | 'dark' | 'system'

interface ThemeContextType {
  theme: Theme
  setTheme: (theme: Theme) => void
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>('system')
  const [mounted, setMounted] = useState(false)

  // Beim ersten Rendern den Theme-Wert aus dem localStorage laden
  useEffect(() => {
    const storedTheme = localStorage.getItem('theme') as Theme | null
    if (storedTheme) {
      setTheme(storedTheme)
    }
    setMounted(true)
  }, [])

  // Theme-Änderungen im localStorage speichern
  useEffect(() => {
    if (mounted) {
      localStorage.setItem('theme', theme)
      
      const root = window.document.documentElement
      root.classList.remove('light', 'dark')
      
      if (theme === 'system') {
        const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
        root.classList.add(systemTheme)
      } else {
        root.classList.add(theme)
      }
    }
  }, [theme, mounted])

  // Auf Änderungen der Systemeinstellung reagieren
  useEffect(() => {
    if (theme === 'system') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
      
      const handleChange = () => {
        const root = window.document.documentElement
        root.classList.remove('light', 'dark')
        root.classList.add(mediaQuery.matches ? 'dark' : 'light')
      }
      
      mediaQuery.addEventListener('change', handleChange)
      return () => mediaQuery.removeEventListener('change', handleChange)
    }
  }, [theme])

  // Während des Server-Renderings oder beim ersten Client-Rendering
  // zeigen wir die Kinder ohne Theme-Anpassungen an
  if (!mounted) {
    return <>{children}</>
  }

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  const context = useContext(ThemeContext)
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider')
  }
  return context
}
