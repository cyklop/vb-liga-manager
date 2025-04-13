import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const { slug } = params

    const league = await prisma.league.findUnique({
      where: { slug },
      include: {
        teams: {
          select: {
            id: true,
            name: true,
          },
        },
        fixtures: {
          include: {
            homeTeam: {
              select: {
                id: true,
                name: true,
              },
            },
            awayTeam: {
              select: {
                id: true,
                name: true,
              },
            },
          },
          orderBy: {
            order: 'asc'
          }
        },
      },
    })

    if (!league) {
      return NextResponse.json({ error: 'Liga nicht gefunden' }, { status: 404 })
    }

    return NextResponse.json(league)
  } catch (error) {
    console.error('Error fetching league:', error)
    return NextResponse.json({ error: 'Serverfehler' }, { status: 500 })
  }
}
