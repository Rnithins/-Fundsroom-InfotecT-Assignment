"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.stockInSchema = exports.updateProductSchema = exports.createProductSchema = void 0;
const zod_1 = require("zod");
exports.createProductSchema = zod_1.z.object({
    body: zod_1.z.object({
        name: zod_1.z.string().min(2, 'Product name is required'),
        sku: zod_1.z.string().min(2, 'SKU is required'),
        categoryId: zod_1.z.string().uuid('Valid Category ID required'),
        unitPrice: zod_1.z.number().min(0, 'Price must be >= 0'),
        currentStock: zod_1.z.number().int().min(0, 'Current stock must be >= 0').optional().default(0),
        minimumStock: zod_1.z.number().int().min(0, 'Minimum stock must be >= 0').optional().default(0),
        warehouseId: zod_1.z.string().uuid('Valid Warehouse ID required'),
    }),
});
exports.updateProductSchema = exports.createProductSchema.deepPartial();
exports.stockInSchema = zod_1.z.object({
    body: zod_1.z.object({
        quantity: zod_1.z.number().int().positive('Quantity must be greater than 0'),
        reason: zod_1.z.string().min(2, 'Reason for stock-in is required'),
    }),
});
