import { StockMovementType } from '@prisma/client';
import { prisma } from '../config/prisma.js';
import { BadRequestError, NotFoundError } from '../utils/errors.js';

export interface ProductQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  categoryId?: string;
  warehouseId?: string;
  lowStockOnly?: boolean;
}

export class ProductService {
  static async getProducts(params: ProductQueryParams) {
    const page = Number(params.page) || 1;
    const limit = Number(params.limit) || 10;
    const skip = (page - 1) * limit;

    const where: any = {};

    if (params.search) {
      where.OR = [
        { name: { contains: params.search, mode: 'insensitive' } },
        { sku: { contains: params.search, mode: 'insensitive' } },
      ];
    }

    if (params.categoryId) {
      where.categoryId = params.categoryId;
    }

    if (params.warehouseId) {
      where.warehouseId = params.warehouseId;
    }

    const productsRaw = await prisma.product.findMany({
      where,
      skip: params.lowStockOnly ? undefined : skip,
      take: params.lowStockOnly ? undefined : limit,
      orderBy: { createdAt: 'desc' },
      include: {
        category: { select: { id: true, name: true } },
        warehouse: { select: { id: true, name: true, location: true } },
      },
    });

    // Compute stock status for each product
    let productsWithStatus = productsRaw.map((p) => ({
      ...p,
      unitPrice: Number(p.unitPrice),
      stockStatus: p.currentStock <= p.minimumStock ? ('LOW STOCK' as const) : ('IN STOCK' as const),
    }));

    if (params.lowStockOnly) {
      productsWithStatus = productsWithStatus.filter((p) => p.stockStatus === 'LOW STOCK');
      const total = productsWithStatus.length;
      const paginated = productsWithStatus.slice(skip, skip + limit);

      return {
        products: paginated,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit) || 1,
        },
      };
    }

    const total = await prisma.product.count({ where });

    return {
      products: productsWithStatus,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit) || 1,
      },
    };
  }

  static async getProductById(id: string) {
    const product = await prisma.product.findUnique({
      where: { id },
      include: {
        category: true,
        warehouse: true,
        stockMovements: {
          orderBy: { createdAt: 'desc' },
          take: 20,
          include: { creator: { select: { id: true, name: true, email: true } } },
        },
      },
    });

    if (!product) {
      throw new NotFoundError('Product not found');
    }

    return {
      ...product,
      unitPrice: Number(product.unitPrice),
      stockStatus: product.currentStock <= product.minimumStock ? ('LOW STOCK' as const) : ('IN STOCK' as const),
    };
  }

  static async createProduct(data: any, userId: string) {
    const existingSku = await prisma.product.findUnique({ where: { sku: data.sku } });
    if (existingSku) {
      throw new BadRequestError(`SKU '${data.sku}' already exists`);
    }

    const category = await prisma.category.findUnique({ where: { id: data.categoryId } });
    if (!category) {
      throw new NotFoundError('Category not found');
    }

    const warehouse = await prisma.warehouse.findUnique({ where: { id: data.warehouseId } });
    if (!warehouse) {
      throw new NotFoundError('Warehouse not found');
    }

    const initialStock = data.currentStock || 0;

    const product = await prisma.$transaction(async (tx) => {
      const created = await tx.product.create({
        data: {
          name: data.name,
          sku: data.sku,
          categoryId: data.categoryId,
          unitPrice: data.unitPrice,
          currentStock: initialStock,
          minimumStock: data.minimumStock || 0,
          warehouseId: data.warehouseId,
        },
        include: { category: true, warehouse: true },
      });

      if (initialStock > 0) {
        await tx.stockMovement.create({
          data: {
            productId: created.id,
            quantity: initialStock,
            movementType: StockMovementType.IN,
            reason: 'Initial stock on product creation',
            createdBy: userId,
          },
        });
      }

      return created;
    });

    await prisma.activityLog.create({
      data: {
        userId,
        action: 'PRODUCT_CREATED',
        entity: 'PRODUCT',
        entityId: product.id,
        description: `Created product ${product.name} (SKU: ${product.sku})`,
      },
    });

    return {
      ...product,
      unitPrice: Number(product.unitPrice),
      stockStatus: product.currentStock <= product.minimumStock ? ('LOW STOCK' as const) : ('IN STOCK' as const),
    };
  }

  static async updateProduct(id: string, data: any, userId: string) {
    const existing = await prisma.product.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundError('Product not found');
    }

    if (data.sku && data.sku !== existing.sku) {
      const skuCheck = await prisma.product.findUnique({ where: { sku: data.sku } });
      if (skuCheck) {
        throw new BadRequestError(`SKU '${data.sku}' is already taken`);
      }
    }

    const updated = await prisma.product.update({
      where: { id },
      data: {
        ...(data.name && { name: data.name }),
        ...(data.sku && { sku: data.sku }),
        ...(data.categoryId && { categoryId: data.categoryId }),
        ...(data.unitPrice !== undefined && { unitPrice: data.unitPrice }),
        ...(data.minimumStock !== undefined && { minimumStock: data.minimumStock }),
        ...(data.warehouseId && { warehouseId: data.warehouseId }),
      },
      include: { category: true, warehouse: true },
    });

    await prisma.activityLog.create({
      data: {
        userId,
        action: 'PRODUCT_UPDATED',
        entity: 'PRODUCT',
        entityId: updated.id,
        description: `Updated product ${updated.name} (SKU: ${updated.sku})`,
      },
    });

    return {
      ...updated,
      unitPrice: Number(updated.unitPrice),
      stockStatus: updated.currentStock <= updated.minimumStock ? ('LOW STOCK' as const) : ('IN STOCK' as const),
    };
  }

  static async stockIn(productId: string, quantity: number, reason: string, userId: string) {
    if (quantity <= 0) {
      throw new BadRequestError('Quantity must be greater than zero');
    }

    const product = await prisma.product.findUnique({ where: { id: productId } });
    if (!product) {
      throw new NotFoundError('Product not found');
    }

    const updatedProduct = await prisma.$transaction(async (tx) => {
      const updated = await tx.product.update({
        where: { id: productId },
        data: { currentStock: { increment: quantity } },
      });

      await tx.stockMovement.create({
        data: {
          productId,
          quantity,
          movementType: StockMovementType.IN,
          reason,
          createdBy: userId,
        },
      });

      return updated;
    });

    await prisma.activityLog.create({
      data: {
        userId,
        action: 'STOCK_IN',
        entity: 'PRODUCT',
        entityId: productId,
        description: `Added ${quantity} units to stock for product ${product.name}. Reason: ${reason}`,
      },
    });

    return {
      ...updatedProduct,
      unitPrice: Number(updatedProduct.unitPrice),
      stockStatus: updatedProduct.currentStock <= updatedProduct.minimumStock ? ('LOW STOCK' as const) : ('IN STOCK' as const),
    };
  }

  static async getCategories() {
    return prisma.category.findMany({ orderBy: { name: 'asc' } });
  }

  static async getWarehouses() {
    return prisma.warehouse.findMany({ orderBy: { name: 'asc' } });
  }
}
