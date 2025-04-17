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

  // Removed useEffect hook that fetched current user (middleware handles auth)
  // useEffect(() => {
  //   fetchUsers()
  //   fetchTeams()
  // }, [])

  // Fetch data directly when component mounts or when needed
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
          className="btn btn-primary"
        >
          Neuen Benutzer hinzufügen
        </button>
        {/* Use DaisyUI card styling for the list container */}
        <div className="card bg-base-100 shadow-xl mt-4"> 
          <div className="card-body p-0"> {/* Remove padding from card-body if list items have padding */}
            <ul className="divide-y divide-base-300"> {/* Use DaisyUI divider */}
              {users.map((user) => (
                <li key={user.id} className="hover:bg-base-200 transition-colors duration-150"> {/* Add hover effect */}
                  <div className="px-4 py-4 sm:px-6 flex justify-between items-center">
                    <div>
                      <p className="text-md font-medium truncate">{user.name}</p> {/* Slightly larger text */}
                  <p className="text-sm">{user.email}</p>
                  {user.teams && user.teams.length > 0 && (
                    <p className="text-sm">
                      Teams: {user.teams.map(team => team.name).join(', ')}
                    </p>
                  )}
                </div>
                <div className="flex items-center">
                  <span className={`badge badge-dash  ${user.isAdmin ? 'badge-primary' : 'badge-secondary'}`}>
                    {user.isAdmin ? 'Admin' : 'Benutzer'}
                  </span>
                  
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
                    className="p-1 btn btn-sm btn-secondary btn-soft ml-2"
                    title="Benutzer bearbeiten"
                  >
                    <PencilIcon className="h-5 w-5" />
                  </button>
                  <button
                    onClick={() => handleDeleteUser(user)}
                    className="p-1 btn btn-sm btn-error btn-soft  ml-2"
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
          <label htmlFor="email" className='floating-label'>
            <span>E-Mail</span>
            <input
              type="email"
              value={newUser.email}
              onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
              placeholder="E-Mail"
              className="w-full mt-2 px-3 py-2 input"
              required
            />
          </label> 
          
          <label htmlFor="name" className='floating-label'>
            <span>Name</span>
            <input
              type="text"
              value={newUser.name}
              onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
              placeholder="Name"
              className="w-full px-3 py-2 input" // Dark mode styles hinzugefügt
              required
            />
          </label> 
          {/* Passwortfeld entfernt */}
          <div className="w-full">
            <label className="block text-sm font-medium mb-1">Teams</label> {/* Dark mode styles hinzugefügt */}
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
                    className="h-4 w-4 checkbox checkbox-primary checkbox-xs"
                  />
                  <label htmlFor={`team-${team.id}`} className="ml-2 block text-sm">
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
              className="checkbox checkbox-sm checkbox-primary"
            />
            <label htmlFor="isAdmin" className="ml-2 block">
              Admin
            </label>
          </div>
          {/* Modal Actions */}
          <div className="modal-action mt-6">
            <button
              type="button"
              className="btn btn-ghost"
              onClick={() => {
                setIsModalOpen(false);
                // Reset state when cancelling
                setNewUser({ id: 0, email: '', name: '', isAdmin: false, teamIds: [] });
                setIsEditing(false);
              }}
            >
              Abbrechen
            </button>
            <button
              type="submit"
              className="btn btn-primary" // Removed w-full
            >
              {isEditing ? "Aktualisieren" : "Hinzufügen"}
            </button>
          </div>
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
