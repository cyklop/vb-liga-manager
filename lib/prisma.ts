import { PrismaClient } from '@prisma/client'

// PrismaClient is attached to the `global` object in development to prevent
// exhausting your database connection limit.
//
// Learn more: https://pris.ly/d/help/next-js-best-practices

declare global {
  // allow global `var` declarations
  // eslint-disable-next-line no-var
  var prisma: PrismaClient | undefined
}

// Erstelle eine einzige Instanz des Prisma Clients
const prismaClientSingleton = () => {
  return new PrismaClient({
    // Optional: Enable logging in development
    // log: ['query', 'info', 'warn', 'error'],
  })
}

// Verwende die globale Variable, um die Instanz zu speichern
export const prisma = globalThis.prisma ?? prismaClientSingleton()

// In Entwicklungsumgebungen speichern wir die Instanz im globalen Objekt
if (process.env.NODE_ENV !== 'production') globalThis.prisma = prisma

export default prisma
