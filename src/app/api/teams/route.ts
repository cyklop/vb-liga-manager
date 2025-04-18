import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
// Importiere Service-Funktionen und Typen
import { getAllTeams, createTeam, type CreateTeamData } from '@/services/teamService';
import type { Team } from '@/types/models';

export async function GET() {
  // Optional: Berechtigungsprüfung (wer darf alle Teams sehen?)
  // const session = await getServerSession(authOptions);
  // if (!session) {
  //   return NextResponse.json({ message: 'Nicht authentifiziert' }, { status: 401 });
  // }

  try {
    // Rufe Service-Funktion auf
    const teams = await getAllTeams();
    return NextResponse.json(teams);

  } catch (error) {
    console.error('Fehler beim Abrufen der Teams (API):', error);
    return NextResponse.json({ message: 'Fehler beim Abrufen der Teams' }, { status: 500 })
  }
  // No finally block needed for singleton
}

export async function POST(request: Request) {
  // --- Berechtigungsprüfung (Beispiel: Nur Admins) ---
  const session = await getServerSession(authOptions);
  if (!session?.user?.isAdmin) {
    return NextResponse.json({ message: 'Nicht autorisiert' }, { status: 403 });
  }
  // --- Ende Berechtigungsprüfung ---

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
      parsedTeamLeaderId = null; // Explizit null setzen, wenn gewünscht
  }
  // --- Ende Validierung ---

  const createData: CreateTeamData = {
    name,
    location,
    hallAddress,
    trainingTimes,
    teamLeaderId: parsedTeamLeaderId,
  };

  try {
    // Rufe Service-Funktion auf
    const newTeam = await createTeam(createData);
    return NextResponse.json(newTeam, { status: 201 });

  } catch (error) {
    console.error('Fehler beim Erstellen des Teams (API):', error);
    // Handle spezifische Fehler vom Service (falls vorhanden)
    return NextResponse.json({ message: 'Fehler beim Erstellen des Teams' }, { status: 400 })
  }
  // No finally block needed for singleton
}
