import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcrypt";
import { prisma } from "@/lib/prisma";

export const authOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Bitte geben Sie E-Mail und Passwort ein");
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
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
        
        return {
          id: user.id.toString(),
          email: user.email,
          name: user.name,
          isAdmin: user.isAdmin,
          isSuperAdmin: user.isSuperAdmin,
          team: team
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
      if (user) {
        // Only update the token when a sign in happens
        token.id = user.id;
        token.email = user.email;
        token.name = user.name;
        token.isAdmin = user.isAdmin;
        token.isSuperAdmin = user.isSuperAdmin;
        token.team = user.team;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id;
        session.user.email = token.email;
        session.user.name = token.name;
        session.user.isAdmin = token.isAdmin;
        session.user.isSuperAdmin = token.isSuperAdmin;
        session.user.team = token.team;
      }
      return session;
    },
  },
  session: {
    strategy: "jwt",
  },
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
