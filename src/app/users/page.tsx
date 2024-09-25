'use client'

import { useState, useEffect } from 'react'
import Navigation from '../../../components/Navigation'
import DeleteConfirmation from '../../../components/DeleteConfirmation'

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

export default function Users() {
  const [users, setUsers] = useState<User[]>([])
  const [newUser, setNewUser] = useState({ email: '', name: '', isAdmin: false })
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false)
  const [userToDelete, setUserToDelete] = useState<User | null>(null)

  useEffect(() => {
    fetchUsers()
  }, [])

  const fetchUsers = async () => {
    const response = await fetch('/api/users')
    const data = await response.json()
    setUsers(data)
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
        setNewUser({ email: '', name: '', isAdmin: false })
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
        const response = await fetch(`/api/users?id=${userToDelete.id}`, {
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
      <header className="bg-white shadow">
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">Benutzer verwalten</h1>
        </div>
      </header>
      <main>
        <div className="mx-auto max-w-7xl py-6 sm:px-6 lg:px-8">
          <div className="px-4 py-6 sm:px-0">
            <div className="rounded-lg border-4 border-dashed border-gray-200 p-4">
              <h2 className="text-2xl font-bold mb-4">Benutzer hinzufügen</h2>
              <form onSubmit={handleAddUser} className="space-y-4 mb-8">
                <input
                  type="email"
                  value={newUser.email}
                  onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                  placeholder="E-Mail"
                  className="block w-full px-3 py-2 border rounded"
                />
                <input
                  type="text"
                  value={newUser.name}
                  onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                  placeholder="Name"
                  className="block w-full px-3 py-2 border rounded"
                />
                <div>
                  <label className="inline-flex items-center">
                    <input
                      type="checkbox"
                      checked={newUser.isAdmin}
                      onChange={(e) => setNewUser({ ...newUser, isAdmin: e.target.checked })}
                      className="form-checkbox"
                    />
                    <span className="ml-2">Admin</span>
                  </label>
                </div>
                <button type="submit" className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600">
                  Benutzer hinzufügen
                </button>
              </form>
              <h2 className="text-2xl font-bold mb-4">Benutzerliste</h2>
              <ul className="space-y-2">
                {users.map((user) => (
                  <li key={user.id} className="flex items-center justify-between bg-white p-3 rounded shadow">
                    <div>
                      <span className="font-bold">{user.name}</span> ({user.email})
                      {user.team && <span className="ml-2 text-gray-500">Team: {user.team.name}</span>}
                    </div>
                    <div>
                      <span className={`px-2 py-1 rounded ${user.isAdmin ? 'bg-green-200 text-green-800' : 'bg-gray-200 text-gray-800'}`}>
                        {user.isAdmin ? 'Admin' : 'Benutzer'}
                      </span>
                      {user.isSuperAdmin && (
                        <span className="ml-2 px-2 py-1 rounded bg-purple-200 text-purple-800">
                          Superadmin
                        </span>
                      )}
                      <button
                        onClick={() => handleDeleteUser(user)}
                        className="ml-2 px-2 py-1 bg-red-500 text-white rounded hover:bg-red-600"
                      >
                        Löschen
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </main>
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
