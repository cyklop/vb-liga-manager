import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next'; // Import für Auth-Check
import { authOptions } from '@/lib/auth'; // Import für Auth-Check
// Importiere Service-Funktionen und Typen
import { deleteUser, updateUser, type UpdateUserData } from '@/services/userService';
import type { AdminUserListItem } from '@/types/models';


export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  // --- Berechtigungsprüfung (Beispiel) ---
  const session = await getServerSession(authOptions);
  // Hier Annahme: Nur Admins dürfen User löschen.
  if (!session?.user?.isAdmin) {
      return NextResponse.json({ message: 'Nicht autorisiert' }, { status: 403 });
  }
  // --- Ende Berechtigungsprüfung ---
  const idParam = (await params).id;
  const id = parseInt(idParam);
  if (isNaN(id)) {
    return NextResponse.json({ message: 'Ungültige Benutzer-ID' }, { status: 400 });
  }

  try {
    // Rufe Service-Funktion auf
    await deleteUser(id);
    return NextResponse.json({ message: 'Benutzer erfolgreich gelöscht' });

  } catch (error) {
    console.error('Fehler beim Löschen des Benutzers (API):', error);
    return NextResponse.json({ message: 'Fehler beim Löschen des Benutzers' }, { status: 500 })
  }
}

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  // --- Berechtigungsprüfung (Beispiel) ---
  const session = await getServerSession(authOptions);
  // Hier Annahme: Nur Admins dürfen User bearbeiten.
  if (!session?.user?.isAdmin) {
      return NextResponse.json({ message: 'Nicht autorisiert' }, { status: 403 });
  }
  // --- Ende Berechtigungsprüfung ---

  const idParam = (await params).id;
  const id = parseInt(idParam);
  if (isNaN(id)) {
    return NextResponse.json({ message: 'Ungültige Benutzer-ID' }, { status: 400 });
  }

  const { email, name, password, isAdmin, teamIds } = await request.json();

  // Validierung (Beispiel)
  if (!email || !name) {
    return NextResponse.json({ message: 'E-Mail und Name sind erforderlich.' }, { status: 400 });
  }
  if (teamIds && !Array.isArray(teamIds)) {
    return NextResponse.json({ message: 'Team-IDs müssen ein Array sein.' }, { status: 400 });
  }

  const updateData: UpdateUserData = { email, name, password, isAdmin, teamIds };

  try {
    // Rufe Service-Funktion auf
    const updatedUser = await updateUser(id, updateData);

    if (!updatedUser) {
      return NextResponse.json({ message: 'Benutzer nicht gefunden' }, { status: 404 });
    }

    return NextResponse.json(updatedUser);

  } catch (error) {
    console.error('Fehler beim Aktualisieren des Benutzers (API):', error);
    // Handle spezifische Fehler vom Service (z.B. E-Mail-Konflikt, falls implementiert)
    // if (error instanceof Error && error.message.includes('E-Mail existiert')) {
    //   return NextResponse.json({ message: error.message }, { status: 409 });
    // }
    return NextResponse.json({ message: 'Fehler beim Aktualisieren des Benutzers' }, { status: 500 })
  }
}
