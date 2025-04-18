'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
// Entferne Material Tailwind Tabs Imports
// import { Tabs, TabsHeader, TabsBody, Tab, TabPanel } from "@material-tailwind/react"
// Behalte Checkbox und Typography, falls sie noch woanders verwendet werden (Checkbox wird noch verwendet)
import { Checkbox, Typography } from "@material-tailwind/react"
import { ThemeProvider } from '@/components/ThemeProvider';
import { ScoreEntryType } from '@prisma/client';
// Importiere zentrale Typen
import type { TeamBasicInfo as Team, Fixture, LeagueDetails, TableEntry } from '@/types/models'; // Verwende LeagueDetails

// Lokale Fixture/League/TableEntry Interfaces entfernt
// Fixture wird jetzt importiert
// League wird jetzt importiert (als LeagueDetails)
// TableEntry wird jetzt importiert


export default function PublicLeaguePage() {
  const { slug } = useParams();
  // Verwende zentrale Typen
  const [league, setLeague] = useState<LeagueDetails | null>(null); // Verwende LeagueDetails
  const [tableData, setTableData] = useState<TableEntry[]>([]); // Verwende zentralen TableEntry Placeholder
  // Entferne activeTab State
  // const [activeTab, setActiveTab] = useState("table")
  const [showOnlyOpenFixtures, setShowOnlyOpenFixtures] = useState(false); // State für Checkbox
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');


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

        {/* DaisyUI Tabs Structure */}
        <div role="tablist" className="tabs tabs-xl tabs-lift mb-6"> {/* mb-6 für Abstand nach unten */}

          {/* Tab 1: Tabelle */}
          <input
            type="radio"
            name="league_tabs" // Gleicher Name für die Gruppe
            role="tab"
            className="tab"
            aria-label="Tabelle"
            defaultChecked // Standardmäßig ausgewählt
          />
          <div role="tabpanel" className="tab-content bg-base-100 border-base-300 p-4"> {/* Inhalt für Tab 1 */}
            {/* Tabelle */}
            <div className="overflow-x-auto">
              <table className="min-w-full table table-zebra"> {/* DaisyUI Tabellenklasse */}
                <thead>
                  <tr> {/* Entferne explizite Hintergrund-/Border-Klassen, nutze DaisyUI table/thead */}
                    <th className="text-left">Platz</th>
                    <th className="text-left">Team</th>
                    <th className="text-center">Spiele</th>
                    <th className="text-center">N</th> {/* Niederlagen */}
                    <th className="text-center">S</th> {/* Siege */}
                    <th className="text-center">Summe</th> {/* Sätze */}
                    <th className="text-center">Diff(Sätze)</th> {/* Satzdifferenz */}
                    <th className="text-center">Bälle</th>
                    <th className="text-center">Diff(Bälle)</th> {/* Balldifferenz */}
                    <th className="text-center">Punkte</th>
                  </tr>
                </thead>
                <tbody>
                  {tableData.map((entry, index) => (
                    <tr key={entry.teamId}> {/* Entferne explizite Hintergrund-/Border-Klassen */}
                      <td>{index + 1}</td>
                      <td>{entry.teamName}</td>
                      <td className="text-center">{entry.played}</td>
                      <td className="text-center">{entry.lost}</td> {/* N */}
                      <td className="text-center">{entry.won}</td> {/* S */}
                      <td className="text-center">{entry.setsWon}:{entry.setsLost}</td> {/* Summe (Sätze) */}
                      <td className="text-center">{entry.setsDiff > 0 ? `+${entry.setsDiff}` : entry.setsDiff}</td> {/* Diff(Sätze) */}
                      <td className="text-center">{entry.pointsWon}:{entry.pointsLost}</td> {/* Bälle */}
                      <td className="text-center">{entry.pointsDiff > 0 ? `+${entry.pointsDiff}` : entry.pointsDiff}</td> {/* Diff(Bälle) */}
                      <td className="text-center font-bold">{entry.points}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Tab 2: Spielplan */}
          <input
            type="radio"
            name="league_tabs" // Gleicher Name für die Gruppe
            role="tab"
            className="tab"
            aria-label="Spielplan"
          />
          <div role="tabpanel" className="tab-content bg-base-100 border-base-300 p-4"> {/* Inhalt für Tab 2 */}
            {/* Checkbox zum Filtern offener Spiele */}
            <div className="my-4">
              {/* Behalte die MTW Checkbox vorerst, oder ersetze sie durch DaisyUI Checkbox */}
              <Checkbox
                label={
                  <Typography
                    variant="small"
                    // color="gray" // Farbe wird durch DaisyUI Theme gesteuert
                    className="flex items-center font-normal fieldset-label text-base-content" // Angepasste Textfarbe
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
                className="checkbox checkbox-primary" // MTW Fokus-Styling entfernen
                // DaisyUI Checkbox Klassen könnten hier hinzugefügt werden, wenn MTW ersetzt wird
                // z.B. className="checkbox checkbox-primary"
                iconProps={{
                  className: "" // MTW Icon Styling entfernen
                }}
              />
            </div>
            {/* Spielplan */}
            <div className="overflow-x-auto">
              <table className="min-w-full table table-zebra"> {/* DaisyUI Tabellenklasse */}
                <thead>
                  <tr> {/* Entferne explizite Hintergrund-/Border-Klassen */}
                    <th className="text-left">Datum</th>
                    <th className="text-left">Heimteam</th>
                    <th className="text-center">Ergebnis</th>
                    <th className="text-left">Auswärtsteam</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredFixtures.sort((a, b) => {
                    if (!a.fixtureDate) return 1;
                    if (!b.fixtureDate) return -1;
                    return new Date(a.fixtureDate).getTime() - new Date(b.fixtureDate).getTime();
                  }).map((fixture) => (
                    <tr key={fixture.id}> {/* Entferne explizite Hintergrund-/Border-Klassen */}
                      <td>
                        {formatDateTime(fixture.fixtureDate, fixture.fixtureTime)}
                      </td>
                      <td>{fixture.homeTeam.name}</td>
                      <td className="text-center font-semibold">
                        {fixture.homeScore !== null && fixture.awayScore !== null
                          ? (league.scoreEntryType === ScoreEntryType.SET_SCORES
                              ? [1, 2, 3, 4, 5]
                                  .map(setNum => ({
                                    home: fixture[`homeSet${setNum}` as keyof Fixture],
                                    away: fixture[`awaySet${setNum}` as keyof Fixture],
                                  }))
                                  .filter(set => set.home !== null && set.away !== null)
                                  .map(set => `${set.home}:${set.away}`)
                                  .join(', ')
                              : `${fixture.homeScore}:${fixture.awayScore}`
                            )
                          : '-:-'}
                         {(fixture.homeMatchPoints !== null && fixture.awayMatchPoints !== null) && (
                           <span className="ml-2 text-xs text-base-content/50 font-normal"> {/* Angepasste Textfarbe */}
                             (P: {fixture.homeMatchPoints}:{fixture.awayMatchPoints})
                           </span>
                         )}
                      </td>
                      <td>{fixture.awayTeam.name}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

        </div> {/* Ende des DaisyUI Tabs Containers */}
      </div>
    </ThemeProvider>
  )
}
