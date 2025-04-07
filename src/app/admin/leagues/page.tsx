'use client'

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Navigation from '../../../../components/Navbar';
import Modal from '../../../../components/Modal';
import { PencilIcon, TrashIcon, CalendarDaysIcon, ArrowsUpDownIcon, ArrowUpIcon, ArrowDownIcon, LockClosedIcon, LockOpenIcon, CheckIcon } from '@heroicons/react/24/outline';
import { Bars3Icon as GripVerticalIcon } from '@heroicons/react/24/outline'; // Verwende Bars3Icon als Ersatz für GripVerticalIcon
// Import dnd-kit components
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';


// Define interfaces
interface Team {
  id: number
  name: string
}

interface User {
  id: number
  name: string
  email: string
  isAdmin: boolean
  isSuperAdmin: boolean
  team?: {
    id: number
    name: string
  }
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
  homeScore?: number | null // Keep for potential data structure consistency, but UI will use sets/points
  awayScore?: number | null // Keep for potential data structure consistency, but UI will use sets/points
  // New detailed score fields
  homeSets?: number | null
  awaySets?: number | null
  homePoints?: number | null // Total balls/points
  awayPoints?: number | null // Total balls/points
  homeMatchPoints?: number | null // Points for the league table
  awayMatchPoints?: number | null // Points for the league table
  order: number
}

