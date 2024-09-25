import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  const id = parseInt(params.id)

  try {
    await prisma.league.delete({
      where: { id },
    })
    return NextResponse.json({ message: 'Liga erfolgreich gelöscht' })
  } catch (error) {
    console.error('Error deleting league:', error)
    return NextResponse.json({ message: 'Fehler beim Löschen der Liga' }, { status: 500 })
  } finally {
    await prisma.$disconnect()
  }
}
