'use client'

import { useState, useEffect } from 'react';
import Navigation from '@/components/Navbar';
import { useRouter } from 'next/navigation';
import { toast } from 'react-toastify';
import { ScoreEntryType } from '@prisma/client'; // Import the enum
import { PencilSquareIcon } from '@heroicons/react/24/outline';

interface User {
  id: number;
  name: string;
  email: string;
  isAdmin: boolean;
  isSuperAdmin: boolean;
  team?: {
    id: number;
    name: string;
  };
  teams?: {
    team: {
      id: number;
      name: string;
    }
  }[];
}

interface Team {
  id: number;
  name: string;
  location: string;
  hallAddress: string;
  trainingTimes: string;
}

interface Fixture {
  id: number;
  leagueId: number;
  round?: number | null;
  matchday?: number | null;
  homeTeamId: number;
  homeTeam: {
    id: number;
    name: string;
  };
  awayTeamId: number;
  awayTeam: {
    id: number;
    name: string;
  };
  fixtureDate?: string | null;
  homeMatchPoints?: number | null;
  awayMatchPoints?: number | null;
  fixtureTime?: string | null; // Add fixtureTime
  order: number;
  // Add individual set scores
  homeSet1?: number | null; awaySet1?: number | null;
  homeSet2?: number | null; awaySet2?: number | null;
  homeSet3?: number | null; awaySet3?: number | null;
  homeSet4?: number | null; awaySet4?: number | null; // For Bo5
  homeSet5?: number | null; awaySet5?: number | null; // For Bo5
  // Add final score in sets
  homeScore?: number | null;
  awayScore?: number | null;
  // Assume league context might be added to fixture data by API later
  league?: {
    scoreEntryType: ScoreEntryType;
    setsToWin: number;
  };
  // Optional total points (balls)
  homePoints?: number | null;
  awayPoints?: number | null;
}

interface MatchScoreData {
  homeScore: string | number;
  awayScore: string | number;
  homePoints: string | number;
  awayPoints: string | number;
}

interface SetScore {
  home: string | number | null;
  away: string | number | null;
}

interface SetScoresData {
  setScores: SetScore[];
}

