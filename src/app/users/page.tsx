'use client'

import { useState, useEffect } from 'react'
import Navigation from '../../../components/Navigation'

interface User {
  id: number
  email: string
  isAdmin: boolean
}

export default function Users() {
  const [users, setUsers] = useState<User[]>([])
  const [newAdmin, setNewAdmin] = useState('')

  useEffect(() => {
    fetchUsers()
  }, [])

  const fetchUsers = async () => {
    const response = await fetch('/api/users')
    const data = await response.json()
    setUsers(data)
  }

  const handleAddAdmin = async (e: React.FormEvent) => {
    e.preventDefault()
    if (newAdmin) {
      const response = await fetch('/api/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: newAdmin, isAdmin: true }),
      })
      if (response.ok) {
        setNewAdmin('')
        fetchUsers()
      }
    }
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
              <h2 className="text-2xl font-bold mb-4">Admin hinzufügen</h2>
              <form onSubmit={handleAddAdmin} className="flex gap-2 mb-4">
                <input
                  type="email"
                  value={newAdmin}
                  onChange={(e) => setNewAdmin(e.target.value)}
                  placeholder="Neue Admin E-Mail"
                  className="flex-grow px-3 py-2 border rounded"
                />
                <button type="submit" className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600">
                  Admin hinzufügen
                </button>
              </form>
              <ul className="space-y-2">
                {users.map((user) => (
                  <li key={user.id} className="flex items-center justify-between bg-white p-3 rounded shadow">
                    <span>{user.email}</span>
                    <span className={`px-2 py-1 rounded ${user.isAdmin ? 'bg-green-200 text-green-800' : 'bg-gray-200 text-gray-800'}`}>
                      {user.isAdmin ? 'Admin' : 'Benutzer'}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </main>
    </>
  )
}
