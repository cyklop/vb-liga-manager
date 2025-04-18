import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
// Importiere Service-Funktion
import { getFixturesByTeamId } from '@/services/fixtureService';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const teamIdParam = (await params).id;
  const teamId = parseInt(teamIdParam);
  if (isNaN(teamId)) {
    return NextResponse.json({ message: 'Ungültige Team-ID' }, { status: 400 })
  }

  // Benutzerberechtigungen prüfen
  const session = await getServerSession(authOptions)
  if (!session || !session.user?.id) {
    return NextResponse.json({ message: 'Nicht authentifiziert' }, { status: 401 })
  }

  // ID aus Session holen und sicher in Zahl umwandeln
  const sessionUserId = parseInt(session.user.id as any, 10); // Use 'as any' to bypass potential TS type conflict if needed, parseInt expects string
  if (isNaN(sessionUserId)) {
    return NextResponse.json({ message: 'Ungültige Benutzer-ID in der Session' }, { status: 400 });
  }

  // URL-Parameter auslesen
  const { searchParams } = new URL(request.url);
  const homeOnly = searchParams.get('homeOnly') === 'true';

  try {
    // --- Berechtigungsprüfung (bleibt in der Route) ---
    const user = await prisma.user.findUnique({ // Prisma hier OK für Auth-Check
      where: { id: sessionUserId },
      include: { teams: true }
    });
    if (!user) {
      return NextResponse.json({ message: 'Benutzer nicht gefunden' }, { status: 404 });
    }
    const userTeams = user.teams.map(ut => ut.teamId);
    if (!user.isAdmin && !user.isSuperAdmin && !userTeams.includes(teamId)) {
      return NextResponse.json({ message: 'Keine Berechtigung' }, { status: 403 });
    }
    // --- Ende Berechtigungsprüfung ---

    // Rufe Service-Funktion auf
    const fixtures = await getFixturesByTeamId(teamId, homeOnly);
    return NextResponse.json(fixtures);

  } catch (error) {
    console.error('Fehler beim Abrufen der Spielpaarungen für Team (API):', error);
    return NextResponse.json({ message: 'Ein Fehler ist aufgetreten' }, { status: 500 })
  }
}
