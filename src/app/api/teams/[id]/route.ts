import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
// Importiere Service-Funktionen und Typen
import { deleteTeam, updateTeam, type UpdateTeamData } from '@/services/teamService';
import type { Team } from '@/types/models';

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  // --- Berechtigungsprüfung (Beispiel: Nur Admins) ---
  const session = await getServerSession(authOptions);
  if (!session?.user?.isAdmin) {
    return NextResponse.json({ message: 'Nicht autorisiert' }, { status: 403 });
  }
  // --- Ende Berechtigungsprüfung ---
  const idParam = (await params).id;
  const id = parseInt(idParam);
  if (isNaN(id)) {
    return NextResponse.json({ message: 'Ungültige Team-ID' }, { status: 400 });
  }

  try {
    // Rufe Service-Funktion auf
    await deleteTeam(id);
    return NextResponse.json({ message: 'Team erfolgreich gelöscht' });

  } catch (error) {
    console.error('Fehler beim Löschen des Teams (API):', error);
    // Handle spezifische Fehler vom Service
    if (error instanceof Error && error.message.includes('referenziert')) {
        return NextResponse.json({ message: error.message }, { status: 409 }); // Conflict
    }
    return NextResponse.json({ message: 'Fehler beim Löschen des Teams' }, { status: 500 })
  }
  // No finally block needed for singleton
}

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  // --- Berechtigungsprüfung (Beispiel: Nur Admins) ---
  const session = await getServerSession(authOptions);
  if (!session?.user?.isAdmin) {
    return NextResponse.json({ message: 'Nicht autorisiert' }, { status: 403 });
  }
  // --- Ende Berechtigungsprüfung ---

  const idParam = (await params).id;
  const id = parseInt(idParam);
  if (isNaN(id)) {
    return NextResponse.json({ message: 'Ungültige Team-ID' }, { status: 400 });
  }

  const { name, location, hallAddress, trainingTimes, teamLeaderId } = await request.json();

  // --- Validierung (Beispiel) ---
  if (!name) {
    return NextResponse.json({ message: 'Teamname ist erforderlich.' }, { status: 400 });
  }
  let parsedTeamLeaderId: number | null | undefined = undefined;
  if (teamLeaderId !== undefined && teamLeaderId !== null && teamLeaderId !== '') {
      parsedTeamLeaderId = parseInt(teamLeaderId);
      if (isNaN(parsedTeamLeaderId)) {
          return NextResponse.json({ message: 'Ungültige Teamleiter-ID.' }, { status: 400 });
      }
  } else if (teamLeaderId === null || teamLeaderId === '') {
      parsedTeamLeaderId = null; // Explizit null setzen
  }
  // --- Ende Validierung ---

  const updateData: UpdateTeamData = {
    name,
    location,
    hallAddress,
    trainingTimes,
    teamLeaderId: parsedTeamLeaderId,
  };

  try {
    // Rufe Service-Funktion auf
    const updatedTeam = await updateTeam(id, updateData);

    if (!updatedTeam) {
      return NextResponse.json({ message: 'Team nicht gefunden' }, { status: 404 });
    }

    return NextResponse.json(updatedTeam);

  } catch (error) {
    console.error('Fehler beim Aktualisieren des Teams (API):', error);
    // Handle spezifische Fehler vom Service (falls vorhanden)
    return NextResponse.json({ message: 'Fehler beim Aktualisieren des Teams' }, { status: 500 })
  }
  // No finally block needed for singleton
}
