import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs'; // Oder bcrypt
// Importiere Typen
import type { AdminUserListItem, TeamBasicInfo } from '@/types/models';


export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const id = parseInt((await params).id);

  try {
    // Die UserTeam-Einträge werden automatisch durch onDelete: Cascade gelöscht
    await prisma.user.delete({
      where: { id },
    })
    return NextResponse.json({ message: 'Benutzer erfolgreich gelöscht' })
  } catch (error) {
    console.error('Error deleting user:', error)
    return NextResponse.json({ message: 'Fehler beim Löschen des Benutzers' }, { status: 500 })
  }
}

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }>  }) {
  const id = parseInt((await params).id)
  const { email, name, password, isAdmin, teamIds } = await request.json()

  try {
    // Transaktion starten, um alle Änderungen atomar durchzuführen
    return await prisma.$transaction(async (tx) => {
      // Benutzerdaten aktualisieren
      const updateData: any = { email, name, isAdmin }
      
      if (password) {
        const hashedPassword = await bcrypt.hash(password, 10)
        updateData.password = hashedPassword
      }

      const updatedUser = await tx.user.update({
        where: { id },
        data: updateData,
      })

      // Bestehende Team-Zuordnungen löschen
      await tx.userTeam.deleteMany({
        where: { userId: id }
      })

      // Neue Team-Zuordnungen erstellen
      if (teamIds && teamIds.length > 0) {
        // Statt createMany (nicht unterstützt) einzelne create-Aufrufe verwenden
        for (const teamId of teamIds) {
          await tx.userTeam.create({
            data: {
              userId: id,
              teamId: teamId
            }
          });
        }
      }

      // Benutzer mit aktualisierten Teams abrufen
      const userWithTeams = await tx.user.findUnique({
        where: { id },
        include: {
          teams: {
            include: {
              team: {
                select: {
                  id: true,
                  name: true,
                },
              },
            },
          },
        },
      })

      // Daten transformieren
      const formattedUser = {
        ...userWithTeams,
        teams: userWithTeams?.teams.map(ut => ({
          id: ut.team.id,
          name: ut.team.name
        }))
      };

      // Entferne sensible Felder für die Antwort
      const { password: _, passwordResetToken: _prt, passwordResetExpires: _pre, passwordSetupToken: _pst, passwordSetupExpires: _pse, ...userData } = userWithTeams;

      const responseUser: AdminUserListItem = {
        ...userData,
        teams: teamsBasicInfo,
        team: teamsBasicInfo.length > 0 ? teamsBasicInfo[0] : null
      };


      return NextResponse.json(responseUser);
    });
  } catch (error) {
    console.error('Error updating user:', error);
    return NextResponse.json({ message: 'Fehler beim Aktualisieren des Benutzers' }, { status: 500 })
  }
}
