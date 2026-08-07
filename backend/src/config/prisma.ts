import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';

// Handle SQLite file copy to /tmp for Vercel Serverless environment
if (process.env.VERCEL && process.env.DATABASE_URL?.startsWith('file:')) {
  try {
    const dbFileName = 'dev.db';
    const tmpDbPath = path.join('/tmp', dbFileName);
    
    if (!fs.existsSync(tmpDbPath)) {
      const possiblePaths = [
        path.join(process.cwd(), 'backend', 'prisma', dbFileName),
        path.join(process.cwd(), 'prisma', dbFileName),
        path.join(process.cwd(), dbFileName)
      ];

      for (const srcPath of possiblePaths) {
        if (fs.existsSync(srcPath)) {
          fs.copyFileSync(srcPath, tmpDbPath);
          console.log(`[Prisma Vercel Helper] Copied ${srcPath} to ${tmpDbPath}`);
          break;
        }
      }
    }

    if (fs.existsSync(tmpDbPath)) {
      process.env.DATABASE_URL = `file:${tmpDbPath}`;
    }
  } catch (err) {
    console.error('[Prisma Vercel Helper] Error configuring SQLite temp path:', err);
  }
}

// Global Prisma Client instance for Serverless reuse
const globalForPrisma = global as unknown as { prisma: PrismaClient };

export const prisma = globalForPrisma.prisma || new PrismaClient();

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}

export default prisma;
