'use client'

import { useState, useEffect } from 'react'
import Navigation from '../../../components/Navbar'
import { useRouter } from 'next/navigation'

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

interface Team {
  id: number
  name: string
}

export default function AdminPage() {
  const [currentUser, setCurrentUser] = useState<User | null>(null)
  const [users, setUsers] = useState<User[]>([])
  const [teams, setTeams] = useState<Team[]>([])
  const [newTeam, setNewTeam] = useState({ name: '' })
  const router = useRouter()

  useEffect(() => {
    fetchCurrentUser()
    fetchUsers()
    fetchTeams()
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

  const fetchUsers = async () => {
    const response = await fetch('/api/users')
    if (response.ok) {
      const data = await response.json()
      setUsers(data)
    }
  }

  const fetchTeams = async () => {
    const response = await fetch('/api/teams')
    if (response.ok) {
      const data = await response.json()
      setTeams(data)
    }
  }

  const handleAddTeam = async (e: React.FormEvent) => {
    e.preventDefault()
    const response = await fetch('/api/teams', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newTeam),
    })
    if (response.ok) {
      setNewTeam({ name: '' })
      fetchTeams()
    }
  }

  const handleUpdateUser = async (userId: number, teamId: string) => {
    const response = await fetch(`/api/users/${userId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ teamId: teamId ? parseInt(teamId) : null }),
    })
    if (response.ok) {
      fetchUsers()
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
            <h2 className="text-lg font-medium leading-6 text-gray-900 mb-4">Teams verwalten</h2>
            <form onSubmit={handleAddTeam} className="mb-6">
              <div className="flex items-center">
                <input
                  type="text"
                  value={newTeam.name}
                  onChange={(e) => setNewTeam({ name: e.target.value })}
                  placeholder="Neues Team"
                  className="mr-2 shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                />
                <button
                  type="submit"
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  Team hinzufügen
                </button>
              </div>
            </form>
            <h2 className="text-lg font-medium leading-6 text-gray-900 mb-4">Benutzer verwalten</h2>
            <ul className="divide-y divide-gray-200">
              {users.map((user) => (
                <li key={user.id} className="py-4 flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-900">{user.name}</p>
                    <p className="text-sm text-gray-500">{user.email}</p>
                  </div>
                  <div className="flex items-center">
                    <select
                      value={user.team?.id || ''}
                      onChange={(e) => handleUpdateUser(user.id, e.target.value)}
                      className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    >
                      <option value="">Kein Team</option>
                      {teams.map((team) => (
                        <option key={team.id} value={team.id}>
                          {team.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </main>
    </>
  )
}
