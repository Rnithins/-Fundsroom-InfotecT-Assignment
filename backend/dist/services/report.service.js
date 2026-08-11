"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReportService = void 0;
const client_1 = require("@prisma/client");
const prisma_js_1 = require("../config/prisma.js");
class ReportService {
    static async getReports(params) {
        const start = params.startDate ? new Date(params.startDate) : new Date(new Date().setMonth(new Date().getMonth() - 6));
        const end = params.endDate ? new Date(params.endDate) : new Date();
        const dateFilter = {
            createdAt: {
                gte: start,
                lte: end,
            },
        };
        const [invoices, customers, products, challans, stockMovements,] = await Promise.all([
            prisma_js_1.prisma.invoice.findMany({
                where: dateFilter,
                include: { customer: { select: { customerName: true, businessName: true } } },
                orderBy: { createdAt: 'desc' },
            }),
            prisma_js_1.prisma.customer.findMany({
                where: dateFilter,
                orderBy: { createdAt: 'desc' },
            }),
            prisma_js_1.prisma.product.findMany({
                include: {
                    category: { select: { name: true } },
                    warehouse: { select: { name: true } },
                },
            }),
            prisma_js_1.prisma.challan.findMany({
                where: dateFilter,
                include: {
                    customer: { select: { customerName: true, businessName: true } },
                    items: true,
                },
                orderBy: { createdAt: 'desc' },
            }),
            prisma_js_1.prisma.stockMovement.findMany({
                where: dateFilter,
                include: { product: { select: { name: true, sku: true } } },
                orderBy: { createdAt: 'desc' },
            }),
        ]);
        // Financial calculations
        const totalSales = invoices
            .filter((i) => i.status !== client_1.InvoiceStatus.CANCELLED)
            .reduce((sum, i) => sum + Number(i.totalAmount), 0);
        const paidSales = invoices
            .filter((i) => i.status === client_1.InvoiceStatus.PAID)
            .reduce((sum, i) => sum + Number(i.totalAmount), 0);
        const pendingSales = invoices
            .filter((i) => i.status === client_1.InvoiceStatus.GENERATED || i.status === client_1.InvoiceStatus.PARTIAL)
            .reduce((sum, i) => sum + Number(i.totalAmount), 0);
        // Inventory metrics
        const totalStockValue = products.reduce((sum, p) => sum + p.currentStock * Number(p.unitPrice), 0);
        const lowStockCount = products.filter((p) => p.currentStock <= p.minimumStock).length;
        // Customer metrics
        const newCustomersCount = customers.length;
        const activeCount = customers.filter((c) => c.status === client_1.CustomerStatus.ACTIVE).length;
        const leadCount = customers.filter((c) => c.status === client_1.CustomerStatus.LEAD).length;
        return {
            summary: {
                totalSales,
                paidSales,
                pendingSales,
                totalStockValue,
                lowStockCount,
                newCustomersCount,
                activeCount,
                leadCount,
                totalChallansCount: challans.length,
            },
            invoices: invoices.map((i) => ({
                ...i,
                subtotal: Number(i.subtotal),
                tax: Number(i.tax),
                totalAmount: Number(i.totalAmount),
            })),
            lowStockProducts: products
                .filter((p) => p.currentStock <= p.minimumStock)
                .map((p) => ({
                ...p,
                unitPrice: Number(p.unitPrice),
            })),
            challans: challans.map((c) => ({
                ...c,
                totalAmount: c.items.reduce((sum, item) => sum + Number(item.totalPrice), 0),
            })),
        };
    }
}
exports.ReportService = ReportService;
