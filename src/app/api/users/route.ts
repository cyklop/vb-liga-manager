import { NextResponse } from 'next/server'
import prisma from '../../../../lib/prisma' // Import the singleton instance
import bcrypt from 'bcryptjs'

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
        teamId: teamId ? parseInt(teamId) : undefined,
      },
    })
    return NextResponse.json(user, { status: 201 })
  } catch (error) {
    console.error('Error creating user:', error)
    return NextResponse.json({ message: 'Fehler beim Erstellen des Benutzers' }, { status: 400 })
  }
  // No finally block needed for singleton
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
  }
  // No finally block needed for singleton
}
