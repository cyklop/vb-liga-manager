import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
// Importiere Service-Funktion
import { getTeamDetails } from '@/services/teamService';

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const teamIdParam = (await params).id;
  const teamId = parseInt(teamIdParam);
  
  if (isNaN(teamId)) {
    return NextResponse.json({ message: 'Ungültige Team-ID' }, { status: 400 });
  }

  // Benutzerberechtigungen prüfen
  const session = await getServerSession(authOptions);
  if (!session || !session.user?.email) {
    return NextResponse.json({ message: 'Nicht authentifiziert' }, { status: 401 });
  }

  try {
    // Rufe Service-Funktion auf
    const teamDetails = await getTeamDetails(teamId);

    if (!teamDetails) {
      return NextResponse.json({ message: 'Team nicht gefunden' }, { status: 404 });
    }

    return NextResponse.json(teamDetails);
  } catch (error) {
    console.error('Error fetching team details (API):', error);
    }

    return NextResponse.json(team);
  } catch (error) {
    console.error('Error fetching team details:', error);
    return NextResponse.json({ message: 'Serverfehler' }, { status: 500 });
  }
}
