'use client'

import { useState, useEffect } from 'react'
import Navigation from '@/components/Navbar'
import Modal from '@/components/Modal'
import DeleteConfirmation from '@/components/DeleteConfirmation'
import { PencilIcon, TrashIcon } from '@heroicons/react/24/outline'
import { toast } from 'react-toastify';

interface User {
  id: number
  email: string
  name: string
  isAdmin: boolean
  isSuperAdmin: boolean
  teams?: {
    id: number
    name: string
  }[]
}

interface Team {
  id: number
  name: string
}

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([])
  const [teams, setTeams] = useState<Team[]>([])
  const [isModalOpen, setIsModalOpen] = useState(false)
  // Passwort aus dem initialen State entfernt
  const [newUser, setNewUser] = useState({ id: 0, email: '', name: '', isAdmin: false, teamIds: [] as number[] })
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false)
  const [userToDelete, setUserToDelete] = useState<User | null>(null)
  const [isEditing, setIsEditing] = useState(false)

  useEffect(() => {
    fetchUsers()
    fetchTeams()
  }, [])

  const fetchUsers = async () => {
    const response = await fetch('/api/users')
    const data = await response.json()
    setUsers(data)
  }

  const fetchTeams = async () => {
    const response = await fetch('/api/teams')
    const data = await response.json()
    setTeams(data)
  }

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const response = await fetch('/api/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        // Passwort wird nicht mehr gesendet
        body: JSON.stringify({
          email: newUser.email,
          name: newUser.name,
          isAdmin: newUser.isAdmin,
          teamIds: newUser.teamIds,
        }),
      })
      if (response.ok) {
        // Reset ohne Passwort
        setNewUser({ id: 0, email: '', name: '', isAdmin: false, teamIds: [] })
        setIsModalOpen(false)
        fetchUsers()
        toast.success('Benutzer erfolgreich hinzugefügt und E-Mail versendet!');
      } else {
        const errorData = await response.json();
        toast.error(`Fehler: ${errorData.message || 'Benutzer konnte nicht hinzugefügt werden.'}`);
      }
    } catch (error) {
      console.error('Fehler beim Hinzufügen des Benutzers', error)
      toast.error('Ein Netzwerk- oder Serverfehler ist aufgetreten.');
    }
  }

  const handleEditUser = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const response = await fetch(`/api/users/${newUser.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        // Passwort wird nicht mehr gesendet
        // Sende nur die relevanten Daten für das Update
        body: JSON.stringify({
          email: newUser.email,
          name: newUser.name,
          isAdmin: newUser.isAdmin,
          teamIds: newUser.teamIds,
        }),
      })
      if (response.ok) {
        // Reset ohne Passwort
        setNewUser({ id: 0, email: '', name: '', isAdmin: false, teamIds: [] })
        setIsModalOpen(false)
        setIsEditing(false)
        fetchUsers()
        toast.success('Benutzer erfolgreich aktualisiert!');
      } else {
        const errorData = await response.json();
        toast.error(`Fehler: ${errorData.message || 'Benutzer konnte nicht aktualisiert werden.'}`);
      }
    } catch (error) {
      console.error('Fehler beim Bearbeiten des Benutzers', error)
      toast.error('Ein Netzwerk- oder Serverfehler ist aufgetreten.');
    }
  }

  const handleDeleteUser = async (user: User) => {
    setUserToDelete(user)
    setShowDeleteConfirmation(true)
  }

  const confirmDelete = async () => {
    if (userToDelete) {
      try {
        const response = await fetch(`/api/users/${userToDelete.id}`, {
          method: 'DELETE',
        })
        if (response.ok) {
          fetchUsers()
          toast.success(`Benutzer '${userToDelete.name}' erfolgreich gelöscht!`);
        } else {
          const errorData = await response.json();
          toast.error(`Fehler: ${errorData.message || 'Benutzer konnte nicht gelöscht werden.'}`);
        }
      } catch (error) {
        console.error('Fehler beim Löschen des Benutzers', error)
        toast.error('Ein Netzwerk- oder Serverfehler ist aufgetreten.');
      }
    }
    setShowDeleteConfirmation(false)
    setUserToDelete(null)
  }

  return (
    <>
      <Navigation />
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-4">Benutzer verwalten</h1>
        <button
          onClick={() => {
            // Reset ohne Passwort
            setNewUser({ id: 0, email: '', name: '', isAdmin: false, teamIds: [] })
            setIsEditing(false)
            setIsModalOpen(true)
          }}
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mb-4 dark:bg-blue-600 dark:hover:bg-blue-800"
        >
          Neuen Benutzer hinzufügen
        </button>
        <ul className="bg-white dark:bg-card shadow overflow-hidden sm:rounded-md">
          {users.map((user) => (
            <li key={user.id} className="border-b border-gray-200 dark:border-border last:border-b-0">
              <div className="px-4 py-4 sm:px-6 flex justify-between items-center">
                <div>
                  <p className="text-sm font-medium text-indigo-600 dark:text-indigo-400 truncate">{user.name}</p>
                  <p className="text-sm text-gray-500 dark:text-foreground">{user.email}</p>
                  {user.teams && user.teams.length > 0 && (
                    <p className="text-sm text-gray-500 dark:text-foreground">
                      Teams: {user.teams.map(team => team.name).join(', ')}
                    </p>
                  )}
                </div>
                <div className="flex items-center">
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${user.isAdmin ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'}`}>
                    {user.isAdmin ? 'Admin' : 'Benutzer'}
                  </span>
                  {user.isSuperAdmin && (
                    <span className="ml-2 px-2 py-1 text-xs font-medium rounded-full bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400">
                      Superadmin
                    </span>
                  )}
                  <button
                    onClick={() => {
                      // Konvertiere das teams-Array in ein teamIds-Array für das Formular
                      const teamIds = user.teams ? user.teams.map(team => team.id) : [];
                      // Setze State ohne Passwort (Passwort ist im User-Objekt nicht vorhanden)
                      const { ...userData } = user; // 'password' Destrukturierung entfernt
                      setNewUser({ ...userData, teamIds })
                      setIsEditing(true)
                      setIsModalOpen(true)
                    }}
                    className="p-1 text-indigo-600 hover:text-indigo-900 hover:bg-indigo-100 rounded dark:text-foreground dark:hover:bg-muted ml-2"
                    title="Benutzer bearbeiten"
                  >
                    <PencilIcon className="h-5 w-5" />
                  </button>
                  <button
                    onClick={() => handleDeleteUser(user)}
                    className="p-1 text-red-600 hover:text-red-900 hover:bg-red-100 rounded dark:text-red-400 dark:hover:bg-red-900/20 ml-2"
                    title="Benutzer löschen"
                  >
                    <TrashIcon className="h-5 w-5" />
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={isEditing ? "Benutzer bearbeiten" : "Neuen Benutzer hinzufügen"}>
        <form onSubmit={isEditing ? handleEditUser : handleAddUser} className="space-y-4">
          <input
            type="email"
            value={newUser.email}
            onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
            placeholder="E-Mail"
            className="w-full px-3 py-2 placeholder-gray-300 border border-gray-300 rounded-md focus:outline-none focus:ring focus:ring-indigo-100 focus:border-indigo-300"
            required
          />
          <input
            type="text"
            value={newUser.name}
            onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
            placeholder="Name"
            className="w-full px-3 py-2 placeholder-gray-300 border border-gray-300 rounded-md focus:outline-none focus:ring focus:ring-indigo-100 focus:border-indigo-300 dark:bg-input dark:border-border dark:text-foreground" // Dark mode styles hinzugefügt
            required
          />
          {/* Passwortfeld entfernt */}
          <div className="w-full">
            <label className="block text-sm font-medium text-gray-700 mb-1 dark:text-gray-300">Teams</label> {/* Dark mode styles hinzugefügt */}
            <div className="max-h-40 overflow-y-auto border border-gray-300 rounded-md p-2 dark:border-border"> {/* Dark mode styles hinzugefügt */}
              {teams.map((team) => (
                <div key={team.id} className="flex items-center mb-2">
                  <input
                    type="checkbox"
                    id={`team-${team.id}`}
                    checked={newUser.teamIds?.includes(team.id) || false}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setNewUser({ 
                          ...newUser, 
                          teamIds: [...newUser.teamIds, team.id] 
                        });
                      } else {
                        setNewUser({ 
                          ...newUser, 
                          teamIds: newUser.teamIds.filter(id => id !== team.id) 
                        });
                      }
                    }}
                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                  />
                  <label htmlFor={`team-${team.id}`} className="ml-2 block text-sm text-gray-900">
                    {team.name}
                  </label>
                </div>
              ))}
            </div>
          </div>
          <div className="flex items-center">
            <input
              type="checkbox"
              id="isAdmin"
              checked={newUser.isAdmin}
              onChange={(e) => setNewUser({ ...newUser, isAdmin: e.target.checked })}
              className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
            />
            <label htmlFor="isAdmin" className="ml-2 block text-sm text-gray-900">
              Admin
            </label>
          </div>
          <button
            type="submit"
            className="w-full bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded dark:bg-blue-600 dark:hover:bg-blue-800"
          >
            {isEditing ? "Aktualisieren" : "Hinzufügen"}
          </button>
        </form>
      </Modal>
      {showDeleteConfirmation && (
        <DeleteConfirmation
          onConfirm={confirmDelete}
          onCancel={() => setShowDeleteConfirmation(false)}
          message={`Möchten Sie den Benutzer ${userToDelete?.name} wirklich löschen?`}
        />
      )}
    </>
  )
}
