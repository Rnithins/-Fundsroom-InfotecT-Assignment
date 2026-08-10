import { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/errors.js';
import { sendError } from '../utils/response.js';
import { ZodError } from 'zod';
import { Prisma } from '@prisma/client';

export const errorHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  console.error(`[Error] ${req.method} ${req.path}:`, err);

  if (err instanceof AppError) {
    return sendError(res, err.message, err.statusCode, err.errorCode, err.details);
  }

  if (err instanceof ZodError) {
    const formattedErrors = err.errors.map((e) => ({
      field: e.path.join('.'),
      message: e.message,
    }));
    return sendError(res, 'Validation failed', 400, 'VALIDATION_ERROR', formattedErrors);
  }

  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    if (err.code === 'P2002') {
      const target = (err.meta?.target as string[])?.join(', ') || 'field';
      return sendError(res, `A record with this ${target} already exists`, 409, 'DUPLICATE_ENTRY');
    }
    if (err.code === 'P2025') {
      return sendError(res, 'Requested record was not found', 404, 'RECORD_NOT_FOUND');
    }
  }

  return sendError(
    res,
    process.env.NODE_ENV === 'production' ? 'Internal server error' : err.message || 'Server Error',
    500,
    'INTERNAL_SERVER_ERROR'
  );
};
