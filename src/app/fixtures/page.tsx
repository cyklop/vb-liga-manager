'use client'

import { useState, useEffect } from 'react';
import Navigation from '@/components/Navbar';
import { ScoreEntryType } from '@prisma/client'; // Import the enum
// Importiere zentrale Typen
// Importiere zentrale Typen
import type { TeamBasicInfo as Team, Fixture, LeagueOverview } from '@/types/models'; // Verwende LeagueOverview

// Lokale Fixture/League Interfaces entfernt
// Fixture wird jetzt importiert
// League wird jetzt importiert (als LeagueOverview)


export default function FixturesPage() {
  // Verwende zentrale Typen
  const [fixtures, setFixtures] = useState<Fixture[]>([]); // Verwende zentralen Fixture Placeholder
  const [leagues, setLeagues] = useState<LeagueOverview[]>([]); // Verwende LeagueOverview
  const [activeLeagueId, setActiveLeagueId] = useState<number | null>(null);
  const [showOnlyUpcoming, setShowOnlyUpcoming] = useState(false);
  const [isLoading, setIsLoading] = useState(true); // isLoading war vorher nicht deklariert


  useEffect(() => {
    // Fetch leagues and active league
    const fetchLeagues = async () => {
      try {
        // Fetch current user first to check if they have a team
        const userResponse = await fetch('/api/users/me');
        const userData = await userResponse.json();
        
        let response;
        if (userData.team && !userData.isAdmin && !userData.isSuperAdmin) {
          // Regular user with team - only fetch leagues where their team plays
          response = await fetch(`/api/leagues?teamId=${userData.team.id}`);
        } else {
          // Admin or super admin - fetch all leagues
          response = await fetch('/api/leagues');
        }
        
        if (response.ok) {
          const data = await response.json();
          setLeagues(data);
        }
      } catch (error) {
        console.error('Error fetching leagues:', error);
      }
    };

    const fetchActiveLeague = async () => {
      try {
        const response = await fetch('/api/leagues/active');
        if (response.ok) {
          const data = await response.json();
          if (data.activeLeagueId) {
            setActiveLeagueId(data.activeLeagueId);
          } else if (leagues.length > 0) {
            // If no active league is set but leagues exist, use the first one
            setActiveLeagueId(leagues[0].id);
          }
        }
      } catch (error) {
        console.error('Error fetching active league:', error);
      }
    };

    const fetchAndSetActiveLeague = async () => {
      try {
        // Fetch current user first to check if they have a team
        const userResponse = await fetch('/api/users/me');
        if (!userResponse.ok) throw new Error('Failed to fetch user');
        const userData = await userResponse.json();

        let leaguesResponse;
        if (userData.team && !userData.isAdmin && !userData.isSuperAdmin) {
          leaguesResponse = await fetch(`/api/leagues?teamId=${userData.team.id}`);
        } else {
          leaguesResponse = await fetch('/api/leagues');
        }

        if (!leaguesResponse.ok) throw new Error('Failed to fetch leagues');
        const fetchedLeagues = await leaguesResponse.json();
        setLeagues(fetchedLeagues);

        if (fetchedLeagues.length === 1) {
          // If exactly one league is available, select it automatically
          const singleLeagueId = fetchedLeagues[0].id;
          setActiveLeagueId(singleLeagueId);
          // Also update the backend
          await fetch('/api/leagues/active', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ leagueId: singleLeagueId }),
          });
        } else {
          // Otherwise, fetch the stored active league preference
          await fetchActiveLeague();
        }
      } catch (error) {
        console.error('Error fetching leagues or setting active league:', error);
        // Optionally try fetching active league even if league fetch failed partially
        await fetchActiveLeague();
      }
    };

    fetchAndSetActiveLeague();
  }, []); // Initial fetch runs only once

  useEffect(() => {
    // Fetch fixtures when activeLeagueId changes
    if (activeLeagueId) {
      fetchFixtures(activeLeagueId);
    }
  }, [activeLeagueId, showOnlyUpcoming]);

  const fetchFixtures = async (leagueId: number) => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/leagues/${leagueId}/fixtures?upcoming=${showOnlyUpcoming}`);
      if (response.ok) {
        const data = await response.json();
        setFixtures(data);
      }
    } catch (error) {
      console.error('Error fetching fixtures:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLeagueChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newLeagueId = parseInt(e.target.value);
    setActiveLeagueId(newLeagueId);
    
    // Update the active league in the backend
    try {
      await fetch('/api/leagues/active', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ leagueId: newLeagueId }),
      });
    } catch (error) {
      console.error('Error setting active league:', error);
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
 
  // Updated function to format date and time
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
 
  return (
    <>
      <Navigation />
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-6">Spielplan</h1>
        
        <div className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between">
          <div className="mb-4 md:mb-0">
            {/* Verwende form-control für Layout */}
            <label className="form-control w-full max-w-xs">
              <div className="label">
                {/* Standard label-text */}
                <span className="label-text">Liga auswählen:</span>
              </div>
              <select
                id="leagueSelect"
                value={activeLeagueId || ''}
                onChange={handleLeagueChange}
                // select mit Klassen
                className="select select-bordered w-full"
              >
                <option value="" disabled>Liga auswählen</option>
                {leagues.map(league => (
                  <option key={league.id} value={league.id}>{league.name}</option>
                ))}
              </select>
            </label>
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              id="showOnlyUpcoming"
              checked={showOnlyUpcoming}
              onChange={(e) => setShowOnlyUpcoming(e.target.checked)}
              className="checkbox checkbox-primary"
            />
            <label htmlFor="showOnlyUpcoming" className="ml-2 block text-sm">
              Nur anstehende Spiele anzeigen
            </label>
          </div>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center py-12">
            {/* Verwende DaisyUI loading Komponente */}
            <span className="loading loading-spinner loading-lg"></span>
          </div>
        ) : fixtures.length > 0 ? (
          <div className="space-y-6">
            {/* Group fixtures by matchday */}
            {Array.from(new Set(fixtures.map(f => f.matchday))).sort((a, b) => (a || 0) - (b || 0)).map(matchday => (
              // Verwende DaisyUI card für jede Spieltagsgruppe
              <div key={matchday || 'unknown'} className="card card-bordered bg-base-100 shadow-md">
                <div className="card-body p-0"> {/* Kein Padding für Titel/Liste */}
                  <div className="px-4 py-3 border-b bg-base-200 rounded-t-lg"> {/* Header-Styling */}
                    <h3 className="card-title text-lg">
                      {matchday ? `Spieltag ${matchday}` : 'Spieltag nicht zugeordnet'}
                    </h3>
                  </div>
                  <ul className="divide-y divide-base-200"> {/* Angepasste Trennlinie */}
                  {fixtures.filter(fixture => fixture.matchday === matchday).map((fixture) => (
                    <li key={fixture.id} className="px-4 py-4 sm:px-6">
                      <div className="flex items-center justify-between">
                        <div className="flex flex-col sm:flex-row sm:items-center">
                          <div className="mt-2 sm:mt-0">
                            <span className="font-medium">{fixture.homeTeam.name}</span>
                            <span className="mx-2">vs</span>
                            <span className="font-medium">{fixture.awayTeam.name}</span>
                          </div>
                        </div>
                        <div className="flex flex-col items-end">
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            {formatDateTime(fixture.fixtureDate, fixture.fixtureTime)} {/* Use new function */}
                          </div>
                          {/* Conditional Score Display */}
                          {fixture.homeScore !== null && fixture.awayScore !== null ? (
                            <div className="mt-1 text-sm font-semibold">
                              {/* Find the league context for this fixture */}
                              {(() => {
                                const currentLeague = leagues.find(l => l.id === fixture.leagueId);
                                // Default to MATCH_SCORE display if league context or type is missing
                                const displayType = currentLeague?.scoreEntryType ?? ScoreEntryType.MATCH_SCORE;

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
                                  // Display match score (homeScore:awayScore)
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
                            <div className="mt-1 text-sm text-gray-500 dark:text-gray-400">Ergebnis ausstehend</div>
                          )}
                        </div>
                      </div>
                    </li>
                    ))}
                  </ul>
                </div> {/* Ende card-body */}
              </div> // Ende card
            ))}
          </div>
        ) : (
          // Verwende DaisyUI alert für leeren Zustand
          <div role="alert" className="alert alert-info">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="stroke-current shrink-0 w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
            <span>{activeLeagueId ? 'Keine Spiele für die ausgewählte Liga gefunden.' : 'Bitte wählen Sie eine Liga aus.'}</span>
          </div>
        )}
      </div>
    </>
  );
}
