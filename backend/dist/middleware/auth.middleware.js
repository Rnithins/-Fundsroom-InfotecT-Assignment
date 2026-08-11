"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authenticate = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const index_js_1 = require("../config/index.js");
const prisma_js_1 = require("../config/prisma.js");
const errors_js_1 = require("../utils/errors.js");
const authenticate = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            throw new errors_js_1.UnauthorizedError('Missing or invalid authorization token');
        }
        const token = authHeader.split(' ')[1];
        if (!token) {
            throw new errors_js_1.UnauthorizedError('Token not provided');
        }
        let decoded;
        try {
            decoded = jsonwebtoken_1.default.verify(token, index_js_1.config.jwtSecret);
        }
        catch (err) {
            throw new errors_js_1.UnauthorizedError('Invalid or expired token');
        }
        const user = await prisma_js_1.prisma.user.findUnique({
            where: { id: decoded.id },
            select: { id: true, email: true, name: true, role: true, isActive: true },
        });
        if (!user || !user.isActive) {
            throw new errors_js_1.UnauthorizedError('User account disabled or not found');
        }
        req.user = {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
        };
        next();
    }
    catch (error) {
        next(error);
    }
};
exports.authenticate = authenticate;
