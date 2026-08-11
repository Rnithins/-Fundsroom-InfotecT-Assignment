"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConflictError = exports.ForbiddenError = exports.UnauthorizedError = exports.BadRequestError = exports.NotFoundError = exports.AppError = void 0;
class AppError extends Error {
    statusCode;
    errorCode;
    details;
    constructor(message, statusCode = 500, errorCode = 'INTERNAL_SERVER_ERROR', details) {
        super(message);
        this.statusCode = statusCode;
        this.errorCode = errorCode;
        this.details = details;
        Object.setPrototypeOf(this, new.target.prototype);
    }
}
exports.AppError = AppError;
class NotFoundError extends AppError {
    constructor(message, errorCode = 'NOT_FOUND') {
        super(message, 404, errorCode);
    }
}
exports.NotFoundError = NotFoundError;
class BadRequestError extends AppError {
    constructor(message, errorCode = 'BAD_REQUEST', details) {
        super(message, 400, errorCode, details);
    }
}
exports.BadRequestError = BadRequestError;
class UnauthorizedError extends AppError {
    constructor(message = 'Authentication required', errorCode = 'UNAUTHENTICATED') {
        super(message, 401, errorCode);
    }
}
exports.UnauthorizedError = UnauthorizedError;
class ForbiddenError extends AppError {
    constructor(message = 'Permission denied', errorCode = 'FORBIDDEN') {
        super(message, 403, errorCode);
    }
}
exports.ForbiddenError = ForbiddenError;
class ConflictError extends AppError {
    constructor(message, errorCode = 'CONFLICT') {
        super(message, 409, errorCode);
    }
}
exports.ConflictError = ConflictError;
