"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DashboardService = void 0;
const client_1 = require("@prisma/client");
const prisma_js_1 = require("../config/prisma.js");
class DashboardService {
    static async getDashboardMetrics() {
        const [totalCustomers, activeCustomers, leadCustomers, totalProducts, allProducts, draftChallansCount, confirmedChallansCount, invoices, recentChallans, recentCustomers, recentStockMovements, upcomingFollowUps, recentActivities,] = await Promise.all([
            prisma_js_1.prisma.customer.count(),
            prisma_js_1.prisma.customer.count({ where: { status: client_1.CustomerStatus.ACTIVE } }),
            prisma_js_1.prisma.customer.count({ where: { status: client_1.CustomerStatus.LEAD } }),
            prisma_js_1.prisma.product.count(),
            prisma_js_1.prisma.product.findMany({ select: { id: true, name: true, sku: true, currentStock: true, minimumStock: true, unitPrice: true } }),
            prisma_js_1.prisma.challan.count({ where: { status: client_1.ChallanStatus.DRAFT } }),
            prisma_js_1.prisma.challan.count({ where: { status: client_1.ChallanStatus.CONFIRMED } }),
            prisma_js_1.prisma.invoice.findMany({ select: { status: true, totalAmount: true, createdAt: true } }),
            prisma_js_1.prisma.challan.findMany({
                take: 5,
                orderBy: { createdAt: 'desc' },
                include: { customer: { select: { customerName: true, businessName: true } } },
            }),
            prisma_js_1.prisma.customer.findMany({
                take: 5,
                orderBy: { createdAt: 'desc' },
                select: { id: true, customerName: true, businessName: true, customerType: true, status: true, createdAt: true },
            }),
            prisma_js_1.prisma.stockMovement.findMany({
                take: 5,
                orderBy: { createdAt: 'desc' },
                include: {
                    product: { select: { name: true, sku: true } },
                    creator: { select: { name: true } },
                },
            }),
            prisma_js_1.prisma.followUp.findMany({
                where: { followUpDate: { gte: new Date() } },
                take: 5,
                orderBy: { followUpDate: 'asc' },
                include: {
                    customer: { select: { id: true, customerName: true, businessName: true, mobileNumber: true } },
                    creator: { select: { name: true } },
                },
            }),
            prisma_js_1.prisma.activityLog.findMany({
                take: 10,
                orderBy: { createdAt: 'desc' },
                include: { user: { select: { name: true, role: true } } },
            }),
        ]);
        // Compute Low-stock products
        const lowStockProducts = allProducts.filter((p) => p.currentStock <= p.minimumStock);
        const totalStockQuantity = allProducts.reduce((sum, p) => sum + p.currentStock, 0);
        // Compute Invoice metrics
        const pendingInvoicesCount = invoices.filter((i) => i.status === client_1.InvoiceStatus.GENERATED || i.status === client_1.InvoiceStatus.PARTIAL).length;
        const paidInvoicesCount = invoices.filter((i) => i.status === client_1.InvoiceStatus.PAID).length;
        const totalSalesValue = invoices
            .filter((i) => i.status !== client_1.InvoiceStatus.CANCELLED)
            .reduce((sum, i) => sum + Number(i.totalAmount), 0);
        // Challans by status breakdown
        const cancelledChallansCount = await prisma_js_1.prisma.challan.count({ where: { status: client_1.ChallanStatus.CANCELLED } });
        const challansByStatus = [
            { status: 'DRAFT', count: draftChallansCount },
            { status: 'CONFIRMED', count: confirmedChallansCount },
            { status: 'CANCELLED', count: cancelledChallansCount },
        ];
        // Customer status breakdown
        const inactiveCustomers = await prisma_js_1.prisma.customer.count({ where: { status: client_1.CustomerStatus.INACTIVE } });
        const customerStatusDistribution = [
            { status: 'LEAD', count: leadCustomers },
            { status: 'ACTIVE', count: activeCustomers },
            { status: 'INACTIVE', count: inactiveCustomers },
        ];
        // Top selling products based on confirmed challan items
        const confirmedChallanItems = await prisma_js_1.prisma.challanItem.findMany({
            where: { challan: { status: client_1.ChallanStatus.CONFIRMED } },
            select: { productNameSnapshot: true, skuSnapshot: true, quantity: true, totalPrice: true },
        });
        const productSalesMap = new Map();
        for (const item of confirmedChallanItems) {
            const key = item.skuSnapshot;
            const existing = productSalesMap.get(key) || {
                name: item.productNameSnapshot,
                sku: item.skuSnapshot,
                totalQuantity: 0,
                totalRevenue: 0,
            };
            existing.totalQuantity += item.quantity;
            existing.totalRevenue += Number(item.totalPrice);
            productSalesMap.set(key, existing);
        }
        const topSellingProducts = Array.from(productSalesMap.values())
            .sort((a, b) => b.totalRevenue - a.totalRevenue)
            .slice(0, 5);
        // Sales over time (group by month/day of invoices)
        const salesOverTimeMap = new Map();
        for (const inv of invoices) {
            if (inv.status !== client_1.InvoiceStatus.CANCELLED) {
                const dateKey = new Date(inv.createdAt).toISOString().slice(0, 7); // YYYY-MM
                const current = salesOverTimeMap.get(dateKey) || 0;
                salesOverTimeMap.set(dateKey, current + Number(inv.totalAmount));
            }
        }
        const salesOverTime = Array.from(salesOverTimeMap.entries())
            .map(([date, sales]) => ({ date, sales }))
            .sort((a, b) => a.date.localeCompare(b.date));
        return {
            kpis: {
                totalCustomers,
                activeCustomers,
                leadCustomers,
                totalProducts,
                lowStockProductsCount: lowStockProducts.length,
                totalStockQuantity,
                draftChallansCount,
                confirmedChallansCount,
                pendingInvoicesCount,
                paidInvoicesCount,
                totalSalesValue,
            },
            charts: {
                salesOverTime,
                challansByStatus,
                customerStatusDistribution,
                topSellingProducts,
            },
            recentActivity: {
                recentChallans,
                recentCustomers,
                recentStockMovements,
                upcomingFollowUps,
                activityLogs: recentActivities,
                lowStockProducts: lowStockProducts.map((p) => ({
                    ...p,
                    unitPrice: Number(p.unitPrice),
                })),
            },
        };
    }
}
exports.DashboardService = DashboardService;
