import { PrismaClient } from './generated/prisma/client';
import { PrismaLibSql } from '@prisma/adapter-libsql';

function createAdapter() {
  const url = process.env.DATABASE_URL ?? 'file:dev.db';
  const authToken = process.env.TURSO_AUTH_TOKEN;
  return new PrismaLibSql({ url, ...(authToken ? { authToken } : {}) });
}

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({ adapter: createAdapter() });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
