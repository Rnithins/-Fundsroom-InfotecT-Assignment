"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateInvoiceStatusSchema = void 0;
const zod_1 = require("zod");
const client_1 = require("@prisma/client");
exports.updateInvoiceStatusSchema = zod_1.z.object({
    body: zod_1.z.object({
        status: zod_1.z.nativeEnum(client_1.InvoiceStatus, { errorMap: () => ({ message: 'Invalid invoice status' }) }),
    }),
});
