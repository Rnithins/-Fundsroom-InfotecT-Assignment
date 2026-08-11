"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateChallanSchema = exports.createChallanSchema = exports.challanItemSchema = void 0;
const zod_1 = require("zod");
exports.challanItemSchema = zod_1.z.object({
    productId: zod_1.z.string().uuid('Valid Product ID required'),
    quantity: zod_1.z.number().int().positive('Quantity must be at least 1'),
});
exports.createChallanSchema = zod_1.z.object({
    body: zod_1.z.object({
        customerId: zod_1.z.string().uuid('Valid Customer ID required'),
        items: zod_1.z.array(exports.challanItemSchema).min(1, 'At least one product item is required'),
    }),
});
exports.updateChallanSchema = exports.createChallanSchema.deepPartial();
