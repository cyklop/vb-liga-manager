-- SQLite unterstützt keine komplexen ALTER TABLE-Operationen, daher verwenden wir eine andere Strategie:
-- 1. Erstellen einer temporären Tabelle mit der neuen Struktur
-- 2. Daten kopieren
-- 3. Alte Tabelle löschen
-- 4. Temporäre Tabelle umbenennen

-- Temporäre Tabelle erstellen
PRAGMA foreign_keys=off;

CREATE TABLE "League_new" (
  "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
  "name" TEXT NOT NULL,
  "slug" TEXT NOT NULL,
  "numberOfTeams" INTEGER NOT NULL,
  "hasReturnMatches" BOOLEAN NOT NULL,
  "isActive" BOOLEAN NOT NULL DEFAULT 1,
  "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "pointsWin30" INTEGER NOT NULL DEFAULT 3,
  "pointsWin31" INTEGER NOT NULL DEFAULT 3,
  "pointsWin32" INTEGER NOT NULL DEFAULT 2,
  "pointsLoss32" INTEGER NOT NULL DEFAULT 1
);

-- Daten kopieren und dabei Slugs generieren
INSERT INTO "League_new" ("id", "name", "slug", "numberOfTeams", "hasReturnMatches", "isActive", "createdAt", "pointsWin30", "pointsWin31", "pointsWin32", "pointsLoss32")
SELECT 
  "id", 
  "name", 
  lower(replace(replace(replace("name", ' ', '-'), 'ä', 'ae'), 'ö', 'oe')) || '-' || "id", 
  "numberOfTeams", 
  "hasReturnMatches", 
  "isActive", 
  "createdAt", 
  "pointsWin30", 
  "pointsWin31", 
  "pointsWin32", 
  "pointsLoss32"
FROM "League";

-- Unique-Index für slug erstellen
CREATE UNIQUE INDEX "League_slug_key" ON "League_new"("slug");
-- Unique-Index für name erstellen (wie im Original)
CREATE UNIQUE INDEX "League_name_key" ON "League_new"("name");

-- Alte Tabelle löschen (zuerst müssen wir die Beziehungen behandeln)
-- Wir speichern die Beziehungen zu Teams und Fixtures
CREATE TABLE "_League_teams_backup" AS SELECT * FROM "_League_teams";
CREATE TABLE "Fixture_backup" AS SELECT * FROM "Fixture";

-- Alte Tabelle und Beziehungen löschen
DROP TABLE "_League_teams";
DROP TABLE "Fixture";
DROP TABLE "League";

-- Neue Tabelle umbenennen
ALTER TABLE "League_new" RENAME TO "League";

-- Fixture-Tabelle neu erstellen
CREATE TABLE "Fixture" (
  "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
  "leagueId" INTEGER NOT NULL,
  "round" INTEGER,
  "matchday" INTEGER,
  "homeTeamId" INTEGER NOT NULL,
  "awayTeamId" INTEGER NOT NULL,
  "fixtureDate" DATETIME,
  "homeScore" INTEGER,
  "awayScore" INTEGER,
  "homeSets" INTEGER,
  "awaySets" INTEGER,
  "homePoints" INTEGER,
  "awayPoints" INTEGER,
  "homeMatchPoints" INTEGER,
  "awayMatchPoints" INTEGER,
  "order" INTEGER NOT NULL
);

-- Beziehungstabelle neu erstellen
CREATE TABLE "_League_teams" (
  "A" INTEGER NOT NULL,
  "B" INTEGER NOT NULL,
  FOREIGN KEY ("A") REFERENCES "League"("id") ON DELETE CASCADE,
  FOREIGN KEY ("B") REFERENCES "Team"("id") ON DELETE CASCADE
);

-- Daten wiederherstellen
INSERT INTO "Fixture" SELECT * FROM "Fixture_backup";
INSERT INTO "_League_teams" SELECT * FROM "_League_teams_backup";

-- Backup-Tabellen löschen
DROP TABLE "Fixture_backup";
DROP TABLE "_League_teams_backup";

-- Indizes für Fixture erstellen
CREATE INDEX "Fixture_leagueId_idx" ON "Fixture"("leagueId");
CREATE INDEX "Fixture_homeTeamId_idx" ON "Fixture"("homeTeamId");
CREATE INDEX "Fixture_awayTeamId_idx" ON "Fixture"("awayTeamId");

-- Unique-Index für die Beziehungstabelle
CREATE UNIQUE INDEX "_League_teams_AB_unique" ON "_League_teams"("A", "B");
CREATE INDEX "_League_teams_B_index" ON "_League_teams"("B");

-- Foreign Keys für Fixture hinzufügen
PRAGMA foreign_keys=on;
ALTER TABLE "Fixture" ADD CONSTRAINT "Fixture_leagueId_fkey" FOREIGN KEY ("leagueId") REFERENCES "League"("id") ON DELETE CASCADE;
ALTER TABLE "Fixture" ADD CONSTRAINT "Fixture_homeTeamId_fkey" FOREIGN KEY ("homeTeamId") REFERENCES "Team"("id") ON DELETE CASCADE;
ALTER TABLE "Fixture" ADD CONSTRAINT "Fixture_awayTeamId_fkey" FOREIGN KEY ("awayTeamId") REFERENCES "Team"("id") ON DELETE CASCADE;
