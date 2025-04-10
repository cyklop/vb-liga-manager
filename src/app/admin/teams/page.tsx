'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation' // Import useRouter
import Navigation from '@/components/Navbar'
import Modal from '@/components/Modal'
import DeleteConfirmation from '@/components/DeleteConfirmation' // Import hinzufügen
import { PencilIcon, TrashIcon } from '@heroicons/react/24/outline'
import { toast } from 'react-toastify';

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
  const router = useRouter() // Initialize router
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
  // State für Löschbestätigung hinzufügen
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false)
  const [teamToDelete, setTeamToDelete] = useState<Team | null>(null)

  const [currentUser, setCurrentUser] = useState<User | null>(null)
  const [isAdmin, setIsAdmin] = useState(false)
  const [userTeamId, setUserTeamId] = useState<number | null>(null)

  useEffect(() => {
    const init = async () => {
      await fetchCurrentUser()
      fetchTeams()
      fetchUsers()
    }
    init()
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
        
        // Prüfen, ob der aktuelle Benutzer ein Admin ist
        const isUserAdmin = currentUser?.isAdmin || currentUser?.isSuperAdmin
        
        // Wenn kein Admin, dann nur das eigene Team anzeigen
        if (!isUserAdmin && currentUser?.team?.id) {
          const filteredTeams = data.filter((team: Team) => team.id === currentUser.team?.id)
          setTeams(filteredTeams)
        } else {
          // Für Admins oder Super-Admins alle Teams anzeigen
          setTeams(data)
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
        toast.success('Mannschaft erfolgreich hinzugefügt!');
      } else {
        const errorData = await response.json();
        toast.error(`Fehler: ${errorData.message || 'Mannschaft konnte nicht hinzugefügt werden.'}`);
      }
    } catch (error) {
      console.error('Fehler beim Hinzufügen des Teams', error)
      toast.error('Ein Netzwerk- oder Serverfehler ist aufgetreten.');
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
        toast.success('Mannschaft erfolgreich aktualisiert!');
      } else {
        const errorData = await response.json();
        toast.error(`Fehler: ${errorData.message || 'Mannschaft konnte nicht aktualisiert werden.'}`);
      }
    } catch (error) {
      console.error('Fehler beim Bearbeiten des Teams', error)
      toast.error('Ein Netzwerk- oder Serverfehler ist aufgetreten.');
    }
  }

  // Funktion, um den Löschdialog zu öffnen
  const requestDeleteTeam = (team: Team) => {
    setTeamToDelete(team)
    setShowDeleteConfirmation(true)
  }

  // Funktion, die die Löschung nach Bestätigung durchführt
  const confirmDeleteTeam = async () => {
    if (teamToDelete) {
      try {
        const response = await fetch(`/api/teams/${teamToDelete.id}`, {
          method: 'DELETE',
        })
        if (response.ok) {
          fetchTeams() // Liste nach erfolgreichem Löschen neu laden
          toast.success(`Mannschaft '${teamToDelete.name}' erfolgreich gelöscht!`);
        } else {
          const errorText = await response.text();
          console.error('Fehler beim Löschen des Teams:', errorText)
          toast.error(`Fehler: ${errorText || 'Mannschaft konnte nicht gelöscht werden.'}`);
        }
      } catch (error) {
        console.error('Fehler beim Löschen des Teams', error)
        toast.error('Ein Netzwerk- oder Serverfehler ist aufgetreten.');
      } finally {
        // Dialog schließen und State zurücksetzen
        setShowDeleteConfirmation(false)
        setTeamToDelete(null)
      }
    }
  }

  // Funktion zum Abbrechen des Löschvorgangs
  const cancelDeleteTeam = () => {
    setShowDeleteConfirmation(false)
    setTeamToDelete(null)
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
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mb-4 dark:bg-blue-600 dark:hover:bg-blue-800"
          >
            Neue Mannschaft hinzufügen
          </button>
        )}
        <ul className="bg-white dark:bg-card shadow overflow-hidden sm:rounded-md">
          {teams.map((team) => (
            <li key={team.id} className="border-b border-gray-200 dark:border-border last:border-b-0">
              <div className="px-4 py-4 sm:px-6 flex justify-between items-center">
                <div>
                  <p className="text-sm font-medium text-indigo-600 dark:text-indigo-400 truncate">{team.name}</p>
                  <p className="text-sm text-gray-500 dark:text-foreground">{team.location}</p>
                  <p className="text-sm text-gray-500 dark:text-foreground">{team.hallAddress}</p>
                  <p className="text-sm text-gray-500 dark:text-foreground">Trainingszeiten: {team.trainingTimes}</p>
                  {team.teamLeader && <p className="text-sm text-gray-500 dark:text-foreground">Spielleiter: {team.teamLeader.name}</p>}
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
                    className="p-1 text-indigo-600 hover:text-indigo-900 hover:bg-indigo-100 rounded dark:text-foreground dark:hover:bg-muted mr-2"
                    title="Mannschaft bearbeiten"
                  >
                    <PencilIcon className="h-5 w-5" />
                  </button>
                  {isAdmin && (
                    <button
                      // onClick anpassen, um den Dialog zu öffnen
                      onClick={() => requestDeleteTeam(team)}
                      className="p-1 text-red-600 hover:text-red-900 hover:bg-red-100 rounded dark:text-red-400 dark:hover:bg-red-900/20"
                      title="Mannschaft löschen"
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
            className="mt-4 w-full bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded dark:bg-blue-600 dark:hover:bg-blue-800"
          >
            {editingTeam ? "Aktualisieren" : "Hinzufügen"}
          </button>
        </form>
      </Modal>
      {/* DeleteConfirmation Komponente hinzufügen */}
      {showDeleteConfirmation && teamToDelete && (
        <DeleteConfirmation
          onConfirm={confirmDeleteTeam}
          onCancel={cancelDeleteTeam}
          message={`Möchten Sie die Mannschaft ${teamToDelete.name} wirklich löschen?`}
        />
      )}
    </>
  )
}
