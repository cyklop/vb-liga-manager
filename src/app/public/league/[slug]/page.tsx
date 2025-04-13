'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { Tabs, TabsHeader, TabsBody, Tab, TabPanel, Checkbox, Typography } from "@material-tailwind/react" // Checkbox und Typography hinzugefügt
import { ThemeProvider } from '@/components/ThemeProvider'
import { ScoreEntryType } from '@prisma/client'

// Typen für die Daten
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
  homeMatchPoints?: number | null
  awayMatchPoints?: number | null
  fixtureTime?: string | null // Add fixtureTime
  // Add individual set scores
  homeSet1?: number | null; awaySet1?: number | null;
  homeSet2?: number | null; awaySet2?: number | null;
  homeSet3?: number | null; awaySet3?: number | null;
  homeSet4?: number | null; awaySet4?: number | null; // For Bo5
  homeSet5?: number | null; awaySet5?: number | null; // For Bo5
  // Add final score in sets
  homeScore?: number | null;
  awayScore?: number | null;
}

interface League {
  id: number
  name: string
  slug: string
  teams: Team[]
  fixtures: Fixture[]
  pointsWin30: number
  pointsWin31: number
  pointsWin32: number
  pointsLoss32: number
  // Add score entry config fields to interface (API should provide these)
  scoreEntryType: ScoreEntryType
  setsToWin: number
}

interface TableEntry {
  teamId: number
  teamName: string
  played: number
  won: number
  lost: number
  points: number
  setsWon: number
  setsLost: number
  setsDiff: number
  pointsWon: number // Ball points won
  pointsLost: number // Ball points lost
  pointsDiff: number // Ball points difference
}

