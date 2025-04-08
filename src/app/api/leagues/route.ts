import { NextResponse } from 'next/server'
import prisma from '../../../../lib/prisma' // Import the singleton instance
import { getServerSession } from 'next-auth'
import { authOptions } from '../../auth/[...nextauth]/route'
import { createSlug, isValidSlug } from '../../../../src/lib/slugify'

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
          },
          fixtures: {
            include: {
              homeTeam: {
                select: { id: true, name: true }
              },
              awayTeam: {
                select: { id: true, name: true }
              }
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
          },
          fixtures: {
            include: {
              homeTeam: {
                select: { id: true, name: true }
              },
              awayTeam: {
                select: { id: true, name: true }
              }
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
    slug: providedSlug,
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
    
    // Slug generieren oder validieren
    let finalSlug = providedSlug ? providedSlug.trim() : createSlug(name)
    
    // Slug-Validierung
    if (!isValidSlug(finalSlug)) {
      return NextResponse.json(
        { message: 'Der URL-Slug darf nur Kleinbuchstaben, Zahlen und Bindestriche enthalten' },
        { status: 400 }
      )
    }
    
    // Prüfen, ob der Slug bereits existiert
    const existingLeague = await prisma.league.findUnique({
      where: { slug: finalSlug }
    })
    
    // Falls der Slug bereits existiert, eine Nummer anhängen
    let counter = 1
    while (existingLeague) {
      finalSlug = `${providedSlug ? providedSlug : createSlug(name)}-${counter}`
      counter++
      const checkLeague = await prisma.league.findUnique({
        where: { slug: finalSlug }
      })
      if (!checkLeague) break
    }

    const league = await prisma.league.create({
      data: {
        name,
        slug: finalSlug,
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
}
