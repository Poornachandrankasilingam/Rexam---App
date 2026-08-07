import type { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { prisma } from '../config/prisma.js';

export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: string;
    name: string;
  };
}

export const authenticateJWT = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    let token: string | undefined;

    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.split(' ')[1];
    } else if (req.cookies?.accessToken) {
      token = req.cookies.accessToken;
    } else if (req.cookies?.refreshToken) {
      token = req.cookies.refreshToken;
    }

    if (!token) {
      return res.status(401).json({ message: 'Unauthorized: Access token missing' });
    }

    const secret = process.env.JWT_SECRET || 'rexam_production_jwt_secret_key_2026';
    let decoded: any;

    try {
      decoded = jwt.verify(token, secret);
    } catch (err) {
      const fallbackSecret = process.env.REFRESH_TOKEN_SECRET || 'rexam_production_refresh_token_secret_2026';
      decoded = jwt.verify(token, fallbackSecret);
    }

    if (!decoded || !decoded.id) {
      return res.status(401).json({ message: 'Unauthorized: Invalid token payload' });
    }

    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      select: { id: true, email: true, role: true, name: true }
    });

    if (!user) {
      return res.status(401).json({ message: 'Unauthorized: User record no longer exists' });
    }

    req.user = user;
    next();
  } catch (error: any) {
    console.error('❌ JWT Authentication Error:', error.message || error);
    return res.status(401).json({ message: 'Unauthorized: Invalid or expired token' });
  }
};
