import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  const id = parseInt(params.id)

  try {
    await prisma.league.delete({
      where: { id },
    })
    return NextResponse.json({ message: 'Liga erfolgreich gelöscht' })
  } catch (error) {
    console.error('Error deleting league:', error)
    return NextResponse.json({ message: 'Fehler beim Löschen der Liga' }, { status: 500 })
  } finally {
    await prisma.$disconnect()
  }
}

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  const id = parseInt(params.id)
  const { name, numberOfTeams, hasReturnMatches, teamIds } = await request.json()

  try {
    // Überprüfen, ob die Anzahl der ausgewählten Teams die maximale Anzahl überschreitet
    if (teamIds && teamIds.length > numberOfTeams) {
      return NextResponse.json(
        { message: `Es können maximal ${numberOfTeams} Teams zugewiesen werden` }, 
        { status: 400 }
      )
    }

    // Zuerst alle bestehenden Team-Verbindungen entfernen
    await prisma.team.updateMany({
      where: { leagueId: id },
      data: { leagueId: null }
    })

    // Liga aktualisieren und neue Team-Verbindungen erstellen
    const updatedLeague = await prisma.league.update({
      where: { id },
      data: { 
        name,
        numberOfTeams,
        hasReturnMatches,
        ...(teamIds && teamIds.length > 0 && {
          teams: {
            connect: teamIds.map((teamId: number) => ({ id: teamId }))
          }
        })
      },
      include: {
        teams: true
      }
    })
    
    return NextResponse.json(updatedLeague)
  } catch (error) {
    console.error('Error updating league:', error)
    return NextResponse.json({ message: 'Fehler beim Aktualisieren der Liga' }, { status: 500 })
  } finally {
    await prisma.$disconnect()
  }
}
