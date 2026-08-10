import { Response, NextFunction } from 'express';
import { ReportService } from '../services/report.service.js';
import { sendSuccess } from '../utils/response.js';
import { AuthenticatedRequest } from '../types/index.js';

export class ReportController {
  static async getReports(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { startDate, endDate } = req.query;
      const data = await ReportService.getReports({
        startDate: startDate as string,
        endDate: endDate as string,
      });

      return sendSuccess(res, 'Reports generated successfully', data);
    } catch (error) {
      next(error);
    }
  }
}
