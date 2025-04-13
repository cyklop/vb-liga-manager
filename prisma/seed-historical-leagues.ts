import { PrismaClient, Prisma, ScoreEntryType } from '@prisma/client' // Importiere ScoreEntryType
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
    '2017-18.json',
    '2018-19.json',
    '2022-23.json',
    '2023-24.json',
    '2024-25.json', // Die letzte Datei bestimmt die aktive Liga
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

    let normalized = name.trim().replace(/\s+/g, ' '); // Grundlegende Bereinigung

    // Spezifische Ersetzungen für bekannte Duplikate/Varianten
    if (normalized === 'TV Helmbrechts') {
        normalized = 'TSV Helmbrechts';
    } else if (normalized === 'MTV Pegnitz/FSV Schnabelwaid') {
        normalized = 'MTV/SG Pegnitz';
    } else if (normalized === 'USC Bayreuth') {
        normalized = 'USC Bayreuth 1';
    }
    // Füge hier bei Bedarf weitere Ersetzungen hinzu

    return normalized;
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

        // Das resultierende Date-Objekt repräsentiert den korrekten Zeitpunkt.
        // Die .toISOString()-Methode gibt immer UTC ('Z') zurück,
        // aber der zugrunde liegende Zeitpunkt ist korrekt.
        // Prisma speichert DateTime-Werte typischerweise als UTC in der DB.
        // Die korrekte Anzeige in der lokalen Zeitzone ist Aufgabe des Frontends.
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

            // Punktregeln und ScoreEntryType definieren
            let pointsConfig: Partial<Prisma.LeagueCreateInput> = {};
            // Extrahiere das Startjahr der Saison aus dem Dateinamen (z.B. 2015 aus "2015-16.json")
            const seasonStartYearMatch = filename.match(/^(\d{4})/);
            const seasonStartYear = seasonStartYearMatch ? parseInt(seasonStartYearMatch[1], 10) : 0;

            // Ermittle ScoreEntryType basierend auf den Daten im ersten Fixture
            let detectedScoreEntryType: ScoreEntryType = ScoreEntryType.SET_SCORES; // Standardwert mit explizitem Typ
            const firstFixture = fixturesData[0];
            if (firstFixture) {
                const hasSetScores = firstFixture.S1H !== null && firstFixture.S1H !== undefined && String(firstFixture.S1H).trim() !== '' ||
                                     firstFixture.S1G !== null && firstFixture.S1G !== undefined && String(firstFixture.S1G).trim() !== '';
                const hasBallScores = firstFixture.hasOwnProperty('BälleH') || firstFixture.hasOwnProperty('BälleG'); // Prüfe ob Schlüssel existiert

                if (hasSetScores) {
                    detectedScoreEntryType = ScoreEntryType.SET_SCORES;
                    console.log(`   Detected ScoreEntryType.SET_SCORES based on S1H/S1G in first fixture.`);
                } else if (hasBallScores) {
                    detectedScoreEntryType = ScoreEntryType.MATCH_SCORE;
                    console.log(`   Detected ScoreEntryType.MATCH_SCORE based on BälleH/BälleG in first fixture.`);
                } else {
                    console.warn(`   Could not reliably detect ScoreEntryType for ${filename}. Defaulting to SET_SCORES.`);
                }
            } else {
                 console.warn(`   Could not read first fixture to detect ScoreEntryType for ${filename}. Defaulting to SET_SCORES.`);
            }
            // pointsConfig.scoreEntryType = detectedScoreEntryType; // Setze den ermittelten Typ - Wird unten zusammengeführt

            // Setze Punktregeln basierend auf dem Jahr (unabhängig vom ScoreEntryType)
            let specificPoints = {};
            if (seasonStartYear >= 2022) {
                // Punktregeln für neuere Saisons (Annahme: 3/2/1/0)
                specificPoints = {
                    pointsWin30: 3, pointsWin31: 3, pointsWin32: 2,
                    pointsLoss32: 1,
                };
                console.log(`   Using detailed point system (3/2/1/0) for season ${seasonYear}.`);
            } else {
                // Einfache Regeln für historische Saisons (2/0)
                specificPoints = {
                    pointsWin30: 2, pointsWin31: 2, pointsWin32: 2,
                    pointsLoss32: 0,
                };
                console.log(`   Using simple point system (2/0) for season ${seasonYear}.`);
            }

            // Kombiniere Punktregeln und ScoreEntryType für das Upsert
            pointsConfig = {
                ...specificPoints,
                scoreEntryType: detectedScoreEntryType, // Füge den ermittelten Typ hier hinzu
            };

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
                if (homeSets !== null && awaySets !== null && homeMatchPoints !== null && awayMatchPoints !== null) {
                    // Einfache Konsistenzprüfung - Gewinner sollte mehr Punkte haben
                    if ((homeSets > awaySets && homeMatchPoints <= awayMatchPoints) || 
                        (homeSets < awaySets && homeMatchPoints >= awayMatchPoints)) {
                        console.warn(`      Points mismatch for ${homeTeamName} vs ${awayTeamName}: Sets (${homeSets}:${awaySets}), Points (${homeMatchPoints}:${awayMatchPoints})`);
                    }
                }
                try {
                    // Datenobjekt für Prisma erstellen
                    const fixtureInputData = {
                        order: order, // order wird nach erfolgreichem Create erhöht
                        matchday: matchday,
                        round: matchday, // Annahme: Runde = Spieltag
                        fixtureDate: fixtureDate,
                        fixtureTime: fix.Uhrzeit && fix.Uhrzeit !== '-' ? fix.Uhrzeit : null, // Füge die Uhrzeit hinzu
                        // Verknüpfungen über connect herstellen
                        league: { connect: { id: league.id } },
                        homeTeam: { connect: { id: homeTeamId } },
                        awayTeam: { connect: { id: awayTeamId } },
                        // Einzelne Sätze
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
                        // Gesamtergebnisse
                        homeScore: homeSets,
                        awayScore: awaySets,
                        homeMatchPoints: homeMatchPoints,
                        awayMatchPoints: awayMatchPoints,
                        notes: fix.Anmerkungen || null,
                    };

                    await prisma.fixture.create({ data: fixtureInputData });
                    order++; // Erhöhe Order nur bei Erfolg
                    createdCount++;
                } catch (fixtureError) {
                    console.error(`      Error creating fixture for ${homeTeamName} vs ${awayTeamName}:`, fixtureError);
                    console.error(`      Fixture data:`, JSON.stringify(fix));
                    skippedCount++;
                    // Entscheide, ob hier abgebrochen werden soll oder nur dieses übersprungen wird
                    // throw fixtureError; // Abbruch
                }
            } // Ende der for-Schleife für Fixtures
            console.log(`   Created ${createdCount} fixtures, skipped ${skippedCount}.`);

        } catch (error) { // Catch für Fehler beim Verarbeiten der Saison-Datei (Lesen, Parsen, Liga erstellen)
            console.error(`❌ Error processing file ${filename}:`, error);
            throw error; // Wirft den Fehler weiter, um den Prozess in seed.ts zu stoppen
        }
    } // Ende der for-Schleife für Saison-Dateien
} // Ende der main Funktion

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
