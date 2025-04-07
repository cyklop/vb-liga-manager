import { NextResponse } from 'next/server'
import prisma from '../../../../lib/prisma' // Import the singleton instance
import bcrypt from 'bcryptjs'

export async function POST(request: Request) {
  const { email, password } = await request.json()

  try {
    const user = await prisma.user.findUnique({
      where: { email },
    })

    if (!user) {
      return NextResponse.json({ message: 'Ungültige E-Mail oder Passwort' }, { status: 401 })
    }

    const isPasswordValid = await bcrypt.compare(password, user.password)

    if (!isPasswordValid) {
      return NextResponse.json({ message: 'Ungültige E-Mail oder Passwort' }, { status: 401 })
    }

    // Hier könnten Sie ein JWT-Token erstellen und zurückgeben

    return NextResponse.json({
      id: user.id,
      email: user.email,
      name: user.name,
      isAdmin: user.isAdmin,
      isSuperAdmin: user.isSuperAdmin,
    })
  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json({ message: 'Ein Fehler ist aufgetreten' }, { status: 500 })
  }
  // No finally block needed for singleton
}
