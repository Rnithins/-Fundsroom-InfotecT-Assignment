import { Response } from 'express';
import { ApiResponse } from '../types/index.js';

export const sendSuccess = <T>(
  res: Response,
  message: string,
  data?: T,
  statusCode = 200,
  pagination?: ApiResponse['pagination']
) => {
  const response: ApiResponse<T> = {
    success: true,
    message,
    data,
    ...(pagination && { pagination }),
  };
  return res.status(statusCode).json(response);
};

export const sendError = (
  res: Response,
  message: string,
  statusCode = 500,
  errorCode = 'INTERNAL_SERVER_ERROR',
  details?: any
) => {
  const response: ApiResponse = {
    success: false,
    message,
    error: {
      code: errorCode,
      ...(details && { details }),
    },
  };
  return res.status(statusCode).json(response);
};
