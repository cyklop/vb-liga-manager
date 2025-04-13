import { NextRequest, NextResponse } from 'next/server'
import prisma from '../../../../../../lib/prisma'

export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const { slug } = params

    // Liga finden
    // Liga mit Teams, Punktregeln und Score-Typ abrufen
    const league = await prisma.league.findUnique({
      where: { slug },
      // Explizit auswählen, was benötigt wird
      select: {
        id: true,
        name: true,
        slug: true,
        scoreEntryType: true,
        pointsWin30: true,
        pointsWin31: true,
        pointsWin32: true,
        pointsLoss32: true,
        teams: { // Nur Team-IDs und Namen für die Initialisierung
          select: {
            id: true,
            name: true,
          }
        },
      }
    })

    if (!league) {
      return NextResponse.json({ error: 'Liga nicht gefunden' }, { status: 404 })
    }

    // Fixtures für die Liga abrufen (nur abgeschlossene Spiele)
    const fixtures = await prisma.fixture.findMany({
      where: {
        leagueId: league.id,
        AND: [
          { homeScore: { not: null } },
          { awayScore: { not: null } },
        ],
      },
      select: { // Wähle alle benötigten Felder aus
        id: true,
        homeTeamId: true,
        awayTeamId: true,
        homeScore: true,
        awayScore: true,
        homeSet1: true, awaySet1: true,
        homeSet2: true, awaySet2: true,
        homeSet3: true, awaySet3: true,
        homeSet4: true, awaySet4: true,
        homeSet5: true, awaySet5: true,
        homePoints: true, // Ball points
        awayPoints: true, // Ball points
        homeMatchPoints: true, // League points
        awayMatchPoints: true, // League points
      }
    });

    // Tabelle initialisieren
    const tableEntries: Record<number, any> = {}; // Verwende 'any' vorübergehend oder definiere eine vollständige Schnittstelle
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
        setsQuotient: 0, // Hinzugefügt
        pointsWon: 0,    // Hinzugefügt (Ballpunkte)
        pointsLost: 0,   // Hinzugefügt (Ballpunkte)
        pointsDiff: 0,   // Hinzugefügt (Ballpunkte)
        pointsQuotient: 0,// Hinzugefügt (Ballpunkte)
        directComparisonWins: 0, // Hinzugefügt
        directComparisonLosses: 0,// Hinzugefügt
      };
    });

    // Fixtures verarbeiten und Tabelle berechnen
    fixtures.forEach(fixture => {
      const homeTeamId = fixture.homeTeamId;
      const awayTeamId = fixture.awayTeamId;

      // Sicherstellen, dass beide Teams noch zur Liga gehören (relevant bei Team-Entfernungen)
      if (!tableEntries[homeTeamId] || !tableEntries[awayTeamId]) {
        console.warn(`Fixture ${fixture.id} involves team not currently in league ${league.id}. Skipping.`);
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
      if (league.scoreEntryType === 'SET_SCORES') {
        let homeSets = 0;
        let awaySets = 0;
        for (let i = 1; i <= 5; i++) {
          const hs = fixture[`homeSet${i}` as keyof typeof fixture] as number | null;
          const as = fixture[`awaySet${i}` as keyof typeof fixture] as number | null;
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
          if (homeSets === 3 && awaySets === 0) tableEntries[homeTeamId].points += league.pointsWin30;
          else if (homeSets === 3 && awaySets === 1) tableEntries[homeTeamId].points += league.pointsWin31;
          else if (homeSets === 3 && awaySets === 2) {
            tableEntries[homeTeamId].points += league.pointsWin32;
            tableEntries[awayTeamId].points += league.pointsLoss32;
          }
        } else if (awaySets > homeSets) {
          tableEntries[awayTeamId].won++;
          tableEntries[homeTeamId].lost++;
          tableEntries[awayTeamId].directComparisonWins++;
          tableEntries[homeTeamId].directComparisonLosses++;
          if (awaySets === 3 && homeSets === 0) tableEntries[awayTeamId].points += league.pointsWin30;
          else if (awaySets === 3 && homeSets === 1) tableEntries[awayTeamId].points += league.pointsWin31;
          else if (awaySets === 3 && homeSets === 2) {
            tableEntries[awayTeamId].points += league.pointsWin32;
            tableEntries[homeTeamId].points += league.pointsLoss32;
          }
        }
      } else if (league.scoreEntryType === 'MATCH_SCORE') {
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

    // Abgeleitete Statistiken berechnen
    Object.values(tableEntries).forEach(entry => {
      entry.setsDiff = entry.setsWon - entry.setsLost;
      entry.setsQuotient = entry.setsLost === 0 ? (entry.setsWon > 0 ? Infinity : 0) : parseFloat((entry.setsWon / entry.setsLost).toFixed(3)); // Quotient berechnen
      entry.pointsDiff = entry.pointsWon - entry.pointsLost;
      entry.pointsQuotient = entry.pointsLost === 0 ? (entry.pointsWon > 0 ? Infinity : 0) : parseFloat((entry.pointsWon / entry.pointsLost).toFixed(3)); // Quotient berechnen
    });

    // Sortieren der Tabelle nach den erweiterten Kriterien
    const sortedTable = Object.values(tableEntries).sort((a, b) => {
      // 1. Punkte
      if (a.points !== b.points) return b.points - a.points;
      // 2. Siege (optional, manchmal verwendet)
      if (a.won !== b.won) return b.won - a.won;
      // 3. Satzdifferenz
      if (a.setsDiff !== b.setsDiff) return b.setsDiff - a.setsDiff;
      // 4. Satzquotient
      if (a.setsQuotient !== b.setsQuotient) return b.setsQuotient - a.setsQuotient;
      // 5. Direkter Vergleich (komplexer, hier vereinfacht als Siege/Niederlagen im direkten Duell)
      //    Eine vollständige Implementierung würde die spezifischen Spiele zwischen a und b betrachten.
      //    Hier verwenden wir die akkumulierten direkten Siege/Niederlagen als Annäherung.
      //    TODO: Ggf. eine genauere Implementierung des direkten Vergleichs hinzufügen.
      // if (a.directComparisonWins !== b.directComparisonWins) return b.directComparisonWins - a.directComparisonWins;
      // 6. Ballpunktdifferenz
      if (a.pointsDiff !== b.pointsDiff) return b.pointsDiff - a.pointsDiff;
      // 7. Ballpunktquotient
      if (a.pointsQuotient !== b.pointsQuotient) return b.pointsQuotient - a.pointsQuotient;
      // 8. Alphabetisch nach Teamnamen als letztes Kriterium
      return a.teamName.localeCompare(b.teamName);
    });
    
    return NextResponse.json(sortedTable)
  } catch (error) {
    console.error('Error calculating table:', error)
    return NextResponse.json({ error: 'Serverfehler' }, { status: 500 })
  }
}
