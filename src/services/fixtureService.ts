import { Prisma, ScoreEntryType, Fixture as PrismaFixture } from '@prisma/client';
import prisma from '@/lib/prisma';
import type { Fixture, TeamBasicInfo } from '@/types/models';

// --- Hilfsfunktion für Mapping (angepasst) ---
// Nimmt ein Prisma Fixture mit eingeschlossenen Team- und Liga-Infos
function mapPrismaFixtureToFixture(
    dbFixture: Prisma.FixtureGetPayload<{
        include: {
            homeTeam: { select: { id: true, name: true } },
            awayTeam: { select: { id: true, name: true } },
            league: { select: { scoreEntryType: true, setsToWin: true } } // Liga-Infos für Kontext
        }
    }>
): Fixture {
    const homeTeamInfo: TeamBasicInfo = dbFixture.homeTeam
        ? { id: dbFixture.homeTeam.id, name: dbFixture.homeTeam.name }
        : { id: dbFixture.homeTeamId, name: 'N/A' }; // Fallback
    const awayTeamInfo: TeamBasicInfo = dbFixture.awayTeam
        ? { id: dbFixture.awayTeam.id, name: dbFixture.awayTeam.name }
        : { id: dbFixture.awayTeamId, name: 'N/A' }; // Fallback

    return {
        id: dbFixture.id,
        leagueId: dbFixture.leagueId,
        round: dbFixture.round,
        matchday: dbFixture.matchday,
        homeTeamId: dbFixture.homeTeamId,
        homeTeam: homeTeamInfo,
        awayTeamId: dbFixture.awayTeamId,
        awayTeam: awayTeamInfo,
        fixtureDate: dbFixture.fixtureDate?.toISOString() || null,
        fixtureTime: dbFixture.fixtureTime,
        homeScore: dbFixture.homeScore,
        awayScore: dbFixture.awayScore,
        homeSet1: dbFixture.homeSet1, awaySet1: dbFixture.awaySet1,
        homeSet2: dbFixture.homeSet2, awaySet2: dbFixture.awaySet2,
        homeSet3: dbFixture.homeSet3, awaySet3: dbFixture.awaySet3,
        homeSet4: dbFixture.homeSet4, awaySet4: dbFixture.awaySet4,
        homeSet5: dbFixture.homeSet5, awaySet5: dbFixture.awaySet5,
        homeMatchPoints: dbFixture.homeMatchPoints,
        awayMatchPoints: dbFixture.awayMatchPoints,
        homePoints: dbFixture.homePoints,
        awayPoints: dbFixture.awayPoints,
        order: dbFixture.order,
        // Optional: Füge Liga-Kontext hinzu, falls im Fixture-Typ benötigt
        // league: {
        //     scoreEntryType: dbFixture.league.scoreEntryType,
        //     setsToWin: dbFixture.league.setsToWin,
        // }
    };
}


// --- Service-Funktionen ---

/**
 * Ruft Fixtures für eine bestimmte Liga ab, optional gefiltert nach "upcoming".
 */
export async function getFixturesByLeagueId(leagueId: number, showUpcoming: boolean): Promise<Fixture[]> {
    const query: Prisma.FixtureFindManyArgs = {
        where: { leagueId },
        include: {
            homeTeam: { select: { id: true, name: true } },
            awayTeam: { select: { id: true, name: true } },
            league: { select: { scoreEntryType: true, setsToWin: true } } // Liga-Infos für Mapping
        },
        orderBy: [
            { matchday: 'asc' },
            { order: 'asc' },
        ],
    };

    if (showUpcoming) {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        query.where = {
            ...query.where,
            OR: [
                { fixtureDate: { gte: today } },
                { homeScore: null },
                { awayScore: null },
            ],
            AND: [
                { OR: [{ homeScore: null }, { awayScore: null }] }
            ]
        };
    }

    const dbFixtures = await prisma.fixture.findMany(query);
    // Mappe jedes dbFixture. Beachte, dass mapPrismaFixtureToFixture die Liga-Infos erwartet.
    return dbFixtures.map(dbFixture => mapPrismaFixtureToFixture(dbFixture));
}

/**
 * Ruft Fixtures für ein bestimmtes Team ab.
 */
export async function getFixturesByTeamId(teamId: number, homeOnly: boolean): Promise<Fixture[]> {
    const whereClause: Prisma.FixtureWhereInput = homeOnly
        ? { homeTeamId: teamId }
        : { OR: [{ homeTeamId: teamId }, { awayTeamId: teamId }] };

    const dbFixtures = await prisma.fixture.findMany({
        where: whereClause,
        include: {
            homeTeam: { select: { id: true, name: true } },
            awayTeam: { select: { id: true, name: true } },
            league: { select: { scoreEntryType: true, setsToWin: true } }
        },
        orderBy: [
            { matchday: 'asc' },
            { fixtureDate: 'asc' },
            { order: 'asc' }
        ]
    });
    return dbFixtures.map(dbFixture => mapPrismaFixtureToFixture(dbFixture));
}

