import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { userRepository, UserRepository } from '../repositories/user.repository';
import { RegisterInput, LoginInput } from '../validators/auth.validators';
import { AppError } from '../errors';
import { UserRole } from '../types';

export class AuthService {
  private userRepo: UserRepository;

  constructor() {
    this.userRepo = userRepository;
  }

  async register(input: RegisterInput) {
    const existingUser = await this.userRepo.findByEmail(input.email);
    if (existingUser) {
      throw new AppError('Email address already registered', 409);
    }

    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(input.password, saltRounds);

    const user = await this.userRepo.create({
      name: input.name,
      email: input.email,
      passwordHash,
      role: input.role as UserRole,
    });

    const token = this.generateToken(user._id.toString(), user.role);
    const refreshToken = this.generateRefreshToken(user._id.toString());

    return {
      user: user.toJSON(),
      token,
      refreshToken,
    };
  }

  async login(input: LoginInput) {
    const user = await this.userRepo.findByEmail(input.email);
    if (!user) {
      throw new AppError('Invalid email or password', 401);
    }

    if (user.status === 'suspended') {
      throw new AppError('Your account has been suspended. Please contact support.', 401);
    }

    const isMatch = await bcrypt.compare(input.password, user.passwordHash);
    if (!isMatch) {
      throw new AppError('Invalid email or password', 401);
    }

    const token = this.generateToken(user._id.toString(), user.role);
    const refreshToken = this.generateRefreshToken(user._id.toString());

    return {
      user: user.toJSON(),
      token,
      refreshToken,
    };
  }

  async refreshAuthToken(refreshToken: string) {
    if (!refreshToken) {
      throw new AppError('Refresh token is required', 400);
    }

    const refreshSecret = process.env.JWT_REFRESH_SECRET || 'supersecret_refresh_claims_platform';
    
    try {
      const decoded = jwt.verify(refreshToken, refreshSecret) as { id: string };
      
      const user = await this.userRepo.findById(decoded.id);
      if (!user) {
        throw new AppError('User not found', 404);
      }

      if (user.status === 'suspended') {
        throw new AppError('Account is suspended', 401);
      }

      const token = this.generateToken(user._id.toString(), user.role);
      const newRefreshToken = this.generateRefreshToken(user._id.toString());

      return {
        user: user.toJSON(),
        token,
        refreshToken: newRefreshToken,
      };
    } catch (err) {
      throw new AppError('Invalid or expired refresh token', 401);
    }
  }

  async getMe(userId: string) {
    const user = await this.userRepo.findById(userId);
    if (!user) {
      throw new AppError('User not found', 404);
    }

    if (user.status === 'suspended') {
      throw new AppError('Account is suspended', 401);
    }

    return user.toJSON();
  }

  private generateToken(userId: string, role: UserRole): string {
    const secret = process.env.JWT_SECRET || 'supersecretjwtkey_claims_platform_2026';
    // Access token has short expiration
    return jwt.sign({ id: userId, role }, secret, { expiresIn: '15m' });
  }

  private generateRefreshToken(userId: string): string {
    const refreshSecret = process.env.JWT_REFRESH_SECRET || 'supersecret_refresh_claims_platform';
    // Refresh token has longer expiration
    return jwt.sign({ id: userId }, refreshSecret, { expiresIn: '7d' });
  }
}

export const authService = new AuthService();
