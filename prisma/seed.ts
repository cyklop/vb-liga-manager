import * as bcrypt from 'bcrypt'
import { PrismaClient } from '@prisma/client' // Importiere PrismaClient direkt
// Entferne den Import für das historische Seeding

const prisma = new PrismaClient()

async function main() {
  console.log('Start seeding ...')

  // 1. Create Super Admin User (if not exists)
  const superAdminEmail = process.env.SUPERADMIN_EMAIL || 'superadmin@example.com'
  const superAdminPassword = process.env.SUPERADMIN_PASSWORD || 'superadmin123' // Change this!

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
    console.log(`✅ Superadmin user "${superAdminEmail}" created.`)
  } else {
    console.log(`ℹ️ Superadmin user "${superAdminEmail}" already exists.`)
  }

  // Historisches Seeding wurde entfernt und in ein separates Skript ausgelagert.

  console.log('Seeding finished.')
}

main()
  .catch(async (e) => {
    console.error('❌ Seeding failed:', e)
    await prisma.$disconnect() // Ensure disconnect on error
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
