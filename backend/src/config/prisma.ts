import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Resolve directory name for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Handle SQLite file copy to /tmp for Vercel Serverless environment
const dbUrl = process.env.DATABASE_URL || 'file:./backend/prisma/dev.db';

if (process.env.VERCEL || process.env.NODE_ENV === 'production') {
  if (dbUrl.startsWith('file:')) {
    try {
      const dbFileName = 'dev.db';
      const tmpDbPath = path.join('/tmp', dbFileName);

      if (!fs.existsSync(tmpDbPath)) {
        const possiblePaths = [
          path.join(process.cwd(), 'backend', 'prisma', dbFileName),
          path.join(process.cwd(), 'prisma', dbFileName),
          path.join(process.cwd(), dbFileName),
          path.join(__dirname, '..', '..', 'prisma', dbFileName),
          path.join(__dirname, '..', 'prisma', dbFileName)
        ];

        let copied = false;
        for (const srcPath of possiblePaths) {
          if (fs.existsSync(srcPath)) {
            fs.copyFileSync(srcPath, tmpDbPath);
            console.log(`[Prisma Vercel Helper] Copied DB from ${srcPath} to ${tmpDbPath}`);
            copied = true;
            break;
          }
        }

        if (!copied) {
          console.warn('[Prisma Vercel Helper] Pre-existing SQLite DB file not found in build bundle, creating new instance at /tmp/dev.db');
        }
      }

      process.env.DATABASE_URL = `file:${tmpDbPath}`;
      console.log(`[Prisma Vercel Helper] Set DATABASE_URL to file:${tmpDbPath}`);
    } catch (err) {
      console.error('[Prisma Vercel Helper] Error setting up /tmp SQLite DB:', err);
    }
  }
}

// Global Prisma Client instance for Serverless reuse
const globalForPrisma = global as unknown as { prisma: PrismaClient };

export const prisma = globalForPrisma.prisma || new PrismaClient();

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}

export default prisma;
