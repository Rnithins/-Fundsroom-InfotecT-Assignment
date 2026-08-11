"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createFollowUpSchema = exports.updateCustomerSchema = exports.createCustomerSchema = void 0;
const zod_1 = require("zod");
const client_1 = require("@prisma/client");
exports.createCustomerSchema = zod_1.z.object({
    body: zod_1.z.object({
        customerName: zod_1.z.string().min(2, 'Customer name is required'),
        mobileNumber: zod_1.z.string().regex(/^[0-9+\-\s]{8,15}$/, 'Invalid mobile number format'),
        email: zod_1.z.string().email('Invalid email address').optional().or(zod_1.z.literal('')),
        businessName: zod_1.z.string().optional().or(zod_1.z.literal('')),
        gstNumber: zod_1.z.string().regex(/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/, 'Invalid GST format').optional().or(zod_1.z.literal('')),
        customerType: zod_1.z.nativeEnum(client_1.CustomerType).optional(),
        address: zod_1.z.string().optional().or(zod_1.z.literal('')),
        status: zod_1.z.nativeEnum(client_1.CustomerStatus).optional(),
        followUpDate: zod_1.z.string().datetime().optional().or(zod_1.z.literal('')).transform(val => val ? new Date(val) : undefined),
        notes: zod_1.z.string().optional().or(zod_1.z.literal('')),
    }),
});
exports.updateCustomerSchema = exports.createCustomerSchema.deepPartial();
exports.createFollowUpSchema = zod_1.z.object({
    body: zod_1.z.object({
        note: zod_1.z.string().min(2, 'Follow-up note is required'),
        followUpDate: zod_1.z.string().datetime({ message: 'Valid ISO date required for follow-up date' }).transform(val => new Date(val)),
    }),
});
