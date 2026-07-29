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

    return {
      user: user.toJSON(),
      token,
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

    return {
      user: user.toJSON(),
      token,
    };
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
    return jwt.sign({ id: userId, role }, secret, { expiresIn: '8h' });
  }
}

export const authService = new AuthService();
