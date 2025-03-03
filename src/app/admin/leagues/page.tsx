'use client'

import { useState, useEffect } from 'react'
import Navigation from '../../../../components/Navbar'
import Modal from '../../../../components/Modal'
import { PencilIcon, TrashIcon } from '@heroicons/react/24/outline'

interface Team {
  id: number
  name: string
}

interface League {
  id: number
  name: string
  numberOfTeams: number
  hasReturnMatches: boolean
  teams: Team[]
}

export default function LeaguesPage() {
  const [leagues, setLeagues] = useState<League[]>([])
  const [teams, setTeams] = useState<Team[]>([])
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [newLeague, setNewLeague] = useState({
    name: '',
    numberOfTeams: 0,
    hasReturnMatches: false,
    teamIds: [] as number[]
  })
  const [editingLeague, setEditingLeague] = useState<League | null>(null)

  useEffect(() => {
    fetchLeagues()
    fetchTeams()
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

  const fetchTeams = async () => {
    try {
      const response = await fetch('/api/teams')
      if (response.ok) {
        const data = await response.json()
        setTeams(data)
      }
    } catch (error) {
      console.error('Fehler beim Abrufen der Teams', error)
    }
  }

  const handleAddLeague = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const response = await fetch('/api/leagues', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newLeague),
      })
      
      if (response.ok) {
        setNewLeague({
          name: '',
          numberOfTeams: 0,
          hasReturnMatches: false,
          teamIds: []
        })
        setIsModalOpen(false)
        fetchLeagues()
      } else {
        const errorData = await response.json()
        alert(errorData.message)
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
        body: JSON.stringify(newLeague),
      })
      
      if (response.ok) {
        setNewLeague({
          name: '',
          numberOfTeams: 0,
          hasReturnMatches: false,
          teamIds: []
        })
        setIsModalOpen(false)
        setEditingLeague(null)
        fetchLeagues()
      } else {
        const errorData = await response.json()
        alert(errorData.message)
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
            setNewLeague({
              name: '',
              numberOfTeams: 0,
              hasReturnMatches: false,
              teamIds: []
            })
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
                <div>
                  <p className="text-sm font-medium text-indigo-600 truncate">{league.name}</p>
                  <p className="text-xs text-gray-500">
                    {league.teams.length} / {league.numberOfTeams} Teams: {league.teams.map(team => team.name).join(', ')}
                  </p>
                </div>
                <div>
                  <button
                    onClick={() => {
                      setEditingLeague(league)
                      setNewLeague({
                        name: league.name,
                        numberOfTeams: league.numberOfTeams,
                        hasReturnMatches: league.hasReturnMatches,
                        teamIds: league.teams.map(team => team.id)
                      })
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
            value={newLeague.name}
            onChange={(e) => setNewLeague({...newLeague, name: e.target.value})}
            placeholder="Liganame"
            className="w-full px-3 py-2 placeholder-gray-300 border border-gray-300 rounded-md focus:outline-none focus:ring focus:ring-indigo-100 focus:border-indigo-300 mb-4"
          />
          <div className="mb-4">
            <label htmlFor="numberOfTeams" className="block text-sm font-medium text-gray-700 mb-1">
              Anzahl der Mannschaften
            </label>
            <input
              id="numberOfTeams"
              type="number"
              value={newLeague.numberOfTeams}
              onChange={(e) => setNewLeague({...newLeague, numberOfTeams: parseInt(e.target.value)})}
              className="w-full px-3 py-2 placeholder-gray-300 border border-gray-300 rounded-md focus:outline-none focus:ring focus:ring-indigo-100 focus:border-indigo-300"
            />
          </div>
          <div className="flex items-center mb-4">
            <input
              type="checkbox"
              checked={newLeague.hasReturnMatches}
              onChange={(e) => setNewLeague({...newLeague, hasReturnMatches: e.target.checked})}
              className="mr-2"
            />
            <label>Hin- und Rückrunde</label>
          </div>
          
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Teams zuordnen (max. {newLeague.numberOfTeams})
            </label>
            <div className="max-h-40 overflow-y-auto border border-gray-300 rounded-md p-2">
              {teams.map(team => (
                <div key={team.id} className="flex items-center mb-2">
                  <input
                    type="checkbox"
                    id={`team-${team.id}`}
                    checked={newLeague.teamIds.includes(team.id)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        if (newLeague.teamIds.length < newLeague.numberOfTeams) {
                          setNewLeague({
                            ...newLeague, 
                            teamIds: [...newLeague.teamIds, team.id]
                          })
                        } else {
                          alert(`Es können maximal ${newLeague.numberOfTeams} Teams zugewiesen werden`)
                        }
                      } else {
                        setNewLeague({
                          ...newLeague, 
                          teamIds: newLeague.teamIds.filter(id => id !== team.id)
                        })
                      }
                    }}
                    className="mr-2"
                  />
                  <label htmlFor={`team-${team.id}`}>{team.name}</label>
                </div>
              ))}
            </div>
            <p className="text-sm text-gray-500 mt-1">
              {newLeague.teamIds.length} von {newLeague.numberOfTeams} Teams ausgewählt
            </p>
          </div>
          <button
            type="submit"
            className="w-full bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
          >
            {editingLeague ? "Aktualisieren" : "Hinzufügen"}
          </button>
        </form>
      </Modal>
    </>
  )
}
