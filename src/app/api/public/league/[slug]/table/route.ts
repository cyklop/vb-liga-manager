import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
// Verwende Pfad-Alias für besseren Import
import { calculateTable, CalculationLeague, CalculationFixture, TableEntry } from '@/lib/table-calculation';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params

    // 1. Liga-Daten abrufen (nur benötigte Felder für CalculationLeague)
    const leagueData = await prisma.league.findUnique({
      where: { slug },
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
        }
      }
    });

    if (!leagueData || !leagueData.scoreEntryType) { // Prüfe auf leagueData
      return NextResponse.json({ error: 'Liga nicht gefunden oder ungültig' }, { status: 404 });
    }

    // 2. Fixture-Daten abrufen (nur benötigte Felder für CalculationFixture)
    const fixturesData = await prisma.fixture.findMany({
      where: {
        leagueId: leagueData.id, // Verwende leagueData.id
        AND: [
          { homeScore: { not: null } }, // Nur abgeschlossene Spiele
          { awayScore: { not: null } },
        ],
      },
      select: {
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
        awayPoints: true,
        homeMatchPoints: true,
        awayMatchPoints: true,
      }
    });

    // 3. Berechnung an die Utility-Funktion delegieren
    // Stelle sicher, dass leagueData und fixturesData den erwarteten Typen entsprechen
    // Prisma liefert möglicherweise mehr Felder als benötigt, aber das ist ok, solange die benötigten da sind.
    const sortedTable = calculateTable(leagueData as CalculationLeague, fixturesData as CalculationFixture[]);

    return NextResponse.json(sortedTable);

  } catch (error) {
    console.error('Error fetching public league table:', error); // Angepasste Fehlermeldung
    return NextResponse.json({ error: 'Serverfehler' }, { status: 500 })
  }
}
