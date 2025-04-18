import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma'; // Prisma für Auth-Check benötigt
// Importiere Service-Funktion und Typen
import { updateFixture, type UpdateFixtureData } from '@/services/fixtureService';
import type { Fixture } from '@/types/models'; // Importiere zentralen Fixture-Typ

// PUT Handler to update a specific fixture
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const idParam = (await params).id;
  const id = parseInt(idParam);
  if (isNaN(id)) {
    return NextResponse.json({ message: 'Ungültige Fixture-ID' }, { status: 400 })
  }

  try {
    // --- Berechtigungsprüfung (bleibt in der Route) ---
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ message: 'Nicht authentifiziert' }, { status: 401 });
    }
    const user = await prisma.user.findUnique({ // Prisma hier OK für Auth-Check
      where: { email: session.user.email },
      include: { teams: true },
    });
    if (!user) {
      return NextResponse.json({ message: 'Nicht autorisiert' }, { status: 401 });
    }
    // Fixture holen, um Berechtigung zu prüfen (Service könnte das auch tun, aber hier OK)
    const fixtureToCheck = await prisma.fixture.findUnique({ where: { id } });
    if (!fixtureToCheck) {
        return NextResponse.json({ message: 'Spielpaarung nicht gefunden' }, { status: 404 });
    }
    if (!user.isAdmin && !user.isSuperAdmin) {
      if (!user.teams || user.teams.length === 0) return NextResponse.json({ message: 'Benutzer ist keinem Team zugeordnet.' }, { status: 403 });
      const userTeamIds = user.teams.map(userTeam => userTeam.teamId);
      if (!userTeamIds.includes(fixtureToCheck.homeTeamId)) return NextResponse.json({ message: 'Sie sind nur berechtigt, Heimspiele Ihrer eigenen Mannschaft zu bearbeiten.' }, { status: 403 });
    }
    // --- Ende Berechtigungsprüfung ---

    // --- Request Body lesen und Validierung ---
    const {
      fixtureDate,
      fixtureTime,
      scoreData,
      homeTeamId,
      awayTeamId
    }: UpdateFixtureData = await request.json(); // Verwende den Service-Typ

    if (homeTeamId !== undefined && awayTeamId !== undefined && homeTeamId !== null && awayTeamId !== null && homeTeamId === awayTeamId) {
      return NextResponse.json({ message: 'Heim- und Auswärtsteam dürfen nicht identisch sein' }, { status: 400 });
    }
    if ((homeTeamId !== undefined && homeTeamId === null) || (awayTeamId !== undefined && awayTeamId === null)) {
       return NextResponse.json({ message: 'Heim- und Auswärtsteam müssen ausgewählt werden' }, { status: 400 });
    }
    // Weitere Validierungen (z.B. für scoreData) werden im Service durchgeführt
    // --- Ende Validierung ---

    const updateData: UpdateFixtureData = {
        fixtureDate,
        fixtureTime,
        scoreData,
        homeTeamId,
        awayTeamId
    };

    // Rufe Service-Funktion auf
    const updatedFixture = await updateFixture(id, updateData);

    if (!updatedFixture) {
      // Sollte durch die Prüfung oben abgedeckt sein, aber sicher ist sicher
      return NextResponse.json({ message: 'Spielpaarung nicht gefunden' }, { status: 404 });
    }

    // Gib das vom Service gemappte Fixture zurück
    return NextResponse.json(updatedFixture);

  } catch (error) {
    console.error('Fehler beim Aktualisieren der Spielpaarung (API):', error);
    // Handle spezifische Fehler vom Service (z.B. Validierungsfehler)
    if (error instanceof Error) {
        return NextResponse.json({ message: error.message }, { status: 400 }); // 400 für erwartete Fehler
    }
    return NextResponse.json({ message: 'Fehler beim Aktualisieren der Spielpaarung' }, { status: 500 })
  }
  // No finally block needed for singleton
}

// Optional: DELETE Handler if needed later
// export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }>  }) { ... }
