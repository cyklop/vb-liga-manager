import { NextResponse } from 'next/server';
// Import von authInitializationNodeEnv entfernt, da die Variable in auth.ts entfernt wurde

export async function GET() {
  // Wert von NODE_ENV während dieser API-Anfrage
  const nodeEnvAtRequestTime = process.env.NODE_ENV;
  const nextAuthUrl = process.env.NEXTAUTH_URL;
  const nextAuthSecret = process.env.NEXTAUTH_SECRET ? 'Set' : 'Not Set';

  // Logge nur den aktuellen Wert (optional)
  console.log(`[Debug Env Check] NODE_ENV at request time: ${nodeEnvAtRequestTime}`);

  return NextResponse.json({
    NODE_ENV_at_request_time: nodeEnvAtRequestTime,
    // NODE_ENV_at_auth_initialization entfernt
    NEXTAUTH_URL: nextAuthUrl,
    NEXTAUTH_SECRET_STATUS: nextAuthSecret,
    message: 'Current environment variables from running process.' // Nachricht angepasst
  });
}
