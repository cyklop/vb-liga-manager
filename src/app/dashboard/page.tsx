'use client'

import { useState, useEffect } from 'react'
import Navigation from '../../../components/Navigation'
import UserProfileForm from '../../../components/UserProfileForm'

interface User {
  id: number
  email: string
  name: string
  isAdmin: boolean
  isSuperAdmin: boolean
  team?: {
    id: number
    name: string
  }
}

export default function Dashboard() {
  const [user, setUser] = useState<User | null>(null)

  useEffect(() => {
    // Hier würden Sie normalerweise den Benutzer aus dem globalen Zustand oder einer API abrufen
    // Für dieses Beispiel verwenden wir Mochdaten
    setUser({
      id: 1,
      email: 'benutzer@example.com',
      name: 'Max Mustermann',
      isAdmin: false,
      isSuperAdmin: false,
      team: {
        id: 1,
        name: 'Team A'
      }
    })
  }, [])

  const handleProfileUpdate = async (updatedUser: Partial<User>) => {
    try {
      const response = await fetch(`/api/users/${user?.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedUser),
      })
      if (response.ok) {
        const data = await response.json()
        setUser(prevUser => ({ ...prevUser, ...data }))
      }
    } catch (error) {
      console.error('Fehler beim Aktualisieren des Benutzerprofils', error)
    }
  }

  return (
    <>
      <Navigation />
      <header className="bg-white shadow">
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">Dashboard</h1>
        </div>
      </header>
      <main>
        <div className="mx-auto max-w-7xl py-6 sm:px-6 lg:px-8">
          <div className="px-4 py-6 sm:px-0">
            <div className="rounded-lg border-4 border-dashed border-gray-200 p-4">
              <h2 className="text-2xl font-bold mb-4">Willkommen, {user?.name}!</h2>
              <p className="mb-4">Hier können Sie Ihr Benutzerprofil verwalten.</p>
              {user && <UserProfileForm user={user} onUpdate={handleProfileUpdate} />}
            </div>
          </div>
        </div>
      </main>
    </>
  )
}
