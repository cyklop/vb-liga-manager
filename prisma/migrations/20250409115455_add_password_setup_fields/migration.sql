-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_User" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "email" TEXT NOT NULL,
    "password" TEXT,
    "name" TEXT NOT NULL,
    "isAdmin" BOOLEAN NOT NULL DEFAULT false,
    "isSuperAdmin" BOOLEAN NOT NULL DEFAULT false,
    "theme" TEXT NOT NULL DEFAULT 'system',
    "passwordResetToken" TEXT,
    "passwordResetExpires" DATETIME,
    "passwordSetupToken" TEXT,
    "passwordSetupExpires" DATETIME
);
INSERT INTO "new_User" ("email", "id", "isAdmin", "isSuperAdmin", "name", "password", "passwordResetExpires", "passwordResetToken", "theme") SELECT "email", "id", "isAdmin", "isSuperAdmin", "name", "password", "passwordResetExpires", "passwordResetToken", "theme" FROM "User";
DROP TABLE "User";
ALTER TABLE "new_User" RENAME TO "User";
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
CREATE UNIQUE INDEX "User_passwordResetToken_key" ON "User"("passwordResetToken");
CREATE UNIQUE INDEX "User_passwordSetupToken_key" ON "User"("passwordSetupToken");
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
