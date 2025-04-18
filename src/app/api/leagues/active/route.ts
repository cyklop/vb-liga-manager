import { NextResponse } from 'next/server';
// Importiere Service-Funktionen und Typen
import { getActiveLeague, setActiveLeague } from '@/services/leagueService';
import type { LeagueDetails } from '@/types/models';

// GET: Retrieve the currently active league
export async function GET() {
  try {
    // Rufe Service-Funktion auf
    const activeLeagueData = await getActiveLeague();
    return NextResponse.json(activeLeagueData);

  } catch (error) {
    console.error('Fehler beim Abrufen der aktiven Liga (API):', error);
    return NextResponse.json({ message: 'Fehler beim Abrufen der aktiven Liga' }, { status: 500 });
  }
}

// PUT: Set the active league
export async function PUT(request: Request) {
  // Optional: Berechtigungsprüfung (wer darf die aktive Liga setzen?)
  // const session = await getServerSession(authOptions);
  // if (!session?.user?.isAdmin) {
  //     return NextResponse.json({ message: 'Nicht autorisiert' }, { status: 403 });
  // }

  try {
    const { leagueId } = await request.json();

    if (typeof leagueId !== 'number') {
      return NextResponse.json({ message: 'Ungültige Liga-ID' }, { status: 400 });
    }

    // Rufe Service-Funktion auf
    await setActiveLeague(leagueId);
    return NextResponse.json({ message: 'Aktive Liga erfolgreich gesetzt' });

  } catch (error) {
    console.error('Fehler beim Setzen der aktiven Liga (API):', error);
    // Handle spezifische Fehler vom Service
    if (error instanceof Error && error.message.includes('Liga nicht gefunden')) {
        return NextResponse.json({ message: error.message }, { status: 404 });
    }
    return NextResponse.json({ message: 'Fehler beim Setzen der aktiven Liga' }, { status: 500 });
  }
}
