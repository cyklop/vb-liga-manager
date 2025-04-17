'use client'

import { useState, useEffect } from 'react';
import Navigation from '@/components/Navbar';
import { ArrowDownIcon } from '@heroicons/react/20/solid';
import { ChevronDownIcon } from '@heroicons/react/24/outline';

interface Team {
  id: number;
  name: string;
}

interface League {
  id: number;
  name: string;
  teams: Team[];
  pointsWin30: number;
  pointsWin31: number;
  pointsWin32: number;
  pointsLoss32: number;
}

interface TableEntry {
  teamId: number;
  teamName: string;
  played: number;
  won: number;
  lost: number;
  points: number;
  setsWon: number;
  setsLost: number;
  setsDiff: number;
  setsQuotient: number;
  pointsWon: number;
  pointsLost: number;
  pointsDiff: number;
  pointsQuotient: number;
}

export default function TablePage() {
  const [leagues, setLeagues] = useState<League[]>([]);
  const [activeLeagueId, setActiveLeagueId] = useState<number | null>(null);
  const [tableData, setTableData] = useState<TableEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [matchdays, setMatchdays] = useState<number[]>([]);
  const [selectedMatchday, setSelectedMatchday] = useState<number | null>(null);
  const [showSortInfo, setShowSortInfo] = useState(false);

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
    // Fetch table data and matchdays when activeLeagueId changes
    if (activeLeagueId) {
      fetchTableData(activeLeagueId, selectedMatchday || undefined);
      fetchMatchdays(activeLeagueId);
    }
  }, [activeLeagueId]);

  const fetchTableData = async (leagueId: number, matchday?: number) => {
    setIsLoading(true);
    try {
      const url = matchday 
        ? `/api/leagues/${leagueId}/table?matchday=${matchday}` 
        : `/api/leagues/${leagueId}/table`;
      
      const response = await fetch(url);
      if (response.ok) {
        const data = await response.json();
        setTableData(data);
      }
    } catch (error) {
      console.error('Error fetching table data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchMatchdays = async (leagueId: number) => {
    try {
      const response = await fetch(`/api/leagues/${leagueId}/matchdays`);
      if (response.ok) {
        const data = await response.json();
        setMatchdays(data.matchdays);
      }
    } catch (error) {
      console.error('Error fetching matchdays:', error);
    }
  };

  const handleMatchdayChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    const matchday = value ? parseInt(value) : null;
    setSelectedMatchday(matchday);
    
    if (activeLeagueId) {
      fetchTableData(activeLeagueId, matchday || undefined);
    }
  };

  const handleLeagueChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newLeagueId = parseInt(e.target.value);
    setActiveLeagueId(newLeagueId);
    setSelectedMatchday(null); // Reset selected matchday when changing league
    
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

  return (
    <>
      <Navigation />
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-6">Tabelle</h1>

        <div className="flex flex-col md:flex-row md:items-center gap-4 mb-6">
          {/* Liga-Auswahl */}
          <label className="form-control w-full max-w-xs">
            <div className="label">
              <span className="label-text">Liga auswählen:</span>
            </div>
            <select
              id="leagueSelect"
              value={activeLeagueId || ''}
              onChange={handleLeagueChange}
              className="select select-bordered w-full"
            >
              <option value="" disabled>Liga auswählen</option>
              {leagues.map(league => (
                <option key={league.id} value={league.id}>{league.name}</option>
              ))}
            </select>
          </label>

          {/* Spieltag-Auswahl */}
          <label className="form-control w-full max-w-xs">
            <div className="label">
              <span className="label-text">Spieltag:</span>
            </div>
            <select
              id="matchdaySelect"
              value={selectedMatchday || ''}
              onChange={handleMatchdayChange}
              className="select select-bordered w-full" // DaisyUI Klassen
            >
              <option value="">Alle Spieltage</option>
              {matchdays.map(matchday => (
                <option key={matchday} value={matchday}>{`Spieltag ${matchday}`}</option>
              ))}
            </select>
          </label>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center py-12">
            {/* Verwende DaisyUI loading Komponente */}
            <span className="loading loading-spinner loading-lg"></span>
          </div>
        ) : tableData.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 table table-zebra table-pin-rows">
              <thead className="">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                    Platz
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                    Team
                  </th>
                  <th scope="col" className="px-6 py-3 text-center text-xs font-medium uppercase tracking-wider">
                    Spiele
                  </th>
                  <th scope="col" className="px-6 py-3 text-center text-xs font-medium uppercase tracking-wider">
                    N
                  </th>
                  <th scope="col" className="px-6 py-3 text-center text-xs font-medium uppercase tracking-wider">
                    S
                  </th>
                  <th scope="col" className="px-6 py-3 text-center text-xs font-medium uppercase tracking-wider">
                    Summe {/* Sätze */}
                  </th>
                  <th scope="col" className="px-6 py-3 text-center text-xs font-medium uppercase tracking-wider">
                    Diff(Sätze)
                  </th>
                  <th scope="col" className="px-6 py-3 text-center text-xs font-medium uppercase tracking-wider">
                    Bälle
                  </th>
                  <th scope="col" className="px-6 py-3 text-center text-xs font-medium uppercase tracking-wider">
                    Diff(Bälle)
                  </th>
                   <th scope="col" className="px-6 py-3 text-center text-xs font-big uppercase tracking-wider">
                    Punkte
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {tableData.map((entry, index) => (
                  <tr key={entry.teamId} >
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium ">
                      {index + 1}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm ">
                      {entry.teamName}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-center">
                      {entry.played}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-center">
                      {entry.lost} {/* N */}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-center">
                      {entry.won} {/* S */}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-center">
                      {entry.setsWon}:{entry.setsLost} {/* Summe (Sätze) */}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-center">
                      {entry.setsDiff > 0 ? '+' : ''}{entry.setsDiff} {/* Diff(Sätze) */}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-center">
                      {entry.pointsWon}:{entry.pointsLost} {/* Bälle */}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-center">
                      {entry.pointsDiff > 0 ? '+' : ''}{entry.pointsDiff} {/* Diff(Bälle) */}
                    </td>
                     <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-center">
                      {entry.points} {/* Punkte */}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          // Verwende DaisyUI alert für leeren Zustand
          <div role="alert" className="alert alert-info mt-6">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="stroke-current shrink-0 w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
            <span>{activeLeagueId ? 'Keine Tabellendaten für diese Auswahl verfügbar.' : 'Bitte wählen Sie eine Liga aus.'}</span>
          </div>
        )}

        {/* Sortierreihenfolge als DaisyUI collapse */}
        <div className="collapse collapse-arrow border border-base-300 bg-base-200 mt-8">
          <input type="checkbox" checked={showSortInfo} onChange={() => setShowSortInfo(!showSortInfo)} />
          <div className="collapse-title text-md font-medium">
            Informationen zur Sortierreihenfolge
          </div>
          <div className="collapse-content">
            <div className="p-4 text-sm">
              <p className="font-medium mb-2">Die Tabelle wird nach folgenden Kriterien sortiert:</p>
              <ol className="list-decimal list-inside space-y-1">
                <li>Punkte</li>
                <li>Satzdifferenz</li>
                <li>Satzquotient</li>
                <li>Direkter Vergleich</li>
                <li>Balldifferenz</li>
                <li>Ballquotient</li>
                <li>Anzahl der Siege</li>
              </ol>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
