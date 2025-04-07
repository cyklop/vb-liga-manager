import { NextResponse } from 'next/server'
import prisma from '../../../../../lib/prisma' // Import the singleton instance
import { cookies } from 'next/headers'
import { getServerSession } from 'next-auth'
import { authOptions } from '../../../auth/[...nextauth]/route'

// PUT Handler to update a specific fixture
export async function PUT(
  request: Request, 
  { params }: { params: { id: string } }
) {
  const id = parseInt(params.id)
  if (isNaN(id)) {
    return NextResponse.json({ message: 'Ungültige Fixture-ID' }, { status: 400 })
  }

  try {
    // Benutzerberechtigungen prüfen
    const session = await getServerSession(authOptions)
    if (!session || !session.user?.email) {
      return NextResponse.json({ message: 'Nicht authentifiziert' }, { status: 401 })
    }
    
    // Benutzer abrufen
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: {
        team: true,
      },
    })
    
    if (!user) {
      return NextResponse.json({ message: 'Nicht autorisiert' }, { status: 401 })
    }
    
    // Fixture abrufen, um zu prüfen, ob der Benutzer berechtigt ist
    const fixture = await prisma.fixture.findUnique({
      where: { id },
    })
    
    if (!fixture) {
      return NextResponse.json({ message: 'Spielpaarung nicht gefunden' }, { status: 404 })
    }
    
    // Wenn der Benutzer kein Admin ist, darf er nur Heimspiele seiner eigenen Mannschaft bearbeiten
    if (!user.isAdmin && !user.isSuperAdmin && user.team) {
      if (fixture.homeTeamId !== user.team.id) {
        return NextResponse.json({ 
          message: 'Sie sind nur berechtigt, Heimspiele Ihrer eigenen Mannschaft zu bearbeiten' 
        }, { status: 403 })
      }
    }
    const { 
      homeTeamId,
      awayTeamId,
      fixtureDate,
      // New fields from request
      homeSets,
      awaySets,
      homePoints,
      awayPoints
      // homeScore, awayScore are deprecated but might still be sent initially
    } = await request.json();

    // --- Validation ---
    if (!homeTeamId || !awayTeamId) {
      return NextResponse.json({ message: 'Heim- und Auswärtsteam dürfen nicht leer sein' }, { status: 400 })
    }
    if (homeTeamId === awayTeamId) {
        return NextResponse.json({ message: 'Heim- und Auswärtsteam dürfen nicht identisch sein' }, { status: 400 });
    }

    const homeSetsNum = homeSets !== null && homeSets !== undefined && String(homeSets).trim() !== '' ? Number(homeSets) : null;
    const awaySetsNum = awaySets !== null && awaySets !== undefined && String(awaySets).trim() !== '' ? Number(awaySets) : null;

    // Validate sets (e.g., must be 3 for one team if score is 3:0, 3:1, or 3:2)
    if (homeSetsNum !== null && awaySetsNum !== null) {
        if (!((homeSetsNum === 3 && awaySetsNum < 3) || (awaySetsNum === 3 && homeSetsNum < 3))) {
             return NextResponse.json({ message: 'Ungültige Satzanzahl. Ein Team muss 3 Sätze gewonnen haben.' }, { status: 400 });
        }
        if (homeSetsNum > 3 || awaySetsNum > 3 || homeSetsNum < 0 || awaySetsNum < 0) {
             return NextResponse.json({ message: 'Ungültige Satzanzahl. Sätze müssen zwischen 0 und 3 liegen.' }, { status: 400 });
        }
         if (homeSetsNum === 3 && awaySetsNum === 3) {
             return NextResponse.json({ message: 'Ungültige Satzanzahl. Es kann kein 3:3 geben.' }, { status: 400 });
        }
    } else if (homeSetsNum !== null || awaySetsNum !== null) {
        // If one is entered, the other should be too for point calculation
        return NextResponse.json({ message: 'Beide Satzanzahlen (Heim und Auswärts) müssen angegeben werden, um Punkte zu berechnen.' }, { status: 400 });
    }


    // --- Calculate Match Points ---
    let homeMatchPoints = null;
    let awayMatchPoints = null;

    if (homeSetsNum !== null && awaySetsNum !== null) {
        // Fetch league point rules
        const fixtureWithLeague = await prisma.fixture.findUnique({
            where: { id },
            include: { league: true }
        });
        if (!fixtureWithLeague) {
             return NextResponse.json({ message: 'Spielpaarung nicht gefunden' }, { status: 404 });
        }
        const rules = fixtureWithLeague.league;

        if (homeSetsNum === 3 && awaySetsNum === 0) {
            homeMatchPoints = rules.pointsWin30;
            awayMatchPoints = 0;
        } else if (homeSetsNum === 3 && awaySetsNum === 1) {
            homeMatchPoints = rules.pointsWin31;
            awayMatchPoints = 0;
        } else if (homeSetsNum === 3 && awaySetsNum === 2) {
            homeMatchPoints = rules.pointsWin32;
            awayMatchPoints = rules.pointsLoss32;
        } else if (awaySetsNum === 3 && homeSetsNum === 0) {
            awayMatchPoints = rules.pointsWin30;
            homeMatchPoints = 0;
        } else if (awaySetsNum === 3 && homeSetsNum === 1) {
            awayMatchPoints = rules.pointsWin31;
            homeMatchPoints = 0;
        } else if (awaySetsNum === 3 && homeSetsNum === 2) {
            awayMatchPoints = rules.pointsWin32;
            homeMatchPoints = rules.pointsLoss32;
        }
    }

    // --- Prepare Update Data ---
    const updateData: any = {
      homeTeamId: Number(homeTeamId),
      awayTeamId: Number(awayTeamId),
      fixtureDate: fixtureDate ? new Date(fixtureDate) : null,
      // Store new detailed scores
      homeSets: homeSetsNum,
      awaySets: awaySetsNum,
      homePoints: homePoints !== null && homePoints !== undefined && String(homePoints).trim() !== '' ? Number(homePoints) : null,
      awayPoints: awayPoints !== null && awayPoints !== undefined && String(awayPoints).trim() !== '' ? Number(awayPoints) : null,
      // Store calculated match points
      homeMatchPoints: homeMatchPoints,
      awayMatchPoints: awayMatchPoints,
      // Keep deprecated fields null or update if needed for compatibility? Let's set them null.
      homeScore: null, 
      awayScore: null,
    };

    // --- Update Database ---
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
  const fixtureId = parseInt(params.id)
  if (isNaN(fixtureId)) {
    return NextResponse.json({ message: 'Ungültige Spiel-ID' }, { status: 400 })
  }

  // Benutzerberechtigungen prüfen
  const session = await getServerSession(authOptions)
  if (!session || !session.user?.id) {
    return NextResponse.json({ message: 'Nicht authentifiziert' }, { status: 401 })
  }

  try {
    // Fixture abrufen
    const fixture = await prisma.fixture.findUnique({
      where: { id: fixtureId },
      include: {
        homeTeam: true
      }
    })

    if (!fixture) {
      return NextResponse.json({ message: 'Spiel nicht gefunden' }, { status: 404 })
    }

    // Benutzer abrufen
    const user = await prisma.user.findUnique({
      where: { id: parseInt(session.user.id) },
      include: { team: true }
    })

    if (!user) {
      return NextResponse.json({ message: 'Benutzer nicht gefunden' }, { status: 404 })
    }

    // Prüfen, ob der Benutzer Admin ist oder zum Heimteam gehört
    const isAdmin = user.isAdmin || user.isSuperAdmin
    const isHomeTeamMember = user.team && user.team.id === fixture.homeTeamId

    if (!isAdmin && !isHomeTeamMember) {
      return NextResponse.json({ message: 'Keine Berechtigung zum Bearbeiten dieses Spiels' }, { status: 403 })
    }

    // Daten aus dem Request-Body lesen
    const { homeSets, awaySets, homePoints, awayPoints, fixtureDate } = await request.json()

    // Validierung der Daten
    if (homeSets !== null && awaySets !== null) {
      if (homeSets < 0 || homeSets > 3 || awaySets < 0 || awaySets > 3) {
        return NextResponse.json({ message: 'Ungültige Satzwerte (0-3 erlaubt)' }, { status: 400 })
      }
      
      if (homeSets + awaySets > 5) {
        return NextResponse.json({ message: 'Die Summe der Sätze darf nicht größer als 5 sein' }, { status: 400 })
      }
    }

    // Berechnung der Matchpunkte basierend auf den Sätzen
    let homeMatchPoints = null
    let awayMatchPoints = null

    if (homeSets !== null && awaySets !== null) {
      // Hole die Punkteregeln aus der Liga
      const league = await prisma.league.findUnique({
        where: { id: fixture.leagueId },
        select: {
          pointsWin30: true,
          pointsWin31: true,
          pointsWin32: true,
          pointsLoss32: true
        }
      })

      if (league) {
        if (homeSets === 3 && awaySets === 0) {
          homeMatchPoints = league.pointsWin30
          awayMatchPoints = 0
        } else if (homeSets === 3 && awaySets === 1) {
          homeMatchPoints = league.pointsWin31
          awayMatchPoints = 0
        } else if (homeSets === 3 && awaySets === 2) {
          homeMatchPoints = league.pointsWin32
          awayMatchPoints = league.pointsLoss32
        } else if (homeSets === 2 && awaySets === 3) {
          homeMatchPoints = league.pointsLoss32
          awayMatchPoints = league.pointsWin32
        } else if (homeSets === 1 && awaySets === 3) {
          homeMatchPoints = 0
          awayMatchPoints = league.pointsWin31
        } else if (homeSets === 0 && awaySets === 3) {
          homeMatchPoints = 0
          awayMatchPoints = league.pointsWin30
        }
      }
    }

    // Fixture aktualisieren
    const updatedFixture = await prisma.fixture.update({
      where: { id: fixtureId },
      data: {
        homeSets,
        awaySets,
        homePoints,
        awayPoints,
        homeMatchPoints,
        awayMatchPoints,
        fixtureDate
      }
    })

    return NextResponse.json(updatedFixture)
  } catch (error) {
    console.error('Error updating fixture:', error)
    return NextResponse.json({ message: 'Ein Fehler ist aufgetreten' }, { status: 500 })
  }
}
