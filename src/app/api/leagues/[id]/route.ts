import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { ScoreEntryType } from '@prisma/client'; // Import the enum
import { createSlug, isValidSlug } from '@/lib/slugify';
// Importiere zentrale Typen für die Rückgabe
import type { LeagueDetails, Team, Fixture, TeamBasicInfo } from '@/types/models'; // Füge TeamBasicInfo hinzu

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const id = parseInt((await params).id);
  if (isNaN(id)) {
    return NextResponse.json({ message: 'Ungültige Liga-ID' }, { status: 400 });
  }

  try {
    const league = await prisma.league.findUnique({
      where: { id },
      include: {
        teams: { // Lade volle Team-Daten für Mapping
          include: {
            teamLeader: { select: { id: true, name: true } } // Beispiel: Lade Teamleiter-Basisinfos
          }
        },
        fixtures: { // Lade Fixtures mit Basis-Team-Infos
          include: {
            homeTeam: { select: { id: true, name: true } },
            awayTeam: { select: { id: true, name: true } }
          },
          orderBy: { order: 'asc' } // Sortiere Fixtures nach Reihenfolge
        }
      }
    });

    if (!league) {
      return NextResponse.json({ message: 'Liga nicht gefunden' }, { status: 404 });
    }

    // Konvertiere die Liga in LeagueDetails
    const responseLeague: LeagueDetails = {
      ...league,
      teams: league.teams.map(team => ({ // Map zu vollem Team-Typ
        id: team.id,
        name: team.name,
        location: team.location,
        hallAddress: team.hallAddress,
        trainingTimes: team.trainingTimes,
        teamLeader: team.teamLeader ? { // Map zu UserProfile
          id: team.teamLeader.id,
          name: team.teamLeader.name,
        } : null,
      })),
      fixtures: league.fixtures.map(fixture => ({ // Map zu zentralem Fixture-Typ
        ...fixture,
        // Stelle sicher, dass homeTeam/awayTeam das TeamBasicInfo-Format haben
        homeTeam: fixture.homeTeam as TeamBasicInfo,
        awayTeam: fixture.awayTeam as TeamBasicInfo,
      })) as Fixture[], // Cast zum zentralen Fixture-Typ
    };

    return NextResponse.json(responseLeague);

  } catch (error) {
    console.error(`Error fetching league details for ID ${id}:`, error);
    return NextResponse.json({ message: 'Fehler beim Abrufen der Liga-Details' }, { status: 500 });
  }
}


export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const id = parseInt((await params).id);

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
        location: team.location, // Beispiel
        hallAddress: team.hallAddress, // Beispiel
        trainingTimes: team.trainingTimes, // Beispiel
      })),
      fixtures: updatedLeague.fixtures.map(fixture => { // Map zu zentralem Fixture-Typ
        const homeTeam = updatedLeague.teams.find(t => t.id === fixture.homeTeamId);
        const awayTeam = updatedLeague.teams.find(t => t.id === fixture.awayTeamId);
        return {
          ...fixture,
          homeTeam: { id: fixture.homeTeamId, name: homeTeam?.name || 'N/A' }, // Hole Namen
          awayTeam: { id: fixture.awayTeamId, name: awayTeam?.name || 'N/A' }, // Hole Namen
        };
      }) as Fixture[], // Cast zum zentralen Fixture-Typ
    };

    return NextResponse.json(responseLeague);
  } catch (error) {
    console.error('Error updating league:', error);
    return NextResponse.json({ message: 'Fehler beim Aktualisieren der Liga' }, { status: 500 })
  }
  // No finally block needed for singleton
}
