'use client'

import { useState, useEffect } from 'react'
import Navigation from '../../../../components/Navbar'
import Modal from '../../../../components/Modal'
import { PencilIcon, TrashIcon } from '@heroicons/react/24/outline'

interface User {
  id: number
  name: string
  isAdmin?: boolean
  isSuperAdmin?: boolean
  team?: {
    id: number
    name: string
  }
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
  // Use a separate state for form data, including teamLeaderId
  interface TeamFormData {
    id?: number;
    name?: string;
    location?: string;
    hallAddress?: string;
    trainingTimes?: string;
    teamLeaderId?: string; // Use string for select compatibility
  }
  const [formData, setFormData] = useState<TeamFormData>({})
  const [editingTeam, setEditingTeam] = useState<Team | null>(null)

  const [currentUser, setCurrentUser] = useState<User | null>(null)
  const [isAdmin, setIsAdmin] = useState(false)
  const [userTeamId, setUserTeamId] = useState<number | null>(null)

  useEffect(() => {
    fetchCurrentUser()
    fetchTeams()
    fetchUsers()
  }, [])

  const fetchCurrentUser = async () => {
    try {
      const response = await fetch('/api/users/me')
      if (response.ok) {
        const user = await response.json()
        setCurrentUser(user)
        setIsAdmin(user.isAdmin || user.isSuperAdmin)
        setUserTeamId(user.team?.id || null)
        
        // Wenn kein Admin und kein Team, zur Dashboard-Seite umleiten
        if (!user.isAdmin && !user.isSuperAdmin && !user.team) {
          router.push('/dashboard')
        }
      }
    } catch (error) {
      console.error('Fehler beim Abrufen des aktuellen Benutzers', error)
    }
  }

  const fetchTeams = async () => {
    try {
      const response = await fetch('/api/teams')
      if (response.ok) {
        const data = await response.json()
        
        // Wenn kein Admin, dann nur das eigene Team anzeigen
        if (!isAdmin && userTeamId) {
          const filteredTeams = data.filter((team: Team) => team.id === userTeamId)
          setTeams(filteredTeams)
        } else if (isAdmin) {
          setTeams(data)
        } else {
          setTeams([])
        }
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
        // Send data from formData, converting teamLeaderId to number
        body: JSON.stringify({
          ...formData,
          teamLeaderId: formData.teamLeaderId ? parseInt(formData.teamLeaderId) : null
        }),
      })
      if (response.ok) {
        setFormData({}) // Reset form data state
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
        // Send data from formData, converting teamLeaderId to number
        body: JSON.stringify({
          ...formData,
          teamLeaderId: formData.teamLeaderId ? parseInt(formData.teamLeaderId) : null
        }),
      })
      if (response.ok) {
        setFormData({}) // Reset form data state
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
        <h1 className="text-2xl font-bold mb-4">
          {isAdmin ? "Mannschaften verwalten" : "Meine Mannschaft"}
        </h1>
        {isAdmin && (
          <button
            onClick={() => {
              setEditingTeam(null)
              setFormData({}) // Reset form data for adding new team
              setIsModalOpen(true)
            }}
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mb-4"
          >
            Neue Mannschaft hinzufügen
          </button>
        )}
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
                      // Populate formData from the selected team for editing
                      setFormData({
                        id: team.id,
                        name: team.name || '',
                        location: team.location || '',
                        hallAddress: team.hallAddress || '',
                        trainingTimes: team.trainingTimes || '',
                        teamLeaderId: team.teamLeader?.id?.toString() || '' // Set teamLeaderId as string
                      })
                      setIsModalOpen(false) // Close modal first if already open from another edit
                      setTimeout(() => setIsModalOpen(true), 0) // Then open with new data
                    }}
                    className="mr-2 text-indigo-600 hover:text-indigo-900"
                  >
                    <PencilIcon className="h-5 w-5" />
                  </button>
                  {isAdmin && (
                    <button
                      onClick={() => handleDeleteTeam(team.id)}
                      className="text-red-600 hover:text-red-900"
                    >
                      <TrashIcon className="h-5 w-5" />
                    </button>
                  )}
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>
      <Modal isOpen={isModalOpen} onClose={() => { setIsModalOpen(false); setFormData({}); setEditingTeam(null); }} title={editingTeam ? "Mannschaft bearbeiten" : "Neue Mannschaft hinzufügen"}>
        <form onSubmit={editingTeam ? handleEditTeam : handleAddTeam}>
          {/* Bind inputs to formData state */}
          <input
            type="text"
            value={formData.name || ''}
            onChange={(e) => setFormData({...formData, name: e.target.value})}
            placeholder="Mannschaftsname"
            className="w-full px-3 py-2 placeholder-gray-300 border border-gray-300 rounded-md focus:outline-none focus:ring focus:ring-indigo-100 focus:border-indigo-300 mb-2"
            required // Add required attribute if name is mandatory
          />
          <input
            type="text"
            value={formData.location || ''}
            onChange={(e) => setFormData({...formData, location: e.target.value})}
            placeholder="Ort"
            className="w-full px-3 py-2 placeholder-gray-300 border border-gray-300 rounded-md focus:outline-none focus:ring focus:ring-indigo-100 focus:border-indigo-300 mb-2"
          />
          <input
            type="text"
            value={formData.hallAddress || ''}
            onChange={(e) => setFormData({...formData, hallAddress: e.target.value})}
            placeholder="Adresse der Halle"
            className="w-full px-3 py-2 placeholder-gray-300 border border-gray-300 rounded-md focus:outline-none focus:ring focus:ring-indigo-100 focus:border-indigo-300 mb-2"
          />
          <input
            type="text"
            value={formData.trainingTimes || ''}
            onChange={(e) => setFormData({...formData, trainingTimes: e.target.value})}
            placeholder="Trainingszeiten"
            className="w-full px-3 py-2 placeholder-gray-300 border border-gray-300 rounded-md focus:outline-none focus:ring focus:ring-indigo-100 focus:border-indigo-300 mb-2"
          />
          {/* Bind select to formData.teamLeaderId */}
          <select
            value={formData.teamLeaderId || ''}
            onChange={(e) => setFormData({...formData, teamLeaderId: e.target.value})}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring focus:ring-indigo-100 focus:border-indigo-300 mb-2"
          >
            <option value="">Spielleiter auswählen (optional)</option>
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
