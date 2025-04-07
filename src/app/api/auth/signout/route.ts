import { NextResponse } from "next/server";

export async function POST() {
  try {
    // Erstelle eine Antwort, die alle NextAuth-Session-Cookies löscht
    const response = NextResponse.json({ success: true });
    
    // NextAuth-Cookies löschen
    response.cookies.set('next-auth.session-token', '', { 
      maxAge: 0,
      path: '/' 
    });
    response.cookies.set('next-auth.csrf-token', '', {
      maxAge: 0,
      path: '/'
    });
    response.cookies.set('next-auth.callback-url', '', {
      maxAge: 0,
      path: '/'
    });
    
    return response;
  } catch (error) {
    console.error("Logout error:", error);
    return NextResponse.json({ error: "Failed to logout" }, { status: 500 });
  }
}
