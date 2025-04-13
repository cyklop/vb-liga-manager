import { Prisma, League, Fixture, Team, ScoreEntryType } from '@prisma/client';

// Interface für die benötigten Fixture-Daten für die Berechnung
// Enthält nur die Felder, die tatsächlich für die Logik gebraucht werden.
export interface CalculationFixture extends Pick<Fixture,
  'id' | 'homeTeamId' | 'awayTeamId' | 'homeScore' | 'awayScore' |
  'homeSet1' | 'awaySet1' | 'homeSet2' | 'awaySet2' | 'homeSet3' | 'awaySet3' |
  'homeSet4' | 'awaySet4' | 'homeSet5' | 'awaySet5' |
  'homePoints' | 'awayPoints' | 'homeMatchPoints' | 'awayMatchPoints' // home/awayPoints = Ball Points, home/awayMatchPoints = League Points
> {}

// Interface für die benötigten Liga-Daten für die Berechnung
export interface CalculationLeague extends Pick<League,
  'id' | 'scoreEntryType' | 'pointsWin30' | 'pointsWin31' | 'pointsWin32' | 'pointsLoss32'
> {
  teams: Pick<Team, 'id' | 'name'>[]; // Nur Team-IDs und Namen benötigt
}

// Interface für den finalen Tabelleneintrag (Struktur für die API-Antwort)
export interface TableEntry {
    teamId: number;
    teamName: string;
    played: number;
    won: number;
    lost: number;
    points: number; // League points
    setsWon: number;
    setsLost: number;
    setsDiff: number;
    setsQuotient: number;
    pointsWon: number; // Ball points won
    pointsLost: number; // Ball points lost
    pointsDiff: number; // Ball points difference
    pointsQuotient: number; // Ball points quotient
    directComparisonWins: number; // Simplified direct comparison tracking
    directComparisonLosses: number; // Simplified direct comparison tracking
}

/**
 * Berechnet die Ligatabelle basierend auf den Liga-Einstellungen und den Spielergebnissen.
 * @param league - Die Liga-Daten (inkl. Teams, Punktregeln, ScoreEntryType).
 * @param fixtures - Eine Liste der abgeschlossenen Spiele für die Liga.
 * @returns Ein sortiertes Array von Tabelleneinträgen.
 */
