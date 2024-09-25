'use client'

import { useState, useEffect } from 'react'
import Navigation from '../../../../components/Navbar'
import Modal from '../../../../components/Modal'
import DeleteConfirmation from '../../../../components/DeleteConfirmation'

interface User {
  id: number
  email: string
  name: string
  isAdmin: boolean
  isSuperAdmin: boolean
  team?: {
    id: number
    name: string
  }
}

interface Team {
  id: number
  name: string
}

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([])
  const [teams, setTeams] = useState<Team[]>([])
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [newUser, setNewUser] = useState({ email: '', name: '', password: '', isAdmin: false, teamId: '' })
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false)
  const [userToDelete, setUserToDelete] = useState<User | null>(null)

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
        body: JSON.stringify(newUser),
      })
      if (response.ok) {
        setNewUser({ email: '', name: '', password: '', isAdmin: false, teamId: '' })
        setIsModalOpen(false)
        fetchUsers()
      }
    } catch (error) {
      console.error('Fehler beim Hinzufügen des Benutzers', error)
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
        }
      } catch (error) {
        console.error('Fehler beim Löschen des Benutzers', error)
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
          onClick={() => setIsModalOpen(true)}
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mb-4"
        >
          Neuen Benutzer hinzufügen
        </button>
        <ul className="bg-white shadow overflow-hidden sm:rounded-md">
          {users.map((user) => (
            <li key={user.id} className="border-b border-gray-200 last:border-b-0">
              <div className="px-4 py-4 sm:px-6 flex justify-between items-center">
                <div>
                  <p className="text-sm font-medium text-indigo-600 truncate">{user.name}</p>
                  <p className="text-sm text-gray-500">{user.email}</p>
                  {user.team && <p className="text-sm text-gray-500">Team: {user.team.name}</p>}
                </div>
                <div className="flex items-center">
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${user.isAdmin ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                    {user.isAdmin ? 'Admin' : 'Benutzer'}
                  </span>
                  {user.isSuperAdmin && (
                    <span className="ml-2 px-2 py-1 text-xs font-medium rounded-full bg-purple-100 text-purple-800">
                      Superadmin
                    </span>
                  )}
                  <button
                    onClick={() => handleDeleteUser(user)}
                    className="ml-2 bg-red-500 hover:bg-red-700 text-white font-bold py-1 px-2 rounded text-xs"
                  >
                    Löschen
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Neuen Benutzer hinzufügen">
        <form onSubmit={handleAddUser} className="space-y-4">
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
            className="w-full px-3 py-2 placeholder-gray-300 border border-gray-300 rounded-md focus:outline-none focus:ring focus:ring-indigo-100 focus:border-indigo-300"
            required
          />
          <input
            type="password"
            value={newUser.password}
            onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
            placeholder="Passwort"
            className="w-full px-3 py-2 placeholder-gray-300 border border-gray-300 rounded-md focus:outline-none focus:ring focus:ring-indigo-100 focus:border-indigo-300"
            required
          />
          <select
            value={newUser.teamId}
            onChange={(e) => setNewUser({ ...newUser, teamId: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring focus:ring-indigo-100 focus:border-indigo-300"
          >
            <option value="">Kein Team</option>
            {teams.map((team) => (
              <option key={team.id} value={team.id}>{team.name}</option>
            ))}
          </select>
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
            className="w-full bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
          >
            Hinzufügen
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
