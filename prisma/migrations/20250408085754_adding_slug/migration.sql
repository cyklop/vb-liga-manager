/*
  Warnings:

  - Made the column `slug` on table `League` required. This step will fail if there are existing NULL values in that column.

*/
-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_League" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "numberOfTeams" INTEGER NOT NULL,
    "hasReturnMatches" BOOLEAN NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
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
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
