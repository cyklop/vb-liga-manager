# Volleyball Liga Manager

Dies ist ein [Next.js](https://nextjs.org) Projekt zur Verwaltung von Volleyball-Hobbyligen, einschließlich Teams, Spielplänen, Ergebnissen und Tabellen.

## Projektübersicht

Die Anwendung bietet:
*   Benutzerverwaltung (Login, Registrierung, Rollen)
*   Teamverwaltung
*   Ligaverwaltung (Erstellung, Konfiguration von Punktregeln und Ergebnistyp)
*   Automatische Spielplanerstellung (Round Robin)
*   Ergebniseingabe (Satzergebnisse oder Matchergebnisse)
*   Automatische Tabellenberechnung
*   Öffentliche Ansicht für Ligen und Tabellen
*   Admin-Bereich zur Verwaltung aller Daten

## Key Technologies

*   **Framework:** [Next.js](https://nextjs.org) (App Router)
*   **Sprache:** [TypeScript](https://www.typescriptlang.org/)
*   **Datenbank ORM:** [Prisma](https://www.prisma.io/)
*   **Datenbank (Entwicklung):** SQLite
*   **Datenbank (Produktion):** MySQL (konfigurierbar über `DATABASE_URL`)
*   **Styling:** [Tailwind CSS](https://tailwindcss.com/)
*   **Authentifizierung:** [NextAuth.js](https://next-auth.js.org/)
*   **UI Komponenten:** [shadcn/ui](https://ui.shadcn.com/) (vermutlich, basierend auf typischen Next.js Projekten)
*   **Deployment:** [Vercel](https://vercel.com) (empfohlen), Plesk (siehe unten)

## Getting Started (Entwicklung)

**1. Abhängigkeiten installieren:**

```bash
npm install
# oder
yarn install
# oder
pnpm install
```

**2. Umgebungsvariablen einrichten:**

*   Kopieren Sie die `.env.example` Datei (falls vorhanden) nach `.env.local`.
*   Passen Sie die Variablen in `.env.local` an Ihre lokale Umgebung an. Wichtige Variablen sind:
    *   `DATABASE_URL`: (Für Entwicklung standardmäßig `file:./dev.db`)
    *   `NEXTAUTH_URL`: `http://localhost:3000` für lokale Entwicklung
    *   `NEXTAUTH_SECRET`: Ein geheimer Schlüssel (generieren Sie einen, z.B. mit `openssl rand -base64 32`)
    *   `EMAIL_SERVER_...` / `EMAIL_FROM`: Für den E-Mail-Versand (Passwort-Reset, etc.)

**3. Datenbank migrieren:**

Stellt sicher, dass das Datenbankschema aktuell ist (erstellt die `dev.db` Datei, falls nicht vorhanden).

```bash
npm run prisma:migrate
```

**4. Datenbank initial befüllen (Seeding):**

Erstellt den initialen Superadmin-Benutzer.

```bash
npm run prisma:seed
```
*   **Superadmin Login:** Verwenden Sie die E-Mail-Adresse und das Passwort, die im Seed-Skript (`prisma/seed.ts`) definiert sind (Standard: `superadmin@example.com` / `password123`).

**5. (Optional) Historische Daten importieren:**

Importiert Ligadaten aus den JSON-Dateien im `prisma/seed-data` Verzeichnis.

```bash
npm run prisma:seed:historical:all
```

**6. Entwicklungs-Server starten:**

```bash
npm run dev
# oder
yarn dev
# oder
pnpm dev
```

Öffnen Sie [http://localhost:3000](http://localhost:3000) mit Ihrem Browser, um das Ergebnis zu sehen.

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

Die Startseite (`app/page.tsx`) leitet standardmäßig zum Login weiter.

## Datenbank (Prisma)

Prisma wird für die Datenbankinteraktion verwendet.

*   **Schema:** Die Datenbankschemata befinden sich in `prisma/schema.dev.prisma` (für Entwicklung mit SQLite) und `prisma/schema.prod.prisma` (für Produktion mit MySQL). **Wichtig:** Halten Sie beide Schemata synchron (außer dem `datasource`-Block).
*   **Migrationen:** Änderungen am Schema werden über Migrationen verwaltet.
    *   `npm run prisma:migrate`: Erstellt und wendet Migrationen für die Entwicklungsumgebung an (`dev.db`).
    *   `npm run prisma:migrate:prod`: Wendet Migrationen auf die Produktionsdatenbank an (erfordert gesetzte `DATABASE_URL`).
*   **Prisma Client:** Nach Schemaänderungen muss der Prisma Client neu generiert werden.
    *   `npm run prisma:dev:generate`: Generiert den Client basierend auf `schema.dev.prisma`.
    *   `npm run prisma:prod:generate`: Generiert den Client basierend auf `schema.prod.prisma`.
*   **Seeding:**
    *   `npm run prisma:seed`: Führt das Haupt-Seed-Skript (`prisma/seed.ts`) aus (erstellt Superadmin).
    *   `npm run prisma:seed:historical:all`: Führt das Skript zum Importieren historischer Daten aus (`prisma/seed-historical-leagues.ts`).

## Environment Variables

Die Konfiguration erfolgt über Umgebungsvariablen, die in `.env.local` für die lokale Entwicklung gespeichert werden sollten (diese Datei ist in `.gitignore` enthalten). Eine `.env.example` Datei sollte als Vorlage dienen.

Wichtige Variablen:
*   `DATABASE_URL`: Verbindungsstring zur Datenbank (SQLite für Dev, MySQL für Prod).
*   `NEXTAUTH_URL`: Die Basis-URL der Anwendung.
*   `NEXTAUTH_SECRET`: Ein geheimer Schlüssel für NextAuth.js.
*   `EMAIL_SERVER_USER`, `EMAIL_SERVER_PASSWORD`, `EMAIL_SERVER_HOST`, `EMAIL_SERVER_PORT`, `EMAIL_FROM`: Konfiguration für den E-Mail-Versand.

## Available Scripts

Zusätzlich zu den Standard-Next.js-Skripten (`dev`, `build`, `start`, `lint`) gibt es spezifische Skripte in `package.json`:

*   `prisma:migrate`: Erstellt/Anwendet DB-Migrationen (Dev).
*   `prisma:migrate:prod`: Wendet DB-Migrationen an (Prod).
*   `prisma:dev:generate`: Generiert Prisma Client (Dev).
*   `prisma:prod:generate`: Generiert Prisma Client (Prod).
*   `prisma:seed`: Führt das Haupt-Seed-Skript aus.
*   `prisma:seed:historical:all`: Importiert historische Ligadaten.
*   `prisma:studio`: Öffnet Prisma Studio (GUI für die Dev-DB).

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.


## Plesk Usage

https://stackoverflow.com/questions/78704668/deploy-next-js-14-on-plesk-server?rq=2 
