'use client'

import { useState, useEffect } from 'react'
import Navigation from '../../../../components/Navbar'
import Modal from '../../../../components/Modal'
import { PencilIcon, TrashIcon } from '@heroicons/react/24/outline'

interface League {
  id: number
  name: string
}

export default function LeaguesPage() {
  const [leagues, setLeagues] = useState<League[]>([])
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [newLeagueName, setNewLeagueName] = useState('')
  const [editingLeague, setEditingLeague] = useState<League | null>(null)

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

  const handleEditLeague = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingLeague) return

    try {
      const response = await fetch(`/api/leagues/${editingLeague.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newLeagueName }),
      })
      if (response.ok) {
        setNewLeagueName('')
        setIsModalOpen(false)
        setEditingLeague(null)
        fetchLeagues()
      }
    } catch (error) {
      console.error('Fehler beim Bearbeiten der Liga', error)
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
          onClick={() => {
            setEditingLeague(null)
            setNewLeagueName('')
            setIsModalOpen(true)
          }}
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mb-4"
        >
          Neue Liga hinzufügen
        </button>
        <ul className="bg-white shadow overflow-hidden sm:rounded-md">
          {leagues.map((league) => (
            <li key={league.id} className="border-b border-gray-200 last:border-b-0">
              <div className="px-4 py-4 sm:px-6 flex justify-between items-center">
                <p className="text-sm font-medium text-indigo-600 truncate">{league.name}</p>
                <div>
                  <button
                    onClick={() => {
                      setEditingLeague(league)
                      setNewLeagueName(league.name)
                      setIsModalOpen(true)
                    }}
                    className="mr-2 text-indigo-600 hover:text-indigo-900"
                  >
                    <PencilIcon className="h-5 w-5" />
                  </button>
                  <button
                    onClick={() => handleDeleteLeague(league.id)}
                    className="text-red-600 hover:text-red-900"
                  >
                    <TrashIcon className="h-5 w-5" />
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingLeague ? "Liga bearbeiten" : "Neue Liga hinzufügen"}>
        <form onSubmit={editingLeague ? handleEditLeague : handleAddLeague}>
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
            {editingLeague ? "Aktualisieren" : "Hinzufügen"}
          </button>
        </form>
      </Modal>
    </>
  )
}
