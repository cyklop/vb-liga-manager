import { AuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import bcrypt from 'bcrypt';
import { prisma } from '@/lib/prisma';
// Importiere den Typ für die authorize-Rückgabe und JWT/Session
import type { TeamBasicInfo } from '@/types/models'; // Passe Pfad an

// Die declare module Blöcke werden jetzt von src/types/next-auth.d.ts gehandhabt
// Entferne die lokalen declare module Blöcke hier


export const authOptions: AuthOptions = {
  
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" },
        rememberMe: { label: "Remember Me", type: "checkbox" } // Hinzugefügt
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Bitte geben Sie E-Mail und Passwort ein");
        }

        // E-Mail normalisieren (Kleinschreibung, Leerzeichen entfernen)
        const normalizedEmail = credentials.email.toLowerCase().trim();

        const user = await prisma.user.findUnique({
          where: { email: normalizedEmail }, // Suche mit normalisierter E-Mail
          include: {
            teams: {
              select: {
                team: {
                  select: {
                    id: true,
                    name: true
                  }
                }
              }
            }
          }
        });

        if (!user) {
          throw new Error("Benutzer nicht gefunden");
        }

        // Prüfen, ob der Benutzer überhaupt ein Passwort hat
        if (!user.password) {
          // Wenn kein Passwort gespeichert ist, kann das eingegebene nicht korrekt sein
          throw new Error("Ungültiges Passwort");
        }

        // Jetzt ist sicher, dass user.password ein String ist
        const isPasswordValid = await bcrypt.compare(
          credentials.password,
          user.password
        );

        if (!isPasswordValid) {
          throw new Error("Ungültiges Passwort");
        }

        // Extrahiere alle Teams oder das erste Team, je nach Bedarf
        const teams: TeamBasicInfo[] = user.teams.map(ut => ({
          id: ut.team.id,
          name: ut.team.name
        }));
        const team = teams.length > 0 ? teams[0] : null; // Das erste Team für Abwärtskompatibilität

        const rememberUser = credentials.rememberMe === 'true';

        // Stelle sicher, dass die Rückgabe dem User-Typ in next-auth.d.ts entspricht
        return {
          id: Number(user.id),
          email: user.email,
          name: user.name,
          isAdmin: user.isAdmin,
          isSuperAdmin: user.isSuperAdmin,
          team: team, // Das erste Team
          teams: teams, // Alle Teams
          rememberMe: rememberUser,
        };
      },
    }),
  ],
  pages: {
    signIn: "/login",
    error: "/login",
  },
  callbacks: {
    async jwt({ token, user, trigger }) {
      // Beim initialen Login (wenn user-Objekt vorhanden ist)
      if (trigger === 'signIn' && user) {
        token.id = Number(user.id);
        token.email = user.email;
        token.name = user.name;
        token.isAdmin = user.isAdmin;
        token.isSuperAdmin = user.isSuperAdmin;
        token.team = user.team; // Speichere das erste Team
        token.teams = user.teams; // Speichere alle Teams
        token.rememberMe = user.rememberMe; // Im Token speichern
      }
      return token;
    },
    async session({ session, token }) {
      // Stelle sicher, dass die Session dem Session-Typ in next-auth.d.ts entspricht
      if (session.user) {
        session.user.id = token.id as number; // Cast zu number
        // email, name, image sind standardmäßig Teil der Session, wenn vorhanden
        session.user.isAdmin = token.isAdmin as boolean;
        session.user.isSuperAdmin = token.isSuperAdmin as boolean;
        session.user.team = token.team as TeamBasicInfo | null; // Cast zum richtigen Typ
        session.user.teams = token.teams as TeamBasicInfo[] | undefined; // Cast zum richtigen Typ
        session.user.rememberMe = token.rememberMe as boolean;
      }
      return session;
    },
  },
  session: {
    strategy: "jwt",
    // Session-Dauer auf 30 Tage setzen, wenn "Angemeldet bleiben" genutzt wird
    maxAge: 30 * 24 * 60 * 60, // 30 days in seconds
  },
  // Cookie-Konfigurationen explizit definieren, um Konsistenz sicherzustellen
  cookies: {
    sessionToken: {
      name: process.env.NODE_ENV === 'production'
        ? `__Secure-next-auth.session-token`
        : `next-auth.session-token`,
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: process.env.NODE_ENV === 'production',
        maxAge: 30 * 24 * 60 * 60 // 30 days
      }
    },
    callbackUrl: {
      name: process.env.NODE_ENV === 'production'
        ? `__Secure-next-auth.callback-url`
        : `next-auth.callback-url`,
      options: {
        sameSite: 'lax',
        path: '/',
        secure: process.env.NODE_ENV === 'production',
      }
    },
    csrfToken: {
      // Wichtig: __Host- Präfix erfordert Path=/ und secure: true. Kein 'domain' Attribut erlaubt.
      name: process.env.NODE_ENV === 'production'
        ? `__Host-next-auth.csrf-token`
        : `next-auth.csrf-token`,
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: process.env.NODE_ENV === 'production',
      }
    },
    // Hier könnten bei Bedarf weitere Cookies wie pkceCodeVerifier definiert werden
  }
};
