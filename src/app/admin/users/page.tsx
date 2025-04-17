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
        <div className="card bg-base-100 shadow-xl mt-4">
          <div className="card-body p-0">
            <ul className="divide-y divide-base-300">
              {users.map((user) => (
                <li key={user.id} className="hover:bg-base-200 transition-colors duration-150">
                  <div className="px-4 py-4 sm:px-6 flex justify-between items-center">
                    <div>
                      <p className="text-md font-medium truncate">{user.name}</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">{user.email}</p>
                      {user.teams && user.teams.length > 0 && (
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                          Teams: {user.teams.map(team => team.name).join(', ')}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className={`badge ${user.isAdmin ? 'badge-primary' : 'badge-secondary'}`}>
                        {user.isAdmin ? 'Admin' : 'Benutzer'}
                      </span>
                      <button
                        onClick={() => {
                          const teamIds = user.teams ? user.teams.map(team => team.id) : [];
                          const { ...userData } = user;
                          setNewUser({ ...userData, teamIds })
                          setIsEditing(true)
                          setIsModalOpen(true)
                        }}
                        className="btn btn-ghost btn-sm btn-square"
                        title="Benutzer bearbeiten"
                      >
                        <PencilIcon className="h-5 w-5" />
                      </button>
                      <button
                        onClick={() => handleDeleteUser(user)}
                        className="btn btn-ghost btn-sm btn-square text-error"
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
        </div>
        <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={isEditing ? "Benutzer bearbeiten" : "Neuen Benutzer hinzufügen"}>
          <form onSubmit={isEditing ? handleEditUser : handleAddUser} className="space-y-4">
            {/* Floating Label for Email */}
            <label className="floating-label w-full">
              <input
                type="email"
                id="email"
                value={newUser.email}
                onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                placeholder="E-Mail" // Placeholder is important for floating label
                className="input input-bordered w-full" // Keep input-bordered for styling
                required
              />
              <span>E-Mail</span> {/* Label text */}
            </label>
            {/* Floating Label for Name */}
            <label className="floating-label w-full">
              <input
                type="text"
                id="name"
                value={newUser.name}
                onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                placeholder="Name" // Placeholder is important for floating label
                className="input input-bordered w-full" // Keep input-bordered for styling
                required
              />
              <span>Name</span> {/* Label text */}
              </div>
              <input
                type="text"
                id="name"
                value={newUser.name}
                onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                placeholder="Name"
                className="input input-bordered w-full"
                required
              />
            </label>
            <div className="form-control w-full">
              <label className="label">
                <span className="label-text">Teams</span>
              </label>
              <div className="max-h-40 overflow-y-auto border border-base-300 rounded-box p-2 bg-base-100">
                {teams.map((team) => (
                  <div key={team.id} className="form-control">
                    <label className="label cursor-pointer justify-start space-x-3">
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
                        className="checkbox checkbox-primary checkbox-sm"
                      />
                      <span className="label-text">{team.name}</span>
                    </label>
                  </div>
                ))}
              </div>
            </div>
            <div className="form-control">
              <label className="label cursor-pointer justify-start space-x-3">
                <input
                  type="checkbox"
                  id="isAdmin"
                  checked={newUser.isAdmin}
                  onChange={(e) => setNewUser({ ...newUser, isAdmin: e.target.checked })}
                  className="checkbox checkbox-sm checkbox-primary"
                />
                <span className="label-text">Admin</span>
              </label>
            </div>
            <div className="modal-action mt-6">
              <button
                type="button"
                className="btn btn-ghost"
                onClick={() => {
                  setIsModalOpen(false);
                  setNewUser({ id: 0, email: '', name: '', isAdmin: false, teamIds: [] });
                  setIsEditing(false);
                }}
              >
                Abbrechen
              </button>
              <button
                type="submit"
                className="btn btn-primary"
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
      </div>
    </>
  )
}
