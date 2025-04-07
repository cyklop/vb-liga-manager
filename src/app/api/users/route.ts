import { NextResponse } from 'next/server'
import prisma from '../../../../lib/prisma' // Import the singleton instance
import bcrypt from 'bcryptjs'

export async function POST(request: Request) {
  const { email, name, password, isAdmin, teamIds } = await request.json()

  try {
    const hashedPassword = await bcrypt.hash(password, 10)
    
    // Erstelle den Benutzer mit den Grunddaten
    const user = await prisma.user.create({
      data: {
        email,
        name,
        password: hashedPassword,
        isAdmin,
      },
    })
    
    // Füge die Team-Zuordnungen hinzu, wenn teamIds vorhanden sind
    if (teamIds && teamIds.length > 0) {
      const teamConnections = teamIds.map((teamId: number) => ({
        userId: user.id,
        teamId: teamId
      }))
      
      await prisma.userTeam.createMany({
        data: teamConnections
      })
    }
    
    return NextResponse.json(user, { status: 201 })
  } catch (error) {
    console.error('Error creating user:', error)
    return NextResponse.json({ message: 'Fehler beim Erstellen des Benutzers' }, { status: 400 })
  }
}

export async function GET() {
  try {
    const users = await prisma.user.findMany({
      include: {
        teams: {
          include: {
            team: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
    })
    
    // Transformiere die Daten, um das Format zu vereinfachen
    const formattedUsers = users.map(user => ({
      ...user,
      teams: user.teams.map(ut => ({
        id: ut.team.id,
        name: ut.team.name
      }))
    }))
    
    return NextResponse.json(formattedUsers)
  } catch (error) {
    console.error('Error fetching users:', error)
    return NextResponse.json({ message: 'Fehler beim Abrufen der Benutzer' }, { status: 500 })
  }
}
