import { NextResponse } from 'next/server'
import prisma from '../../../../../../lib/prisma' // Import the singleton instance

// Helper function to generate round-robin fixtures with balanced home/away games
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
  const rounds = numTeamsWithDummy - 1; // Number of rounds in a single cycle
  const matchesPerRound = numTeamsWithDummy / 2; // Number of matches per round
  
  // Track home/away balance for each team
  const teamHomeGames: Record<number, number> = {};
  const teamAwayGames: Record<number, number> = {};
  
  // Initialize counters
  localTeams.forEach(team => {
    if (team.id !== -1) { // Skip dummy team
      teamHomeGames[team.id] = 0;
      teamAwayGames[team.id] = 0;
    }
  });

  // Generate fixtures for the first cycle (each team plays against every other team once)
  for (let round = 0; round < rounds; round++) {
    const roundFixtures: any[] = [];
    
    for (let match = 0; match < matchesPerRound; match++) {
      const homeIndex = (round + match) % (numTeamsWithDummy - 1);
      let awayIndex = (numTeamsWithDummy - 1 - match + round) % (numTeamsWithDummy - 1);

      // Last team stays fixed, the others rotate around it
      if (match === 0) {
        awayIndex = numTeamsWithDummy - 1;
      }

      const homeTeam = localTeams[homeIndex];
      const awayTeam = localTeams[awayIndex];

      // Skip matches involving the dummy team
      if (homeTeam.id !== -1 && awayTeam.id !== -1) {
        // Determine if we should swap home/away to balance
        let finalHomeTeamId = homeTeam.id;
        let finalAwayTeamId = awayTeam.id;
        
        // If round is even, keep original home/away
        // If round is odd, swap home/away to ensure alternating
        if (round % 2 === 1) {
          finalHomeTeamId = awayTeam.id;
          finalAwayTeamId = homeTeam.id;
        }
        
        // Update home/away counters
        teamHomeGames[finalHomeTeamId]++;
        teamAwayGames[finalAwayTeamId]++;
        
        roundFixtures.push({
          homeTeamId: finalHomeTeamId,
          awayTeamId: finalAwayTeamId,
          round: round + 1, // Rounds are 1-based
          matchday: round + 1, // Each round is a matchday
          fixtureDate: null,
          homeScore: null,
          awayScore: null,
          homeSets: null,
          awaySets: null,
          homePoints: null,
          awayPoints: null,
          homeMatchPoints: null,
          awayMatchPoints: null,
        });
      }
    }
    
    // Add all fixtures for this round
    fixtures.push(...roundFixtures);
  }

  // Add return matches if required
  if (hasReturnMatches) {
    const firstHalfFixtures = [...fixtures];
    
    // Create return fixtures with swapped home/away teams
    const returnFixtures = firstHalfFixtures.map(fixture => {
      const returnRound = (fixture.round || 0) + rounds;
      return {
        ...fixture,
        homeTeamId: fixture.awayTeamId,
        awayTeamId: fixture.homeTeamId,
        round: returnRound,
        matchday: returnRound,
      };
    });
    
    fixtures.push(...returnFixtures);
  }

  // Verify that each team has a balanced schedule
  const teamSchedule: Record<number, { matchdays: number[], homeGames: number, awayGames: number }> = {};
  
  // Initialize team schedule tracking
  teams.forEach(team => {
    teamSchedule[team.id] = { 
      matchdays: [], 
      homeGames: 0, 
      awayGames: 0 
    };
  });
  
  // Populate team schedule data
  fixtures.forEach(fixture => {
    const { homeTeamId, awayTeamId, matchday } = fixture;
    
    if (matchday) {
      if (!teamSchedule[homeTeamId].matchdays.includes(matchday)) {
        teamSchedule[homeTeamId].matchdays.push(matchday);
      }
      teamSchedule[homeTeamId].homeGames++;
      
      if (!teamSchedule[awayTeamId].matchdays.includes(matchday)) {
        teamSchedule[awayTeamId].matchdays.push(matchday);
      }
      teamSchedule[awayTeamId].awayGames++;
    }
  });
  
  // Log schedule balance for debugging
  console.log("Team schedule balance:");
  Object.entries(teamSchedule).forEach(([teamId, schedule]) => {
    console.log(`Team ${teamId}: ${schedule.homeGames} home, ${schedule.awayGames} away, ${schedule.matchdays.length} matchdays`);
  });

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


export async function POST(request: Request, { params: { id } }: { params: { id: string } }) {
  // Destructure id directly from params
  const leagueId = parseInt(id); 
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

    // 6. Save new fixtures within a transaction
    if (fixturesToCreate.length > 0) {
      // Use $transaction to ensure all fixtures are created or none are
      await prisma.$transaction(
        fixturesToCreate.map(fixtureData => 
          prisma.fixture.create({ data: fixtureData })
        )
      );
    }

    // 7. Return success response
    return NextResponse.json({ message: `Spielplan für ${league.name} erfolgreich generiert (${fixturesToCreate.length} Spiele).` });

  } catch (error) {
    console.error('Error generating fixtures:', error);
    return NextResponse.json({ message: 'Fehler beim Generieren des Spielplans' }, { status: 500 });
  }
}
