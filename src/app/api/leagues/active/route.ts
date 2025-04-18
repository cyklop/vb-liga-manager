import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
// Importiere zentrale Typen für die Rückgabe
import type { LeagueDetails, Team, Fixture } from '@/types/models';

// GET: Retrieve the currently active league
export async function GET() {
  try {
    // Get the active league setting from the database
    const setting = await prisma.setting.findUnique({
      where: { key: 'activeLeagueId' },
    });

    if (!setting) {
      return NextResponse.json({ activeLeagueId: null });
    }

    // Get the actual league data
    const leagueId = parseInt(setting.value);
    const league = await prisma.league.findUnique({
      where: { id: leagueId },
      include: {
        teams: true, // Behalte Teams für die Konvertierung
        fixtures: true // Behalte Fixtures für die Konvertierung
      },
    });

    // Konvertiere die Liga in LeagueDetails (oder LeagueOverview, falls ausreichend)
    let responseLeague: LeagueDetails | null = null;
    if (league) {
      responseLeague = {
        ...league,
        teams: league.teams.map(team => ({ // Map zu vollem Team-Typ
          id: team.id,
          name: team.name,
          // Füge hier ggf. weitere Felder aus dem zentralen Team-Typ hinzu
        })),
        fixtures: league.fixtures.map(fixture => ({ // Map zu zentralem Fixture-Typ
          ...fixture,
          homeTeam: { id: fixture.homeTeamId, name: 'N/A' }, // Temporär
          awayTeam: { id: fixture.awayTeamId, name: 'N/A' }, // Temporär
        })) as Fixture[], // Cast zum zentralen Fixture-Typ
      };
    }

    return NextResponse.json({ activeLeagueId: leagueId, league: responseLeague });
  } catch (error) {
    console.error('Error fetching active league:', error);
    return NextResponse.json({ message: 'Fehler beim Abrufen der aktiven Liga' }, { status: 500 });
  }
}

// PUT: Set the active league
export async function PUT(request: Request) {
  try {
    const { leagueId } = await request.json();
    
    if (typeof leagueId !== 'number') {
      return NextResponse.json({ message: 'Ungültige Liga-ID' }, { status: 400 });
    }

    // Check if the league exists
    const league = await prisma.league.findUnique({
      where: { id: leagueId },
    });

    if (!league) {
      return NextResponse.json({ message: 'Liga nicht gefunden' }, { status: 404 });
    }

    // Update or create the setting
    await prisma.setting.upsert({
      where: { key: 'activeLeagueId' },
      update: { value: leagueId.toString() },
      create: { key: 'activeLeagueId', value: leagueId.toString() },
    });

    return NextResponse.json({ message: 'Aktive Liga erfolgreich gesetzt' });
  } catch (error) {
    console.error('Error setting active league:', error);
    return NextResponse.json({ message: 'Fehler beim Setzen der aktiven Liga' }, { status: 500 });
  }
}
