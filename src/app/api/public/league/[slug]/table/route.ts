import { NextRequest, NextResponse } from 'next/server'
import prisma from '../../../../../../lib/prisma'

export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const { slug } = params

    // Liga finden
    const league = await prisma.league.findUnique({
      where: { slug },
      include: {
        teams: true,
        fixtures: {
          include: {
            homeTeam: true,
            awayTeam: true,
          },
        },
      },
    })

    if (!league) {
      return NextResponse.json({ error: 'Liga nicht gefunden' }, { status: 404 })
    }

    // Tabelle berechnen
    const tableEntries = league.teams.map(team => {
      const teamFixtures = league.fixtures.filter(
        fixture => 
          (fixture.homeTeamId === team.id || fixture.awayTeamId === team.id) && 
          fixture.homeSets !== null && 
          fixture.awaySets !== null
      )
      
      let played = teamFixtures.length
      let won = 0
      let lost = 0
      let points = 0
      let setsWon = 0
      let setsLost = 0
      
      teamFixtures.forEach(fixture => {
        const isHomeTeam = fixture.homeTeamId === team.id
        const homeSets = fixture.homeSets || 0
        const awaySets = fixture.awaySets || 0
        
        if (isHomeTeam) {
          setsWon += homeSets
          setsLost += awaySets
          
          if (homeSets > awaySets) {
            won++
            // Punkte basierend auf Satzunterschied
            if (homeSets === 3 && awaySets === 0) {
              points += league.pointsWin30
            } else if (homeSets === 3 && awaySets === 1) {
              points += league.pointsWin31
            } else if (homeSets === 3 && awaySets === 2) {
              points += league.pointsWin32
            }
          } else {
            lost++
            // Punkte für Niederlage mit 2 gewonnenen Sätzen
            if (homeSets === 2 && awaySets === 3) {
              points += league.pointsLoss32
            }
          }
        } else {
          setsWon += awaySets
          setsLost += homeSets
          
          if (awaySets > homeSets) {
            won++
            // Punkte basierend auf Satzunterschied
            if (awaySets === 3 && homeSets === 0) {
              points += league.pointsWin30
            } else if (awaySets === 3 && homeSets === 1) {
              points += league.pointsWin31
            } else if (awaySets === 3 && homeSets === 2) {
              points += league.pointsWin32
            }
          } else {
            lost++
            // Punkte für Niederlage mit 2 gewonnenen Sätzen
            if (awaySets === 2 && homeSets === 3) {
              points += league.pointsLoss32
            }
          }
        }
      })
      
      return {
        teamId: team.id,
        teamName: team.name,
        played,
        won,
        lost,
        points,
        setsWon,
        setsLost,
        setsDiff: setsWon - setsLost
      }
    })
    
    // Sortieren nach Punkten, dann nach Sätzen
    const sortedTable = tableEntries.sort((a, b) => {
      if (a.points !== b.points) {
        return b.points - a.points
      }
      return b.setsDiff - a.setsDiff
    })
    
    return NextResponse.json(sortedTable)
  } catch (error) {
    console.error('Error calculating table:', error)
    return NextResponse.json({ error: 'Serverfehler' }, { status: 500 })
  }
}
