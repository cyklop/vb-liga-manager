/*
  Warnings:

  - You are about to drop the column `leagueId` on the `Team` table. All the data in the column will be lost.

*/
-- CreateTable
CREATE TABLE "_LeagueToTeam" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL,
    CONSTRAINT "_LeagueToTeam_A_fkey" FOREIGN KEY ("A") REFERENCES "League" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "_LeagueToTeam_B_fkey" FOREIGN KEY ("B") REFERENCES "Team" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Team" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "location" TEXT,
    "hallAddress" TEXT,
    "trainingTimes" TEXT,
    "teamLeaderId" INTEGER,
    CONSTRAINT "Team_teamLeaderId_fkey" FOREIGN KEY ("teamLeaderId") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Team" ("hallAddress", "id", "location", "name", "teamLeaderId", "trainingTimes") SELECT "hallAddress", "id", "location", "name", "teamLeaderId", "trainingTimes" FROM "Team";
DROP TABLE "Team";
ALTER TABLE "new_Team" RENAME TO "Team";
CREATE UNIQUE INDEX "Team_name_key" ON "Team"("name");
CREATE UNIQUE INDEX "Team_teamLeaderId_key" ON "Team"("teamLeaderId");
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;

-- CreateIndex
CREATE UNIQUE INDEX "_LeagueToTeam_AB_unique" ON "_LeagueToTeam"("A", "B");

-- CreateIndex
CREATE INDEX "_LeagueToTeam_B_index" ON "_LeagueToTeam"("B");
