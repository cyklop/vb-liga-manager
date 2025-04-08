-- Einfache Lösung: Nur die slug-Spalte hinzufügen
PRAGMA foreign_keys=off;

-- Spalte hinzufügen
ALTER TABLE "League" ADD COLUMN "slug" TEXT;

-- Bestehende Datensätze aktualisieren
UPDATE "League" SET "slug" = lower(replace(replace(replace("name", ' ', '-'), 'ä', 'ae'), 'ö', 'oe')) || '-' || "id";

-- Unique-Index für slug erstellen
CREATE UNIQUE INDEX "League_slug_key" ON "League"("slug");

PRAGMA foreign_keys=on;
