"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserService = void 0;
const bcrypt_1 = __importDefault(require("bcrypt"));
const prisma_js_1 = require("../config/prisma.js");
const errors_js_1 = require("../utils/errors.js");
class UserService {
    static async getAllUsers() {
        return prisma_js_1.prisma.user.findMany({
            select: {
                id: true,
                name: true,
                email: true,
                role: true,
                isActive: true,
                createdAt: true,
                updatedAt: true,
            },
            orderBy: { createdAt: 'desc' },
        });
    }
    static async createUser(data, creatorId) {
        const existing = await prisma_js_1.prisma.user.findUnique({ where: { email: data.email } });
        if (existing) {
            throw new errors_js_1.BadRequestError('User with this email already exists');
        }
        const passwordHash = await bcrypt_1.default.hash(data.password, 10);
        const user = await prisma_js_1.prisma.user.create({
            data: {
                name: data.name,
                email: data.email,
                passwordHash,
                role: data.role,
            },
            select: {
                id: true,
                name: true,
                email: true,
                role: true,
                isActive: true,
                createdAt: true,
            },
        });
        await prisma_js_1.prisma.activityLog.create({
            data: {
                userId: creatorId,
                action: 'USER_CREATED',
                entity: 'USER',
                entityId: user.id,
                description: `Created user account for ${user.email} (${user.role})`,
            },
        });
        return user;
    }
    static async updateUser(id, data, modifierId) {
        const user = await prisma_js_1.prisma.user.findUnique({ where: { id } });
        if (!user) {
            throw new errors_js_1.NotFoundError('User not found');
        }
        let passwordHash = user.passwordHash;
        if (data.password) {
            passwordHash = await bcrypt_1.default.hash(data.password, 10);
        }
        const updated = await prisma_js_1.prisma.user.update({
            where: { id },
            data: {
                ...(data.name && { name: data.name }),
                ...(data.email && { email: data.email }),
                ...(data.role && { role: data.role }),
                ...(data.isActive !== undefined && { isActive: data.isActive }),
                passwordHash,
            },
            select: {
                id: true,
                name: true,
                email: true,
                role: true,
                isActive: true,
                updatedAt: true,
            },
        });
        await prisma_js_1.prisma.activityLog.create({
            data: {
                userId: modifierId,
                action: 'USER_UPDATED',
                entity: 'USER',
                entityId: updated.id,
                description: `Updated user account ${updated.email}`,
            },
        });
        return updated;
    }
}
exports.UserService = UserService;
