import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

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
  } finally {
    await prisma.$disconnect()
  }
}

export async function POST(request: Request) {
  const { name, numberOfTeams, hasReturnMatches, teamIds } = await request.json()

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
  } finally {
    await prisma.$disconnect()
  }
}
