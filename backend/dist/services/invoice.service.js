"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InvoiceService = void 0;
const client_1 = require("@prisma/client");
const prisma_js_1 = require("../config/prisma.js");
const errors_js_1 = require("../utils/errors.js");
class InvoiceService {
    static async getInvoices(params) {
        const page = Number(params.page) || 1;
        const limit = Number(params.limit) || 10;
        const skip = (page - 1) * limit;
        const where = {};
        if (params.search) {
            where.OR = [
                { invoiceNumber: { contains: params.search, mode: 'insensitive' } },
                { customer: { customerName: { contains: params.search, mode: 'insensitive' } } },
                { customer: { businessName: { contains: params.search, mode: 'insensitive' } } },
                { challan: { challanNumber: { contains: params.search, mode: 'insensitive' } } },
            ];
        }
        if (params.customerId) {
            where.customerId = params.customerId;
        }
        if (params.status) {
            where.status = params.status;
        }
        const [total, invoices] = await Promise.all([
            prisma_js_1.prisma.invoice.count({ where }),
            prisma_js_1.prisma.invoice.findMany({
                where,
                skip,
                take: limit,
                orderBy: { createdAt: 'desc' },
                include: {
                    customer: { select: { id: true, customerName: true, businessName: true, mobileNumber: true, gstNumber: true } },
                    challan: { select: { id: true, challanNumber: true, totalQuantity: true, createdAt: true } },
                },
            }),
        ]);
        const formatted = invoices.map((inv) => ({
            ...inv,
            subtotal: Number(inv.subtotal),
            tax: Number(inv.tax),
            totalAmount: Number(inv.totalAmount),
        }));
        return {
            invoices: formatted,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit) || 1,
            },
        };
    }
    static async getInvoiceById(id) {
        const invoice = await prisma_js_1.prisma.invoice.findUnique({
            where: { id },
            include: {
                customer: true,
                challan: {
                    include: {
                        items: true,
                        creator: { select: { id: true, name: true, email: true } },
                    },
                },
            },
        });
        if (!invoice) {
            throw new errors_js_1.NotFoundError('Invoice not found');
        }
        return {
            ...invoice,
            subtotal: Number(invoice.subtotal),
            tax: Number(invoice.tax),
            totalAmount: Number(invoice.totalAmount),
            challan: {
                ...invoice.challan,
                items: invoice.challan.items.map((i) => ({
                    ...i,
                    unitPriceSnapshot: Number(i.unitPriceSnapshot),
                    totalPrice: Number(i.totalPrice),
                })),
            },
        };
    }
    static async updateInvoiceStatus(id, status, userId) {
        const invoice = await prisma_js_1.prisma.invoice.findUnique({ where: { id } });
        if (!invoice) {
            throw new errors_js_1.NotFoundError('Invoice not found');
        }
        if (invoice.status === client_1.InvoiceStatus.CANCELLED) {
            throw new errors_js_1.BadRequestError('Cannot modify status of a cancelled invoice');
        }
        const updated = await prisma_js_1.prisma.invoice.update({
            where: { id },
            data: { status },
            include: { customer: true, challan: true },
        });
        await prisma_js_1.prisma.activityLog.create({
            data: {
                userId,
                action: 'INVOICE_STATUS_UPDATED',
                entity: 'INVOICE',
                entityId: id,
                description: `Updated invoice ${invoice.invoiceNumber} status to ${status}`,
            },
        });
        return {
            ...updated,
            subtotal: Number(updated.subtotal),
            tax: Number(updated.tax),
            totalAmount: Number(updated.totalAmount),
        };
    }
}
exports.InvoiceService = InvoiceService;
