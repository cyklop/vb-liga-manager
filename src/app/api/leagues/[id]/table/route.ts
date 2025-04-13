import { NextResponse } from 'next/server';
import prisma, { Prisma } from '../../../../../lib/prisma'; // Importiere Prisma für Typen
// Verwende Pfad-Alias für besseren Import
import { calculateTable, CalculationLeague, CalculationFixture, TableEntry } from '@/lib/table-calculation';

export async function GET(request: Request, { params }: { params: { id: string } }) {
  const leagueId = parseInt(params.id);
  if (isNaN(leagueId)) {
    return NextResponse.json({ message: 'Ungültige Liga-ID' }, { status: 400 });
  }

  // Get query parameters
  const url = new URL(request.url);
  const matchdayParam = url.searchParams.get('matchday');
  const matchday = matchdayParam ? parseInt(matchdayParam) : undefined;

  try {
    // 1. Liga-Daten abrufen (nur benötigte Felder für CalculationLeague)
    const leagueData = await prisma.league.findUnique({
      where: { id: leagueId },
      select: {
        id: true,
        scoreEntryType: true,
        pointsWin30: true,
        pointsWin31: true,
        pointsWin32: true,
        pointsLoss32: true,
        teams: {
          select: {
            id: true,
            name: true,
          }
        }
      }
    });

    if (!leagueData || !leagueData.scoreEntryType) {
      return NextResponse.json({ message: 'Liga nicht gefunden oder ungültig' }, { status: 404 });
    }

    // 2. Fixture-Daten abrufen (nur benötigte Felder für CalculationFixture)
    const fixtureWhere: Prisma.FixtureWhereInput = {
      leagueId,
      AND: [
        { homeScore: { not: null } }, // Nur abgeschlossene Spiele
        { awayScore: { not: null } },
      ],
    };
    // Füge Matchday-Filter hinzu, falls vorhanden
    if (matchday !== undefined) {
      if (!fixtureWhere.AND) fixtureWhere.AND = []; // Stelle sicher, dass AND existiert
      (fixtureWhere.AND as Prisma.FixtureWhereInput[]).push({ matchday: { lte: matchday } });
    }

    const fixturesData = await prisma.fixture.findMany({
      where: fixtureWhere,
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
        awayPoints: true, // Ball points
        homeMatchPoints: true, // League points
        awayMatchPoints: true, // League points
      }
    });

    // 3. Berechnung an die Utility-Funktion delegieren
    const sortedTable = calculateTable(leagueData as CalculationLeague, fixturesData as CalculationFixture[]);

    return NextResponse.json(sortedTable);

  } catch (error) {
    console.error('Error calculating admin league table:', error); // Angepasste Fehlermeldung
    return NextResponse.json({ message: 'Fehler bei der Berechnung der Tabelle' }, { status: 500 });
  }
}
