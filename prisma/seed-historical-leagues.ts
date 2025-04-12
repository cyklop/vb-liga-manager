import { PrismaClient, Prisma } from '@prisma/client'
import { createSlug } from '../src/lib/slugify' // Passe den Pfad ggf. an
import fs from 'fs'
import path from 'path'

const prisma = new PrismaClient()

// --- Konfiguration ---
const SEED_DATA_DIR = path.join(__dirname, 'seed-data') // Ordner für JSON-Dateien
// Stelle sicher, dass die Dateinamen hier in chronologischer Reihenfolge sind!
const SEASON_FILES = [
    '2015-16.json',
    '2016-17.json',
    // '2017-18.json', // Füge weitere Jahre hinzu, falls vorhanden
    // '2018-19.json',
    // '2019-20.json',
    // '2020-21.json',
    // '2021-22.json',
    // '2022-23.json',
    // '2023-24.json',
    // '2024-25.json', // Die letzte Datei bestimmt die aktive Liga
];
// --- Ende Konfiguration ---

interface SheetFixture {
    Spieltag: string | number;
    Datum: string;
    Uhrzeit: string;
    Heimmannschaft: string;
    Gastmannschaft: string;
    S1H?: string | number | null; // Erlaube null
    S1G?: string | number | null;
    S2H?: string | number | null;
    S2G?: string | number | null;
    S3H?: string | number | null;
    S3G?: string | number | null;
    S4H?: string | number | null;
    S4G?: string | number | null;
    S5H?: string | number | null;
    S5G?: string | number | null;
    EndH: string | number; // Endstand Sätze Heim
    EndG: string | number; // Endstand Sätze Gast
    PktH: string | number; // Punkte Heim
    PktG: string | number; // Punkte Gast
    Anmerkungen?: string | null; // Erlaube null
}

// Hilfsfunktion zum Normalisieren von Teamnamen
function normalizeTeamName(name: string | null | undefined): string {
    if (!name) return '';
    return name.trim().replace(/\s+/g, ' '); // Entfernt führende/folgende Leerzeichen und reduziert interne auf eins
}

// Hilfsfunktion zum Parsen von Datum und Uhrzeit
function parseDateTime(dateStr: string | null | undefined, timeStr: string | null | undefined): Date | null {
    if (!dateStr || dateStr === '-' || !timeStr || timeStr === '-') {
        return null;
    }
    // Versucht, deutsche Datumsformate zu parsen (z.B. "27. Nov 2015", "10. Mai 2016")
    // und kombiniert sie mit der Uhrzeit (z.B. "19:30 Uhr")
    try {
        // Ersetze deutsche Monatsabkürzungen/Namen (flexibler)
        const months: { [key: string]: string } = {
            'Jan': '01', 'Feb': '02', 'Mär': '03', 'Apr': '04', 'Mai': '05', 'Jun': '06',
            'Jul': '07', 'Aug': '08', 'Sep': '09', 'Okt': '10', 'Nov': '11', 'Dez': '12'
        };
        let formattedDateStr = dateStr.trim().replace('.', ''); // Entferne Punkte nach Tag/Monat
        for (const key in months) {
            // Ersetze Monatsnamen/-abkürzungen (Groß-/Kleinschreibung ignorieren)
            const regex = new RegExp(key + '\\.?', 'i'); // Optionaler Punkt am Ende
            formattedDateStr = formattedDateStr.replace(regex, months[key]);
        }

        // Extrahiere Teile: DD MM YYYY (nach Ersetzung)
        const dateParts = formattedDateStr.match(/(\d{1,2})\s*(\d{1,2})\s*(\d{4})/);
        if (!dateParts) {
             console.warn(`Could not parse date format: "${dateStr}" -> "${formattedDateStr}"`);
             return null;
        }

        const day = dateParts[1].padStart(2, '0');
        const month = dateParts[2].padStart(2, '0');
        const year = dateParts[3];

        // Extrahiere Zeit: HH:MM
        const timeParts = timeStr.match(/(\d{1,2}):(\d{2})/);
        if (!timeParts) {
             console.warn(`Could not parse time format: "${timeStr}"`);
             return null; // Format nicht erkannt
        }

        const hours = timeParts[1].padStart(2, '0');
        const minutes = timeParts[2];

        // Erstelle ISO String (YYYY-MM-DDTHH:mm:ss)
        const isoString = `${year}-${month}-${day}T${hours}:${minutes}:00`;

        // Prüfe, ob das Datum gültig ist
        const dateObj = new Date(isoString);
        if (isNaN(dateObj.getTime())) {
            console.warn(`Invalid date created from: "${isoString}" (original: "${dateStr}", "${timeStr}")`);
            return null;
        }

        return dateObj;

    } catch (error) {
        console.warn(`Error parsing date/time: "${dateStr}", "${timeStr}"`, error);
        return null;
    }
}


