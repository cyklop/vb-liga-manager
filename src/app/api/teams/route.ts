import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma'; // Import the singleton instance
// Importiere zentrale Typen für die Rückgabe
import type { Team, UserProfile } from '@/types/models';

export async function GET() {
  try {
    const teams = await prisma.team.findMany({
      include: {
        teamLeader: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    // Konvertiere Prisma-Teams in den zentralen Team-Typ
    const responseTeams: Team[] = teams.map(team => ({
      ...team,
      teamLeader: team.teamLeader ? {
        // Map teamLeader zu UserProfile (ohne sensible Daten)
        id: team.teamLeader.id,
        name: team.teamLeader.name,
        // Füge hier weitere benötigte UserProfile-Felder hinzu, falls vorhanden
        // email: team.teamLeader.email, // Beispiel
        // isAdmin: team.teamLeader.isAdmin, // Beispiel
        // isSuperAdmin: team.teamLeader.isSuperAdmin, // Beispiel
      } : null
    }));

    return NextResponse.json(responseTeams);
  } catch (error) {
    console.error('Error fetching teams:', error);
    return NextResponse.json({ message: 'Fehler beim Abrufen der Teams' }, { status: 500 })
  }
  // No finally block needed for singleton
}

export async function POST(request: Request) {
  const { name, location, hallAddress, trainingTimes, teamLeaderId } = await request.json()

  try {
    const team = await prisma.team.create({
      data: {
        name,
        location,
        hallAddress,
        trainingTimes,
        teamLeaderId: teamLeaderId ? parseInt(teamLeaderId) : undefined,
      },
      include: {
        teamLeader: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    // Konvertiere das erstellte Prisma-Team in den zentralen Team-Typ
    const responseTeam: Team = {
      ...team,
      teamLeader: team.teamLeader ? {
        id: team.teamLeader.id,
        name: team.teamLeader.name,
        // Füge hier weitere benötigte UserProfile-Felder hinzu
      } : null
    };

    return NextResponse.json(responseTeam, { status: 201 });
  } catch (error) {
    console.error('Error creating team:', error);
    return NextResponse.json({ message: 'Fehler beim Erstellen des Teams' }, { status: 400 })
  }
  // No finally block needed for singleton
}
