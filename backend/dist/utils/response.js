"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendError = exports.sendSuccess = void 0;
const sendSuccess = (res, message, data, statusCode = 200, pagination) => {
    const response = {
        success: true,
        message,
        data,
        ...(pagination && { pagination }),
    };
    return res.status(statusCode).json(response);
};
exports.sendSuccess = sendSuccess;
const sendError = (res, message, statusCode = 500, errorCode = 'INTERNAL_SERVER_ERROR', details) => {
    const response = {
        success: false,
        message,
        error: {
            code: errorCode,
            ...(details && { details }),
        },
    };
    return res.status(statusCode).json(response);
};
exports.sendError = sendError;
