'use client'

import { useState, useEffect } from 'react'
import Navigation from '../../../components/Navbar'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

interface User {
  id: number
  email: string
  name: string
  isAdmin: boolean
  isSuperAdmin: boolean
}

export default function AdminPage() {
  const [currentUser, setCurrentUser] = useState<User | null>(null)
  const router = useRouter()

  useEffect(() => {
    fetchCurrentUser()
  }, [])

  const fetchCurrentUser = async () => {
    const response = await fetch('/api/users/me')
    if (response.ok) {
      const user = await response.json()
      setCurrentUser(user)
      if (!user.isSuperAdmin) {
        router.push('/dashboard')
      }
    }
  }

  if (!currentUser?.isSuperAdmin) {
    return null // oder eine Lade-Animation
  }

  return (
    <>
      <Navigation />
      <header className="bg-white shadow">
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">Admin-Bereich</h1>
        </div>
      </header>
      <main className="mx-auto max-w-7xl py-6 sm:px-6 lg:px-8">
        <div className="bg-white shadow overflow-hidden sm:rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h2 className="text-lg font-medium leading-6 text-gray-900 mb-4">Verwaltung</h2>
            <ul className="space-y-4">
              <li>
                <Link href="/admin/teams" className="text-indigo-600 hover:text-indigo-900">
                  Mannschaften verwalten
                </Link>
              </li>
              <li>
                <Link href="/admin/users" className="text-indigo-600 hover:text-indigo-900">
                  Benutzer verwalten
                </Link>
              </li>
              <li>
                <Link href="/admin/leagues" className="text-indigo-600 hover:text-indigo-900">
                  Ligen verwalten
                </Link>
              </li>
            </ul>
          </div>
        </div>
      </main>
    </>
  )
}
