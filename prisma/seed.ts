import * as bcrypt from 'bcrypt'
import { prisma } from '../src/lib/prisma'

async function main() {
  const superAdminEmail = 'superadmin@example.com'
  const superAdminPassword = 'superadmin123' // Bitte ändern Sie dies in ein sicheres Passwort

  const existingSuperAdmin = await prisma.user.findUnique({
    where: { email: superAdminEmail },
  })

  if (!existingSuperAdmin) {
    const hashedPassword = await bcrypt.hash(superAdminPassword, 10)

    await prisma.user.create({
      data: {
        email: superAdminEmail,
        password: hashedPassword,
        name: 'Super Admin',
        isAdmin: true,
        isSuperAdmin: true,
      },
    })

    console.log('Superadmin-Benutzer wurde erfolgreich erstellt.')
  } else {
    console.log('Superadmin-Benutzer existiert bereits.')
  }

  // Create demo teams if they don't exist
  const demoTeams = [
    { name: 'TSV Musterstadt', location: 'Musterstadt', hallAddress: 'Musterhalle 1', trainingTimes: 'Di 18-20 Uhr' },
    { name: 'VfL Beispielhausen', location: 'Beispielhausen', hallAddress: 'Beispielsporthalle', trainingTimes: 'Mi 19-21 Uhr' },
    { name: 'SG Testdorf', location: 'Testdorf', hallAddress: 'Alte Turnhalle', trainingTimes: 'Do 20-22 Uhr' },
    { name: 'FC Probestadt', location: 'Probestadt', hallAddress: 'Neubauhalle', trainingTimes: 'Fr 17-19 Uhr' },
    { name: 'Eintracht Demostadt', location: 'Demostadt', hallAddress: 'Schulsporthalle Ost', trainingTimes: 'Mo 18:30-20:30 Uhr' },
    { name: 'Blau-Weiss Fiktivlingen', location: 'Fiktivlingen', hallAddress: 'Mehrzweckhalle', trainingTimes: 'Di 20-22 Uhr' },
  ];

  // Füge die spezifischen Hobbyliga-Teams hinzu
  const hobbyLigaTeams = [
    { name: 'TSV Bad Berneck', location: 'Bad Berneck', hallAddress: 'Klang 15, 95460 Bad Berneck', trainingTimes: 'Dienstag 18:45-22:00' },
    { name: 'BSV H5', location: 'Bayreuth', hallAddress: 'Sporthalle BSZ, Adolf-Wächter-Str.', trainingTimes: 'Mittwoch 19:30-22:00' },
    { name: 'TSV Kirchenlaibach', location: 'Speichersdorf', hallAddress: 'Sportarena Speichersdorf', trainingTimes: 'Donnerstag 19:30-22:00' },
    { name: 'MTV/SG Pegnitz', location: 'Pegnitz', hallAddress: 'Gymnasium Pegnitz', trainingTimes: 'Montag 20:00-22:00' },
    { name: 'USC Bayreuth 1', location: 'Bayreuth', hallAddress: 'Uni-Sportzentrum', trainingTimes: 'Mittwoch 19:00-20:30' },
    { name: 'USC Bayreuth 2', location: 'Bayreuth', hallAddress: 'Uni-Sportzentrum', trainingTimes: 'Freitag 20:00-22:00' },
    { name: 'CVJM Naila', location: 'Naila', hallAddress: 'Frankenhalle Naila', trainingTimes: 'Freitag 20:00-22:00' },
  ];

  const allTeamsToSeed = [...demoTeams, ...hobbyLigaTeams];

  console.log('Erstelle/Überprüfe Mannschaften...');
  for (const teamData of allTeamsToSeed) {
    await prisma.team.upsert({
      where: { name: teamData.name },
      update: {}, // No update needed if exists
      create: teamData,
    });
    console.log(`- Mannschaft "${teamData.name}" erstellt oder bereits vorhanden.`);
  }
  console.log('Demo-Mannschaften erfolgreich erstellt/überprüft.');

  // Importiere die main Funktionen der anderen Seed-Skripte
  // Stelle sicher, dass die main-Funktionen in den jeweiligen Dateien exportiert werden!
  console.log('\nImportiere zusätzliche Seed-Skripte...');
  // Verwende Aliasse, um Namenskollisionen zu vermeiden
  const { main: assignTeamsMain } = await import('./assign-teams-to-league');
  // Annahme: seed-fixtures.ts hat auch eine exportierte main-Funktion
  const { main: seedFixturesMain } = await import('./seed-fixtures');

  // Führe die importierten main Funktionen aus
  console.log('\nFühre Zuweisung der Teams zur Liga aus...');
  await assignTeamsMain();
  console.log('Teamzuweisung abgeschlossen.');

  console.log('\nFühre Erstellung der Spielpläne aus...');
  await seedFixturesMain();
  console.log('Spielplanerstellung abgeschlossen.');

  console.log('\nAlle Seed-Vorgänge abgeschlossen.');
}

main()
  .catch((e) => {
    // Stelle sicher, dass Prisma auch bei Fehlern in den Sub-Skripten getrennt wird
    console.error('Ein Fehler ist während des Seedings aufgetreten:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
