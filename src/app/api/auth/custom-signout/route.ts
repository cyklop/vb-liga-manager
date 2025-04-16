import { NextResponse } from 'next/server';
import { cookies } from 'next/headers'; // Import cookies helper

// Definiere die Produktions-Cookie-Namen (wie in authOptions)
const sessionTokenCookieName = '__Secure-next-auth.session-token';
const csrfTokenCookieName = '__Host-next-auth.csrf-token';
const callbackUrlCookieName = '__Secure-next-auth.callback-url';
// Optional: Wenn Sie weitere Cookies wie pkce verwenden, fügen Sie diese hier hinzu
// const pkceCookieName = '__Secure-next-auth.pkce.code_verifier';

export async function POST() {
  // Hier könnten Sie optional mit getToken() prüfen, ob der User überhaupt eingeloggt ist,
  // aber für das reine Löschen der Cookies ist das nicht zwingend notwendig.

  try {
    // Hole das cookies() Objekt, um Header zu setzen
    const cookieStore = cookies();
    const response = NextResponse.json({ message: 'Logout successful' });

    // Setze die Cookies mit Max-Age=0, um sie zu löschen
    // Wichtig: Verwende die exakten Produktionsnamen und Attribute (path, secure, httpOnly, sameSite)
    // wie in authOptions definiert, damit der Browser sie korrekt überschreibt.

    // Session Token
    response.cookies.set(sessionTokenCookieName, '', {
      maxAge: 0,
      path: '/',
      secure: true, // Muss true sein für __Secure-
      httpOnly: true,
      sameSite: 'lax',
    });

    // CSRF Token
    response.cookies.set(csrfTokenCookieName, '', {
      maxAge: 0,
      path: '/',
      secure: true, // Muss true sein für __Host-
      httpOnly: true,
      sameSite: 'lax',
    });

    // Callback URL Cookie
    response.cookies.set(callbackUrlCookieName, '', {
      maxAge: 0,
      path: '/',
      secure: true, // Muss true sein für __Secure-
      sameSite: 'lax', // httpOnly ist hier false
    });

    // Optional: PKCE Cookie löschen, falls verwendet
    // response.cookies.set(pkceCookieName, '', {
    //   maxAge: 0,
    //   path: '/',
    //   secure: true,
    //   httpOnly: true,
    //   sameSite: 'lax',
    // });

    console.log('[Custom Signout] Attempting to clear cookies.');
    return response;

  } catch (error) {
    console.error('Error during custom signout:', error);
    return NextResponse.json({ message: 'Logout failed' }, { status: 500 });
  }
}
