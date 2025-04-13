import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import crypto from 'crypto'
import { sendPasswordResetEmail } from '@/lib/email'; // Importiere die neue Funktion

export async function POST(request: Request) {
  try {
    const { email } = await request.json()

    if (!email) {
      return NextResponse.json({ message: 'E-Mail-Adresse erforderlich' }, { status: 400 })
    }

    // E-Mail normalisieren (Kleinschreibung, Leerzeichen entfernen)
    const normalizedEmail = email.toLowerCase().trim();
    // Suche mit der normalisierten E-Mail (findUnique ist hier sicher)
    const user = await prisma.user.findUnique({
      where: {
        email: normalizedEmail, // Suche mit normalisierter E-Mail
      },
    })

    // Wichtig: Sende immer eine Erfolgsmeldung, auch wenn der Benutzer nicht existiert,
    // um E-Mail-Enumeration zu verhindern. Die E-Mail wird natürlich nur gesendet, wenn der Benutzer existiert.
    if (user) {
      // Generiere einen sicheren Token
      const resetToken = crypto.randomBytes(32).toString('hex')
      const passwordResetToken = crypto
        .createHash('sha256')
        .update(resetToken)
        .digest('hex')

      // Setze eine Gültigkeitsdauer (z.B. 1 Stunde)
      const passwordResetExpires = new Date(Date.now() + 3600000) // 1 Stunde

      // Speichere den gehashten Token und das Ablaufdatum in der Datenbank über die User-ID
      await prisma.user.update({
        where: { id: user.id }, // Update über die gefundene User-ID
        data: {
          passwordResetToken,
          passwordResetExpires,
        },
      })

      // Sende die E-Mail über die neue Funktion
      try {
        // Sende den *unhashed* resetToken in der URL
        await sendPasswordResetEmail(user.email, resetToken);
      } catch (emailError) {
        // Fehler wurde bereits in sendPasswordResetEmail geloggt
        // Gib einen generischen Fehler zurück, um keine Details preiszugeben
        return NextResponse.json({ message: 'Fehler beim Senden der E-Mail.' }, { status: 500 });
      }
    } else {
       // Log mit der normalisierten E-Mail
       console.log(`Password reset request for non-existent email: ${normalizedEmail}`);
    }

    // Generische Erfolgsmeldung (wird immer gesendet, auch wenn Benutzer nicht gefunden wurde)
    return NextResponse.json({ message: 'Wenn ein Konto mit dieser E-Mail-Adresse existiert, wurde ein Link zum Zurücksetzen des Passworts gesendet.' })

  } catch (error) {
    console.error('Request password reset error:', error)
    return NextResponse.json({ message: 'Interner Serverfehler' }, { status: 500 })
  }
}
