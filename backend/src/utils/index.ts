// Utils layer: General application helper functions (catchAsync, apiResponse wrappers).
import { Request, Response, NextFunction } from 'express';

export const catchAsync = (
  fn: (req: Request, res: Response, next: NextFunction) => Promise<any>
) => {
  return (req: Request, res: Response, next: NextFunction) => {
    fn(req, res, next).catch(next);
  };
};

export const buildSuccess = <T>(data: T, message?: string) => ({
  success: true,
  message,
  data,
});

export const buildError = (message: string, errors?: unknown) => ({
  success: false,
  message,
  errors,
});
