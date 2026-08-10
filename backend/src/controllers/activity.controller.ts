import { Response, NextFunction } from 'express';
import { ActivityService } from '../services/activity.service.js';
import { sendSuccess } from '../utils/response.js';
import { AuthenticatedRequest } from '../types/index.js';

export class ActivityController {
  static async getActivityLogs(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const limit = req.query.limit ? Number(req.query.limit) : 50;
      const logs = await ActivityService.getActivityLogs(limit);
      return sendSuccess(res, 'Activity logs fetched successfully', logs);
    } catch (error) {
      next(error);
    }
  }
}
