'use client'

import { useState, useEffect } from 'react'
import Navigation from '@/components/Navbar'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { 
  UserGroupIcon, 
  UsersIcon, 
  TrophyIcon 
} from '@heroicons/react/24/outline'

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
        <div className="px-4 py-6 sm:px-0">
          <h2 className="text-xl font-bold mb-6">Verwaltung</h2>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            <Link
              href="/admin/teams"
              className="flex flex-col items-center justify-center p-6 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300"
            >
              <UserGroupIcon className="h-12 w-12 text-indigo-600 mb-4" aria-hidden="true" />
              <span className="text-gray-900 font-medium">Mannschaften verwalten</span>
            </Link>
            
            <Link
              href="/admin/users"
              className="flex flex-col items-center justify-center p-6 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300"
            >
              <UsersIcon className="h-12 w-12 text-indigo-600 mb-4" aria-hidden="true" />
              <span className="text-gray-900 font-medium">Benutzer verwalten</span>
            </Link>
            
            <Link
              href="/admin/leagues"
              className="flex flex-col items-center justify-center p-6 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300"
            >
              <TrophyIcon className="h-12 w-12 text-indigo-600 mb-4" aria-hidden="true" />
              <span className="text-gray-900 font-medium">Ligen verwalten</span>
            </Link>
          </div>
        </div>
      </main>
    </>
  )
}
