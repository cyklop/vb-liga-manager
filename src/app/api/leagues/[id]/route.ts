import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { ScoreEntryType } from '@prisma/client'; // Import the enum
import { createSlug, isValidSlug } from '@/lib/slugify'; // Wird im Service verwendet
import { getServerSession } from 'next-auth/next'; // Import für Auth-Check
import { authOptions } from '@/lib/auth'; // Import für Auth-Check
// Importiere Service-Funktionen und Typen
import { getLeagueDetailsById, deleteLeague, updateLeague, type UpdateLeagueData } from '@/services/leagueService';
import type { LeagueDetails } from '@/types/models';

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const idParam = (await params).id;
  const id = parseInt(idParam);
  if (isNaN(id)) {
    return NextResponse.json({ message: 'Ungültige Liga-ID' }, { status: 400 });
  }

  try {
    // Rufe Service-Funktion auf
    const leagueDetails = await getLeagueDetailsById(id);

    if (!leagueDetails) {
      return NextResponse.json({ message: 'Liga nicht gefunden' }, { status: 404 });
    }

    return NextResponse.json(leagueDetails);

  } catch (error) {
    console.error(`Fehler beim Abrufen der Liga-Details für ID ${id} (API):`, error);
    return NextResponse.json({ message: 'Fehler beim Abrufen der Liga-Details' }, { status: 500 });
  }
}


export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  // --- Berechtigungsprüfung (Beispiel: Nur Admins) ---
  const session = await getServerSession(authOptions);
  if (!session?.user?.isAdmin) {
      return NextResponse.json({ message: 'Nicht autorisiert' }, { status: 403 });
  }
  // --- Ende Berechtigungsprüfung ---

  const idParam = (await params).id;
  const id = parseInt(idParam);
  if (isNaN(id)) {
    return NextResponse.json({ message: 'Ungültige Liga-ID' }, { status: 400 });
  }

  try {
    // Rufe Service-Funktion auf
    await deleteLeague(id);
    return NextResponse.json({ message: 'Liga erfolgreich gelöscht' });

  } catch (error) {
    console.error('Fehler beim Löschen der Liga (API):', error);
    // Handle spezifische Fehler vom Service
    if (error instanceof Error && error.message.includes('Spielpläne existieren')) {
        return NextResponse.json({ message: error.message }, { status: 409 }); // Conflict
    }
    return NextResponse.json({ message: 'Fehler beim Löschen der Liga' }, { status: 500 })
  } 
  // No finally block needed for singleton
}

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  // --- Berechtigungsprüfung (Beispiel: Nur Admins) ---
  const session = await getServerSession(authOptions);
  if (!session?.user?.isAdmin) {
      return NextResponse.json({ message: 'Nicht autorisiert' }, { status: 403 });
  }
  // --- Ende Berechtigungsprüfung ---

  const idParam = (await params).id;
  const id = parseInt(idParam);
  if (isNaN(id)) {
    return NextResponse.json({ message: 'Ungültige Liga-ID' }, { status: 400 });
  }

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
    setsToWin,
  } = await request.json();

  // --- Validierung ---
  if (numberOfTeams !== undefined && teamIds && teamIds.length > numberOfTeams) {
    return NextResponse.json({ message: `Es können maximal ${numberOfTeams} Teams zugewiesen werden.` }, { status: 400 });
  }
  if (scoreEntryType !== undefined && !Object.values(ScoreEntryType).includes(scoreEntryType)) {
    return NextResponse.json({ message: 'Ungültiger Wert für scoreEntryType.' }, { status: 400 });
  }
  if (setsToWin !== undefined && (typeof setsToWin !== 'number' || setsToWin <= 0 || !Number.isInteger(setsToWin))) {
    return NextResponse.json({ message: 'setsToWin muss eine positive ganze Zahl sein.' }, { status: 400 });
  }
  // --- Ende Validierung ---

  const updateData: UpdateLeagueData = {
    name,
    slug: providedSlug, // Service kümmert sich um Validierung/Generierung
    numberOfTeams,
    hasReturnMatches,
    teamIds: teamIds?.map(Number), // Stelle sicher, dass IDs Zahlen sind
    isActive,
    pointsWin30: pointsWin30 !== undefined ? Number(pointsWin30) : undefined,
    pointsWin31: pointsWin31 !== undefined ? Number(pointsWin31) : undefined,
    pointsWin32: pointsWin32 !== undefined ? Number(pointsWin32) : undefined,
    pointsLoss32: pointsLoss32 !== undefined ? Number(pointsLoss32) : undefined,
    scoreEntryType,
    setsToWin: setsToWin !== undefined ? Number(setsToWin) : undefined,
  };

  try {
    // Rufe Service-Funktion auf
    const updatedLeague = await updateLeague(id, updateData);

    if (!updatedLeague) {
      return NextResponse.json({ message: 'Liga nicht gefunden' }, { status: 404 });
    }

    return NextResponse.json(updatedLeague);

  } catch (error) {
    console.error('Fehler beim Aktualisieren der Liga (API):', error);
    // Handle spezifische Fehler vom Service
    if (error instanceof Error && error.message.includes('Slug')) {
        return NextResponse.json({ message: error.message }, { status: 400 });
    }
    return NextResponse.json({ message: 'Fehler beim Aktualisieren der Liga' }, { status: 500 })
  }
  // No finally block needed for singleton
}
