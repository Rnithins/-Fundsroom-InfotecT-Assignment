import { ChallanStatus, InvoiceStatus, StockMovementType } from '@prisma/client';
import { prisma } from '../config/prisma.js';
import { BadRequestError, NotFoundError } from '../utils/errors.js';

export interface ChallanQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  customerId?: string;
  status?: ChallanStatus;
}

export class ChallanService {
  private static async generateChallanNumber(): Promise<string> {
    const year = new Date().getFullYear();
    const prefix = `CH-${year}-`;
    const lastChallan = await prisma.challan.findFirst({
      where: { challanNumber: { startsWith: prefix } },
      orderBy: { challanNumber: 'desc' },
    });

    if (!lastChallan) {
      return `${prefix}000001`;
    }

    const lastNumStr = lastChallan.challanNumber.replace(prefix, '');
    const nextNum = parseInt(lastNumStr, 10) + 1;
    return `${prefix}${nextNum.toString().padStart(6, '0')}`;
  }

  private static async generateInvoiceNumber(): Promise<string> {
    const year = new Date().getFullYear();
    const prefix = `INV-${year}-`;
    const lastInvoice = await prisma.invoice.findFirst({
      where: { invoiceNumber: { startsWith: prefix } },
      orderBy: { invoiceNumber: 'desc' },
    });

    if (!lastInvoice) {
      return `${prefix}000001`;
    }

    const lastNumStr = lastInvoice.invoiceNumber.replace(prefix, '');
    const nextNum = parseInt(lastNumStr, 10) + 1;
    return `${prefix}${nextNum.toString().padStart(6, '0')}`;
  }

