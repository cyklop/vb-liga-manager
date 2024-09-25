import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  const id = parseInt(params.id)

  try {
    await prisma.team.delete({
      where: { id },
    })
    return NextResponse.json({ message: 'Team erfolgreich gelöscht' })
  } catch (error) {
    console.error('Error deleting team:', error)
    return NextResponse.json({ message: 'Fehler beim Löschen des Teams' }, { status: 500 })
  } finally {
    await prisma.$disconnect()
  }
}
