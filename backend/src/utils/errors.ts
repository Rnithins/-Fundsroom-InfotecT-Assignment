export class AppError extends Error {
  public statusCode: number;
  public errorCode: string;
  public details?: any;

  constructor(message: string, statusCode = 500, errorCode = 'INTERNAL_SERVER_ERROR', details?: any) {
    super(message);
    this.statusCode = statusCode;
    this.errorCode = errorCode;
    this.details = details;
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

export class NotFoundError extends AppError {
  constructor(message: string, errorCode = 'NOT_FOUND') {
    super(message, 404, errorCode);
  }
}

export class BadRequestError extends AppError {
  constructor(message: string, errorCode = 'BAD_REQUEST', details?: any) {
    super(message, 400, errorCode, details);
  }
}

export class UnauthorizedError extends AppError {
  constructor(message = 'Authentication required', errorCode = 'UNAUTHENTICATED') {
    super(message, 401, errorCode);
  }
}

export class ForbiddenError extends AppError {
  constructor(message = 'Permission denied', errorCode = 'FORBIDDEN') {
    super(message, 403, errorCode);
  }
}

export class ConflictError extends AppError {
  constructor(message: string, errorCode = 'CONFLICT') {
    super(message, 409, errorCode);
  }
}
