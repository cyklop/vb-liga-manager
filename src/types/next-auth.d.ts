import NextAuth, { DefaultSession, DefaultUser } from 'next-auth';
import { JWT, DefaultJWT } from 'next-auth/jwt';
// Importiere den Basistyp für Team-Infos
import type { TeamBasicInfo } from './models'; // Passe den Pfad ggf. an

// Erweitern des JWT-Typs
declare module 'next-auth/jwt' {
  interface JWT extends DefaultJWT {
    id: number;
    isAdmin?: boolean;
    isSuperAdmin?: boolean;
    // Verwende den importierten Typ für Konsistenz
    team?: TeamBasicInfo | null;
    teams?: TeamBasicInfo[]; // Füge ggf. teams hinzu, wenn im Token gespeichert
    rememberMe?: boolean;
  }
}

// Erweitern des Session- und User-Typs
declare module 'next-auth' {
  interface Session {
    user: {
      id: number;
      isAdmin?: boolean;
      isSuperAdmin?: boolean;
      // Verwende den importierten Typ
      team?: TeamBasicInfo | null;
      teams?: TeamBasicInfo[]; // Füge ggf. teams hinzu, wenn in der Session benötigt
      rememberMe?: boolean; // Füge rememberMe hinzu, falls benötigt
    } & Omit<DefaultSession['user'], 'id'>; // Omit id from DefaultSession['user'] to avoid conflict
  }

  // Erweitern des User-Typs (wird im authorize Callback und jwt Callback verwendet)
  // Dieser Typ sollte der Struktur entsprechen, die vom `authorize` Callback zurückgegeben wird
  interface User extends DefaultUser {
    id: number;
    isAdmin?: boolean;
    isSuperAdmin?: boolean;
    // Verwende den importierten Typ
    team?: TeamBasicInfo | null;
    teams?: TeamBasicInfo[]; // Füge ggf. teams hinzu
    rememberMe?: boolean;
  }
}
