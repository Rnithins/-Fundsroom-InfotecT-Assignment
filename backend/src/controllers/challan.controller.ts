import { Response, NextFunction } from 'express';
import { ChallanService } from '../services/challan.service.js';
import { sendSuccess } from '../utils/response.js';
import { AuthenticatedRequest } from '../types/index.js';
import { ChallanStatus } from '@prisma/client';

export class ChallanController {
  static async getChallans(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { page, limit, search, customerId, status } = req.query;
      const result = await ChallanService.getChallans({
        page: page ? Number(page) : undefined,
        limit: limit ? Number(limit) : undefined,
        search: search as string,
        customerId: customerId as string,
        status: status as ChallanStatus,
      });

      return sendSuccess(res, 'Challans fetched successfully', result.challans, 200, result.pagination);
    } catch (error) {
      next(error);
    }
  }

  static async getChallanById(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const challan = await ChallanService.getChallanById(id);
      return sendSuccess(res, 'Challan details fetched successfully', challan);
    } catch (error) {
      next(error);
    }
  }

  static async createChallan(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const challan = await ChallanService.createChallan(req.body, req.user!.id);
      return sendSuccess(res, 'Sales challan draft created successfully', challan, 201);
    } catch (error) {
      next(error);
    }
  }

  static async updateChallan(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const challan = await ChallanService.updateChallan(id, req.body, req.user!.id);
      return sendSuccess(res, 'Sales challan updated successfully', challan);
    } catch (error) {
      next(error);
    }
  }

  static async confirmChallan(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const result = await ChallanService.confirmChallan(id, req.user!.id);
      return sendSuccess(res, 'Sales challan confirmed and stock updated successfully', result);
    } catch (error) {
      next(error);
    }
  }

  static async cancelChallan(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const challan = await ChallanService.cancelChallan(id, req.user!.id);
      return sendSuccess(res, 'Sales challan cancelled successfully', challan);
    } catch (error) {
      next(error);
    }
  }

  static async printChallan(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const challan = await ChallanService.getChallanById(id);
      return sendSuccess(res, 'Challan print document payload generated', challan);
    } catch (error) {
      next(error);
    }
  }
}
