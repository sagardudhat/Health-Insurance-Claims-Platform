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

/**
 * SECURITY: Reject startup if JWT_SECRET is not explicitly configured.
 * A hardcoded fallback secret is a critical vulnerability — tokens signed with a
 * known default secret can be forged by any attacker who reads the source code.
 */
const getJwtSecret = (): string => {
  const secret = process.env.JWT_SECRET;
  if (!secret || secret.trim().length < 32) {
    throw new Error(
      '[FATAL] JWT_SECRET environment variable is missing or too short (minimum 32 characters). ' +
      'Set a strong secret in your .env file before starting the server.'
    );
  }
  return secret;
};

// Validate at module load time — server won't start if misconfigured
export const JWT_SECRET = getJwtSecret();

// Helper to extract cookie from raw header string
const parseCookieHeader = (cookieHeader?: string, name: string = 'token'): string | null => {
  if (!cookieHeader) return null;
  const match = cookieHeader.match(new RegExp(`(?:^|;\\s*)${name}=([^;]*)`));
  return match ? decodeURIComponent(match[1]) : null;
};

export const authenticate = async (req: Request, res: Response, next: NextFunction) => {
  try {
    let token: string | null = null;

    // 1. Authorization Bearer header (preferred — standard)
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.split(' ')[1];
    }

    // 2. Fallback: HTTP-only cookie
    if (!token && req.headers.cookie) {
      token = parseCookieHeader(req.headers.cookie, 'token');
    }

    // SECURITY: Query-param token is intentionally NOT supported.
    // Tokens in URLs are logged in web server access logs, browser history,
    // and sent in Referrer headers — all of which are outside the app's control.

    if (!token) {
      throw new AppError('Authentication required. Missing or malformed token.', 401);
    }

    let decoded: AuthPayload;
    try {
      decoded = jwt.verify(token, JWT_SECRET) as AuthPayload;
    } catch (err) {
      throw new AppError('Invalid or expired authentication token.', 401);
    }

    // SECURITY: Always re-fetch user from DB on each request.
    // This catches: deleted accounts, suspended accounts, role changes —
    // none of which would be reflected in a cached JWT payload alone.
    const user = await userRepository.findById(decoded.id);
    if (!user) {
      throw new AppError('Authenticated user account no longer exists.', 401);
    }

    if (user.status === 'suspended') {
      throw new AppError('Account is suspended. Access has been revoked.', 403);
    }

    // Attach fresh, authoritative user data from DB — not from JWT payload
    req.user = {
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      role: user.role,     // Role comes from DB, not JWT — prevents role escalation
      status: user.status,
    };

    next();
  } catch (error) {
    next(error);
  }
};
