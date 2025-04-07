import { NextResponse } from 'next/server'
import prisma from '../../../../../../../lib/prisma' // Import the singleton instance

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  const leagueId = parseInt(params.id)
  if (isNaN(leagueId)) {
    return NextResponse.json({ message: 'Ungültige Liga-ID' }, { status: 400 })
  }

  // Benutzerberechtigungen prüfen
  const userId = 1 // In einer echten Anwendung aus der Session/Token holen
  
  // Benutzer abrufen
  const currentUser = await prisma.user.findUnique({
    where: { id: userId },
  })
  
  if (!currentUser || (!currentUser.isAdmin && !currentUser.isSuperAdmin)) {
    return NextResponse.json({ message: 'Nicht autorisiert' }, { status: 403 })
  }

  try {
    const { orderedFixtureIds } = await request.json()

    if (!Array.isArray(orderedFixtureIds) || orderedFixtureIds.length === 0) {
      return NextResponse.json({ message: 'Liste der Fixture-IDs fehlt oder ist leer' }, { status: 400 })
    }
    
    // Verify all fixtures belong to the specified league
    const fixtures = await prisma.fixture.findMany({
      where: {
        id: { in: orderedFixtureIds },
      },
      select: {
        id: true,
        leagueId: true,
      }
    });
    
    // Check if any fixture doesn't belong to the specified league
    const invalidFixtures = fixtures.filter(fixture => fixture.leagueId !== leagueId);
    if (invalidFixtures.length > 0) {
      return NextResponse.json({ 
        message: 'Einige Fixtures gehören nicht zu dieser Liga',
        invalidFixtureIds: invalidFixtures.map(f => f.id)
      }, { status: 400 });
    }

    // Use a transaction to update all order fields atomically
    const updatePromises = orderedFixtureIds.map((fixtureId, index) => {
      if (typeof fixtureId !== 'number') {
        // Basic validation for IDs in the array
        throw new Error('Ungültige Fixture-ID in der Liste gefunden.'); 
      }
      return prisma.fixture.update({
        where: { id: fixtureId },
        data: { 
          order: index + 1 // Assign order based on array index (1-based)
        },
      });
    });

    // Execute all updates within a transaction
    await prisma.$transaction(updatePromises);

    return NextResponse.json({ message: 'Spielplanreihenfolge erfolgreich aktualisiert' })

  } catch (error) {
    console.error('Error reordering fixtures:', error)
     // Check if it's the custom validation error
    if (error instanceof Error && error.message.includes('Ungültige Fixture-ID')) {
        return NextResponse.json({ message: error.message }, { status: 400 });
    }
    // Check for Prisma transaction errors or other issues
    return NextResponse.json({ message: 'Fehler beim Aktualisieren der Spielplanreihenfolge' }, { status: 500 })
  }
  // No finally block needed for singleton
}
