"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const bcrypt_1 = __importDefault(require("bcrypt"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const prisma_js_1 = require("../config/prisma.js");
const index_js_1 = require("../config/index.js");
const errors_js_1 = require("../utils/errors.js");
class AuthService {
    static async login(email, password) {
        let user;
        try {
            user = await prisma_js_1.prisma.user.findUnique({
                where: { email },
            });
        }
        catch (dbError) {
            console.error('❌ Database login error:', dbError);
            throw new Error(`Database error during authentication: ${dbError.message || 'Unable to connect to database'}`);
        }
        if (!user || !user.isActive) {
            throw new errors_js_1.UnauthorizedError('Invalid email or password');
        }
        const isMatch = await bcrypt_1.default.compare(password, user.passwordHash);
        if (!isMatch) {
            throw new errors_js_1.UnauthorizedError('Invalid email or password');
        }
        const token = jsonwebtoken_1.default.sign({
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
        }, index_js_1.config.jwtSecret, { expiresIn: index_js_1.config.jwtExpiresIn });
        // Log Activity (non-blocking)
        try {
            await prisma_js_1.prisma.activityLog.create({
                data: {
                    userId: user.id,
                    action: 'LOGIN',
                    entity: 'USER',
                    entityId: user.id,
                    description: `User ${user.name} logged in successfully`,
                },
            });
        }
        catch (logErr) {
            console.warn('⚠️ Non-fatal: Failed to record login activity log:', logErr);
        }
        return {
            token,
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role,
            },
        };
    }
    static async me(userId) {
        const user = await prisma_js_1.prisma.user.findUnique({
            where: { id: userId },
            select: {
                id: true,
                name: true,
                email: true,
                role: true,
                isActive: true,
                createdAt: true,
            },
        });
        if (!user) {
            throw new errors_js_1.UnauthorizedError('User not found');
        }
        return user;
    }
}
exports.AuthService = AuthService;
