'use client'

import { useState, useEffect } from 'react'
import Navigation from '@/components/Navbar'
import Link from 'next/link'
import {
  TableCellsIcon, 
  CalendarIcon, 
  UserIcon, 
  UsersIcon, 
  UserGroupIcon, 
  TrophyIcon,
  BuildingOfficeIcon,
} from '@heroicons/react/24/outline';
// Importiere den zentralen User-Typ
import type { UserProfile } from '@/types/models';

// Lokales User Interface entfernt

const navigation = [
  { name: 'Tabelle', href: '/table', icon: TableCellsIcon },
  { name: 'Spielplan', href: '/fixtures', icon: CalendarIcon },
  { name: 'Meine Mannschaft', href: '/team', icon: BuildingOfficeIcon },
  { name: 'Mein Konto', href: '/account', icon: UserIcon },
]

const adminNavigation = [
  { name: 'Mannschaften verwalten', href: '/admin/teams', icon: UserGroupIcon },
  { name: 'Benutzer verwalten', href: '/admin/users', icon: UsersIcon },
  { name: 'Ligen verwalten', href: '/admin/leagues', icon: TrophyIcon },
];

export default function Dashboard() {
  // Verwende den importierten Typ
  const [user, setUser] = useState<UserProfile | null>(null);

  useEffect(() => {
    fetchUser();
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
      <header className="shadow">
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        </div>
      </header>
      <main>
        <div className="mx-auto max-w-7xl py-6 sm:px-6 lg:px-8">
          <div className="px-4 py-6 sm:px-0">
            <h2 className="text-2xl font-bold mb-6">Willkommen, {user?.name}!</h2>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className="flex flex-col items-center justify-center p-6 bg-base-100 rounded-box shadow-md hover:shadow-lg transition-shadow duration-300"
                >
                  <item.icon className="h-12 w-12 mb-4" aria-hidden="true" />
                  <span className="font-medium">{item.name}</span>
                </Link>
              ))}
            </div>
            
            {user?.isAdmin && (
              <>
                <h3 className="text-xl font-semibold mt-10 mb-6">Admin-Bereich</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                  {adminNavigation.map((item) => (
                    <Link
                      key={item.name}
                      href={item.href}
                      className="flex flex-col items-center justify-center p-6 bg-base-100 rounded-box shadow-md hover:shadow-lg transition-shadow duration-300"
                    >
                      <item.icon className="h-12 w-12 mb-4" aria-hidden="true" />
                      <span className="font-medium">{item.name}</span>
                    </Link>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      </main>
    </>
  )
}
