import { NextResponse } from 'next/server';
import prisma from '../../../../../lib/prisma';

interface TableEntry {
  teamId: number;
  teamName: string;
  played: number;
  won: number;
  lost: number;
  points: number;
  setsWon: number;
  setsLost: number;
  setsDiff: number;
  setsQuotient: number;
  pointsWon: number;
  pointsLost: number;
  pointsDiff: number;
  pointsQuotient: number;
  // For direct comparison
  directComparisonWins: number;
  directComparisonLosses: number;
}

export async function GET(request: Request, { params }: { params: { id: string } }) {
  const leagueId = parseInt(params.id);
  if (isNaN(leagueId)) {
    return NextResponse.json({ message: 'Ungültige Liga-ID' }, { status: 400 });
  }
  
  // Get query parameters
  const url = new URL(request.url);
  const matchdayParam = url.searchParams.get('matchday');
  const matchday = matchdayParam ? parseInt(matchdayParam) : undefined;

  try {
    // Get the league with its teams and point rules
    const league = await prisma.league.findUnique({
      where: { id: leagueId },
      include: {
        teams: true,
      },
    });

    if (!league) {
      return NextResponse.json({ message: 'Liga nicht gefunden' }, { status: 404 });
    }

    // Build the query for fixtures
    const fixtureQuery: any = {
      where: {
        leagueId,
        // Only include fixtures with results
        AND: [
          { homeSets: { not: null } },
          { awaySets: { not: null } },
        ],
      },
      include: {
        homeTeam: { select: { id: true, name: true } },
        awayTeam: { select: { id: true, name: true } },
      },
    };
    
    // Add matchday filter if specified
    if (matchday !== undefined) {
      fixtureQuery.where.AND.push({ matchday: { lte: matchday } });
    }
    
    // Get fixtures based on the query
    const fixtures = await prisma.fixture.findMany(fixtureQuery);

    // Initialize table entries for all teams
    const tableEntries: Record<number, TableEntry> = {};
    
    league.teams.forEach(team => {
      tableEntries[team.id] = {
        teamId: team.id,
        teamName: team.name,
        played: 0,
        won: 0,
        lost: 0,
        points: 0,
        setsWon: 0,
        setsLost: 0,
        setsDiff: 0,
        setsQuotient: 0,
        pointsWon: 0,
        pointsLost: 0,
        pointsDiff: 0,
        pointsQuotient: 0,
        directComparisonWins: 0,
        directComparisonLosses: 0,
      };
    });

    // Process fixtures to calculate table data
    fixtures.forEach(fixture => {
      const homeTeamId = fixture.homeTeamId;
      const awayTeamId = fixture.awayTeamId;
      
      if (!tableEntries[homeTeamId] || !tableEntries[awayTeamId]) {
        // Logge eine Warnung, aber fahre mit dem nächsten Spiel fort
        console.warn(`Fixture ${fixture.id} involves team not currently in league ${leagueId} (Teams: ${homeTeamId}, ${awayTeamId}). Skipping fixture for table calculation.`);
        return; // Verwende 'return' statt 'continue' in forEach
      }

      const homeSets = fixture.homeSets || 0;
      const awaySets = fixture.awaySets || 0;
      const homePoints = fixture.homePoints || 0;
      const awayPoints = fixture.awayPoints || 0;
      
      // Update played matches
      tableEntries[homeTeamId].played++;
      tableEntries[awayTeamId].played++;
      
      // Update sets
      tableEntries[homeTeamId].setsWon += homeSets;
      tableEntries[homeTeamId].setsLost += awaySets;
      tableEntries[awayTeamId].setsWon += awaySets;
      tableEntries[awayTeamId].setsLost += homeSets;
      
      // Update points (balls)
      tableEntries[homeTeamId].pointsWon += homePoints;
      tableEntries[homeTeamId].pointsLost += awayPoints;
      tableEntries[awayTeamId].pointsWon += awayPoints;
      tableEntries[awayTeamId].pointsLost += homePoints;
      
      // Determine match result and award league points
      if (homeSets > awaySets) {
        tableEntries[homeTeamId].won++;
        tableEntries[awayTeamId].lost++;
        
        // Direct comparison tracking
        tableEntries[homeTeamId].directComparisonWins++;
        tableEntries[awayTeamId].directComparisonLosses++;
        
        // Award points based on the score
        if (homeSets === 3 && awaySets === 0) {
          tableEntries[homeTeamId].points += league.pointsWin30;
        } else if (homeSets === 3 && awaySets === 1) {
          tableEntries[homeTeamId].points += league.pointsWin31;
        } else if (homeSets === 3 && awaySets === 2) {
          tableEntries[homeTeamId].points += league.pointsWin32;
          tableEntries[awayTeamId].points += league.pointsLoss32;
        }
      } else if (awaySets > homeSets) {
        tableEntries[awayTeamId].won++;
        tableEntries[homeTeamId].lost++;
        
        // Direct comparison tracking
        tableEntries[awayTeamId].directComparisonWins++;
        tableEntries[homeTeamId].directComparisonLosses++;
        
        // Award points based on the score
        if (awaySets === 3 && homeSets === 0) {
          tableEntries[awayTeamId].points += league.pointsWin30;
        } else if (awaySets === 3 && homeSets === 1) {
          tableEntries[awayTeamId].points += league.pointsWin31;
        } else if (awaySets === 3 && homeSets === 2) {
          tableEntries[awayTeamId].points += league.pointsWin32;
          tableEntries[homeTeamId].points += league.pointsLoss32;
        }
      }
    });

    // Calculate derived statistics
    Object.values(tableEntries).forEach(entry => {
      entry.setsDiff = entry.setsWon - entry.setsLost;
      entry.setsQuotient = entry.setsLost === 0 ? entry.setsWon : parseFloat((entry.setsWon / entry.setsLost).toFixed(3));
      entry.pointsDiff = entry.pointsWon - entry.pointsLost;
      entry.pointsQuotient = entry.pointsLost === 0 ? entry.pointsWon : parseFloat((entry.pointsWon / entry.pointsLost).toFixed(3));
    });

    // Sort table entries
    const sortedEntries = Object.values(tableEntries).sort((a, b) => {
      // 1. Points
      if (a.points !== b.points) {
        return b.points - a.points;
      }
      
      // 2. Sets difference
      if (a.setsDiff !== b.setsDiff) {
        return b.setsDiff - a.setsDiff;
      }
      
      // 3. Sets quotient
      if (a.setsQuotient !== b.setsQuotient) {
        return b.setsQuotient - a.setsQuotient;
      }
      
      // 4. Direct comparison
      if (a.directComparisonWins !== b.directComparisonWins) {
        return b.directComparisonWins - a.directComparisonWins;
      }
      
      // 5. Points difference
      if (a.pointsDiff !== b.pointsDiff) {
        return b.pointsDiff - a.pointsDiff;
      }
      
      // 6. Points quotient
      if (a.pointsQuotient !== b.pointsQuotient) {
        return b.pointsQuotient - a.pointsQuotient;
      }
      
      // 7. Matches won
      return b.won - a.won;
    });

    return NextResponse.json(sortedEntries);
  } catch (error) {
    console.error('Error calculating league table:', error);
    return NextResponse.json({ message: 'Fehler bei der Berechnung der Tabelle' }, { status: 500 });
  }
}
