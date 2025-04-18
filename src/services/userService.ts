import { Prisma } from '@prisma/client';
import prisma from '@/lib/prisma';
import bcrypt from 'bcryptjs'; // Oder bcrypt, je nach Installation
import crypto from 'crypto';
import { sendAccountSetupEmail } from '@/lib/email'; // Importiere E-Mail-Funktion
import type { UserProfile, AdminUserListItem, TeamBasicInfo } from '@/types/models';

// --- Hilfsfunktion zur Konvertierung von Prisma User zu UserProfile ---
function mapPrismaUserToUserProfile(user: Prisma.UserGetPayload<{ include: { teams: { include: { team: { select: { id: true, name: true } } } } } }>): UserProfile {
  const teamsBasicInfo: TeamBasicInfo[] = user.teams.map(ut => ({
    id: ut.team.id,
    name: ut.team.name,
  }));

  // Entferne sensible Felder
  const { password, passwordResetToken, passwordResetExpires, passwordSetupToken, passwordSetupExpires, ...userData } = user;

  return {
    ...userData,
    teams: teamsBasicInfo,
    team: teamsBasicInfo.length > 0 ? teamsBasicInfo[0] : null, // Erstes Team für Kompatibilität
  };
}

// --- Hilfsfunktion zur Konvertierung von Prisma User zu AdminUserListItem ---
function mapPrismaUserToAdminListItem(user: Prisma.UserGetPayload<{ include: { teams: { include: { team: { select: { id: true, name: true } } } } } }>): AdminUserListItem {
  const userProfile = mapPrismaUserToUserProfile(user); // Nutze die UserProfile-Logik
  return {
    ...userProfile,
    isAdmin: user.isAdmin ?? false, // Stelle sicher, dass boolean
    isSuperAdmin: user.isSuperAdmin ?? false, // Stelle sicher, dass boolean
  };
}


// --- Service-Funktionen ---

/**
 * Ruft das Profil des Benutzers anhand seiner ID ab.
 * Gibt UserProfile oder null zurück.
 */
export async function getUserProfileById(id: number): Promise<UserProfile | null> {
  const user = await prisma.user.findUnique({
    where: { id },
    include: {
      teams: {
        include: {
          team: {
            select: { id: true, name: true },
          },
        },
      },
    },
  });

  if (!user) {
    return null;
  }

  return mapPrismaUserToUserProfile(user);
}

/**
 * Aktualisiert das Profil eines Benutzers.
 * Erwartet Update-Daten und die Benutzer-ID.
 * Gibt das aktualisierte UserProfile oder null zurück.
 */
// Definiere einen spezifischen Typ für Profil-Updates
export type UpdateUserProfileData = {
  name?: string;
  email?: string;
  password?: string; // Optional: Passwort kann geändert werden
  theme?: string;
};
export async function updateUserProfile(id: number, data: UpdateUserProfileData): Promise<UserProfile | null> {
  const updateData: Prisma.UserUpdateInput = {};
  if (data.name !== undefined) updateData.name = data.name;
  if (data.email !== undefined) updateData.email = data.email.toLowerCase().trim(); // Normalisieren
  if (data.theme !== undefined) updateData.theme = data.theme;

  if (data.password) {
    updateData.password = await bcrypt.hash(data.password, 10);
  }

  try {
    const updatedUser = await prisma.user.update({
      where: { id },
      data: updateData,
      include: {
        teams: { include: { team: { select: { id: true, name: true } } } },
      },
    });
    return mapPrismaUserToUserProfile(updatedUser);
  } catch (error) {
    // Handle Prisma-Fehler (z.B. P2025 Record not found)
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
      return null; // Benutzer nicht gefunden
    }
    console.error('Error updating user profile in service:', error);
    throw error; // Wirf den Fehler weiter, damit die API-Route ihn behandeln kann
  }
}

/**
 * Ruft alle Benutzer für die Admin-Liste ab.
 * Gibt ein Array von AdminUserListItem zurück.
 */
export async function getAllAdminUsers(): Promise<AdminUserListItem[]> {
  const users = await prisma.user.findMany({
    include: {
      teams: { include: { team: { select: { id: true, name: true } } } },
    },
    orderBy: { name: 'asc' }, // Beispiel-Sortierung
  });
  return users.map(mapPrismaUserToAdminListItem);
}

/**
 * Erstellt einen neuen Benutzer, generiert ein Setup-Token und sendet eine E-Mail.
 * Erwartet Benutzerdaten (Name, E-Mail, isAdmin, optionale Team-IDs).
 * Gibt das erstellte AdminUserListItem zurück.
 * Wirft Fehler bei Problemen (z.B. E-Mail existiert bereits, E-Mail-Versand fehlgeschlagen).
 */
