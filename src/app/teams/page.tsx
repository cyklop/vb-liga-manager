'use client'

import { useState } from 'react'
import Navigation from '../../../components/Navigation';

export default function Teams() {
  const [teams, setTeams] = useState<string[]>([])
  const [newTeam, setNewTeam] = useState('')

  const handleAddTeam = (e: React.FormEvent) => {
    e.preventDefault()
    if (newTeam) {
      setTeams([...teams, newTeam])
      setNewTeam('')
    }
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <Navigation />
      <main className="container mx-auto p-4">
        <h1 className="text-3xl font-bold mb-8">Mannschaften verwalten</h1>
        
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-4">Mannschaft hinzufügen</h2>
          <form onSubmit={handleAddTeam} className="flex gap-2">
            <input
              type="text"
              value={newTeam}
              onChange={(e) => setNewTeam(e.target.value)}
              placeholder="Neue Mannschaft"
              className="flex-grow px-3 py-2 border rounded"
            />
            <button type="submit" className="px-4 py-2 bg-blue-500 text-white rounded">
              Hinzufügen
            </button>
          </form>
          <ul className="mt-4 list-disc list-inside">
            {teams.map((team, index) => (
              <li key={index}>{team}</li>
            ))}
          </ul>
        </div>
      </main>
    </div>
  )
}
