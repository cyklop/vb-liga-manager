import { prisma } from '../src/lib/prisma';

async function main() {
  // Erstelle Testmannschaften
  const teams = [
    { 
      name: 'TSV Bad Berneck', 
      location: 'Bad Berneck', 
      hallAddress: 'Klang 15, 95460 Bad Berneck', 
      trainingTimes: 'Dienstag von 18:45 bis 22:00 Uhr' 
    },
    { 
      name: 'BSV H5', 
      location: 'Bayreuth', 
      hallAddress: 'Äußere Badstraße 30, 95444 Bayreuth', 
      trainingTimes: 'Montag und Mittwoch von 19:30 bis 22:00 Uhr' 
    },
    { 
      name: 'TSV Kirchenlaibach', 
      location: 'Speichersdorf', 
      hallAddress: 'Sportarena Speichersdorf, Schulstraße, 95469 Speichersdorf', 
      trainingTimes: 'Donnerstag 19:30-21:30 Uhr' 
    },
    { 
      name: 'MTV/SG Pegnitz', 
      location: 'Pegnitz', 
      hallAddress: 'Christian-Sammethalle, Jean-Paul-Str., 91257 Pegnitz', 
      trainingTimes: 'Montag von 20-22 Uhr' 
    },
    { 
      name: 'USC Bayreuth 1', 
      location: 'Bayreuth', 
      hallAddress: 'Sporthalle Universität Bayreuth, Universitätsstraße 30, 95447 Bayreuth', 
      trainingTimes: 'Freitag 20-21:45 Uhr' 
    },
    { 
      name: 'USC Bayreuth 2', 
      location: 'Bayreuth', 
      hallAddress: 'Sporthalle Universität Bayreuth, Universitätsstraße 30, 95447 Bayreuth', 
      trainingTimes: 'Freitag 20-21:45 Uhr' 
    },
    { 
      name: 'CVJM Naila', 
      location: 'Naila', 
      hallAddress: 'Finkenweg 15 - 17, 95119 Naila', 
      trainingTimes: 'Freitag 20 - 22 Uhr' 
    }
  ];

  for (const team of teams) {
    const existingTeam = await prisma.team.findUnique({
      where: { name: team.name }
    });

    if (!existingTeam) {
      await prisma.team.create({
        data: team
      });
      console.log(`Team ${team.name} erstellt`);
    } else {
      console.log(`Team ${team.name} existiert bereits`);
    }
  }

  console.log('Mannschaften wurden erfolgreich angelegt');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
