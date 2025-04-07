'use client'

import { useState, useEffect } from 'react'
import Navigation from '../../../components/Navbar'
import UserProfileForm from '../../../components/UserProfileForm'
import { useTheme } from '../../../components/ThemeProvider'

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

export default function Account() {
  const [user, setUser] = useState<User | null>(null)

  useEffect(() => {
    fetchUser()
  }, [])

  const fetchUser = async () => {
    try {
      const response = await fetch('/api/users/me')
      if (response.ok) {
        const userData = await response.json()
        setUser(userData)
      }
    } catch (error) {
      console.error('Fehler beim Abrufen des Benutzerprofils', error)
    }
  }

  const { setTheme } = useTheme()
  
  const handleProfileUpdate = async (updatedUser: Partial<User>) => {
    try {
      const response = await fetch('/api/users/me', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedUser),
      })
      if (response.ok) {
        const data = await response.json()
        setUser(prevUser => ({ ...prevUser, ...data }))
        
        // Wenn das Theme aktualisiert wurde, aktualisiere auch den Theme-Context
        if (updatedUser.theme && updatedUser.theme !== data.theme) {
          setTheme(data.theme as 'light' | 'dark' | 'system')
        }
      }
    } catch (error) {
      console.error('Fehler beim Aktualisieren des Benutzerprofils', error)
    }
  }
  
  // Synchronisiere das Theme mit dem Benutzer-Theme, wenn die Daten geladen werden
  useEffect(() => {
    if (user?.theme) {
      setTheme(user.theme as 'light' | 'dark' | 'system')
    }
  }, [user?.theme, setTheme])

  return (
    <>
      <Navigation />
      <header className="bg-white shadow">
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">Mein Konto</h1>
        </div>
      </header>
      <main>
        <div className="mx-auto max-w-7xl py-6 sm:px-6 lg:px-8">
          <div className="px-4 py-6 sm:px-0">
            <div className="rounded-lg border-4 border-dashed border-gray-200 p-4">
              <h2 className="text-2xl font-bold mb-4">Profil bearbeiten</h2>
              {user && <UserProfileForm user={user} onUpdate={handleProfileUpdate} />}
              
              <div className="mt-8 border-t pt-6">
                <h2 className="text-2xl font-bold mb-4">Darstellung</h2>
                <div className="mb-4">
                  <label htmlFor="theme" className="block text-sm font-medium mb-2">
                    Theme-Einstellung
                  </label>
                  <select
                    id="theme"
                    value={user?.theme || 'system'}
                    onChange={(e) => handleProfileUpdate({ theme: e.target.value })}
                    className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 dark:border-gray-700 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                  >
                    <option value="light">Hell</option>
                    <option value="dark">Dunkel</option>
                    <option value="system">System (Browser-Einstellung)</option>
                  </select>
                  <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                    Wählen Sie Ihr bevorzugtes Erscheinungsbild für die Anwendung.
                  </p>
                </div>
            </div>
          </div>
        </div>
      </main>
    </>
  )
}
