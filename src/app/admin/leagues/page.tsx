'use client'

import { useState, useEffect } from 'react'
import Navigation from '../../../../components/Navbar'
import Modal from '../../../../components/Modal'

interface League {
  id: number
  name: string
}

export default function LeaguesPage() {
  const [leagues, setLeagues] = useState<League[]>([])
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [newLeagueName, setNewLeagueName] = useState('')

  useEffect(() => {
    fetchLeagues()
  }, [])

  const fetchLeagues = async () => {
    try {
      const response = await fetch('/api/leagues')
      if (response.ok) {
        const data = await response.json()
        setLeagues(data)
      }
    } catch (error) {
      console.error('Fehler beim Abrufen der Ligen', error)
    }
  }

  const handleAddLeague = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const response = await fetch('/api/leagues', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newLeagueName }),
      })
      if (response.ok) {
        setNewLeagueName('')
        setIsModalOpen(false)
        fetchLeagues()
      }
    } catch (error) {
      console.error('Fehler beim Hinzufügen der Liga', error)
    }
  }

  const handleDeleteLeague = async (id: number) => {
    try {
      const response = await fetch(`/api/leagues/${id}`, {
        method: 'DELETE',
      })
      if (response.ok) {
        fetchLeagues()
      }
    } catch (error) {
      console.error('Fehler beim Löschen der Liga', error)
    }
  }

  return (
    <>
      <Navigation />
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-4">Ligen verwalten</h1>
        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mb-4"
        >
          Neue Liga hinzufügen
        </button>
        <ul className="bg-white shadow overflow-hidden sm:rounded-md">
          {leagues.map((league) => (
            <li key={league.id} className="border-b border-gray-200 last:border-b-0">
              <div className="px-4 py-4 sm:px-6 flex justify-between items-center">
                <p className="text-sm font-medium text-indigo-600 truncate">{league.name}</p>
                <button
                  onClick={() => handleDeleteLeague(league.id)}
                  className="ml-2 bg-red-500 hover:bg-red-700 text-white font-bold py-1 px-2 rounded text-xs"
                >
                  Löschen
                </button>
              </div>
            </li>
          ))}
        </ul>
      </div>
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Neue Liga hinzufügen">
        <form onSubmit={handleAddLeague}>
          <input
            type="text"
            value={newLeagueName}
            onChange={(e) => setNewLeagueName(e.target.value)}
            placeholder="Liganame"
            className="w-full px-3 py-2 placeholder-gray-300 border border-gray-300 rounded-md focus:outline-none focus:ring focus:ring-indigo-100 focus:border-indigo-300"
          />
          <button
            type="submit"
            className="mt-4 w-full bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
          >
            Hinzufügen
          </button>
        </form>
      </Modal>
    </>
  )
}
