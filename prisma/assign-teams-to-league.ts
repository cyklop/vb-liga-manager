import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Finde die Liga "Volleyball Hobbyliga 2024/25"
  const league = await prisma.league.findFirst({
    where: {
      name: {
        contains: "Volleyball Hobbyliga 2024/25"
      }
    }
  });

  if (!league) {
    console.error("Liga 'Volleyball Hobbyliga 2024/25' nicht gefunden");
    return;
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
