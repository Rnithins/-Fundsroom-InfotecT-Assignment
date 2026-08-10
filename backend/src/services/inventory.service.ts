import { StockMovementType } from '@prisma/client';
import { prisma } from '../config/prisma.js';

export interface StockMovementQueryParams {
  page?: number;
  limit?: number;
  productId?: string;
  movementType?: StockMovementType;
}

export class InventoryService {
  static async getStockMovements(params: StockMovementQueryParams) {
    const page = Number(params.page) || 1;
    const limit = Number(params.limit) || 10;
    const skip = (page - 1) * limit;

    const where: any = {};
    if (params.productId) {
      where.productId = params.productId;
    }
    if (params.movementType) {
      where.movementType = params.movementType;
    }

    const [total, movements] = await Promise.all([
      prisma.stockMovement.count({ where }),
      prisma.stockMovement.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          product: {
            select: { id: true, name: true, sku: true, unitPrice: true },
          },
          creator: {
            select: { id: true, name: true, email: true, role: true },
          },
        },
      }),
    ]);

    return {
      movements: movements.map((m) => ({
        ...m,
        product: {
          ...m.product,
          unitPrice: Number(m.product.unitPrice),
        },
      })),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit) || 1,
      },
    };
  }
}
