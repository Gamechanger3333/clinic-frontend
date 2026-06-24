/**
 * Prisma Client singleton
 * 
 * SETUP INSTRUCTIONS:
 * 1. Set DATABASE_URL in .env.local
 * 2. Run: npx prisma generate
 * 3. Run: npx prisma db push (or npx prisma migrate dev)
 * 4. Run: npm run dev
 */

// eslint-disable-next-line @typescript-eslint/no-require-imports
const { PrismaClient } = require("@prisma/client");

type PrismaClientType = import("@prisma/client").PrismaClient;

const globalForPrisma = globalThis as unknown as { prisma: PrismaClientType | undefined };

export const prisma: PrismaClientType =
  globalForPrisma.prisma ?? new PrismaClient({ log: ["error"] });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
