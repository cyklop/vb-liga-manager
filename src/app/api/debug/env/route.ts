import { NextResponse } from 'next/server';

export async function GET() {
  // Direkt den Wert aus der laufenden Umgebung holen
  const nodeEnv = process.env.NODE_ENV;
  const nextAuthUrl = process.env.NEXTAUTH_URL; // Gleich mitprüfen!
  const nextAuthSecret = process.env.NEXTAUTH_SECRET ? 'Set' : 'Not Set'; // Nur prüfen OB gesetzt

  console.log(`[Debug Env Check] NODE_ENV: ${nodeEnv}`); // Logge es auch serverseitig

  return NextResponse.json({
    NODE_ENV: nodeEnv,
    NEXTAUTH_URL: nextAuthUrl,
    NEXTAUTH_SECRET_STATUS: nextAuthSecret,
    message: 'Current environment variables from running process.'
  });
}
