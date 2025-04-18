import { Prisma, ScoreEntryType } from '@prisma/client';
import prisma from '@/lib/prisma';
import { createSlug, isValidSlug } from '@/lib/slugify';
import type {
  LeagueOverview,
  LeagueDetails,
  Team,
  TeamBasicInfo,
  Fixture,
  UserProfile,
} from '@/types/models';

// --- Hilfsfunktionen für Mapping ---

function mapPrismaTeamToTeamBasicInfo(team: Prisma.TeamGetPayload<{}>): TeamBasicInfo {
    return { id: team.id, name: team.name };
}

function mapPrismaTeamToTeam(
    team: Prisma.TeamGetPayload<{ include: { teamLeader: { select: { id: true, name: true } } } }>
): Team {
    const teamLeaderProfile: UserProfile | null = team.teamLeader ? {
        id: team.teamLeader.id,
        name: team.teamLeader.name,
        email: '', createdAt: new Date(), updatedAt: new Date(), isAdmin: false, isSuperAdmin: false, theme: null, // Default values
    } : null;
    const { teamLeaderId, ...teamData } = team;
    return { ...teamData, teamLeader: teamLeaderProfile };
}

function mapPrismaFixtureToFixture(
    dbFixture: Prisma.FixtureGetPayload<{ include: { homeTeam: { select: { id: true, name: true } }, awayTeam: { select: { id: true, name: true } } } }>,
    teamsInLeague: TeamBasicInfo[] // Pass league teams for name lookup
): Fixture {
    const homeTeamInfo: TeamBasicInfo = dbFixture.homeTeam
        ? { id: dbFixture.homeTeam.id, name: dbFixture.homeTeam.name }
        : teamsInLeague.find(t => t.id === dbFixture.homeTeamId) || { id: dbFixture.homeTeamId, name: 'N/A' };
    const awayTeamInfo: TeamBasicInfo = dbFixture.awayTeam
        ? { id: dbFixture.awayTeam.id, name: dbFixture.awayTeam.name }
        : teamsInLeague.find(t => t.id === dbFixture.awayTeamId) || { id: dbFixture.awayTeamId, name: 'N/A' };

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
    };
}

function mapPrismaLeagueToLeagueOverview(league: Prisma.LeagueGetPayload<{ include: { teams: { select: { id: true, name: true } } } }>): LeagueOverview {
    return {
        ...league,
        teams: league.teams.map(mapPrismaTeamToTeamBasicInfo),
    };
}

function mapPrismaLeagueToLeagueDetails(
    league: Prisma.LeagueGetPayload<{ include: { teams: { include: { teamLeader: { select: { id: true, name: true } } } }, fixtures: { include: { homeTeam: { select: { id: true, name: true } }, awayTeam: { select: { id: true, name: true } } } } } }>
): LeagueDetails {
    const mappedTeams = league.teams.map(mapPrismaTeamToTeam);
    const mappedFixtures = league.fixtures.map(f => mapPrismaFixtureToFixture(f, mappedTeams)); // Pass mapped teams for lookup
    return {
        ...league,
        teams: mappedTeams,
        fixtures: mappedFixtures,
    };
}


// --- Service-Funktionen ---

/**
 * Ruft alle Ligen als Übersicht ab, optional gefiltert nach Team-ID.
 */
export async function getAllLeaguesOverview(teamId?: number): Promise<LeagueOverview[]> {
    const whereClause = teamId ? { teams: { some: { id: teamId } } } : {};
    const leagues = await prisma.league.findMany({
        where: whereClause,
        include: {
            teams: { select: { id: true, name: true } }, // Nur Basis-Infos für Overview
        },
        orderBy: { createdAt: 'desc' },
    });
    return leagues.map(mapPrismaLeagueToLeagueOverview);
}

/**
 * Ruft die Details einer einzelnen Liga anhand ihrer ID ab.
 */
export async function getLeagueDetailsById(id: number): Promise<LeagueDetails | null> {
    const league = await prisma.league.findUnique({
        where: { id },
        include: {
            teams: { include: { teamLeader: { select: { id: true, name: true } } } }, // Volle Teams laden
            fixtures: { // Volle Fixtures laden
                include: {
                    homeTeam: { select: { id: true, name: true } },
                    awayTeam: { select: { id: true, name: true } }
                },
                orderBy: { order: 'asc' }
            }
        }
    });

    if (!league) {
        return null;
    }
    return mapPrismaLeagueToLeagueDetails(league);
}

/**
 * Erstellt eine neue Liga.
 */
