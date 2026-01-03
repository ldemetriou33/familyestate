// Prisma client with lazy initialization
// This module delays PrismaClient construction until runtime

// Type imports only (no runtime code)
import type { PrismaClient as PrismaClientType } from '@prisma/client'

declare global {
  // eslint-disable-next-line no-var
  var prismaGlobal: PrismaClientType | undefined
}

// Mock model for build-time when DATABASE_URL is not available
const createMockModel = () => ({
  findMany: () => Promise.resolve([]),
  findFirst: () => Promise.resolve(null),
  findUnique: () => Promise.resolve(null),
  create: () => Promise.resolve(null),
  update: () => Promise.resolve(null),
  delete: () => Promise.resolve(null),
  upsert: () => Promise.resolve(null),
  updateMany: () => Promise.resolve({ count: 0 }),
  deleteMany: () => Promise.resolve({ count: 0 }),
  count: () => Promise.resolve(0),
  aggregate: () => Promise.resolve({ _sum: {}, _count: { _all: 0 } }),
  groupBy: () => Promise.resolve([]),
})

// Create a lazy-loading proxy
function createLazyClient(): PrismaClientType {
  let realClient: PrismaClientType | null = null

  return new Proxy({} as PrismaClientType, {
    get(_target, prop) {
      // Skip during build if no DATABASE_URL
      if (!process.env.DATABASE_URL) {
        return createMockModel()
      }

      // Lazily initialize the real client
      if (!realClient) {
        if (global.prismaGlobal) {
          realClient = global.prismaGlobal
        } else {
          // Dynamic require to avoid build-time import
          // eslint-disable-next-line
          const { PrismaClient } = require('@prisma/client')
          realClient = new PrismaClient() as PrismaClientType
          
          if (process.env.NODE_ENV !== 'production') {
            global.prismaGlobal = realClient as PrismaClientType
          }
        }
      }

      return (realClient as unknown as Record<string, unknown>)[prop as string]
    }
  })
}

export const prisma: PrismaClientType = createLazyClient()

export default prisma

