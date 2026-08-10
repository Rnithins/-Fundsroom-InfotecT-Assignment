import { Response, NextFunction } from 'express';
import { DashboardService } from '../services/dashboard.service.js';
import { sendSuccess } from '../utils/response.js';
import { AuthenticatedRequest } from '../types/index.js';

export class DashboardController {
  static async getDashboardMetrics(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const data = await DashboardService.getDashboardMetrics();
      return sendSuccess(res, 'Dashboard metrics fetched successfully', data);
    } catch (error) {
      next(error);
    }
  }
}
