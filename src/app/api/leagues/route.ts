import { NextResponse } from 'next/server'
import prisma from '../../../../lib/prisma' // Import the singleton instance

export async function GET() {
  try {
    const leagues = await prisma.league.findMany({
      include: {
        teams: true, // Keep assigned teams
        fixtures: {   // Include fixtures
          orderBy: {
            order: 'asc' // Order fixtures by the manual order field
          },
          include: {
            homeTeam: { // Include home team details
              select: { id: true, name: true } 
            },
            awayTeam: { // Include away team details
              select: { id: true, name: true }
            }
          }
        }
      }
    })
    return NextResponse.json(leagues)
  } catch (error) {
    console.error('Error fetching leagues:', error)
    return NextResponse.json({ message: 'Fehler beim Abrufen der Ligen' }, { status: 500 })
  }
  // No finally block needed for singleton
}

import { getServerSession } from 'next-auth'
import { authOptions } from '../../auth/[...nextauth]/route'

export async function POST(request: Request) {
  // Benutzerberechtigungen prüfen
  const session = await getServerSession(authOptions)
  if (!session || !session.user?.email) {
    return NextResponse.json({ message: 'Nicht authentifiziert' }, { status: 401 })
  }
  
  // Benutzer abrufen
  const currentUser = await prisma.user.findUnique({
    where: { email: session.user.email },
  })
  
  if (!currentUser || (!currentUser.isAdmin && !currentUser.isSuperAdmin)) {
    return NextResponse.json({ message: 'Nicht autorisiert' }, { status: 403 })
  }

  const { 
    name, 
    numberOfTeams, 
    hasReturnMatches, 
    teamIds,
    // Add point rules, defaulting if not provided
    pointsWin30 = 3, 
    pointsWin31 = 3, 
    pointsWin32 = 2, 
    pointsLoss32 = 1 
  } = await request.json()

  try {
    // Überprüfen, ob die Anzahl der ausgewählten Teams die maximale Anzahl überschreitet
    if (teamIds && teamIds.length > numberOfTeams) {
      return NextResponse.json(
        { message: `Es können maximal ${numberOfTeams} Teams zugewiesen werden` }, 
        { status: 400 }
      )
    }

    const league = await prisma.league.create({
      data: {
        name,
        numberOfTeams,
        hasReturnMatches,
        pointsWin30,
        pointsWin31,
        pointsWin32,
        pointsLoss32,
        ...(teamIds && teamIds.length > 0 && {
          teams: {
            connect: teamIds.map((id: number) => ({ id }))
          }
        })
      },
      include: {
        teams: true
      }
    })
    return NextResponse.json(league, { status: 201 })
  } catch (error) {
    console.error('Error creating league:', error)
    return NextResponse.json({ message: 'Fehler beim Erstellen der Liga' }, { status: 400 })
  }
  // No finally block needed for singleton
}
import { NextResponse } from 'next/server'
import prisma from '../../../../lib/prisma'

export async function GET(request: Request) {
  // URL-Parameter auslesen
  const { searchParams } = new URL(request.url)
  const teamId = searchParams.get('teamId')

  try {
    let leagues;
    
    if (teamId) {
      // Nur Ligen abrufen, in denen das angegebene Team spielt
      const teamIdNumber = parseInt(teamId)
      leagues = await prisma.league.findMany({
        where: {
          teams: {
            some: {
              id: teamIdNumber
            }
          }
        },
        include: {
          teams: {
            select: {
              id: true,
              name: true
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        }
      })
    } else {
      // Alle Ligen abrufen
      leagues = await prisma.league.findMany({
        include: {
          teams: {
            select: {
              id: true,
              name: true
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        }
      })
    }

    return NextResponse.json(leagues)
  } catch (error) {
    console.error('Error fetching leagues:', error)
    return NextResponse.json({ message: 'Ein Fehler ist aufgetreten' }, { status: 500 })
  }
}
