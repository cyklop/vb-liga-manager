import { NextResponse } from 'next/server'
import prisma from '../../../../lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '../../../../lib/auth'
import { ScoreEntryType, Fixture } from '@prisma/client' // Import ScoreEntryType and Fixture type

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
        teams: true, // Korrigiert von 'team' zu 'teams'
      },
    })
    
    if (!user) {
      return NextResponse.json({ message: 'Nicht autorisiert' }, { status: 401 })
    }

    // Fixture und zugehörige Liga-Daten abrufen
    const fixture = await prisma.fixture.findUnique({
      where: { id },
      include: {
        league: { // Liga-Daten für Regeln und Typ mitladen
          select: {
            scoreEntryType: true,
            setsToWin: true,
            pointsWin30: true,
            pointsWin31: true,
            pointsWin32: true,
            pointsLoss32: true,
          }
        }
      }
    })
    
    if (!fixture) {
      return NextResponse.json({ message: 'Spielpaarung nicht gefunden' }, { status: 404 })
    }

    // Wenn der Benutzer kein Admin/SuperAdmin ist, prüfen, ob er zum Heimteam gehört
    if (!user.isAdmin && !user.isSuperAdmin) {
      // Prüfen, ob der Benutzer überhaupt Teams hat
      if (!user.teams || user.teams.length === 0) {
          return NextResponse.json({ message: 'Benutzer ist keinem Team zugeordnet.' }, { status: 403 });
      }
      // Extrahieren der Team-IDs, denen der Benutzer zugeordnet ist.
      // Die Struktur von user.teams ist UserTeam[], wobei jedes Element { teamId: number, userId: number } enthält.
      const userTeamIds = user.teams.map(userTeam => userTeam.teamId); 

      if (!userTeamIds.includes(fixture.homeTeamId)) {
          return NextResponse.json({
              message: 'Sie sind nur berechtigt, Heimspiele Ihrer eigenen Mannschaft zu bearbeiten.'
          }, { status: 403 });
      }
    }

    // --- Read Request Body ---
    const {
      fixtureDate,
      fixtureTime,
      scoreData // Expecting { homeScore, awayScore } OR { setScores: [{home, away}, ...] }
    }: {
      fixtureDate?: string | null;
      fixtureTime?: string | null;
      scoreData?: {
        homeScore?: number | null;
        awayScore?: number | null;
        setScores?: Array<{ home: number | null, away: number | null }> | null;
      } | null;
    } = await request.json();

    // --- Prepare Update Data ---
    // Use Partial<Fixture> for type safety
    const updateData: Partial<Fixture> = {
      // Update date/time if provided
      fixtureDate: fixtureDate !== undefined ? (fixtureDate ? new Date(fixtureDate) : null) : undefined,
      fixtureTime: fixtureTime !== undefined ? (fixtureTime || null) : undefined,
      // Initialize score fields to null, they will be updated based on scoreData
      homeScore: null,
      awayScore: null,
      homeSet1: null, awaySet1: null,
      homeSet2: null, awaySet2: null,
      homeSet3: null, awaySet3: null,
      homeSet4: null, awaySet4: null,
      homeSet5: null, awaySet5: null,
      homeMatchPoints: null,
      awayMatchPoints: null,
    };

    // --- Process Score Data if provided ---
    if (scoreData) {
      const leagueRules = fixture.league;
      const { scoreEntryType, setsToWin } = leagueRules;

      let finalHomeScore: number | null = null;
      let finalAwayScore: number | null = null;

      // --- Case 1: MATCH_SCORE ---
      if (scoreEntryType === ScoreEntryType.MATCH_SCORE) {
        const { homeScore, awayScore } = scoreData;

        // Validate input scores
        if (homeScore === null || homeScore === undefined || awayScore === null || awayScore === undefined) {
          return NextResponse.json({ message: 'Bei Eingabe des Gesamtergebnisses müssen beide Werte (Heim/Gast) angegeben werden.' }, { status: 400 });
        }
        const hs = Number(homeScore);
        const as = Number(awayScore);
        if (isNaN(hs) || isNaN(as) || hs < 0 || as < 0 || !Number.isInteger(hs) || !Number.isInteger(as)) {
          return NextResponse.json({ message: 'Ungültige Satzwerte. Nur positive ganze Zahlen erlaubt.' }, { status: 400 });
        }
        if (!((hs === setsToWin && as < setsToWin) || (as === setsToWin && hs < setsToWin))) {
          return NextResponse.json({ message: `Ungültiges Gesamtergebnis. Ein Team muss genau ${setsToWin} Sätze gewinnen, das andere weniger.` }, { status: 400 });
        }

        finalHomeScore = hs;
        finalAwayScore = as;
        // Clear individual set scores
        for (let i = 1; i <= 5; i++) {
          updateData[`homeSet${i}` as keyof Fixture] = null;
          updateData[`awaySet${i}` as keyof Fixture] = null;
        }

      // --- Case 2: SET_SCORES ---
      } else if (scoreEntryType === ScoreEntryType.SET_SCORES) {
        const { setScores } = scoreData;
        if (!setScores || !Array.isArray(setScores)) {
          return NextResponse.json({ message: 'Bei Eingabe von Satzergebnissen muss ein Array `setScores` übergeben werden.' }, { status: 400 });
        }

        let calculatedHomeSets = 0;
        let calculatedAwaySets = 0;
        const maxSets = 2 * setsToWin - 1; // e.g., 5 for Bo5, 3 for Bo3

        if (setScores.length > maxSets) {
          return NextResponse.json({ message: `Es können maximal ${maxSets} Sätze eingegeben werden.` }, { status: 400 });
        }

        for (let i = 0; i < setScores.length; i++) {
          const set = setScores[i];
          const setIndex = i + 1;

          // Allow null/empty inputs for sets not played yet
          if ((set.home === null || set.home === undefined || String(set.home).trim() === '') &&
              (set.away === null || set.away === undefined || String(set.away).trim() === '')) {
             updateData[`homeSet${setIndex}` as keyof Fixture] = null;
             updateData[`awaySet${setIndex}` as keyof Fixture] = null;
             continue; // Skip validation if set is empty
          }

          // If one value is entered, the other must be too
          if ((set.home === null || set.home === undefined || String(set.home).trim() === '') ||
              (set.away === null || set.away === undefined || String(set.away).trim() === '')) {
             return NextResponse.json({ message: `Satz ${setIndex}: Beide Punktwerte (Heim/Gast) müssen angegeben werden.` }, { status: 400 });
          }

          const homePoints = Number(set.home);
          const awayPoints = Number(set.away);

          // Basic validation: positive integers
          if (isNaN(homePoints) || isNaN(awayPoints) || homePoints < 0 || awayPoints < 0 || !Number.isInteger(homePoints) || !Number.isInteger(awayPoints)) {
            return NextResponse.json({ message: `Satz ${setIndex}: Ungültige Punktwerte. Nur positive ganze Zahlen erlaubt.` }, { status: 400 });
          }

          // Volleyball Score Validation
          const isTieBreak = setIndex === (2 * setsToWin - 1); // e.g., 5th set in Bo5, 3rd set in Bo3
          const minPoints = isTieBreak ? 15 : 25;
          const winnerPoints = Math.max(homePoints, awayPoints);
          const loserPoints = Math.min(homePoints, awayPoints);

          if (winnerPoints < minPoints) {
            // Winner must reach minimum points
            return NextResponse.json({ message: `Satz ${setIndex}: Das siegreiche Team muss mindestens ${minPoints} Punkte erreichen.` }, { status: 400 });
          }
          if (winnerPoints === minPoints && loserPoints > winnerPoints - 2) {
             // If winner reached exactly minPoints, loser must have max minPoints - 2
             return NextResponse.json({ message: `Satz ${setIndex}: Bei ${minPoints} Punkten muss der Unterschied mindestens 2 Punkte betragen.` }, { status: 400 });
          }
          if (winnerPoints > minPoints && winnerPoints - loserPoints !== 2) {
            // If winner has more than minPoints, difference must be exactly 2
            return NextResponse.json({ message: `Satz ${setIndex}: Bei über ${minPoints} Punkten muss der Unterschied genau 2 Punkte betragen.` }, { status: 400 });
          }
          // End Volleyball Score Validation

          updateData[`homeSet${setIndex}` as keyof Fixture] = homePoints;
          updateData[`awaySet${setIndex}` as keyof Fixture] = awayPoints;

          if (homePoints > awayPoints) {
            calculatedHomeSets++;
          } else if (awayPoints > homePoints) {
            calculatedAwaySets++;
          } else {
             // Draw in a set is not allowed
             return NextResponse.json({ message: `Satz ${setIndex}: Unentschieden (${homePoints}:${awayPoints}) ist nicht erlaubt.` }, { status: 400 });
          }

          // Check if match finished early
          if (calculatedHomeSets === setsToWin || calculatedAwaySets === setsToWin) {
            if (i < setScores.length - 1) {
              // Check if subsequent sets have scores entered
              for (let j = i + 1; j < setScores.length; j++) {
                 const nextSet = setScores[j];
                 if ((nextSet.home !== null && nextSet.home !== undefined && String(nextSet.home).trim() !== '') ||
                     (nextSet.away !== null && nextSet.away !== undefined && String(nextSet.away).trim() !== '')) {
                    return NextResponse.json({ message: `Das Spiel endete in Satz ${setIndex}. Nachfolgende Sätze dürfen keine Ergebnisse enthalten.` }, { status: 400 });
                 } else {
                    // Ensure subsequent set fields are null in updateData
                    updateData[`homeSet${j + 1}` as keyof Fixture] = null;
                    updateData[`awaySet${j + 1}` as keyof Fixture] = null;
                 }
              }
            }
            break; // Stop processing sets after match is won
          }
        }

        // Final validation after processing all sets
        if (!(calculatedHomeSets === setsToWin || calculatedAwaySets === setsToWin)) {
           // Check if enough sets were provided to potentially finish the match
           const minSetsPlayed = Math.max(calculatedHomeSets, calculatedAwaySets);
           if (minSetsPlayed < setsToWin && setScores.length < maxSets) {
              // Potentially incomplete result, but allow saving if some sets are entered
              // Or require full result? For now, allow partial saving.
           } else if (setScores.length === maxSets && calculatedHomeSets !== setsToWin && calculatedAwaySets !== setsToWin) {
              // Played max sets but no winner according to setsToWin
              return NextResponse.json({ message: `Ungültiges Endergebnis nach ${maxSets} Sätzen (${calculatedHomeSets}:${calculatedAwaySets}). Ein Team muss ${setsToWin} Sätze gewinnen.` }, { status: 400 });
           } else if (calculatedHomeSets !== setsToWin && calculatedAwaySets !== setsToWin) {
              // Not enough sets won, and not max sets played (e.g. 2:1 in Bo5) - might be incomplete
              // Allow saving for now. Frontend should indicate completeness.
           }
        }

        finalHomeScore = calculatedHomeSets;
        finalAwayScore = calculatedAwaySets;

        // Clear remaining set fields if match finished early
        for (let i = setScores.length + 1; i <= 5; i++) {
           updateData[`homeSet${i}` as keyof Fixture] = null;
           updateData[`awaySet${i}` as keyof Fixture] = null;
        }

      } else {
        return NextResponse.json({ message: 'Unbekannter scoreEntryType für die Liga.' }, { status: 500 });
      }

      // --- Calculate Match Points (Common Logic) ---
      if (finalHomeScore !== null && finalAwayScore !== null) {
        updateData.homeScore = finalHomeScore;
        updateData.awayScore = finalAwayScore;

        const rules = leagueRules;
        let homePoints = 0;
        let awayPoints = 0;

        if (finalHomeScore === setsToWin && finalAwayScore < setsToWin) { // Home wins
          if (setsToWin === 3) { // Best-of-5 logic
            if (finalAwayScore === 0) homePoints = rules.pointsWin30;
            else if (finalAwayScore === 1) homePoints = rules.pointsWin31;
            else if (finalAwayScore === 2) { homePoints = rules.pointsWin32; awayPoints = rules.pointsLoss32; }
          } else if (setsToWin === 2) { // Best-of-3 logic (assuming similar rules for 2:0 and 2:1)
             if (finalAwayScore === 0) homePoints = rules.pointsWin30; // Use pointsWin30 for 2:0
             else if (finalAwayScore === 1) homePoints = rules.pointsWin31; // Use pointsWin31 for 2:1 (or maybe pointsWin32?) - Clarify rules if Bo3 needed
             // Need rules for 2:1 loss? Assuming 0 for now.
          }
        } else if (finalAwayScore === setsToWin && finalHomeScore < setsToWin) { // Away wins
          if (setsToWin === 3) { // Best-of-5 logic
            if (finalHomeScore === 0) awayPoints = rules.pointsWin30;
            else if (finalHomeScore === 1) awayPoints = rules.pointsWin31;
            else if (finalHomeScore === 2) { awayPoints = rules.pointsWin32; homePoints = rules.pointsLoss32; }
          } else if (setsToWin === 2) { // Best-of-3 logic
             if (finalHomeScore === 0) awayPoints = rules.pointsWin30; // Use pointsWin30 for 0:2
             else if (finalHomeScore === 1) awayPoints = rules.pointsWin31; // Use pointsWin31 for 1:2
             // Need rules for 1:2 loss? Assuming 0 for now.
          }
        }
        updateData.homeMatchPoints = homePoints;
        updateData.awayMatchPoints = awayPoints;
      } else {
         // If scores couldn't be determined (e.g., incomplete SET_SCORES), clear points
         updateData.homeScore = null;
         updateData.awayScore = null;
         updateData.homeMatchPoints = null;
         updateData.awayMatchPoints = null;
      }
    } // End of if(scoreData)

    // --- Update Database ---
    // Filter out undefined values from updateData before sending to Prisma
    const finalUpdateData = Object.fromEntries(
      Object.entries(updateData).filter(([_, v]) => v !== undefined)
    );

    const updatedFixture = await prisma.fixture.update({
      where: { id },
      data: finalUpdateData,
      include: { // Include teams and league to return updated data
        homeTeam: { select: { id: true, name: true } },
        awayTeam: { select: { id: true, name: true } },
        league: { select: { scoreEntryType: true, setsToWin: true } } // Include league info for frontend
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
