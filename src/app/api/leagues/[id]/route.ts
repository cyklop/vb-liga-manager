import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { ScoreEntryType } from '@prisma/client'; // Import the enum
import { createSlug, isValidSlug } from '@/lib/slugify';
// Importiere zentrale Typen für die Rückgabe
import type { LeagueDetails, Team, Fixture } from '@/types/models';

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const id = parseInt((await params).id)

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

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }>  }) {
  const id = parseInt((await params).id)
  const { 
    name, 
    slug: providedSlug,
    numberOfTeams, 
    hasReturnMatches, 
    teamIds,
    isActive,
    // Add point rules
    pointsWin30,
    pointsWin31,
    pointsWin32,
    pointsLoss32,
    // Add score entry config fields
    scoreEntryType,
    setsToWin
  } = await request.json()

  try {
    // Überprüfen, ob die Anzahl der ausgewählten Teams die maximale Anzahl überschreitet
    if (teamIds && teamIds.length > numberOfTeams) {
      return NextResponse.json(
        { message: `Es können maximal ${numberOfTeams} Teams zugewiesen werden` }, 
        { status: 400 }
      )
    }

    // Validate scoreEntryType if provided
    if (scoreEntryType !== undefined && !Object.values(ScoreEntryType).includes(scoreEntryType)) {
      return NextResponse.json(
        { message: 'Ungültiger Wert für scoreEntryType' },
        { status: 400 }
      )
    }

    // Validate setsToWin if provided (basic check)
    if (setsToWin !== undefined && (typeof setsToWin !== 'number' || setsToWin <= 0 || !Number.isInteger(setsToWin))) {
      return NextResponse.json(
        { message: 'setsToWin muss eine positive ganze Zahl sein' },
        { status: 400 }
      )
    }

    // Aktuelle Liga abrufen
    const currentLeague = await prisma.league.findUnique({
      where: { id }
    })
    
    if (!currentLeague) {
      return NextResponse.json({ message: 'Liga nicht gefunden' }, { status: 404 })
    }
    
    // Slug-Handling
    let finalSlug = currentLeague.slug
    
    // Wenn ein neuer Slug bereitgestellt wurde oder der Name geändert wurde
    if (providedSlug || (name !== currentLeague.name)) {
      finalSlug = providedSlug ? providedSlug.trim() : createSlug(name)
      
      // Slug-Validierung
      if (!isValidSlug(finalSlug)) {
        return NextResponse.json(
          { message: 'Der URL-Slug darf nur Kleinbuchstaben, Zahlen und Bindestriche enthalten' },
          { status: 400 }
        )
      }
      
      // Prüfen, ob der Slug bereits existiert (außer für die aktuelle Liga)
      const existingLeague = await prisma.league.findFirst({
        where: { 
          slug: finalSlug,
          id: { not: id }
        }
      })
      
      // Falls der Slug bereits existiert, eine Nummer anhängen
      let counter = 1
      while (existingLeague) {
        finalSlug = `${providedSlug ? providedSlug : createSlug(name)}-${counter}`
        counter++
        const checkLeague = await prisma.league.findFirst({
          where: { 
            slug: finalSlug,
            id: { not: id }
          }
        })
        if (!checkLeague) break
      }
    }

    // Zuerst alle bestehenden Team-Verbindungen entfernen
    await prisma.league.update({
      where: { id },
      data: {
        teams: {
          set: [] // Alle Team-Verbindungen entfernen
        }
      }
    })

    // Liga aktualisieren und neue Team-Verbindungen erstellen
    const updatedLeague = await prisma.league.update({
      where: { id },
      data: {
        name,
        slug: finalSlug,
        numberOfTeams,
        hasReturnMatches,
        isActive: isActive !== undefined ? isActive : undefined,
        // Update point rules - ensure they are numbers or use defaults/existing
        pointsWin30: pointsWin30 !== undefined ? Number(pointsWin30) : undefined,
        pointsWin31: pointsWin31 !== undefined ? Number(pointsWin31) : undefined,
        pointsWin32: pointsWin32 !== undefined ? Number(pointsWin32) : undefined,
        pointsLoss32: pointsLoss32 !== undefined ? Number(pointsLoss32) : undefined,
        // Update score entry config only if provided
        scoreEntryType: scoreEntryType !== undefined ? scoreEntryType : undefined,
        setsToWin: setsToWin !== undefined ? Number(setsToWin) : undefined,
        ...(teamIds && teamIds.length > 0 && {
          teams: {
            connect: teamIds.map((teamId: number) => ({ id: Number(teamId) })) // Ensure team IDs are numbers
          }
        })
      },
      include: {
        teams: true, // Behalte Teams für die Konvertierung
        fixtures: true // Behalte Fixtures für die Konvertierung
      }
    });

    // Konvertiere die aktualisierte Liga in LeagueDetails
    const responseLeague: LeagueDetails = {
      ...updatedLeague,
      teams: updatedLeague.teams.map(team => ({ // Map zu vollem Team-Typ
        id: team.id,
        name: team.name,
        // Füge hier ggf. weitere Felder aus dem zentralen Team-Typ hinzu
      })),
      fixtures: updatedLeague.fixtures.map(fixture => ({ // Map zu zentralem Fixture-Typ
        ...fixture,
        homeTeam: { id: fixture.homeTeamId, name: 'N/A' }, // Temporär
        awayTeam: { id: fixture.awayTeamId, name: 'N/A' }, // Temporär
      })) as Fixture[], // Cast zum zentralen Fixture-Typ
    };

    return NextResponse.json(responseLeague);
  } catch (error) {
    console.error('Error updating league:', error);
    return NextResponse.json({ message: 'Fehler beim Aktualisieren der Liga' }, { status: 500 })
  }
  // No finally block needed for singleton
}
