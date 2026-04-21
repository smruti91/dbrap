import type { Request, Response, NextFunction } from 'express';
import ApiError from '../utils/api-error.js';

export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (err instanceof ApiError) {
    return res.status(err.statusCode).json({
      success: false,
      message: err.message,
      errors: (err as any).errors || null
    });
  }

  console.error(err);

  return res.status(500).json({
    success: false,
    message: 'Internal Server Error'
  });
};