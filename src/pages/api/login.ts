import { NextApiRequest, NextApiResponse } from 'next'
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' })
  }

  const { email, password } = req.body

  try {
    const user = await prisma.user.findUnique({ where: { email } })

    if (!user) {
      return res.status(400).json({ message: 'Ungültige Anmeldeinformationen' })
    }

    const isPasswordValid = await bcrypt.compare(password, user.password)

    if (!isPasswordValid) {
      return res.status(400).json({ message: 'Ungültige Anmeldeinformationen' })
    }

    // Hier würden Sie normalerweise eine Session erstellen oder ein JWT Token generieren
    // Für dieses Beispiel senden wir einfach die Benutzerinformationen zurück
    res.status(200).json({
      id: user.id,
      email: user.email,
      name: user.name,
      isAdmin: user.isAdmin,
      isSuperAdmin: user.isSuperAdmin,
    })
  } catch (error) {
    console.error('Login error:', error)
    res.status(500).json({ message: 'Ein Fehler ist aufgetreten. Bitte versuchen Sie es später erneut.' })
  }
}
