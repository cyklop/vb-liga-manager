import { NextResponse } from 'next/server';
// Importiere den Wert von NODE_ENV zum Zeitpunkt der auth.ts Initialisierung
import { authInitializationNodeEnv } from '@/lib/auth';

export async function GET() {
  // Wert von NODE_ENV während dieser API-Anfrage
  const nodeEnvAtRequestTime = process.env.NODE_ENV;
  const nextAuthUrl = process.env.NEXTAUTH_URL;
  const nextAuthSecret = process.env.NEXTAUTH_SECRET ? 'Set' : 'Not Set';

  // Logge beide Werte serverseitig zum Vergleich (optional)
  console.log(`[Debug Env Check] NODE_ENV at request time: ${nodeEnvAtRequestTime}`);
  console.log(`[Debug Env Check] NODE_ENV at auth.ts initialization: ${authInitializationNodeEnv}`);

  return NextResponse.json({
    NODE_ENV_at_request_time: nodeEnvAtRequestTime,
    NODE_ENV_at_auth_initialization: authInitializationNodeEnv, // Füge den Wert hinzu
    NEXTAUTH_URL: nextAuthUrl,
    NEXTAUTH_SECRET_STATUS: nextAuthSecret,
    message: 'Current environment variables from running process and auth initialization.'
  });
}
