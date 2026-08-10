import { Response, NextFunction } from 'express';
import { ProductService } from '../services/product.service.js';
import { InventoryService } from '../services/inventory.service.js';
import { sendSuccess } from '../utils/response.js';
import { AuthenticatedRequest } from '../types/index.js';

export class ProductController {
  static async getProducts(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { page, limit, search, categoryId, warehouseId, lowStockOnly } = req.query;
      const result = await ProductService.getProducts({
        page: page ? Number(page) : undefined,
        limit: limit ? Number(limit) : undefined,
        search: search as string,
        categoryId: categoryId as string,
        warehouseId: warehouseId as string,
        lowStockOnly: lowStockOnly === 'true',
      });

      return sendSuccess(res, 'Products fetched successfully', result.products, 200, result.pagination);
    } catch (error) {
      next(error);
    }
  }

  static async getProductById(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const product = await ProductService.getProductById(id);
      return sendSuccess(res, 'Product details fetched successfully', product);
    } catch (error) {
      next(error);
    }
  }

  static async createProduct(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const product = await ProductService.createProduct(req.body, req.user!.id);
      return sendSuccess(res, 'Product created successfully', product, 201);
    } catch (error) {
      next(error);
    }
  }

  static async updateProduct(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const product = await ProductService.updateProduct(id, req.body, req.user!.id);
      return sendSuccess(res, 'Product updated successfully', product);
    } catch (error) {
      next(error);
    }
  }

  static async stockIn(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const { quantity, reason } = req.body;
      const product = await ProductService.stockIn(id, quantity, reason, req.user!.id);
      return sendSuccess(res, 'Stock added successfully', product);
    } catch (error) {
      next(error);
    }
  }

  static async getProductStockMovements(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const { page, limit } = req.query;
      const result = await InventoryService.getStockMovements({
        productId: id,
        page: page ? Number(page) : undefined,
        limit: limit ? Number(limit) : undefined,
      });

      return sendSuccess(res, 'Product stock movements fetched successfully', result.movements, 200, result.pagination);
    } catch (error) {
      next(error);
    }
  }

  static async getCategories(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const categories = await ProductService.getCategories();
      return sendSuccess(res, 'Categories fetched successfully', categories);
    } catch (error) {
      next(error);
    }
  }

  static async getWarehouses(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const warehouses = await ProductService.getWarehouses();
      return sendSuccess(res, 'Warehouses fetched successfully', warehouses);
    } catch (error) {
      next(error);
    }
  }
}
