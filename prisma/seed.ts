import { PrismaClient } from '@prisma/client'
import * as bcrypt from 'bcrypt'

const prisma = new PrismaClient()

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

  console.log('Erstelle Demo-Mannschaften...');
  for (const teamData of demoTeams) {
    await prisma.team.upsert({
      where: { name: teamData.name },
      update: {}, // No update needed if exists
      create: teamData,
    });
    console.log(`- Mannschaft "${teamData.name}" erstellt oder bereits vorhanden.`);
  }
  console.log('Demo-Mannschaften erfolgreich erstellt/überprüft.');
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
