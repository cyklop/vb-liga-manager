import { NextResponse } from 'next/server';
import prisma from '../../../../../lib/prisma';

export async function GET(request: Request, { params }: { params: { id: string } }) {
  const leagueId = parseInt(params.id);
  if (isNaN(leagueId)) {
    return NextResponse.json({ message: 'Ungültige Liga-ID' }, { status: 400 });
  }

  // Get query parameters
  const url = new URL(request.url);
  const showUpcoming = url.searchParams.get('upcoming') === 'true';
  
  try {
    // Build the query
    const query: any = {
      where: { leagueId },
      include: {
        homeTeam: { select: { id: true, name: true } },
        awayTeam: { select: { id: true, name: true } },
      },
      orderBy: [
        { matchday: 'asc' },
        { order: 'asc' },
      ],
    };
    
    // Add filter for upcoming fixtures if requested
    if (showUpcoming) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      query.where = {
        ...query.where,
        OR: [
          { fixtureDate: { gte: today } },
          { homeSets: null },
          { awaySets: null },
        ],
      };
    }
    
    const fixtures = await prisma.fixture.findMany(query);
    
    return NextResponse.json(fixtures);
  } catch (error) {
    console.error('Error fetching fixtures:', error);
    return NextResponse.json({ message: 'Fehler beim Abrufen der Spielpaarungen' }, { status: 500 });
  }
}
