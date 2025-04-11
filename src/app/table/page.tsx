'use client'

import { useState, useEffect } from 'react';
import Navigation from '@/components/Navbar';

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
        
        <div className="mb-6">
          <label htmlFor="leagueSelect" className="block text-sm font-medium text-gray-700 mb-1">
            Liga auswählen:
          </label>
          <select
            id="leagueSelect"
            value={activeLeagueId || ''}
            onChange={handleLeagueChange}
            className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
          >
            <option value="" disabled>Liga auswählen</option>
            {leagues.map(league => (
              <option key={league.id} value={league.id}>{league.name}</option>
            ))}
          </select>
        </div>

        <div className="mb-6 flex items-center">
          <label htmlFor="matchdaySelect" className="block text-sm font-medium text-gray-700 mr-2">
            Spieltag:
          </label>
          <select
            id="matchdaySelect"
            value={selectedMatchday || ''}
            onChange={handleMatchdayChange}
            className="block w-40 pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
          >
            <option value="">Alle Spieltage</option>
            {matchdays.map(matchday => (
              <option key={matchday} value={matchday}>{`Spieltag ${matchday}`}</option>
            ))}
          </select>
        </div>
        
        {isLoading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
          </div>
        ) : tableData.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Platz
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Team
                  </th>
                  <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Spiele
                  </th>
                  <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    S
                  </th>
                  <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    N
                  </th>
                  <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Punkte
                  </th>
                  <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Sätze
                  </th>
                  <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Diff.
                  </th>
                  <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Bälle
                  </th>
                  <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Diff.
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {tableData.map((entry, index) => (
                  <tr key={entry.teamId} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {index + 1}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {entry.teamName}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-center">
                      {entry.played}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-center">
                      {entry.won}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-center">
                      {entry.lost}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 text-center">
                      {entry.points}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-center">
                      {entry.setsWon}:{entry.setsLost}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-center">
                      {entry.setsDiff > 0 ? '+' : ''}{entry.setsDiff}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-center">
                      {entry.pointsWon}:{entry.pointsLost}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-center">
                      {entry.pointsDiff > 0 ? '+' : ''}{entry.pointsDiff}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="bg-white shadow overflow-hidden sm:rounded-md p-6 text-center text-gray-500">
            {activeLeagueId ? 'Keine Tabellendaten verfügbar.' : 'Bitte wählen Sie eine Liga aus.'}
          </div>
        )}

        {/* Sortierreihenfolge als aufklappbarer Infoblock */}
        <div className="mt-8">
          <button 
            onClick={() => setShowSortInfo(!showSortInfo)}
            className="flex items-center justify-between w-full px-4 py-2 text-sm font-medium text-left text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 focus:outline-none focus-visible:ring focus-visible:ring-indigo-500 focus-visible:ring-opacity-50"
          >
            <span>Informationen zur Sortierreihenfolge</span>
            <svg 
              className={`w-5 h-5 transform ${showSortInfo ? 'rotate-180' : ''}`} 
              xmlns="http://www.w3.org/2000/svg" 
              viewBox="0 0 20 20" 
              fill="currentColor"
            >
              <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </button>
          
          {showSortInfo && (
            <div className="mt-2 p-4 text-sm text-gray-600 bg-gray-50 rounded-md border border-gray-200">
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
          )}
        </div>
      </div>
    </>
  );
}
