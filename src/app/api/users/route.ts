import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next'; // Import für Auth-Check
import { authOptions } from '@/lib/auth'; // Import für Auth-Check
// Importiere Service-Funktionen und Typen
import { createUser, getAllAdminUsers, type CreateUserData } from '@/services/userService';
import type { AdminUserListItem } from '@/types/models';


export async function POST(request: Request) {
  // --- Berechtigungsprüfung (Beispiel) ---
  const session = await getServerSession(authOptions);
  // Hier Annahme: Nur Admins dürfen User erstellen. Passe die Logik nach Bedarf an.
  if (!session?.user?.isAdmin) {
      return NextResponse.json({ message: 'Nicht autorisiert' }, { status: 403 });
  }
  // --- Ende Berechtigungsprüfung ---
  const { email, name, isAdmin = false, teamIds } = await request.json();

  // Validierung der Eingabe (Beispiel)
  if (!email || !name) {
    return NextResponse.json({ message: 'E-Mail und Name sind erforderlich.' }, { status: 400 });
  }

  const createData: CreateUserData = { email, name, isAdmin, teamIds };

  try {
    // Rufe Service-Funktion auf
    const newUser = await createUser(createData);
    return NextResponse.json(newUser, { status: 201 });

  } catch (error) {
    console.error('Fehler beim Erstellen des Benutzers (API):', error);
    // Behandle spezifische Fehler vom Service
    if (error instanceof Error && error.message.includes('existiert bereits')) {
      return NextResponse.json({ message: error.message }, { status: 409 }); // 409 Conflict
    }
    if (error instanceof Error && error.message.includes('E-Mail-Versand')) {
      // Service hat versucht, den Fehler zu behandeln, aber wir geben trotzdem 500 zurück
      return NextResponse.json({ message: error.message }, { status: 500 });
    }
    // Allgemeiner Fehler
    return NextResponse.json({ message: 'Fehler beim Erstellen des Benutzers' }, { status: 500 });
  }
}

export async function GET() {
  // Optional: Berechtigungsprüfung hier hinzufügen, falls nicht alle User die Liste sehen sollen
  // const session = await getServerSession(authOptions);
  // if (!session?.user?.isAdmin) {
  //     return NextResponse.json({ message: 'Nicht autorisiert' }, { status: 403 });
  // }

  try {
    // Rufe Service-Funktion auf
    const users = await getAllAdminUsers();
    return NextResponse.json(users);

  } catch (error) {
    console.error('Fehler beim Abrufen der Benutzer (API):', error);
    return NextResponse.json({ message: 'Fehler beim Abrufen der Benutzer' }, { status: 500 })
  }
}