export default function PublicLeaguePage() {
  const { slug } = useParams()
  const [league, setLeague] = useState<League | null>(null)
  const [tableData, setTableData] = useState<TableEntry[]>([])
  const [activeTab, setActiveTab] = useState("table")
  const [showOnlyOpenFixtures, setShowOnlyOpenFixtures] = useState(false); // State für Checkbox
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const fetchLeagueData = async () => {
      try {
        // Liga-Daten abrufen
        const leagueResponse = await fetch(`/api/public/league/${slug}`)
        if (!leagueResponse.ok) {
          throw new Error('Liga nicht gefunden')
        }
        const leagueData = await leagueResponse.json()
        setLeague(leagueData)

        // Tabellendaten abrufen
        const tableResponse = await fetch(`/api/public/league/${slug}/table`)
        if (tableResponse.ok) {
          const tableData = await tableResponse.json()
          setTableData(tableData)
        }

        setLoading(false)
      } catch (err) {
        setError('Fehler beim Laden der Daten')
        setLoading(false)
        console.error(err)
      }
    }

    if (slug) {
      fetchLeagueData()
    }
  }, [slug])
 
  // Function to format date and time
  const formatDateTime = (dateString: string | null | undefined, timeString: string | null | undefined) => {
    if (!dateString) return 'Nicht geplant';
    const datePart = new Date(dateString).toLocaleDateString('de-DE', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
    const timePart = timeString ? ` ${timeString}` : '';
    return `${datePart}${timePart}`;
  };
 
  if (loading) {
    return (
      <ThemeProvider>
        <div className="flex justify-center items-center min-h-screen">Lade Daten...</div>
      </ThemeProvider>
    )
  }

  if (error || !league) {
    return (
      <ThemeProvider>
        <div className="flex justify-center items-center min-h-screen text-red-500">
          {error || 'Liga nicht gefunden'}
        </div>
      </ThemeProvider>
    )
  }

  // Filter fixtures based on the checkbox state and score presence
  const filteredFixtures = league?.fixtures?.filter(fixture => {
    if (!showOnlyOpenFixtures) {
      return true; // Show all if checkbox is off
    }
    // Show only fixtures where scores are not set (null or undefined)
    return fixture.homeScore === null || fixture.awayScore === null;
  }) || [];

  return (
    <ThemeProvider>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-6">{league.name}</h1>
        
        <Tabs value={activeTab}>
          <TabsHeader placeholder={undefined} onPointerEnterCapture={undefined} onPointerLeaveCapture={undefined}>
            <Tab value="table" onClick={() => setActiveTab("table")} placeholder={undefined} onPointerEnterCapture={undefined} onPointerLeaveCapture={undefined}>
              Tabelle
            </Tab>
            <Tab value="fixtures" onClick={() => setActiveTab("fixtures")} placeholder={undefined} onPointerEnterCapture={undefined} onPointerLeaveCapture={undefined}>
              Spielplan
            </Tab>
          </TabsHeader>
          <TabsBody placeholder={undefined} onPointerEnterCapture={undefined} onPointerLeaveCapture={undefined}>
            <TabPanel value="table" className={activeTab === "table" ? "block" : "hidden"}>
              {/* Tabelle */}
              <div className="overflow-x-auto">
                <table className="min-w-full bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700">
                  <thead>
                    <tr className="bg-gray-100 dark:bg-gray-700">
                      <th className="py-2 px-4 border-b text-left">Platz</th>
                      <th className="py-2 px-4 border-b text-left">Team</th>
                      <th className="py-2 px-4 border-b text-center">Spiele</th>
                      <th className="py-2 px-4 border-b text-center">N</th> {/* Niederlagen */}
                      <th className="py-2 px-4 border-b text-center">S</th> {/* Siege */}
                      <th className="py-2 px-4 border-b text-center">Summe</th> {/* Sätze */}
                      <th className="py-2 px-4 border-b text-center">Diff(Sätze)</th> {/* Satzdifferenz */}
                      <th className="py-2 px-4 border-b text-center">Bälle</th>
                      <th className="py-2 px-4 border-b text-center">Diff(Bälle)</th> {/* Balldifferenz */}
                      <th className="py-2 px-4 border-b text-center">Punkte</th>
                    </tr>
                  </thead>
                  <tbody>
                    {tableData.map((entry, index) => (
                      <tr key={entry.teamId} className="border-b dark:border-gray-700">
                        <td className="py-2 px-4">{index + 1}</td>
                        <td className="py-2 px-4">{entry.teamName}</td>
                        <td className="py-2 px-4 text-center">{entry.played}</td>
                        <td className="py-2 px-4 text-center">{entry.lost}</td> {/* N */}
                        <td className="py-2 px-4 text-center">{entry.won}</td> {/* S */}
                        <td className="py-2 px-4 text-center">{entry.setsWon}:{entry.setsLost}</td> {/* Summe (Sätze) */}
                        <td className="py-2 px-4 text-center">{entry.setsDiff > 0 ? `+${entry.setsDiff}` : entry.setsDiff}</td> {/* Diff(Sätze) */}
                        <td className="py-2 px-4 text-center">{entry.pointsWon}:{entry.pointsLost}</td> {/* Bälle */}
                        <td className="py-2 px-4 text-center">{entry.pointsDiff > 0 ? `+${entry.pointsDiff}` : entry.pointsDiff}</td> {/* Diff(Bälle) */}
                        <td className="py-2 px-4 text-center font-bold">{entry.points}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </TabPanel>
            <TabPanel value="fixtures" className={activeTab === "fixtures" ? "block" : "hidden"}>
              {/* Checkbox zum Filtern offener Spiele */}
              <div className="my-4">
                <Checkbox
                  label={
                    <Typography
                      variant="small"
                      color="gray"
                      className="flex items-center font-normal dark:text-gray-300"
                      placeholder={undefined}
                      onPointerEnterCapture={undefined}
                      onPointerLeaveCapture={undefined}
                    >
                      Nur offene Spiele anzeigen
                    </Typography>
                  }
                  checked={showOnlyOpenFixtures}
                  onChange={(e) => setShowOnlyOpenFixtures(e.target.checked)}
                  onPointerEnterCapture={undefined}
                  onPointerLeaveCapture={undefined}
                  crossOrigin={undefined}
                  placeholder={undefined}
                  className="focus:ring-0 focus:ring-offset-0"
                  iconProps={{
                    className: ""
                  }}
                />
              </div>
              {/* Spielplan */}
              <div className="overflow-x-auto">
                <table className="min-w-full bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700">
                  <thead>
                    <tr className="bg-gray-100 dark:bg-gray-700">
                      <th className="py-2 px-4 border-b text-left">Datum</th>
                      <th className="py-2 px-4 border-b text-left">Heimteam</th>
                      <th className="py-2 px-4 border-b text-center">Ergebnis</th>
                      <th className="py-2 px-4 border-b text-left">Auswärtsteam</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredFixtures.sort((a, b) => { // Verwende filteredFixtures statt league.fixtures
                      // Nach Datum sortieren, null-Werte am Ende
                      if (!a.fixtureDate) return 1;
                      if (!b.fixtureDate) return -1;
                      return new Date(a.fixtureDate).getTime() - new Date(b.fixtureDate).getTime();
                    }).map((fixture) => (
                      <tr key={fixture.id} className="border-b dark:border-gray-700">
                        <td className="py-2 px-4">
                          {formatDateTime(fixture.fixtureDate, fixture.fixtureTime)} {/* Use new function */}
                        </td>
                        <td className="py-2 px-4">{fixture.homeTeam.name}</td>
                        <td className="py-2 px-4 text-center font-semibold">
                          {/* Conditional Score Display */}
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
                                : `${fixture.homeScore}:${fixture.awayScore}` // Show match score
                              )
                            : '-:-'}
                           {/* Optional: Display Match Points */}
                           {(fixture.homeMatchPoints !== null && fixture.awayMatchPoints !== null) && (
                             <span className="ml-2 text-xs text-gray-500 dark:text-gray-400 font-normal">
                               (P: {fixture.homeMatchPoints}:{fixture.awayMatchPoints})
                             </span>
                           )}
                        </td>
                        <td className="py-2 px-4">{fixture.awayTeam.name}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </TabPanel>
          </TabsBody>
        </Tabs>
      </div>
    </ThemeProvider>
  )
}
