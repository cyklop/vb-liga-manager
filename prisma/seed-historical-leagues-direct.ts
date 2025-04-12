import { PrismaClient, Prisma, ScoreEntryType } from '@prisma/client'
import { createSlug } from '../src/lib/slugify'

const prisma = new PrismaClient()

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
    
    try {
        // Ersetze deutsche Monatsabkürzungen/Namen
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
             return null;
        }

        const day = dateParts[1].padStart(2, '0');
        const month = dateParts[2].padStart(2, '0');
        const year = dateParts[3];

        // Extrahiere Zeit: HH:MM
        const timeParts = timeStr.match(/(\d{1,2}):(\d{2})/);
        if (!timeParts) {
             return null;
        }

        const hours = timeParts[1].padStart(2, '0');
        const minutes = timeParts[2];

        // Erstelle ISO String (YYYY-MM-DDTHH:mm:ss)
        const isoString = `${year}-${month}-${day}T${hours}:${minutes}:00`;

        // Prüfe, ob das Datum gültig ist
        const dateObj = new Date(isoString);
        if (isNaN(dateObj.getTime())) {
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

// Direkte Definition der Fixtures für die Saison 2015-16
const fixtures_2015_16 = [
  {
    "Spieltag": 1,
    "Datum": "27. Nov 2015",
    "Uhrzeit": "19:30 Uhr",
    "Heimmannschaft": "TSV Bad Berneck",
    "Gastmannschaft": "SJR Hof",
    "S1H": 25, "S1G": 16, "S2H": 25, "S2G": 17, "S3H": 25, "S3G": 21, "S4H": null, "S4G": null, "S5H": null, "S5G": null,
    "EndH": 3, "EndG": 0, "PktH": 2, "PktG": 0, "Anmerkungen": ""
  },
  {
    "Spieltag": 1,
    "Datum": "24. Nov 2015",
    "Uhrzeit": "20:00 Uhr",
    "Heimmannschaft": "TV Kirchenlamitz",
    "Gastmannschaft": "ATSV Oberkotzau",
    "S1H": 20, "S1G": 25, "S2H": 17, "S2G": 25, "S3H": 18, "S3G": 25, "S4H": null, "S4G": null, "S5H": null, "S5G": null,
    "EndH": 0, "EndG": 3, "PktH": 0, "PktG": 2, "Anmerkungen": ""
  },
  {
    "Spieltag": 1,
    "Datum": "22. Dez 2015",
    "Uhrzeit": "19:00 Uhr",
    "Heimmannschaft": "TSV Speichersdorf",
    "Gastmannschaft": "TV Helmbrechts",
    "S1H": 22, "S1G": 25, "S2H": 25, "S2G": 17, "S3H": 18, "S3G": 25, "S4H": 25, "S4G": 21, "S5H": 9, "S5G": 15,
    "EndH": 2, "EndG": 3, "PktH": 0, "PktG": 2, "Anmerkungen": "verschoben, Nachholtermin folgt!"
  },
  {
    "Spieltag": 1,
    "Datum": "27. Nov 2015",
    "Uhrzeit": "20:30 Uhr",
    "Heimmannschaft": "TSV Thurnau",
    "Gastmannschaft": "TSV Helmbrechts",
    "S1H": 25, "S1G": 0, "S2H": 25, "S2G": 0, "S3H": 25, "S3G": 0, "S4H": null, "S4G": null, "S5H": null, "S5G": null,
    "EndH": 3, "EndG": 0, "PktH": 2, "PktG": 0, "Anmerkungen": "(Wertung)"
  },
  {
    "Spieltag": 2,
    "Datum": "7. Dez 2015",
    "Uhrzeit": "20:00 Uhr",
    "Heimmannschaft": "TV Helmbrechts",
    "Gastmannschaft": "TSV Bad Berneck",
    "S1H": 25, "S1G": 21, "S2H": 23, "S2G": 25, "S3H": 25, "S3G": 20, "S4H": 17, "S4G": 25, "S5H": 14, "S5G": 25,
    "EndH": 2, "EndG": 3, "PktH": 0, "PktG": 2, "Anmerkungen": ""
  },
  {
    "Spieltag": 2,
    "Datum": "8. Dez 2015",
    "Uhrzeit": "20:00 Uhr",
    "Heimmannschaft": "TV Kirchenlamitz",
    "Gastmannschaft": "TSV Speichersdorf",
    "S1H": 30, "S1G": 28, "S2H": 25, "S2G": 21, "S3H": 14, "S3G": 25, "S4H": 19, "S4G": 25, "S5H": 14, "S5G": 16,
    "EndH": 2, "EndG": 3, "PktH": 0, "PktG": 2, "Anmerkungen": ""
  },
  {
    "Spieltag": 2,
    "Datum": "11. Dez 2015",
    "Uhrzeit": "20:30 Uhr",
    "Heimmannschaft": "TSV Thurnau",
    "Gastmannschaft": "SJR Hof",
    "S1H": 19, "S1G": 25, "S2H": 23, "S2G": 25, "S3H": 25, "S3G": 17, "S4H": 21, "S4G": 25, "S5H": null, "S5G": null,
    "EndH": 1, "EndG": 3, "PktH": 0, "PktG": 2, "Anmerkungen": ""
  },
  {
    "Spieltag": 2,
    "Datum": "10. Dez 2015",
    "Uhrzeit": "19:30 Uhr",
    "Heimmannschaft": "ATSV Oberkotzau",
    "Gastmannschaft": "TSV Helmbrechts",
    "S1H": 25, "S1G": 16, "S2H": 25, "S2G": 18, "S3H": 25, "S3G": 21, "S4H": null, "S4G": null, "S5H": null, "S5G": null,
    "EndH": 3, "EndG": 0, "PktH": 2, "PktG": 0, "Anmerkungen": ""
  },
  {
    "Spieltag": 3,
    "Datum": "19. Jan 2016",
    "Uhrzeit": "20:00 Uhr",
    "Heimmannschaft": "TV Kirchenlamitz",
    "Gastmannschaft": "TV Helmbrechts",
    "S1H": 25, "S1G": 20, "S2H": 22, "S2G": 25, "S3H": 25, "S3G": 21, "S4H": 25, "S4G": 11, "S5H": null, "S5G": null,
    "EndH": 3, "EndG": 1, "PktH": 2, "PktG": 0, "Anmerkungen": "Bayreuth hat wegen Spielermangel für heute abgesagt. Kein Nachholtermin!"
  },
  {
    "Spieltag": 3,
    "Datum": "22. Jan 2016",
    "Uhrzeit": "20:30 Uhr",
    "Heimmannschaft": "TSV Thurnau",
    "Gastmannschaft": "TSV Bad Berneck",
    "S1H": 25, "S1G": 0, "S2H": 25, "S2G": 0, "S3H": 25, "S3G": 0, "S4H": null, "S4G": null, "S5H": null, "S5G": null,
    "EndH": 3, "EndG": 0, "PktH": 2, "PktG": 0, "Anmerkungen": "(Wertung)"
  },
  {
    "Spieltag": 3,
    "Datum": "24. Jan 2016",
    "Uhrzeit": "18:00 Uhr",
    "Heimmannschaft": "TSV Helmbrechts",
    "Gastmannschaft": "TSV Speichersdorf",
    "S1H": 25, "S1G": 23, "S2H": 19, "S2G": 25, "S3H": 25, "S3G": 22, "S4H": 24, "S4G": 26, "S5H": 15, "S5G": 10,
    "EndH": 3, "EndG": 2, "PktH": 2, "PktG": 0, "Anmerkungen": ""
  },
  {
    "Spieltag": 3,
    "Datum": "21. Jan 2016",
    "Uhrzeit": "19:30 Uhr",
    "Heimmannschaft": "ATSV Oberkotzau",
    "Gastmannschaft": "SJR Hof",
    "S1H": 25, "S1G": 17, "S2H": 25, "S2G": 22, "S3H": 29, "S3G": 27, "S4H": null, "S4G": null, "S5H": null, "S5G": null,
    "EndH": 3, "EndG": 0, "PktH": 2, "PktG": 0, "Anmerkungen": ""
  },
  {
    "Spieltag": 4,
    "Datum": "1. Feb 2016",
    "Uhrzeit": "20:00 Uhr",
    "Heimmannschaft": "TV Helmbrechts",
    "Gastmannschaft": "TSV Thurnau",
    "S1H": 25, "S1G": 20, "S2H": 24, "S2G": 26, "S3H": 25, "S3G": 17, "S4H": 25, "S4G": 19, "S5H": null, "S5G": null,
    "EndH": 3, "EndG": 1, "PktH": 2, "PktG": 0, "Anmerkungen": ""
  },
  {
    "Spieltag": 4,
    "Datum": "7. Feb 2016",
    "Uhrzeit": "18:00 Uhr",
    "Heimmannschaft": "TSV Helmbrechts",
    "Gastmannschaft": "TV Kirchenlamitz",
    "S1H": 25, "S1G": 20, "S2H": 25, "S2G": 11, "S3H": 21, "S3G": 25, "S4H": 25, "S4G": 23, "S5H": null, "S5G": null,
    "EndH": 3, "EndG": 1, "PktH": 2, "PktG": 0, "Anmerkungen": ""
  },
  {
    "Spieltag": 4,
    "Datum": "4. Feb 2016",
    "Uhrzeit": "19:30 Uhr",
    "Heimmannschaft": "ATSV Oberkotzau",
    "Gastmannschaft": "TSV Bad Berneck",
    "S1H": 25, "S1G": 23, "S2H": 17, "S2G": 25, "S3H": 20, "S3G": 25, "S4H": 17, "S4G": 25, "S5H": null, "S5G": null,
    "EndH": 1, "EndG": 3, "PktH": 0, "PktG": 2, "Anmerkungen": ""
  },
  {
    "Spieltag": 4,
    "Datum": "4. Feb 2016",
    "Uhrzeit": "20:15 Uhr",
    "Heimmannschaft": "SJR Hof",
    "Gastmannschaft": "TSV Speichersdorf",
    "S1H": 23, "S1G": 25, "S2H": 25, "S2G": 12, "S3H": 25, "S3G": 15, "S4H": 25, "S4G": 22, "S5H": null, "S5G": null,
    "EndH": 3, "EndG": 1, "PktH": 2, "PktG": 0, "Anmerkungen": ""
  },
  {
    "Spieltag": 5,
    "Datum": "21. Feb 2016",
    "Uhrzeit": "18:00 Uhr",
    "Heimmannschaft": "TSV Helmbrechts",
    "Gastmannschaft": "TV Helmbrechts",
    "S1H": 25, "S1G": 15, "S2H": 14, "S2G": 25, "S3H": 25, "S3G": 22, "S4H": 21, "S4G": 25, "S5H": 11, "S5G": 15,
    "EndH": 2, "EndG": 3, "PktH": 0, "PktG": 2, "Anmerkungen": "(Anmerkung: TSV vs TV Helmbrechts?)"
  },
  {
    "Spieltag": 5,
    "Datum": "18. Feb 2016",
    "Uhrzeit": "19:30 Uhr",
    "Heimmannschaft": "ATSV Oberkotzau",
    "Gastmannschaft": "TSV Thurnau",
    "S1H": 25, "S1G": 14, "S2H": 25, "S2G": 16, "S3H": 25, "S3G": 14, "S4H": null, "S4G": null, "S5H": null, "S5G": null,
    "EndH": 3, "EndG": 0, "PktH": 2, "PktG": 0, "Anmerkungen": ""
  },
  {
    "Spieltag": 5,
    "Datum": "18. Feb 2016",
    "Uhrzeit": "20:15 Uhr",
    "Heimmannschaft": "SJR Hof",
    "Gastmannschaft": "TV Kirchenlamitz",
    "S1H": 24, "S1G": 26, "S2H": 26, "S2G": 24, "S3H": 14, "S3G": 25, "S4H": 14, "S4G": 25, "S5H": null, "S5G": null,
    "EndH": 1, "EndG": 3, "PktH": 0, "PktG": 2, "Anmerkungen": ""
  },
  {
    "Spieltag": 5,
    "Datum": "16. Feb 2016",
    "Uhrzeit": "19:00 Uhr",
    "Heimmannschaft": "TSV Speichersdorf",
    "Gastmannschaft": "TSV Bad Berneck",
    "S1H": 21, "S1G": 25, "S2H": 25, "S2G": 19, "S3H": 24, "S3G": 26, "S4H": 23, "S4G": 25, "S5H": null, "S5G": null,
    "EndH": 1, "EndG": 3, "PktH": 0, "PktG": 2, "Anmerkungen": ""
  },
  {
    "Spieltag": 6,
    "Datum": "25. Feb 2016",
    "Uhrzeit": "19:30 Uhr",
    "Heimmannschaft": "ATSV Oberkotzau",
    "Gastmannschaft": "TV Helmbrechts",
    "S1H": 28, "S1G": 26, "S2H": 27, "S2G": 25, "S3H": 25, "S3G": 27, "S4H": 21, "S4G": 25, "S5H": 15, "S5G": 10,
    "EndH": 3, "EndG": 2, "PktH": 2, "PktG": 0, "Anmerkungen": ""
  },
  {
    "Spieltag": 6,
    "Datum": "25. Feb 2016",
    "Uhrzeit": "20:15 Uhr",
    "Heimmannschaft": "SJR Hof",
    "Gastmannschaft": "TSV Helmbrechts",
    "S1H": 25, "S1G": 0, "S2H": 25, "S2G": 0, "S3H": 25, "S3G": 0, "S4H": null, "S4G": null, "S5H": null, "S5G": null,
    "EndH": 3, "EndG": 0, "PktH": 2, "PktG": 0, "Anmerkungen": "Nachholtermin (Wertung)"
  },
  {
    "Spieltag": 6,
    "Datum": "4. Mär 2016",
    "Uhrzeit": "20:30 Uhr",
    "Heimmannschaft": "TSV Speichersdorf",
    "Gastmannschaft": "TSV Thurnau",
    "S1H": 25, "S1G": 27, "S2H": 25, "S2G": 17, "S3H": 25, "S3G": 13, "S4H": 25, "S4G": 16, "S5H": null, "S5G": null,
    "EndH": 3, "EndG": 1, "PktH": 2, "PktG": 0, "Anmerkungen": ""
  },
  {
    "Spieltag": 6,
    "Datum": "26. Feb 2016",
    "Uhrzeit": "19:30 Uhr",
    "Heimmannschaft": "TSV Bad Berneck",
    "Gastmannschaft": "TV Kirchenlamitz",
    "S1H": 22, "S1G": 25, "S2H": 25, "S2G": 18, "S3H": 25, "S3G": 23, "S4H": 18, "S4G": 25, "S5H": 4, "S5G": 15,
    "EndH": 2, "EndG": 3, "PktH": 0, "PktG": 2, "Anmerkungen": ""
  },
  {
    "Spieltag": 7,
    "Datum": "10. Mär 2016",
    "Uhrzeit": "20:15 Uhr",
    "Heimmannschaft": "SJR Hof",
    "Gastmannschaft": "TV Helmbrechts",
    "S1H": 22, "S1G": 25, "S2H": 25, "S2G": 17, "S3H": 23, "S3G": 25, "S4H": 25, "S4G": 15, "S5H": 15, "S5G": 8,
    "EndH": 3, "EndG": 2, "PktH": 2, "PktG": 0, "Anmerkungen": "NEUER TERMIN!!!"
  },
  {
    "Spieltag": 7,
    "Datum": "17. Mär 2016",
    "Uhrzeit": "19:30 Uhr",
    "Heimmannschaft": "ATSV Oberkotzau",
    "Gastmannschaft": "TSV Speichersdorf",
    "S1H": 25, "S1G": 19, "S2H": 19, "S2G": 25, "S3H": 25, "S3G": 22, "S4H": 25, "S4G": 23, "S5H": null, "S5G": null,
    "EndH": 3, "EndG": 1, "PktH": 2, "PktG": 0, "Anmerkungen": ""
  },
  {
    "Spieltag": 7,
    "Datum": "11. Mär 2016",
    "Uhrzeit": "19:30 Uhr",
    "Heimmannschaft": "TSV Bad Berneck",
    "Gastmannschaft": "TSV Helmbrechts",
    "S1H": 25, "S1G": 0, "S2H": 25, "S2G": 0, "S3H": 25, "S3G": 0, "S4H": null, "S4G": null, "S5H": null, "S5G": null,
    "EndH": 3, "EndG": 0, "PktH": 2, "PktG": 0, "Anmerkungen": "(Wertung)"
  },
  {
    "Spieltag": 7,
    "Datum": "8. Mär 2016",
    "Uhrzeit": "20:00 Uhr",
    "Heimmannschaft": "TV Kirchenlamitz",
    "Gastmannschaft": "TSV Thurnau",
    "S1H": 25, "S1G": 22, "S2H": 25, "S2G": 14, "S3H": 25, "S3G": 16, "S4H": null, "S4G": null, "S5H": null, "S5G": null,
    "EndH": 3, "EndG": 0, "PktH": 2, "PktG": 0, "Anmerkungen": ""
  },
  {
    "Spieltag": 8,
    "Datum": "7. Apr 2016",
    "Uhrzeit": "20:15 Uhr",
    "Heimmannschaft": "SJR Hof",
    "Gastmannschaft": "TSV Bad Berneck",
    "S1H": 19, "S1G": 25, "S2H": 15, "S2G": 25, "S3H": 25, "S3G": 23, "S4H": 16, "S4G": 25, "S5H": null, "S5G": null,
    "EndH": 1, "EndG": 3, "PktH": 0, "PktG": 2, "Anmerkungen": "Termin vom 05.04.16 auf 07.04.16 verschoben!"
  },
  {
    "Spieltag": 8,
    "Datum": "7. Apr 2016",
    "Uhrzeit": "19:30 Uhr",
    "Heimmannschaft": "ATSV Oberkotzau",
    "Gastmannschaft": "TV Kirchenlamitz",
    "S1H": 25, "S1G": 15, "S2H": 13, "S2G": 25, "S3H": 25, "S3G": 20, "S4H": 25, "S4G": 18, "S5H": null, "S5G": null,
    "EndH": 3, "EndG": 1, "PktH": 2, "PktG": 0, "Anmerkungen": "NEUER TERMIN!!!"
  },
  {
    "Spieltag": 8,
    "Datum": "18. Apr 2016",
    "Uhrzeit": "20:00 Uhr",
    "Heimmannschaft": "TV Helmbrechts",
    "Gastmannschaft": "TSV Speichersdorf",
    "S1H": 19, "S1G": 25, "S2H": 25, "S2G": 11, "S3H": 25, "S3G": 16, "S4H": 25, "S4G": 15, "S5H": null, "S5G": null,
    "EndH": 3, "EndG": 1, "PktH": 2, "PktG": 0, "Anmerkungen": ""
  },
  {
    "Spieltag": 8,
    "Datum": "10. Apr 2016",
    "Uhrzeit": "18:00 Uhr",
    "Heimmannschaft": "TSV Helmbrechts",
    "Gastmannschaft": "TSV Thurnau",
    "S1H": 0, "S1G": 25, "S2H": 0, "S2G": 25, "S3H": 0, "S3G": 25, "S4H": null, "S4G": null, "S5H": null, "S5G": null,
    "EndH": 0, "EndG": 3, "PktH": 0, "PktG": 2, "Anmerkungen": "VERSCHOBEN. NEUER TERMIN! (Wertung trotz Hinweis?)"
  },
  {
    "Spieltag": 9,
    "Datum": "6. Mai 2016",
    "Uhrzeit": "19:30 Uhr",
    "Heimmannschaft": "TSV Bad Berneck",
    "Gastmannschaft": "TV Helmbrechts",
    "S1H": 25, "S1G": 16, "S2H": 18, "S2G": 25, "S3H": 25, "S3G": 21, "S4H": 24, "S4G": 26, "S5H": 9, "S5G": 15,
    "EndH": 2, "EndG": 3, "PktH": 0, "PktG": 2, "Anmerkungen": ""
  },
  {
    "Spieltag": 9,
    "Datum": "19. Apr 2016",
    "Uhrzeit": "19:30 Uhr",
    "Heimmannschaft": "TSV Speichersdorf",
    "Gastmannschaft": "TV Kirchenlamitz",
    "S1H": 25, "S1G": 22, "S2H": 25, "S2G": 21, "S3H": 25, "S3G": 23, "S4H": null, "S4G": null, "S5H": null, "S5G": null,
    "EndH": 3, "EndG": 0, "PktH": 2, "PktG": 0, "Anmerkungen": ""
  },
  {
    "Spieltag": 9,
    "Datum": "21. Apr 2016",
    "Uhrzeit": "20:15 Uhr",
    "Heimmannschaft": "SJR Hof",
    "Gastmannschaft": "TSV Thurnau",
    "S1H": 25, "S1G": 0, "S2H": 25, "S2G": 0, "S3H": 25, "S3G": 0, "S4H": null, "S4G": null, "S5H": null, "S5G": null,
    "EndH": 3, "EndG": 0, "PktH": 2, "PktG": 0, "Anmerkungen": "Das Spiel wurde vom TUS Neusorg abgesagt! (Wertung)"
  },
  {
    "Spieltag": 9,
    "Datum": "19. Apr 2016",
    "Uhrzeit": "20:00 Uhr",
    "Heimmannschaft": "TSV Helmbrechts",
    "Gastmannschaft": "ATSV Oberkotzau",
    "S1H": 0, "S1G": 25, "S2H": 0, "S2G": 25, "S3H": 0, "S3G": 25, "S4H": null, "S4G": null, "S5H": null, "S5G": null,
    "EndH": 0, "EndG": 3, "PktH": 0, "PktG": 2, "Anmerkungen": "(Wertung)"
  },
  {
    "Spieltag": 10,
    "Datum": "25. Apr 2016",
    "Uhrzeit": "20:00 Uhr",
    "Heimmannschaft": "TV Helmbrechts",
    "Gastmannschaft": "TV Kirchenlamitz",
    "S1H": 25, "S1G": 20, "S2H": 25, "S2G": 23, "S3H": 25, "S3G": 22, "S4H": null, "S4G": null, "S5H": null, "S5G": null,
    "EndH": 3, "EndG": 0, "PktH": 2, "PktG": 0, "Anmerkungen": ""
  },
  {
    "Spieltag": 10,
    "Datum": "29. Apr 2016",
    "Uhrzeit": "19:30 Uhr",
    "Heimmannschaft": "TSV Bad Berneck",
    "Gastmannschaft": "TSV Thurnau",
    "S1H": 25, "S1G": 0, "S2H": 25, "S2G": 0, "S3H": 25, "S3G": 0, "S4H": null, "S4G": null, "S5H": null, "S5G": null,
    "EndH": 3, "EndG": 0, "PktH": 2, "PktG": 0, "Anmerkungen": "(Wertung)"
  },
  {
    "Spieltag": 10,
    "Datum": "26. Apr 2016",
    "Uhrzeit": "19:30 Uhr",
    "Heimmannschaft": "TSV Speichersdorf",
    "Gastmannschaft": "TSV Helmbrechts",
    "S1H": 25, "S1G": 0, "S2H": 25, "S2G": 0, "S3H": 25, "S3G": 0, "S4H": null, "S4G": null, "S5H": null, "S5G": null,
    "EndH": 3, "EndG": 0, "PktH": 2, "PktG": 0, "Anmerkungen": "Spiel wird verschoben! (Wertung trotz Hinweis?)"
  },
  {
    "Spieltag": 10,
    "Datum": "2. Jun 2016",
    "Uhrzeit": "19:30 Uhr",
    "Heimmannschaft": "SJR Hof",
    "Gastmannschaft": "ATSV Oberkotzau",
    "S1H": 21, "S1G": 25, "S2H": 25, "S2G": 20, "S3H": 12, "S3G": 25, "S4H": 9, "S4G": 25, "S5H": null, "S5G": null,
    "EndH": 1, "EndG": 3, "PktH": 0, "PktG": 2, "Anmerkungen": ""
  },
  {
    "Spieltag": 11,
    "Datum": "13. Mai 2016",
    "Uhrzeit": "20:30 Uhr",
    "Heimmannschaft": "TSV Thurnau",
    "Gastmannschaft": "TV Helmbrechts",
    "S1H": 0, "S1G": 25, "S2H": 0, "S2G": 25, "S3H": 0, "S3G": 25, "S4H": null, "S4G": null, "S5H": null, "S5G": null,
    "EndH": 0, "EndG": 3, "PktH": 0, "PktG": 2, "Anmerkungen": "(Wertung)"
  },
  {
    "Spieltag": 11,
    "Datum": "10. Mai 2016",
    "Uhrzeit": "20:00 Uhr",
    "Heimmannschaft": "TV Kirchenlamitz",
    "Gastmannschaft": "TSV Helmbrechts",
    "S1H": 25, "S1G": 0, "S2H": 25, "S2G": 0, "S3H": 25, "S3G": 0, "S4H": null, "S4G": null, "S5H": null, "S5G": null,
    "EndH": 3, "EndG": 0, "PktH": 2, "PktG": 0, "Anmerkungen": "AUSTRAGUNGSORT SPEICHERSDORF (Wertung)"
  },
  {
    "Spieltag": 11,
    "Datum": "12. Mai 2016",
    "Uhrzeit": "19:30 Uhr",
    "Heimmannschaft": "TSV Bad Berneck",
    "Gastmannschaft": "ATSV Oberkotzau",
    "S1H": 20, "S1G": 25, "S2H": 25, "S2G": 21, "S3H": 9, "S3G": 25, "S4H": 25, "S4G": 15, "S5H": 14, "S5G": 16,
    "EndH": 2, "EndG": 3, "PktH": 0, "PktG": 2, "Anmerkungen": ""
  },
  {
    "Spieltag": 11,
    "Datum": "10. Mai 2016",
    "Uhrzeit": "19:00 Uhr",
    "Heimmannschaft": "TSV Speichersdorf",
    "Gastmannschaft": "SJR Hof",
    "S1H": 25, "S1G": 0, "S2H": 25, "S2G": 0, "S3H": 25, "S3G": 0, "S4H": null, "S4G": null, "S5H": null, "S5G": null,
    "EndH": 3, "EndG": 0, "PktH": 2, "PktG": 0, "Anmerkungen": "(Wertung)"
  },
  {
    "Spieltag": 12,
    "Datum": "30. Mai 2016",
    "Uhrzeit": "20:00 Uhr",
    "Heimmannschaft": "TV Helmbrechts",
    "Gastmannschaft": "TSV Helmbrechts",
    "S1H": 25, "S1G": 0, "S2H": 25, "S2G": 0, "S3H": 25, "S3G": 0, "S4H": null, "S4G": null, "S5H": null, "S5G": null,
    "EndH": 3, "EndG": 0, "PktH": 2, "PktG": 0, "Anmerkungen": "AUSTRAGUNGSORT SPEICHERSDORF (Wertung, TSV vs TV Helmbrechts?)"
  },
  {
    "Spieltag": 12,
    "Datum": "31. Mai 2016",
    "Uhrzeit": "20:00 Uhr",
    "Heimmannschaft": "TSV Thurnau",
    "Gastmannschaft": "ATSV Oberkotzau",
    "S1H": 0, "S1G": 25, "S2H": 0, "S2G": 25, "S3H": 0, "S3G": 25, "S4H": null, "S4G": null, "S5H": null, "S5G": null,
    "EndH": 0, "EndG": 3, "PktH": 0, "PktG": 2, "Anmerkungen": "(Wertung)"
  },
  {
    "Spieltag": 12,
    "Datum": "31. Mai 2016",
    "Uhrzeit": "20:00 Uhr",
    "Heimmannschaft": "TV Kirchenlamitz",
    "Gastmannschaft": "SJR Hof",
    "S1H": 25, "S1G": 0, "S2H": 25, "S2G": 0, "S3H": 25, "S3G": 0, "S4H": null, "S4G": null, "S5H": null, "S5G": null,
    "EndH": 3, "EndG": 0, "PktH": 2, "PktG": 0, "Anmerkungen": "Spiel auf 17.06. verschoben (Wertung trotz Hinweis?)"
  },
  {
    "Spieltag": 12,
    "Datum": "3. Jun 2016",
    "Uhrzeit": "19:30 Uhr",
    "Heimmannschaft": "TSV Bad Berneck",
    "Gastmannschaft": "TSV Speichersdorf",
    "S1H": 25, "S1G": 19, "S2H": 22, "S2G": 25, "S3H": 25, "S3G": 19, "S4H": 22, "S4G": 25, "S5H": 8, "S5G": 15,
    "EndH": 2, "EndG": 3, "PktH": 0, "PktG": 2, "Anmerkungen": "AUSTRAGUNGSORT SPEICHERSDORF"
  },
  {
    "Spieltag": 13,
    "Datum": "31. Mai 2016",
    "Uhrzeit": "20:00 Uhr",
    "Heimmannschaft": "TV Helmbrechts",
    "Gastmannschaft": "ATSV Oberkotzau",
    "S1H": 21, "S1G": 25, "S2H": 25, "S2G": 15, "S3H": 25, "S3G": 17, "S4H": 9, "S4G": 25, "S5H": 15, "S5G": 9,
    "EndH": 3, "EndG": 2, "PktH": 2, "PktG": 0, "Anmerkungen": ""
  },
  {
    "Spieltag": 13,
    "Datum": "-",
    "Uhrzeit": "-",
    "Heimmannschaft": "TSV Helmbrechts",
    "Gastmannschaft": "SJR Hof",
    "S1H": 0, "S1G": 25, "S2H": 0, "S2G": 25, "S3H": 0, "S3G": 25, "S4H": null, "S4G": null, "S5H": null, "S5G": null,
    "EndH": 0, "EndG": 3, "PktH": 0, "PktG": 2, "Anmerkungen": "(Wertung, Datum/Uhrzeit fehlen)"
  },
  {
    "Spieltag": 13,
    "Datum": "-",
    "Uhrzeit": "-",
    "Heimmannschaft": "TSV Thurnau",
    "Gastmannschaft": "TSV Speichersdorf",
    "S1H": 0, "S1G": 25, "S2H": 0, "S2G": 25, "S3H": 0, "S3G": 25, "S4H": null, "S4G": null, "S5H": null, "S5G": null,
    "EndH": 0, "EndG": 3, "PktH": 0, "PktG": 2, "Anmerkungen": "(Wertung, Datum/Uhrzeit fehlen)"
  },
  {
    "Spieltag": 13,
    "Datum": "14. Jun 2016",
    "Uhrzeit": "20:00 Uhr",
    "Heimmannschaft": "TV Kirchenlamitz",
    "Gastmannschaft": "TSV Bad Berneck",
    "S1H": 25, "S1G": 27, "S2H": 21, "S2G": 25, "S3H": 25, "S3G": 18, "S4H": 16, "S4G": 25, "S5H": null, "S5G": null,
    "EndH": 1, "EndG": 3, "PktH": 0, "PktG": 2, "Anmerkungen": ""
  },
  {
    "Spieltag": 14,
    "Datum": "13. Jun 2016",
    "Uhrzeit": "20:00 Uhr",
    "Heimmannschaft": "TV Helmbrechts",
    "Gastmannschaft": "SJR Hof",
    "S1H": 25, "S1G": 0, "S2H": 25, "S2G": 0, "S3H": 25, "S3G": 0, "S4H": null, "S4G": null, "S5H": null, "S5G": null,
    "EndH": 3, "EndG": 0, "PktH": 2, "PktG": 0, "Anmerkungen": "(Wertung)"
  },
  {
    "Spieltag": 14,
    "Datum": "14. Jun 2016",
    "Uhrzeit": "19:00 Uhr",
    "Heimmannschaft": "TSV Speichersdorf",
    "Gastmannschaft": "ATSV Oberkotzau",
    "S1H": 25, "S1G": 22, "S2H": 16, "S2G": 25, "S3H": 14, "S3G": 25, "S4H": 25, "S4G": 21, "S5H": 9, "S5G": 15,
    "EndH": 2, "EndG": 3, "PktH": 0, "PktG": 2, "Anmerkungen": ""
  },
  {
    "Spieltag": 14,
    "Datum": "-",
    "Uhrzeit": "-",
    "Heimmannschaft": "TSV Helmbrechts",
    "Gastmannschaft": "TSV Bad Berneck",
    "S1H": 0, "S1G": 25, "S2H": 0, "S2G": 25, "S3H": 0, "S3G": 25, "S4H": null, "S4G": null, "S5H": null, "S5G": null,
    "EndH": 0, "EndG": 3, "PktH": 0, "PktG": 2, "Anmerkungen": "(Wertung, Datum/Uhrzeit fehlen)"
  },
  {
    "Spieltag": 14,
    "Datum": "-",
    "Uhrzeit": "-",
    "Heimmannschaft": "TSV Thurnau",
    "Gastmannschaft": "TV Kirchenlamitz",
    "S1H": 0, "S1G": 25, "S2H": 0, "S2G": 25, "S3H": 0, "S3G": 25, "S4H": null, "S4G": null, "S5H": null, "S5G": null,
    "EndH": 0, "EndG": 3, "PktH": 0, "PktG": 2, "Anmerkungen": "(Wertung, Datum/Uhrzeit fehlen)"
  }
];

// Hauptfunktion für das Seeden der historischen Daten
export async function main() {
    console.log('Start seeding historical league data directly...');

    // Globale Map für alle Teams
    const globalTeamMap: { [name: string]: number } = {};

    // 1. Alle Teams sammeln und erstellen/finden
    console.log('\n--- Ensuring all teams exist ---');
    const allTeamNames = new Set<string>();
    
    // Sammle alle Teamnamen aus den Fixtures
    fixtures_2015_16.forEach(f => {
        const homeTeam = normalizeTeamName(f.Heimmannschaft);
        const awayTeam = normalizeTeamName(f.Gastmannschaft);
        if (homeTeam) allTeamNames.add(homeTeam);
        if (awayTeam) allTeamNames.add(awayTeam);
    });

    // Erstelle oder finde alle Teams
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
        } catch (error) {
             console.error(`❌ Error upserting team "${name}":`, error);
             throw error;
        }
    }
    console.log(`   Ensured ${allTeamNames.size} unique teams.`);

    // 2. Liga erstellen
    // Liga-Name und Slug ableiten
    const leagueName = `Volleyball Hobbyliga 2015/2016`;
    const leagueSlug = createSlug(leagueName);
    console.log(`   League: ${leagueName} (Slug: ${leagueSlug})`);

    // Teams dieser Saison sammeln (nur Namen)
    const currentSeasonTeamNames = new Set<string>();
    fixtures_2015_16.forEach(f => {
         const homeTeam = normalizeTeamName(f.Heimmannschaft);
         const awayTeam = normalizeTeamName(f.Gastmannschaft);
         if (homeTeam) currentSeasonTeamNames.add(homeTeam);
         if (awayTeam) currentSeasonTeamNames.add(awayTeam);
    });

    // Team-IDs für die Verbindung holen
    const teamConnect = Array.from(currentSeasonTeamNames)
                            .map(name => ({ id: globalTeamMap[name] }))
                            .filter(t => t.id !== undefined);

    // Analyse Hin-/Rückspiele
    const pairings = new Map<string, number>();
    fixtures_2015_16.forEach(f => {
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

    // Punktregeln für historische Saison (2/0)
    const pointsConfig = {
        pointsWin30: 2, pointsWin31: 2, pointsWin32: 2,
        pointsLoss32: 0,
        scoreEntryType: ScoreEntryType.SET_SCORES
    };

    // Liga erstellen/aktualisieren
    const league = await prisma.league.upsert({
        where: { slug: leagueSlug },
        update: {
            name: leagueName,
            numberOfTeams: currentSeasonTeamNames.size,
            hasReturnMatches: hasReturnMatches,
            isActive: false, // Historische Liga ist nicht aktiv
            ...pointsConfig,
            teams: { set: teamConnect }
        },
        create: {
            name: leagueName,
            slug: leagueSlug,
            numberOfTeams: currentSeasonTeamNames.size,
            hasReturnMatches: hasReturnMatches,
            isActive: false, // Historische Liga ist nicht aktiv
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
    for (const fix of fixtures_2015_16) {
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
        const homeMatchPoints = safeParseInt(fix.PktH);
        const awayMatchPoints = safeParseInt(fix.PktG);

        try {
            // Datenobjekt für Prisma erstellen
            const fixtureInputData = {
                order: order,
                matchday: matchday,
                round: matchday, // Annahme: Runde = Spieltag
                fixtureDate: fixtureDate,
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
            order++;
            createdCount++;
        } catch (fixtureError) {
            console.error(`      Error creating fixture for ${homeTeamName} vs ${awayTeamName}:`, fixtureError);
            skippedCount++;
        }
    }
    console.log(`   Created ${createdCount} fixtures, skipped ${skippedCount}.`);
    console.log('Historical league data seeding completed successfully.');
}

// Führe main aus, wenn das Skript direkt aufgerufen wird
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
