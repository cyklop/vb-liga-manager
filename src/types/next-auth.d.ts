import NextAuth, { DefaultSession, DefaultUser } from "next-auth";
import { JWT, DefaultJWT } from "next-auth/jwt";

// Erweitern des JWT-Typs
declare module "next-auth/jwt" {
  interface JWT extends DefaultJWT {
    id: number; // Angepasst an die Verwendung von number in API-Routen und Prisma
    isAdmin?: boolean;
    isSuperAdmin?: boolean;
    team?: {
      id: number;
      name: string;
    } | null;
    rememberMe?: boolean; // Hinzugefügt basierend auf auth.ts
  }
}

// Erweitern des Session- und User-Typs
declare module "next-auth" {
  interface Session {
    user: {
      id: number; // Angepasst an JWT/User-Modell
      isAdmin?: boolean;
      isSuperAdmin?: boolean;
      team?: {
        id: number;
        name: string;
      } | null;
    } & DefaultSession["user"]; // Behält Standardfelder wie name, email, image bei
  }

  // Erweitern des User-Typs (wird im authorize Callback und jwt Callback verwendet)
  interface User extends DefaultUser {
    id: number; // Angepasst
    isAdmin?: boolean;
    isSuperAdmin?: boolean;
    team?: {
      id: number;
      name: string;
    } | null;
    rememberMe?: boolean; // Hinzugefügt basierend auf auth.ts
  }
}
