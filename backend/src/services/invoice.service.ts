import { InvoiceStatus } from '@prisma/client';
import { prisma } from '../config/prisma.js';
import { BadRequestError, NotFoundError } from '../utils/errors.js';

export interface InvoiceQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  customerId?: string;
  status?: InvoiceStatus;
}

export class InvoiceService {
  static async getInvoices(params: InvoiceQueryParams) {
    const page = Number(params.page) || 1;
    const limit = Number(params.limit) || 10;
    const skip = (page - 1) * limit;

    const where: any = {};

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
      prisma.invoice.count({ where }),
      prisma.invoice.findMany({
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

  static async getInvoiceById(id: string) {
    const invoice = await prisma.invoice.findUnique({
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
      throw new NotFoundError('Invoice not found');
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

  static async updateInvoiceStatus(id: string, status: InvoiceStatus, userId: string) {
    const invoice = await prisma.invoice.findUnique({ where: { id } });
    if (!invoice) {
      throw new NotFoundError('Invoice not found');
    }

    if (invoice.status === InvoiceStatus.CANCELLED) {
      throw new BadRequestError('Cannot modify status of a cancelled invoice');
    }

    const updated = await prisma.invoice.update({
      where: { id },
      data: { status },
      include: { customer: true, challan: true },
    });

    await prisma.activityLog.create({
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
