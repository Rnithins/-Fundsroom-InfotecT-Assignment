"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CustomerService = void 0;
const client_1 = require("@prisma/client");
const prisma_js_1 = require("../config/prisma.js");
const errors_js_1 = require("../utils/errors.js");
class CustomerService {
    static async getCustomers(params) {
        const page = Number(params.page) || 1;
        const limit = Number(params.limit) || 10;
        const skip = (page - 1) * limit;
        const where = {};
        if (params.search) {
            where.OR = [
                { customerName: { contains: params.search, mode: 'insensitive' } },
                { businessName: { contains: params.search, mode: 'insensitive' } },
                { mobileNumber: { contains: params.search, mode: 'insensitive' } },
                { email: { contains: params.search, mode: 'insensitive' } },
                { gstNumber: { contains: params.search, mode: 'insensitive' } },
            ];
        }
        if (params.status) {
            where.status = params.status;
        }
        if (params.customerType) {
            where.customerType = params.customerType;
        }
        const [total, customers] = await Promise.all([
            prisma_js_1.prisma.customer.count({ where }),
            prisma_js_1.prisma.customer.findMany({
                where,
                skip,
                take: limit,
                orderBy: { createdAt: 'desc' },
                include: {
                    _count: {
                        select: { followUps: true, challans: true, invoices: true },
                    },
                },
            }),
        ]);
        return {
            customers,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit) || 1,
            },
        };
    }
    static async getCustomerById(id) {
        const customer = await prisma_js_1.prisma.customer.findUnique({
            where: { id },
            include: {
                followUps: {
                    orderBy: { createdAt: 'desc' },
                    include: {
                        creator: { select: { id: true, name: true, email: true } },
                    },
                },
                challans: {
                    orderBy: { createdAt: 'desc' },
                    take: 10,
                    include: { items: true },
                },
                invoices: {
                    orderBy: { createdAt: 'desc' },
                    take: 10,
                },
            },
        });
        if (!customer) {
            throw new errors_js_1.NotFoundError('Customer not found');
        }
        return customer;
    }
    static async createCustomer(data, userId) {
        const customer = await prisma_js_1.prisma.customer.create({
            data: {
                customerName: data.customerName,
                mobileNumber: data.mobileNumber,
                email: data.email || null,
                businessName: data.businessName || null,
                gstNumber: data.gstNumber || null,
                customerType: data.customerType || client_1.CustomerType.RETAIL,
                address: data.address || null,
                status: data.status || client_1.CustomerStatus.LEAD,
                followUpDate: data.followUpDate ? new Date(data.followUpDate) : null,
                notes: data.notes || null,
            },
        });
        await prisma_js_1.prisma.activityLog.create({
            data: {
                userId,
                action: 'CUSTOMER_CREATED',
                entity: 'CUSTOMER',
                entityId: customer.id,
                description: `Created customer ${customer.customerName} (${customer.businessName || 'N/A'})`,
            },
        });
        return customer;
    }
    static async updateCustomer(id, data, userId) {
        const existing = await prisma_js_1.prisma.customer.findUnique({ where: { id } });
        if (!existing) {
            throw new errors_js_1.NotFoundError('Customer not found');
        }
        const updated = await prisma_js_1.prisma.customer.update({
            where: { id },
            data: {
                ...(data.customerName && { customerName: data.customerName }),
                ...(data.mobileNumber && { mobileNumber: data.mobileNumber }),
                email: data.email !== undefined ? (data.email || null) : existing.email,
                businessName: data.businessName !== undefined ? (data.businessName || null) : existing.businessName,
                gstNumber: data.gstNumber !== undefined ? (data.gstNumber || null) : existing.gstNumber,
                ...(data.customerType && { customerType: data.customerType }),
                address: data.address !== undefined ? (data.address || null) : existing.address,
                ...(data.status && { status: data.status }),
                followUpDate: data.followUpDate !== undefined ? (data.followUpDate ? new Date(data.followUpDate) : null) : existing.followUpDate,
                notes: data.notes !== undefined ? (data.notes || null) : existing.notes,
            },
        });
        await prisma_js_1.prisma.activityLog.create({
            data: {
                userId,
                action: 'CUSTOMER_UPDATED',
                entity: 'CUSTOMER',
                entityId: updated.id,
                description: `Updated customer details for ${updated.customerName}`,
            },
        });
        return updated;
    }
    static async deleteCustomer(id, userId) {
        const existing = await prisma_js_1.prisma.customer.findUnique({ where: { id } });
        if (!existing) {
            throw new errors_js_1.NotFoundError('Customer not found');
        }
        await prisma_js_1.prisma.customer.delete({ where: { id } });
        await prisma_js_1.prisma.activityLog.create({
            data: {
                userId,
                action: 'CUSTOMER_DELETED',
                entity: 'CUSTOMER',
                entityId: id,
                description: `Deleted customer ${existing.customerName}`,
            },
        });
        return { message: 'Customer deleted successfully' };
    }
    static async addFollowUp(customerId, note, followUpDate, userId) {
        const customer = await prisma_js_1.prisma.customer.findUnique({ where: { id: customerId } });
        if (!customer) {
            throw new errors_js_1.NotFoundError('Customer not found');
        }
        const followUp = await prisma_js_1.prisma.followUp.create({
            data: {
                customerId,
                note,
                followUpDate,
                createdBy: userId,
            },
            include: {
                creator: { select: { id: true, name: true, email: true } },
            },
        });
        // Automatically update customer's next followUpDate
        await prisma_js_1.prisma.customer.update({
            where: { id: customerId },
            data: { followUpDate },
        });
        await prisma_js_1.prisma.activityLog.create({
            data: {
                userId,
                action: 'CUSTOMER_FOLLOWUP_ADDED',
                entity: 'CUSTOMER',
                entityId: customerId,
                description: `Added follow-up for customer ${customer.customerName}`,
            },
        });
        return followUp;
    }
    static async getFollowUps(customerId) {
        const customer = await prisma_js_1.prisma.customer.findUnique({ where: { id: customerId } });
        if (!customer) {
            throw new errors_js_1.NotFoundError('Customer not found');
        }
        return prisma_js_1.prisma.followUp.findMany({
            where: { customerId },
            orderBy: { createdAt: 'desc' },
            include: {
                creator: { select: { id: true, name: true, email: true } },
            },
        });
    }
}
exports.CustomerService = CustomerService;
