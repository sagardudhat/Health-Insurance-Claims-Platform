import { User, IUserDocument } from '../models/User.model';
import { UserRole, UserStatus, PaginatedResult } from '../types';

export class UserRepository {
  async findByEmail(email: string): Promise<IUserDocument | null> {
    return User.findOne({ email: email.toLowerCase().trim() });
  }

  async findById(id: string): Promise<IUserDocument | null> {
    return User.findById(id);
  }

  async create(data: {
    name: string;
    email: string;
    passwordHash: string;
    role?: UserRole;
  }): Promise<IUserDocument> {
    const user = new User({
      ...data,
      email: data.email.toLowerCase().trim(),
      role: data.role || 'provider',
      status: 'active',
    });
    return user.save();
  }

  async updateStatus(id: string, status: UserStatus): Promise<IUserDocument | null> {
    return User.findByIdAndUpdate(id, { status }, { new: true });
  }

  async findAll(): Promise<IUserDocument[]> {
    return User.find().sort({ createdAt: -1 });
  }

  async findPaginated(
    page: number = 1,
    limit: number = 10,
    search?: string,
    searchField: string = 'all'
  ): Promise<PaginatedResult<IUserDocument>> {
    const pageNum = Math.max(1, page);
    const limitNum = Math.max(1, limit);
    const skip = (pageNum - 1) * limitNum;

    const query: Record<string, any> = {};

    if (search && search.trim().length > 0) {
      const regex = new RegExp(search.trim(), 'i');

      if (searchField === 'name') {
        query.name = regex;
      } else if (searchField === 'email') {
        query.email = regex;
      } else if (searchField === 'role') {
        query.role = regex;
      } else {
        query.$or = [{ name: regex }, { email: regex }, { role: regex }];
      }
    }

    const totalItems = await User.countDocuments(query);
    const data = await User.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum);

    const totalPages = Math.ceil(totalItems / limitNum) || 1;

    return {
      data,
      pagination: {
        totalItems,
        totalPages,
        currentPage: pageNum,
        itemsPerPage: limitNum,
        hasNextPage: pageNum < totalPages,
        hasPrevPage: pageNum > 1,
      },
    };
  }
}

export const userRepository = new UserRepository();
