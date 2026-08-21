import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';

// Ensure .env is loaded from backend directory or project root
const possibleEnvPaths = [
  path.resolve(process.cwd(), 'backend', '.env'),
  path.resolve(process.cwd(), '.env')
];

for (const p of possibleEnvPaths) {
  if (fs.existsSync(p)) {
    dotenv.config({ path: p });
  }
}
dotenv.config();

import authRoutes from './routes/auth.routes.js';
import studentRoutes from './routes/student.routes.js';
import adminRoutes from './routes/admin.routes.js';

const app = express();

const allowedOrigins = [
  process.env.CLIENT_URL,
  'http://localhost:3000',
  'https://rexam-app.vercel.app'
].filter(Boolean) as string[];

app.use(cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin) || process.env.NODE_ENV !== 'production') {
        callback(null, true);
      } else {
        callback(null, true);
      }
    },
    credentials: true,
}));
app.use(express.json());
app.use(cookieParser());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/student', studentRoutes);
app.use('/api/admin', adminRoutes);

// Health check and root API endpoint
app.get('/health', (req, res) => {
    res.json({
        status: 'ok',
        service: 'Rexam Backend'
    });
});

app.get('/api/health', (req, res) => {
    res.json({
        status: 'ok',
        service: 'Rexam Backend'
    });
});

app.get('/api', (req, res) => {
    res.status(200).json({ status: 'ok', message: 'Rexam API v1' });
});

export default app;
