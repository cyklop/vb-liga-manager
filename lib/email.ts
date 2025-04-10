import nodemailer from 'nodemailer';
import prisma from '@/lib/prisma'; // Importiere Prisma, falls benötigt (z.B. für Logging)

// Konfiguriere den Transporter einmal zentral
// Stelle sicher, dass die Umgebungsvariablen in .env.local gesetzt sind!
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_SERVER_HOST,
  port: parseInt(process.env.EMAIL_SERVER_PORT || '587', 10),
  secure: (process.env.EMAIL_SERVER_PORT || '465') === '465', // true für Port 465
  auth: {
    user: process.env.EMAIL_SERVER_USER,
    pass: process.env.EMAIL_SERVER_PASSWORD,
  },
  // Optional: Hinzufügen von TLS-Optionen, falls nötig (z.B. bei selbst-signierten Zertifikaten)
  // tls: {
  //   rejectUnauthorized: false // Nur für Entwicklung/Test, nicht für Produktion!
  // }
});

const emailFrom = process.env.EMAIL_FROM || '"LIGAManager" <noreply@volleyball-badberneck.de>'; // Standardwert angepasst
const appBaseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
const appName = "LIGAManager"; // Oder aus einer Umgebungsvariable holen

/**
 * Sendet die Passwort-Zurücksetzen-E-Mail.
 */
export async function sendPasswordResetEmail(to: string, token: string): Promise<void> {
  const resetUrl = `${appBaseUrl}/reset-password/${token}`;
  const mailOptions = {
    from: emailFrom,
    to: to,
    subject: `Passwort zurücksetzen für ${appName}`,
    text: `Sie erhalten diese E-Mail, weil Sie (oder jemand anderes) das Zurücksetzen des Passworts für Ihr Konto bei ${appName} angefordert haben.\n\n` +
          `Bitte klicken Sie auf den folgenden Link oder fügen Sie ihn in Ihren Browser ein, um den Vorgang abzuschließen:\n\n` +
          `${resetUrl}\n\n` +
          `Wenn Sie dies nicht angefordert haben, ignorieren Sie diese E-Mail bitte und Ihr Passwort bleibt unverändert.\n` +
          `Dieser Link ist eine Stunde lang gültig.\n`,
    html: `<p>Sie erhalten diese E-Mail, weil Sie (oder jemand anderes) das Zurücksetzen des Passworts für Ihr Konto bei ${appName} angefordert haben.</p>` +
          `<p>Bitte klicken Sie auf den folgenden Link, um den Vorgang abzuschließen:</p>` +
          `<p><a href="${resetUrl}">${resetUrl}</a></p>` +
          `<p>Wenn Sie dies nicht angefordert haben, ignorieren Sie diese E-Mail bitte und Ihr Passwort bleibt unverändert.</p>` +
          `<p>Dieser Link ist eine Stunde lang gültig.</p>`,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`Password reset email sent successfully to ${to}`);
  } catch (error) {
    console.error(`Error sending password reset email to ${to}:`, error);
    // Wir werfen den Fehler weiter, damit die aufrufende Funktion darauf reagieren kann
    throw new Error('Fehler beim Senden der Passwort-Reset-E-Mail.');
  }
}

/**
 * Sendet die E-Mail zur Kontoeinrichtung an einen neuen Benutzer.
 */
export async function sendAccountSetupEmail(to: string, name: string, token: string): Promise<void> {
  const setupUrl = `${appBaseUrl}/set-password/${token}`; // Eigene Route zum Setzen des Passworts
  const mailOptions = {
    from: emailFrom,
    to: to,
    subject: `Ihr neues Konto bei ${appName} wurde erstellt!`,
    text: `Hallo ${name},\n\n` +
          `ein Konto für Sie wurde im ${appName} erstellt.\n\n` +
          `Bitte klicken Sie auf den folgenden Link, um Ihr Passwort festzulegen und Ihr Konto zu aktivieren:\n\n` +
          `${setupUrl}\n\n` +
          `Dieser Link ist 72 Stunden (3 Tage) gültig.\n\n` +
          `Mit freundlichen Grüßen,\nIhr ${appName} Team`,
    html: `<p>Hallo ${name},</p>` +
          `<p>ein Konto für Sie wurde im ${appName} erstellt.</p>` +
          `<p>Bitte klicken Sie auf den folgenden Link, um Ihr Passwort festzulegen und Ihr Konto zu aktivieren:</p>` +
          `<p><a href="${setupUrl}">${setupUrl}</a></p>` +
          `<p>Dieser Link ist 72 Stunden (3 Tage) gültig.</p>` +
          `<p>Mit freundlichen Grüßen,<br/>Ihr ${appName} Team</p>`,
  };

   try {
    await transporter.sendMail(mailOptions);
    console.log(`Account setup email sent successfully to ${to}`);
  } catch (error) {
    console.error(`Error sending account setup email to ${to}:`, error);
    // Wir werfen den Fehler weiter
    throw new Error('Fehler beim Senden der Konto-Einrichtungs-E-Mail.');
  }
}
