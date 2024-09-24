'use client'

import { useState } from 'react'
import Navigation from '../../../components/Navigation';

export default function Users() {
  const [newAdmin, setNewAdmin] = useState('')

  const handleAddAdmin = (e: React.FormEvent) => {
    e.preventDefault()
    // Hier würde man normalerweise eine API-Anfrage senden, um den Admin hinzuzufügen
    console.log(`Neuer Admin hinzugefügt: ${newAdmin}`)
    setNewAdmin('')
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <Navigation />
      <main className="container mx-auto p-4">
        <h1 className="text-3xl font-bold mb-8">Benutzer verwalten</h1>

        <div>
          <h2 className="text-2xl font-bold mb-4">Admin hinzufügen</h2>
          <form onSubmit={handleAddAdmin} className="flex gap-2">
            <input
              type="text"
              value={newAdmin}
              onChange={(e) => setNewAdmin(e.target.value)}
              placeholder="Neuer Admin"
              className="flex-grow px-3 py-2 border rounded"
            />
            <button type="submit" className="px-4 py-2 bg-green-500 text-white rounded">
              Admin hinzufügen
            </button>
          </form>
        </div>
      </main>
    </div>
  )
}
