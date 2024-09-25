import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

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
