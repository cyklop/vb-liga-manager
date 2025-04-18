import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
// Importiere Service-Funktion
import { generateFixturesForLeague } from '@/services/leagueService';


// Die Helper-Funktionen (extractTimeFromString, generateRoundRobinFixtures)
// wurden in den leagueService verschoben.


export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  // Destructure id directly from params
  const leagueIdParam = (await params).id;
  const leagueId = parseInt(leagueIdParam);
  if (isNaN(leagueId)) {
    return NextResponse.json({ message: 'Ungültige Liga-ID' }, { status: 400 });
  }

  // --- Berechtigungsprüfung ---
  const session = await getServerSession(authOptions);
  if (!session?.user?.isAdmin) { // Beispiel: Nur Admins dürfen generieren
    return NextResponse.json({ message: 'Nicht autorisiert' }, { status: 403 });
  }
  // --- Ende Berechtigungsprüfung ---

  try {
    // Rufe Service-Funktion auf
    const result = await generateFixturesForLeague(leagueId);
    return NextResponse.json({ message: `${result.message} (${result.fixtureCount} Spiele).` });

  } catch (error) {
    console.error('Fehler beim Generieren des Spielplans (API):', error);
    // Handle spezifische Fehler vom Service
    if (error instanceof Error) {
        // Gib die Fehlermeldung vom Service an den Client weiter
        return NextResponse.json({ message: error.message }, { status: 400 }); // 400 für erwartete Fehler (z.B. falsche Teamanzahl)
    }
    return NextResponse.json({ message: 'Fehler beim Generieren des Spielplans' }, { status: 500 });
  }
}
