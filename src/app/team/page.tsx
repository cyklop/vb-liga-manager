'use client'

import { useState, useEffect } from 'react';
import Navigation from '@/components/Navbar';
import { useRouter } from 'next/navigation';
import { toast } from 'react-toastify';
import { ScoreEntryType } from '@prisma/client'; // Import the enum

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
          home: fixture[`homeSet${setNum}` as keyof Fixture] ?? '', // Use empty string for input binding
          away: fixture[`awaySet${setNum}` as keyof Fixture] ?? '', // Use empty string for input binding
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
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
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
          <div className="bg-white shadow overflow-hidden sm:rounded-md p-6 text-center text-gray-500">
            Sie sind keiner Mannschaft zugeordnet. Bitte kontaktieren Sie einen Administrator.
          </div>
        </div>
      </>
    );
  }
  
  {console.log("Teams state in render:", teams)}

  return (
    <>
      <Navigation />
      {/* Log the teams state during render */}
      
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-6">Meine Mannschaften</h1>
         
        {/* Team-Auswahl Dropdown, wenn Teams vorhanden sind */}
        {teams.length > 0 && (
          <div className="mb-6">
            <label htmlFor="team-select" className="block text-sm font-medium text-gray-700 mb-1">
              Mannschaft auswählen:
            </label>
            <select
              id="team-select"
              value={selectedTeamId || ''}
              onChange={(e) => setSelectedTeamId(Number(e.target.value))}
              className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
            >
              {teams.map(team => (
                <option key={team.id} value={team.id}>
                  {team.name}
                </option>
              ))}
            </select>
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
            
            {/* Mannschaftsdetails */}
            <div className="bg-white shadow overflow-hidden sm:rounded-lg mb-8">
              <div className="px-4 py-5 sm:px-6 flex justify-between items-center">
                <h3 className="text-lg leading-6 font-medium text-gray-900">Mannschaftsdetails</h3>
                {/* Use selectedTeam here */}
                {!editingTeam && selectedTeam && (
                  <button
                    onClick={() => handleEditTeam(selectedTeam)}
                    className="p-1 text-indigo-600 hover:text-indigo-900 hover:bg-indigo-100 rounded dark:text-foreground dark:hover:bg-muted"
                    title="Team bearbeiten"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-5 w-5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" />
                    </svg>
                  </button>
                )}
              </div>
               
              {/* Use selectedTeam here */}
              {editingTeam?.id === selectedTeam.id ? (
                <div className="border-t border-gray-200">
                  <form onSubmit={handleTeamSubmit} className="p-4 space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Ort
                      </label>
                      <input
                        type="text"
                        name="location"
                        value={teamFormData.location}
                        onChange={handleTeamInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Hallenadresse
                      </label>
                      <input
                        type="text"
                        name="hallAddress"
                        value={teamFormData.hallAddress}
                        onChange={handleTeamInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Trainingszeiten
                      </label>
                      <textarea
                        name="trainingTimes"
                        value={teamFormData.trainingTimes}
                        onChange={handleTeamInputChange}
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                      />
                    </div>
                    
                    <div className="flex justify-end space-x-3">
                      <button
                        type="button"
                        onClick={handleCancelTeamEdit}
                        className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                      >
                        Abbrechen
                      </button>
                      <button
                        type="submit"
                        className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
                      >
                        Speichern
                      </button>
                    </div>
                  </form>
                </div>
              ) : (
                <div className="border-t border-gray-200">
                  <dl>
                    <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                      <dt className="text-sm font-medium text-gray-500">Name</dt>
                      <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{selectedTeam.name}</dd>
                    </div>
                    <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                      <dt className="text-sm font-medium text-gray-500">Ort</dt>
                      <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{selectedTeam.location}</dd>
                    </div>
                    <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                      <dt className="text-sm font-medium text-gray-500">Hallenadresse</dt>
                      <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{selectedTeam.hallAddress}</dd>
                    </div>
                    <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                      <dt className="text-sm font-medium text-gray-500">Trainingszeiten</dt>
                      <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{selectedTeam.trainingTimes}</dd>
                    </div>
                  </dl>
                </div>
              )}
            </div>

            <h3 className="text-lg font-semibold mb-4">Heimspiele verwalten</h3>
            
            {isLoading ? (
              <div className="flex justify-center items-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
              </div>
            ) : homeFixtures[selectedTeam.id] && homeFixtures[selectedTeam.id].length > 0 ? (
              <div className="bg-white shadow overflow-hidden sm:rounded-md mb-8">
                <ul className="divide-y divide-gray-200">
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
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Datum
                          </label>
                          <input
                            type="date"
                            name="fixtureDate"
                            value={formData.fixtureDate}
                            onChange={handleInputChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Uhrzeit
                          </label>
                          <input
                            type="time"
                            name="fixtureTime"
                            value={formData.fixtureTime}
                            onChange={handleInputChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                          />
                        </div>
                      </div>

                      {/* Conditional Score Inputs */}
                      <fieldset className="border border-gray-200 p-3 rounded-md">
                        <legend className="text-sm font-medium text-gray-600 px-1">Ergebnis</legend>
                        <div className="mt-2 space-y-3">
                          {/* Case 1: MATCH_SCORE */}
                          {editingFixture.league?.scoreEntryType === ScoreEntryType.MATCH_SCORE && formData.scoreData && (
                            <div className="space-y-3"> {/* Wrap in div for spacing */}
                              {/* Set Scores */}
                              <div className="flex space-x-4">
                                <div className="flex-1">
                                  <label htmlFor="homeScore" className="block text-xs font-medium text-gray-600">Sätze Heim</label>
                                <input
                                  type="number"
                                  id="homeScore"
                                  name="homeScore" // Use 'homeScore'
                                  min="0" max={editingFixture.league.setsToWin}
                                  value={formData.scoreData.homeScore ?? ''}
                                  onChange={(e) => handleInputChange(e)}
                                  placeholder={`0-${editingFixture.league.setsToWin}`}
                                  className="mt-1 block w-full px-3 py-1.5 text-base border-gray-300 rounded-md"
                                />
                              </div>
                              <div className="flex-1">
                                <label htmlFor="awayScore" className="block text-xs font-medium text-gray-600">Sätze Gast</label>
                                <input
                                  type="number"
                                  id="awayScore"
                                  name="awayScore" // Use 'awayScore'
                                  min="0" max={editingFixture.league.setsToWin}
                                  value={formData.scoreData.awayScore ?? ''}
                                  onChange={(e) => handleInputChange(e)}
                                  placeholder={`0-${editingFixture.league.setsToWin}`}
                                  className="mt-1 block w-full px-3 py-1.5 text-base border-gray-300 rounded-md"
                                />
                                </div>
                              </div>
                              {/* Total Points (Balls) */}
                              <div className="flex space-x-4">
                                <div className="flex-1">
                                  <label htmlFor="homePoints" className="block text-xs font-medium text-gray-600">Bälle Heim</label>
                                  <input
                                    type="number"
                                    id="homePoints"
                                    name="homePoints"
                                    min="0"
                                    value={formData.scoreData.homePoints ?? ''}
                                    onChange={(e) => handleInputChange(e)}
                                    placeholder="Gesamtbälle"
                                    className="mt-1 block w-full px-3 py-1.5 text-base border-gray-300 rounded-md"
                                  />
                                </div>
                                <div className="flex-1">
                                  <label htmlFor="awayPoints" className="block text-xs font-medium text-gray-600">Bälle Gast</label>
                                  <input
                                    type="number"
                                    id="awayPoints"
                                    name="awayPoints"
                                    min="0"
                                    value={formData.scoreData.awayPoints ?? ''}
                                    onChange={(e) => handleInputChange(e)}
                                    placeholder="Gesamtbälle"
                                    className="mt-1 block w-full px-3 py-1.5 text-base border-gray-300 rounded-md"
                                  />
                                </div>
                              </div>
                            </div>
                          )}
                          {/* Case 2: SET_SCORES */}
                          {editingFixture.league?.scoreEntryType === ScoreEntryType.SET_SCORES && formData.scoreData?.setScores && (
                            <div className="space-y-2">
                              {formData.scoreData.setScores.map((set: any, index: number) => (
                                <div key={index} className="flex items-center space-x-2">
                                  <label className="w-12 text-sm font-medium text-gray-600 text-right">Satz {index + 1}:</label>
                                  <input
                                    type="number"
                                    name="home" // Use 'home'
                                    min="0"
                                    value={set.home ?? ''}
                                    onChange={(e) => handleInputChange(e, index)}
                                    placeholder="Heim"
                                    className="flex-1 block w-full px-2 py-1 text-base border-gray-300 rounded-md"
                                  />
                                  <span className="text-gray-500">:</span>
                                  <input
                                    type="number"
                                    name="away" // Use 'away'
                                    min="0"
                                    value={set.away ?? ''}
                                    onChange={(e) => handleInputChange(e, index)}
                                    placeholder="Gast"
                                    className="flex-1 block w-full px-2 py-1 text-base border-gray-300 rounded-md"
                                  />
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
                          className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                        >
                          Abbrechen
                        </button>
                        <button
                          type="submit"
                          className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
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
                          className="p-1 text-indigo-600 hover:text-indigo-900 hover:bg-indigo-100 rounded dark:text-foreground dark:hover:bg-muted"
                          title="Spielpaarung bearbeiten"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-5 w-5">
                            <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  )}
                </li>
              ))}
            </ul>
          </div>
            ) : (
              <div className="bg-white shadow overflow-hidden sm:rounded-md p-6 text-center text-gray-500 mb-8">
                Keine Heimspiele für {selectedTeam.name} gefunden.
              </div>
            )}
            </div>
          );
        })()}
      </div>
    </>
  );
}
