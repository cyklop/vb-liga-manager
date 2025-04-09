import { prisma } from '../lib/prisma'; // Use ES module import

async function main() {
  // Finde oder erstelle die Liga "Volleyball Hobbyliga 2024/25"
  let league = await prisma.league.findFirst({
    where: {
      name: {
        contains: "Volleyball Hobbyliga 2024/25"
      }
    }
  });

  if (!league) {
    console.log("Liga 'Volleyball Hobbyliga 2024/25' wird erstellt...");
    league = await prisma.league.create({
      data: {
        name: "Volleyball Hobbyliga 2024/25",
        slug: "volleyball-hobbyliga-2024-25", // Slug hinzugefügt
        numberOfTeams: 7,
        hasReturnMatches: true,
        pointsWin30: 3,
        pointsWin31: 3,
        pointsWin32: 2,
        pointsLoss32: 1
      }
    });
  }

  console.log(`Liga gefunden: ${league.name} (ID: ${league.id})`);

  // Finde alle Teams
  const teams = await prisma.team.findMany({
    where: {
      OR: [
        { name: 'TSV Bad Berneck' },
        { name: 'BSV H5' },
        { name: 'TSV Kirchenlaibach' },
        { name: 'MTV/SG Pegnitz' },
        { name: 'USC Bayreuth 1' },
        { name: 'USC Bayreuth 2' },
        { name: 'CVJM Naila' }
      ]
    }
  });

  // Erstelle ein Mapping von Teamnamen zu IDs
  const teamMap = teams.reduce((map, team) => {
    map[team.name] = team.id;
    return map;
  }, {} as Record<string, number>);

  // Überprüfe, ob alle Teams gefunden wurden
  const requiredTeams = ['TSV Bad Berneck', 'BSV H5', 'TSV Kirchenlaibach', 'MTV/SG Pegnitz', 'USC Bayreuth 1', 'USC Bayreuth 2', 'CVJM Naila'];
  const missingTeams = requiredTeams.filter(name => !teamMap[name]);
  
  if (missingTeams.length > 0) {
    console.error(`Folgende Teams wurden nicht gefunden: ${missingTeams.join(', ')}`);
    return;
  }

  // Lösche bestehende Fixtures für diese Liga
  await prisma.fixture.deleteMany({
    where: {
      leagueId: league.id
    }
  });

  console.log("Bestehende Spielpläne wurden gelöscht");

  // Spielplan-Daten
  const fixtures = [
    // Spieltag 1
    {
      matchday: 1,
      homeTeam: 'BSV H5',
      awayTeam: 'CVJM Naila',
      fixtureDate: new Date('2024-11-04T19:30:00'),
      homeSets: 3,
      awaySets: 0,
      homePoints: 75,
      awayPoints: 40,
      location: 'Bayreuth'
    },
    {
      matchday: 1,
      homeTeam: 'USC Bayreuth 2',
      awayTeam: 'TSV Bad Berneck',
      fixtureDate: new Date('2024-11-15T20:00:00'),
      homeSets: 0,
      awaySets: 3,
      homePoints: 58,
      awayPoints: 75,
      location: 'Bayreuth'
    },
    {
      matchday: 1,
      homeTeam: 'MTV/SG Pegnitz',
      awayTeam: 'USC Bayreuth 1',
      fixtureDate: new Date('2024-11-04T20:00:00'),
      homeSets: 3,
      awaySets: 0,
      homePoints: 75,
      awayPoints: 37,
      location: 'Pegnitz'
    },
    // Spieltag 2
    {
      matchday: 2,
      homeTeam: 'TSV Bad Berneck',
      awayTeam: 'TSV Kirchenlaibach',
      fixtureDate: new Date('2024-11-26T18:45:00'),
      homeSets: 3,
      awaySets: 0,
      homePoints: 75,
      awayPoints: 45,
      location: 'Bad Berneck'
    },
    {
      matchday: 2,
      homeTeam: 'CVJM Naila',
      awayTeam: 'MTV/SG Pegnitz',
      fixtureDate: new Date('2024-11-29T20:00:00'),
      homeSets: 0,
      awaySets: 3,
      homePoints: 47,
      awayPoints: 75,
      location: 'Naila'
    },
    {
      matchday: 2,
      homeTeam: 'USC Bayreuth 1',
      awayTeam: 'USC Bayreuth 2',
      fixtureDate: new Date('2024-11-29T20:00:00'),
      homeSets: 0,
      awaySets: 3,
      homePoints: 67,
      awayPoints: 77,
      location: 'Bayreuth'
    },
    // Spieltag 3
    {
      matchday: 3,
      homeTeam: 'MTV/SG Pegnitz',
      awayTeam: 'BSV H5',
      fixtureDate: new Date('2025-01-20T20:00:00'),
      homeSets: 3,
      awaySets: 2,
      homePoints: 106,
      awayPoints: 108,
      location: 'Pegnitz'
    },
    {
      matchday: 3,
      homeTeam: 'TSV Kirchenlaibach',
      awayTeam: 'USC Bayreuth 1',
      fixtureDate: new Date('2024-12-12T19:30:00'),
      homeSets: 2,
      awaySets: 3,
      homePoints: 93,
      awayPoints: 106,
      location: 'Speichersdorf'
    },
    {
      matchday: 3,
      homeTeam: 'USC Bayreuth 2',
      awayTeam: 'CVJM Naila',
      fixtureDate: new Date('2024-12-13T20:00:00'),
      homeSets: 3,
      awaySets: 1,
      homePoints: 97,
      awayPoints: 74,
      location: 'Bayreuth'
    },
    // Spieltag 4
    {
      matchday: 4,
      homeTeam: 'USC Bayreuth 1',
      awayTeam: 'TSV Bad Berneck',
      fixtureDate: new Date('2025-01-08T19:00:00'),
      homeSets: 1,
      awaySets: 3,
      homePoints: 75,
      awayPoints: 98,
      location: 'Bayreuth'
    },
    {
      matchday: 4,
      homeTeam: 'BSV H5',
      awayTeam: 'USC Bayreuth 2',
      fixtureDate: new Date('2024-12-18T19:30:00'),
      homeSets: 3,
      awaySets: 0,
      homePoints: 75,
      awayPoints: 57,
      location: 'Bayreuth'
    },
    {
      matchday: 4,
      homeTeam: 'CVJM Naila',
      awayTeam: 'TSV Kirchenlaibach',
      fixtureDate: new Date('2025-01-10T20:00:00'),
      homeSets: 3,
      awaySets: 2,
      homePoints: 107,
      awayPoints: 107,
      location: 'Naila'
    },
    // Spieltag 5
    {
      matchday: 5,
      homeTeam: 'USC Bayreuth 2',
      awayTeam: 'MTV/SG Pegnitz',
      fixtureDate: new Date('2025-01-17T20:00:00'),
      homeSets: 0,
      awaySets: 3,
      homePoints: 45,
      awayPoints: 75,
      location: 'Bayreuth'
    },
    {
      matchday: 5,
      homeTeam: 'TSV Bad Berneck',
      awayTeam: 'CVJM Naila',
      fixtureDate: new Date('2025-01-14T18:45:00'),
      homeSets: 3,
      awaySets: 0,
      homePoints: 75,
      awayPoints: 44,
      location: 'Bad Berneck'
    },
    {
      matchday: 5,
      homeTeam: 'TSV Kirchenlaibach',
      awayTeam: 'BSV H5',
      fixtureDate: new Date('2025-01-16T19:30:00'),
      homeSets: 0,
      awaySets: 3,
      homePoints: 61,
      awayPoints: 75,
      location: 'Speichersdorf'
    },
    // Spieltag 6
    {
      matchday: 6,
      homeTeam: 'CVJM Naila',
      awayTeam: 'USC Bayreuth 1',
      fixtureDate: new Date('2025-02-07T20:00:00'),
      homeSets: 3,
      awaySets: 2,
      homePoints: 106,
      awayPoints: 100,
      location: 'Naila'
    },
    {
      matchday: 6,
      homeTeam: 'MTV/SG Pegnitz',
      awayTeam: 'TSV Kirchenlaibach',
      fixtureDate: new Date('2025-02-03T20:00:00'),
      homeSets: 3,
      awaySets: 0,
      homePoints: 75,
      awayPoints: 52,
      location: 'Pegnitz'
    },
    {
      matchday: 6,
      homeTeam: 'BSV H5',
      awayTeam: 'TSV Bad Berneck',
      fixtureDate: new Date('2025-02-05T19:30:00'),
      homeSets: 3,
      awaySets: 2,
      homePoints: 92,
      awayPoints: 83,
      location: 'Bayreuth'
    },
    // Spieltag 7
    {
      matchday: 7,
      homeTeam: 'TSV Kirchenlaibach',
      awayTeam: 'USC Bayreuth 2',
      fixtureDate: new Date('2025-03-20T19:30:00'),
      homeSets: 3,
      awaySets: 2,
      homePoints: 100,
      awayPoints: 98,
      location: 'Speichersdorf'
    },
    {
      matchday: 7,
      homeTeam: 'USC Bayreuth 1',
      awayTeam: 'BSV H5',
      fixtureDate: new Date('2025-03-14T20:00:00'),
      homeSets: null,
      awaySets: null,
      homePoints: null,
      awayPoints: null,
      location: 'Bayreuth'
    },
    {
      matchday: 7,
      homeTeam: 'TSV Bad Berneck',
      awayTeam: 'MTV/SG Pegnitz',
      fixtureDate: new Date('2025-03-11T18:45:00'),
      homeSets: 2,
      awaySets: 3,
      homePoints: 104,
      awayPoints: 106,
      location: 'Bad Berneck'
    },
    // Spieltag 8
    {
      matchday: 8,
      homeTeam: 'CVJM Naila',
      awayTeam: 'BSV H5',
      fixtureDate: new Date('2025-03-28T20:00:00'),
      homeSets: null,
      awaySets: null,
      homePoints: null,
      awayPoints: null,
      location: 'Naila'
    },
    {
      matchday: 8,
      homeTeam: 'TSV Bad Berneck',
      awayTeam: 'USC Bayreuth 2',
      fixtureDate: new Date('2025-03-25T18:45:00'),
      homeSets: 3,
      awaySets: 0,
      homePoints: 75,
      awayPoints: 55,
      location: 'Bad Berneck'
    },
    {
      matchday: 8,
      homeTeam: 'USC Bayreuth 1',
      awayTeam: 'MTV/SG Pegnitz',
      fixtureDate: new Date('2025-03-28T20:00:00'),
      homeSets: 1,
      awaySets: 2,
      homePoints: 64,
      awayPoints: 75,
      location: 'Bayreuth'
    },
    // Spieltag 9
    {
      matchday: 9,
      homeTeam: 'TSV Kirchenlaibach',
      awayTeam: 'TSV Bad Berneck',
      fixtureDate: new Date('2025-04-10T19:30:00'),
      homeSets: null,
      awaySets: null,
      homePoints: null,
      awayPoints: null,
      location: 'Speichersdorf'
    },
    {
      matchday: 9,
      homeTeam: 'MTV/SG Pegnitz',
      awayTeam: 'CVJM Naila',
      fixtureDate: new Date('2025-04-07T20:00:00'),
      homeSets: null,
      awaySets: null,
      homePoints: null,
      awayPoints: null,
      location: 'Pegnitz'
    },
    {
      matchday: 9,
      homeTeam: 'USC Bayreuth 2',
      awayTeam: 'USC Bayreuth 1',
      fixtureDate: new Date('2025-04-11T20:00:00'),
      homeSets: null,
      awaySets: null,
      homePoints: null,
      awayPoints: null,
      location: 'Bayreuth'
    },
    // Spieltag 10
    {
      matchday: 10,
      homeTeam: 'BSV H5',
      awayTeam: 'MTV/SG Pegnitz',
      fixtureDate: new Date('2025-04-30T19:30:00'),
      homeSets: null,
      awaySets: null,
      homePoints: null,
      awayPoints: null,
      location: 'Bayreuth'
    },
    {
      matchday: 10,
      homeTeam: 'USC Bayreuth 1',
      awayTeam: 'TSV Kirchenlaibach',
      fixtureDate: new Date('2025-05-02T20:00:00'),
      homeSets: null,
      awaySets: null,
      homePoints: null,
      awayPoints: null,
      location: 'Bayreuth'
    },
    {
      matchday: 10,
      homeTeam: 'CVJM Naila',
      awayTeam: 'USC Bayreuth 2',
      fixtureDate: new Date('2025-05-02T20:00:00'),
      homeSets: null,
      awaySets: null,
      homePoints: null,
      awayPoints: null,
      location: 'Naila'
    },
    // Spieltag 11
    {
      matchday: 11,
      homeTeam: 'TSV Bad Berneck',
      awayTeam: 'USC Bayreuth 1',
      fixtureDate: new Date('2025-05-13T18:45:00'),
      homeSets: null,
      awaySets: null,
      homePoints: null,
      awayPoints: null,
      location: 'Bad Berneck'
    },
    {
      matchday: 11,
      homeTeam: 'USC Bayreuth 2',
      awayTeam: 'BSV H5',
      fixtureDate: new Date('2025-05-16T20:00:00'),
      homeSets: null,
      awaySets: null,
      homePoints: null,
      awayPoints: null,
      location: 'Bayreuth'
    },
    {
      matchday: 11,
      homeTeam: 'TSV Kirchenlaibach',
      awayTeam: 'CVJM Naila',
      fixtureDate: new Date('2025-05-15T19:30:00'),
      homeSets: null,
      awaySets: null,
      homePoints: null,
      awayPoints: null,
      location: 'Speichersdorf'
    },
    // Spieltag 12
    {
      matchday: 12,
      homeTeam: 'MTV/SG Pegnitz',
      awayTeam: 'USC Bayreuth 2',
      fixtureDate: new Date('2025-05-26T20:00:00'),
      homeSets: null,
      awaySets: null,
      homePoints: null,
      awayPoints: null,
      location: 'Pegnitz'
    },
    {
      matchday: 12,
      homeTeam: 'CVJM Naila',
      awayTeam: 'TSV Bad Berneck',
      fixtureDate: new Date('2025-05-30T20:00:00'),
      homeSets: null,
      awaySets: null,
      homePoints: null,
      awayPoints: null,
      location: 'Naila'
    },
    {
      matchday: 12,
      homeTeam: 'BSV H5',
      awayTeam: 'TSV Kirchenlaibach',
      fixtureDate: new Date('2025-05-28T19:30:00'),
      homeSets: null,
      awaySets: null,
      homePoints: null,
      awayPoints: null,
      location: 'Bayreuth'
    },
    // Spieltag 13
    {
      matchday: 13,
      homeTeam: 'USC Bayreuth 1',
      awayTeam: 'CVJM Naila',
      fixtureDate: null,
      homeSets: null,
      awaySets: null,
      homePoints: null,
      awayPoints: null,
      location: 'Bad Berneck'
    },
    {
      matchday: 13,
      homeTeam: 'TSV Kirchenlaibach',
      awayTeam: 'MTV/SG Pegnitz',
      fixtureDate: null,
      homeSets: null,
      awaySets: null,
      homePoints: null,
      awayPoints: null,
      location: 'Bad Berneck'
    },
    {
      matchday: 13,
      homeTeam: 'TSV Bad Berneck',
      awayTeam: 'BSV H5',
      fixtureDate: null,
      homeSets: null,
      awaySets: null,
      homePoints: null,
      awayPoints: null,
      location: 'Bad Berneck'
    },
    // Spieltag 14
    {
      matchday: 14,
      homeTeam: 'USC Bayreuth 2',
      awayTeam: 'TSV Kirchenlaibach',
      fixtureDate: null,
      homeSets: null,
      awaySets: null,
      homePoints: null,
      awayPoints: null,
      location: 'Bad Berneck'
    },
    {
      matchday: 14,
      homeTeam: 'BSV H5',
      awayTeam: 'USC Bayreuth 1',
      fixtureDate: null,
      homeSets: null,
      awaySets: null,
      homePoints: null,
      awayPoints: null,
      location: 'Bad Berneck'
    },
    {
      matchday: 14,
      homeTeam: 'MTV/SG Pegnitz',
      awayTeam: 'TSV Bad Berneck',
      fixtureDate: null,
      homeSets: null,
      awaySets: null,
      homePoints: null,
      awayPoints: null,
      location: 'Bad Berneck'
    }
  ];

  // Erstelle die Fixtures
  let order = 1;
  for (const fixture of fixtures) {
    const homeTeamId = teamMap[fixture.homeTeam];
    const awayTeamId = teamMap[fixture.awayTeam];
    
    if (!homeTeamId || !awayTeamId) {
      console.error(`Team nicht gefunden: ${fixture.homeTeam} oder ${fixture.awayTeam}`);
      continue;
    }

    await prisma.fixture.create({
      data: {
        leagueId: league.id,
        homeTeamId,
        awayTeamId,
        matchday: fixture.matchday,
        round: fixture.matchday,
        fixtureDate: fixture.fixtureDate,
        homeSets: fixture.homeSets,
        awaySets: fixture.awaySets,
        homePoints: fixture.homePoints,
        awayPoints: fixture.awayPoints,
        order: order++,
        // Berechne die Matchpoints basierend auf den Sätzen
        homeMatchPoints: calculateMatchPoints(fixture.homeSets, fixture.awaySets, league),
        awayMatchPoints: calculateMatchPoints(fixture.awaySets, fixture.homeSets, league)
      }
    });
  }

  console.log(`${fixtures.length} Spielpaarungen wurden erfolgreich angelegt`);
}

// Hilfsfunktion zur Berechnung der Matchpoints basierend auf den Liga-Regeln
function calculateMatchPoints(sets: number | null, opponentSets: number | null, league: any): number | null {
  if (sets === null || opponentSets === null) return null;
  
  if (sets > opponentSets) {
    if (sets === 3 && opponentSets === 0) return league.pointsWin30;
    if (sets === 3 && opponentSets === 1) return league.pointsWin31;
    if (sets === 3 && opponentSets === 2) return league.pointsWin32;
  } else if (sets < opponentSets) {
    if (sets === 2 && opponentSets === 3) return league.pointsLoss32;
    return 0;
  }
  
  return 0; // Unentschieden (sollte im Volleyball nicht vorkommen)
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
