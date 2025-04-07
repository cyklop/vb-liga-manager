import { NextResponse } from 'next/server'
import prisma from '../../../../../lib/prisma' // Import the singleton instance
import bcrypt from 'bcryptjs'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '../../auth/[...nextauth]/route'

export async function GET(request: Request) {
  // Benutzer aus der Session identifizieren
  const session = await getServerSession(authOptions)
  
  if (!session || !session.user?.id) {
    return NextResponse.json({ message: 'Nicht authentifiziert' }, { status: 401 })
  }
  
  const userId = parseInt(session.user.id)

  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
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

    if (!user) {
      return NextResponse.json({ message: 'Benutzer nicht gefunden' }, { status: 404 })
    }

    // Transformiere die Teams-Daten in ein einfacheres Format
    const formattedUser = {
      ...user,
      teams: user.teams.map(ut => ({
        id: ut.team.id,
        name: ut.team.name
      })),
      // Für Abwärtskompatibilität: Verwende das erste Team als Hauptteam
      team: user.teams.length > 0 ? {
        id: user.teams[0].team.id,
        name: user.teams[0].team.name
      } : null
    }

    return NextResponse.json(formattedUser)
  } catch (error) {
    console.error('Fehler beim Abrufen des Benutzerprofils:', error)
    return NextResponse.json({ message: 'Ein Fehler ist aufgetreten' }, { status: 500 })
  }
  // No finally block needed for singleton
}

export async function PUT(request: Request) {
  // Benutzer aus der Session identifizieren
  const session = await getServerSession(authOptions)
  
  if (!session || !session.user?.id) {
    return NextResponse.json({ message: 'Nicht authentifiziert' }, { status: 401 })
  }
  
  const userId = parseInt(session.user.id)

  const { name, email, password, theme } = await request.json()

  try {
    const updateData: any = { name, email }

    if (password) {
      const hashedPassword = await bcrypt.hash(password, 10)
      updateData.password = hashedPassword
    }
    
    if (theme) {
      updateData.theme = theme
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: updateData,
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

    // Transformiere die Teams-Daten in ein einfacheres Format
    const formattedUser = {
      ...updatedUser,
      teams: updatedUser.teams.map(ut => ({
        id: ut.team.id,
        name: ut.team.name
      })),
      // Für Abwärtskompatibilität: Verwende das erste Team als Hauptteam
      team: updatedUser.teams.length > 0 ? {
        id: updatedUser.teams[0].team.id,
        name: updatedUser.teams[0].team.name
      } : null
    }

    return NextResponse.json(formattedUser)
  } catch (error) {
    console.error('Fehler beim Aktualisieren des Benutzerprofils:', error)
    return NextResponse.json({ message: 'Ein Fehler ist aufgetreten' }, { status: 500 })
  }
  // No finally block needed for singleton
}