export type CreateLeagueData = {
    name: string;
    slug?: string; // Optional, wird generiert wenn nicht vorhanden
    numberOfTeams: number;
    hasReturnMatches: boolean;
    teamIds?: number[];
    pointsWin30?: number;
    pointsWin31?: number;
    pointsWin32?: number;
    pointsLoss32?: number;
    scoreEntryType?: ScoreEntryType;
    setsToWin?: number;
};
export async function createLeague(data: CreateLeagueData): Promise<LeagueDetails> {
    // Slug generieren oder validieren
    let finalSlug = data.slug ? data.slug.trim() : createSlug(data.name);
    if (!isValidSlug(finalSlug)) {
        throw new Error('Der URL-Slug darf nur Kleinbuchstaben, Zahlen und Bindestriche enthalten.');
    }

    // Prüfen, ob der Slug bereits existiert und ggf. anpassen
    let counter = 1;
    while (await prisma.league.findUnique({ where: { slug: finalSlug } })) {
        finalSlug = `${data.slug ? data.slug : createSlug(data.name)}-${counter}`;
        counter++;
        if (!isValidSlug(finalSlug)) { // Sicherheitshalber erneut validieren
             throw new Error('Konnte keinen gültigen, eindeutigen Slug generieren.');
        }
    }

    const league = await prisma.league.create({
        data: {
            name: data.name,
            slug: finalSlug,
            numberOfTeams: data.numberOfTeams,
            hasReturnMatches: data.hasReturnMatches,
            pointsWin30: data.pointsWin30 ?? 3,
            pointsWin31: data.pointsWin31 ?? 3,
            pointsWin32: data.pointsWin32 ?? 2,
            pointsLoss32: data.pointsLoss32 ?? 1,
            scoreEntryType: data.scoreEntryType ?? ScoreEntryType.MATCH_SCORE,
            setsToWin: data.setsToWin ?? 3,
            ...(data.teamIds && data.teamIds.length > 0 && {
                teams: { connect: data.teamIds.map((id) => ({ id: Number(id) })) }
            })
        },
        include: { // Include alles für die Rückgabe als LeagueDetails
            teams: { include: { teamLeader: { select: { id: true, name: true } } } },
            fixtures: { include: { homeTeam: { select: { id: true, name: true } }, awayTeam: { select: { id: true, name: true } } } }
        }
    });
    return mapPrismaLeagueToLeagueDetails(league);
}

/**
 * Aktualisiert eine bestehende Liga.
 */
export type UpdateLeagueData = Partial<Omit<CreateLeagueData, 'slug'>> & { slug?: string; isActive?: boolean };
export async function updateLeague(id: number, data: UpdateLeagueData): Promise<LeagueDetails | null> {
    try {
        // Slug-Handling
        let finalSlug: string | undefined = undefined;
        if (data.slug || data.name) {
            const currentLeague = await prisma.league.findUnique({ where: { id } });
            if (!currentLeague) return null; // Liga nicht gefunden

            finalSlug = data.slug ? data.slug.trim() : createSlug(data.name || currentLeague.name);
            if (!isValidSlug(finalSlug)) {
                throw new Error('Der URL-Slug darf nur Kleinbuchstaben, Zahlen und Bindestriche enthalten.');
            }

            // Prüfen auf Konflikt (außer mit sich selbst)
            let counter = 1;
            while (await prisma.league.findFirst({ where: { slug: finalSlug, id: { not: id } } })) {
                finalSlug = `${data.slug ? data.slug : createSlug(data.name || currentLeague.name)}-${counter}`;
                counter++;
                 if (!isValidSlug(finalSlug)) {
                     throw new Error('Konnte keinen gültigen, eindeutigen Slug generieren.');
                 }
            }
        }

        // Update in Transaktion
        const updatedLeague = await prisma.$transaction(async (tx) => {
            // 1. Liga-Daten aktualisieren (ohne Teams)
            const leagueUpdateData: Prisma.LeagueUpdateInput = {
                name: data.name,
                slug: finalSlug, // Nur setzen, wenn berechnet
                numberOfTeams: data.numberOfTeams,
                hasReturnMatches: data.hasReturnMatches,
                isActive: data.isActive,
                pointsWin30: data.pointsWin30 !== undefined ? Number(data.pointsWin30) : undefined,
                pointsWin31: data.pointsWin31 !== undefined ? Number(data.pointsWin31) : undefined,
                pointsWin32: data.pointsWin32 !== undefined ? Number(data.pointsWin32) : undefined,
                pointsLoss32: data.pointsLoss32 !== undefined ? Number(data.pointsLoss32) : undefined,
                scoreEntryType: data.scoreEntryType,
                setsToWin: data.setsToWin !== undefined ? Number(data.setsToWin) : undefined,
            };
            // Entferne undefined Werte, damit Prisma sie nicht überschreibt
            Object.keys(leagueUpdateData).forEach(key => leagueUpdateData[key] === undefined && delete leagueUpdateData[key]);

            await tx.league.update({
                where: { id },
                data: leagueUpdateData,
            });

            // 2. Team-Verbindungen aktualisieren (falls teamIds übergeben wurden)
            if (data.teamIds !== undefined) {
                await tx.league.update({
                    where: { id },
                    data: {
                        teams: { set: data.teamIds.map((teamId) => ({ id: Number(teamId) })) }
                    }
                });
            }

            // 3. Aktualisierte Liga mit allen Includes abrufen
            return tx.league.findUniqueOrThrow({
                where: { id },
                include: {
                    teams: { include: { teamLeader: { select: { id: true, name: true } } } },
                    fixtures: { include: { homeTeam: { select: { id: true, name: true } }, awayTeam: { select: { id: true, name: true } } }, orderBy: { order: 'asc' } }
                }
            });
        });

        return mapPrismaLeagueToLeagueDetails(updatedLeague);

    } catch (error) {
        if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
            return null; // Liga nicht gefunden
        }
        console.error('Error updating league in service:', error);
        throw error;
    }
}

