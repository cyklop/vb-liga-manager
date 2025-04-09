import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma' // Stelle sicher, dass der Pfad zu deinem Prisma Client korrekt ist
import crypto from 'crypto'
import nodemailer from 'nodemailer'

export async function POST(request: Request) {
  try {
    const { email } = await request.json()

    if (!email) {
      return NextResponse.json({ message: 'E-Mail-Adresse erforderlich' }, { status: 400 })
    }

    // Trimme die E-Mail und suche Case-Insensitive
    const trimmedEmail = email.trim();
    const user = await prisma.user.findFirst({
      where: {
        // Suche nach exakter Übereinstimmung (wieder Case-Sensitive)
        email: trimmedEmail,
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

      // Erstelle den Reset-Link
      // Stelle sicher, dass NEXT_PUBLIC_APP_URL in deinen Umgebungsvariablen gesetzt ist
      const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/reset-password/${resetToken}`

      // Konfiguriere Nodemailer (ersetze dies mit deinen echten Daten oder Umgebungsvariablen)
      // TODO: Ersetze die folgenden Platzhalter durch echte E-Mail-Server-Daten (vorzugsweise über Umgebungsvariablen)
      const transporter = nodemailer.createTransport({
        host: process.env.EMAIL_SERVER_HOST || 'smtp.example.com', // z.B. smtp.gmail.com
        port: parseInt(process.env.EMAIL_SERVER_PORT || '587', 10), // z.B. 587 für TLS
        secure: (process.env.EMAIL_SERVER_PORT || '587') === '465', // true für Port 465, false für andere
        auth: {
          user: process.env.EMAIL_SERVER_USER || 'deine-email@example.com',
          pass: process.env.EMAIL_SERVER_PASSWORD || 'dein-passwort',
        },
      });

      // Sende die E-Mail
      try {
        await transporter.sendMail({
          from: process.env.EMAIL_FROM || '"Deine App" <noreply@example.com>', // Passe den Absendernamen an
          to: user.email, // Sende an die E-Mail-Adresse aus der DB
          subject: 'Passwort zurücksetzen für Deine App', // Passe den Betreff an
          text: `Sie erhalten diese E-Mail, weil Sie (oder jemand anderes) das Zurücksetzen des Passworts für Ihr Konto angefordert haben.\n\n` +
                `Bitte klicken Sie auf den folgenden Link oder fügen Sie ihn in Ihren Browser ein, um den Vorgang abzuschließen:\n\n` +
                `${resetUrl}\n\n` +
                `Wenn Sie dies nicht angefordert haben, ignorieren Sie diese E-Mail bitte und Ihr Passwort bleibt unverändert.\n` +
                `Dieser Link ist eine Stunde lang gültig.\n`,
          html: `<p>Sie erhalten diese E-Mail, weil Sie (oder jemand anderes) das Zurücksetzen des Passworts für Ihr Konto angefordert haben.</p>` +
                `<p>Bitte klicken Sie auf den folgenden Link, um den Vorgang abzuschließen:</p>` +
                `<p><a href="${resetUrl}">${resetUrl}</a></p>` +
                `<p>Wenn Sie dies nicht angefordert haben, ignorieren Sie diese E-Mail bitte und Ihr Passwort bleibt unverändert.</p>` +
                `<p>Dieser Link ist eine Stunde lang gültig.</p>`,
        });
         console.log(`Password reset email sent successfully to ${user.email}`);
      } catch (emailError) {
         console.error('Error sending password reset email:', emailError);
         // Optional: Hier könntest du entscheiden, ob du dem Benutzer trotzdem eine generische Erfolgsmeldung gibst
         // oder einen spezifischeren Fehler zurückgibst, aber sei vorsichtig mit Informationslecks.
         // Für den Moment geben wir einen internen Serverfehler zurück, wenn die E-Mail fehlschlägt.
         return NextResponse.json({ message: 'Fehler beim Senden der E-Mail.' }, { status: 500 });
      }
    } else {
       console.log(`Password reset request for non-existent email (case-insensitive search): ${trimmedEmail}`);
    }

    // Generische Erfolgsmeldung (wird immer gesendet, auch wenn Benutzer nicht gefunden wurde)
    return NextResponse.json({ message: 'Wenn ein Konto mit dieser E-Mail-Adresse existiert, wurde ein Link zum Zurücksetzen des Passworts gesendet.' })

  } catch (error) {
    console.error('Request password reset error:', error)
    return NextResponse.json({ message: 'Interner Serverfehler' }, { status: 500 })
  }
}
