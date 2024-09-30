import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function GET() {
  try {
    const leagues = await prisma.league.findMany()
    return NextResponse.json(leagues)
  } catch (error) {
    console.error('Error fetching leagues:', error)
    return NextResponse.json({ message: 'Fehler beim Abrufen der Ligen' }, { status: 500 })
  } finally {
    await prisma.$disconnect()
  }
}

export async function POST(request: Request) {
  const { name, numberOfTeams, hasReturnMatches } = await request.json()

  try {
    const league = await prisma.league.create({
      data: { 
        name,
        numberOfTeams,
        hasReturnMatches
      },
    })
    return NextResponse.json(league, { status: 201 })
  } catch (error) {
    console.error('Error creating league:', error)
    return NextResponse.json({ message: 'Fehler beim Erstellen der Liga' }, { status: 400 })
  } finally {
    await prisma.$disconnect()
  }
}
