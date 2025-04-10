import { AuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcrypt";
import { prisma } from "@/lib/prisma";

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

        const isPasswordValid = await bcrypt.compare(
          credentials.password,
          user.password
        );

        if (!isPasswordValid) {
          throw new Error("Ungültiges Passwort");
        }

        // Extract the first team if available
        const team = user.teams.length > 0 ? user.teams[0].team : null;
        const rememberUser = credentials.rememberMe === 'true' || credentials.rememberMe === true; // Auslesen

        return {
          id: user.id.toString(),
          email: user.email,
          name: user.name,
          isAdmin: user.isAdmin,
          isSuperAdmin: user.isSuperAdmin,
          team: team,
          rememberMe: rememberUser // Hinzugefügt
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
        token.id = user.id;
        token.email = user.email;
        token.name = user.name;
        token.isAdmin = user.isAdmin;
        token.isSuperAdmin = user.isSuperAdmin;
        token.team = user.team;
        token.rememberMe = user.rememberMe; // Im Token speichern
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id;
        session.user.email = token.email;
        session.user.name = token.name;
        session.user.isAdmin = token.isAdmin as boolean;
        session.user.isSuperAdmin = token.isSuperAdmin as boolean;
        session.user.team = token.team as any; // Ggf. Typ anpassen
        session.user.rememberMe = token.rememberMe as boolean; // In Session speichern
      }
      return session;
    },
  },
  session: {
    strategy: "jwt",
    // Session-Dauer auf 30 Tage setzen, wenn "Angemeldet bleiben" genutzt wird
    maxAge: 30 * 24 * 60 * 60, // 30 days in seconds
  },
  // Cookie-Dauer explizit setzen (sollte mit session.maxAge übereinstimmen)
  cookies: {
     sessionToken: {
       name: process.env.NODE_ENV === 'production' 
         ? `__Secure-next-auth.session-token` 
         : `next-auth.session-token`, // Unterschiedliche Namen für Dev/Prod
       options: {
         httpOnly: true,
         sameSite: 'lax',
         path: '/',
         secure: process.env.NODE_ENV === 'production',
         maxAge: 30 * 24 * 60 * 60 // 30 days in seconds (gleiche Dauer wie Session)
       }
     }
  }
};
