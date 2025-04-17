import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { getToken } from 'next-auth/jwt'

export async function middleware(req: NextRequest) {
  // --- DEBUGGING START ---
  // Logge den Cookie-Header und den Secret
  const cookieHeader = req.headers.get('cookie');
  console.log('[Middleware] Received Cookie Header:', cookieHeader);
  console.log('[Middleware] NEXTAUTH_SECRET available:', !!process.env.NEXTAUTH_SECRET); // Logge, ob Secret vorhanden ist
  // --- DEBUGGING END ---

  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET })
  const { pathname } = req.nextUrl

  // --- DEBUGGING START ---
  // Logge den entschlüsselten Token (oder null)
  console.log('[Middleware] Decoded Token:', token);
  // --- DEBUGGING END ---

  // Definiere geschützte Routen
  const protectedRoutes = ['/admin', '/dashboard']; // Füge /dashboard hinzu

  // Prüfe, ob der aktuelle Pfad mit einer der geschützten Routen beginnt
  const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route));

  if (isProtectedRoute) {
    // Prüfung für /admin Routen (Admin-Rechte erforderlich)
    if (pathname.startsWith('/admin')) {
      if (!token || (!token.isAdmin && !token.isSuperAdmin)) {
        const loginUrl = new URL('/login', req.url);
        loginUrl.searchParams.set('callbackUrl', req.url);
        return NextResponse.redirect(loginUrl);
      }
    }
    // Prüfung für andere geschützte Routen (nur Login erforderlich)
    else if (!token) { // z.B. /dashboard
      const loginUrl = new URL('/login', req.url);
      loginUrl.searchParams.set('callbackUrl', req.url);
      return NextResponse.redirect(loginUrl);
    }
  }

  // Wenn autorisiert, fahre mit der Anfrage fort
  return NextResponse.next()
}

// Konfiguration: Wende die Middleware auf alle Routen unter /admin und /dashboard an
export const config = {
  matcher: ['/admin/:path*', '/dashboard/:path*'], // Füge /dashboard hinzu
}
