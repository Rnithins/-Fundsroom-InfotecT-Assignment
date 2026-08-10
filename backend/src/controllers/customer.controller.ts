import { Response, NextFunction } from 'express';
import { CustomerService } from '../services/customer.service.js';
import { sendSuccess } from '../utils/response.js';
import { AuthenticatedRequest } from '../types/index.js';
import { CustomerStatus, CustomerType } from '@prisma/client';

export class CustomerController {
  static async getCustomers(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { page, limit, search, status, customerType } = req.query;
      const result = await CustomerService.getCustomers({
        page: page ? Number(page) : undefined,
        limit: limit ? Number(limit) : undefined,
        search: search as string,
        status: status as CustomerStatus,
        customerType: customerType as CustomerType,
      });

      return sendSuccess(res, 'Customers fetched successfully', result.customers, 200, result.pagination);
    } catch (error) {
      next(error);
    }
  }

  static async getCustomerById(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const customer = await CustomerService.getCustomerById(id);
      return sendSuccess(res, 'Customer details fetched successfully', customer);
    } catch (error) {
      next(error);
    }
  }

  static async createCustomer(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const customer = await CustomerService.createCustomer(req.body, req.user!.id);
      return sendSuccess(res, 'Customer created successfully', customer, 201);
    } catch (error) {
      next(error);
    }
  }

  static async updateCustomer(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const customer = await CustomerService.updateCustomer(id, req.body, req.user!.id);
      return sendSuccess(res, 'Customer updated successfully', customer);
    } catch (error) {
      next(error);
    }
  }

  static async deleteCustomer(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const result = await CustomerService.deleteCustomer(id, req.user!.id);
      return sendSuccess(res, result.message);
    } catch (error) {
      next(error);
    }
  }

  static async addFollowUp(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const { note, followUpDate } = req.body;
      const followUp = await CustomerService.addFollowUp(id, note, followUpDate, req.user!.id);
      return sendSuccess(res, 'Follow-up note added successfully', followUp, 201);
    } catch (error) {
      next(error);
    }
  }

  static async getFollowUps(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const followUps = await CustomerService.getFollowUps(id);
      return sendSuccess(res, 'Customer follow-up history fetched successfully', followUps);
    } catch (error) {
      next(error);
    }
  }
}
