import { NextResponse } from 'next/server'
import prisma from '../../../../../../lib/prisma'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '../../../auth/[...nextauth]/route'

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  const teamId = parseInt(params.id)
  if (isNaN(teamId)) {
    return NextResponse.json({ message: 'Ungültige Team-ID' }, { status: 400 })
  }

  // Benutzerberechtigungen prüfen
  const session = await getServerSession(authOptions)
  if (!session || !session.user?.id) {
    return NextResponse.json({ message: 'Nicht authentifiziert' }, { status: 401 })
  }

  // URL-Parameter auslesen
  const { searchParams } = new URL(request.url)
  const homeOnly = searchParams.get('homeOnly') === 'true'

  try {
    // Prüfen, ob der Benutzer Admin ist oder zum Team gehört
    const user = await prisma.user.findUnique({
      where: { id: parseInt(session.user.id) },
      include: { team: true }
    })

    if (!user) {
      return NextResponse.json({ message: 'Benutzer nicht gefunden' }, { status: 404 })
    }

    // Nur Admins oder Mitglieder des Teams dürfen die Daten sehen
    if (!user.isAdmin && !user.isSuperAdmin && (!user.team || user.team.id !== teamId)) {
      return NextResponse.json({ message: 'Keine Berechtigung' }, { status: 403 })
    }

    // Fixtures abfragen
    const whereClause = homeOnly
      ? { homeTeamId: teamId }
      : { OR: [{ homeTeamId: teamId }, { awayTeamId: teamId }] }

    const fixtures = await prisma.fixture.findMany({
      where: whereClause,
      include: {
        homeTeam: {
          select: {
            id: true,
            name: true
          }
        },
        awayTeam: {
          select: {
            id: true,
            name: true
          }
        }
      },
      orderBy: [
        { matchday: 'asc' },
        { fixtureDate: 'asc' },
        { order: 'asc' }
      ]
    })

    return NextResponse.json(fixtures)
  } catch (error) {
    console.error('Error fetching fixtures:', error)
    return NextResponse.json({ message: 'Ein Fehler ist aufgetreten' }, { status: 500 })
  }
}
