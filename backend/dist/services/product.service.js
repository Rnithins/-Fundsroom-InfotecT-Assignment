"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProductService = void 0;
const client_1 = require("@prisma/client");
const prisma_js_1 = require("../config/prisma.js");
const errors_js_1 = require("../utils/errors.js");
class ProductService {
    static async getProducts(params) {
        const page = Number(params.page) || 1;
        const limit = Number(params.limit) || 10;
        const skip = (page - 1) * limit;
        const where = {};
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
        const productsRaw = await prisma_js_1.prisma.product.findMany({
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
            stockStatus: p.currentStock <= p.minimumStock ? 'LOW STOCK' : 'IN STOCK',
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
        const total = await prisma_js_1.prisma.product.count({ where });
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
    static async getProductById(id) {
        const product = await prisma_js_1.prisma.product.findUnique({
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
            throw new errors_js_1.NotFoundError('Product not found');
        }
        return {
            ...product,
            unitPrice: Number(product.unitPrice),
            stockStatus: product.currentStock <= product.minimumStock ? 'LOW STOCK' : 'IN STOCK',
        };
    }
    static async createProduct(data, userId) {
        const existingSku = await prisma_js_1.prisma.product.findUnique({ where: { sku: data.sku } });
        if (existingSku) {
            throw new errors_js_1.BadRequestError(`SKU '${data.sku}' already exists`);
        }
        const category = await prisma_js_1.prisma.category.findUnique({ where: { id: data.categoryId } });
        if (!category) {
            throw new errors_js_1.NotFoundError('Category not found');
        }
        const warehouse = await prisma_js_1.prisma.warehouse.findUnique({ where: { id: data.warehouseId } });
        if (!warehouse) {
            throw new errors_js_1.NotFoundError('Warehouse not found');
        }
        const initialStock = data.currentStock || 0;
        const product = await prisma_js_1.prisma.$transaction(async (tx) => {
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
                        movementType: client_1.StockMovementType.IN,
                        reason: 'Initial stock on product creation',
                        createdBy: userId,
                    },
                });
            }
            return created;
        });
        await prisma_js_1.prisma.activityLog.create({
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
            stockStatus: product.currentStock <= product.minimumStock ? 'LOW STOCK' : 'IN STOCK',
        };
    }
    static async updateProduct(id, data, userId) {
        const existing = await prisma_js_1.prisma.product.findUnique({ where: { id } });
        if (!existing) {
            throw new errors_js_1.NotFoundError('Product not found');
        }
        if (data.sku && data.sku !== existing.sku) {
            const skuCheck = await prisma_js_1.prisma.product.findUnique({ where: { sku: data.sku } });
            if (skuCheck) {
                throw new errors_js_1.BadRequestError(`SKU '${data.sku}' is already taken`);
            }
        }
        const updated = await prisma_js_1.prisma.product.update({
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
        await prisma_js_1.prisma.activityLog.create({
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
            stockStatus: updated.currentStock <= updated.minimumStock ? 'LOW STOCK' : 'IN STOCK',
        };
    }
    static async stockIn(productId, quantity, reason, userId) {
        if (quantity <= 0) {
            throw new errors_js_1.BadRequestError('Quantity must be greater than zero');
        }
        const product = await prisma_js_1.prisma.product.findUnique({ where: { id: productId } });
        if (!product) {
            throw new errors_js_1.NotFoundError('Product not found');
        }
        const updatedProduct = await prisma_js_1.prisma.$transaction(async (tx) => {
            const updated = await tx.product.update({
                where: { id: productId },
                data: { currentStock: { increment: quantity } },
            });
            await tx.stockMovement.create({
                data: {
                    productId,
                    quantity,
                    movementType: client_1.StockMovementType.IN,
                    reason,
                    createdBy: userId,
                },
            });
            return updated;
        });
        await prisma_js_1.prisma.activityLog.create({
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
            stockStatus: updatedProduct.currentStock <= updatedProduct.minimumStock ? 'LOW STOCK' : 'IN STOCK',
        };
    }
    static async getCategories() {
        return prisma_js_1.prisma.category.findMany({ orderBy: { name: 'asc' } });
    }
    static async getWarehouses() {
        return prisma_js_1.prisma.warehouse.findMany({ orderBy: { name: 'asc' } });
    }
}
exports.ProductService = ProductService;
