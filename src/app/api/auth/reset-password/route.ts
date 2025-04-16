import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma' // Stelle sicher, dass der Pfad zu deinem Prisma Client korrekt ist
import crypto from 'crypto'
import bcrypt from 'bcryptjs' // Importiere bcryptjs

export async function POST(request: Request) {
  try {
    const { token, password } = await request.json()

    if (!token || !password) {
      return NextResponse.json({ message: 'Token und Passwort sind erforderlich' }, { status: 400 })
    }

     if (password.length < 6) { // Beispiel: Mindestlänge serverseitig prüfen
        return NextResponse.json({ message: 'Das Passwort muss mindestens 6 Zeichen lang sein.' }, { status: 400 });
    }

    // Hashe den eingehenden Token, um ihn mit dem in der DB gespeicherten Hash zu vergleichen
    const hashedToken = crypto
      .createHash('sha256')
      .update(token)
      .digest('hex')

    // Finde den Benutzer anhand des gehashten Tokens und überprüfe das Ablaufdatum
    const user = await prisma.user.findFirst({
      where: {
        passwordResetToken: hashedToken,
        passwordResetExpires: {
          gte: new Date(), // Prüfe, ob das Ablaufdatum größer oder gleich der aktuellen Zeit ist
        },
      },
    })

    if (!user) {
      return NextResponse.json({ message: 'Token ist ungültig oder abgelaufen' }, { status: 400 })
    }

    // Hashe das neue Passwort
    const hashedPassword = await bcrypt.hash(password, 10) // Verwende bcryptjs.hash

    // Aktualisiere das Passwort des Benutzers und lösche die Reset-Token-Felder
    await prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
        passwordResetToken: null, // Token entfernen/ungültig machen
        passwordResetExpires: null, // Ablaufdatum entfernen
      },
    })

    return NextResponse.json({ message: 'Passwort erfolgreich zurückgesetzt' })

  } catch (error) {
    console.error('Reset password error:', error)
    // Gib im Fehlerfall keine spezifischen Details preis
    return NextResponse.json({ message: 'Fehler beim Zurücksetzen des Passworts' }, { status: 500 })
  }
}
