import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function GET() {
  try {
    const teams = await prisma.team.findMany()
    return NextResponse.json(teams)
  } catch (error) {
    console.error('Error fetching teams:', error)
    return NextResponse.json({ message: 'Fehler beim Abrufen der Teams' }, { status: 500 })
  } finally {
    await prisma.$disconnect()
  }
}

export async function POST(request: Request) {
  const { name } = await request.json()

  try {
    const team = await prisma.team.create({
      data: { name },
    })
    return NextResponse.json(team, { status: 201 })
  } catch (error) {
    console.error('Error creating team:', error)
    return NextResponse.json({ message: 'Fehler beim Erstellen des Teams' }, { status: 400 })
  } finally {
    await prisma.$disconnect()
  }
}
