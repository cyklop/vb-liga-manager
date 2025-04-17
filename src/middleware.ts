import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { getToken } from 'next-auth/jwt'

export async function middleware(req: NextRequest) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET })
  const { pathname } = req.nextUrl

  // Schütze alle Routen unter /admin
  if (pathname.startsWith('/admin')) {
    // Wenn kein Token vorhanden ist ODER der Benutzer kein Admin/SuperAdmin ist
    if (!token || (!token.isAdmin && !token.isSuperAdmin)) {
      // Leite zur Login-Seite um, behalte aber die ursprüngliche URL für die Weiterleitung nach dem Login bei
      const loginUrl = new URL('/login', req.url)
      loginUrl.searchParams.set('callbackUrl', req.url) // Optional: callbackUrl für Weiterleitung nach Login
      return NextResponse.redirect(loginUrl)
    }
  }

  // Wenn autorisiert, fahre mit der Anfrage fort
  return NextResponse.next()
}

// Konfiguration: Wende die Middleware auf alle Routen unter /admin an
export const config = {
  matcher: '/admin/:path*',
}
