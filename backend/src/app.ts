import express from 'express';
import type { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import compression from 'compression';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import dns from 'node:dns';

// Ensure fast IPv4 resolution on Windows to avoid IPv6 timeouts
try {
  dns.setDefaultResultOrder('ipv4first');
} catch (_) {}

// Ensure .env is loaded from backend directory, project root, or parent
const possibleEnvPaths = [
  path.resolve(process.cwd(), '.env'),
  path.resolve(process.cwd(), 'backend', '.env'),
  path.resolve(process.cwd(), '..', '.env')
];

for (const p of possibleEnvPaths) {
  if (fs.existsSync(p)) {
    dotenv.config({ path: p, override: true });
  }
}
dotenv.config({ override: true });

import authRoutes from './routes/auth.routes.js';
import studentRoutes from './routes/student.routes.js';
import adminRoutes from './routes/admin.routes.js';

const app = express();

// High-speed HTTP Gzip/Brotli compression for all responses
app.use(compression({
  threshold: 512, // Compress anything over 512 bytes
  level: 6
}));

// Enable CORS for local dev and all production deployment URLs
app.use(cors({
  origin: true,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept']
}));

// Increase JSON and URL-encoded payload limit for OCR papers and large test papers
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));
app.use(cookieParser());

// Routes (Mounted with /api prefix as well as root prefix for serverless compatibility)
app.use('/api/auth', authRoutes);
app.use('/auth', authRoutes);

app.use('/api/student', studentRoutes);
app.use('/student', studentRoutes);

app.use('/api/admin', adminRoutes);
app.use('/admin', adminRoutes);

// Health check and root API endpoints
app.get(['/health', '/api/health'], (req: Request, res: Response) => {
  res.status(200).json({
    status: 'ok',
    service: 'Rexam Backend',
    timestamp: new Date().toISOString()
  });
});

app.get(['/', '/api'], (req: Request, res: Response) => {
  res.status(200).json({
    status: 'ok',
    service: 'Rexam API v1',
    timestamp: new Date().toISOString()
  });
});

// Global Error Handler Middleware
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  console.error('❌ Server Error:', err);
  if (err.type === 'entity.too.large') {
    return res.status(413).json({ message: 'Payload too large. Please upload files under 50MB.' });
  }
  return res.status(err.status || 500).json({
    message: err.message || 'Internal Server Error',
    error: process.env.NODE_ENV === 'development' ? err : undefined
  });
});

export default app;
