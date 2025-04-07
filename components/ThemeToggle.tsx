'use client'

import { useTheme } from './ThemeProvider'
import { useState, useEffect } from 'react'

export default function ThemeToggle() {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  // Beim ersten Rendern den Theme-Wert aus dem Context laden
  useEffect(() => {
    setMounted(true)
  }, [])

  // Während des Server-Renderings oder beim ersten Client-Rendering
  // zeigen wir nichts an
  if (!mounted) {
    return null
  }

  return (
    <div className="flex items-center space-x-4">
      <label htmlFor="theme-select" className="text-sm font-medium">
        Theme:
      </label>
      <select
        id="theme-select"
        value={theme}
        onChange={(e) => setTheme(e.target.value as 'light' | 'dark' | 'system')}
        className="rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 px-3 py-1 text-sm"
      >
        <option value="light">Hell</option>
        <option value="dark">Dunkel</option>
        <option value="system">System</option>
      </select>
    </div>
  )
}
