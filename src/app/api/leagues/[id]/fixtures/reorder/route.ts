import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
// Importiere Service-Funktion
import { reorderFixtures } from '@/services/fixtureService';

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const leagueIdParam = (await params).id;
  const leagueId = parseInt(leagueIdParam);
  if (isNaN(leagueId)) {
    return NextResponse.json({ message: 'Ungültige Liga-ID' }, { status: 400 })
  }

  // --- Berechtigungsprüfung ---
  const session = await getServerSession(authOptions);
  if (!session?.user?.isAdmin) { // Beispiel: Nur Admins dürfen umsortieren
    return NextResponse.json({ message: 'Nicht autorisiert' }, { status: 403 });
  }
  // --- Ende Berechtigungsprüfung ---

  try {
    const { orderedFixtureIds } = await request.json();

    // --- Validierung (Grundlegend) ---
    if (!Array.isArray(orderedFixtureIds) || orderedFixtureIds.length === 0) {
      return NextResponse.json({ message: 'Liste der Fixture-IDs fehlt oder ist leer.' }, { status: 400 });
    }
    if (orderedFixtureIds.some(id => typeof id !== 'number')) {
        return NextResponse.json({ message: 'Liste der Fixture-IDs enthält ungültige Werte.' }, { status: 400 });
    }
    // --- Ende Validierung ---

    // Rufe Service-Funktion auf
    await reorderFixtures(leagueId, orderedFixtureIds);
    return NextResponse.json({ message: 'Spielplanreihenfolge erfolgreich aktualisiert' });

  } catch (error) {
    console.error('Fehler beim Aktualisieren der Spielplanreihenfolge (API):', error);
    // Handle spezifische Fehler vom Service
    if (error instanceof Error) {
        return NextResponse.json({ message: error.message }, { status: 400 }); // 400 für erwartete Fehler
    }
    return NextResponse.json({ message: 'Fehler beim Aktualisieren der Spielplanreihenfolge' }, { status: 500 })
  }
  // No finally block needed for singleton
}
