'use client'

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Navigation from '@/components/Navbar';
import Modal from '@/components/Modal';
import { PencilIcon, TrashIcon, CalendarDaysIcon, ArrowsUpDownIcon, ArrowUpIcon, ArrowDownIcon, LockClosedIcon, LockOpenIcon, CheckIcon, LinkIcon, ClipboardIcon } from '@heroicons/react/24/outline';
import { Bars3Icon as GripVerticalIcon } from '@heroicons/react/24/outline'; // Verwende Bars3Icon als Ersatz für GripVerticalIcon
import { createSlug } from '@/lib/slugify';
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
import { toast } from 'react-toastify';
import DeleteConfirmation from '@/components/DeleteConfirmation'; // Import hinzufügen
import { ScoreEntryType } from '@prisma/client'; // Import the enum


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
  fixtureTime?: string | null // Add fixtureTime

  // Final Score (Sets Won) - Always populated when result is known
  homeScore?: number | null
  awayScore?: number | null

  // Individual Set Scores (only used if league.scoreEntryType == SET_SCORES)
  homeSet1?: number | null; awaySet1?: number | null;
  homeSet2?: number | null; awaySet2?: number | null;
  homeSet3?: number | null; awaySet3?: number | null;
  homeSet4?: number | null; awaySet4?: number | null; // For Bo5
  homeSet5?: number | null; awaySet5?: number | null; // For Bo5

  // Calculated match points based on league rules
  homeMatchPoints?: number | null // Points for the league table
  awayMatchPoints?: number | null // Points for the league table

  // Optional total points (balls)
  homePoints?: number | null;
  awayPoints?: number | null;

  order: number
}

