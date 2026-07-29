import { Request, Response } from 'express';
import { authService } from '../services/auth.service';
import { catchAsync, buildSuccess } from '../utils';

export class AuthController {
  register = catchAsync(async (req: Request, res: Response) => {
    const result = await authService.register(req.body);
    res.status(201).json(buildSuccess(result, 'User registered successfully'));
  });

  login = catchAsync(async (req: Request, res: Response) => {
    const result = await authService.login(req.body);
    res.status(200).json(buildSuccess(result, 'Login successful'));
  });

  getMe = catchAsync(async (req: Request, res: Response) => {
    const user = await authService.getMe(req.user!.id);
    res.status(200).json(buildSuccess(user, 'User profile fetched'));
  });
}

export const authController = new AuthController();
