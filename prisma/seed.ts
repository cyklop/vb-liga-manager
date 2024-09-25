import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  const superAdminEmail = 'superadmin@example.com'
  const superAdminPassword = 'superadmin123'

  const hashedPassword = await bcrypt.hash(superAdminPassword, 10)

  const superAdmin = await prisma.user.upsert({
    where: { email: superAdminEmail },
    update: {},
    create: {
      email: superAdminEmail,
      password: hashedPassword,
      name: 'Super Admin',
      isAdmin: true,
      isSuperAdmin: true,
    },
  })

  console.log({ superAdmin })
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
