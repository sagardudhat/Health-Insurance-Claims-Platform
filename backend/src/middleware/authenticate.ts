import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { userRepository } from '../repositories/user.repository';
import { AppError } from '../errors';
import { UserRole, UserStatus } from '../types';

export interface AuthPayload {
  id: string;
  role: UserRole;
}

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        name: string;
        email: string;
        role: UserRole;
        status: UserStatus;
      };
    }
  }
}

// Helper to extract cookie from raw header string
const parseCookieHeader = (cookieHeader?: string, name: string = 'token'): string | null => {
  if (!cookieHeader) return null;
  const match = cookieHeader.match(new RegExp(`(?:^|;\\s*)${name}=([^;]*)`));
  return match ? decodeURIComponent(match[1]) : null;
};

export const authenticate = async (req: Request, res: Response, next: NextFunction) => {
  try {
    let token: string | null = null;

    // 1. Check Authorization Bearer header
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.split(' ')[1];
    }

    // 2. Fallback to HTTP Cookie
    if (!token && req.headers.cookie) {
      token = parseCookieHeader(req.headers.cookie, 'token');
    }

    // 3. Fallback to Query parameter
    if (!token && req.query.token && typeof req.query.token === 'string') {
      token = req.query.token;
    }

    if (!token) {
      throw new AppError('Authentication required. Missing token.', 401);
    }

    const secret = process.env.JWT_SECRET || 'supersecretjwtkey_claims_platform_2026';

    let decoded: AuthPayload;
    try {
      decoded = jwt.verify(token, secret) as AuthPayload;
    } catch (err) {
      throw new AppError('Invalid or expired authentication token', 401);
    }

    // Verify user exists and check suspension status in DB
    const user = await userRepository.findById(decoded.id);
    if (!user) {
      throw new AppError('Authenticated user no longer exists', 401);
    }

    if (user.status === 'suspended') {
      throw new AppError('Account is suspended. Access revoked.', 401);
    }

    req.user = {
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      role: user.role,
      status: user.status,
    };

    next();
  } catch (error) {
    next(error);
  }
};
