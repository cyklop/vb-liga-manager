import { NextResponse } from 'next/server';
import prisma from '../../../../../../lib/prisma';

export async function GET(request: Request, { params }: { params: { id: string } }) {
  const leagueId = parseInt(params.id);
  if (isNaN(leagueId)) {
    return NextResponse.json({ message: 'Ungültige Liga-ID' }, { status: 400 });
  }

  try {
    // Fetch all fixtures for this league
    const fixtures = await prisma.fixture.findMany({
      where: {
        leagueId,
        matchday: { not: null }
      },
      select: {
        matchday: true
      },
      distinct: ['matchday'],
      orderBy: {
        matchday: 'asc'
      }
    });

    // Extract and filter out null matchdays
    const matchdays = fixtures
      .map(fixture => fixture.matchday)
      .filter((matchday): matchday is number => matchday !== null);

    return NextResponse.json({ matchdays });
  } catch (error) {
    console.error('Error fetching matchdays:', error);
    return NextResponse.json({ message: 'Fehler beim Abrufen der Spieltage' }, { status: 500 });
  }
}
