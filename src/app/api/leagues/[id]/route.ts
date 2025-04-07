import { NextResponse } from 'next/server'
import prisma from '../../../../../lib/prisma' // Import the singleton instance

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
  } 
  // No finally block needed for singleton
}

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  const id = parseInt(params.id)
  const { 
    name, 
    numberOfTeams, 
    hasReturnMatches, 
    teamIds,
    // Add point rules
    pointsWin30, 
    pointsWin31, 
    pointsWin32, 
    pointsLoss32 
  } = await request.json()

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
        // Update point rules - ensure they are numbers or use defaults/existing
        pointsWin30: pointsWin30 !== undefined ? Number(pointsWin30) : undefined,
        pointsWin31: pointsWin31 !== undefined ? Number(pointsWin31) : undefined,
        pointsWin32: pointsWin32 !== undefined ? Number(pointsWin32) : undefined,
        pointsLoss32: pointsLoss32 !== undefined ? Number(pointsLoss32) : undefined,
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
  }
  // No finally block needed for singleton
}