export function calculateTable(league: CalculationLeague, fixtures: CalculationFixture[]): TableEntry[] {
    const tableEntries: Record<number, TableEntry> = {};

    // 1. Tabelle initialisieren
    league.teams.forEach(team => {
      tableEntries[team.id] = {
        teamId: team.id,
        teamName: team.name,
        played: 0,
        won: 0,
        lost: 0,
        points: 0,
        setsWon: 0,
        setsLost: 0,
        setsDiff: 0,
        setsQuotient: 0,
        pointsWon: 0,
        pointsLost: 0,
        pointsDiff: 0,
        pointsQuotient: 0,
        directComparisonWins: 0,
        directComparisonLosses: 0,
      };
    });

    // 2. Fixtures verarbeiten
    fixtures.forEach(fixture => {
      const homeTeamId = fixture.homeTeamId;
      const awayTeamId = fixture.awayTeamId;

      // Sicherstellen, dass beide Teams im initialisierten Objekt vorhanden sind
      if (!tableEntries[homeTeamId] || !tableEntries[awayTeamId]) {
        console.warn(`Fixture ${fixture.id} involves team not in league ${league.id} team list. Skipping.`);
        return;
      }

      tableEntries[homeTeamId].played++;
      tableEntries[awayTeamId].played++;

      // Ballpunkte immer zählen
      const homeBallPoints = fixture.homePoints || 0;
      const awayBallPoints = fixture.awayPoints || 0;
      tableEntries[homeTeamId].pointsWon += homeBallPoints;
      tableEntries[homeTeamId].pointsLost += awayBallPoints;
      tableEntries[awayTeamId].pointsWon += awayBallPoints;
      tableEntries[awayTeamId].pointsLost += homeBallPoints;

      // Logik basierend auf ScoreEntryType
      if (league.scoreEntryType === ScoreEntryType.SET_SCORES) {
        let homeSets = 0;
        let awaySets = 0;
        for (let i = 1; i <= 5; i++) {
          const hs = fixture[`homeSet${i}` as keyof CalculationFixture] as number | null;
          const as = fixture[`awaySet${i}` as keyof CalculationFixture] as number | null;
          if (hs !== null && as !== null) {
            if (hs > as) homeSets++;
            else if (as > hs) awaySets++;
          }
        }

        tableEntries[homeTeamId].setsWon += homeSets;
        tableEntries[homeTeamId].setsLost += awaySets;
        tableEntries[awayTeamId].setsWon += awaySets;
        tableEntries[awayTeamId].setsLost += homeSets;

        if (homeSets > awaySets) {
          tableEntries[homeTeamId].won++;
          tableEntries[awayTeamId].lost++;
          tableEntries[homeTeamId].directComparisonWins++;
          tableEntries[awayTeamId].directComparisonLosses++;
          // Add null checks for point assignment
          if (homeSets === 3 && awaySets === 0) tableEntries[homeTeamId].points += league.pointsWin30 ?? 0;
          else if (homeSets === 3 && awaySets === 1) tableEntries[homeTeamId].points += league.pointsWin31 ?? 0;
          else if (homeSets === 3 && awaySets === 2) {
            tableEntries[homeTeamId].points += league.pointsWin32 ?? 0;
            tableEntries[awayTeamId].points += league.pointsLoss32 ?? 0;
          }
        } else if (awaySets > homeSets) {
          tableEntries[awayTeamId].won++;
          tableEntries[homeTeamId].lost++;
          tableEntries[awayTeamId].directComparisonWins++;
          tableEntries[homeTeamId].directComparisonLosses++;
          // Add null checks for point assignment
          if (awaySets === 3 && homeSets === 0) tableEntries[awayTeamId].points += league.pointsWin30 ?? 0;
          else if (awaySets === 3 && homeSets === 1) tableEntries[awayTeamId].points += league.pointsWin31 ?? 0;
          else if (awaySets === 3 && homeSets === 2) {
            const awayTeamIdForLog = awayTeamId; // Kopiere ID für Logging
            const homeTeamIdForLog = homeTeamId; // Kopiere ID für Logging
            const pointsToAddAway = league.pointsWin32 ?? 0;
            const pointsToAddHome = league.pointsLoss32 ?? 0;
            // Logge auch den Wert aus dem league-Objekt
            console.log(`DEBUG (Fixture ${fixture.id}): Applying 3:2 Away Win. Away Team (${awayTeamIdForLog}) gets ${pointsToAddAway} (league.pointsWin32=${league.pointsWin32}). Home Team (${homeTeamIdForLog}) gets ${pointsToAddHome} (league.pointsLoss32=${league.pointsLoss32}).`);
            console.log(`  -> Before: Away Points = ${tableEntries[awayTeamIdForLog].points}, Home Points = ${tableEntries[homeTeamIdForLog].points}`);
            tableEntries[awayTeamIdForLog].points += pointsToAddAway;
            tableEntries[homeTeamIdForLog].points += pointsToAddHome;
            console.log(`  -> After: Away Points = ${tableEntries[awayTeamIdForLog].points}, Home Points = ${tableEntries[homeTeamIdForLog].points}`);
          }
        }
      } else if (league.scoreEntryType === ScoreEntryType.MATCH_SCORE) {
        const homeMatchScore = fixture.homeScore || 0;
        const awayMatchScore = fixture.awayScore || 0;
        const homeLeaguePoints = fixture.homeMatchPoints || 0;
        const awayLeaguePoints = fixture.awayMatchPoints || 0;

        tableEntries[homeTeamId].setsWon += homeMatchScore; // "Sätze" sind hier Match-Scores
        tableEntries[homeTeamId].setsLost += awayMatchScore;
        tableEntries[awayTeamId].setsWon += awayMatchScore;
        tableEntries[awayTeamId].setsLost += homeMatchScore;

        tableEntries[homeTeamId].points += homeLeaguePoints;
        tableEntries[awayTeamId].points += awayLeaguePoints;

        if (homeMatchScore > awayMatchScore) {
          tableEntries[homeTeamId].won++;
          tableEntries[awayTeamId].lost++;
          tableEntries[homeTeamId].directComparisonWins++;
          tableEntries[awayTeamId].directComparisonLosses++;
        } else if (awayMatchScore > homeMatchScore) {
          tableEntries[awayTeamId].won++;
          tableEntries[homeTeamId].lost++;
          tableEntries[awayTeamId].directComparisonWins++;
          tableEntries[homeTeamId].directComparisonLosses++;
        }
      }
    });

    // DEBUG: Log the state of tableEntries *after* processing all fixtures
    console.log("DEBUG: tableEntries state before calculating derived stats:", JSON.stringify(tableEntries, null, 2));


    // 3. Abgeleitete Statistiken berechnen
    Object.values(tableEntries).forEach(entry => {
      entry.setsDiff = entry.setsWon - entry.setsLost;
      // Handle division by zero for quotients
      entry.setsQuotient = entry.setsLost === 0 ? (entry.setsWon > 0 ? Infinity : 0) : parseFloat((entry.setsWon / entry.setsLost).toFixed(3));
      entry.pointsDiff = entry.pointsWon - entry.pointsLost;
      entry.pointsQuotient = entry.pointsLost === 0 ? (entry.pointsWon > 0 ? Infinity : 0) : parseFloat((entry.pointsWon / entry.pointsLost).toFixed(3));
    });

    // 4. Tabelle sortieren
    const sortedTable = Object.values(tableEntries).sort((a, b) => {
      // 1. Punkte
      if (a.points !== b.points) return b.points - a.points;
      // 2. Siege (optional, manchmal verwendet)
      if (a.won !== b.won) return b.won - a.won;
      // 3. Satzdifferenz
      if (a.setsDiff !== b.setsDiff) return b.setsDiff - a.setsDiff;
      // 4. Satzquotient (handle Infinity)
      if (a.setsQuotient === Infinity && b.setsQuotient !== Infinity) return -1;
      if (a.setsQuotient !== Infinity && b.setsQuotient === Infinity) return 1;
      if (a.setsQuotient !== b.setsQuotient) return b.setsQuotient - a.setsQuotient;
      // 5. Direkter Vergleich (vereinfacht) - TODO: Ggf. verbessern
      // if (a.directComparisonWins !== b.directComparisonWins) return b.directComparisonWins - a.directComparisonWins;
      // 6. Ballpunktdifferenz
      if (a.pointsDiff !== b.pointsDiff) return b.pointsDiff - a.pointsDiff;
      // 7. Ballpunktquotient (handle Infinity)
      if (a.pointsQuotient === Infinity && b.pointsQuotient !== Infinity) return -1;
      if (a.pointsQuotient !== Infinity && b.pointsQuotient === Infinity) return 1;
      if (a.pointsQuotient !== b.pointsQuotient) return b.pointsQuotient - a.pointsQuotient;
      // 8. Alphabetisch nach Teamnamen
      return a.teamName.localeCompare(b.teamName);
    });

    return sortedTable;
}
