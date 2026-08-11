"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateUserSchema = exports.createUserSchema = void 0;
const zod_1 = require("zod");
const client_1 = require("@prisma/client");
exports.createUserSchema = zod_1.z.object({
    body: zod_1.z.object({
        name: zod_1.z.string().min(2, 'Name must be at least 2 characters'),
        email: zod_1.z.string().email('Invalid email address'),
        password: zod_1.z.string().min(6, 'Password must be at least 6 characters'),
        role: zod_1.z.nativeEnum(client_1.Role, { errorMap: () => ({ message: 'Invalid user role' }) }),
    }),
});
exports.updateUserSchema = zod_1.z.object({
    body: zod_1.z.object({
        name: zod_1.z.string().min(2).optional(),
        email: zod_1.z.string().email().optional(),
        password: zod_1.z.string().min(6).optional(),
        role: zod_1.z.nativeEnum(client_1.Role).optional(),
        isActive: zod_1.z.boolean().optional(),
    }),
});