interface League {
  id: number
  name: string
  numberOfTeams: number
  hasReturnMatches: boolean
  teams: Team[]
  fixtures?: Fixture[]
  isActive: boolean
  createdAt: string
  // Add point rules
  pointsWin30: number
  pointsWin31: number
  pointsWin32: number
  pointsLoss32: number
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
    teamIds: [] as number[],
    isActive: true,
    // Add default point rules for new league form
    pointsWin30: 3,
    pointsWin31: 3,
    pointsWin32: 2,
    pointsLoss32: 1,
  })
  const [editingLeague, setEditingLeague] = useState<League | null>(null)
  // Ensure editingFixture state includes new fields
  const [editingFixture, setEditingFixture] = useState<Partial<Fixture> | null>(null) // Use Partial for flexibility during editing
  const [isFixtureModalOpen, setIsFixtureModalOpen] = useState(false)
  const [isOrderChanged, setIsOrderChanged] = useState(false)

  // --- Drag & Drop Sensors ---
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // --- User state ---
  const [currentUser, setCurrentUser] = useState<User | null>(null)
  const [isAdmin, setIsAdmin] = useState(false)
  const [userTeamId, setUserTeamId] = useState<number | null>(null)

  // --- Fetch initial data ---
  useEffect(() => {
    fetchCurrentUser()
    fetchLeagues()
    fetchTeams()
  }, [])

  const router = useRouter()

  const fetchCurrentUser = async () => {
    try {
      const response = await fetch('/api/users/me')
      if (response.ok) {
        const user = await response.json()
        setCurrentUser(user)
        setIsAdmin(user.isAdmin || user.isSuperAdmin)
        setUserTeamId(user.team?.id || null)
        
        // Wenn kein Admin, zur Dashboard-Seite umleiten
        if (!user.isAdmin && !user.isSuperAdmin) {
          router.push('/dashboard')
        }
      }
    } catch (error) {
      console.error('Fehler beim Abrufen des aktuellen Benutzers', error)
    }
  }

  // --- Data Fetching Functions ---
  const fetchLeagues = async (selectLeagueId: number | null = null) => {
    try {
      const response = await fetch('/api/leagues')
      if (response.ok) {
        const data: League[] = await response.json()
        // Sortiere die Ligen nach ID, neueste (höchste ID) zuerst
        const sortedData = [...data].sort((a, b) => b.id - a.id);
        setLeagues(sortedData)
        if (selectLeagueId) {
          const selected = sortedData.find(l => l.id === selectLeagueId)
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
    // Finde die Liga in der lokalen State-Variable
    const league = leagues.find(l => l.id === leagueId);
    
    // Prüfe, ob die Liga aktiv ist
    if (!league || !league.isActive) {
      alert('Spielpläne können nur für aktive Ligen generiert werden. Abgeschlossene Ligen müssen zuerst wieder aktiviert werden.');
      return;
    }
    
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
  const handleEditFixtureClick = (fixture: Fixture, league: League) => {
    // Prüfe, ob die Liga aktiv ist
    if (!league.isActive) {
      alert('Spielpaarungen können nur für aktive Ligen bearbeitet werden. Abgeschlossene Ligen müssen zuerst wieder aktiviert werden.');
      return;
    }
    
    // Prüfe Berechtigungen für normale Benutzer
    if (!isAdmin && userTeamId) {
      // Normale Benutzer dürfen nur Heimspiele ihrer eigenen Mannschaft bearbeiten
      if (fixture.homeTeamId !== userTeamId) {
        alert('Sie können nur Heimspiele Ihrer eigenen Mannschaft bearbeiten.');
        return;
      }
    }
    
    setEditingFixture({
      ...fixture,
      fixtureDate: fixture.fixtureDate ? new Date(fixture.fixtureDate).toISOString().split('T')[0] : null,
      // Include new fields when starting edit
      homeSets: fixture.homeSets,
      awaySets: fixture.awaySets,
      homePoints: fixture.homePoints,
      awayPoints: fixture.awayPoints,
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
          // Send new score fields
          homeSets: editingFixture.homeSets !== null && String(editingFixture.homeSets).trim() !== '' ? Number(editingFixture.homeSets) : null,
          awaySets: editingFixture.awaySets !== null && String(editingFixture.awaySets).trim() !== '' ? Number(editingFixture.awaySets) : null,
          homePoints: editingFixture.homePoints !== null && String(editingFixture.homePoints).trim() !== '' ? Number(editingFixture.homePoints) : null,
          awayPoints: editingFixture.awayPoints !== null && String(editingFixture.awayPoints).trim() !== '' ? Number(editingFixture.awayPoints) : null,
          // homeScore/awayScore are calculated/set on the backend now
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

    // Handle number conversion for score/set/point fields
    if (['homeSets', 'awaySets', 'homePoints', 'awayPoints'].includes(name)) {
      const numValue = value.trim() === '' ? null : Number(value);
      // Ensure NaN is not set, default to null if conversion fails or negative values entered
      setEditingFixture({
        ...editingFixture,
        [name]: (isNaN(numValue as number) || (numValue !== null && numValue < 0)) ? null : numValue,
      });
    } else {
      // Handle other fields like team IDs or date
      setEditingFixture({
        ...editingFixture,
        [name]: value,
      });
    }
  };

  // --- Fixture Reordering (Drag & Drop) ---
  const handleDragEnd = useCallback((event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      setSelectedLeagueFixtures((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id);
        const newIndex = items.findIndex((item) => item.id === over.id);
        const newItems = arrayMove(items, oldIndex, newIndex);

        // Update the order property based on the new array index for immediate visual feedback
        // The actual saving logic will send the IDs in order to the backend
        // return newItems.map((item, index) => ({ ...item, order: index + 1 }));
        setIsOrderChanged(true); // Mark order as changed
        return newItems; 
      });
    }
  }, []); // Dependency array is empty as it only uses setSelectedLeagueFixtures

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
    // Ensure point rules are numbers before sending
    const leagueDataToSend = {
      ...newLeague,
      pointsWin30: Number(newLeague.pointsWin30),
      pointsWin31: Number(newLeague.pointsWin31),
      pointsWin32: Number(newLeague.pointsWin32),
      pointsLoss32: Number(newLeague.pointsLoss32),
    };
    try {
      const response = await fetch('/api/leagues', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(leagueDataToSend), // Send data with converted numbers
      });
      
      if (response.ok) {
        // Reset form with default point rules
        setNewLeague({ 
          name: '', 
          numberOfTeams: 0, 
          hasReturnMatches: false, 
          teamIds: [],
          isActive: true,
          pointsWin30: 3,
          pointsWin31: 3,
          pointsWin32: 2,
          pointsLoss32: 1,
         });
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
        // Send the state used in the form (newLeague), ensuring point rules are numbers
        body: JSON.stringify({
          ...newLeague,
          pointsWin30: Number(newLeague.pointsWin30),
          pointsWin31: Number(newLeague.pointsWin31),
          pointsWin32: Number(newLeague.pointsWin32),
          pointsLoss32: Number(newLeague.pointsLoss32),
        }), 
      });
      
      if (response.ok) {
         // Reset form with default point rules
        setNewLeague({ 
          name: '', 
          numberOfTeams: 0, 
          hasReturnMatches: false, 
          teamIds: [],
          pointsWin30: 3,
          pointsWin31: 3,
          pointsWin32: 2,
          pointsLoss32: 1,
         });
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
        <h1 className="text-2xl font-bold mb-4">
          {isAdmin ? "Ligen verwalten" : "Spielpläne anzeigen"}
        </h1>
        
        {/* Add League Button - nur für Admins */}
        {isAdmin && (
          <button
            onClick={() => {
              setEditingLeague(null);
              // Reset form with default point rules when adding new
              setNewLeague({ 
                name: '', 
                numberOfTeams: 0, 
                hasReturnMatches: false, 
                teamIds: [],
                pointsWin30: 3,
                pointsWin31: 3,
                pointsWin32: 2,
                pointsLoss32: 1,
              });
              setIsModalOpen(true);
            }}
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mb-4"
          >
            Neue Liga hinzufügen
          </button>
        )}

        {/* Leagues List */}
        <ul className="bg-white shadow overflow-hidden sm:rounded-md">
          {leagues.map((league) => (
            <li key={league.id} className="border-b border-gray-200 last:border-b-0">
              {/* League Header */}
              <div className="px-4 py-4 sm:px-6 flex justify-between items-center">
                <div>
                  <div className="flex items-center">
                    <p className="text-sm font-medium text-indigo-600 truncate">{league.name}</p>
                    <span className={`ml-2 px-2 py-0.5 text-xs font-medium rounded-full ${league.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                      {league.isActive ? 'Aktiv' : 'Abgeschlossen'}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500">
                    {league.teams.length} / {league.numberOfTeams} Teams: {league.teams.map(team => team.name).join(', ') || 'Keine Teams zugewiesen'}
                  </p>
                  <p className="text-xs text-gray-400">
                    Erstellt am: {new Date(league.createdAt).toLocaleDateString('de-DE')}
                  </p>
                </div>
                {/* Action Buttons */}
                <div className="flex space-x-1">
                  {isAdmin && (
                    <>
                      <button
                        onClick={() => {
                          setEditingLeague(league);
                          setNewLeague({
                            name: league.name,
                            numberOfTeams: league.numberOfTeams,
                            hasReturnMatches: league.hasReturnMatches,
                            teamIds: league.teams.map(team => team.id),
                            isActive: league.isActive,
                            // Load existing point rules when editing
                            pointsWin30: league.pointsWin30,
                            pointsWin31: league.pointsWin31,
                            pointsWin32: league.pointsWin32,
                            pointsLoss32: league.pointsLoss32,
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
                        onClick={() => {
                          setEditingLeague(league);
                          setNewLeague({
                            ...newLeague,
                            name: league.name,
                            numberOfTeams: league.numberOfTeams,
                            hasReturnMatches: league.hasReturnMatches,
                            teamIds: league.teams.map(team => team.id),
                            isActive: !league.isActive, // Umkehren des aktuellen Status
                            pointsWin30: league.pointsWin30,
                            pointsWin31: league.pointsWin31,
                            pointsWin32: league.pointsWin32,
                            pointsLoss32: league.pointsLoss32,
                          });
                          setIsModalOpen(true);
                        }}
                        className={`p-1 ${league.isActive ? 'text-amber-600 hover:text-amber-900' : 'text-green-600 hover:text-green-900'} hover:bg-gray-100 rounded`}
                        title={league.isActive ? "Liga abschließen" : "Liga wieder aktivieren"}
                      >
                        {league.isActive ? <LockClosedIcon className="h-5 w-5" /> : <LockOpenIcon className="h-5 w-5" />}
                      </button>
                      <button
                        onClick={() => handleGenerateFixtures(league.id)}
                        className={`p-1 ${league.isActive ? 'text-green-600 hover:text-green-900 hover:bg-green-100' : 'text-gray-400 cursor-not-allowed'} rounded`}
                        title={league.isActive ? "Spielplan generieren" : "Liga ist abgeschlossen"}
                        disabled={!league.isActive}
                      >
                        <CalendarDaysIcon className="h-5 w-5" />
                      </button>
                    </>
                  )}
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
                  <div className="flex justify-between items-center mb-3">
                    <h3 className="text-lg font-semibold text-gray-800">Spielplan</h3>
                    {/* Save Order Button - nur für Admins */}
                    {isAdmin && isOrderChanged && (
                       <button
                         onClick={handleSaveFixtureOrder}
                         className="bg-green-600 hover:bg-green-700 text-white font-bold py-1.5 px-4 rounded text-sm flex items-center shadow-sm transition duration-150 ease-in-out"
                       >
                         <CheckIcon className="h-4 w-4 mr-1" />
                         Reihenfolge speichern
                       </button>
                    )}
                  </div>
                  {selectedLeagueFixtures.length > 0 ? (
                    // --- dnd-kit Contexts ---
                    <DndContext
                      sensors={sensors}
                      collisionDetection={closestCenter}
                      onDragEnd={handleDragEnd}
                    >
                      <SortableContext
                        items={selectedLeagueFixtures.map(f => f.id)} // Use fixture IDs for SortableContext
                        strategy={verticalListSortingStrategy}
                      >
                        {/* --- Sortable List --- */}
                        <ul className="space-y-2">
                          {selectedLeagueFixtures.map((fixture) => (
                            // Use SortableItem component defined below
                            <SortableFixtureItem 
                              key={fixture.id} 
                              fixture={fixture} 
                              onEditClick={(fixture) => handleEditFixtureClick(fixture, league)} 
                              isLeagueActive={league.isActive}
                            />
                          ))}
                        </ul>
                      </SortableContext>
                    </DndContext>
                  ) : (
                    <p className="text-sm text-gray-500 italic">Kein Spielplan für diese Liga vorhanden oder generiert.</p>
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
          
          {/* Active Status Checkbox */}
          <div className="flex items-center">
            <input
              id="isActive"
              type="checkbox"
              checked={newLeague.isActive}
              onChange={(e) => setNewLeague({...newLeague, isActive: e.target.checked})}
              className="h-4 w-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
            />
            <label htmlFor="isActive" className="ml-2 block text-sm text-gray-900">Liga ist aktiv</label>
          </div>

          {/* Point Rules Section */}
          <fieldset className="border border-gray-300 p-3 rounded-md">
              <legend className="text-sm font-medium text-gray-700 px-1">Punktregeln</legend>
              <div className="grid grid-cols-2 gap-x-4 gap-y-2 mt-1">
                  <div>
                      <label htmlFor="pointsWin30" className="block text-xs font-medium text-gray-600">Punkte für 3:0</label>
                      <input
                          id="pointsWin30"
                          type="number"
                          min="0"
                          value={newLeague.pointsWin30}
                          onChange={(e) => setNewLeague({...newLeague, pointsWin30: parseInt(e.target.value) || 0})}
                          className="mt-1 w-full px-2 py-1 border border-gray-300 rounded-md text-sm"
                      />
                  </div>
                   <div>
                      <label htmlFor="pointsWin31" className="block text-xs font-medium text-gray-600">Punkte für 3:1</label>
                      <input
                          id="pointsWin31"
                          type="number"
                          min="0"
                          value={newLeague.pointsWin31}
                          onChange={(e) => setNewLeague({...newLeague, pointsWin31: parseInt(e.target.value) || 0})}
                          className="mt-1 w-full px-2 py-1 border border-gray-300 rounded-md text-sm"
                      />
                  </div>
                   <div>
                      <label htmlFor="pointsWin32" className="block text-xs font-medium text-gray-600">Punkte für 3:2 (Sieger)</label>
                      <input
                          id="pointsWin32"
                          type="number"
                          min="0"
                          value={newLeague.pointsWin32}
                          onChange={(e) => setNewLeague({...newLeague, pointsWin32: parseInt(e.target.value) || 0})}
                          className="mt-1 w-full px-2 py-1 border border-gray-300 rounded-md text-sm"
                      />
                  </div>
                   <div>
                      <label htmlFor="pointsLoss32" className="block text-xs font-medium text-gray-600">Punkte für 2:3 (Verlierer)</label>
                      <input
                          id="pointsLoss32"
                          type="number"
                          min="0"
                          value={newLeague.pointsLoss32}
                          onChange={(e) => setNewLeague({...newLeague, pointsLoss32: parseInt(e.target.value) || 0})}
                          className="mt-1 w-full px-2 py-1 border border-gray-300 rounded-md text-sm"
                      />
                  </div>
              </div>
          </fieldset>
          
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
                value={editingFixture.homeTeamId || ''} // Handle potential undefined
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
                value={editingFixture.awayTeamId || ''} // Handle potential undefined
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

            {/* Sets */}
            <div className="flex space-x-4">
              <div className="flex-1">
                <label htmlFor="homeSets" className="block text-sm font-medium text-gray-700">Sätze Heim</label>
                <input
                  type="number"
                  id="homeSets"
                  name="homeSets"
                  min="0" max="3"
                  value={editingFixture.homeSets ?? ''} 
                  onChange={handleFixtureInputChange}
                  placeholder="0-3"
                  className="mt-1 block w-full px-3 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                />
              </div>
              <div className="flex-1">
                <label htmlFor="awaySets" className="block text-sm font-medium text-gray-700">Sätze Auswärts</label>
                <input
                  type="number"
                  id="awaySets"
                  name="awaySets"
                  min="0" max="3"
                  value={editingFixture.awaySets ?? ''} 
                  onChange={handleFixtureInputChange}
                  placeholder="0-3"
                  className="mt-1 block w-full px-3 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                />
              </div>
            </div>

             {/* Points (Balls) - Optional */}
            <div className="flex space-x-4">
              <div className="flex-1">
                <label htmlFor="homePoints" className="block text-sm font-medium text-gray-700">Punkte Heim (Bälle)</label>
                <input
                  type="number"
                  id="homePoints"
                  name="homePoints"
                  min="0"
                  value={editingFixture.homePoints ?? ''} 
                  onChange={handleFixtureInputChange}
                  placeholder="Gesamtbälle"
                  className="mt-1 block w-full px-3 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                />
              </div>
              <div className="flex-1">
                <label htmlFor="awayPoints" className="block text-sm font-medium text-gray-700">Punkte Auswärts (Bälle)</label>
                <input
                  type="number"
                  id="awayPoints"
                  name="awayPoints"
                  min="0"
                  value={editingFixture.awayPoints ?? ''} 
                  onChange={handleFixtureInputChange}
                  placeholder="Gesamtbälle"
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

// --- Sortable Fixture Item Component ---
interface SortableFixtureItemProps {
  fixture: Fixture;
  onEditClick: (fixture: Fixture) => void;
  isLeagueActive: boolean;
}

function SortableFixtureItem({ fixture, onEditClick, isLeagueActive }: SortableFixtureItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging, // You can use this to style the item while dragging
  } = useSortable({ id: fixture.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1, // Example: make item semi-transparent while dragging
    touchAction: 'none', // Important for pointer/touch interactions
  };

  return (
    <li 
      ref={setNodeRef} 
      style={style} 
      className="flex justify-between items-center text-sm p-2 border rounded bg-white shadow-sm hover:bg-gray-50"
    >
      {/* Drag Handle */}
       <button 
          {...attributes} 
          {...listeners} 
          className="cursor-grab p-1 text-gray-400 hover:text-gray-600 mr-2"
          title="Verschieben"
        >
          <GripVerticalIcon className="h-5 w-5" />
       </button>

      {/* Fixture Details */}
      <div className="flex-grow flex items-center">
        {/* <span className="mr-2 text-gray-500 w-6 text-right">{fixture.order}.</span> */} {/* Order shown implicitly by position */}
        <span>{fixture.homeTeam?.name || 'N/A'} vs {fixture.awayTeam?.name || 'N/A'}</span>
        <span className="ml-4 text-gray-500 text-xs">
          {fixture.fixtureDate ? new Date(fixture.fixtureDate).toLocaleDateString('de-DE') : 'Datum N/A'}
        </span>
      </div>
      {/* Score (Sets and Match Points) */}
      <div className="flex items-center mx-4 space-x-3">
          <span className="font-semibold w-12 text-center text-base">
            {fixture.homeSets !== null && fixture.awaySets !== null
              ? `${fixture.homeSets} : ${fixture.awaySets}`
              : '- : -'}
          </span>
           <span className="font-normal w-12 text-center text-gray-600 text-xs">
            (P: {fixture.homeMatchPoints !== null && fixture.awayMatchPoints !== null
              ? `${fixture.homeMatchPoints} : ${fixture.awayMatchPoints}`
              : '- : -'})
          </span>
      </div>
      {/* Action Buttons Container */}
      <div className="flex items-center space-x-1 ml-2">
        <button
          onClick={() => onEditClick(fixture)}
          className={`p-1 ${isLeagueActive ? 'text-indigo-600 hover:text-indigo-900 hover:bg-indigo-100' : 'text-gray-400 cursor-not-allowed'} rounded`}
          title={isLeagueActive ? "Spielpaarung bearbeiten" : "Liga ist inaktiv"}
          disabled={!isLeagueActive}
        >
          <PencilIcon className="h-4 w-4" />
        </button>
        {/* Removed Up/Down buttons as Drag&Drop is used */}
      </div>
    </li>
  );
}