/**
 * Löscht eine Liga anhand ihrer ID.
 */
export async function deleteLeague(id: number): Promise<void> {
    try {
        // TODO: Was passiert mit Fixtures? Müssen manuell gelöscht werden, wenn kein Cascade Delete definiert ist.
        // Prüfe dein Prisma-Schema!
        // Beispiel: await prisma.fixture.deleteMany({ where: { leagueId: id } });

        await prisma.league.delete({
            where: { id },
        });
    } catch (error) {
        if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
            console.warn(`League with ID ${id} not found for deletion, likely already deleted.`);
            return;
        }
         // Handle Foreign Key Constraint Fehler (P2003), falls Fixtures noch existieren
        if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2003') {
           console.error(`Cannot delete league ${id} due to existing references (fixtures).`);
           throw new Error(`Liga kann nicht gelöscht werden, da noch Spielpläne existieren. Bitte löschen Sie zuerst den Spielplan.`);
        }
        console.error('Error deleting league in service:', error);
        throw error;
    }
}

/**
 * Ruft die aktive Liga ab.
 */
export async function getActiveLeague(): Promise<{ activeLeagueId: number | null; league: LeagueDetails | null }> {
    const setting = await prisma.setting.findUnique({
        where: { key: 'activeLeagueId' },
    });

    if (!setting || !setting.value) {
        return { activeLeagueId: null, league: null };
    }

    const leagueId = parseInt(setting.value);
    if (isNaN(leagueId)) {
        return { activeLeagueId: null, league: null }; // Ungültiger Wert in DB
    }

    const league = await getLeagueDetailsById(leagueId); // Nutze bestehende Funktion
    return { activeLeagueId: leagueId, league };
}

/**
 * Setzt die aktive Liga.
 */
export async function setActiveLeague(leagueId: number): Promise<void> {
    // Prüfen, ob die Liga existiert
    const league = await prisma.league.findUnique({ where: { id: leagueId } });
    if (!league) {
        throw new Error('Liga nicht gefunden.');
    }

    await prisma.setting.upsert({
        where: { key: 'activeLeagueId' },
        update: { value: leagueId.toString() },
        create: { key: 'activeLeagueId', value: leagueId.toString() },
    });
}

// --- Fixture Generation Logic (aus alter Route übernommen) ---

// Helper function to extract the first HH:MM or approximate HH:00 time from a string
function extractTimeFromString(text: string | null | undefined): string | null {
  if (!text) return null;
  const exactTimeRegex = /\b(\d{1,2}:\d{2})/;
  const exactMatch = text.match(exactTimeRegex);
  if (exactMatch) return exactMatch[1];
  const hourRegex = /\b(\d{1,2})\b/;
  const hourMatch = text.match(hourRegex);
  if (hourMatch) {
    const hour = parseInt(hourMatch[1], 10);
    if (hour >= 0 && hour <= 23) return `${String(hour).padStart(2, '0')}:00`;
  }
  return null;
}

interface TeamWithTrainingTime { id: number; trainingTimes: string | null; }

