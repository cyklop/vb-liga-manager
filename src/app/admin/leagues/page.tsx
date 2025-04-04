'use client'

import { useState, useEffect } from 'react'
import Navigation from '../../../../components/Navbar'
import Modal from '../../../../components/Modal'
import { PencilIcon, TrashIcon, CalendarDaysIcon, ArrowsUpDownIcon } from '@heroicons/react/24/outline'

interface Team {
  id: number
  name: string
}

// Define Fixture interface based on Prisma model
interface Fixture {
  id: number
  leagueId: number
  round?: number | null
  matchday?: number | null
  homeTeamId: number
  homeTeam: Team // Assuming we fetch team names with fixtures
  awayTeamId: number
  awayTeam: Team // Assuming we fetch team names with fixtures
  fixtureDate?: string | null // Use string for date input compatibility
  homeScore?: number | null
  awayScore?: number | null
  order: number
}

interface League {
  id: number
  name: string
  numberOfTeams: number
  hasReturnMatches: boolean
  teams: Team[]
  fixtures?: Fixture[] // Add fixtures relation
}

export default function LeaguesPage() {
  const [leagues, setLeagues] = useState<League[]>([])
  const [selectedLeagueFixtures, setSelectedLeagueFixtures] = useState<Fixture[]>([])
  const [selectedLeagueId, setSelectedLeagueId] = useState<number | null>(null)
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

  const fetchLeagues = async (selectLeagueId: number | null = null) => {
    try {
      const response = await fetch('/api/leagues') // This endpoint might need to include fixtures now
      if (response.ok) {
        const data: League[] = await response.json()
        setLeagues(data)
        // If a league was selected previously, refresh its fixtures
        if (selectLeagueId) {
          const selected = data.find(l => l.id === selectLeagueId)
          setSelectedLeagueFixtures(selected?.fixtures || [])
        }
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

  const handleGenerateFixtures = async (leagueId: number) => {
    try {
      // Show a confirmation dialog before generating
      const confirmation = confirm(`Möchten Sie den Spielplan für Liga ${leagueId} wirklich generieren? Bestehende Spielpläne für diese Liga werden überschrieben.`);
      if (!confirmation) {
        return; // Stop if user cancels
      }

      const response = await fetch(`/api/leagues/${leagueId}/generate-fixtures`, {
        method: 'POST',
      });

      const data = await response.json();

      if (response.ok) {
        alert(data.message || 'Spielplan erfolgreich generiert!');
        // Refetch leagues and select the current one to show new fixtures
        fetchLeagues(leagueId); 
      } else {
        alert(`Fehler: ${data.message || 'Unbekannter Fehler'}`);
      }
    } catch (error) {
      console.error('Fehler beim Generieren des Spielplans:', error);
      alert('Ein Netzwerkfehler ist aufgetreten.');
    }
  }

  // Function to fetch and display fixtures for a selected league
  const handleShowFixtures = async (leagueId: number) => {
    if (selectedLeagueId === leagueId) {
      // Hide if already selected
      setSelectedLeagueId(null)
      setSelectedLeagueFixtures([])
    } else {
      // Fetch fixtures for the selected league
      // Fixtures should now be included in the main league fetch due to API changes
      const league = leagues.find(l => l.id === leagueId)
      if (league && league.fixtures) {
         // Sort fixtures by order before setting state
         const sortedFixtures = [...league.fixtures].sort((a, b) => a.order - b.order);
         setSelectedLeagueFixtures(sortedFixtures);
      } else {
         // If fixtures are somehow not loaded, show empty
         setSelectedLeagueFixtures([]); 
         console.warn(`Fixtures for league ${leagueId} not found in fetched data. Ensure API includes them.`);
      }
      setSelectedLeagueId(leagueId)

      // Example for Option 2 (fetching on demand - not needed currently):
      // try {
      //   const response = await fetch(`/api/leagues/${leagueId}/fixtures`); // Needs new API endpoint
      //   if (response.ok) {
      //     const data = await response.json();
      //     setSelectedLeagueFixtures(data);
      //     setSelectedLeagueId(leagueId);
      //   } else {
      //     console.error('Fehler beim Abrufen der Spielpaarungen');
      //     setSelectedLeagueFixtures([]);
      //     setSelectedLeagueId(leagueId); // Still select the league to show potentially empty state
      //   }
      // } catch (error) {
      //   console.error('Fehler beim Abrufen der Spielpaarungen', error);
      // }
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
                  {/* Button to generate fixtures */}
                  <button
                    onClick={() => handleGenerateFixtures(league.id)}
                    className="ml-2 text-green-600 hover:text-green-900"
                    title="Spielplan generieren"
                  >
                    <CalendarDaysIcon className="h-5 w-5" />
                  </button>
                   {/* Button to show/hide fixtures */}
                  <button
                    onClick={() => handleShowFixtures(league.id)}
                    className="ml-2 text-blue-600 hover:text-blue-900"
                    title="Spielplan anzeigen/verbergen"
                  >
                    <ArrowsUpDownIcon className="h-5 w-5" />
                  </button>
                </div>
              </div>
              {/* Display Fixtures if this league is selected */}
              {selectedLeagueId === league.id && (
                <div className="px-4 py-4 sm:px-6 border-t border-gray-200 bg-gray-50">
                  <h3 className="text-sm font-medium text-gray-700 mb-2">Spielplan</h3>
                  {selectedLeagueFixtures.length > 0 ? (
                    <ul className="space-y-2">
                      {selectedLeagueFixtures
                        // Sort by the 'order' field for display
                        .sort((a, b) => a.order - b.order)
                        .map((fixture) => (
                          <li key={fixture.id} className="flex justify-between items-center text-xs p-2 border rounded">
                            <span>{fixture.order}. {fixture.homeTeam?.name || 'N/A'} vs {fixture.awayTeam?.name || 'N/A'}</span>
                            {/* TODO: Add editing and reordering controls here */}
                            <span>
                              {fixture.homeScore !== null && fixture.awayScore !== null
                                ? `${fixture.homeScore} : ${fixture.awayScore}`
                                : 'N/A'}
                            </span>
                          </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-xs text-gray-500">Kein Spielplan für diese Liga vorhanden oder generiert.</p>
                  )}
                  {/* TODO: Add controls for manual fixture creation and reordering */}
                </div>
              )}
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
