-- Zuerst fügen wir die Spalte als nullable hinzu
ALTER TABLE "League" ADD COLUMN "slug" TEXT;

-- Dann aktualisieren wir bestehende Datensätze mit einem Slug basierend auf dem Namen
UPDATE "League" SET "slug" = lower(replace(replace(replace(name, ' ', '-'), 'ä', 'ae'), 'ö', 'oe')) || '-' || id;

-- Schließlich machen wir die Spalte NOT NULL und UNIQUE
ALTER TABLE "League" ALTER COLUMN "slug" SET NOT NULL;
CREATE UNIQUE INDEX "League_slug_key" ON "League"("slug");