// Helper function to generate round-robin fixtures
function generateRoundRobinFixtures(teams: TeamWithTrainingTime[], hasReturnMatches: boolean): Omit<Prisma.FixtureCreateInput, 'league' | 'order'>[] {
    const fixturesData: Omit<Prisma.FixtureCreateInput, 'league' | 'order'>[] = [];
    const numTeams = teams.length;
    if (numTeams < 2) return [];

    const trainingTimesMap: Record<number, string | null> = {};
    teams.forEach(team => { trainingTimesMap[team.id] = team.trainingTimes; });

    const localTeams = [...teams];
    if (numTeams % 2 !== 0) localTeams.push({ id: -1, trainingTimes: null });

    const numTeamsWithDummy = localTeams.length;
    const rounds = numTeamsWithDummy - 1;
    const rotatingTeams = localTeams.slice(1);
    const fixedTeam = localTeams[0];

    for (let round = 0; round < rounds; round++) {
        // Match fixed team
        if (fixedTeam.id !== -1 && rotatingTeams[0].id !== -1) {
            const homeTeamId = (round % 2 === 0) ? fixedTeam.id : rotatingTeams[0].id;
            const awayTeamId = (homeTeamId === fixedTeam.id) ? rotatingTeams[0].id : fixedTeam.id;
            fixturesData.push({
                homeTeam: { connect: { id: homeTeamId } },
                awayTeam: { connect: { id: awayTeamId } },
                fixtureTime: extractTimeFromString(trainingTimesMap[homeTeamId]),
                round: round + 1, matchday: round + 1,
            });
        }
        // Match other teams
        for (let i = 1; i < numTeamsWithDummy / 2; i++) {
            const team1 = rotatingTeams[i];
            const team2 = rotatingTeams[numTeamsWithDummy - 1 - i];
            if (team1.id !== -1 && team2.id !== -1) {
                const homeTeamId = (i % 2 !== round % 2) ? team1.id : team2.id; // Simple alternation
                const awayTeamId = (homeTeamId === team1.id) ? team2.id : team1.id;
                fixturesData.push({
                    homeTeam: { connect: { id: homeTeamId } },
                    awayTeam: { connect: { id: awayTeamId } },
                    fixtureTime: extractTimeFromString(trainingTimesMap[homeTeamId]),
                    round: round + 1, matchday: round + 1,
                });
            }
        }
        rotatingTeams.push(rotatingTeams.shift()!); // Rotate
    }

    if (hasReturnMatches) {
        const firstHalfFixtures = [...fixturesData];
        const returnFixtures = firstHalfFixtures.map(f => ({
            homeTeam: f.awayTeam, // Swap teams
            awayTeam: f.homeTeam,
            fixtureTime: extractTimeFromString(trainingTimesMap[f.awayTeam.connect.id]), // Time of new home team
            round: (f.round || 0) + rounds,
            matchday: (f.matchday || 0) + rounds,
        }));
        fixturesData.push(...returnFixtures);
    }
    return fixturesData;
}


/**
 * Generiert den Spielplan für eine Liga. Löscht vorhandene Spiele.
 */
export async function generateFixturesForLeague(leagueId: number): Promise<{ message: string; fixtureCount: number }> {
    // 1. Liga und Teams holen
    const league = await prisma.league.findUnique({
        where: { id: leagueId },
        include: { teams: { select: { id: true, trainingTimes: true } } },
    });

    if (!league) throw new Error('Liga nicht gefunden.');
    if (league.teams.length !== league.numberOfTeams) throw new Error(`Die Anzahl der zugewiesenen Teams (${league.teams.length}) stimmt nicht mit der erwarteten Anzahl (${league.numberOfTeams}) überein.`);
    if (league.teams.length < 2) throw new Error('Es müssen mindestens 2 Teams zugewiesen sein.');

    // 2. Bestehende Fixtures löschen
    await prisma.fixture.deleteMany({ where: { leagueId: leagueId } });

    // 3. Neue Fixtures generieren
    const generatedFixturesData = generateRoundRobinFixtures(league.teams, league.hasReturnMatches);

    // 4. Fixtures mit Reihenfolge und leagueId für DB vorbereiten
    const fixturesToCreate = generatedFixturesData.map((fixtureData, index) => ({
        ...fixtureData,
        leagueId: leagueId,
        order: index + 1,
    }));

    // 5. Fixtures speichern
    if (fixturesToCreate.length > 0) {
        await prisma.$transaction(
            fixturesToCreate.map(data => prisma.fixture.create({ data }))
        );
    }

    return {
        message: `Spielplan für ${league.name} erfolgreich generiert.`,
        fixtureCount: fixturesToCreate.length,
    };
}