// Hilfsfunktion zum sicheren Parsen von Zahlen
function safeParseInt(value: string | number | undefined | null): number | null {
    if (value === undefined || value === null || value === '' || value === '-') {
        return null;
    }
    // Entferne mögliche Tausendertrennzeichen (Punkte), falls vorhanden
    const cleanedValue = String(value).replace(/\./g, '');
    const parsed = parseInt(cleanedValue, 10);
    return isNaN(parsed) ? null : parsed;
}

// Hauptfunktion für das Seeden der historischen Daten
export async function main() {
    console.log(`Looking for season data in: ${SEED_DATA_DIR}`);

    if (!fs.existsSync(SEED_DATA_DIR)) {
         console.error(`❌ Error: Seed data directory not found: ${SEED_DATA_DIR}`);
         console.error(`Please create the directory and place the season JSON files (e.g., 2015-16.json) inside.`);
         throw new Error(`Seed data directory not found: ${SEED_DATA_DIR}`);
    }

    const availableFiles = fs.readdirSync(SEED_DATA_DIR).filter(file => file.endsWith('.json'));
    // Filtere die verfügbaren Dateien basierend auf der Reihenfolge in SEASON_FILES
    const filesToProcess = SEASON_FILES.filter(f => availableFiles.includes(f));

    if (filesToProcess.length === 0) {
        console.warn(`ℹ️ No season files found in ${SEED_DATA_DIR} matching the names in SEASON_FILES. Skipping historical data seeding.`);
        return;
    }

    console.log(`Found ${filesToProcess.length} season files to process (in order): ${filesToProcess.join(', ')}`);

    // Globale Map für alle Teams über alle Saisons
    const globalTeamMap: { [name: string]: number } = {};

    // 1. Durchlauf: Alle Teams aus allen Saisons sammeln und erstellen/finden
    console.log('\n--- Ensuring all teams exist ---');
    const allTeamNames = new Set<string>();
    for (const filename of filesToProcess) {
        const filePath = path.join(SEED_DATA_DIR, filename);
        try {
            const fileContent = fs.readFileSync(filePath, 'utf-8');
            const fixturesData: SheetFixture[] = JSON.parse(fileContent);
            if (!Array.isArray(fixturesData)) continue;

            fixturesData.forEach(f => {
                const homeTeam = normalizeTeamName(f.Heimmannschaft);
                const awayTeam = normalizeTeamName(f.Gastmannschaft);
                if (homeTeam) allTeamNames.add(homeTeam);
                if (awayTeam) allTeamNames.add(awayTeam);
            });
        } catch (error) {
            console.error(`❌ Error reading or parsing file ${filename} during team collection:`, error);
            throw error; // Abbruch bei Fehler
        }
    }

    for (const name of allTeamNames) {
        if (!name) continue;
        try {
            const team = await prisma.team.upsert({
                where: { name: name },
                update: {},
                create: {
                    name: name,
                    location: null,
                    hallAddress: null,
                    trainingTimes: null,
                },
                select: { id: true }
            });
            globalTeamMap[name] = team.id;
            // console.log(`   Team "${name}" (ID: ${team.id}) ensured.`); // Optional: Weniger Output
        } catch (error) {
             console.error(`❌ Error upserting team "${name}":`, error);
             throw error;
        }
    }
    console.log(`   Ensured ${allTeamNames.size} unique teams across all seasons.`);


    // 2. Durchlauf: Ligen und Fixtures pro Saison erstellen
    for (let i = 0; i < filesToProcess.length; i++) {
        const filename = filesToProcess[i];
        const isLastSeason = i === filesToProcess.length - 1; // Bestimmt die aktive Liga
        const filePath = path.join(SEED_DATA_DIR, filename);

        console.log(`\n--- Processing Season File: ${filename} (IsLast: ${isLastSeason}) ---`);

        try {
            const fileContent = fs.readFileSync(filePath, 'utf-8');
            const fixturesData: SheetFixture[] = JSON.parse(fileContent);

            if (!Array.isArray(fixturesData) || fixturesData.length === 0) {
                console.warn(`   Skipping ${filename}: No valid fixture data found.`);
                continue;
            }

            // Liga-Name und Slug ableiten
            const seasonMatch = filename.match(/(\d{4})-(\d{2})/);
            const seasonYear = seasonMatch ? `${seasonMatch[1]}/${parseInt(seasonMatch[1].substring(0, 2) + seasonMatch[2])}` : filename.replace('.json', '');
            const leagueName = `Volleyball Hobbyliga ${seasonYear}`;
            const leagueSlug = createSlug(leagueName);
            console.log(`   League: ${leagueName} (Slug: ${leagueSlug})`);

            // Teams dieser Saison sammeln (nur Namen)
            const currentSeasonTeamNames = new Set<string>();
            fixturesData.forEach(f => {
                 const homeTeam = normalizeTeamName(f.Heimmannschaft);
                 const awayTeam = normalizeTeamName(f.Gastmannschaft);
                 if (homeTeam) currentSeasonTeamNames.add(homeTeam);
                 if (awayTeam) currentSeasonTeamNames.add(awayTeam);
            });

            // Team-IDs für die Verbindung holen
            const teamConnect = Array.from(currentSeasonTeamNames)
                                    .map(name => ({ id: globalTeamMap[name] }))
                                    .filter(t => t.id !== undefined); // Filtere undefinierte IDs (sollte nicht passieren)

            if (teamConnect.length !== currentSeasonTeamNames.size) {
                 console.warn(`   Mismatch between found team names (${currentSeasonTeamNames.size}) and connectable teams (${teamConnect.length}) for ${leagueName}.`);
            }
             console.log(`   Found ${currentSeasonTeamNames.size} teams for this season.`);


            // Analyse Hin-/Rückspiele
            const pairings = new Map<string, number>();
            fixturesData.forEach(f => {
                const home = normalizeTeamName(f.Heimmannschaft);
                const away = normalizeTeamName(f.Gastmannschaft);
                if (home && away) {
                    const key = [home, away].sort().join('|');
                    pairings.set(key, (pairings.get(key) || 0) + 1);
                }
            });
            const totalPairings = pairings.size;
            const pairingsWithReturn = Array.from(pairings.values()).filter(count => count >= 2).length;
            const hasReturnMatches = totalPairings > 0 && (pairingsWithReturn / totalPairings > 0.5);
            console.log(`   Return Match Analysis: ${pairingsWithReturn} of ${totalPairings} pairings occur >= 2 times. hasReturnMatches=${hasReturnMatches}`);

            // Punktregeln definieren
            let pointsConfig: Partial<Prisma.LeagueCreateInput> = {};
            if (isLastSeason) {
                // Detaillierte Regeln für die letzte Saison (Annahme: 3/2/1/0)
                // Passe dies an dein tatsächliches Schema an, falls die Felder anders heißen
                pointsConfig = {
                    pointsWin30: 3, pointsWin31: 3, pointsWin32: 2,
                    pointsLoss32: 1,
                    // pointsLoss13: 0, // Feld existiert nicht im Schema
                    // pointsLoss03: 0, // Feld existiert nicht im Schema
                };
                 console.log("   Using detailed point system (3/2/1/0) for last season.");
            } else {
                // Einfache Regeln für historische Saisons (2/0)
                // Mappe 2/0 auf die vorhandenen Felder
                pointsConfig = {
                    pointsWin30: 2, pointsWin31: 2, pointsWin32: 2,
                    pointsLoss32: 0,
                    // pointsLoss13: 0, // Feld existiert nicht im Schema
                    // pointsLoss03: 0, // Feld existiert nicht im Schema
                };
                console.log("   Using simple point system (2/0) for historical season.");
            }

            // Liga erstellen/aktualisieren
            const league = await prisma.league.upsert({
                where: { slug: leagueSlug },
                update: {
                    name: leagueName, // Stelle sicher, dass der Name aktuell ist
                    numberOfTeams: currentSeasonTeamNames.size,
                    hasReturnMatches: hasReturnMatches,
                    isActive: isLastSeason,
                    ...pointsConfig,
                    teams: { set: teamConnect } // Setzt die Teams für diese Liga neu
                },
                create: {
                    name: leagueName,
                    slug: leagueSlug,
                    numberOfTeams: currentSeasonTeamNames.size,
                    hasReturnMatches: hasReturnMatches,
                    isActive: isLastSeason,
                    ...pointsConfig,
                    teams: { connect: teamConnect }
                },
                select: { id: true }
            });
            console.log(`   League "${leagueName}" (ID: ${league.id}) ensured/updated.`);

            // Alte Fixtures löschen
            const deletedFixtures = await prisma.fixture.deleteMany({ where: { leagueId: league.id } });
            if (deletedFixtures.count > 0) {
                console.log(`   Deleted ${deletedFixtures.count} existing fixtures for this league.`);
            }

            // Fixtures erstellen
            let createdCount = 0;
            let skippedCount = 0;
            let order = 1;
            for (const fix of fixturesData) {
                const homeTeamName = normalizeTeamName(fix.Heimmannschaft);
                const awayTeamName = normalizeTeamName(fix.Gastmannschaft);

                const homeTeamId = globalTeamMap[homeTeamName];
                const awayTeamId = globalTeamMap[awayTeamName];

                if (!homeTeamId || !awayTeamId) {
                    console.warn(`      Skipping fixture: Could not find team ID for "${homeTeamName}" or "${awayTeamName}" in global map.`);
                    skippedCount++;
                    continue;
                }

                const fixtureDate = parseDateTime(fix.Datum, fix.Uhrzeit);
                const matchday = safeParseInt(fix.Spieltag);
                const homeSets = safeParseInt(fix.EndH);
                const awaySets = safeParseInt(fix.EndG);
                // Nimm Punkte direkt aus dem Sheet, da Regeln variieren könnten
                const homeMatchPoints = safeParseInt(fix.PktH);
                const awayMatchPoints = safeParseInt(fix.PktG);

                // Prüfe, ob Sätze und Punkte konsistent sind (optional)
                // if (homeSets !== null && awaySets !== null && homeMatchPoints !== null && awayMatchPoints !== null) {
                //     const calculatedPoints = calculateMatchPoints(homeSets, awaySets, pointsConfig); // Funktion müsste definiert werden
                //     if (calculatedPoints.home !== homeMatchPoints || calculatedPoints.away !== awayMatchPoints) {
                //         console.warn(`      Points mismatch for ${homeTeamName} vs ${awayTeamName}: Sheet (${homeMatchPoints}:${awayMatchPoints}), Calculated (${calculatedPoints.home}:${calculatedPoints.away})`);
                //     }
                // }

                try {
                    await prisma.fixture.create({
                        data: {
                            leagueId: league.id,
                            order: order++,
                            matchday: matchday,
                            round: matchday, // Annahme: Runde = Spieltag
                            homeTeamId: homeTeamId,
                            awayTeamId: awayTeamId,
                            fixtureDate: fixtureDate,
                            // homeSets: homeSets, // Feld existiert nicht im Schema
                            // awaySets: awaySets, // Feld existiert nicht im Schema
                            // homeMatchPoints: homeMatchPoints, // Feld existiert nicht im Schema
                            // awayMatchPoints: awayMatchPoints, // Feld existiert nicht im Schema
                            // notes: fix.Anmerkungen || null, // Feld existiert nicht im Schema
                            // Einzelne Sätze (falls Schema sie hat)
                            homeSet1: safeParseInt(fix.S1H),
                            awaySet1: safeParseInt(fix.S1G),
                            homeSet2: safeParseInt(fix.S2H),
                            awaySet2: safeParseInt(fix.S2G),
                            homeSet3: safeParseInt(fix.S3H),
                            awaySet3: safeParseInt(fix.S3G),
                            homeSet4: safeParseInt(fix.S4H),
                            awaySet4: safeParseInt(fix.S4G),
                            homeSet5: safeParseInt(fix.S5H),
                            awaySet5: safeParseInt(fix.S5G),
                        }
                    });
                    createdCount++;
                } catch (fixtureError) {
                     console.error(`      Error creating fixture for ${homeTeamName} vs ${awayTeamName}:`, fixtureError);
                     console.error(`      Fixture data:`, JSON.stringify(fix));
                     skippedCount++;
                     // Entscheide, ob hier abgebrochen werden soll oder nur dieses übersprungen wird
                     // throw fixtureError; // Abbruch
                }
            }
            console.log(`   Created ${createdCount} fixtures, skipped ${skippedCount}.`);

        } catch (error) {
            console.error(`❌ Error processing file ${filename}:`, error);
            throw error; // Wirft den Fehler weiter, um den Prozess in seed.ts zu stoppen
        }
    }
}

// Führe main aus, wenn das Skript direkt aufgerufen wird (optional, da es von seed.ts importiert wird)
if (require.main === module) {
  main()
    .catch(async (e) => {
      console.error(e);
      await prisma.$disconnect();
      process.exit(1);
    })
    .finally(async () => {
      await prisma.$disconnect();
    });
}
