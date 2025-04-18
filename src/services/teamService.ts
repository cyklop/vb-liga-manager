import { Prisma } from '@prisma/client';
import prisma from '@/lib/prisma';
import type { Team, UserProfile, TeamBasicInfo } from '@/types/models';

// --- Hilfsfunktion zur Konvertierung von Prisma Team zu zentralem Team-Typ ---
function mapPrismaTeamToTeam(
  team: Prisma.TeamGetPayload<{ include: { teamLeader: { select: { id: true, name: true } } } }>
): Team {
  // Map teamLeader zu UserProfile (nur Basis-Infos)
  const teamLeaderProfile: UserProfile | null = team.teamLeader ? {
    id: team.teamLeader.id,
    name: team.teamLeader.name,
    // Setze andere UserProfile-Felder auf Standardwerte oder lade sie bei Bedarf
    email: '', // Beispiel: Standardwert
    createdAt: new Date(), // Beispiel: Standardwert
    updatedAt: new Date(), // Beispiel: Standardwert
    isAdmin: false, // Beispiel: Standardwert
    isSuperAdmin: false, // Beispiel: Standardwert
    theme: null, // Beispiel: Standardwert
  } : null;

  // Entferne teamLeaderId aus dem Hauptobjekt
  const { teamLeaderId, ...teamData } = team;

  return {
    ...teamData,
    teamLeader: teamLeaderProfile,
  };
}

// --- Service-Funktionen ---

/**
 * Ruft alle Teams ab.
 * Gibt ein Array von Team-Objekten zurück.
 */
export async function getAllTeams(): Promise<Team[]> {
  const teams = await prisma.team.findMany({
    include: {
      teamLeader: { select: { id: true, name: true } }, // Lade nur benötigte Leader-Infos
    },
    orderBy: { name: 'asc' }, // Beispiel-Sortierung
  });
  return teams.map(mapPrismaTeamToTeam);
}

/**
 * Ruft ein einzelnes Team anhand seiner ID ab.
 * Gibt Team oder null zurück.
 */
export async function getTeamById(id: number): Promise<Team | null> {
  const team = await prisma.team.findUnique({
    where: { id },
    include: {
      teamLeader: { select: { id: true, name: true } },
    },
  });

  if (!team) {
    return null;
  }
  return mapPrismaTeamToTeam(team);
}

/**
 * Ruft nur die Basis-Details eines Teams ab (ID, Name, Ort etc.).
 * Wird z.B. für die /details Route verwendet.
 */
export async function getTeamDetails(id: number): Promise<Pick<Team, 'id' | 'name' | 'location' | 'hallAddress' | 'trainingTimes'> | null> {
   return prisma.team.findUnique({
      where: { id: id },
      select: {
        id: true,
        name: true,
        location: true,
        hallAddress: true,
        trainingTimes: true
      }
    });
}


/**
 * Erstellt ein neues Team.
 * Erwartet Teamdaten.
 * Gibt das erstellte Team-Objekt zurück.
 */
export type CreateTeamData = {
  name: string;
  location?: string | null;
  hallAddress?: string | null;
  trainingTimes?: string | null;
  teamLeaderId?: number | null; // Akzeptiere number oder null
};
export async function createTeam(data: CreateTeamData): Promise<Team> {
  const newTeam = await prisma.team.create({
    data: {
      name: data.name,
      location: data.location,
      hallAddress: data.hallAddress,
      trainingTimes: data.trainingTimes,
      teamLeaderId: data.teamLeaderId, // Direkt übergeben (Prisma erwartet number | null | undefined)
    },
    include: {
      teamLeader: { select: { id: true, name: true } },
    },
  });
  return mapPrismaTeamToTeam(newTeam);
}

/**
 * Aktualisiert ein bestehendes Team.
 * Erwartet Team-ID und Update-Daten.
 * Gibt das aktualisierte Team-Objekt oder null zurück.
 */
export type UpdateTeamData = Partial<CreateTeamData>; // Update kann Teilmengen von Create enthalten
export async function updateTeam(id: number, data: UpdateTeamData): Promise<Team | null> {
  try {
    const updatedTeam = await prisma.team.update({
      where: { id },
      data: {
        name: data.name,
        location: data.location,
        hallAddress: data.hallAddress,
        trainingTimes: data.trainingTimes,
        // Setze teamLeaderId auf null, wenn es explizit null ist, sonst übergebe die ID oder undefined
        teamLeaderId: data.teamLeaderId === null ? null : (data.teamLeaderId ? data.teamLeaderId : undefined),
      },
      include: {
        teamLeader: { select: { id: true, name: true } },
      },
    });
    return mapPrismaTeamToTeam(updatedTeam);
  } catch (error) {
    // Handle Prisma-Fehler (z.B. P2025 Record not found)
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
      return null; // Team nicht gefunden
    }
    console.error('Error updating team in service:', error);
    throw error; // Wirf den Fehler weiter
  }
}

/**
 * Löscht ein Team anhand seiner ID.
 */
export async function deleteTeam(id: number): Promise<void> {
  try {
    // TODO: Was passiert mit UserTeam-Einträgen? Müssen manuell gelöscht werden, wenn kein Cascade Delete definiert ist.
    // Prüfe dein Prisma-Schema für UserTeam!
    // Beispiel: await prisma.userTeam.deleteMany({ where: { teamId: id } });

    await prisma.team.delete({
      where: { id },
    });
  } catch (error) {
    // Handle Prisma-Fehler (z.B. P2025 Record not found)
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
      console.warn(`Team with ID ${id} not found for deletion, likely already deleted.`);
      return;
    }
    // Handle Foreign Key Constraint Fehler (P2003), falls Ligen/Fixtures noch auf das Team verweisen
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2003') {
       console.error(`Cannot delete team ${id} due to existing references (leagues, fixtures, users).`);
       throw new Error(`Team kann nicht gelöscht werden, da es noch in Ligen, Spielplänen oder von Benutzern referenziert wird.`);
    }
    console.error('Error deleting team in service:', error);
    throw error; // Wirf den Fehler weiter
  }
}
