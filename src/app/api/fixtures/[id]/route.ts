import { NextResponse } from 'next/server'
import prisma from '../../../../../lib/prisma' // Import the singleton instance

// PUT Handler to update a specific fixture
export async function PUT(request: Request, { params }: { params: { id: string } }) {
  const id = parseInt(params.id)
  if (isNaN(id)) {
    return NextResponse.json({ message: 'Ungültige Fixture-ID' }, { status: 400 })
  }

  try {
    const { 
      homeTeamId, 
      awayTeamId, 
      fixtureDate, 
      homeScore, 
      awayScore 
    } = await request.json()

    // Basic validation
    if (!homeTeamId || !awayTeamId) {
      return NextResponse.json({ message: 'Heim- und Auswärtsteam dürfen nicht leer sein' }, { status: 400 })
    }
    if (homeTeamId === awayTeamId) {
        return NextResponse.json({ message: 'Heim- und Auswärtsteam dürfen nicht identisch sein' }, { status: 400 })
    }

    // Prepare update data, handling potential null values for scores and date
    const updateData: any = {
      homeTeamId: Number(homeTeamId),
      awayTeamId: Number(awayTeamId),
      fixtureDate: fixtureDate ? new Date(fixtureDate) : null,
      homeScore: homeScore !== null ? Number(homeScore) : null,
      awayScore: awayScore !== null ? Number(awayScore) : null,
    }

    const updatedFixture = await prisma.fixture.update({
      where: { id },
      data: updateData,
      include: { // Include teams to return updated data if needed
        homeTeam: { select: { id: true, name: true } },
        awayTeam: { select: { id: true, name: true } },
      }
    })

    return NextResponse.json(updatedFixture)

  } catch (error) {
    console.error('Error updating fixture:', error)
    // Check for specific Prisma errors, e.g., record not found
    if (error instanceof Error && 'code' in error && error.code === 'P2025') {
         return NextResponse.json({ message: 'Spielpaarung nicht gefunden' }, { status: 404 })
    }
    return NextResponse.json({ message: 'Fehler beim Aktualisieren der Spielpaarung' }, { status: 500 })
  }
  // No finally block needed for singleton
}

// Optional: DELETE Handler if needed later
// export async function DELETE(request: Request, { params }: { params: { id: string } }) { ... } 