interface League {
  id: number
  name: string
  slug: string
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
  // Add score entry config fields to interface
  scoreEntryType: ScoreEntryType
  setsToWin: number
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
    slug: '',
    numberOfTeams: 0,
    hasReturnMatches: false,
    teamIds: [] as number[],
    isActive: true,
    // Add default point rules for new league form
    pointsWin30: 3,
    pointsWin31: 3,
    pointsWin32: 2,
    pointsLoss32: 1,
    // Add new fields to state with defaults
    scoreEntryType: ScoreEntryType.MATCH_SCORE,
    setsToWin: 3,
  })
  const [editingLeague, setEditingLeague] = useState<League | null>(null)
  const [editingFixture, setEditingFixture] = useState<Partial<Fixture> | null>(null)
  // State to hold the score input data for the modal
  const [scoreInputData, setScoreInputData] = useState<any>(null); // Will hold { homeScore, awayScore } or { setScores: [...] }
  const [editingLeagueContext, setEditingLeagueContext] = useState<League | null>(null); // Store the league context for the fixture modal
  const [isFixtureModalOpen, setIsFixtureModalOpen] = useState(false)
  const [isOrderChanged, setIsOrderChanged] = useState(false)
  // State für Spielplan-Generierungsbestätigung
  const [showGenerateConfirmation, setShowGenerateConfirmation] = useState(false);
  const [leagueToGenerate, setLeagueToGenerate] = useState<League | null>(null);
  // State für Liga-Löschbestätigung
  const [showDeleteLeagueConfirmation, setShowDeleteLeagueConfirmation] = useState(false);
  const [leagueToDelete, setLeagueToDelete] = useState<League | null>(null);

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
     toast.warn('Spielpläne können nur für aktive Ligen generiert werden. Abgeschlossene Ligen müssen zuerst wieder aktiviert werden.');
     return;
   }

   // Statt confirm(), den State für den Dialog setzen
   setLeagueToGenerate(league);
   setShowGenerateConfirmation(true);
 };

 // Funktion, die nach Bestätigung im Dialog aufgerufen wird
 const confirmGenerateFixtures = async () => {
   if (!leagueToGenerate) return;

   const leagueId = leagueToGenerate.id;

   try {
     const response = await fetch(`/api/leagues/${leagueId}/generate-fixtures`, { method: 'POST' });
     const data = await response.json();
     if (response.ok) {
       toast.success(data.message || 'Spielplan erfolgreich generiert!');
       fetchLeagues(leagueId); // Refetch and select the current league
     } else {
       toast.error(`Fehler: ${data.message || 'Spielplan konnte nicht generiert werden.'}`, { autoClose: 8000 }); // Fehler-Toast bleibt länger
     }
   } catch (error) {
     console.error('Fehler beim Generieren des Spielplans:', error);
     toast.error('Ein Netzwerkfehler beim Generieren des Spielplans ist aufgetreten.', { autoClose: 8000 }); // Fehler-Toast bleibt länger
   } finally {
     // Dialog schließen und State zurücksetzen
     setShowGenerateConfirmation(false);
     setLeagueToGenerate(null);
   }
 };

 // Funktion zum Abbrechen des Dialogs
 const cancelGenerateFixtures = () => {
   setShowGenerateConfirmation(false);
   setLeagueToGenerate(null);
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
     toast.warn('Spielpaarungen können nur für aktive Ligen bearbeitet werden. Abgeschlossene Ligen müssen zuerst wieder aktiviert werden.');
     return;
   }

   // Prüfe Berechtigungen für normale Benutzer
   if (!isAdmin && userTeamId) {
     // Normale Benutzer dürfen nur Heimspiele ihrer eigenen Mannschaft bearbeiten
     if (fixture.homeTeamId !== userTeamId) {
       toast.warn('Sie können nur Heimspiele Ihrer eigenen Mannschaft bearbeiten.');
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
      fixtureTime: fixture.fixtureTime || '', // Ensure it's a string or empty string
    });

    // Initialize scoreInputData based on league type and existing fixture data
    const maxSets = 2 * league.setsToWin - 1;
    if (league.scoreEntryType === ScoreEntryType.SET_SCORES) {
      const initialSetScores = Array(maxSets).fill(null).map((_, i) => {
        const setNum = i + 1;
        return {
          home: fixture[`homeSet${setNum}` as keyof Fixture] ?? '', // Use empty string for input binding
          away: fixture[`awaySet${setNum}` as keyof Fixture] ?? '', // Use empty string for input binding
        };
      });
      setScoreInputData({ setScores: initialSetScores });
    } else { // MATCH_SCORE
      setScoreInputData({
        homeScore: fixture.homeScore ?? '', // Use empty string for input binding
        awayScore: fixture.awayScore ?? '', // Use empty string for input binding
        homePoints: fixture.homePoints ?? '', // Add points
        awayPoints: fixture.awayPoints ?? '', // Add points
      });
    }
    setEditingLeagueContext(league); // Store league context for the modal
    setIsFixtureModalOpen(true);
  };

  const handleUpdateFixture = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingFixture || !editingLeagueContext || !scoreInputData) return;

    // Prepare scoreData based on league type
    let scorePayload = null;
    if (editingLeagueContext.scoreEntryType === ScoreEntryType.MATCH_SCORE) {
      // Convert empty strings/null to null, otherwise convert to number
      const homeScore = scoreInputData.homeScore === '' || scoreInputData.homeScore === null ? null : Number(scoreInputData.homeScore);
      const awayScore = scoreInputData.awayScore === '' || scoreInputData.awayScore === null ? null : Number(scoreInputData.awayScore);

      // Only include scoreData if at least one score is entered
      if (homeScore !== null || awayScore !== null) {
         // Basic validation: if one is entered, both must be
         if (homeScore === null || awayScore === null) {
            toast.error('Bei Eingabe des Gesamtergebnisses müssen beide Werte (Heim/Gast) angegeben werden.');
            return;
         }
         scorePayload = {
           homeScore,
           awayScore,
           // Add points to payload
           homePoints: scoreInputData.homePoints === '' || scoreInputData.homePoints === null ? null : Number(scoreInputData.homePoints),
           awayPoints: scoreInputData.awayPoints === '' || scoreInputData.awayPoints === null ? null : Number(scoreInputData.awayPoints)
          };
      }
    } else { // SET_SCORES
      // Convert set scores, filter out completely empty sets
      const setScores = scoreInputData.setScores
        .map((set: { home: string | number | null, away: string | number | null }) => ({
          home: set.home === '' || set.home === null ? null : Number(set.home),
          away: set.away === '' || set.away === null ? null : Number(set.away),
        }))
        .filter((set: { home: number | null, away: number | null }) => set.home !== null || set.away !== null); // Keep sets where at least one score is entered

      // Only include scoreData if at least one set score is entered
      if (setScores.length > 0) {
         // Basic validation: if one score in a set is entered, the other must be too
         for (let i = 0; i < setScores.length; i++) {
             if ((setScores[i].home === null && setScores[i].away !== null) || (setScores[i].home !== null && setScores[i].away === null)) {
                 toast.error(`Satz ${i + 1}: Beide Punktwerte (Heim/Gast) müssen angegeben werden, wenn der Satz gespielt wurde.`);
                 return;
             }
         }
         scorePayload = { setScores };
      }
    }

    const bodyPayload = {
      fixtureDate: editingFixture.fixtureDate || null,
      fixtureTime: editingFixture.fixtureTime || null,
      ...(scorePayload && { scoreData: scorePayload }) // Only include scoreData if it's not null
    };

    try {
      const response = await fetch(`/api/fixtures/${editingFixture.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bodyPayload),
      });

      if (response.ok) {
        setIsFixtureModalOpen(false);
        setEditingFixture(null);
        setScoreInputData(null); // Reset score input state
        setEditingLeagueContext(null); // Reset league context
        fetchLeagues(selectedLeagueId); // Refetch to show updated fixture
        toast.success('Spielpaarung erfolgreich aktualisiert!');
      } else {
       const errorData = await response.json();
       toast.error(`Fehler: ${errorData.message || 'Spielpaarung konnte nicht aktualisiert werden.'}`, { autoClose: 8000 }); // Fehler-Toast bleibt länger
     }
   } catch (error) {
     console.error('Fehler beim Aktualisieren der Spielpaarung:', error);
     toast.error('Ein Netzwerkfehler beim Aktualisieren der Spielpaarung ist aufgetreten.', { autoClose: 8000 }); // Fehler-Toast bleibt länger
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

  // Handler for score input changes
  const handleScoreInputChange = (e: React.ChangeEvent<HTMLInputElement>, index?: number) => {
    if (!scoreInputData || !editingLeagueContext) return;
    const { name, value } = e.target;
    const processedValue = value.trim() === '' ? '' : value; // Keep empty string for input binding

    if (editingLeagueContext.scoreEntryType === ScoreEntryType.SET_SCORES && index !== undefined) {
      // Update specific set score in the array
      const updatedSetScores = [...scoreInputData.setScores];
      updatedSetScores[index] = {
        ...updatedSetScores[index],
        [name]: processedValue, // name will be 'home' or 'away'
      };
      setScoreInputData({ setScores: updatedSetScores });
    } else if (editingLeagueContext.scoreEntryType === ScoreEntryType.MATCH_SCORE) {
      // Update homeScore, awayScore, homePoints, or awayPoints
      setScoreInputData({
        ...scoreInputData,
        [name]: processedValue, // name will be 'homeScore', 'awayScore', 'homePoints', or 'awayPoints'
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
       toast.success('Spielplanreihenfolge erfolgreich gespeichert!');
       // Refetch to ensure data consistency after reordering on the server
       fetchLeagues(selectedLeagueId);
     } else {
       const errorData = await response.json();
       toast.error(`Fehler: ${errorData.message || 'Reihenfolge konnte nicht gespeichert werden.'}`, { autoClose: 8000 }); // Fehler-Toast bleibt länger
     }
   } catch (error) {
     console.error('Fehler beim Speichern der Spielplanreihenfolge:', error);
     toast.error('Ein Netzwerkfehler beim Speichern der Reihenfolge ist aufgetreten.', { autoClose: 8000 }); // Fehler-Toast bleibt länger
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
          slug: '', // Fehlendes Feld hinzugefügt
          numberOfTeams: 0,
          hasReturnMatches: false,
          teamIds: [],
          isActive: true, // Fehlendes Feld hinzugefügt
          pointsWin30: 3,
          pointsWin31: 3,
          pointsWin32: 2,
          pointsLoss32: 1,
          // Reset new fields as well
          scoreEntryType: ScoreEntryType.MATCH_SCORE,
          setsToWin: 3,
         });
        setIsModalOpen(false);
       fetchLeagues(); // Refetch all leagues
       toast.success('Liga erfolgreich hinzugefügt!');
     } else {
       const errorData = await response.json();
       toast.error(`Fehler: ${errorData.message || 'Liga konnte nicht hinzugefügt werden.'}`, { autoClose: 8000 }); // Fehler-Toast bleibt länger
     }
   } catch (error) {
     console.error('Fehler beim Hinzufügen der Liga', error);
     toast.error('Ein Netzwerkfehler beim Hinzufügen der Liga ist aufgetreten.', { autoClose: 8000 }); // Fehler-Toast bleibt länger
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
          slug: '', // Fehlendes Feld hinzugefügt
          numberOfTeams: 0,
          hasReturnMatches: false,
          teamIds: [],
          isActive: true, // Fehlendes Feld hinzugefügt
          pointsWin30: 3,
          pointsWin31: 3,
          pointsWin32: 2,
          pointsLoss32: 1,
          // Reset new fields as well
          scoreEntryType: ScoreEntryType.MATCH_SCORE,
          setsToWin: 3,
         });
        setIsModalOpen(false);
        setEditingLeague(null);
       fetchLeagues(); // Refetch all leagues
       toast.success('Liga erfolgreich aktualisiert!');
     } else {
       const errorData = await response.json();
       toast.error(`Fehler: ${errorData.message || 'Liga konnte nicht aktualisiert werden.'}`, { autoClose: 8000 }); // Fehler-Toast bleibt länger
     }
   } catch (error) {
     console.error('Fehler beim Bearbeiten der Liga', error);
     toast.error('Ein Netzwerkfehler beim Bearbeiten der Liga ist aufgetreten.', { autoClose: 8000 }); // Fehler-Toast bleibt länger
    }
  };

  // Funktion, um den Löschdialog für Ligen zu öffnen
  const handleDeleteLeague = (league: League) => {
    setLeagueToDelete(league);
    setShowDeleteLeagueConfirmation(true);
  };

  // Funktion, die die Löschung nach Bestätigung durchführt
  const confirmDeleteLeague = async () => {
    if (!leagueToDelete) return;
    const id = leagueToDelete.id;

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
        toast.success(`Liga '${leagueToDelete.name}' erfolgreich gelöscht!`);
      } else {
        const errorData = await response.json();
        toast.error(`Fehler: ${errorData.message || 'Liga konnte nicht gelöscht werden.'}`, { autoClose: 8000 }); // Fehler-Toast bleibt länger
      }
    } catch (error) {
      console.error('Fehler beim Löschen der Liga', error);
      toast.error('Ein Netzwerkfehler beim Löschen der Liga ist aufgetreten.', { autoClose: 8000 }); // Fehler-Toast bleibt länger
    } finally {
      // Dialog schließen und State zurücksetzen
      setShowDeleteLeagueConfirmation(false);
      setLeagueToDelete(null);
    }
  };

  // Funktion zum Abbrechen des Liga-Löschdialogs
  const cancelDeleteLeague = () => {
    setShowDeleteLeagueConfirmation(false);
    setLeagueToDelete(null);
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
                slug: '', // Fehlendes Feld hinzugefügt
                numberOfTeams: 0,
                hasReturnMatches: false,
                teamIds: [],
                isActive: true, // Fehlendes Feld hinzugefügt
                pointsWin30: 3,
                pointsWin31: 3,
                pointsWin32: 2,
                pointsLoss32: 1,
                // Reset new fields when opening for add
                scoreEntryType: ScoreEntryType.MATCH_SCORE,
                setsToWin: 3,
              });
              setIsModalOpen(true);
            }}
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mb-4"
          >
            Neue Liga hinzufügen
          </button>
        )}

        {/* Leagues List */}
        <ul className="bg-white dark:bg-card shadow overflow-hidden sm:rounded-md">
          {leagues.map((league) => (
            <li key={league.id} className="border-b border-gray-200 dark:border-border last:border-b-0">
              {/* League Header */}
              <div className="px-4 py-4 sm:px-6 flex justify-between items-center">
                <div>
                  <div className="flex items-center">
                    <p className="text-sm font-medium text-indigo-600 dark:text-indigo-400 truncate">{league.name}</p>
                    <span className={`ml-2 px-2 py-0.5 text-xs font-medium rounded-full ${league.isActive ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'}`}>
                      {league.isActive ? 'Aktiv' : 'Abgeschlossen'}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 dark:text-foreground">
                    {league.teams.length} / {league.numberOfTeams} Teams: {league.teams.map(team => team.name).join(', ') || 'Keine Teams zugewiesen'}
                  </p>
                  <p className="text-xs text-gray-400 dark:text-gray-500">
                    Erstellt am: {new Date(league.createdAt).toLocaleDateString('de-DE')}
                  </p>
                  <p className="text-xs text-gray-400 dark:text-gray-500">
                    Öffentlicher Link: <a href={`/public/league/${league.slug}`} target="_blank" className="text-blue-500 hover:underline">/public/league/{league.slug}</a>
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
                            slug: league.slug,
                            numberOfTeams: league.numberOfTeams,
                            hasReturnMatches: league.hasReturnMatches,
                            teamIds: league.teams.map(team => team.id),
                            isActive: league.isActive,
                            // Load existing point rules when editing
                            pointsWin30: league.pointsWin30,
                            pointsWin31: league.pointsWin31,
                            pointsWin32: league.pointsWin32,
                            pointsLoss32: league.pointsLoss32,
                            // Load existing score config when editing
                            scoreEntryType: league.scoreEntryType,
                            setsToWin: league.setsToWin,
                          });
                          setIsModalOpen(true);
                        }}
                        className="p-1 text-indigo-600 hover:text-indigo-900 hover:bg-indigo-100 rounded"
                        title="Liga bearbeiten"
                      >
                        <PencilIcon className="h-5 w-5" />
                      </button>
                      <button
                        // onClick anpassen, um den Dialog zu öffnen
                        onClick={() => handleDeleteLeague(league)}
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
                            slug: league.slug,
                            numberOfTeams: league.numberOfTeams,
                            hasReturnMatches: league.hasReturnMatches,
                            teamIds: league.teams.map(team => team.id),
                            isActive: !league.isActive, // Umkehren des aktuellen Status
                            pointsWin30: league.pointsWin30,
                            pointsWin31: league.pointsWin31,
                            pointsWin32: league.pointsWin32,
                            pointsLoss32: league.pointsLoss32,
                            // Load existing score config when editing (for toggle active)
                            scoreEntryType: league.scoreEntryType,
                            setsToWin: league.setsToWin,
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
                <div className="px-4 py-4 sm:px-6 border-t border-gray-200 dark:border-border bg-gray-50 dark:bg-muted">
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
                              league={league} // Pass league context
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
 
      {/* Add/Edit League Modal - Increase width using max-w- class */}
      <Modal isOpen={isModalOpen} onClose={() => { setIsModalOpen(false); setEditingLeague(null); }} title={editingLeague ? "Liga bearbeiten" : "Neue Liga hinzufügen"} maxWidth="max-w-2xl"> {/* Added maxWidth prop */}
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
          
          <div className="mt-4">
            <label htmlFor="leagueSlug" className="block text-sm font-medium text-gray-700">URL-Slug</label>
            <div className="mt-1 flex rounded-md shadow-sm">
              <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-500 text-sm">
                /public/league/
              </span>
              <input
                id="leagueSlug"
                type="text"
                value={newLeague.slug}
                onChange={(e) => setNewLeague({...newLeague, slug: e.target.value})}
                placeholder={newLeague.name ? createSlug(newLeague.name) : "volleyball-liga-2024"}
                className="flex-1 min-w-0 block w-full px-3 py-2 rounded-none rounded-r-md border border-gray-300 focus:outline-none focus:ring focus:ring-indigo-100 focus:border-indigo-300"
              />
            </div>
            <p className="mt-1 text-xs text-gray-500">
              Dieser Wert wird in der URL verwendet. Nur Kleinbuchstaben, Zahlen und Bindestriche erlaubt. Leer lassen für automatische Generierung aus dem Namen.
            </p>
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
 
          {/* Score Entry Configuration Section */}
          <fieldset className="border border-gray-300 p-3 rounded-md">
            <legend className="text-sm font-medium text-gray-700 px-1">Ergebniseingabe</legend>
            <div className="grid grid-cols-2 gap-x-4 gap-y-2 mt-1">
              {/* Score Entry Type */}
              <div>
                <label htmlFor="scoreEntryType" className="block text-xs font-medium text-gray-600">Art der Eingabe</label>
                <select
                  id="scoreEntryType"
                  name="scoreEntryType"
                  value={newLeague.scoreEntryType}
                  onChange={(e) => setNewLeague({ ...newLeague, scoreEntryType: e.target.value as ScoreEntryType })}
                  className="mt-1 w-full px-2 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring focus:ring-indigo-100 focus:border-indigo-300"
                >
                  <option value={ScoreEntryType.MATCH_SCORE}>Nur Gesamtsätze (z.B. 3:1)</option>
                  <option value={ScoreEntryType.SET_SCORES}>Einzelne Satzergebnisse (z.B. 25:20, 23:25, ...)</option>
                </select>
              </div>
              {/* Sets to Win */}
              <div>
                <label htmlFor="setsToWin" className="block text-xs font-medium text-gray-600">Gewinnsätze</label>
                <select
                  id="setsToWin"
                  name="setsToWin"
                  value={newLeague.setsToWin}
                  onChange={(e) => setNewLeague({ ...newLeague, setsToWin: parseInt(e.target.value) || 3 })}
                  className="mt-1 w-full px-2 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring focus:ring-indigo-100 focus:border-indigo-300"
                >
                  <option value={2}>2 (Best-of-3)</option>
                  <option value={3}>3 (Best-of-5)</option>
                  {/* Add more options if needed */}
                </select>
              </div>
            </div>
          </fieldset>
 
          {/* Point Rules Section (Moved Here) */}
          <fieldset className="border border-gray-300 p-3 rounded-md">
              <legend className="text-sm font-medium text-gray-700 px-1">Punktregeln</legend>
              <div className="grid grid-cols-2 gap-x-4 gap-y-2 mt-1">
                  <div>
                      <label htmlFor="pointsWin30" className="block text-xs font-medium text-gray-600">Punkte für 3:0 / 2:0</label> {/* Adjusted label */}
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
                      <label htmlFor="pointsWin31" className="block text-xs font-medium text-gray-600">Punkte für 3:1 / 2:1</label> {/* Adjusted label */}
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
                         toast.warn(`Es können maximal ${maxTeams} Teams zugewiesen werden.`);
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
      <Modal isOpen={isFixtureModalOpen} onClose={() => { setIsFixtureModalOpen(false); setEditingFixture(null); setScoreInputData(null); setEditingLeagueContext(null); }} title="Spielpaarung bearbeiten/Ergebnis eintragen">
        {editingFixture && editingLeagueContext && scoreInputData && (
          <form onSubmit={handleUpdateFixture} className="space-y-4">
            {/* Display Teams (Readonly) */}
            <div className="p-3 bg-gray-100 dark:bg-muted/50 rounded-md border border-gray-200 dark:border-border">
              <p className="text-center font-semibold text-gray-800 dark:text-foreground">
                {editingFixture.homeTeam?.name || 'N/A'} <span className="font-normal">vs</span> {editingFixture.awayTeam?.name || 'N/A'}
              </p>
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
 
            {/* Fixture Time */}
            <div>
              <label htmlFor="fixtureTime" className="block text-sm font-medium text-gray-700">Uhrzeit</label>
              <input
                type="time"
                id="fixtureTime"
                name="fixtureTime"
                value={editingFixture.fixtureTime || ''}
                onChange={handleFixtureInputChange}
                className="mt-1 block w-full pl-3 pr-3 py-2 text-base border-gray-300 dark:border-border dark:bg-input dark:text-foreground focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
              />
            </div>

            {/* --- Score Input Section (Conditional) --- */}
            <fieldset className="border border-gray-300 dark:border-border p-3 rounded-md">
              <legend className="text-sm font-medium text-gray-700 dark:text-gray-300 px-1">Ergebnis</legend>
              <div className="mt-2 space-y-3">

                {/* Case 1: MATCH_SCORE */}
                {editingLeagueContext.scoreEntryType === ScoreEntryType.MATCH_SCORE && (
                  <div className="space-y-3"> {/* Wrap in a div for spacing */}
                    {/* Set Scores */}
                    <div className="flex space-x-4">
                      <div className="flex-1">
                        <label htmlFor="homeScore" className="block text-xs font-medium text-gray-600 dark:text-gray-400">Sätze Heim</label>
                      <input
                        type="number"
                        id="homeScore"
                        name="homeScore"
                        min="0" max={editingLeagueContext.setsToWin}
                        value={scoreInputData.homeScore ?? ''}
                        onChange={(e) => handleScoreInputChange(e)}
                        placeholder={`0-${editingLeagueContext.setsToWin}`}
                        className="mt-1 block w-full px-3 py-1.5 text-base border-gray-300 dark:border-border dark:bg-input dark:text-foreground focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                      />
                    </div>
                    <div className="flex-1">
                      <label htmlFor="awayScore" className="block text-xs font-medium text-gray-600 dark:text-gray-400">Sätze Gast</label>
                      <input
                        type="number"
                        id="awayScore"
                        name="awayScore"
                        min="0" max={editingLeagueContext.setsToWin}
                        value={scoreInputData.awayScore ?? ''}
                        onChange={(e) => handleScoreInputChange(e)}
                        placeholder={`0-${editingLeagueContext.setsToWin}`}
                        className="mt-1 block w-full px-3 py-1.5 text-base border-gray-300 dark:border-border dark:bg-input dark:text-foreground focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                      />
                      </div>
                    </div>
                    {/* Total Points (Balls) */}
                    <div className="flex space-x-4">
                      <div className="flex-1">
                        <label htmlFor="homePoints" className="block text-xs font-medium text-gray-600 dark:text-gray-400">Bälle Heim</label>
                        <input
                          type="number"
                          id="homePoints"
                          name="homePoints"
                          min="0"
                          value={scoreInputData.homePoints ?? ''}
                          onChange={(e) => handleScoreInputChange(e)}
                          placeholder="Gesamtbälle"
                          className="mt-1 block w-full px-3 py-1.5 text-base border-gray-300 dark:border-border dark:bg-input dark:text-foreground focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                        />
                      </div>
                      <div className="flex-1">
                        <label htmlFor="awayPoints" className="block text-xs font-medium text-gray-600 dark:text-gray-400">Bälle Gast</label>
                        <input
                          type="number"
                          id="awayPoints"
                          name="awayPoints"
                          min="0"
                          value={scoreInputData.awayPoints ?? ''}
                          onChange={(e) => handleScoreInputChange(e)}
                          placeholder="Gesamtbälle"
                          className="mt-1 block w-full px-3 py-1.5 text-base border-gray-300 dark:border-border dark:bg-input dark:text-foreground focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Case 2: SET_SCORES */}
                {editingLeagueContext.scoreEntryType === ScoreEntryType.SET_SCORES && (
                  <div className="space-y-2">
                    {scoreInputData.setScores.map((set: any, index: number) => (
                      <div key={index} className="flex items-center space-x-2">
                        <label className="w-12 text-sm font-medium text-gray-600 dark:text-gray-400 text-right">Satz {index + 1}:</label>
                        <input
                          type="number"
                          name="home"
                          min="0"
                          value={set.home ?? ''}
                          onChange={(e) => handleScoreInputChange(e, index)}
                          placeholder="Heim"
                          className="flex-1 block w-full px-2 py-1 text-base border-gray-300 dark:border-border dark:bg-input dark:text-foreground focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                        />
                        <span className="text-gray-500">:</span>
                        <input
                          type="number"
                          name="away"
                          min="0"
                          value={set.away ?? ''}
                          onChange={(e) => handleScoreInputChange(e, index)}
                          placeholder="Gast"
                          className="flex-1 block w-full px-2 py-1 text-base border-gray-300 dark:border-border dark:bg-input dark:text-foreground focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                        />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </fieldset>

            {/* Submit Button */}
            <button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:bg-primary dark:hover:bg-primary/90"
            >
              Speichern
            </button>
          </form>
        )}
      </Modal>

      {/* Bestätigungsdialog für Spielplan-Generierung */}
      {showGenerateConfirmation && leagueToGenerate && (
        <DeleteConfirmation
          onConfirm={confirmGenerateFixtures}
          onCancel={cancelGenerateFixtures}
          message={`Möchten Sie den Spielplan für Liga "${leagueToGenerate.name}" wirklich generieren? Bestehende Spielpläne für diese Liga werden überschrieben.`}
          confirmButtonText="Generieren"
        />
      )}

      {/* Bestätigungsdialog für Liga löschen */}
      {showDeleteLeagueConfirmation && leagueToDelete && (
        <DeleteConfirmation
          onConfirm={confirmDeleteLeague}
          onCancel={cancelDeleteLeague}
          message={`Möchten Sie die Liga "${leagueToDelete.name}" wirklich löschen? Alle zugehörigen Spielpläne werden ebenfalls unwiderruflich gelöscht.`}
          // confirmButtonText bleibt Standard "Löschen"
        />
      )}
    </>
  );
}

// --- Sortable Fixture Item Component ---
interface SortableFixtureItemProps {
  fixture: Fixture;
  league: League; // Add league context
  onEditClick: (fixture: Fixture) => void;
  isLeagueActive: boolean;
}

function SortableFixtureItem({ fixture, league, onEditClick, isLeagueActive }: SortableFixtureItemProps) {
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
      className="flex justify-between items-center text-sm p-2 border rounded bg-white dark:bg-card dark:border-border shadow-sm hover:bg-gray-50 dark:hover:bg-muted"
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
          {fixture.fixtureTime ? ` ${fixture.fixtureTime}` : ''} {/* Display time if available */}
        </span>
      </div>
      {/* Score Display (Conditional) */}
      <div className="flex items-center mx-4 space-x-3">
        {/* Main Score Display */}
        <span className="font-semibold w-auto text-center text-base">
          {fixture.homeScore !== null && fixture.awayScore !== null
            ? (league.scoreEntryType === ScoreEntryType.SET_SCORES
                ? [1, 2, 3, 4, 5] // Max 5 sets
                    .map(setNum => ({
                      home: fixture[`homeSet${setNum}` as keyof Fixture],
                      away: fixture[`awaySet${setNum}` as keyof Fixture],
                    }))
                    .filter(set => set.home !== null && set.away !== null) // Only show played sets
                    .map(set => `${set.home}:${set.away}`)
                    .join(', ')
                : `${fixture.homeScore} : ${fixture.awayScore}` // Show match score for MATCH_SCORE type
              )
            : '- : -'}
        </span>
        {/* Match Points Display */}
        <span className="font-normal w-auto text-center text-gray-600 dark:text-gray-400 text-xs">
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
