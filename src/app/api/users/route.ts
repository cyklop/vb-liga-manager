import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma' // Pfad korrigiert
import bcrypt from 'bcryptjs'
import crypto from 'crypto' // Import crypto für Token-Generierung
import { sendAccountSetupEmail } from '@/lib/email'; // Importiere E-Mail-Funktion

export async function POST(request: Request) {
  // isAdmin und teamIds sind optional, password wird entfernt
  const { email, name, isAdmin = false, teamIds } = await request.json()

  // Validierung der Eingabe (Beispiel)
  if (!email || !name) {
    return NextResponse.json({ message: 'E-Mail und Name sind erforderlich.' }, { status: 400 });
  }

  // E-Mail normalisieren
  const normalizedEmail = email.toLowerCase().trim();

  try {
    // Prüfen, ob Benutzer bereits existiert
    const existingUser = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });
    if (existingUser) {
      return NextResponse.json({ message: 'Ein Benutzer mit dieser E-Mail-Adresse existiert bereits.' }, { status: 409 }); // 409 Conflict
    }

    // Erstelle den Benutzer ohne Passwort
    const newUser = await prisma.user.create({
      data: {
        email: normalizedEmail, // Normalisierte E-Mail verwenden
        name,
        // password: hashedPassword, // Passwort wird entfernt
        isAdmin,
        // isSuperAdmin wird hier nicht gesetzt, kann später angepasst werden
      },
    })
    
    // Füge die Team-Zuordnungen hinzu, wenn teamIds vorhanden sind
    if (teamIds && teamIds.length > 0) {
      const teamConnections = teamIds.map((teamId: number) => ({
        userId: newUser.id, // Korrigiert: newUser statt user
        teamId: teamId
      }))

      // Ersetze createMany durch eine Schleife mit create
      for (const connection of teamConnections) {
        await prisma.userTeam.create({
          data: connection,
        });
      }
    }

    // ---- Start: Setup-Token generieren und E-Mail senden ----
    // Setup-Token generieren (ähnlich wie Reset-Token)
    const setupToken = crypto.randomBytes(32).toString('hex');
    const passwordSetupToken = crypto
      .createHash('sha256')
      .update(setupToken)
      .digest('hex');
    // Längere Gültigkeit für die Ersteinrichtung, z.B. 3 Tage
    const passwordSetupExpires = new Date(Date.now() + 3 * 24 * 3600000); // 3 Tage

    // Token und Ablaufdatum beim neuen Benutzer speichern
    try {
       await prisma.user.update({
         where: { id: newUser.id },
         data: {
           // Nenne die Felder z.B. passwordSetupToken / passwordSetupExpires
           // Diese Felder müssen im prisma.schema hinzugefügt werden!
           passwordSetupToken: passwordSetupToken,
           passwordSetupExpires: passwordSetupExpires,
         },
       });

       // Setup-E-Mail senden (den *unhashed* Token senden!)
       await sendAccountSetupEmail(newUser.email, newUser.name, setupToken);

    } catch (setupError) {
        console.error("Fehler beim Speichern des Setup-Tokens oder Senden der E-Mail:", setupError);
        // Optional: Hier könntest du den gerade erstellten Benutzer wieder löschen
        // await prisma.user.delete({ where: { id: newUser.id } });
        // Oder einen spezifischeren Fehler zurückgeben.
        // Wichtig: Der Benutzer existiert jetzt ohne Passwort und ohne Setup-Möglichkeit!
        return NextResponse.json({ message: 'Benutzer erstellt, aber Fehler bei der Einrichtung/E-Mail-Versand. Bitte manuell beheben.' }, { status: 500 });
    }
    // ---- Ende: Setup-Token generieren und E-Mail senden ----

    // Gib den neu erstellten Benutzer zurück (ohne sensible Daten wie Tokens)
    const { passwordSetupToken: _pst, passwordSetupExpires: _pse, passwordResetToken: _prt, passwordResetExpires: _pre, ...userResponseData } = newUser;
    return NextResponse.json(userResponseData, { status: 201 })

  } catch (error) {
    // Allgemeiner Fehler beim Erstellen des Benutzers (z.B. DB nicht erreichbar)
    console.error('Error creating user:', error)
    // Prüfen auf spezifische Prisma-Fehler, falls nötig
    if (error.code === 'P2002') { // Unique constraint failed (sollte durch vorherige Prüfung abgefangen sein)
       return NextResponse.json({ message: 'Ein Benutzer mit dieser E-Mail-Adresse existiert bereits.' }, { status: 409 });
    }
    return NextResponse.json({ message: 'Fehler beim Erstellen des Benutzers' }, { status: 500 }) // 500 für Serverfehler
  }
}

export async function GET() {
  try {
    const users = await prisma.user.findMany({
      include: {
        teams: {
          include: {
            team: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
    })
    
    // Transformiere die Daten, um das Format zu vereinfachen
    const formattedUsers = users.map(user => ({
      ...user,
      teams: user.teams.map(ut => ({
        id: ut.team.id,
        name: ut.team.name
      }))
    }))
    
    return NextResponse.json(formattedUsers)
  } catch (error) {
    console.error('Error fetching users:', error)
    return NextResponse.json({ message: 'Fehler beim Abrufen der Benutzer' }, { status: 500 })
  }
}
