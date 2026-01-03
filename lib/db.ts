import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

function getPrismaClient() {
  // Only initialize if DATABASE_URL is available
  // During build, DATABASE_URL might not be set, so we delay initialization
  if (!process.env.DATABASE_URL) {
    // Return a proxy that will throw a helpful error if used
    // But make it catchable so we can handle it gracefully
    return new Proxy({} as PrismaClient, {
      get(target, prop) {
        // Allow $queryRaw to be called so we can test the connection
        if (prop === '$queryRaw') {
          return async () => {
            throw new Error('DATABASE_URL is not set')
          }
        }
        throw new Error(
          'PrismaClient is not initialized. DATABASE_URL is required. ' +
          'This usually means the database connection string is missing from environment variables.'
        )
      }
    })
  }

  return new PrismaClient()
}

export const prisma = globalForPrisma.prisma ?? getPrismaClient()

if (process.env.NODE_ENV !== 'production' && process.env.DATABASE_URL) {
  globalForPrisma.prisma = prisma
}

export default prisma

