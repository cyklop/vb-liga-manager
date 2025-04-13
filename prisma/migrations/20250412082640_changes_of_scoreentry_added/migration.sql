/*
  Warnings:

  - You are about to drop the column `awayPoints` on the `Fixture` table. All the data in the column will be lost.
  - You are about to drop the column `awaySets` on the `Fixture` table. All the data in the column will be lost.
  - You are about to drop the column `homePoints` on the `Fixture` table. All the data in the column will be lost.
  - You are about to drop the column `homeSets` on the `Fixture` table. All the data in the column will be lost.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Fixture" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "leagueId" INTEGER NOT NULL,
    "round" INTEGER,
    "matchday" INTEGER,
    "homeTeamId" INTEGER NOT NULL,
    "awayTeamId" INTEGER NOT NULL,
    "fixtureDate" DATETIME,
    "fixtureTime" TEXT,
    "homeScore" INTEGER,
    "awayScore" INTEGER,
    "homeSet1" INTEGER,
    "awaySet1" INTEGER,
    "homeSet2" INTEGER,
    "awaySet2" INTEGER,
    "homeSet3" INTEGER,
    "awaySet3" INTEGER,
    "homeSet4" INTEGER,
    "awaySet4" INTEGER,
    "homeSet5" INTEGER,
    "awaySet5" INTEGER,
    "homeMatchPoints" INTEGER,
    "awayMatchPoints" INTEGER,
    "order" INTEGER NOT NULL,
    CONSTRAINT "Fixture_leagueId_fkey" FOREIGN KEY ("leagueId") REFERENCES "League" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Fixture_homeTeamId_fkey" FOREIGN KEY ("homeTeamId") REFERENCES "Team" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Fixture_awayTeamId_fkey" FOREIGN KEY ("awayTeamId") REFERENCES "Team" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Fixture" ("awayMatchPoints", "awayScore", "awayTeamId", "fixtureDate", "homeMatchPoints", "homeScore", "homeTeamId", "id", "leagueId", "matchday", "order", "round") SELECT "awayMatchPoints", "awayScore", "awayTeamId", "fixtureDate", "homeMatchPoints", "homeScore", "homeTeamId", "id", "leagueId", "matchday", "order", "round" FROM "Fixture";
DROP TABLE "Fixture";
ALTER TABLE "new_Fixture" RENAME TO "Fixture";
CREATE INDEX "Fixture_leagueId_idx" ON "Fixture"("leagueId");
CREATE INDEX "Fixture_homeTeamId_idx" ON "Fixture"("homeTeamId");
CREATE INDEX "Fixture_awayTeamId_idx" ON "Fixture"("awayTeamId");
CREATE TABLE "new_League" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "numberOfTeams" INTEGER NOT NULL,
    "hasReturnMatches" BOOLEAN NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "scoreEntryType" TEXT NOT NULL DEFAULT 'MATCH_SCORE',
    "setsToWin" INTEGER NOT NULL DEFAULT 3,
    "pointsWin30" INTEGER NOT NULL DEFAULT 3,
    "pointsWin31" INTEGER NOT NULL DEFAULT 3,
    "pointsWin32" INTEGER NOT NULL DEFAULT 2,
    "pointsLoss32" INTEGER NOT NULL DEFAULT 1
);
INSERT INTO "new_League" ("createdAt", "hasReturnMatches", "id", "isActive", "name", "numberOfTeams", "pointsLoss32", "pointsWin30", "pointsWin31", "pointsWin32", "slug") SELECT "createdAt", "hasReturnMatches", "id", "isActive", "name", "numberOfTeams", "pointsLoss32", "pointsWin30", "pointsWin31", "pointsWin32", "slug" FROM "League";
DROP TABLE "League";
ALTER TABLE "new_League" RENAME TO "League";
CREATE UNIQUE INDEX "League_name_key" ON "League"("name");
CREATE UNIQUE INDEX "League_slug_key" ON "League"("slug");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
