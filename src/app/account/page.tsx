'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Navigation from '../../../components/Navbar'
import UserProfileForm from '../../../components/UserProfileForm'
import { ThemeProvider, useTheme } from '../../../components/ThemeProvider'

interface User {
  id: number
  email: string
  name: string
  isAdmin: boolean
  isSuperAdmin: boolean
  theme?: string
  team?: {
    id: number
    name: string
  }
}

// Wrapper-Komponente, die den ThemeProvider enthält
function AccountContent() {
  const [user, setUser] = useState<User | null>(null)
  const [mounted, setMounted] = useState(false)
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const { theme, setTheme } = useTheme() // Destrukturieren für einfacheren Zugriff

  useEffect(() => {
    setMounted(true)
    fetchUser()
  }, [router])

  const fetchUser = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/users/me')
      if (response.ok) {
        const userData = await response.json()
        setUser(userData)

        // Setze den Theme-Kontext basierend auf den Benutzerdaten, falls abweichend
        // Dies stellt sicher, dass der Kontext den gespeicherten Wert widerspiegelt
        if (userData.theme && mounted && userData.theme !== theme) {
           setTheme(userData.theme as 'light' | 'dark' | 'system')
        }
      } else if (response.status === 401) {
        // Nicht authentifiziert, zur Login-Seite weiterleiten
        router.push('/login')
        return
      }
    } catch (error) {
      console.error('Fehler beim Abrufen des Benutzerprofils', error)
      router.push('/login')
    } finally {
      setLoading(false)
    }
  }
  
  const handleProfileUpdate = async (updatedUser: Partial<User>) => {
    try {
      const response = await fetch('/api/users/me', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedUser),
      })
      if (response.ok) {
        const data = await response.json()
        setUser(prevUser => prevUser ? { ...prevUser, ...data } : null)
        // Der Theme-Context wird jetzt direkt im onChange des Selects aktualisiert
      }
    } catch (error) {
      console.error('Fehler beim Aktualisieren des Benutzerprofils', error)
    }
  }

  if (loading) {
    return (
      <>
        <Navigation />
        <div className="flex items-center justify-center h-screen">
          <div className="text-center">
            <p className="text-lg text-gray-600 dark:text-gray-400">Laden...</p>
          </div>
        </div>
      </>
    )
  }

  return (
    <>
      <Navigation />
      <header className="bg-white dark:bg-card shadow">
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-foreground">Mein Konto</h1>
        </div>
      </header>
      <main>
        <div className="mx-auto max-w-7xl py-6 sm:px-6 lg:px-8">
          <div className="px-4 py-6 sm:px-0">
            <div className="rounded-lg p-4 bg-white dark:bg-card shadow">
              {user && <UserProfileForm user={user} onUpdate={handleProfileUpdate} />}
              
              <div className="mt-8 border-t dark:border-border pt-6">
                <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-foreground">Darstellung</h2>
                <div className="mb-4">
                  <label htmlFor="theme" className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-200">
                    Theme-Einstellung
                  </label>
                  {mounted && (
                    <select
                      id="theme"
                      value={theme} // Wert aus dem Kontext binden
                      onChange={(e) => {
                        const newTheme = e.target.value as 'light' | 'dark' | 'system';
                        setTheme(newTheme); // Kontext aktualisieren
                        handleProfileUpdate({ theme: newTheme }); // Änderung im Backend speichern
                      }}
                      className="mt-1 block w-full pl-3 pr-10 py-2 text-base border border-gray-300 dark:border-gray-500 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md bg-white dark:bg-card text-gray-900 dark:text-foreground"
                    >
                    <option value="light">Hell</option>
                    <option value="dark">Dunkel</option>
                    <option value="system">System (Browser-Einstellung)</option>
                    </select>
                  )}
                  <p className="mt-2 mb-4 text-sm text-gray-500 dark:text-gray-200">
                    Wählen Sie Ihr bevorzugtes Erscheinungsbild für die Anwendung.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </>
  )
}

// Hauptkomponente, die den ThemeProvider enthält
export default function Account() {
  return (
    <ThemeProvider>
      <AccountContent />
    </ThemeProvider>
  )
}
