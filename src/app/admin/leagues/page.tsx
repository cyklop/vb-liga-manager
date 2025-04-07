'use client'

import { useState, useEffect, useCallback } from 'react'
import Navigation from '../../../../components/Navbar'
import Modal from '../../../../components/Modal'
import { PencilIcon, TrashIcon, CalendarDaysIcon, ArrowsUpDownIcon, ArrowUpIcon, ArrowDownIcon, CheckIcon } from '@heroicons/react/24/outline'

// Define interfaces
interface Team {
  id: number
  name: string
}

interface Fixture {
  id: number
  leagueId: number
  round?: number | null
  matchday?: number | null
  homeTeamId: number
  homeTeam: Team
  awayTeamId: number
  awayTeam: Team
  fixtureDate?: string | null
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
  fixtures?: Fixture[]
}

// Define the component
export default function LeaguesPage() {
  // State variables
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
  const [editingFixture, setEditingFixture] = useState<Fixture | null>(null)
  const [isFixtureModalOpen, setIsFixtureModalOpen] = useState(false)
  const [isOrderChanged, setIsOrderChanged] = useState(false)

  // Fetch initial data
  useEffect(() => {
    fetchLeagues()
    fetchTeams()
  }, [])

  // --- Data Fetching Functions ---
  const fetchLeagues = async (selectLeagueId: number | null = null) => {
    try {
      const response = await fetch('/api/leagues')
      if (response.ok) {
        const data: League[] = await response.json()
        setLeagues(data)
        if (selectLeagueId) {
          const selected = data.find(l => l.id === selectLeagueId)
          // Ensure fixtures are sorted by order when setting state
          const sortedFixtures = selected?.fixtures ? [...selected.fixtures].sort((a, b) => a.order - b.order) : [];
          setSelectedLeagueFixtures(sortedFixtures)
        }
      } else {
        console.error('Fehler beim Abrufen der Ligen:', response.statusText)
      }
    } catch (error) {
      console.error('Fehler beim Abrufen der Ligen', error)
    }
  };

  const fetchTeams = async () => {
    try {
      const response = await fetch('/api/teams')
      if (response.ok) {
        const data = await response.json()
        setTeams(data)
      } else {
        console.error('Fehler beim Abrufen der Teams:', response.statusText)
      }
    } catch (error) {
      console.error('Fehler beim Abrufen der Teams', error)
    }
  };

  // --- Fixture Generation ---
  const handleGenerateFixtures = async (leagueId: number) => {
    const confirmation = confirm(`Möchten Sie den Spielplan für Liga ${leagueId} wirklich generieren? Bestehende Spielpläne für diese Liga werden überschrieben.`);
    if (!confirmation) return;

    try {
      const response = await fetch(`/api/leagues/${leagueId}/generate-fixtures`, { method: 'POST' });
      const data = await response.json();
      if (response.ok) {
        alert(data.message || 'Spielplan erfolgreich generiert!');
        fetchLeagues(leagueId); // Refetch and select the current league
      } else {
        alert(`Fehler: ${data.message || 'Unbekannter Fehler'}`);
      }
    } catch (error) {
      console.error('Fehler beim Generieren des Spielplans:', error);
      alert('Ein Netzwerkfehler ist aufgetreten.');
    }
  };

  // --- Fixture Display ---
  const handleShowFixtures = (leagueId: number) => {
    if (selectedLeagueId === leagueId) {
      setSelectedLeagueId(null)
      setSelectedLeagueFixtures([])
      setIsOrderChanged(false)
    } else {
      const league = leagues.find(l => l.id === leagueId)
      // Ensure fixtures are sorted by order when displaying
      const sortedFixtures = league?.fixtures ? [...league.fixtures].sort((a, b) => a.order - b.order) : [];
      setSelectedLeagueFixtures(sortedFixtures);
      setSelectedLeagueId(leagueId)
      setIsOrderChanged(false)
      if (!league?.fixtures) {
        console.warn(`Fixtures for league ${leagueId} not found in fetched data.`);
      }
    }
  };

  // --- Fixture Editing ---
  const handleEditFixtureClick = (fixture: Fixture) => {
    setEditingFixture({
      ...fixture,
      fixtureDate: fixture.fixtureDate ? new Date(fixture.fixtureDate).toISOString().split('T')[0] : null
    });
    setIsFixtureModalOpen(true);
  };

  const handleUpdateFixture = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingFixture) return;

    try {
      const response = await fetch(`/api/fixtures/${editingFixture.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          homeTeamId: editingFixture.homeTeamId,
          awayTeamId: editingFixture.awayTeamId,
          fixtureDate: editingFixture.fixtureDate || null,
          homeScore: editingFixture.homeScore !== null && String(editingFixture.homeScore).trim() !== '' ? Number(editingFixture.homeScore) : null,
          awayScore: editingFixture.awayScore !== null && String(editingFixture.awayScore).trim() !== '' ? Number(editingFixture.awayScore) : null,
        }),
      });

      if (response.ok) {
        setIsFixtureModalOpen(false);
        setEditingFixture(null);
        fetchLeagues(selectedLeagueId); // Refetch to show updated fixture
      } else {
        const errorData = await response.json();
        alert(`Fehler beim Aktualisieren der Spielpaarung: ${errorData.message}`);
      }
    } catch (error) {
      console.error('Fehler beim Aktualisieren der Spielpaarung:', error);
      alert('Ein Netzwerkfehler ist aufgetreten.');
    }
  };

  const handleFixtureInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    if (!editingFixture) return;
    const { name, value } = e.target;

    if (name === 'homeScore' || name === 'awayScore') {
      const scoreValue = value.trim() === '' ? null : Number(value);
      // Ensure NaN is not set, default to null if conversion fails
      setEditingFixture({
        ...editingFixture,
        [name]: isNaN(scoreValue as number) ? null : scoreValue,
      });
    } else {
      setEditingFixture({
        ...editingFixture,
        [name]: value,
      });
    }
  };

  // --- Fixture Reordering ---
  const moveFixture = useCallback((index: number, direction: 'up' | 'down') => {
    setSelectedLeagueFixtures(prevFixtures => {
      const newFixtures = [...prevFixtures];
      const targetIndex = direction === 'up' ? index - 1 : index + 1;

      if (targetIndex < 0 || targetIndex >= newFixtures.length) {
        return prevFixtures; // Return original array if move is invalid
      }

      // Swap fixtures
      [newFixtures[index], newFixtures[targetIndex]] = [newFixtures[targetIndex], newFixtures[index]];

      // Update order property - simple swap for now
      // Consider re-assigning sequential order numbers if needed
      const tempOrder = newFixtures[index].order;
      newFixtures[index].order = newFixtures[targetIndex].order;
      newFixtures[targetIndex].order = tempOrder;

      setIsOrderChanged(true);
      return newFixtures;
    });
  }, []); // No dependencies needed if it only uses index and direction

  const moveFixtureUp = useCallback((index: number) => {
    moveFixture(index, 'up');
  }, [moveFixture]);

  const moveFixtureDown = useCallback((index: number) => {
    moveFixture(index, 'down');
  }, [moveFixture]);

  const handleSaveFixtureOrder = async () => {
    if (!selectedLeagueId || !isOrderChanged) return;

    const orderedFixtureIds = selectedLeagueFixtures.map(fixture => fixture.id);

    try {
      const response = await fetch(`/api/leagues/${selectedLeagueId}/fixtures/reorder`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderedFixtureIds }),
      });

      if (response.ok) {
        setIsOrderChanged(false);
        alert('Spielplanreihenfolge erfolgreich gespeichert!');
        // Refetch to ensure data consistency after reordering on the server
        fetchLeagues(selectedLeagueId);
      } else {
        const errorData = await response.json();
        alert(`Fehler beim Speichern der Reihenfolge: ${errorData.message}`);
      }
    } catch (error) {
      console.error('Fehler beim Speichern der Spielplanreihenfolge:', error);
      alert('Ein Netzwerkfehler ist aufgetreten.');
    }
  };

  // --- League CRUD ---
  const handleAddLeague = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/leagues', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newLeague),
      });
      
      if (response.ok) {
        setNewLeague({ name: '', numberOfTeams: 0, hasReturnMatches: false, teamIds: [] });
        setIsModalOpen(false);
        fetchLeagues(); // Refetch all leagues
      } else {
        const errorData = await response.json();
        alert(errorData.message);
      }
    } catch (error) {
      console.error('Fehler beim Hinzufügen der Liga', error);
    }
  };

  const handleEditLeague = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingLeague) return;

    try {
      const response = await fetch(`/api/leagues/${editingLeague.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        // Send the state used in the form (newLeague), not editingLeague
        body: JSON.stringify(newLeague), 
      });
      
      if (response.ok) {
        setNewLeague({ name: '', numberOfTeams: 0, hasReturnMatches: false, teamIds: [] });
        setIsModalOpen(false);
        setEditingLeague(null);
        fetchLeagues(); // Refetch all leagues
      } else {
        const errorData = await response.json();
        alert(errorData.message);
      }
    } catch (error) {
      console.error('Fehler beim Bearbeiten der Liga', error);
    }
  };

  const handleDeleteLeague = async (id: number) => {
    const confirmation = confirm(`Möchten Sie die Liga mit ID ${id} wirklich löschen? Alle zugehörigen Spielpläne werden ebenfalls gelöscht.`);
    if (!confirmation) return;

    try {
      const response = await fetch(`/api/leagues/${id}`, { method: 'DELETE' });
      if (response.ok) {
        fetchLeagues(); // Refetch leagues
        // If the deleted league was selected, deselect it
        if (selectedLeagueId === id) {
          setSelectedLeagueId(null);
          setSelectedLeagueFixtures([]);
          setIsOrderChanged(false);
        }
      } else {
        const errorData = await response.json();
        alert(`Fehler beim Löschen der Liga: ${errorData.message || 'Unbekannter Fehler'}`);
      }
    } catch (error) {
      console.error('Fehler beim Löschen der Liga', error);
      alert('Ein Netzwerkfehler ist aufgetreten.');
    }
  };

  // --- Render JSX ---
  return (
    <>
      <Navigation />
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-4">Ligen verwalten</h1>
        
        {/* Add League Button */}
        <button
          onClick={() => {
            setEditingLeague(null);
            setNewLeague({ name: '', numberOfTeams: 0, hasReturnMatches: false, teamIds: [] });
            setIsModalOpen(true);
          }}
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mb-4"
        >
          Neue Liga hinzufügen
        </button>

        {/* Leagues List */}
        <ul className="bg-white shadow overflow-hidden sm:rounded-md">
          {leagues.map((league) => (
            <li key={league.id} className="border-b border-gray-200 last:border-b-0">
              {/* League Header */}
              <div className="px-4 py-4 sm:px-6 flex justify-between items-center">
                <div>
                  <p className="text-sm font-medium text-indigo-600 truncate">{league.name}</p>
                  <p className="text-xs text-gray-500">
                    {league.teams.length} / {league.numberOfTeams} Teams: {league.teams.map(team => team.name).join(', ') || 'Keine Teams zugewiesen'}
                  </p>
                </div>
                {/* Action Buttons */}
                <div className="flex space-x-1">
                  <button
                    onClick={() => {
                      setEditingLeague(league);
                      setNewLeague({
                        name: league.name,
                        numberOfTeams: league.numberOfTeams,
                        hasReturnMatches: league.hasReturnMatches,
                        teamIds: league.teams.map(team => team.id)
                      });
                      setIsModalOpen(true);
                    }}
                    className="p-1 text-indigo-600 hover:text-indigo-900 hover:bg-indigo-100 rounded"
                    title="Liga bearbeiten"
                  >
                    <PencilIcon className="h-5 w-5" />
                  </button>
                  <button
                    onClick={() => handleDeleteLeague(league.id)}
                    className="p-1 text-red-600 hover:text-red-900 hover:bg-red-100 rounded"
                    title="Liga löschen"
                  >
                    <TrashIcon className="h-5 w-5" />
                  </button>
                  <button
                    onClick={() => handleGenerateFixtures(league.id)}
                    className="p-1 text-green-600 hover:text-green-900 hover:bg-green-100 rounded"
                    title="Spielplan generieren"
                  >
                    <CalendarDaysIcon className="h-5 w-5" />
                  </button>
                  <button
                    onClick={() => handleShowFixtures(league.id)}
                    className="p-1 text-blue-600 hover:text-blue-900 hover:bg-blue-100 rounded"
                    title={selectedLeagueId === league.id ? "Spielplan verbergen" : "Spielplan anzeigen"}
                  >
                    <ArrowsUpDownIcon className="h-5 w-5" />
                  </button>
                </div>
              </div>

              {/* Fixtures Section (Conditional) */}
              {selectedLeagueId === league.id && (
                <div className="px-4 py-4 sm:px-6 border-t border-gray-200 bg-gray-50">
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="text-sm font-medium text-gray-700">Spielplan</h3>
                    {/* Save Order Button */}
                    {isOrderChanged && (
                       <button
                         onClick={handleSaveFixtureOrder}
                         className="bg-green-500 hover:bg-green-700 text-white font-bold py-1 px-3 rounded text-sm flex items-center"
                       >
                         <CheckIcon className="h-4 w-4 mr-1" />
                         Reihenfolge speichern
                       </button>
                    )}
                  </div>
                  {selectedLeagueFixtures.length > 0 ? (
                    <ul className="space-y-2">
                      {selectedLeagueFixtures.map((fixture, index) => (
                          <li key={fixture.id} className="flex justify-between items-center text-xs p-2 border rounded hover:bg-gray-100">
                            {/* Fixture Details */}
                            <div className="flex-grow flex items-center">
                              <span className="mr-2 text-gray-500 w-6 text-right">{fixture.order}.</span>
                              <span>{fixture.homeTeam?.name || 'N/A'} vs {fixture.awayTeam?.name || 'N/A'}</span>
                              <span className="ml-4 text-gray-500">
                                {fixture.fixtureDate ? new Date(fixture.fixtureDate).toLocaleDateString('de-DE') : 'Datum N/A'}
                              </span>
                            </div>
                            {/* Score */}
                            <span className="mx-4 font-medium w-16 text-center">
                              {fixture.homeScore !== null && fixture.awayScore !== null
                                ? `${fixture.homeScore} : ${fixture.awayScore}`
                                : '- : -'}
                            </span>
                            {/* Action Buttons Container */}
                            <div className="flex items-center space-x-1 ml-2">
                              <button
                                onClick={() => handleEditFixtureClick(fixture)}
                                className="p-1 text-indigo-600 hover:text-indigo-900 hover:bg-indigo-100 rounded"
                                title="Spielpaarung bearbeiten"
                              >
                                <PencilIcon className="h-4 w-4" />
                              </button>
                              <button
                                onClick={() => moveFixtureUp(index)}
                                disabled={index === 0}
                                className={`p-1 text-gray-500 hover:text-gray-800 hover:bg-gray-200 rounded ${index === 0 ? 'opacity-50 cursor-not-allowed' : ''}`}
                                title="Nach oben verschieben"
                              >
                                <ArrowUpIcon className="h-4 w-4" />
                              </button>
                              <button
                                onClick={() => moveFixtureDown(index)}
                                disabled={index === selectedLeagueFixtures.length - 1}
                                className={`p-1 text-gray-500 hover:text-gray-800 hover:bg-gray-200 rounded ${index === selectedLeagueFixtures.length - 1 ? 'opacity-50 cursor-not-allowed' : ''}`}
                                title="Nach unten verschieben"
                              >
                                <ArrowDownIcon className="h-4 w-4" />
                              </button>
                            </div>
                          </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-xs text-gray-500">Kein Spielplan für diese Liga vorhanden oder generiert.</p>
                  )}
                </div>
              )}
            </li>
          ))}
        </ul>
      </div>

      {/* Add/Edit League Modal */}
      <Modal isOpen={isModalOpen} onClose={() => { setIsModalOpen(false); setEditingLeague(null); }} title={editingLeague ? "Liga bearbeiten" : "Neue Liga hinzufügen"}>
        <form onSubmit={editingLeague ? handleEditLeague : handleAddLeague} className="space-y-4">
          {/* League Name */}
          <div>
            <label htmlFor="leagueName" className="block text-sm font-medium text-gray-700">Liganame</label>
            <input
              id="leagueName"
              type="text"
              value={newLeague.name}
              onChange={(e) => setNewLeague({...newLeague, name: e.target.value})}
              placeholder="z.B. Kreisliga A"
              required
              className="mt-1 w-full px-3 py-2 placeholder-gray-300 border border-gray-300 rounded-md focus:outline-none focus:ring focus:ring-indigo-100 focus:border-indigo-300"
            />
          </div>
          {/* Number of Teams */}
          <div>
            <label htmlFor="numberOfTeams" className="block text-sm font-medium text-gray-700">Anzahl der Mannschaften</label>
            <input
              id="numberOfTeams"
              type="number"
              min="2" // A league needs at least 2 teams
              value={newLeague.numberOfTeams}
              onChange={(e) => setNewLeague({...newLeague, numberOfTeams: parseInt(e.target.value) || 0})}
              required
              className="mt-1 w-full px-3 py-2 placeholder-gray-300 border border-gray-300 rounded-md focus:outline-none focus:ring focus:ring-indigo-100 focus:border-indigo-300"
            />
          </div>
          {/* Return Matches Checkbox */}
          <div className="flex items-center">
            <input
              id="hasReturnMatches"
              type="checkbox"
              checked={newLeague.hasReturnMatches}
              onChange={(e) => setNewLeague({...newLeague, hasReturnMatches: e.target.checked})}
              className="h-4 w-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
            />
            <label htmlFor="hasReturnMatches" className="ml-2 block text-sm text-gray-900">Hin- und Rückrunde</label>
          </div>
          
          {/* Assign Teams */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Teams zuordnen (max. {newLeague.numberOfTeams || 'N/A'})
            </label>
            <div className="mt-1 max-h-40 overflow-y-auto border border-gray-300 rounded-md p-2 space-y-1">
              {teams.length > 0 ? teams.map(team => (
                <div key={team.id} className="flex items-center">
                  <input
                    type="checkbox"
                    id={`team-${team.id}`}
                    checked={newLeague.teamIds.includes(team.id)}
                    // Disable adding more teams if the max number is reached and this team is not already selected
                    disabled={!newLeague.teamIds.includes(team.id) && newLeague.teamIds.length >= newLeague.numberOfTeams} 
                    onChange={(e) => {
                      const isChecked = e.target.checked;
                      const currentTeamIds = newLeague.teamIds;
                      const maxTeams = newLeague.numberOfTeams;

                      if (isChecked) {
                        if (currentTeamIds.length < maxTeams) {
                          setNewLeague({ ...newLeague, teamIds: [...currentTeamIds, team.id] });
                        } else {
                          // Prevent checking if max is reached (though disabled should handle this)
                          e.target.checked = false; 
                          alert(`Es können maximal ${maxTeams} Teams zugewiesen werden.`);
                        }
                      } else {
                        setNewLeague({ ...newLeague, teamIds: currentTeamIds.filter(id => id !== team.id) });
                      }
                    }}
                    className="h-4 w-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500 disabled:opacity-50"
                  />
                  <label htmlFor={`team-${team.id}`} className="ml-2 block text-sm text-gray-900">{team.name}</label>
                </div>
              )) : <p className="text-sm text-gray-500">Keine Teams verfügbar.</p>}
            </div>
            <p className="text-sm text-gray-500 mt-1">
              {newLeague.teamIds.length} von {newLeague.numberOfTeams || 0} Teams ausgewählt
            </p>
          </div>
          {/* Submit Button */}
          <button
            type="submit"
            className="w-full bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            {editingLeague ? "Liga aktualisieren" : "Liga hinzufügen"}
          </button>
        </form>
      </Modal>

      {/* Edit Fixture Modal */}
      <Modal isOpen={isFixtureModalOpen} onClose={() => { setIsFixtureModalOpen(false); setEditingFixture(null); }} title="Spielpaarung bearbeiten">
        {editingFixture && (
          <form onSubmit={handleUpdateFixture} className="space-y-4">
            {/* Home Team Select */}
            <div>
              <label htmlFor="homeTeamId" className="block text-sm font-medium text-gray-700">Heimteam</label>
              <select
                id="homeTeamId"
                name="homeTeamId"
                value={editingFixture.homeTeamId}
                onChange={handleFixtureInputChange}
                required
                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
              >
                {teams.map(team => (
                  <option key={team.id} value={team.id}>{team.name}</option>
                ))}
              </select>
            </div>

            {/* Away Team Select */}
            <div>
              <label htmlFor="awayTeamId" className="block text-sm font-medium text-gray-700">Auswärtsteam</label>
              <select
                id="awayTeamId"
                name="awayTeamId"
                value={editingFixture.awayTeamId}
                onChange={handleFixtureInputChange}
                required
                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
              >
                {teams.map(team => (
                  <option key={team.id} value={team.id}>{team.name}</option>
                ))}
              </select>
            </div>

            {/* Fixture Date */}
            <div>
              <label htmlFor="fixtureDate" className="block text-sm font-medium text-gray-700">Datum</label>
              <input
                type="date"
                id="fixtureDate"
                name="fixtureDate"
                value={editingFixture.fixtureDate || ''}
                onChange={handleFixtureInputChange}
                className="mt-1 block w-full pl-3 pr-3 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
              />
            </div>

            {/* Scores */}
            <div className="flex space-x-4">
              <div className="flex-1">
                <label htmlFor="homeScore" className="block text-sm font-medium text-gray-700">Ergebnis Heim</label>
                <input
                  type="number"
                  id="homeScore"
                  name="homeScore"
                  min="0"
                  value={editingFixture.homeScore ?? ''} // Use ?? for null/undefined -> empty string
                  onChange={handleFixtureInputChange}
                  placeholder="Punkte"
                  className="mt-1 block w-full px-3 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                />
              </div>
              <div className="flex-1">
                <label htmlFor="awayScore" className="block text-sm font-medium text-gray-700">Ergebnis Auswärts</label>
                <input
                  type="number"
                  id="awayScore"
                  name="awayScore"
                  min="0"
                  value={editingFixture.awayScore ?? ''} // Use ?? for null/undefined -> empty string
                  onChange={handleFixtureInputChange}
                  placeholder="Punkte"
                  className="mt-1 block w-full px-3 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                />
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="w-full bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Spielpaarung aktualisieren
            </button>
          </form>
        )}
      </Modal>
    </>
  );
}
