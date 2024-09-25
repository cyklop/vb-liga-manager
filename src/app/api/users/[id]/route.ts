import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

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
  } finally {
    await prisma.$disconnect()
  }
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
  } finally {
    await prisma.$disconnect()
  }
}
