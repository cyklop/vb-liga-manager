import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

export async function POST(request: Request) {
  const { email, password } = await request.json()

  try {
    const user = await prisma.user.findUnique({ where: { email } })

    if (!user) {
      return NextResponse.json({ message: 'Ungültige Anmeldeinformationen' }, { status: 400 })
    }

    const isPasswordValid = await bcrypt.compare(password, user.password)

    if (!isPasswordValid) {
      return NextResponse.json({ message: 'Ungültige Anmeldeinformationen' }, { status: 400 })
    }

    // Hier würden Sie normalerweise eine Session erstellen oder ein JWT Token generieren
    // Für dieses Beispiel senden wir einfach die Benutzerinformationen zurück
    return NextResponse.json({
      id: user.id,
      email: user.email,
      name: user.name,
      isAdmin: user.isAdmin,
      isSuperAdmin: user.isSuperAdmin,
    })
  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json({ message: 'Ein Fehler ist aufgetreten. Bitte versuchen Sie es später erneut.' }, { status: 500 })
  } finally {
    await prisma.$disconnect()
  }
}
