import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { createSlug, isValidSlug } from '@/lib/slugify'

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  const id = parseInt(params.id)

  try {
    await prisma.league.delete({
      where: { id },
    })
    return NextResponse.json({ message: 'Liga erfolgreich gelöscht' })
  } catch (error) {
    console.error('Error deleting league:', error)
    return NextResponse.json({ message: 'Fehler beim Löschen der Liga' }, { status: 500 })
  } 
  // No finally block needed for singleton
}

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  const id = parseInt(params.id)
  const { 
    name, 
    slug: providedSlug,
    numberOfTeams, 
    hasReturnMatches, 
    teamIds,
    isActive,
    // Add point rules
    pointsWin30, 
    pointsWin31, 
    pointsWin32, 
    pointsLoss32 
  } = await request.json()

  try {
    // Überprüfen, ob die Anzahl der ausgewählten Teams die maximale Anzahl überschreitet
    if (teamIds && teamIds.length > numberOfTeams) {
      return NextResponse.json(
        { message: `Es können maximal ${numberOfTeams} Teams zugewiesen werden` }, 
        { status: 400 }
      )
    }
    
    // Aktuelle Liga abrufen
    const currentLeague = await prisma.league.findUnique({
      where: { id }
    })
    
    if (!currentLeague) {
      return NextResponse.json({ message: 'Liga nicht gefunden' }, { status: 404 })
    }
    
    // Slug-Handling
    let finalSlug = currentLeague.slug
    
    // Wenn ein neuer Slug bereitgestellt wurde oder der Name geändert wurde
    if (providedSlug || (name !== currentLeague.name)) {
      finalSlug = providedSlug ? providedSlug.trim() : createSlug(name)
      
      // Slug-Validierung
      if (!isValidSlug(finalSlug)) {
        return NextResponse.json(
          { message: 'Der URL-Slug darf nur Kleinbuchstaben, Zahlen und Bindestriche enthalten' },
          { status: 400 }
        )
      }
      
      // Prüfen, ob der Slug bereits existiert (außer für die aktuelle Liga)
      const existingLeague = await prisma.league.findFirst({
        where: { 
          slug: finalSlug,
          id: { not: id }
        }
      })
      
      // Falls der Slug bereits existiert, eine Nummer anhängen
      let counter = 1
      while (existingLeague) {
        finalSlug = `${providedSlug ? providedSlug : createSlug(name)}-${counter}`
        counter++
        const checkLeague = await prisma.league.findFirst({
          where: { 
            slug: finalSlug,
            id: { not: id }
          }
        })
        if (!checkLeague) break
      }
    }

    // Zuerst alle bestehenden Team-Verbindungen entfernen
    await prisma.league.update({
      where: { id },
      data: {
        teams: {
          set: [] // Alle Team-Verbindungen entfernen
        }
      }
    })

    // Liga aktualisieren und neue Team-Verbindungen erstellen
    const updatedLeague = await prisma.league.update({
      where: { id },
      data: {
        name,
        slug: finalSlug,
        numberOfTeams,
        hasReturnMatches,
        isActive: isActive !== undefined ? isActive : undefined,
        // Update point rules - ensure they are numbers or use defaults/existing
        pointsWin30: pointsWin30 !== undefined ? Number(pointsWin30) : undefined,
        pointsWin31: pointsWin31 !== undefined ? Number(pointsWin31) : undefined,
        pointsWin32: pointsWin32 !== undefined ? Number(pointsWin32) : undefined,
        pointsLoss32: pointsLoss32 !== undefined ? Number(pointsLoss32) : undefined,
        ...(teamIds && teamIds.length > 0 && {
          teams: {
            connect: teamIds.map((teamId: number) => ({ id: teamId }))
          }
        })
      },
      include: {
        teams: true
      }
    })
    
    return NextResponse.json(updatedLeague)
  } catch (error) {
    console.error('Error updating league:', error)
    return NextResponse.json({ message: 'Fehler beim Aktualisieren der Liga' }, { status: 500 })
  }
  // No finally block needed for singleton
}
