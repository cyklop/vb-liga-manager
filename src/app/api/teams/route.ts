import { NextResponse } from 'next/server'
import prisma from '../../../lib/prisma' // Import the singleton instance

export async function GET() {
  try {
    const teams = await prisma.team.findMany({
      include: {
        teamLeader: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    })
    return NextResponse.json(teams)
  } catch (error) {
    console.error('Error fetching teams:', error)
    return NextResponse.json({ message: 'Fehler beim Abrufen der Teams' }, { status: 500 })
  }
  // No finally block needed for singleton
}

export async function POST(request: Request) {
  const { name, location, hallAddress, trainingTimes, teamLeaderId } = await request.json()

  try {
    const team = await prisma.team.create({
      data: {
        name,
        location,
        hallAddress,
        trainingTimes,
        teamLeaderId: teamLeaderId ? parseInt(teamLeaderId) : undefined,
      },
      include: {
        teamLeader: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    })
    return NextResponse.json(team, { status: 201 })
  } catch (error) {
    console.error('Error creating team:', error)
    return NextResponse.json({ message: 'Fehler beim Erstellen des Teams' }, { status: 400 })
  }
  // No finally block needed for singleton
}