/**
 * Aktualisiert eine einzelne Fixture.
 * Enthält Logik zur Score-Validierung und Punkteberechnung.
 */
export type UpdateFixtureData = {
    homeTeamId?: number | null;
    awayTeamId?: number | null;
    fixtureDate?: string | null;
    fixtureTime?: string | null;
    scoreData?: {
        homeScore?: number | null;
        awayScore?: number | null;
        homePoints?: number | null;
        awayPoints?: number | null;
        setScores?: Array<{ home: number | null, away: number | null }> | null;
    } | null;
};
export async function updateFixture(id: number, data: UpdateFixtureData): Promise<Fixture | null> {
    try {
        // 1. Fixture und zugehörige Liga-Regeln abrufen
        const fixture = await prisma.fixture.findUnique({
            where: { id },
            include: {
                league: {
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
        });

        if (!fixture) {
            return null; // Fixture nicht gefunden
        }
        const leagueRules = fixture.league;

        // 2. Update-Payload vorbereiten
        const updatePayload: Prisma.FixtureUpdateInput = {};

        // Update Teams (falls vorhanden)
        if (data.homeTeamId !== undefined) updatePayload.homeTeam = { connect: { id: Number(data.homeTeamId) } };
        if (data.awayTeamId !== undefined) updatePayload.awayTeam = { connect: { id: Number(data.awayTeamId) } };

        // Update Datum/Zeit (falls vorhanden)
        if (data.fixtureDate !== undefined) updatePayload.fixtureDate = data.fixtureDate ? new Date(data.fixtureDate) : null;
        if (data.fixtureTime !== undefined) updatePayload.fixtureTime = data.fixtureTime || null;

        // Initialisiere Score-Felder auf null, falls scoreData vorhanden ist
        if (data.scoreData !== undefined) {
            updatePayload.homeScore = null;
            updatePayload.awayScore = null;
            updatePayload.homeSet1 = null; updatePayload.awaySet1 = null;
            updatePayload.homeSet2 = null; updatePayload.awaySet2 = null;
            updatePayload.homeSet3 = null; updatePayload.awaySet3 = null;
            updatePayload.homeSet4 = null; updatePayload.awaySet4 = null;
            updatePayload.homeSet5 = null; updatePayload.awaySet5 = null;
            updatePayload.homePoints = null; updatePayload.awayPoints = null;
            updatePayload.homeMatchPoints = null; updatePayload.awayMatchPoints = null;
        }

        // 3. Score-Daten verarbeiten (falls vorhanden)
        if (data.scoreData) {
            const { scoreEntryType, setsToWin } = leagueRules;
            let finalHomeScore: number | null = null;
            let finalAwayScore: number | null = null;

            if (scoreEntryType === ScoreEntryType.MATCH_SCORE) {
                const { homeScore, awayScore, homePoints, awayPoints } = data.scoreData;
                // --- Validierung für MATCH_SCORE ---
                if (homeScore === null || homeScore === undefined || awayScore === null || awayScore === undefined) throw new Error('Bei Eingabe des Gesamtergebnisses müssen beide Werte (Heim/Gast) angegeben werden.');
                const hs = Number(homeScore); const as = Number(awayScore);
                if (isNaN(hs) || isNaN(as) || hs < 0 || as < 0 || !Number.isInteger(hs) || !Number.isInteger(as)) throw new Error('Ungültige Satzwerte. Nur positive ganze Zahlen erlaubt.');
                if (!((hs === setsToWin && as < setsToWin) || (as === setsToWin && hs < setsToWin))) throw new Error(`Ungültiges Gesamtergebnis. Ein Team muss genau ${setsToWin} Sätze gewinnen, das andere weniger.`);
                // --- Ende Validierung ---
                finalHomeScore = hs; finalAwayScore = as;
                if (homePoints !== null && homePoints !== undefined) { const hp = Number(homePoints); if (isNaN(hp) || hp < 0 || !Number.isInteger(hp)) throw new Error('Ungültiger Wert für Bälle Heim.'); updatePayload.homePoints = hp; }
                if (awayPoints !== null && awayPoints !== undefined) { const ap = Number(awayPoints); if (isNaN(ap) || ap < 0 || !Number.isInteger(ap)) throw new Error('Ungültiger Wert für Bälle Gast.'); updatePayload.awayPoints = ap; }
                for (let i = 1; i <= 5; i++) { updatePayload[`homeSet${i}`] = null; updatePayload[`awaySet${i}`] = null; }

            } else if (scoreEntryType === ScoreEntryType.SET_SCORES) {
                const { setScores } = data.scoreData;
                if (!setScores || !Array.isArray(setScores)) throw new Error('Bei Eingabe von Satzergebnissen muss ein Array `setScores` übergeben werden.');
                let calculatedHomeSets = 0; let calculatedAwaySets = 0;
                const maxSets = 2 * setsToWin - 1;
                if (setScores.length > maxSets) throw new Error(`Es können maximal ${maxSets} Sätze eingegeben werden.`);

                for (let i = 0; i < setScores.length; i++) {
                    const set = setScores[i]; const setIndex = i + 1;
                    if ((set.home === null || set.home === undefined || String(set.home).trim() === '') && (set.away === null || set.away === undefined || String(set.away).trim() === '')) { updatePayload[`homeSet${setIndex}`] = null; updatePayload[`awaySet${setIndex}`] = null; continue; }
                    if ((set.home === null || set.home === undefined || String(set.home).trim() === '') || (set.away === null || set.away === undefined || String(set.away).trim() === '')) throw new Error(`Satz ${setIndex}: Beide Punktwerte (Heim/Gast) müssen angegeben werden.`);
                    const homeP = Number(set.home); const awayP = Number(set.away);
                    if (isNaN(homeP) || isNaN(awayP) || homeP < 0 || awayP < 0 || !Number.isInteger(homeP) || !Number.isInteger(awayP)) throw new Error(`Satz ${setIndex}: Ungültige Punktwerte. Nur positive ganze Zahlen erlaubt.`);
                    // --- Volleyball Score Validierung ---
                    const isTieBreak = setIndex === maxSets; const minPoints = isTieBreak ? 15 : 25; const winnerP = Math.max(homeP, awayP); const loserP = Math.min(homeP, awayP);
                    if (!(homeP === 0 && awayP === 0)) { // Allow 0:0
                        if (winnerP < minPoints) throw new Error(`Satz ${setIndex}: Das siegreiche Team muss mindestens ${minPoints} Punkte erreichen (erreicht: ${winnerP}).`);
                        if (winnerP === minPoints && loserP > winnerP - 2) throw new Error(`Satz ${setIndex}: Bei ${minPoints} Punkten muss der Unterschied mindestens 2 Punkte betragen (aktuell: ${homeP}:${awayP}).`);
                        if (winnerP > minPoints && winnerP - loserP !== 2) throw new Error(`Satz ${setIndex}: Bei über ${minPoints} Punkten muss der Unterschied genau 2 Punkte betragen (aktuell: ${homeP}:${awayP}).`);
                    }
                    // --- Ende Validierung ---
                    updatePayload[`homeSet${setIndex}`] = homeP; updatePayload[`awaySet${setIndex}`] = awayP;
                    if (homeP > awayP) calculatedHomeSets++; else if (awayP > homeP) calculatedAwaySets++; else throw new Error(`Satz ${setIndex}: Unentschieden (${homeP}:${awayP}) ist nicht erlaubt.`);
                    if (calculatedHomeSets === setsToWin || calculatedAwaySets === setsToWin) {
                        if (i < setScores.length - 1) {
                            for (let j = i + 1; j < setScores.length; j++) {
                                const nextSet = setScores[j];
                                if ((nextSet.home !== null && nextSet.home !== undefined && String(nextSet.home).trim() !== '') || (nextSet.away !== null && nextSet.away !== undefined && String(nextSet.away).trim() !== '')) throw new Error(`Das Spiel endete in Satz ${setIndex}. Nachfolgende Sätze dürfen keine Ergebnisse enthalten.`);
                                else { updatePayload[`homeSet${j + 1}`] = null; updatePayload[`awaySet${j + 1}`] = null; }
                            }
                        } break;
                    }
                }
                // --- Finale Validierung SET_SCORES ---
                if (!(calculatedHomeSets === setsToWin || calculatedAwaySets === setsToWin)) {
                    const minSetsPlayed = Math.max(calculatedHomeSets, calculatedAwaySets);
                    if (minSetsPlayed < setsToWin && setScores.length < maxSets) { /* Incomplete result allowed */ }
                    else if (setScores.length === maxSets && calculatedHomeSets !== setsToWin && calculatedAwaySets !== setsToWin) throw new Error(`Ungültiges Endergebnis nach ${maxSets} Sätzen (${calculatedHomeSets}:${calculatedAwaySets}). Ein Team muss ${setsToWin} Sätze gewinnen.`);
                    else if (calculatedHomeSets !== setsToWin && calculatedAwaySets !== setsToWin) { /* Incomplete result allowed */ }
                }
                // --- Ende Validierung ---
                finalHomeScore = calculatedHomeSets; finalAwayScore = calculatedAwaySets;
                for (let i = setScores.length + 1; i <= 5; i++) { updatePayload[`homeSet${i}`] = null; updatePayload[`awaySet${i}`] = null; }
                updatePayload.homePoints = null; updatePayload.awayPoints = null; // Clear total points for SET_SCORES

            } else {
                throw new Error('Unbekannter scoreEntryType für die Liga.');
            }

            // --- Punkteberechnung (gemeinsam) ---
            if (finalHomeScore !== null && finalAwayScore !== null) {
                updatePayload.homeScore = finalHomeScore; updatePayload.awayScore = finalAwayScore;
                const rules = leagueRules; let homeMatchP = 0; let awayMatchP = 0;
                if (finalHomeScore === setsToWin && finalAwayScore < setsToWin) { // Home wins
                    if (setsToWin === 3) { if (finalAwayScore === 0) homeMatchP = rules.pointsWin30; else if (finalAwayScore === 1) homeMatchP = rules.pointsWin31; else if (finalAwayScore === 2) { homeMatchP = rules.pointsWin32; awayMatchP = rules.pointsLoss32; } }
                    else if (setsToWin === 2) { if (finalAwayScore === 0) homeMatchP = rules.pointsWin30; else if (finalAwayScore === 1) homeMatchP = rules.pointsWin31; }
                } else if (finalAwayScore === setsToWin && finalHomeScore < setsToWin) { // Away wins
                    if (setsToWin === 3) { if (finalHomeScore === 0) awayMatchP = rules.pointsWin30; else if (finalHomeScore === 1) awayMatchP = rules.pointsWin31; else if (finalHomeScore === 2) { awayMatchP = rules.pointsWin32; homeMatchP = rules.pointsLoss32; } }
                    else if (setsToWin === 2) { if (finalHomeScore === 0) awayMatchP = rules.pointsWin30; else if (finalHomeScore === 1) awayMatchP = rules.pointsWin31; }
                }
                updatePayload.homeMatchPoints = homeMatchP; updatePayload.awayMatchPoints = awayMatchP;
            } else {
                updatePayload.homeScore = null; updatePayload.awayScore = null;
                updatePayload.homeMatchPoints = null; updatePayload.awayMatchPoints = null;
            }
        } // Ende if(data.scoreData)

        // 4. Datenbank-Update durchführen
        const finalUpdateData = Object.fromEntries(Object.entries(updatePayload).filter(([_, v]) => v !== undefined));
        const updatedDbFixture = await prisma.fixture.update({
            where: { id },
            data: finalUpdateData,
            include: { // Include für Mapping zurückgeben
                homeTeam: { select: { id: true, name: true } },
                awayTeam: { select: { id: true, name: true } },
                league: { select: { scoreEntryType: true, setsToWin: true } }
            }
        });

        return mapPrismaFixtureToFixture(updatedDbFixture);

    } catch (error) {
        if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
            return null; // Fixture nicht gefunden
        }
        console.error('Error updating fixture in service:', error);
        throw error; // Wirf den Fehler weiter (kann auch Validierungsfehler sein)
    }
}

/**
 * Aktualisiert die Reihenfolge der Fixtures für eine Liga.
 */
export async function reorderFixtures(leagueId: number, orderedFixtureIds: number[]): Promise<void> {
    // Validierung der IDs (Grundlegend)
    if (!Array.isArray(orderedFixtureIds) || orderedFixtureIds.some(id => typeof id !== 'number')) {
        throw new Error('Ungültige Fixture-ID-Liste.');
    }

    // Prüfen, ob alle Fixtures zur Liga gehören (optional, aber empfohlen)
    const fixturesInDb = await prisma.fixture.findMany({
        where: { leagueId: leagueId },
        select: { id: true }
    });
    const dbFixtureIds = new Set(fixturesInDb.map(f => f.id));
    const invalidIds = orderedFixtureIds.filter(id => !dbFixtureIds.has(id));
    if (invalidIds.length > 0) {
        throw new Error(`Fixture(s) mit ID(s) ${invalidIds.join(', ')} gehören nicht zur Liga ${leagueId}.`);
    }
    if (dbFixtureIds.size !== orderedFixtureIds.length) {
        throw new Error('Die Anzahl der übergebenen Fixture-IDs stimmt nicht mit der Anzahl der Fixtures in der Liga überein.');
    }


    // Update in Transaktion
    try {
        const updatePromises = orderedFixtureIds.map((fixtureId, index) =>
            prisma.fixture.update({
                where: { id: fixtureId },
                data: { order: index + 1 }, // 1-basierte Reihenfolge
            })
        );
        await prisma.$transaction(updatePromises);
    } catch (error) {
        console.error('Error reordering fixtures in service:', error);
        throw new Error('Fehler beim Aktualisieren der Spielplanreihenfolge.'); // Allgemeiner Fehler für die API
    }
}
