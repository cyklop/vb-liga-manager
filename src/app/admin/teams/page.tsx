'use client'

import { useState, useEffect } from 'react'
import Navigation from '../../../../components/Navbar'
import Modal from '../../../../components/Modal'
import { PencilIcon, TrashIcon } from '@heroicons/react/24/outline'

interface Team {
  id: number
  name: string
}

export default function TeamsPage() {
  const [teams, setTeams] = useState<Team[]>([])
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [newTeamName, setNewTeamName] = useState('')
  const [editingTeam, setEditingTeam] = useState<Team | null>(null)

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
    try {
      const response = await fetch('/api/teams', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newTeamName }),
      })
      if (response.ok) {
        setNewTeamName('')
        setIsModalOpen(false)
        fetchTeams()
      }
    } catch (error) {
      console.error('Fehler beim Hinzufügen des Teams', error)
    }
  }

  const handleEditTeam = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingTeam) return

    try {
      const response = await fetch(`/api/teams/${editingTeam.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newTeamName }),
      })
      if (response.ok) {
        setNewTeamName('')
        setIsModalOpen(false)
        setEditingTeam(null)
        fetchTeams()
      }
    } catch (error) {
      console.error('Fehler beim Bearbeiten des Teams', error)
    }
  }

  const handleDeleteTeam = async (id: number) => {
    try {
      const response = await fetch(`/api/teams/${id}`, {
        method: 'DELETE',
      })
      if (response.ok) {
        fetchTeams()
      }
    } catch (error) {
      console.error('Fehler beim Löschen des Teams', error)
    }
  }

  return (
    <>
      <Navigation />
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-4">Mannschaften verwalten</h1>
        <button
          onClick={() => {
            setEditingTeam(null)
            setNewTeamName('')
            setIsModalOpen(true)
          }}
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mb-4"
        >
          Neue Mannschaft hinzufügen
        </button>
        <ul className="bg-white shadow overflow-hidden sm:rounded-md">
          {teams.map((team) => (
            <li key={team.id} className="border-b border-gray-200 last:border-b-0">
              <div className="px-4 py-4 sm:px-6 flex justify-between items-center">
                <p className="text-sm font-medium text-indigo-600 truncate">{team.name}</p>
                <div>
                  <button
                    onClick={() => {
                      setEditingTeam(team)
                      setNewTeamName(team.name)
                      setIsModalOpen(true)
                    }}
                    className="mr-2 text-indigo-600 hover:text-indigo-900"
                  >
                    <PencilIcon className="h-5 w-5" />
                  </button>
                  <button
                    onClick={() => handleDeleteTeam(team.id)}
                    className="text-red-600 hover:text-red-900"
                  >
                    <TrashIcon className="h-5 w-5" />
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingTeam ? "Mannschaft bearbeiten" : "Neue Mannschaft hinzufügen"}>
        <form onSubmit={editingTeam ? handleEditTeam : handleAddTeam}>
          <input
            type="text"
            value={newTeamName}
            onChange={(e) => setNewTeamName(e.target.value)}
            placeholder="Mannschaftsname"
            className="w-full px-3 py-2 placeholder-gray-300 border border-gray-300 rounded-md focus:outline-none focus:ring focus:ring-indigo-100 focus:border-indigo-300"
          />
          <button
            type="submit"
            className="mt-4 w-full bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
          >
            {editingTeam ? "Aktualisieren" : "Hinzufügen"}
          </button>
        </form>
      </Modal>
    </>
  )
}
