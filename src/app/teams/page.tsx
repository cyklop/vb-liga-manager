'use client'

import { useState, useEffect } from 'react'
import Navigation from '../../../components/Navbar'

interface Team {
  id: number
  name: string
}

export default function TeamsPage() {
  const [teams, setTeams] = useState<Team[]>([])
  const [newTeam, setNewTeam] = useState('')

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

  const handleAddTeam = async (e: React.FormEvent) => {
    e.preventDefault()
    if (newTeam) {
      try {
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
      } catch (error) {
        console.error('Fehler beim Hinzufügen des Teams', error)
      }
    }
  }

  return (
    <>
      <Navigation />
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-4">Teams verwalten</h1>
        <form onSubmit={handleAddTeam} className="mb-4">
          <input
            type="text"
            value={newTeam}
            onChange={(e) => setNewTeam(e.target.value)}
            placeholder="Neues Team"
            className="px-3 py-2 border rounded mr-2"
          />
          <button type="submit" className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
            Hinzufügen
          </button>
        </form>
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
