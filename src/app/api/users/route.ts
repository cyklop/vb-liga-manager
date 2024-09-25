import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

export async function POST(request: Request) {
  const { email, name, password, isAdmin, teamId } = await request.json()

  try {
    const hashedPassword = await bcrypt.hash(password, 10)
    const user = await prisma.user.create({
      data: {
        email,
        name,
        password: hashedPassword,
        isAdmin,
        teamId: teamId || undefined,
      },
    })
    return NextResponse.json(user, { status: 201 })
  } catch (error) {
    console.error('Error creating user:', error)
    return NextResponse.json({ message: 'Fehler beim Erstellen des Benutzers' }, { status: 400 })
  } finally {
    await prisma.$disconnect()
  }
}

export async function GET() {
  try {
    const users = await prisma.user.findMany({
      include: {
        team: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    })
    return NextResponse.json(users)
  } catch (error) {
    console.error('Error fetching users:', error)
    return NextResponse.json({ message: 'Fehler beim Abrufen der Benutzer' }, { status: 500 })
  } finally {
    await prisma.$disconnect()
  }
}
