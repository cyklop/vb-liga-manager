import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
// Importiere Service-Funktionen und Typen
import { getUserProfileById, updateUserProfile, type UpdateUserProfileData } from '@/services/userService';
import type { UserProfile } from '@/types/models';


export async function GET(request: Request) {
  // Benutzer aus der Session identifizieren
  const session = await getServerSession(authOptions)
  
  if (!session || !session.user?.id) {
    return NextResponse.json({ message: 'Nicht authentifiziert' }, { status: 401 })
  }
  
  // ID aus Session holen und sicher in Zahl umwandeln
  const userId = parseInt(session.user.id as any, 10); // Use 'as any' to bypass potential TS type conflict if needed, parseInt expects string
  if (isNaN(userId)) {
    return NextResponse.json({ message: 'Ungültige Benutzer-ID in der Session' }, { status: 400 });
  }

  try {
    // Rufe Service-Funktion auf
    const userProfile = await getUserProfileById(userId);

    if (!userProfile) {
      return NextResponse.json({ message: 'Benutzer nicht gefunden' }, { status: 404 });
    }

    return NextResponse.json(userProfile);

  } catch (error) {
    console.error('Fehler beim Abrufen des Benutzerprofils (API):', error);
    return NextResponse.json({ message: 'Ein Fehler ist aufgetreten' }, { status: 500 })
  }
  // No finally block needed for singleton
}

export async function PUT(request: Request) {
  // Benutzer aus der Session identifizieren
  const session = await getServerSession(authOptions)
  
  if (!session || !session.user?.id) {
    return NextResponse.json({ message: 'Nicht authentifiziert' }, { status: 401 })
  }
  
  // ID aus Session holen und sicher in Zahl umwandeln
  const userId = parseInt(session.user.id as any, 10); // Use 'as any' to bypass potential TS type conflict if needed, parseInt expects string
  if (isNaN(userId)) {
    return NextResponse.json({ message: 'Ungültige Benutzer-ID in der Session' }, { status: 400 });
  }

  const { name, email, password, theme } = await request.json();

  // Bereite Daten für den Service vor
  const updateData: UpdateUserProfileData = { name, email, password, theme };

  try {
    // Rufe Service-Funktion auf
    const updatedUserProfile = await updateUserProfile(userId, updateData);

    if (!updatedUserProfile) {
      // Sollte nicht passieren, wenn die ID aus der Session kommt, aber sicher ist sicher
      return NextResponse.json({ message: 'Benutzer nicht gefunden' }, { status: 404 });
    }

    return NextResponse.json(updatedUserProfile);

  } catch (error) {
    console.error('Fehler beim Aktualisieren des Benutzerprofils (API):', error);
    return NextResponse.json({ message: 'Ein Fehler ist aufgetreten' }, { status: 500 });
  }
  // No finally block needed for singleton
}
