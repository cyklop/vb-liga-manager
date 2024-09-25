'use client'

import { useState, useEffect } from 'react'
import Navigation from '../../../components/Navigation'

interface Team {
  id: number
  name: string
}

export default function Teams() {
  const [teams, setTeams] = useState<Team[]>([])
  const [newTeam, setNewTeam] = useState('')

  useEffect(() => {
    fetchTeams()
  }, [])

  const fetchTeams = async () => {
    const response = await fetch('/api/teams')
    const data = await response.json()
    setTeams(data)
  }

  const handleAddTeam = async (e: React.FormEvent) => {
    e.preventDefault()
    if (newTeam) {
      const response = await fetch('/api/teams', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name: newTeam }),
      })
      if (response.ok) {
        setNewTeam('')
        fetchTeams()
      }
    }
  }

  return (
    <>
      <Navigation />
      <header className="bg-white shadow">
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">Mannschaften verwalten</h1>
        </div>
      </header>
      <main>
        <div className="mx-auto max-w-7xl py-6 sm:px-6 lg:px-8">
          <div className="px-4 py-6 sm:px-0">
            <div className="rounded-lg border-4 border-dashed border-gray-200 p-4">
              <h2 className="text-2xl font-bold mb-4">Mannschaft hinzufügen</h2>
              <form onSubmit={handleAddTeam} className="flex gap-2 mb-4">
                <input
                  type="text"
                  value={newTeam}
                  onChange={(e) => setNewTeam(e.target.value)}
                  placeholder="Neue Mannschaft"
                  className="flex-grow px-3 py-2 border rounded"
                />
                <button type="submit" className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
                  Hinzufügen
                </button>
              </form>
              <ul className="space-y-2">
                {teams.map((team) => (
                  <li key={team.id} className="flex items-center justify-between bg-white p-3 rounded shadow">
                    <span>{team.name}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </main>
    </>
  )
}
'use client'

import { useState, useEffect } from 'react'
import Navigation from '../../../components/Navbar'

interface Team {
  id: number
  name: string
}

export default function TeamsPage() {
  const [teams, setTeams] = useState<Team[]>([])

  useEffect(() => {
    fetchTeams()
  }, [])

  const fetchTeams = async () => {
    try {
      const response = await fetch('/api/teams')
      if (response.ok) {
        const data = await response.json()
        setTeams(data)
      }
    } catch (error) {
      console.error('Fehler beim Abrufen der Teams', error)
    }
  }

  return (
    <>
      <Navigation />
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-4">Teams</h1>
        <ul className="bg-white shadow overflow-hidden sm:rounded-md">
          {teams.map((team) => (
            <li key={team.id} className="border-b border-gray-200 last:border-b-0">
              <div className="px-4 py-4 sm:px-6">
                <p className="text-sm font-medium text-indigo-600 truncate">{team.name}</p>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </>
  )
}
