import { NextResponse } from 'next/server'
import prisma from '../../../../../lib/prisma' // Import the singleton instance
import bcrypt from 'bcryptjs'

export async function GET(request: Request) {
  // Hier würden Sie den Benutzer aus der Session oder einem JWT Token identifizieren
  // Für dieses Beispiel verwenden wir eine Mockmethode
  const userId = 1 // Ersetzen Sie dies durch die tatsächliche Benutzer-ID aus der Authentifizierung

  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        name: true,
        isAdmin: true,
        isSuperAdmin: true,
        team: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    })

    if (!user) {
      return NextResponse.json({ message: 'Benutzer nicht gefunden' }, { status: 404 })
    }

    return NextResponse.json(user)
  } catch (error) {
    console.error('Fehler beim Abrufen des Benutzerprofils:', error)
    return NextResponse.json({ message: 'Ein Fehler ist aufgetreten' }, { status: 500 })
  }
  // No finally block needed for singleton
}

export async function PUT(request: Request) {
  // Hier würden Sie den Benutzer aus der Session oder einem JWT Token identifizieren
  // Für dieses Beispiel verwenden wir eine Mockmethode
  const userId = 1 // Ersetzen Sie dies durch die tatsächliche Benutzer-ID aus der Authentifizierung

  const { name, email, password } = await request.json()

  try {
    const updateData: any = { name, email }

    if (password) {
      const hashedPassword = await bcrypt.hash(password, 10)
      updateData.password = hashedPassword
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: updateData,
      select: {
        id: true,
        email: true,
        name: true,
        isAdmin: true,
        isSuperAdmin: true,
        team: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    })

    return NextResponse.json(updatedUser)
  } catch (error) {
    console.error('Fehler beim Aktualisieren des Benutzerprofils:', error)
    return NextResponse.json({ message: 'Ein Fehler ist aufgetreten' }, { status: 500 })
  }
  // No finally block needed for singleton
}
