import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import * as bcrypt from 'bcrypt'

const prisma = new PrismaClient()

export async function POST(request: Request) {
  const { email } = await request.json()

  try {
    const user = await prisma.user.findUnique({ where: { email } })
    if (!user) {
      return NextResponse.json({ message: 'Benutzer nicht gefunden' }, { status: 404 })
    }

    // Hier würden Sie normalerweise einen Token generieren und per E-Mail versenden
    // Für dieses Beispiel setzen wir einfach ein neues Passwort
    const newPassword = Math.random().toString(36).slice(-8)
    const hashedPassword = await bcrypt.hash(newPassword, 10)

    await prisma.user.update({
      where: { email },
      data: { password: hashedPassword },
    })

    // In einer echten Anwendung würden Sie hier eine E-Mail mit dem Reset-Link senden
    console.log(`Neues Passwort für ${email}: ${newPassword}`)

    return NextResponse.json({ message: 'Passwort wurde zurückgesetzt. Bitte prüfen Sie Ihre E-Mails.' })
  } catch (error) {
    console.error('Fehler beim Zurücksetzen des Passworts:', error)
    return NextResponse.json({ message: 'Fehler beim Zurücksetzen des Passworts' }, { status: 500 })
  } finally {
    await prisma.$disconnect()
  }
}
