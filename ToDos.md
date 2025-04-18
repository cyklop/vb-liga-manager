Phase 1: Strukturverbesserung (Typen & Services)

 • Typen zentralisieren:
    • [ ] Ordner src/types erstellen.
    • [ ] User:
       • [ ] User-Typ(en) in src/types/models.ts definieren (Basis: Prisma-Typ).
       • [ ] Lokale User-Interfaces durch Importe ersetzen (Komponenten, API, Libs, next-auth.d.ts).
    • [ ] Team:
       • [ ] Team-Typ(en) in src/types/models.ts definieren (Basis: Prisma-Typ).
       • [ ] Lokale Team-Interfaces durch Importe ersetzen.
    • [ ] League:
       • [ ] League-Typ(en) in src/types/models.ts definieren (Basis: Prisma-Typ, ggf. Varianten wie LeagueOverview, LeagueDetails).
       • [ ] Lokale League-Interfaces durch Importe ersetzen.
    • [ ] Fixture:
       • [ ] Fixture-Typ(en) in src/types/models.ts definieren (Basis: Prisma-Typ).
       • [ ] Lokale Fixture-Interfaces durch Importe ersetzen.
    • [ ] Andere Typen:
       • [ ] TableEntry und ggf. weitere Typen in src/types/models.ts definieren/verschieben.
       • [ ] Entsprechende lokale Definitionen ersetzen.
    • [ ] Review: Alle lokalen Typ-Definitionen für Kernmodelle entfernt und durch zentrale Importe ersetzt?
 • Service Layer einführen:
    • [ ] Ordner src/services erstellen.
    • [ ] Prisma Client Instanz bereitstellen (z.B. in src/lib/prisma.ts).
    • [ ] userService.ts:
       • [ ] Service-Datei erstellen, Prisma importieren.
       • [ ] DB-Logik für User aus API-Routen (/api/users/..., /api/users/me, ggf. Auth) extrahieren und als Funktionen implementieren (z.B.
         getUserById, updateUser, createUser, findUserByEmail, getCurrentUserProfile).
       • [x] Entsprechende API-Routen refaktorisieren, um userService-Funktionen zu nutzen.
    • [x] teamService.ts:
       • [x] Service-Datei erstellen.
       • [x] DB-Logik für Teams aus API-Routen (/api/teams/...) extrahieren (z.B. getAllTeams, getTeamById, createTeam, updateTeam, deleteTeam).
       • [x] Entsprechende API-Routen refaktorisieren.
    • [ ] leagueService.ts:
       • [ ] Service-Datei erstellen.
       • [ ] DB-Logik für Ligen aus API-Routen (/api/leagues/...) extrahieren (z.B. getAllLeaguesOverview, getLeagueDetails, createLeague,
         updateLeague, deleteLeague, setActiveLeague, getLeagueBySlug).
       • [ ] Entsprechende API-Routen refaktorisieren.
    • [ ] fixtureService.ts:
       • [ ] Service-Datei erstellen.
       • [ ] DB-Logik für Fixtures aus API-Routen (/api/fixtures/..., /api/leagues/[id]/fixtures/..., /api/leagues/[id]/generate-fixtures)
         extrahieren (z.B. getFixturesByLeague, updateFixture, reorderFixtures, generateRoundRobinFixturesAndSave).
       • [ ] Entsprechende API-Routen refaktorisieren.
    • [ ] Review: Sind die API-Routen jetzt primär für Request/Response, Auth und Aufruf der Service-Funktionen zuständig? Ist die DB-Logik in
      den Services gekapselt? (User & Team erledigt)

Phase 2: Tests hinzufügen

 • [ ] Test-Runner einrichten (Jest oder Vitest).
 • [ ] Testing Library für React konfigurieren (@testing-library/react).
 • [ ] Unit Tests:
    • [ ] Tests für src/lib-Funktionen schreiben (slugify, table-calculation, email, Helper...).
    • [ ] Tests für Service-Funktionen schreiben (Prisma mocken, z.B. mit prisma-mock oder manuell).
 • [ ] Integration Tests:
    • [ ] Tests für kritische API-Routen schreiben (Request -> Service (gemockt) -> Response prüfen, Auth prüfen). (Supertest oder Next.js
      integrierte Testmöglichkeiten).
    • [ ] Tests für Komponenten mit State/Hooks schreiben (Daten laden, Formularinteraktion).
 • [ ] E2E Tests (Optional, später):
    • [ ] E2E-Test-Framework einrichten (Cypress oder Playwright).
    • [ ] Tests für Haupt-Workflows schreiben (Login, Liga erstellen, Tabelle ansehen).

Phase 3: Weitere Code-Qualität & Refactoring

 • [ ] Frontend Refactoring:
    • [ ] Wiederkehrende Fetching-Logik in Custom Hooks auslagern (useFetchData, useCurrentUser).
    • [ ] Komplexere State-Logik in Komponenten in Custom Hooks auslagern.
    • [ ] Zentralen API-Client (src/lib/apiClient.ts) erstellen und fetch-Aufrufe ersetzen.
 • [ ] API & Validierung:
    • [ ] Konsistente Struktur für API-Antworten (Erfolg/Fehler) definieren und umsetzen.
    • [ ] Serverseitige Eingabevalidierung in API-Routen mit zod implementieren.
 • [ ] Konfiguration & Wartung:
    • [ ] tsconfig.json auf strengere Regeln prüfen/setzen (strictNullChecks etc.).
    • [ ] Linting (ESLint) und Formatting (Prettier) konsistent einrichten und anwenden.
    • [ ] Abhängigkeiten prüfen und aktualisieren (ggf. Dependabot einrichten).
    • [ ] Konstanten zentralisieren (src/constants.ts).
