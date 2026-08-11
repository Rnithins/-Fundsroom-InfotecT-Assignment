"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorHandler = void 0;
const errors_js_1 = require("../utils/errors.js");
const response_js_1 = require("../utils/response.js");
const zod_1 = require("zod");
const client_1 = require("@prisma/client");
const errorHandler = (err, req, res, next) => {
    console.error(`[Error] ${req.method} ${req.path}:`, err);
    if (req.headers.origin) {
        res.setHeader('Access-Control-Allow-Origin', req.headers.origin);
        res.setHeader('Access-Control-Allow-Credentials', 'true');
    }
    if (err instanceof errors_js_1.AppError) {
        return (0, response_js_1.sendError)(res, err.message, err.statusCode, err.errorCode, err.details);
    }
    if (err instanceof zod_1.ZodError) {
        const formattedErrors = err.errors.map((e) => ({
            field: e.path.join('.'),
            message: e.message,
        }));
        return (0, response_js_1.sendError)(res, 'Validation failed', 400, 'VALIDATION_ERROR', formattedErrors);
    }
    if (err instanceof client_1.Prisma.PrismaClientKnownRequestError) {
        if (err.code === 'P2002') {
            const target = err.meta?.target?.join(', ') || 'field';
            return (0, response_js_1.sendError)(res, `A record with this ${target} already exists`, 409, 'DUPLICATE_ENTRY');
        }
        if (err.code === 'P2025') {
            return (0, response_js_1.sendError)(res, 'Requested record was not found', 404, 'RECORD_NOT_FOUND');
        }
    }
    const errorMessage = err?.message || (typeof err === 'string' ? err : 'Server Error');
    return (0, response_js_1.sendError)(res, errorMessage, 500, 'INTERNAL_SERVER_ERROR');
};
exports.errorHandler = errorHandler;
