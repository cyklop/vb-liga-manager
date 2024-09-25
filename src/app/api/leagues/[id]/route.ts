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

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  const id = parseInt(params.id)
  const { name } = await request.json()

  try {
    const updatedLeague = await prisma.league.update({
      where: { id },
      data: { name },
    })
    return NextResponse.json(updatedLeague)
  } catch (error) {
    console.error('Error updating league:', error)
    return NextResponse.json({ message: 'Fehler beim Aktualisieren der Liga' }, { status: 500 })
  } finally {
    await prisma.$disconnect()
  }
}
