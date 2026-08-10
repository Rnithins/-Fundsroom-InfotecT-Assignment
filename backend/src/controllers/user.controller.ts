import { Response, NextFunction } from 'express';
import { UserService } from '../services/user.service.js';
import { sendSuccess } from '../utils/response.js';
import { AuthenticatedRequest } from '../types/index.js';

export class UserController {
  static async getAllUsers(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const users = await UserService.getAllUsers();
      return sendSuccess(res, 'Users fetched successfully', users);
    } catch (error) {
      next(error);
    }
  }

  static async createUser(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const user = await UserService.createUser(req.body, req.user!.id);
      return sendSuccess(res, 'User created successfully', user, 201);
    } catch (error) {
      next(error);
    }
  }

  static async updateUser(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const user = await UserService.updateUser(id, req.body, req.user!.id);
      return sendSuccess(res, 'User updated successfully', user);
    } catch (error) {
      next(error);
    }
  }
}
