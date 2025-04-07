'use client'

import { useState, useEffect } from 'react'
import Navigation from '../../../components/Navbar'
import Link from 'next/link'

interface User {
  id: number
  name: string
  isAdmin: boolean
  isSuperAdmin: boolean
}

const navigation = [
  { name: 'Tabelle', href: '/table' },
  { name: 'Spielplan', href: '/fixtures' },
  { name: 'Mein Konto', href: '/account' },
]

const adminNavigation = [
  { name: 'Mannschaften verwalten', href: '/admin/teams' },
  { name: 'Benutzer verwalten', href: '/admin/users' },
  { name: 'Ligen verwalten', href: '/admin/leagues' },
]

export default function Dashboard() {
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
              <nav className="space-y-1">
                {navigation.map((item) => (
                  <Link
                    key={item.name}
                    href={item.href}
                    className="text-gray-600 hover:bg-gray-50 hover:text-gray-900 group flex items-center px-2 py-2 text-sm font-medium rounded-md"
                  >
                    {item.name}
                  </Link>
                ))}
              </nav>
              {user?.isAdmin && (
                <>
                  <h3 className="text-lg font-semibold mt-6 mb-2">Admin-Bereich</h3>
                  <nav className="space-y-1">
                    {adminNavigation.map((item) => (
                      <Link
                        key={item.name}
                        href={item.href}
                        className="text-gray-600 hover:bg-gray-50 hover:text-gray-900 group flex items-center px-2 py-2 text-sm font-medium rounded-md"
                      >
                        {item.name}
                      </Link>
                    ))}
                  </nav>
                </>
              )}
            </div>
          </div>
        </div>
      </main>
    </>
  )
}