export default function TeamPage() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [teams, setTeams] = useState<Team[]>([]);
  const [selectedTeamId, setSelectedTeamId] = useState<number | null>(null);
  const [homeFixtures, setHomeFixtures] = useState<{[teamId: number]: Fixture[]}>({}); 
  const [isLoading, setIsLoading] = useState(true);
  const [editingFixture, setEditingFixture] = useState<Fixture | null>(null);
  const [editingTeam, setEditingTeam] = useState<Team | null>(null);
  const [teamFormData, setTeamFormData] = useState({
    location: '',
    hallAddress: '',
    trainingTimes: ''
  });
  const router = useRouter();

  // Form state for editing fixture results - will hold score data dynamically
  const [formData, setFormData] = useState<any>({
    fixtureDate: '',
    fixtureTime: '',
    scoreData: null // Will hold { homeScore, awayScore } or { setScores: [...] }
  });

  useEffect(() => {
    fetchCurrentUser();
  }, []);

  // Log currentUser when it changes
  useEffect(() => {
    console.log("Current User Data:", currentUser);
  }, [currentUser]);

  useEffect(() => {
    async function loadTeamData() {
      if (currentUser) {
        const userTeams: Team[] = [];
        const processedTeamIds: number[] = [];
      
        // Verarbeite alle Teams aus dem teams-Array
        if (currentUser.teams && currentUser.teams.length > 0) {
          for (const team of currentUser.teams) {
            // Zusätzliche Prüfung, ob team.team und team.team.id existieren
            if (!team.team || typeof team.team.id !== 'number' || processedTeamIds.includes(team.team.id)) {
              continue; 
            }
            
            try {
              const response = await fetch(`/api/teams/${team.team.id}/details`);
              if (response.ok) {
                const teamDetails = await response.json();
                userTeams.push(teamDetails);
                processedTeamIds.push(team.team.id);
              } else {
                // Fallback, wenn API-Endpunkt nicht verfügbar
                const teamData = {
                  id: team.team.id,
                  name: team.team.name,
                  location: "Nicht verfügbar",
                  hallAddress: "Nicht verfügbar",
                  trainingTimes: "Nicht verfügbar"
                };
                userTeams.push(teamData);
                processedTeamIds.push(team.team.id);
              }
            } catch (error) {
              console.error(`Fehler beim Laden der Teamdetails für Team ${team.team.id}:`, error);
              const teamData = {
                id: team.team.id,
                name: team.team.name,
                location: "Nicht verfügbar",
                hallAddress: "Nicht verfügbar",
                trainingTimes: "Nicht verfügbar"
              };
              userTeams.push(teamData);
              processedTeamIds.push(team.team.id);
            }
          }
        }
        
        // Füge das Haupt-Team hinzu, falls es existiert, eine ID hat und noch nicht verarbeitet wurde
        if (currentUser.team && typeof currentUser.team.id === 'number' && !processedTeamIds.includes(currentUser.team.id)) {
          try {
            const response = await fetch(`/api/teams/${currentUser.team.id}/details`);
            if (response.ok) {
              const teamDetails = await response.json();
              userTeams.push(teamDetails);
              processedTeamIds.push(currentUser.team.id);
            } else {
              // Fallback, wenn API-Endpunkt nicht verfügbar
              const teamData = {
                id: currentUser.team.id,
                name: currentUser.team.name,
                location: "Nicht verfügbar",
                hallAddress: "Nicht verfügbar",
                trainingTimes: "Nicht verfügbar"
              };
              userTeams.push(teamData);
              processedTeamIds.push(currentUser.team.id);
            }
          } catch (error) {
            console.error(`Fehler beim Laden der Teamdetails für Team ${currentUser.team.id}:`, error);
            const teamData = {
              id: currentUser.team.id,
              name: currentUser.team.name,
              location: "Nicht verfügbar",
              hallAddress: "Nicht verfügbar",
              trainingTimes: "Nicht verfügbar"
            };
            userTeams.push(teamData);
            processedTeamIds.push(currentUser.team.id);
          }
        }
       
        // Log the teams array before setting state
        console.log("User Teams Processed:", userTeams);
        // Aktualisiere die Teams-Liste
        setTeams(userTeams);
         
        // Setze das erste Team als ausgewähltes Team, wenn noch keines ausgewählt ist
        if (userTeams.length > 0 && !selectedTeamId) {
          setSelectedTeamId(userTeams[0].id);
        }
        
        // Lade Heimspiele für alle Teams
        for (const team of userTeams) {
          await fetchHomeFixtures(team.id);
        }
        
        if (userTeams.length === 0) {
          // Benutzer hat keine Teams
          setIsLoading(false);
        }
      }
    }
    
    loadTeamData();
  }, [currentUser, selectedTeamId]);

  const fetchCurrentUser = async () => {
    try {
      const response = await fetch('/api/users/me');
      if (response.ok) {
        const user = await response.json();
        setCurrentUser(user);
      } else {
        // Not authenticated or error
        router.push('/login');
      }
    } catch (error) {
      console.error('Error fetching current user:', error);
      router.push('/login');
    }
  };

  // Diese Funktion wird nicht mehr verwendet, da der GET-Endpunkt nicht funktioniert
  // Wir behalten sie für zukünftige Verwendung
  // Funktion zum Laden der Teamdetails
  const fetchTeamDetails = async (teamId: number) => {
    try {
      const response = await fetch(`/api/teams/${teamId}`);
      if (response.ok) {
        const teamData = await response.json();
        setTeams(prevTeams => {
          return prevTeams.map(team => 
            team.id === teamData.id ? { ...team, ...teamData } : team
          );
        });
      } else {
        console.error(`Error fetching team details: ${response.status} ${response.statusText}`);
      }
    } catch (error) {
      console.error('Error fetching team details:', error);
    }
  };
  
  // Funktion zum Bearbeiten eines Teams
  const handleEditTeam = (team: Team) => {
    setEditingTeam(team);
    setTeamFormData({
      location: team.location,
      hallAddress: team.hallAddress,
      trainingTimes: team.trainingTimes
    });
  };
  
  // Funktion zum Abbrechen der Teambearbeitung
  const handleCancelTeamEdit = () => {
    setEditingTeam(null);
  };
  
  // Funktion zum Ändern der Teaminformationen
  const handleTeamInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setTeamFormData({
      ...teamFormData,
      [name]: value
    });
  };
  
  // Funktion zum Speichern der Teaminformationen
  const handleTeamSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTeam) return;
    
    try {
      const response = await fetch(`/api/teams/${editingTeam.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: editingTeam.name,
          location: teamFormData.location,
          hallAddress: teamFormData.hallAddress,
          trainingTimes: teamFormData.trainingTimes
        }),
      });
      
      if (response.ok) {
        // Aktualisiere das Team in der lokalen Liste
        setTeams(prevTeams => 
          prevTeams.map(team => 
            team.id === editingTeam.id 
              ? { 
                  ...team, 
                  location: teamFormData.location,
                  hallAddress: teamFormData.hallAddress,
                  trainingTimes: teamFormData.trainingTimes
                } 
              : team
          )
        );
        setEditingTeam(null);
        toast.success('Mannschaftsdetails erfolgreich gespeichert!'); // Erfolgs-Toast
      } else {
        const error = await response.json();
        toast.error(`Fehler beim Speichern: ${error.message || 'Unbekannter Fehler'}`); // Fehler-Toast
      }
    } catch (error) {
      console.error('Error updating team:', error);
      toast.error('Ein Netzwerkfehler ist aufgetreten. Bitte versuchen Sie es später erneut.'); // Netzwerkfehler-Toast
    }
  };

  const fetchHomeFixtures = async (teamId: number) => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/teams/${teamId}/fixtures?homeOnly=true`);
      if (response.ok) {
        const fixtures = await response.json();
        setHomeFixtures(prevFixtures => ({
          ...prevFixtures,
          [teamId]: fixtures
        }));
      }
    } catch (error) {
      console.error('Error fetching home fixtures:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditFixture = (fixture: Fixture) => {
    // Check if league context exists
    if (!fixture.league) {
      toast.error("Ligakonfiguration für dieses Spiel fehlt. Ergebnis kann nicht bearbeitet werden.");
      return;
    }

    setEditingFixture(fixture);
 
    // Initialize formData based on league type and existing fixture data
    let initialScoreData: MatchScoreData | SetScoresData | null = null; // Explicitly type initialScoreData
    const league = fixture.league;
    const maxSets = 2 * league.setsToWin - 1;
 
    if (league.scoreEntryType === ScoreEntryType.SET_SCORES) {
      const initialSetScores: SetScore[] = Array(maxSets).fill(null).map((_, i) => { // Type the array
        const setNum = i + 1;
        return {
          home: (fixture[`homeSet${setNum}` as keyof Fixture] as number | null) ?? '',
          away: (fixture[`awaySet${setNum}` as keyof Fixture] as number | null) ?? ''
        };
      });
      initialScoreData = { setScores: initialSetScores };
    } else { // MATCH_SCORE
      initialScoreData = {
        homeScore: fixture.homeScore ?? '', // Use empty string for input binding
        awayScore: fixture.awayScore ?? '', // Use empty string for input binding
        homePoints: fixture.homePoints ?? '', // Add points
        awayPoints: fixture.awayPoints ?? '', // Add points
      };
    }
    setFormData({
      fixtureDate: fixture.fixtureDate ? new Date(fixture.fixtureDate).toISOString().split('T')[0] : '',
      fixtureTime: fixture.fixtureTime || '',
      scoreData: initialScoreData
    });
  };
 
  const handleCancelEdit = () => {
    setEditingFixture(null);
    // Reset formData as well
    setFormData({
      fixtureDate: '',
      fixtureTime: '',
      scoreData: null
    });
  };
 
  // Updated handler for score input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>, index?: number) => {
    const { name, value } = e.target;

    if (name === 'fixtureDate' || name === 'fixtureTime') {
      setFormData({ ...formData, [name]: value });
      return;
    }

    // Handle score inputs
    if (!formData.scoreData || !editingFixture?.league) return;

    const processedValue = value.trim() === '' ? '' : value;
    const leagueType = editingFixture.league.scoreEntryType;

    if (leagueType === ScoreEntryType.SET_SCORES && index !== undefined && formData.scoreData.setScores) {
      // Update specific set score
      const updatedSetScores = [...formData.scoreData.setScores];
      updatedSetScores[index] = {
        ...updatedSetScores[index],
        [name]: processedValue, // name is 'home' or 'away'
      };
      setFormData({ ...formData, scoreData: { setScores: updatedSetScores } });
    } else if (leagueType === ScoreEntryType.MATCH_SCORE) {
      // Update homeScore, awayScore, homePoints, or awayPoints
      setFormData({
        ...formData,
        scoreData: {
          ...formData.scoreData,
          [name]: processedValue, // name is 'homeScore', 'awayScore', 'homePoints', or 'awayPoints'
        }
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingFixture) return;

    try {
      const response = await fetch(`/api/fixtures/${editingFixture.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          fixtureDate: formData.fixtureDate || null,
          fixtureTime: formData.fixtureTime || null,
          // Construct scoreData payload based on current formData.scoreData
          ...(formData.scoreData && {
            scoreData: editingFixture.league?.scoreEntryType === ScoreEntryType.MATCH_SCORE
              ? { // MATCH_SCORE payload
                  homeScore: formData.scoreData.homeScore === '' || formData.scoreData.homeScore === null ? null : Number(formData.scoreData.homeScore),
                  awayScore: formData.scoreData.awayScore === '' || formData.scoreData.awayScore === null ? null : Number(formData.scoreData.awayScore),
                  // Add points to payload
                  homePoints: formData.scoreData.homePoints === '' || formData.scoreData.homePoints === null ? null : Number(formData.scoreData.homePoints),
                  awayPoints: formData.scoreData.awayPoints === '' || formData.scoreData.awayPoints === null ? null : Number(formData.scoreData.awayPoints)
                }
              : { // SET_SCORES payload
                  setScores: formData.scoreData.setScores
                    ?.map((set: { home: string | number | null, away: string | number | null }) => ({
                      home: set.home === '' || set.home === null ? null : Number(set.home),
                      away: set.away === '' || set.away === null ? null : Number(set.away),
                    }))
                    // Filter out sets where both scores are null AFTER conversion
                    .filter((set: { home: number | null, away: number | null }) => set.home !== null || set.away !== null)
                }
          })
        }),
      });

      if (response.ok) {
        // Refresh fixtures after update
        // Aktualisiere die Heimspiele für das betroffene Team
        if (editingFixture) {
          fetchHomeFixtures(editingFixture.homeTeamId);
        }
        setEditingFixture(null);
        // Reset formData after successful submission
        setFormData({
          fixtureDate: '',
          fixtureTime: '',
          scoreData: null
        });
        toast.success('Spielergebnis erfolgreich gespeichert!'); // Erfolgs-Toast
      } else {
        const error = await response.json();
        toast.error(`Fehler beim Speichern: ${error.message || 'Unbekannter Fehler'}`); // Fehler-Toast
      }
    } catch (error) {
      console.error('Error updating fixture:', error);
      toast.error('Ein Netzwerkfehler ist aufgetreten. Bitte versuchen Sie es später erneut.'); // Netzwerkfehler-Toast
    }
  };

  const formatDate = (dateString: string | null | undefined) => {
    if (!dateString) return 'Datum N/A';
    return new Date(dateString).toLocaleDateString('de-DE', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };
 
  // Function to format date and time
  const formatDateTime = (dateString: string | null | undefined, timeString: string | null | undefined) => {
    if (!dateString) return 'Datum N/A';
    const datePart = new Date(dateString).toLocaleDateString('de-DE', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
    const timePart = timeString ? ` ${timeString}` : '';
    return `${datePart}${timePart}`;
  };
 
  if (!currentUser) {
    return (
      <>
        <Navigation />
        <div className="container mx-auto px-4 py-8">
          <div className="flex justify-center items-center py-12">
            {/* Verwende DaisyUI loading Komponente */}
            <span className="loading loading-spinner loading-lg"></span>
          </div>
        </div>
      </>
    );
  }

  // Prüfe, ob der Benutzer Teams hat
  const hasTeams = teams.length > 0;
  
  if (!hasTeams && !isLoading) {
    return (
      <>
        <Navigation />
        <div className="container mx-auto px-4 py-8">
          <h1 className="text-2xl font-bold mb-6">Meine Mannschaften</h1>
          {/* Verwende DaisyUI alert */}
          <div role="alert" className="alert alert-warning">
            <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
            <span>Sie sind keiner Mannschaft zugeordnet. Bitte kontaktieren Sie einen Administrator.</span>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Navigation />

      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-6">Meine Mannschaften</h1>
         
        {/* Team-Auswahl Dropdown, wenn Teams vorhanden sind */}
        {teams.length > 0 && (
          <div className="mb-6">
            {/* Verwende form-control für Layout */}
            <label className="form-control w-full max-w-xs">
              <div className="label">
                {/* Standard label-text */}
                <span className="label-text">Mannschaft auswählen:</span>
              </div>
              <select
                id="team-select"
                value={selectedTeamId || ''}
                onChange={(e) => setSelectedTeamId(Number(e.target.value))}
                // select mit Klassen
                className="select select-bordered w-full"
              >
                {teams.map(team => (
                  <option key={team.id} value={team.id}>
                    {team.name}
                  </option>
                ))}
              </select>
            </label>
          </div>
        )}

        {/* Finde das ausgewählte Team */}
        {(() => {
          const selectedTeam = teams.find(team => team.id === selectedTeamId);
          // Wenn kein Team ausgewählt ist oder die ID ungültig ist, zeige nichts oder eine Nachricht an
          if (!selectedTeam) {
            // Optional: Zeige eine Nachricht an, wenn Teams vorhanden sind, aber keines ausgewählt ist
            if (teams.length > 0) {
               return <div className="text-center text-gray-500 mt-8">Bitte wählen Sie eine Mannschaft aus.</div>;
            }
            return null; // Oder zeige das erste Team standardmäßig an, falls gewünscht
          }
          // Zeige die Details des ausgewählten Teams an
          return (
            <div key={selectedTeam.id} className="mb-12">
              <h2 className="text-xl font-semibold mb-4">{selectedTeam.name}</h2>

            {/* Mannschaftsdetails - Verwende DaisyUI card */}
            <div className="card card-bordered bg-base-100 shadow-md mb-8">
              <div className="card-body p-0"> {/* Entferne Standard-Padding von card-body, da wir eigenes Layout haben */}
                <div className="px-4 py-3 sm:px-6 flex justify-between items-center bg-base-200 rounded-t-lg"> {/* Header-Styling */}
                  <h3 className="card-title text-lg">Mannschaftsdetails</h3>
                  {/* Use selectedTeam here */}
                  {!editingTeam && selectedTeam && (
                    <button
                      onClick={() => handleEditTeam(selectedTeam)}
                      // Standardisierter Button-Style
                      className="btn btn-ghost btn-sm btn-square"
                      title="Team bearbeiten"
                    >
                      <PencilSquareIcon className='h-5 w-5'> </PencilSquareIcon>
                    </button>
                  )}
                </div>

                {/* Use selectedTeam here */}
              {editingTeam?.id === selectedTeam.id ? (
                <div className="border-t border-gray-200">
                  <form onSubmit={handleTeamSubmit} className="p-4 space-y-4">
                    <div>
                      <label className="floating-label">
                        <span>Ort</span>
                        <input
                        type="text"
                        name="location"
                        value={teamFormData.location}
                        onChange={handleTeamInputChange}
                        placeholder="Ort der Mannschaft" // Placeholder hinzufügen
                        className="input input-bordered w-full" // daisyUI Klassen
                      />
                      </label>
                    </div>

                    <div>
                      <label className="floating-label">
                        <span>Hallenadresse</span>
                        <input
                        type="text"
                        name="hallAddress"
                        value={teamFormData.hallAddress}
                        onChange={handleTeamInputChange}
                        placeholder="Adresse der Halle" // Placeholder hinzufügen
                        className="input input-bordered w-full" // daisyUI Klassen
                      />
                      </label>

                    </div>

                    <div>
                      <label className="floating-label">
                      <span>Trainingszeiten</span>
                      <textarea
                        name="trainingTimes"
                        value={teamFormData.trainingTimes}
                        onChange={handleTeamInputChange}
                        rows={3}
                        placeholder="Zeiten und Tage des Trainings" // Placeholder hinzufügen
                        className="textarea textarea-bordered w-full" // daisyUI Klassen
                      />
                      </label>

                    </div>

                    <div className="flex justify-end space-x-3">
                      <button
                        type="button"
                        onClick={handleCancelTeamEdit}
                        className="btn" // Vereinfachte Klassen
                      >
                        Abbrechen
                      </button>
                      <button
                        type="submit"
                        // Klassen hier sind ok (btn btn-primary), ggf. px/py entfernen, da btn Größe definiert
                        className="btn btn-primary"
                      >
                        Speichern
                      </button>
                    </div>
                  </form>
                </div>
              ) : (
                <div className="border-t border-gray-200">
                  <dl>
                    <div className="px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                      <dt className="text-sm font-medium">Name</dt>
                      <dd className="mt-1 text-sm sm:mt-0 sm:col-span-2">{selectedTeam.name}</dd>
                    </div>
                    <div className="bg-base-200 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                      <dt className="text-sm font-medium">Ort</dt>
                      <dd className="mt-1 text-sm sm:mt-0 sm:col-span-2">{selectedTeam.location}</dd>
                    </div>
                    <div className="px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                      <dt className="text-sm font-medium">Hallenadresse</dt>
                      <dd className="mt-1 text-sm sm:mt-0 sm:col-span-2">{selectedTeam.hallAddress}</dd>
                    </div>
                    <div className="bg-base-200 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                      <dt className="text-sm font-medium">Trainingszeiten</dt>
                      <dd className="mt-1 text-sm sm:mt-0 sm:col-span-2">{selectedTeam.trainingTimes}</dd>
                    </div>
                  </dl>
                </div>
              )}
              </div> {/* Ende von card-body */}
            </div> {/* Ende von card */}

            <h3 className="text-lg font-semibold mb-4">Heimspiele verwalten</h3>

            {isLoading ? (
              <div className="flex justify-center items-center py-12">
                {/* Verwende DaisyUI loading Komponente */}
                <span className="loading loading-spinner loading-lg"></span>
              </div>
            ) : homeFixtures[selectedTeam.id] && homeFixtures[selectedTeam.id].length > 0 ? (
              // Verwende DaisyUI card für die Fixture-Liste
              <div className="card card-bordered bg-base-100 shadow-md mb-8">
                <div className="card-body p-0"> {/* Kein Padding für die Liste */}
                  <ul className="divide-y divide-base-200"> {/* Angepasste Trennlinie */}
                    {homeFixtures[selectedTeam.id].map((fixture) => (
                      <li key={fixture.id} className="px-4 py-4 sm:px-6">
                        {editingFixture?.id === fixture.id ? (
                    <form onSubmit={handleSubmit} className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <span className="font-medium">{fixture.homeTeam.name}</span>
                          <span className="mx-2">vs</span>
                          <span className="font-medium">{fixture.awayTeam.name}</span>
                          {fixture.matchday && (
                            <span className="ml-2 text-sm text-gray-500">
                              (Spieltag {fixture.matchday})
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Date and Time Inputs */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="floating-label">
                            <span>Datum</span>
                            <input
                              type="date"
                              name="fixtureDate"
                              value={formData.fixtureDate}
                              onChange={handleInputChange}
                              placeholder="Datum" // Wichtig: Placeholder für type="date"
                              className="input input-bordered w-full" // daisyUI Klassen
                            />
                          </label>
                        </div>
                        <div>
                        <label className="floating-label">
                          <input
                            type="time"
                            name="fixtureTime"
                            value={formData.fixtureTime}
                            onChange={handleInputChange}
                            placeholder="Uhrzeit" // Wichtig: Placeholder für type="time"
                            className="input input-bordered w-full" // daisyUI Klassen
                          />
                          </label>
                        </div>
                      </div>

                      {/* Conditional Score Inputs */}
                      <fieldset className="border border-gray-200 p-3 rounded-md">
                        <legend className="text-sm font-medium px-1">Ergebnis</legend>
                        <div className="mt-2 space-y-3">
                          {/* Case 1: MATCH_SCORE */}
                          {editingFixture.league?.scoreEntryType === ScoreEntryType.MATCH_SCORE && formData.scoreData && (
                            <div className="space-y-3"> {/* Wrap in div for spacing */}
                              {/* Set Scores */}
                              <div className="flex space-x-4">
                                <div className="flex-1">
                                  <label htmlFor="homeScore" className="floating-label">
                                    <span>Sätze Heim</span>
                                    <input
                                      type="number"
                                      id="homeScore"
                                      name="homeScore" // Use 'homeScore'
                                      min="0" max={editingFixture.league.setsToWin}
                                      value={formData.scoreData.homeScore ?? ''}
                                      onChange={(e) => handleInputChange(e)}
                                      placeholder={`0-${editingFixture.league.setsToWin}`} // Aussagekräftiger Placeholder
                                      className="input input-bordered w-full" // daisyUI Klassen
                                    />
                                  </label>
                                </div>
                                <div className="flex-1">
                                  <label htmlFor="awayScore" className="floating-label">
                                    <span>Sätze Gast</span>
                                    <input
                                      type="number"
                                      id="awayScore"
                                      name="awayScore" // Use 'awayScore'
                                      min="0" max={editingFixture.league.setsToWin}
                                      value={formData.scoreData.awayScore ?? ''}
                                      onChange={(e) => handleInputChange(e)}
                                      placeholder={`0-${editingFixture.league.setsToWin}`} // Aussagekräftiger Placeholder
                                      className="input input-bordered w-full" // daisyUI Klassen
                                    />
                                  </label>
                                </div>
                              </div>
                              {/* Total Points (Balls) */}
                              <div className="flex space-x-4">
                                <div className="flex-1">
                                  <label htmlFor="homePoints" className="floating-label">
                                    <span>Bälle Heim</span>
                                    <input
                                      type="number"
                                      id="homePoints"
                                      name="homePoints"
                                      min="0"
                                      value={formData.scoreData.homePoints ?? ''}
                                      onChange={(e) => handleInputChange(e)}
                                      placeholder="Gesamtbälle"
                                      className="input input-bordered w-full" // daisyUI Klassen
                                    />
                                  </label>
                                </div>
                                <div className="flex-1">
                                  <label htmlFor="awayPoints" className="floating-label">
                                    <span>Bälle Gast</span>
                                    <input
                                      type="number"
                                      id="awayPoints"
                                      name="awayPoints"
                                      min="0"
                                      value={formData.scoreData.awayPoints ?? ''}
                                      onChange={(e) => handleInputChange(e)}
                                      placeholder="Gesamtbälle"
                                      className="input input-bordered w-full" // daisyUI Klassen
                                    />
                                  </label>
                                </div>
                              </div>
                            </div>
                          )}
                          {/* Case 2: SET_SCORES */}
                          {editingFixture.league?.scoreEntryType === ScoreEntryType.SET_SCORES && formData.scoreData?.setScores && (
                            <div className="space-y-2">
                              {formData.scoreData.setScores.map((set: any, index: number) => (
                                // items-end für bessere Ausrichtung mit floating label
                                <div key={index} className="flex items-end space-x-2">
                                  {/* Label außerhalb */}
                                  <span className="pb-2">Satz {index + 1}:</span>
                                  <label className="floating-label flex-1">
                                    {/* Label Text */}
                                    <span>Heim</span>
                                    <input
                                      type="number"
                                      name="home" // Use 'home'
                                      min="0"
                                      value={set.home ?? ''}
                                      onChange={(e) => handleInputChange(e, index)}
                                      placeholder="Punkte Heim" // Placeholder
                                      // daisyUI Klassen, text-right beibehalten
                                      className="input input-bordered w-full text-right"
                                    />
                                  </label>
                                  {/* Doppelpunkt auf gleicher Höhe */}
                                  <span className="pb-2">:</span>
                                  <label className="floating-label flex-1">
                                    {/* Label Text */}
                                    <span>Gast</span>
                                    <input
                                      type="number"
                                      name="away" // Use 'away'
                                      min="0"
                                      value={set.away ?? ''}
                                      onChange={(e) => handleInputChange(e, index)}
                                      placeholder="Punkte Gast" // Placeholder
                                      // daisyUI Klassen
                                      className="input input-bordered w-full"
                                    />
                                  </label>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </fieldset>

                      {/* Action Buttons */}
                      <div className="flex justify-end space-x-3 pt-2">
                        <button
                          type="button"
                          onClick={handleCancelEdit}
                          className="btn" // px-4 py-2 entfernt
                        >
                          Abbrechen
                        </button>
                        <button
                          type="submit"
                          className="btn btn-primary" // px-4 py-2 entfernt
                        >
                          Speichern
                        </button>
                      </div>
                    </form>
                  ) : (
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="flex items-center">
                          <span className="font-medium">{fixture.homeTeam.name}</span>
                          <span className="mx-2">vs</span>
                          <span className="font-medium">{fixture.awayTeam.name}</span>
                          {fixture.matchday && (
                            <span className="ml-2 text-sm text-gray-500">
                              (Spieltag {fixture.matchday})
                            </span>
                          )}
                        </div>
                        <div className="mt-1 text-sm text-gray-500">
                          {formatDate(fixture.fixtureDate)}
                        </div>
                      </div>
                      <div className="flex items-center">
                        {/* Conditional Score Display */}
                        {fixture.homeScore !== null && fixture.awayScore !== null ? (
                          <div className="text-sm font-semibold mr-4">
                            {/* Assume fixture.league exists or default to match score */}
                            {(() => {
                              const displayType = fixture.league?.scoreEntryType ?? ScoreEntryType.MATCH_SCORE;
                              if (displayType === ScoreEntryType.SET_SCORES) {
                                // Display set scores
                                return [1, 2, 3, 4, 5]
                                  .map(setNum => ({
                                    home: fixture[`homeSet${setNum}` as keyof Fixture],
                                    away: fixture[`awaySet${setNum}` as keyof Fixture],
                                  }))
                                  .filter(set => set.home !== null && set.away !== null)
                                  .map(set => `${set.home}:${set.away}`)
                                  .join(', ');
                              } else {
                                // Display match score
                                return `${fixture.homeScore} : ${fixture.awayScore}`;
                              }
                            })()}
                            {/* Display Match Points */}
                            {(fixture.homeMatchPoints !== null && fixture.awayMatchPoints !== null) && (
                              <span className="ml-2 text-xs text-gray-500 dark:text-gray-400">
                                (P: {fixture.homeMatchPoints}:{fixture.awayMatchPoints})
                              </span>
                            )}
                          </div>
                        ) : (
                          <div className="text-sm text-gray-500 dark:text-gray-400 mr-4">Ergebnis ausstehend</div>
                        )}

                        <button
                          onClick={() => handleEditFixture(fixture)}
                          // Standardisierter Button-Style
                          className="btn btn-ghost btn-sm btn-square"
                          title="Spielpaarung bearbeiten"
                        >
                          <PencilSquareIcon className='h-5 w-5'> </PencilSquareIcon>
                        </button>
                      </div>
                    </div>
                  )}
                </li>
                    ))}
                  </ul>
                </div> {/* Ende card-body */}
              </div> {/* Ende card */}
            ) : (
              // Verwende DaisyUI alert für leeren Zustand
              <div role="alert" className="alert alert-info mb-8">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="stroke-current shrink-0 w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                <span>Keine Heimspiele für {selectedTeam.name} gefunden.</span>
              </div>
            )}
            </div>
          );
        })()}
      </div>
    </>
  );
}
