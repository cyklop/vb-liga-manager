'use client'

import { useState, useEffect } from 'react';
import Navigation from '@/components/Navbar';
import { useRouter } from 'next/navigation';
import { toast } from 'react-toastify';

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
  homeSets?: number | null;
  awaySets?: number | null;
  homePoints?: number | null;
  awayPoints?: number | null;
  homeMatchPoints?: number | null;
  awayMatchPoints?: number | null;
  fixtureTime?: string | null; // Add fixtureTime
  order: number;
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

  // Form state for editing fixture results
  const [formData, setFormData] = useState({
    homeSets: '',
    awaySets: '',
    homePoints: '',
    awayPoints: '',
    fixtureDate: '',
    fixtureTime: '' // Add fixtureTime to form state
  });

  useEffect(() => {
    fetchCurrentUser();
  }, []);

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
    setEditingFixture(fixture);
    setFormData({
      homeSets: fixture.homeSets?.toString() || '',
      awaySets: fixture.awaySets?.toString() || '',
      homePoints: fixture.homePoints?.toString() || '',
      awayPoints: fixture.awayPoints?.toString() || '',
      fixtureDate: fixture.fixtureDate ? new Date(fixture.fixtureDate).toISOString().split('T')[0] : '', // Format date for input
      fixtureTime: fixture.fixtureTime || '' // Add fixtureTime
    });
  };

  const handleCancelEdit = () => {
    setEditingFixture(null);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
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
          homeTeamId: editingFixture.homeTeamId,
          awayTeamId: editingFixture.awayTeamId,
          homeSets: formData.homeSets ? parseInt(formData.homeSets) : null,
          awaySets: formData.awaySets ? parseInt(formData.awaySets) : null,
          homePoints: formData.homePoints ? parseInt(formData.homePoints) : null,
          awayPoints: formData.awayPoints ? parseInt(formData.awayPoints) : null,
          fixtureDate: formData.fixtureDate || null,
          fixtureTime: formData.fixtureTime || null // Send fixtureTime
        }),
      });

      if (response.ok) {
        // Refresh fixtures after update
        // Aktualisiere die Heimspiele für das betroffene Team
        if (editingFixture) {
          fetchHomeFixtures(editingFixture.homeTeamId);
        }
        setEditingFixture(null);
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

  return (
    <>
      <Navigation />
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
        
        {/* Zeige nur das ausgewählte Team an oder das erste Team, wenn keines ausgewählt ist */}
        {teams
          .filter(team => selectedTeamId ? team.id === selectedTeamId : true)
          .map(team => (
          <div key={team.id} className="mb-12">
            <h2 className="text-xl font-semibold mb-4">{team.name}</h2>
            
            {/* Mannschaftsdetails */}
            <div className="bg-white shadow overflow-hidden sm:rounded-lg mb-8">
              <div className="px-4 py-5 sm:px-6 flex justify-between items-center">
                <h3 className="text-lg leading-6 font-medium text-gray-900">Mannschaftsdetails</h3>
                {!editingTeam && (
                  <button
                    onClick={() => handleEditTeam(team)}
                    className="p-1 text-indigo-600 hover:text-indigo-900 hover:bg-indigo-100 rounded dark:text-foreground dark:hover:bg-muted"
                    title="Team bearbeiten"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-5 w-5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" />
                    </svg>
                  </button>
                )}
              </div>
              
              {editingTeam?.id === team.id ? (
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
                      <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{team.name}</dd>
                    </div>
                    <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                      <dt className="text-sm font-medium text-gray-500">Ort</dt>
                      <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{team.location}</dd>
                    </div>
                    <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                      <dt className="text-sm font-medium text-gray-500">Hallenadresse</dt>
                      <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{team.hallAddress}</dd>
                    </div>
                    <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                      <dt className="text-sm font-medium text-gray-500">Trainingszeiten</dt>
                      <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{team.trainingTimes}</dd>
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
            ) : homeFixtures[team.id] && homeFixtures[team.id].length > 0 ? (
              <div className="bg-white shadow overflow-hidden sm:rounded-md mb-8">
                <ul className="divide-y divide-gray-200">
                  {homeFixtures[team.id].map((fixture) => (
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
 
                        <div className="grid grid-cols-2 gap-4 md:col-span-2"> {/* Span across columns */}
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Sätze Heim
                            </label>
                            <input
                              type="number"
                              name="homeSets"
                              min="0"
                              max="3"
                              value={formData.homeSets}
                              onChange={handleInputChange}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Sätze Gast
                            </label>
                            <input
                              type="number"
                              name="awaySets"
                              min="0"
                              max="3"
                              value={formData.awaySets}
                              onChange={handleInputChange}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                            />
                          </div>
                        </div>
                      </div>
 
                      <div className="grid grid-cols-2 gap-4 md:col-span-2"> {/* Span across columns */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Bälle Heim
                          </label>
                          <input
                            type="number"
                            name="homePoints"
                            min="0"
                            value={formData.homePoints}
                            onChange={handleInputChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Bälle Gast
                          </label>
                          <input
                            type="number"
                            name="awayPoints"
                            min="0"
                            value={formData.awayPoints}
                            onChange={handleInputChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                          />
                        </div>
                      </div>
                      
                      <div className="flex justify-end space-x-3">
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
                        {fixture.homeSets !== null && fixture.awaySets !== null ? (
                          <div className="text-sm font-semibold mr-4">
                            {fixture.homeSets} : {fixture.awaySets}
                            {fixture.homePoints !== null && fixture.awayPoints !== null && (
                              <span className="ml-2 text-xs text-gray-500">
                                (Bälle: {fixture.homePoints} : {fixture.awayPoints})
                              </span>
                            )}
                          </div>
                        ) : (
                          <div className="text-sm text-gray-500 mr-4">Ergebnis ausstehend</div>
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
                Keine Heimspiele für {team.name} gefunden.
              </div>
            )}
          </div>
        ))}
      </div>
    </>
  );
}
