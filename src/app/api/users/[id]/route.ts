import { NextResponse } from 'next/server'
import prisma from '../../../../../lib/prisma' // Import the singleton instance
import bcrypt from 'bcryptjs'

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  const id = parseInt(params.id)

  try {
    await prisma.user.delete({
      where: { id },
    })
    return NextResponse.json({ message: 'Benutzer erfolgreich gelöscht' })
  } catch (error) {
    console.error('Error deleting user:', error)
    return NextResponse.json({ message: 'Fehler beim Löschen des Benutzers' }, { status: 500 })
  }
  // No finally block needed for singleton
}

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  const id = parseInt(params.id)
  const { email, name, password, isAdmin, teamId } = await request.json()

  try {
    const updateData: any = { email, name, isAdmin }
    
    if (password) {
      const hashedPassword = await bcrypt.hash(password, 10)
      updateData.password = hashedPassword
    }

    if (teamId) {
      updateData.teamId = parseInt(teamId)
    } else {
      updateData.teamId = null
    }

    const updatedUser = await prisma.user.update({
      where: { id },
      data: updateData,
    })
    return NextResponse.json(updatedUser)
  } catch (error) {
    console.error('Error updating user:', error)
    return NextResponse.json({ message: 'Fehler beim Aktualisieren des Benutzers' }, { status: 500 })
  }
  // No finally block needed for singleton
}
