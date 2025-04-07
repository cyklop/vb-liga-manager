import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../../auth/[...nextauth]/route';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request: Request, { params }: { params: { id: string } }) {
  const teamId = parseInt(params.id);
  
  if (isNaN(teamId)) {
    return NextResponse.json({ message: 'Ungültige Team-ID' }, { status: 400 });
  }

  // Benutzerberechtigungen prüfen
  const session = await getServerSession(authOptions);
  if (!session || !session.user?.email) {
    return NextResponse.json({ message: 'Nicht authentifiziert' }, { status: 401 });
  }

  try {
    // Team-Details abrufen
    const team = await prisma.team.findUnique({
      where: { id: teamId },
      select: {
        id: true,
        name: true,
        location: true,
        hallAddress: true,
        trainingTimes: true
      }
    });

    if (!team) {
      return NextResponse.json({ message: 'Team nicht gefunden' }, { status: 404 });
    }

    return NextResponse.json(team);
  } catch (error) {
    console.error('Error fetching team details:', error);
    return NextResponse.json({ message: 'Serverfehler' }, { status: 500 });
  }
}