export type CreateUserData = {
  email: string;
  name: string;
  isAdmin?: boolean;
  teamIds?: number[];
};
export async function createUser(data: CreateUserData): Promise<AdminUserListItem> {
  const normalizedEmail = data.email.toLowerCase().trim();

  // 1. Prüfen, ob Benutzer bereits existiert
  const existingUser = await prisma.user.findUnique({
    where: { email: normalizedEmail },
  });
  if (existingUser) {
    throw new Error('Ein Benutzer mit dieser E-Mail-Adresse existiert bereits.'); // Spezifischer Fehler für die API-Route
  }

  let newUser: Prisma.UserGetPayload<{ include: { teams: { include: { team: { select: { id: true, name: true } } } } } }> | null = null;

  try {
    // 2. Benutzer erstellen (ohne Passwort, ohne Teams initial)
    newUser = await prisma.user.create({
      data: {
        email: normalizedEmail,
        name: data.name,
        isAdmin: data.isAdmin ?? false,
      },
      // Include teams hier, auch wenn sie noch leer sind, für konsistente Typen
      include: { teams: { include: { team: { select: { id: true, name: true } } } } },
    });

    // 3. Team-Zuordnungen hinzufügen (falls vorhanden)
    if (data.teamIds && data.teamIds.length > 0) {
      const teamConnections = data.teamIds.map((teamId: number) => ({
        userId: newUser!.id, // Sicher, da newUser gerade erstellt wurde
        teamId: teamId,
      }));
      // Ersetze createMany durch eine Schleife mit create
      for (const connection of teamConnections) {
        await prisma.userTeam.create({ data: connection });
      }
    }

    // 4. Setup-Token generieren
    const setupToken = crypto.randomBytes(32).toString('hex');
    const passwordSetupToken = crypto.createHash('sha256').update(setupToken).digest('hex');
    const passwordSetupExpires = new Date(Date.now() + 3 * 24 * 3600000); // 3 Tage

    // 5. Token beim Benutzer speichern
    await prisma.user.update({
      where: { id: newUser.id },
      data: {
        passwordSetupToken: passwordSetupToken,
        passwordSetupExpires: passwordSetupExpires,
      },
    });

    // 6. Setup-E-Mail senden
    await sendAccountSetupEmail(newUser.email, newUser.name, setupToken);

    // 7. Benutzer mit Teams erneut laden für die Rückgabe
    const userWithTeams = await prisma.user.findUniqueOrThrow({ // OrThrow, da er existieren muss
      where: { id: newUser.id },
      include: { teams: { include: { team: { select: { id: true, name: true } } } } },
    });

    return mapPrismaUserToAdminListItem(userWithTeams);

  } catch (error) {
    console.error('Error during user creation process in service:', error);
    // Wenn ein Fehler auftritt, nachdem der Benutzer erstellt wurde, aber bevor alles abgeschlossen ist
    // (z.B. E-Mail-Versand fehlgeschlagen), könnte man hier Aufräumarbeiten durchführen (optional)
    // if (newUser && error instanceof Error && error.message.includes('E-Mail')) {
    //   await prisma.user.delete({ where: { id: newUser.id }}); // Benutzer wieder löschen
    // }
    // Wirf den Fehler weiter, damit die API-Route ihn behandeln kann
    throw error;
  }
}

/**
 * Aktualisiert einen Benutzer (Admin-Funktion).
 * Erwartet Update-Daten (Name, E-Mail, isAdmin, Passwort, Team-IDs) und die Benutzer-ID.
 * Gibt das aktualisierte AdminUserListItem oder null zurück.
 */
export type UpdateUserData = {
  email?: string;
  name?: string;
  password?: string;
  isAdmin?: boolean;
  teamIds?: number[];
};
export async function updateUser(id: number, data: UpdateUserData): Promise<AdminUserListItem | null> {
  try {
    return await prisma.$transaction(async (tx) => {
      // 1. Benutzerdaten aktualisieren
      const updateData: Prisma.UserUpdateInput = {};
      if (data.email !== undefined) updateData.email = data.email.toLowerCase().trim();
      if (data.name !== undefined) updateData.name = data.name;
      if (data.isAdmin !== undefined) updateData.isAdmin = data.isAdmin;
      if (data.password) {
        updateData.password = await bcrypt.hash(data.password, 10);
      }

      await tx.user.update({
        where: { id },
        data: updateData,
      });

      // 2. Team-Zuordnungen aktualisieren (falls teamIds übergeben wurden)
      if (data.teamIds !== undefined) {
        // Bestehende löschen
        await tx.userTeam.deleteMany({ where: { userId: id } });
        // Neue erstellen
        if (data.teamIds.length > 0) {
          for (const teamId of data.teamIds) {
            await tx.userTeam.create({ data: { userId: id, teamId: teamId } });
          }
        }
      }

      // 3. Aktualisierten Benutzer mit Teams abrufen
      const userWithTeams = await tx.user.findUniqueOrThrow({
        where: { id },
        include: { teams: { include: { team: { select: { id: true, name: true } } } } },
      });

      return mapPrismaUserToAdminListItem(userWithTeams);
    });
  } catch (error) {
    // Handle Prisma-Fehler (z.B. P2025 Record not found während Update)
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
      return null; // Benutzer nicht gefunden
    }
    console.error('Error updating user in service:', error);
    throw error; // Wirf den Fehler weiter
  }
}

/**
 * Löscht einen Benutzer anhand seiner ID.
 */
export async function deleteUser(id: number): Promise<void> {
  try {
    // Die UserTeam-Einträge werden automatisch durch onDelete: Cascade gelöscht (im Schema definiert)
    await prisma.user.delete({
      where: { id },
    });
  } catch (error) {
    // Handle Prisma-Fehler (z.B. P2025 Record not found)
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
      // Benutzer wurde bereits gelöscht, kein Fehler für den Client nötig
      console.warn(`User with ID ${id} not found for deletion, likely already deleted.`);
      return;
    }
    console.error('Error deleting user in service:', error);
    throw error; // Wirf den Fehler weiter
  }
}
