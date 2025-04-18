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


// --- Platzhalter für zukünftige Typen ---
// export type LeagueOverview = { ... };
// export type LeagueDetails = { ... };
// export type Fixture = { ... };
// export type TableEntry = { ... };
