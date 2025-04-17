'use client'

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Navigation from '@/components/Navbar';
import Modal from '@/components/Modal';
import { PencilIcon, TrashIcon, CalendarDaysIcon, ArrowsUpDownIcon, ArrowUpIcon, ArrowDownIcon, LockClosedIcon, LockOpenIcon, CheckIcon, LinkIcon, ClipboardIcon, ArrowsRightLeftIcon } from '@heroicons/react/24/outline'; // Import ArrowsRightLeftIcon
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
    scoreEntryType: 'MATCH_SCORE' as ScoreEntryType, // Use string literal for default
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

  // --- User state (Removed currentUser, isAdmin, userTeamId as middleware handles auth) ---

  // --- Fetch initial data ---
  useEffect(() => {
    // Removed fetchCurrentUser() call
    fetchLeagues()
    fetchTeams()
  }, [])

  const router = useRouter() // Keep router if needed for other purposes

  // Removed fetchCurrentUser function

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
    }
    
    // Removed permission check for non-admins, as only admins can access this page now.
     
    setEditingFixture({
      ...fixture,
      fixtureDate: fixture.fixtureDate ? new Date(fixture.fixtureDate).toISOString().split('T')[0] : null,
      // Include new fields when starting edit
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
    let scorePayload: any = null;
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

    // Validate that home and away teams are different
    if (editingFixture.homeTeamId && editingFixture.awayTeamId && editingFixture.homeTeamId === editingFixture.awayTeamId) {
       toast.error('Heim- und Auswärtsteam dürfen nicht identisch sein.');
       return;
    }

    const bodyPayload = {
      homeTeamId: editingFixture.homeTeamId ? Number(editingFixture.homeTeamId) : null, // Send updated team IDs
      awayTeamId: editingFixture.awayTeamId ? Number(editingFixture.awayTeamId) : null, // Send updated team IDs
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
 
  // Handler to swap home and away teams in the modal state
  const handleSwapTeams = () => {
    if (!editingFixture) return;
    const currentHomeId = editingFixture.homeTeamId;
    const currentAwayId = editingFixture.awayTeamId;
    setEditingFixture({
      ...editingFixture,
      homeTeamId: currentAwayId,
      awayTeamId: currentHomeId,
    });
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
          scoreEntryType: 'MATCH_SCORE' as ScoreEntryType, // Use string literal
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
          Ligen verwalten
        </h1>
        
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
                scoreEntryType: 'MATCH_SCORE' as ScoreEntryType, // Use string literal
                setsToWin: 3,
              });
              setIsModalOpen(true);
            }}
            className="btn btn-primary py-2 px-4  mb-4"
          >
            Neue Liga hinzufügen
          </button>
       
       <div className="card bg-base-100 shadow-xl mt-4">
         <div className="card-body p-0"> 
           <ul className="divide-y divide-base-300">
         {leagues.map((league) => (
           <li key={league.id} className="hover:bg-base-200 transition-colors duration-150"> 
             <div className="px-4 py-4 sm:px-6 flex justify-between items-center">
               <div>
                 <div className="flex items-center">
                   <p className="text-md font-medium truncate">{league.name}</p>
                   <span className={`ml-2 badge badge-xs ${league.isActive ? 'badge-success' : 'badge-warning'}`}> 
                     {league.isActive ? 'Aktiv' : 'Abgeschlossen'}
                   </span>
                 </div>
                 <p className="text-xs text-base-content/70 mt-1"> 
                   {league.teams.length} / {league.numberOfTeams} Teams: {league.teams.map(team => team.name).join(', ') || 'Keine Teams zugewiesen'}
                 </p>
                 <p className="text-xs text-base-content/50 mt-1"> 
                   Erstellt am: {new Date(league.createdAt).toLocaleDateString('de-DE')}
                 </p>
                 <p className="text-xs text-base-content/50 mt-1">
                   Öffentlicher Link: <a href={`/public/league/${league.slug}`} target="_blank" className="link link-primary">/public/league/{league.slug}</a>
                 </p>
               </div>
               <div className="flex items-center space-x-1"> 
                   {/* Tooltip Wrapper */}
                   <div className="tooltip" data-tip="Liga bearbeiten">
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
                         className="p-1 btn btn-sm btn-soft btn-secondary" // Reverted to btn-soft
                         // title removed
                       >
                         <PencilIcon className="h-5 w-5" />
                     </button>
                     <button
                       // onClick anpassen, um den Dialog zu öffnen
                       onClick={() => handleDeleteLeague(league)}
                       className="p-1 btn btn-sm btn-soft btn-error" // Reverted to btn-soft
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
                       className={`p-1 btn btn-sm btn-soft ${league.isActive ? 'btn-warning' : 'btn-success'}`} // Reverted to btn-soft
                       title={league.isActive ? "Liga abschließen" : "Liga wieder aktivieren"}
                     >
                       {league.isActive ? <LockClosedIcon className="h-5 w-5" /> : <LockOpenIcon className="h-5 w-5" />}
                     </button>
                     <button
                       onClick={() => handleGenerateFixtures(league.id)}
                       className={`p-1 btn btn-sm btn-soft ${league.isActive ? 'btn-success' : 'btn-disabled'}`} // Reverted to btn-soft
                       title={league.isActive ? "Spielplan generieren" : "Liga ist abgeschlossen"}
                       disabled={!league.isActive}
                     >
                       <CalendarDaysIcon className="h-5 w-5" />
                     </button>
                 <button
                   onClick={() => handleShowFixtures(league.id)}
                   className="p-1 btn btn-sm btn-soft btn-accent" // Reverted to btn-soft
                   title={selectedLeagueId === league.id ? "Spielplan verbergen" : "Spielplan anzeigen"}
                 >
                   <ArrowsUpDownIcon className="h-5 w-5" />
                 </button>
               </div>
             </div>

             {/* Fixtures Section (Conditional) */}
             {selectedLeagueId === league.id && (
               <div className="px-4 py-4 sm:px-6 border-t border-gray-200 dark:border-border bg-base-content/10">
                 <div className="flex justify-between items-center mb-3">
                   <h3 className="text-lg font-semibold text-base-content/70">Spielplan</h3>                   
                   {isOrderChanged && (
                      <button
                        onClick={handleSaveFixtureOrder}
                        className="btn btn-sm btn-success" // DaisyUI success button, small size
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
       </div> 
     </div>

     {/* Add/Edit League Modal - Apply width class */}
     <Modal 
       isOpen={isModalOpen} 
       onClose={() => { setIsModalOpen(false); setEditingLeague(null); }} 
       title={editingLeague ? "Liga bearbeiten" : "Neue Liga hinzufügen"} 
       className="max-w-3xl" // Set desired max-width here
     >
         <form onSubmit={editingLeague ? handleEditLeague : handleAddLeague} className="space-y-4 p-1">
           <label className="floating-label w-full">
             <input
               id="leagueName"
               type="text"
               value={newLeague.name}
               onChange={(e) => setNewLeague({...newLeague, name: e.target.value, slug: !newLeague.slug || editingLeague?.slug === createSlug(editingLeague?.name || '') ? createSlug(e.target.value) : newLeague.slug })}
               placeholder="Liganame" // Placeholder needed
               required
               className="input input-bordered w-full"
             />
             <span>Liganame</span>
           </label>

           <label className="form-control w-full">
             <div className="join w-full">
               <span className="btn join-item rounded-l-full pointer-events-none">/public/league/</span>
               <input
                 id="leagueSlug"
                 type="text"
                 value={newLeague.slug}
                 onChange={(e) => setNewLeague({...newLeague, slug: createSlug(e.target.value)})}
                 placeholder={newLeague.name ? createSlug(newLeague.name) : "liga-url-name"}
                 className="input input-bordered join-item w-full"
               />
             </div>             
           </label>
           <div className="label">
            <span className="label-text-alt">Nur Kleinbuchstaben, Zahlen, Bindestriche.</span>
           </div>

           <label className="floating-label w-full">
             <input
               id="numberOfTeams"
               type="number"
               min="2"
               value={newLeague.numberOfTeams}
               onChange={(e) => setNewLeague({...newLeague, numberOfTeams: parseInt(e.target.value) || 0})}
               required
               placeholder=" " // Placeholder needed
               className="input input-bordered w-full"
             />
             <span>Anzahl Teams</span>
           </label>

           <div className="flex gap-4">
             <div className="form-control">
               <label className="label cursor-pointer gap-2">
                 <span className="label-text">Hin-/Rückrunde</span>
                 <input
                   id="hasReturnMatches"
                   type="checkbox"
                   checked={newLeague.hasReturnMatches}
                   onChange={(e) => setNewLeague({...newLeague, hasReturnMatches: e.target.checked})}
                   className="checkbox checkbox-primary"
                 />
               </label>
             </div>
             <div className="form-control">
               <label className="label cursor-pointer gap-2">
                 <span className="label-text">Liga aktiv</span>
                 <input
                   id="isActive"
                   type="checkbox"
                   checked={newLeague.isActive}
                   onChange={(e) => setNewLeague({...newLeague, isActive: e.target.checked})}
                   className="checkbox checkbox-primary"
                 />
               </label>
             </div>
           </div>

         
         <fieldset className="border border-base-300 p-3 rounded-md">
           <legend className="text-sm font-medium px-1">Ergebniseingabe & Zählweise</legend>
           <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-1">
             <label className="form-control w-full">
               <div className="label">
                 <span className="label-text">Art der Eingabe</span>
               </div>
               <select
                 id="scoreEntryType"
                 name="scoreEntryType"
                 value={newLeague.scoreEntryType}
                 onChange={(e) => setNewLeague({ ...newLeague, scoreEntryType: e.target.value as ScoreEntryType })}
                 className="select select-bordered w-full"
               >
                 <option value={ScoreEntryType.MATCH_SCORE}>Nur Gesamtsätze (z.B. 3:1)</option>
                 <option value={ScoreEntryType.SET_SCORES}>Einzelne Satzergebnisse (z.B. 25:20, ...)</option>
               </select>
             </label>
             <label className="form-control w-full">
               <div className="label">
                 <span className="label-text">Gewinnsätze</span>
               </div>
               <select
                 id="setsToWin"
                 name="setsToWin"
                 value={newLeague.setsToWin}
                 onChange={(e) => setNewLeague({ ...newLeague, setsToWin: parseInt(e.target.value) || 3 })}
                 className="select select-bordered w-full"
               >
                 <option value={2}>2 (Best-of-3)</option>
                 <option value={3}>3 (Best-of-5)</option>
               </select>
             </label>
             </div>
           </fieldset>
        
           <fieldset className="border border-base-300 p-3 rounded-md">
             <legend className="text-sm font-medium px-1">Punktregeln (Tabelle)</legend>
             <div className="grid grid-cols-2 gap-4 mt-1">
               <label className="floating-label w-full">
                 <input
                     id="pointsWin30"
                     type="number"
                     min="0"
                     value={newLeague.pointsWin30}
                     onChange={(e) => setNewLeague({...newLeague, pointsWin30: parseInt(e.target.value) || 0})}
                     placeholder=" "
                     className="input input-bordered w-full text-sm"
                 />
                 <span className="text-xs">Punkte 3:0 / 2:0</span>
               </label>
               <label className="floating-label w-full">
                 <input
                     id="pointsWin31"
                     type="number"
                     min="0"
                     value={newLeague.pointsWin31}
                     onChange={(e) => setNewLeague({...newLeague, pointsWin31: parseInt(e.target.value) || 0})}
                     placeholder=" "
                     className="input input-bordered w-full text-sm"
                 />
                   <span className="text-xs">Punkte 3:1 / 2:1</span>
               </label>
               <label className="floating-label w-full">
                 <input
                     id="pointsWin32"
                     type="number"
                     min="0"
                     value={newLeague.pointsWin32}
                     onChange={(e) => setNewLeague({...newLeague, pointsWin32: parseInt(e.target.value) || 0})}
                     placeholder=" "
                     className="input input-bordered w-full text-sm"
                 />
                 <span className="text-xs">Punkte 3:2 (Sieger)</span>
               </label>
               <label className="floating-label w-full">
                 <input
                     id="pointsLoss32"
                     type="number"
                     min="0"
                     value={newLeague.pointsLoss32}
                     onChange={(e) => setNewLeague({...newLeague, pointsLoss32: parseInt(e.target.value) || 0})}
                     placeholder=" "
                     className="input input-bordered w-full text-sm"
                 />
                 <span className="text-xs">Punkte 2:3 (Verlierer)</span>
               </label>
             </div>
           </fieldset>

         <div className="form-control">
           <label className="label">
             <span className="label-text">Teams zuordnen (max. {newLeague.numberOfTeams || 'N/A'})</span>
           </label>
           <div className="mt-1 max-h-40 overflow-y-auto border border-base-300 rounded-md p-2 space-y-1 bg-base-100">
             {teams.length > 0 ? teams.map(team => (
               <div key={team.id} className="form-control">
                 <label className="label cursor-pointer justify-start gap-2">
                   <input
                     type="checkbox"
                     id={`team-${team.id}`}
                     checked={newLeague.teamIds.includes(team.id)}
                     disabled={!newLeague.teamIds.includes(team.id) && newLeague.teamIds.length >= newLeague.numberOfTeams}
                     onChange={(e) => {
                       const isChecked = e.target.checked;
                       const currentTeamIds = newLeague.teamIds;
                       const maxTeams = newLeague.numberOfTeams;

                       if (isChecked) {
                         if (currentTeamIds.length < maxTeams) {
                           setNewLeague({ ...newLeague, teamIds: [...currentTeamIds, team.id] });
                         } else {
                           e.target.checked = false;
                           toast.warn(`Es können maximal ${maxTeams} Teams zugewiesen werden.`);
                         }
                       } else {
                         setNewLeague({ ...newLeague, teamIds: currentTeamIds.filter(id => id !== team.id) });
                       }
                     }}
                     className="checkbox checkbox-sm checkbox-primary disabled:opacity-50"
                   />
                   <span className="label-text text-sm">{team.name}</span>
                 </label>
               </div>
             )) : <p className="text-sm text-base-content/70 p-2">Keine Teams verfügbar.</p>}
           </div>
           <div className="label">
             <span className="label-text-alt">{newLeague.teamIds.length} von {newLeague.numberOfTeams || 0} Teams ausgewählt</span>
           </div>
         </div>
         <div className="modal-action mt-6">
           <button type="button" className="btn btn-ghost" onClick={() => { setIsModalOpen(false); setEditingLeague(null); }}>Abbrechen</button>
           <button
             type="submit"
             className="btn btn-primary"
           >
             {editingLeague ? "Liga aktualisieren" : "Liga hinzufügen"}
           </button>
         </div>
       </form>
     </Modal>
    
     <Modal isOpen={isFixtureModalOpen} onClose={() => { setIsFixtureModalOpen(false); setEditingFixture(null); setScoreInputData(null); setEditingLeagueContext(null); }} title="Spielpaarung bearbeiten">
       {editingFixture && editingLeagueContext && scoreInputData && (
         <form onSubmit={handleUpdateFixture} className="space-y-4 p-1">
           <div className="grid grid-cols-[1fr_auto_1fr] gap-x-2 items-end">
             <label className="form-control w-full">
               <div className="label">
                 <span className="label-text">Heimteam</span>
               </div>
               <select
                 id="homeTeamId"
                 name="homeTeamId"
                 value={editingFixture.homeTeamId || ''}
                 onChange={handleFixtureInputChange}
                 required
                 className="select select-bordered w-full"
               >
                 <option value="" disabled>Wählen...</option>
                 {editingLeagueContext?.teams.map(team => (
                   <option key={team.id} value={team.id}>{team.name}</option>
                 ))}
               </select>
             </label>
             <button
               type="button"
               onClick={handleSwapTeams}
               className="btn btn-square btn-ghost"
               title="Teams tauschen"
             >
               <ArrowsRightLeftIcon className="h-5 w-5" />
             </button>
             <label className="form-control w-full">
               <div className="label">
                 <span className="label-text">Auswärtsteam</span>
               </div>
               <select
                 id="awayTeamId"
                 name="awayTeamId"
                 value={editingFixture.awayTeamId || ''}
                 onChange={handleFixtureInputChange}
                 required
                 className="select select-bordered w-full"
               >
                 <option value="" disabled>Wählen...</option>
                 {editingLeagueContext?.teams.map(team => (
                   <option key={team.id} value={team.id}>{team.name}</option>
                 ))}
               </select>
             </label>
           </div>

           <label className="floating-label w-full">
             <input
               type="date"
               id="fixtureDate"
               name="fixtureDate"
               value={editingFixture.fixtureDate || ''}
               onChange={handleFixtureInputChange}
               placeholder=" " // Placeholder needed
               className="input input-bordered w-full"
             />
             <span>Datum</span>
           </label>

           <label className="floating-label w-full">
             <input
               type="time"
               id="fixtureTime"
               name="fixtureTime"
               value={editingFixture.fixtureTime || ''}
               onChange={handleFixtureInputChange}
               placeholder=" " // Placeholder needed
               className="input input-bordered w-full"
             />
             <span>Uhrzeit</span>
           </label>

           <fieldset className="border border-base-300 p-3 rounded-md">
             <legend className="text-sm font-medium px-1">Ergebnis</legend>
             <div className="mt-2 space-y-3">
               
               {editingLeagueContext.scoreEntryType === ScoreEntryType.MATCH_SCORE && (
                 <div className="space-y-3">
                   <div className="flex gap-4">
                     <label className="floating-label w-full">
                       <input
                         type="number"
                         id="homeScore"
                         name="homeScore"
                         min="0" max={editingLeagueContext.setsToWin}
                         value={scoreInputData.homeScore ?? ''}
                         onChange={(e) => handleScoreInputChange(e)}
                         placeholder=" "
                         className="input input-bordered w-full text-sm"
                       />
                        <span className="text-xs">Sätze Heim</span>
                     </label>
                     <label className="floating-label w-full">
                       <input
                         type="number"
                         id="awayScore"
                         name="awayScore"
                         min="0" max={editingLeagueContext.setsToWin}
                         value={scoreInputData.awayScore ?? ''}
                         onChange={(e) => handleScoreInputChange(e)}
                         placeholder=" "
                         className="input input-bordered w-full text-sm"
                       />
                       <span className="text-xs">Sätze Gast</span>
                     </label>
                   </div>
                   <div className="flex gap-4">
                     <label className="floating-label w-full">
                       <input
                         type="number"
                         id="homePoints"
                         name="homePoints"
                         min="0"
                         value={scoreInputData.homePoints ?? ''}
                         onChange={(e) => handleScoreInputChange(e)}
                         placeholder=" "
                         className="input input-bordered w-full text-sm"
                       />
                       <span className="text-xs">Bälle Heim (Optional)</span>
                     </label>
                     <label className="floating-label w-full">
                       <input
                         type="number"
                         id="awayPoints"
                         name="awayPoints"
                         min="0"
                         value={scoreInputData.awayPoints ?? ''}
                         onChange={(e) => handleScoreInputChange(e)}
                         placeholder=" "
                         className="input input-bordered w-full text-sm"
                       />
                       <span className="text-xs">Bälle Gast (Optional)</span>
                     </label>
                     </div>
                   </div>
               )}
              
               {editingLeagueContext.scoreEntryType === ScoreEntryType.SET_SCORES && (
                 <div className="space-y-2">
                   {scoreInputData.setScores.map((set: any, index: number) => (
                     <div key={index} className="flex items-center gap-2">
                       <label className="w-16 text-sm font-medium text-right shrink-0">Satz {index + 1}:</label>
                       <input
                         type="number"
                         name="home"
                         min="0"
                         value={set.home ?? ''}
                         onChange={(e) => handleScoreInputChange(e, index)}
                         placeholder="Heim"
                         className="input input-bordered input-sm w-full" // Use input-sm
                       />
                       <span className="text-base-content/50">:</span>
                       <input
                         type="number"
                         name="away"
                         min="0"
                         value={set.away ?? ''}
                         onChange={(e) => handleScoreInputChange(e, index)}
                         placeholder="Gast"
                         className="input input-bordered input-sm w-full" // Use input-sm
                       />
                     </div>
                   ))}
                 </div>
               )}
             </div>
           </fieldset>

           {/* Submit Button */}
           <div className="modal-action mt-6">
              <button type="button" className="btn btn-ghost" onClick={() => { setIsFixtureModalOpen(false); setEditingFixture(null); setScoreInputData(null); setEditingLeagueContext(null); }}>Abbrechen</button>
              <button
                type="submit"
                className="btn btn-primary"
              >
                Speichern
              </button>
            </div>
          </form>
        )}
      </Modal>
      
      {/* Confirmation Dialogs moved outside the Modals */}
      {showGenerateConfirmation && leagueToGenerate && (
        <DeleteConfirmation
          onConfirm={confirmGenerateFixtures}
          onCancel={cancelGenerateFixtures}
          message={`Möchten Sie den Spielplan für Liga "${leagueToGenerate.name}" wirklich generieren? Bestehende Spielpläne für diese Liga werden überschrieben.`}
          confirmButtonText="Generieren"
        />
      )}

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
      className="flex justify-between items-center text-sm p-2 border rounded-sm shadow-sm bg-base-100 hover:bg-base-200"
    >
      {/* Drag Handle */}
      {/* Tooltip Wrapper for Drag Handle */}
      <div className="tooltip" data-tip="Verschieben">
        <button 
            {...attributes} 
            {...listeners} 
            className="cursor-grab p-1 mr-2"
            // title removed
          >
            <GripVerticalIcon className="h-5 w-5" />
        </button>
      </div>

      {/* Fixture Details */}
      <div className="grow flex items-center">
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
        <span className="font-normal w-auto text-center text-base-content/70 text-xs">
          (P: {fixture.homeMatchPoints !== null && fixture.awayMatchPoints !== null
            ? `${fixture.homeMatchPoints} : ${fixture.awayMatchPoints}`
            : '- : -'})
        </span>
      </div>
   {/* Action Buttons Container */}
   <div className="flex items-center space-x-1 ml-2">
     {/* Tooltip Wrapper */}
     <div className="tooltip" data-tip={isLeagueActive ? "Spielpaarung bearbeiten" : "Liga ist inaktiv"}>
       <button
         onClick={() => onEditClick(fixture)} // Keep original onClick
         className={`p-1 btn btn-sm btn-soft ${isLeagueActive ? 'btn-secondary' : 'btn-disabled'}`} // Reverted to btn-soft
         // title removed
         disabled={!isLeagueActive}
       >
         <PencilIcon className="h-4 w-4" />
       </button>
     </div>
     {/* Removed Up/Down buttons as Drag&Drop is used */}
     </div>
   </li>
  );
}
