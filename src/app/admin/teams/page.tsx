'use client'

import { useState, useEffect } from 'react'
import Navigation from '../../../../components/Navbar'
import Modal from '../../../../components/Modal'
import { PencilIcon, TrashIcon } from '@heroicons/react/24/outline'

interface User {
  id: number
  name: string
}

interface Team {
  id: number
  name: string
  location: string
  hallAddress: string
  trainingTimes: string
  teamLeader?: User
}

export default function TeamsPage() {
  const [teams, setTeams] = useState<Team[]>([])
  const [users, setUsers] = useState<User[]>([])
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [newTeam, setNewTeam] = useState<Partial<Team>>({})
  const [editingTeam, setEditingTeam] = useState<Team | null>(null)

  useEffect(() => {
    fetchTeams()
    fetchUsers()
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

  const fetchUsers = async () => {
    try {
      const response = await fetch('/api/users')
      if (response.ok) {
        const data = await response.json()
        setUsers(data)
      }
    } catch (error) {
      console.error('Fehler beim Abrufen der Benutzer', error)
    }
  }

  const handleAddTeam = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const response = await fetch('/api/teams', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newTeam),
      })
      if (response.ok) {
        setNewTeam({})
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
        body: JSON.stringify(newTeam),
      })
      if (response.ok) {
        setNewTeam({})
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
            setNewTeam({})
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
                <div>
                  <p className="text-sm font-medium text-indigo-600 truncate">{team.name}</p>
                  <p className="text-sm text-gray-500">{team.location}</p>
                  <p className="text-sm text-gray-500">{team.hallAddress}</p>
                  <p className="text-sm text-gray-500">Trainingszeiten: {team.trainingTimes}</p>
                  {team.teamLeader && <p className="text-sm text-gray-500">Spielleiter: {team.teamLeader.name}</p>}
                </div>
                <div>
                  <button
                    onClick={() => {
                      setEditingTeam(team)
                      setNewTeam(team)
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
            value={newTeam.name || ''}
            onChange={(e) => setNewTeam({...newTeam, name: e.target.value})}
            placeholder="Mannschaftsname"
            className="w-full px-3 py-2 placeholder-gray-300 border border-gray-300 rounded-md focus:outline-none focus:ring focus:ring-indigo-100 focus:border-indigo-300 mb-2"
          />
          <input
            type="text"
            value={newTeam.location || ''}
            onChange={(e) => setNewTeam({...newTeam, location: e.target.value})}
            placeholder="Ort"
            className="w-full px-3 py-2 placeholder-gray-300 border border-gray-300 rounded-md focus:outline-none focus:ring focus:ring-indigo-100 focus:border-indigo-300 mb-2"
          />
          <input
            type="text"
            value={newTeam.hallAddress || ''}
            onChange={(e) => setNewTeam({...newTeam, hallAddress: e.target.value})}
            placeholder="Adresse der Halle"
            className="w-full px-3 py-2 placeholder-gray-300 border border-gray-300 rounded-md focus:outline-none focus:ring focus:ring-indigo-100 focus:border-indigo-300 mb-2"
          />
          <input
            type="text"
            value={newTeam.trainingTimes || ''}
            onChange={(e) => setNewTeam({...newTeam, trainingTimes: e.target.value})}
            placeholder="Trainingszeiten"
            className="w-full px-3 py-2 placeholder-gray-300 border border-gray-300 rounded-md focus:outline-none focus:ring focus:ring-indigo-100 focus:border-indigo-300 mb-2"
          />
          <select
            value={newTeam.teamLeader?.id || ''}
            onChange={(e) => setNewTeam({...newTeam, teamLeader: { id: parseInt(e.target.value), name: '' }})}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring focus:ring-indigo-100 focus:border-indigo-300 mb-2"
          >
            <option value="">Spielleiter auswählen</option>
            {users.map((user) => (
              <option key={user.id} value={user.id}>{user.name}</option>
            ))}
          </select>
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
