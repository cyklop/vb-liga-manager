import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma'; // Import the singleton instance
import { ScoreEntryType } from '@prisma/client'; // Import the enum
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth'; // Corrected import path
import { createSlug, isValidSlug } from '@/lib/slugify';
// Importiere zentrale Typen für die Rückgabe
import type { LeagueOverview, LeagueDetails, TeamBasicInfo, Fixture } from '@/types/models';

export async function GET(request: Request) {
  // URL-Parameter auslesen
  const { searchParams } = new URL(request.url)
  const teamId = searchParams.get('teamId')

  try {
    let leagues;
    
    if (teamId) {
      // Nur Ligen abrufen, in denen das angegebene Team spielt
      const teamIdNumber = parseInt(teamId)
      leagues = await prisma.league.findMany({
        where: {
          teams: {
            some: {
              id: teamIdNumber
            }
          }
        },
        include: {
          teams: {
            select: {
              id: true,
              name: true
            }
          }
          // Entferne fixtures include, da sie nicht mehr für Overview benötigt werden
          // fixtures: {
          //   include: {
          //     homeTeam: {
          //       select: { id: true, name: true }
          //     },
          //     awayTeam: {
          //       select: { id: true, name: true }
          //     }
          //   }
          // }
        },
        orderBy: {
          createdAt: 'desc'
              },
              awayTeam: {
                select: { id: true, name: true }
              }
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        }
      })
    } else {
      // Alle Ligen abrufen
      leagues = await prisma.league.findMany({
        include: {
          teams: {
            select: {
              id: true,
              name: true
            }
          }
          // Entferne fixtures include
          // fixtures: {
          //   include: {
          //     homeTeam: {
          //       select: { id: true, name: true }
          //     },
          //     awayTeam: {
          //       select: { id: true, name: true }
          //     }
          //   }
          // }
        },
        orderBy: {
          createdAt: 'desc'
              },
              awayTeam: {
                select: { id: true, name: true }
              }
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        }
      });
    }

    // Konvertiere Prisma-Ligen in LeagueOverview
    const responseLeagues: LeagueOverview[] = leagues.map(league => ({
      ...league,
      teams: league.teams.map(team => ({ id: team.id, name: team.name })), // Map zu TeamBasicInfo
      // Entferne fixtures Mapping
      // fixtures: league.fixtures?.map(f => ({ id: f.id })) as Pick<Fixture, 'id'>[] | undefined,
    }));

    return NextResponse.json(responseLeagues);
  } catch (error) {
    console.error('Error fetching leagues:', error);
    return NextResponse.json({ message: 'Ein Fehler ist aufgetreten' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  // Benutzerberechtigungen prüfen
  const session = await getServerSession(authOptions)
  if (!session || !session.user?.email) {
    return NextResponse.json({ message: 'Nicht authentifiziert' }, { status: 401 })
  }
  
  // Benutzer abrufen
  const currentUser = await prisma.user.findUnique({
    where: { email: session.user.email },
  })
  
  if (!currentUser || (!currentUser.isAdmin && !currentUser.isSuperAdmin)) {
    return NextResponse.json({ message: 'Nicht autorisiert' }, { status: 403 })
  }

  const { 
    name, 
    slug: providedSlug,
    numberOfTeams, 
    hasReturnMatches, 
    teamIds,
    // Add point rules, defaulting if not provided
    pointsWin30 = 3,
    pointsWin31 = 3,
    pointsWin32 = 2,
    pointsLoss32 = 1,
    // New fields for score entry configuration
    scoreEntryType = ScoreEntryType.MATCH_SCORE, // Default to match score
    setsToWin = 3 // Default to 3 sets to win (Best-of-5)
  } = await request.json()

  try {
    // Überprüfen, ob die Anzahl der ausgewählten Teams die maximale Anzahl überschreitet
    if (teamIds && teamIds.length > numberOfTeams) {
      return NextResponse.json(
        { message: `Es können maximal ${numberOfTeams} Teams zugewiesen werden` }, 
        { status: 400 }
      )
    }

    // Validate scoreEntryType
    if (!Object.values(ScoreEntryType).includes(scoreEntryType)) {
      return NextResponse.json(
        { message: 'Ungültiger Wert für scoreEntryType' },
        { status: 400 }
      )
    }

    // Validate setsToWin (basic check)
    if (typeof setsToWin !== 'number' || setsToWin <= 0 || !Number.isInteger(setsToWin)) {
      return NextResponse.json(
        { message: 'setsToWin muss eine positive ganze Zahl sein' },
        { status: 400 }
      )
    }

    // Slug generieren oder validieren
    let finalSlug = providedSlug ? providedSlug.trim() : createSlug(name)
    
    // Slug-Validierung
    if (!isValidSlug(finalSlug)) {
      return NextResponse.json(
        { message: 'Der URL-Slug darf nur Kleinbuchstaben, Zahlen und Bindestriche enthalten' },
        { status: 400 }
      )
    }
    
    // Prüfen, ob der Slug bereits existiert
    const existingLeague = await prisma.league.findUnique({
      where: { slug: finalSlug }
    })
    
    // Falls der Slug bereits existiert, eine Nummer anhängen
    let counter = 1
    while (existingLeague) {
      finalSlug = `${providedSlug ? providedSlug : createSlug(name)}-${counter}`
      counter++
      const checkLeague = await prisma.league.findUnique({
        where: { slug: finalSlug }
      })
      if (!checkLeague) break
    }

    const league = await prisma.league.create({
      data: {
        name,
        slug: finalSlug,
        numberOfTeams,
        hasReturnMatches,
        pointsWin30: Number(pointsWin30), // Ensure numbers
        pointsWin31: Number(pointsWin31),
        pointsWin32: Number(pointsWin32),
        pointsLoss32: Number(pointsLoss32),
        scoreEntryType, // Add new field
        setsToWin: Number(setsToWin), // Add new field, ensure number
        ...(teamIds && teamIds.length > 0 && {
          teams: {
            connect: teamIds.map((id: number) => ({ id: Number(id) })) // Ensure team IDs are numbers
          }
        })
      },
      include: {
        teams: true, // Behalte Teams für die Konvertierung
        fixtures: true // Behalte Fixtures für die Konvertierung
      }
    });

    // Konvertiere die erstellte Liga in LeagueDetails
    const responseLeague: LeagueDetails = {
      ...league,
      teams: league.teams.map(team => ({ // Map zu vollem Team-Typ (oder TeamBasicInfo, falls ausreichend)
        id: team.id,
        name: team.name,
        // Füge hier ggf. weitere Felder aus dem zentralen Team-Typ hinzu
        location: team.location, // Beispiel: Füge location hinzu, falls im Team-Typ definiert
        hallAddress: team.hallAddress, // Beispiel
        trainingTimes: team.trainingTimes, // Beispiel
      })),
      fixtures: league.fixtures.map(fixture => { // Map zu zentralem Fixture-Typ
        const homeTeam = league.teams.find(t => t.id === fixture.homeTeamId);
        const awayTeam = league.teams.find(t => t.id === fixture.awayTeamId);
        return {
          ...fixture,
          homeTeam: { id: fixture.homeTeamId, name: homeTeam?.name || 'N/A' }, // Hole Namen aus league.teams
          awayTeam: { id: fixture.awayTeamId, name: awayTeam?.name || 'N/A' }, // Hole Namen aus league.teams
        };
      }) as Fixture[], // Cast zum zentralen Fixture-Typ
    };

    return NextResponse.json(responseLeague, { status: 201 });
  } catch (error) {
    console.error('Error creating league:', error);
    return NextResponse.json({ message: 'Fehler beim Erstellen der Liga' }, { status: 400 })
  }
}
