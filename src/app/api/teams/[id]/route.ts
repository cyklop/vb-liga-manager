import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }>  }) {
  const id = parseInt((await params).id)

  try {
    await prisma.team.delete({
      where: { id },
    })
    return NextResponse.json({ message: 'Team erfolgreich gelöscht' })
  } catch (error) {
    console.error('Error deleting team:', error)
    return NextResponse.json({ message: 'Fehler beim Löschen des Teams' }, { status: 500 })
  }
  // No finally block needed for singleton
}

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }>  }) {
  const id = parseInt((await params).id)
  const { name, location, hallAddress, trainingTimes, teamLeaderId } = await request.json()

  try {
    const updatedTeam = await prisma.team.update({
      where: { id },
      data: {
        name,
        location,
        hallAddress,
        trainingTimes,
        teamLeaderId: teamLeaderId ? parseInt(teamLeaderId) : null,
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
    return NextResponse.json(updatedTeam)
  } catch (error) {
    console.error('Error updating team:', error)
    return NextResponse.json({ message: 'Fehler beim Aktualisieren des Teams' }, { status: 500 })
  }
  // No finally block needed for singleton
}
