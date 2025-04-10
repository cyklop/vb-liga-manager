/*
  Warnings:

  - Added the required column `hasReturnMatches` to the `League` table without a default value. This is not possible if the table is not empty.
  - Added the required column `numberOfTeams` to the `League` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Team" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "location" TEXT,
    "hallAddress" TEXT,
    "trainingTimes" TEXT,
    "leagueId" INTEGER,
    "teamLeaderId" INTEGER,
    CONSTRAINT "Team_leagueId_fkey" FOREIGN KEY ("leagueId") REFERENCES "League" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Team_teamLeaderId_fkey" FOREIGN KEY ("teamLeaderId") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Team" ("id", "leagueId", "name") SELECT "id", "leagueId", "name" FROM "Team";
DROP TABLE "Team";
ALTER TABLE "new_Team" RENAME TO "Team";
CREATE UNIQUE INDEX "Team_name_key" ON "Team"("name");
CREATE UNIQUE INDEX "Team_teamLeaderId_key" ON "Team"("teamLeaderId");
CREATE TABLE "new_League" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "numberOfTeams" INTEGER NOT NULL,
    "hasReturnMatches" BOOLEAN NOT NULL
);
INSERT INTO "new_League" ("id", "name") SELECT "id", "name" FROM "League";
DROP TABLE "League";
ALTER TABLE "new_League" RENAME TO "League";
CREATE UNIQUE INDEX "League_name_key" ON "League"("name");
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
