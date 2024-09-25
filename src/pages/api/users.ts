import { NextApiRequest, NextApiResponse } from 'next'
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  switch (req.method) {
    case 'GET':
      return getUsers(req, res)
    case 'POST':
      return createUser(req, res)
    case 'PUT':
      return updateUser(req, res)
    case 'DELETE':
      return deleteUser(req, res)
    default:
      res.setHeader('Allow', ['GET', 'POST', 'PUT', 'DELETE'])
      res.status(405).end(`Method ${req.method} Not Allowed`)
  }
}

async function getUsers(req: NextApiRequest, res: NextApiResponse) {
  const users = await prisma.user.findMany({
    select: {
      id: true,
      email: true,
      name: true,
      isAdmin: true,
      isSuperAdmin: true,
      team: {
        select: {
          id: true,
          name: true,
        },
      },
    },
  })
  res.status(200).json(users)
}

async function createUser(req: NextApiRequest, res: NextApiResponse) {
  const { email, password, name, isAdmin, teamId } = req.body
  const hashedPassword = await bcrypt.hash(password, 10)
  
  try {
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
        isAdmin,
        teamId: teamId || undefined,
      },
    })
    res.status(201).json(user)
  } catch (error) {
    res.status(400).json({ message: 'Fehler beim Erstellen des Benutzers', error })
  }
}

async function updateUser(req: NextApiRequest, res: NextApiResponse) {
  const { id, email, name, isAdmin, teamId } = req.body
  try {
    const user = await prisma.user.update({
      where: { id: Number(id) },
      data: {
        email,
        name,
        isAdmin,
        teamId: teamId || undefined,
      },
    })
    res.status(200).json(user)
  } catch (error) {
    res.status(400).json({ message: 'Fehler beim Aktualisieren des Benutzers', error })
  }
}

async function deleteUser(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query
  try {
    await prisma.user.delete({
      where: { id: Number(id) },
    })
    res.status(200).json({ message: 'Benutzer erfolgreich gelöscht' })
  } catch (error) {
    res.status(400).json({ message: 'Fehler beim Löschen des Benutzers', error })
  }
}
