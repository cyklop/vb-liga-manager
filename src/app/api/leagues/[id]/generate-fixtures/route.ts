import { NextResponse } from 'next/server'
import prisma from '../../../../../lib/prisma' // Import the singleton instance

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
  
  // Create a map to track the last fixture for each team (home or away)
  // Allow undefined to indicate no previous fixture
  const lastFixtureWasHome: Record<number, boolean | undefined> = {}; 
  
  // Initialize with undefined (no previous fixtures)
  teams.forEach(team => {
    lastFixtureWasHome[team.id] = undefined;
  });
  
  // Generate fixtures using the circle method (Berger tables)
  // This is a standard algorithm for round-robin tournaments
  
  // Create a copy of teams for rotation
  const rotatingTeams = localTeams.slice(1);
  const fixedTeam = localTeams[0];
  
  // Generate fixtures for each round
  for (let round = 0; round < rounds; round++) {
    const roundFixtures: any[] = [];
    
    // Match the fixed team with the first rotating team
    if (fixedTeam.id !== -1 && rotatingTeams[0].id !== -1) {
      // Determine home/away based on alternating pattern for each team
      let homeTeamId, awayTeamId;
      
      // For the first match of each team, assign randomly
      // For subsequent matches, alternate home/away
      if (lastFixtureWasHome[fixedTeam.id] === undefined) {
        // First match for fixed team - make it home for even rounds, away for odd
        if (round % 2 === 0) {
          homeTeamId = fixedTeam.id;
          awayTeamId = rotatingTeams[0].id;
        } else {
          homeTeamId = rotatingTeams[0].id;
          awayTeamId = fixedTeam.id;
        }
      } else {
        // Alternate based on last fixture
        if (lastFixtureWasHome[fixedTeam.id]) {
          homeTeamId = rotatingTeams[0].id;
          awayTeamId = fixedTeam.id;
        } else {
          homeTeamId = fixedTeam.id;
          awayTeamId = rotatingTeams[0].id;
        }
      }
      
      // Update the last fixture status
      lastFixtureWasHome[homeTeamId] = true;
      lastFixtureWasHome[awayTeamId] = false;
      
      roundFixtures.push({
        homeTeamId,
        awayTeamId,
        round: round + 1,
        matchday: round + 1,
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
    
    // Match the remaining teams
    for (let i = 0; i < rotatingTeams.length / 2 - 1; i++) {
      const team1 = rotatingTeams[i + 1];
      const team2 = rotatingTeams[rotatingTeams.length - 1 - i];
      
      if (team1.id !== -1 && team2.id !== -1) {
        // Determine home/away based on alternating pattern
        let homeTeamId, awayTeamId;
        
        // For the first match of each team, assign based on round parity
        if (lastFixtureWasHome[team1.id] === undefined || lastFixtureWasHome[team2.id] === undefined) {
          if (round % 2 === 0) {
            homeTeamId = team1.id;
            awayTeamId = team2.id;
          } else {
            homeTeamId = team2.id;
            awayTeamId = team1.id;
          }
        } else {
          // If both teams had the same last fixture type (both home or both away)
          // Prioritize the team with fewer home games
          if (lastFixtureWasHome[team1.id] === lastFixtureWasHome[team2.id]) {
            // Count current home games for each team
            const team1HomeCount = fixtures.filter(f => f.homeTeamId === team1.id).length;
            const team2HomeCount = fixtures.filter(f => f.homeTeamId === team2.id).length;
            
            if (team1HomeCount <= team2HomeCount) {
              homeTeamId = team1.id;
              awayTeamId = team2.id;
            } else {
              homeTeamId = team2.id;
              awayTeamId = team1.id;
            }
          } else {
            // If one was home and one was away, alternate for both
            if (lastFixtureWasHome[team1.id]) {
              homeTeamId = team2.id;
              awayTeamId = team1.id;
            } else {
              homeTeamId = team1.id;
              awayTeamId = team2.id;
            }
          }
        }
        
        // Update the last fixture status
        lastFixtureWasHome[homeTeamId] = true;
        lastFixtureWasHome[awayTeamId] = false;
        
        roundFixtures.push({
          homeTeamId,
          awayTeamId,
          round: round + 1,
          matchday: round + 1,
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
    
    // Rotate teams for the next round (first team stays fixed)
    const shiftedTeam = rotatingTeams.shift(); // Get the first element
    if (shiftedTeam) { // Check if it's not undefined
      rotatingTeams.push(shiftedTeam); // Add it to the end
    }
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
  
  // Post-process to ensure alternating home/away for each team
  const fixturesByTeam: Record<number, any[]> = {};
  
  // Group fixtures by team
  teams.forEach(team => {
    fixturesByTeam[team.id] = [];
  });
  
  fixtures.forEach(fixture => {
    fixturesByTeam[fixture.homeTeamId].push({
      ...fixture,
      isHome: true,
      index: fixtures.indexOf(fixture)
    });
    
    fixturesByTeam[fixture.awayTeamId].push({
      ...fixture,
      isHome: false,
      index: fixtures.indexOf(fixture)
    });
  });
  
  // Sort fixtures for each team by round
  Object.keys(fixturesByTeam).forEach(teamId => {
    fixturesByTeam[Number(teamId)].sort((a, b) => a.round - b.round);
  });
  
  // Check for consecutive home or away games and fix if possible
  let madeChanges = true;
  let iterations = 0;
  const maxIterations = 10; // Prevent infinite loops
  
  while (madeChanges && iterations < maxIterations) {
    madeChanges = false;
    iterations++;
    
    // Check each team's schedule for consecutive home/away games
    Object.keys(fixturesByTeam).forEach(teamIdStr => {
      const teamId = Number(teamIdStr);
      const teamFixtures = fixturesByTeam[teamId];
      
      for (let i = 1; i < teamFixtures.length; i++) {
        // If two consecutive fixtures have the same home/away status
        if (teamFixtures[i].isHome === teamFixtures[i-1].isHome) {
          // Find a fixture to swap with
          const currentFixture = teamFixtures[i];
          const targetHomeAway = !currentFixture.isHome;
          
          // Look for a fixture where this team has the opposite home/away status
          // and the other team also has consecutive same-type fixtures
          for (const otherTeamIdStr of Object.keys(fixturesByTeam)) {
            const otherTeamId = Number(otherTeamIdStr);
            if (otherTeamId === teamId) continue;
            
            const otherTeamFixtures = fixturesByTeam[otherTeamId];
            
            for (let j = 1; j < otherTeamFixtures.length; j++) {
              if (otherTeamFixtures[j].isHome === otherTeamFixtures[j-1].isHome &&
                  otherTeamFixtures[j].isHome === targetHomeAway) {
                
                // Found a candidate for swapping
                const otherFixture = otherTeamFixtures[j];
                
                // Check if these fixtures don't involve the same teams
                if (currentFixture.homeTeamId !== otherFixture.homeTeamId &&
                    currentFixture.homeTeamId !== otherFixture.awayTeamId &&
                    currentFixture.awayTeamId !== otherFixture.homeTeamId &&
                    currentFixture.awayTeamId !== otherFixture.awayTeamId) {
                  
                  // Swap the fixtures
                  const temp = fixtures[currentFixture.index];
                  fixtures[currentFixture.index] = fixtures[otherFixture.index];
                  fixtures[otherFixture.index] = temp;
                  
                  // Rebuild the team fixtures map
                  teams.forEach(team => {
                    fixturesByTeam[team.id] = [];
                  });
                  
                  fixtures.forEach((fixture, idx) => {
                    fixturesByTeam[fixture.homeTeamId].push({
                      ...fixture,
                      isHome: true,
                      index: idx
                    });
                    
                    fixturesByTeam[fixture.awayTeamId].push({
                      ...fixture,
                      isHome: false,
                      index: idx
                    });
                  });
                  
                  // Sort fixtures for each team by round
                  Object.keys(fixturesByTeam).forEach(id => {
                    fixturesByTeam[Number(id)].sort((a, b) => a.round - b.round);
                  });
                  
                  madeChanges = true;
                  break;
                }
              }
              
              if (madeChanges) break;
            }
            
            if (madeChanges) break;
          }
          
          if (madeChanges) break;
        }
      }
      
      if (madeChanges) return; // Exit the forEach if changes were made
    });
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

  // // Log schedule balance for debugging (auskommentiert für Produktion)
  // console.log("Team schedule balance:");
  // Object.entries(teamSchedule).forEach(([teamId, schedule]) => {
  //   console.log(`Team ${teamId}: ${schedule.homeGames} home, ${schedule.awayGames} away, ${schedule.matchdays.length} matchdays`);
  // });

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


import { getServerSession } from 'next-auth'
import { authOptions } from '../../../../../lib/auth' // Corrected import path

export async function POST(request: Request, { params: { id } }: { params: { id: string } }) {
  // Destructure id directly from params
  const leagueId = parseInt(id); 
  if (isNaN(leagueId)) {
    return NextResponse.json({ message: 'Ungültige Liga-ID' }, { status: 400 });
  }

  // Benutzerberechtigungen prüfen
  const session = await getServerSession(authOptions)
  if (!session || !session.user?.email) {
    return NextResponse.json({ message: 'Nicht authentifiziert' }, { status: 401 })
  }
  
  // Benutzer abrufen
  const currentUser = await prisma.user.findUnique({
    where: { email: session.user.email },
  })
  
  if (!currentUser || (!currentUser.isAdmin && !currentUser.isSuperAdmin)) {
    return NextResponse.json({ message: 'Nicht autorisiert' }, { status: 403 })
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
