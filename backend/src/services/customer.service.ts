import { CustomerStatus, CustomerType } from '@prisma/client';
import { prisma } from '../config/prisma.js';
import { NotFoundError } from '../utils/errors.js';

export interface CustomerQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: CustomerStatus;
  customerType?: CustomerType;
}

export class CustomerService {
  static async getCustomers(params: CustomerQueryParams) {
    const page = Number(params.page) || 1;
    const limit = Number(params.limit) || 10;
    const skip = (page - 1) * limit;

    const where: any = {};

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
      prisma.customer.count({ where }),
      prisma.customer.findMany({
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

  static async getCustomerById(id: string) {
    const customer = await prisma.customer.findUnique({
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
      throw new NotFoundError('Customer not found');
    }

    return customer;
  }

  static async createCustomer(data: any, userId: string) {
    const customer = await prisma.customer.create({
      data: {
        customerName: data.customerName,
        mobileNumber: data.mobileNumber,
        email: data.email || null,
        businessName: data.businessName || null,
        gstNumber: data.gstNumber || null,
        customerType: data.customerType || CustomerType.RETAIL,
        address: data.address || null,
        status: data.status || CustomerStatus.LEAD,
        followUpDate: data.followUpDate ? new Date(data.followUpDate) : null,
        notes: data.notes || null,
      },
    });

    await prisma.activityLog.create({
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

  static async updateCustomer(id: string, data: any, userId: string) {
    const existing = await prisma.customer.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundError('Customer not found');
    }

    const updated = await prisma.customer.update({
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

    await prisma.activityLog.create({
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

  static async deleteCustomer(id: string, userId: string) {
    const existing = await prisma.customer.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundError('Customer not found');
    }

    await prisma.customer.delete({ where: { id } });

    await prisma.activityLog.create({
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

  static async addFollowUp(customerId: string, note: string, followUpDate: Date, userId: string) {
    const customer = await prisma.customer.findUnique({ where: { id: customerId } });
    if (!customer) {
      throw new NotFoundError('Customer not found');
    }

    const followUp = await prisma.followUp.create({
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
    await prisma.customer.update({
      where: { id: customerId },
      data: { followUpDate },
    });

    await prisma.activityLog.create({
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

  static async getFollowUps(customerId: string) {
    const customer = await prisma.customer.findUnique({ where: { id: customerId } });
    if (!customer) {
      throw new NotFoundError('Customer not found');
    }

    return prisma.followUp.findMany({
      where: { customerId },
      orderBy: { createdAt: 'desc' },
      include: {
        creator: { select: { id: true, name: true, email: true } },
      },
    });
  }
}
