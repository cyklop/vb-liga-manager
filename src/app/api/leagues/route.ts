import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma'; // Import the singleton instance
import { ScoreEntryType } from '@prisma/client'; // Import the enum
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
// Importiere Service-Funktionen und Typen
import { getAllLeaguesOverview, createLeague, type CreateLeagueData } from '@/services/leagueService';
import type { LeagueOverview, LeagueDetails } from '@/types/models';

export async function GET(request: Request) {
  // URL-Parameter auslesen
  const { searchParams } = new URL(request.url)
  const teamIdParam = searchParams.get('teamId');
  const teamId = teamIdParam ? parseInt(teamIdParam) : undefined;
  if (teamIdParam && isNaN(teamId!)) {
      return NextResponse.json({ message: 'Ungültige Team-ID' }, { status: 400 });
  }

  try {
    // Rufe Service-Funktion auf
    const leagues = await getAllLeaguesOverview(teamId);
    return NextResponse.json(leagues);

  } catch (error) {
    console.error('Fehler beim Abrufen der Ligen (API):', error);
    return NextResponse.json({ message: 'Ein Fehler ist aufgetreten' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  // Benutzerberechtigungen prüfen
  const session = await getServerSession(authOptions)
  if (!session || !session.user?.email) {
    return NextResponse.json({ message: 'Nicht authentifiziert' }, { status: 401 })
  }
  
  // Benutzerberechtigungen prüfen (bereits oben)

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
    setsToWin = 3, // Default to 3 sets to win (Best-of-5)
  } = await request.json();

  // --- Validierung ---
  if (!name || !numberOfTeams) {
      return NextResponse.json({ message: 'Name und Anzahl der Teams sind erforderlich.' }, { status: 400 });
  }
  if (teamIds && teamIds.length > numberOfTeams) {
    return NextResponse.json({ message: `Es können maximal ${numberOfTeams} Teams zugewiesen werden.` }, { status: 400 });
  }
  if (!Object.values(ScoreEntryType).includes(scoreEntryType)) {
    return NextResponse.json({ message: 'Ungültiger Wert für scoreEntryType.' }, { status: 400 });
  }
  if (typeof setsToWin !== 'number' || setsToWin <= 0 || !Number.isInteger(setsToWin)) {
    return NextResponse.json({ message: 'setsToWin muss eine positive ganze Zahl sein.' }, { status: 400 });
  }
  // --- Ende Validierung ---

  const createData: CreateLeagueData = {
    name,
    slug: providedSlug, // Service kümmert sich um Generierung/Validierung
    numberOfTeams,
    hasReturnMatches,
    teamIds: teamIds?.map(Number), // Stelle sicher, dass IDs Zahlen sind
    pointsWin30: Number(pointsWin30),
    pointsWin31: Number(pointsWin31),
    pointsWin32: Number(pointsWin32),
    pointsLoss32: Number(pointsLoss32),
    scoreEntryType,
    setsToWin: Number(setsToWin),
  };

  try {
    // Rufe Service-Funktion auf
    const newLeague = await createLeague(createData);
    return NextResponse.json(newLeague, { status: 201 });

  } catch (error) {
    console.error('Fehler beim Erstellen der Liga (API):', error);
    // Handle spezifische Fehler vom Service
    if (error instanceof Error && error.message.includes('Slug')) {
        return NextResponse.json({ message: error.message }, { status: 400 });
    }
    return NextResponse.json({ message: 'Fehler beim Erstellen der Liga' }, { status: 400 })
  }
}
