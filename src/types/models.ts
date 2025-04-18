import type { User as PrismaUser, Team as PrismaTeam } from '@prisma/client';

/**
 * Basis-Informationen für ein Team, oft in anderen Typen eingebettet.
 */
export type TeamBasicInfo = Pick<PrismaTeam, 'id' | 'name'>;

/**
 * Repräsentiert einen Benutzer im Frontend oder in API-Antworten,
 * ohne sensible Daten wie Passwort-Hashes oder Tokens.
 * Enthält vereinfachte Team-Informationen.
 */
export type UserProfile = Omit<
  PrismaUser,
  | 'password' // Assuming 'password' is the field name in your Prisma schema
  | 'passwordResetToken'
  | 'passwordResetExpires'
  | 'passwordSetupToken'
  | 'passwordSetupExpires'
> & {
  // Überschreibe 'teams', um nur die Basis-Infos zu enthalten
  teams?: TeamBasicInfo[];
  // Füge optional das 'team'-Feld für Abwärtskompatibilität hinzu, falls benötigt
  team?: TeamBasicInfo | null;
};

/**
 * Repräsentiert einen Benutzer, wie er in der Admin-Benutzerliste angezeigt wird.
 * Kann zusätzliche Felder wie isAdmin/isSuperAdmin enthalten.
 */
export type AdminUserListItem = UserProfile & {
  // Explizit isAdmin und isSuperAdmin hinzufügen, falls nicht schon in UserProfile
  isAdmin: boolean;
  isSuperAdmin: boolean;
};

/**
 * Repräsentiert ein Team mit optionalen Teamleiter-Informationen.
 */
export type Team = Omit<PrismaTeam, 'teamLeaderId'> & { // Entferne teamLeaderId, da wir das Objekt einbetten
  teamLeader?: UserProfile | null; // Optionaler Teamleiter als UserProfile
};

// --- Fixture Placeholder ---
// Wird später detaillierter definiert
export interface Fixture {
  id: number;
  leagueId: number;
  round?: number | null;
  matchday?: number | null;
  homeTeamId: number;
  homeTeam: TeamBasicInfo; // Verwende TeamBasicInfo für Übersicht
  awayTeamId: number;
  awayTeam: TeamBasicInfo; // Verwende TeamBasicInfo für Übersicht
  fixtureDate?: string | null;
  fixtureTime?: string | null;
  homeScore?: number | null;
  awayScore?: number | null;
  homeSet1?: number | null; awaySet1?: number | null;
  homeSet2?: number | null; awaySet2?: number | null;
  homeSet3?: number | null; awaySet3?: number | null;
  homeSet4?: number | null; awaySet4?: number | null;
  homeSet5?: number | null; awaySet5?: number | null;
  homeMatchPoints?: number | null;
  awayMatchPoints?: number | null;
  homePoints?: number | null; // Ball points
  awayPoints?: number | null; // Ball points
  order: number;
  // Optional: League context might be needed within Fixture later
  // league?: { scoreEntryType: ScoreEntryType; setsToWin: number; };
}

// --- League Typen ---
import type { League as PrismaLeague, ScoreEntryType } from '@prisma/client';

/**
 * Repräsentiert eine Liga in Übersichtslisten.
 * Enthält nur Basis-Team-Informationen.
 */
export type LeagueOverview = Pick<PrismaLeague,
  'id' | 'name' | 'slug' | 'numberOfTeams' | 'hasReturnMatches' | 'isActive' | 'createdAt' |
  'pointsWin30' | 'pointsWin31' | 'pointsWin32' | 'pointsLoss32' | 'scoreEntryType' | 'setsToWin'
> & {
  teams: TeamBasicInfo[]; // Nur Basis-Infos der Teams
  // fixtures?: Pick<Fixture, 'id'>[]; // Entfernt, da Fixtures über Detail-Route geladen werden
};

/**
 * Repräsentiert eine Liga mit allen Details, einschließlich vollständiger Team- und Fixture-Daten.
 */
export type LeagueDetails = Omit<PrismaLeague, 'teams'> & { // Entferne 'teams' aus PrismaLeague, da wir es überschreiben
  teams: Team[]; // Vollständige Team-Objekte
  fixtures: Fixture[]; // Vollständige Fixture-Objekte (verwenden vorerst den Placeholder)
};


// --- TableEntry Placeholder ---
// Wird später detaillierter definiert
export interface TableEntry {
    teamId: number;
    teamName: string;
    played: number;
    won: number;
    lost: number;
    points: number;
    setsWon: number;
    setsLost: number;
    setsDiff: number;
    setsQuotient: number;
    pointsWon: number;
    pointsLost: number;
    pointsDiff: number;
    pointsQuotient: number;
    directComparisonWins: number;
    directComparisonLosses: number;
}