  static async getChallans(params: ChallanQueryParams) {
    const page = Number(params.page) || 1;
    const limit = Number(params.limit) || 10;
    const skip = (page - 1) * limit;

    const where: any = {};

    if (params.search) {
      where.OR = [
        { challanNumber: { contains: params.search, mode: 'insensitive' } },
        { customer: { customerName: { contains: params.search, mode: 'insensitive' } } },
        { customer: { businessName: { contains: params.search, mode: 'insensitive' } } },
      ];
    }

    if (params.customerId) {
      where.customerId = params.customerId;
    }

    if (params.status) {
      where.status = params.status;
    }

    const [total, challans] = await Promise.all([
      prisma.challan.count({ where }),
      prisma.challan.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          customer: { select: { id: true, customerName: true, businessName: true, mobileNumber: true } },
          creator: { select: { id: true, name: true, role: true } },
          items: true,
          invoices: { select: { id: true, invoiceNumber: true, status: true, totalAmount: true } },
        },
      }),
    ]);

    const formatted = challans.map((ch) => ({
      ...ch,
      totalAmount: ch.items.reduce((sum, item) => sum + Number(item.totalPrice), 0),
      items: ch.items.map((i) => ({
        ...i,
        unitPriceSnapshot: Number(i.unitPriceSnapshot),
        totalPrice: Number(i.totalPrice),
      })),
      invoices: ch.invoices.map((inv) => ({
        ...inv,
        totalAmount: Number(inv.totalAmount),
      })),
    }));

    return {
      challans: formatted,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit) || 1,
      },
    };
  }

  static async getChallanById(id: string) {
    const challan = await prisma.challan.findUnique({
      where: { id },
      include: {
        customer: true,
        creator: { select: { id: true, name: true, email: true, role: true } },
        items: {
          include: {
            product: { select: { id: true, name: true, sku: true, currentStock: true } },
          },
        },
        invoices: true,
      },
    });

    if (!challan) {
      throw new NotFoundError('Challan not found');
    }

    const totalAmount = challan.items.reduce((sum, i) => sum + Number(i.totalPrice), 0);

    return {
      ...challan,
      totalAmount,
      items: challan.items.map((i) => ({
        ...i,
        unitPriceSnapshot: Number(i.unitPriceSnapshot),
        totalPrice: Number(i.totalPrice),
        product: {
          ...i.product,
        },
      })),
      invoices: challan.invoices.map((inv) => ({
        ...inv,
        subtotal: Number(inv.subtotal),
        tax: Number(inv.tax),
        totalAmount: Number(inv.totalAmount),
      })),
    };
  }

  static async createChallan(data: { customerId: string; items: { productId: string; quantity: number }[] }, userId: string) {
    const customer = await prisma.customer.findUnique({ where: { id: data.customerId } });
    if (!customer) {
      throw new NotFoundError('Customer not found');
    }

    if (!data.items || data.items.length === 0) {
      throw new BadRequestError('At least one item is required');
    }

    const productIds = data.items.map((i) => i.productId);
    const products = await prisma.product.findMany({
      where: { id: { in: productIds } },
    });

    if (products.length !== productIds.length) {
      throw new NotFoundError('One or more selected products were not found');
    }

    const productMap = new Map(products.map((p) => [p.id, p]));

    let totalQuantity = 0;
    const challanItemsData = data.items.map((item) => {
      const p = productMap.get(item.productId)!;
      const unitPrice = Number(p.unitPrice);
      const totalPrice = unitPrice * item.quantity;
      totalQuantity += item.quantity;

      return {
        productId: p.id,
        productNameSnapshot: p.name,
        skuSnapshot: p.sku,
        unitPriceSnapshot: p.unitPrice,
        quantity: item.quantity,
        totalPrice: totalPrice,
      };
    });

    const challanNumber = await this.generateChallanNumber();

    const challan = await prisma.challan.create({
      data: {
        challanNumber,
        customerId: data.customerId,
        totalQuantity,
        status: ChallanStatus.DRAFT,
        createdBy: userId,
        items: {
          create: challanItemsData,
        },
      },
      include: {
        customer: true,
        items: true,
      },
    });

    await prisma.activityLog.create({
      data: {
        userId,
        action: 'CHALLAN_CREATED',
        entity: 'CHALLAN',
        entityId: challan.id,
        description: `Created draft sales challan ${challan.challanNumber} for customer ${customer.customerName}`,
      },
    });

    return {
      ...challan,
      totalAmount: challan.items.reduce((s, i) => s + Number(i.totalPrice), 0),
      items: challan.items.map((i) => ({
        ...i,
        unitPriceSnapshot: Number(i.unitPriceSnapshot),
        totalPrice: Number(i.totalPrice),
      })),
    };
  }

  static async updateChallan(id: string, data: { customerId?: string; items?: { productId: string; quantity: number }[] }, userId: string) {
    const challan = await prisma.challan.findUnique({
      where: { id },
      include: { items: true },
    });

    if (!challan) {
      throw new NotFoundError('Challan not found');
    }

    if (challan.status !== ChallanStatus.DRAFT) {
      throw new BadRequestError(`Cannot update challan with status '${challan.status}'. Only DRAFT challans can be edited.`);
    }

    let customerId = challan.customerId;
    if (data.customerId) {
      const customer = await prisma.customer.findUnique({ where: { id: data.customerId } });
      if (!customer) {
        throw new NotFoundError('Customer not found');
      }
      customerId = data.customerId;
    }

    let challanItemsData: any[] = [];
    let totalQuantity = challan.totalQuantity;

    if (data.items) {
      const productIds = data.items.map((i) => i.productId);
      const products = await prisma.product.findMany({ where: { id: { in: productIds } } });
      if (products.length !== productIds.length) {
        throw new NotFoundError('One or more selected products were not found');
      }
      const productMap = new Map(products.map((p) => [p.id, p]));

      totalQuantity = 0;
      challanItemsData = data.items.map((item) => {
        const p = productMap.get(item.productId)!;
        const unitPrice = Number(p.unitPrice);
        const totalPrice = unitPrice * item.quantity;
        totalQuantity += item.quantity;

        return {
          productId: p.id,
          productNameSnapshot: p.name,
          skuSnapshot: p.sku,
          unitPriceSnapshot: p.unitPrice,
          quantity: item.quantity,
          totalPrice: totalPrice,
        };
      });
    }

    const updated = await prisma.$transaction(async (tx) => {
      if (data.items) {
        await tx.challanItem.deleteMany({ where: { challanId: id } });
      }

      return tx.challan.update({
        where: { id },
        data: {
          customerId,
          totalQuantity,
          ...(data.items && {
            items: {
              create: challanItemsData,
            },
          }),
        },
        include: { customer: true, items: true },
      });
    });

    await prisma.activityLog.create({
      data: {
        userId,
        action: 'CHALLAN_UPDATED',
        entity: 'CHALLAN',
        entityId: updated.id,
        description: `Updated draft challan ${updated.challanNumber}`,
      },
    });

    return {
      ...updated,
      totalAmount: updated.items.reduce((s, i) => s + Number(i.totalPrice), 0),
      items: updated.items.map((i) => ({
        ...i,
        unitPriceSnapshot: Number(i.unitPriceSnapshot),
        totalPrice: Number(i.totalPrice),
      })),
    };
  }

  static async confirmChallan(id: string, userId: string) {
    const challan = await prisma.challan.findUnique({
      where: { id },
      include: {
        items: true,
        customer: true,
      },
    });

    if (!challan) {
      throw new NotFoundError('Challan not found');
    }

    if (challan.status === ChallanStatus.CONFIRMED) {
      throw new BadRequestError('Challan is already confirmed');
    }

    if (challan.status === ChallanStatus.CANCELLED) {
      throw new BadRequestError('Cannot confirm a cancelled challan');
    }

    // Atomic transaction for stock checking, reduction, movement logging, confirmation, and invoice creation
    const result = await prisma.$transaction(async (tx) => {
      // 1. Fetch current stock for all products in items
      const productIds = challan.items.map((item) => item.productId);
      const products = await tx.product.findMany({
        where: { id: { in: productIds } },
      });

      const productMap = new Map(products.map((p) => [p.id, p]));

      // 2. Validate stock for EVERY item
      for (const item of challan.items) {
        const prod = productMap.get(item.productId);
        if (!prod) {
          throw new NotFoundError(`Product ${item.productNameSnapshot} not found`);
        }
        if (item.quantity > prod.currentStock) {
          throw new BadRequestError(
            `Insufficient stock for product '${prod.name}' (SKU: ${prod.sku}).`,
            'INSUFFICIENT_STOCK',
            {
              productId: prod.id,
              productName: prod.name,
              available: prod.currentStock,
              requested: item.quantity,
            }
          );
        }
      }

      // 3. Stock deduction & StockMovement creation for all products
      for (const item of challan.items) {
        await tx.product.update({
          where: { id: item.productId },
          data: { currentStock: { decrement: item.quantity } },
        });

        await tx.stockMovement.create({
          data: {
            productId: item.productId,
            quantity: item.quantity,
            movementType: StockMovementType.OUT,
            reason: `Challan confirmation ${challan.challanNumber}`,
            createdBy: userId,
          },
        });
      }

      // 4. Update Challan status
      const confirmedChallan = await tx.challan.update({
        where: { id },
        data: { status: ChallanStatus.CONFIRMED },
        include: { items: true, customer: true },
      });

      // 5. Generate Invoice automatically
      const subtotal = confirmedChallan.items.reduce((sum, item) => sum + Number(item.totalPrice), 0);
      const tax = subtotal * 0.18; // 18% GST standard
      const totalAmount = subtotal + tax;
      const invoiceNumber = await this.generateInvoiceNumber();

      const invoice = await tx.invoice.create({
        data: {
          invoiceNumber,
          challanId: id,
          customerId: confirmedChallan.customerId,
          subtotal,
          tax,
          totalAmount,
          status: InvoiceStatus.GENERATED,
        },
      });

      return { confirmedChallan, invoice };
    });

    await prisma.activityLog.create({
      data: {
        userId,
        action: 'CHALLAN_CONFIRMED',
        entity: 'CHALLAN',
        entityId: id,
        description: `Confirmed sales challan ${challan.challanNumber}. Created invoice ${result.invoice.invoiceNumber}.`,
      },
    });

    return {
      ...result.confirmedChallan,
      totalAmount: result.confirmedChallan.items.reduce((s, i) => s + Number(i.totalPrice), 0),
      invoice: {
        ...result.invoice,
        subtotal: Number(result.invoice.subtotal),
        tax: Number(result.invoice.tax),
        totalAmount: Number(result.invoice.totalAmount),
      },
    };
  }

  static async cancelChallan(id: string, userId: string) {
    const challan = await prisma.challan.findUnique({
      where: { id },
      include: { items: true, customer: true, invoices: true },
    });

    if (!challan) {
      throw new NotFoundError('Challan not found');
    }

    if (challan.status === ChallanStatus.CANCELLED) {
      throw new BadRequestError('Challan is already cancelled');
    }

    const wasConfirmed = challan.status === ChallanStatus.CONFIRMED;

    const result = await prisma.$transaction(async (tx) => {
      if (wasConfirmed) {
        // Restore stock for confirmed challan items
        for (const item of challan.items) {
          await tx.product.update({
            where: { id: item.productId },
            data: { currentStock: { increment: item.quantity } },
          });

          await tx.stockMovement.create({
            data: {
              productId: item.productId,
              quantity: item.quantity,
              movementType: StockMovementType.IN,
              reason: `Challan cancellation ${challan.challanNumber}`,
              createdBy: userId,
            },
          });
        }

        // Cancel linked invoices
        if (challan.invoices.length > 0) {
          await tx.invoice.updateMany({
            where: { challanId: id },
            data: { status: InvoiceStatus.CANCELLED },
          });
        }
      }

      const cancelledChallan = await tx.challan.update({
        where: { id },
        data: { status: ChallanStatus.CANCELLED },
        include: { items: true, customer: true, invoices: true },
      });

      return cancelledChallan;
    });

    await prisma.activityLog.create({
      data: {
        userId,
        action: 'CHALLAN_CANCELLED',
        entity: 'CHALLAN',
        entityId: id,
        description: `Cancelled sales challan ${challan.challanNumber}.${wasConfirmed ? ' Restored product inventory.' : ''}`,
      },
    });

    return {
      ...result,
      totalAmount: result.items.reduce((s, i) => s + Number(i.totalPrice), 0),
    };
  }
}
