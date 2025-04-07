import { NextResponse } from 'next/server'
import prisma from '../../../../../lib/prisma' // Import the singleton instance
import bcrypt from 'bcryptjs'

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  const id = parseInt(params.id)

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

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  const id = parseInt(params.id)
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
        const teamConnections = teamIds.map((teamId: number) => ({
          userId: id,
          teamId: teamId
        }))
        
        await tx.userTeam.createMany({
          data: teamConnections
        })
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
      }

      return NextResponse.json(formattedUser)
    })
  } catch (error) {
    console.error('Error updating user:', error)
    return NextResponse.json({ message: 'Fehler beim Aktualisieren des Benutzers' }, { status: 500 })
  }
}
