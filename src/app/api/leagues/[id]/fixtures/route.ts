import { NextResponse } from 'next/server';
// Importiere Service-Funktion
import { getFixturesByLeagueId } from '@/services/fixtureService';

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const leagueIdParam = (await params).id;
  const leagueId = parseInt(leagueIdParam);
  if (isNaN(leagueId)) {
    return NextResponse.json({ message: 'Ungültige Liga-ID' }, { status: 400 });
  }

  // Get query parameters
  const url = new URL(request.url);
  const showUpcoming = url.searchParams.get('upcoming') === 'true';

  try {
    // Rufe Service-Funktion auf
    const fixtures = await getFixturesByLeagueId(leagueId, showUpcoming);
    return NextResponse.json(fixtures);

  } catch (error) {
    console.error('Fehler beim Abrufen der Spielpaarungen (API):', error);
    return NextResponse.json({ message: 'Fehler beim Abrufen der Spielpaarungen' }, { status: 500 });
  }
}
