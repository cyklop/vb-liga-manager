import { NextResponse } from 'next/server'
import prisma from '../../../../../lib/prisma' // Adjust path as needed

// Helper function to generate round-robin fixtures
function generateRoundRobinFixtures(teams: { id: number }[], hasReturnMatches: boolean): Omit<Fixture, 'id' | 'leagueId' | 'homeTeam' | 'awayTeam' | 'order'>[] {
  const fixtures: Omit<Fixture, 'id' | 'leagueId' | 'homeTeam' | 'awayTeam' | 'order'>[] = [];
  const numTeams = teams.length;

  if (numTeams < 2) {
    return []; // Need at least 2 teams
  }

  // Add a dummy team if the number of teams is odd
  const localTeams = [...teams];
  if (numTeams % 2 !== 0) {
    localTeams.push({ id: -1 }); // Dummy team marker
  }
  const numTeamsWithDummy = localTeams.length;
  const rounds = numTeamsWithDummy - 1;
  const matchesPerRound = numTeamsWithDummy / 2;

  for (let round = 0; round < rounds; round++) {
    for (let match = 0; match < matchesPerRound; match++) {
      const homeIndex = (round + match) % (numTeamsWithDummy - 1);
      let awayIndex = (numTeamsWithDummy - 1 - match + round) % (numTeamsWithDummy - 1);

      // Last team stays fixed, the others rotate around it.
      if (match === 0) {
        awayIndex = numTeamsWithDummy - 1;
      }

      const homeTeam = localTeams[homeIndex];
      const awayTeam = localTeams[awayIndex];

      // Skip matches involving the dummy team
      if (homeTeam.id !== -1 && awayTeam.id !== -1) {
        fixtures.push({
          homeTeamId: homeTeam.id,
          awayTeamId: awayTeam.id,
          round: round + 1, // Rounds are 1-based
          matchday: round + 1, // Simple mapping for now
          fixtureDate: null,
          homeScore: null,
          awayScore: null,
        });
      }
    }
  }

  // Add return matches if required
  if (hasReturnMatches) {
    const returnFixtures = fixtures.map(fixture => ({
      ...fixture,
      homeTeamId: fixture.awayTeamId,
      awayTeamId: fixture.homeTeamId,
      round: (fixture.round || 0) + rounds, // Adjust round number
      matchday: (fixture.matchday || 0) + rounds, // Adjust matchday number
    }));
    fixtures.push(...returnFixtures);
  }

  return fixtures;
}


// Define Fixture type locally for the helper function (or import if shared)
interface Fixture {
  id: number;
  leagueId: number;
  round?: number | null;
  matchday?: number | null;
  homeTeamId: number;
  homeTeam: { id: number; name: string }; // Assuming Team type structure
  awayTeamId: number;
  awayTeam: { id: number; name: string }; // Assuming Team type structure
  fixtureDate?: string | null;
  homeScore?: number | null;
  awayScore?: number | null;
  order: number;
}


export async function POST(request: Request, { params }: { params: { id: string } }) {
  const leagueId = parseInt(params.id);
  if (isNaN(leagueId)) {
    return NextResponse.json({ message: 'Ungültige Liga-ID' }, { status: 400 });
  }

  try {
    // 1. Fetch the league and its assigned teams
    const league = await prisma.league.findUnique({
      where: { id: leagueId },
      include: { teams: { select: { id: true } } }, // Only need team IDs
    });

    if (!league) {
      return NextResponse.json({ message: 'Liga nicht gefunden' }, { status: 404 });
    }

    // 2. Validate team count
    if (league.teams.length !== league.numberOfTeams) {
      return NextResponse.json({ message: `Die Anzahl der zugewiesenen Teams (${league.teams.length}) stimmt nicht mit der erwarteten Anzahl (${league.numberOfTeams}) überein.` }, { status: 400 });
    }
    if (league.teams.length < 2) {
        return NextResponse.json({ message: 'Es müssen mindestens 2 Teams zugewiesen sein, um einen Spielplan zu generieren.' }, { status: 400 });
    }

    // 3. Delete existing fixtures for this league
    await prisma.fixture.deleteMany({
      where: { leagueId: leagueId },
    });

    // 4. Generate new fixtures
    const generatedFixtures = generateRoundRobinFixtures(league.teams, league.hasReturnMatches);

    // 5. Prepare fixtures for database insertion with order
    const fixturesToCreate = generatedFixtures.map((fixture, index) => ({
      ...fixture,
      leagueId: leagueId,
      order: index + 1, // Assign sequential order
    }));

    // 6. Save new fixtures
    if (fixturesToCreate.length > 0) {
      await prisma.fixture.createMany({
        data: fixturesToCreate,
      });
    }

    // 7. Return success response
    return NextResponse.json({ message: `Spielplan für ${league.name} erfolgreich generiert (${fixturesToCreate.length} Spiele).` });

  } catch (error) {
    console.error('Error generating fixtures:', error);
    return NextResponse.json({ message: 'Fehler beim Generieren des Spielplans' }, { status: 500 });
  }
}
