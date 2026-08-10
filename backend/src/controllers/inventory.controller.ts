import { Response, NextFunction } from 'express';
import { InventoryService } from '../services/inventory.service.js';
import { sendSuccess } from '../utils/response.js';
import { AuthenticatedRequest } from '../types/index.js';
import { StockMovementType } from '@prisma/client';

export class InventoryController {
  static async getStockMovements(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { page, limit, productId, movementType } = req.query;
      const result = await InventoryService.getStockMovements({
        page: page ? Number(page) : undefined,
        limit: limit ? Number(limit) : undefined,
        productId: productId as string,
        movementType: movementType as StockMovementType,
      });

      return sendSuccess(res, 'Stock movements fetched successfully', result.movements, 200, result.pagination);
    } catch (error) {
      next(error);
    }
  }
}
