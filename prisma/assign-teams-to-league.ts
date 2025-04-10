const { prisma } = require('../lib/prisma');

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

  // Aktualisiere die Liga mit der korrekten Anzahl von Teams
  await prisma.league.update({
    where: { id: league.id },
    data: {
      numberOfTeams: teams.length,
      teams: {
        connect: teams.map(team => ({ id: team.id }))
      }
    }
  });

  console.log(`${teams.length} Teams wurden der Liga zugeordnet`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
