import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import crypto from 'crypto'
import bcrypt from 'bcryptjs'

// Diese Route ist fast identisch mit reset-password,
// sucht aber nach passwordSetupToken / passwordSetupExpires
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

    // Finde den Benutzer anhand des gehashten Setup-Tokens und überprüfe das Ablaufdatum
    const user = await prisma.user.findFirst({
      where: {
        passwordSetupToken: hashedToken, // Suche nach Setup-Token
        passwordSetupExpires: {
          gte: new Date(), // Prüfe, ob das Ablaufdatum größer oder gleich der aktuellen Zeit ist
        },
      },
    })

    if (!user) {
      return NextResponse.json({ message: 'Setup-Token ist ungültig oder abgelaufen' }, { status: 400 })
    }

    // Hashe das neue Passwort
    const hashedPassword = await bcrypt.hash(password, 10)

    // Aktualisiere das Passwort des Benutzers und lösche die Setup-Token-Felder
    await prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword, // Setze das Passwort
        passwordSetupToken: null, // Setup-Token entfernen/ungültig machen
        passwordSetupExpires: null, // Ablaufdatum entfernen
      },
    })

    // Optional: Den Benutzer nach erfolgreichem Setzen direkt anmelden?
    // Das würde eine komplexere Logik erfordern (z.B. Session erstellen).
    // Fürs Erste geben wir nur eine Erfolgsmeldung zurück.

    return NextResponse.json({ message: 'Passwort erfolgreich festgelegt' })

  } catch (error) {
    console.error('Set initial password error:', error)
    // Gib im Fehlerfall keine spezifischen Details preis
    return NextResponse.json({ message: 'Fehler beim Festlegen des Passworts' }, { status: 500 })
  }
}
