import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Resolve directory name for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Handle SQLite file path resolution robustly across environments
const dbFileName = 'dev.db';
const localDbPath = path.resolve(__dirname, '../../prisma', dbFileName);

if (process.env.VERCEL || process.env.NODE_ENV === 'production') {
  try {
    const tmpDbPath = path.join('/tmp', dbFileName);
    if (!fs.existsSync(tmpDbPath)) {
      const possiblePaths = [
        localDbPath,
        path.join(process.cwd(), 'backend', 'prisma', dbFileName),
        path.join(process.cwd(), 'prisma', dbFileName),
        path.join(process.cwd(), dbFileName)
      ];

      for (const srcPath of possiblePaths) {
        if (fs.existsSync(srcPath)) {
          fs.copyFileSync(srcPath, tmpDbPath);
          console.log(`[Prisma Vercel Helper] Copied DB from ${srcPath} to ${tmpDbPath}`);
          break;
        }
      }
    }
    process.env.DATABASE_URL = `file:${tmpDbPath}`;
  } catch (err) {
    console.error('[Prisma Vercel Helper] Error setting up /tmp SQLite DB:', err);
  }
} else {
  // In development, ensure absolute path if local dev.db exists
  if (fs.existsSync(localDbPath)) {
    process.env.DATABASE_URL = `file:${localDbPath.replace(/\\/g, '/')}`;
  }
}

// Global Prisma Client instance for Serverless reuse
const globalForPrisma = global as unknown as { prisma: PrismaClient };

export const prisma = globalForPrisma.prisma || new PrismaClient();

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}

export default prisma;
