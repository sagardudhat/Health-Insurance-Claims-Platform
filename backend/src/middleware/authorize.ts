import { Request, Response, NextFunction } from 'express';
import { AppError } from '../errors';
import { UserRole } from '../types';

export const authorize = (...allowedRoles: UserRole[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return next(new AppError('Authentication required', 401));
    }

    if (!allowedRoles.includes(req.user.role)) {
      return next(
        new AppError(
          `Forbidden: Role '${req.user.role}' does not have permission to access this resource`,
          403
        )
      );
    }

    next();
  };
};
