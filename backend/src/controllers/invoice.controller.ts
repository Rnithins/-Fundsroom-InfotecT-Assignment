import { Response, NextFunction } from 'express';
import { InvoiceService } from '../services/invoice.service.js';
import { sendSuccess } from '../utils/response.js';
import { AuthenticatedRequest } from '../types/index.js';
import { InvoiceStatus } from '@prisma/client';

export class InvoiceController {
  static async getInvoices(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { page, limit, search, customerId, status } = req.query;
      const result = await InvoiceService.getInvoices({
        page: page ? Number(page) : undefined,
        limit: limit ? Number(limit) : undefined,
        search: search as string,
        customerId: customerId as string,
        status: status as InvoiceStatus,
      });

      return sendSuccess(res, 'Invoices fetched successfully', result.invoices, 200, result.pagination);
    } catch (error) {
      next(error);
    }
  }

  static async getInvoiceById(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const invoice = await InvoiceService.getInvoiceById(id);
      return sendSuccess(res, 'Invoice details fetched successfully', invoice);
    } catch (error) {
      next(error);
    }
  }

  static async updateInvoiceStatus(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const { status } = req.body;
      const invoice = await InvoiceService.updateInvoiceStatus(id, status, req.user!.id);
      return sendSuccess(res, 'Invoice status updated successfully', invoice);
    } catch (error) {
      next(error);
    }
  }

  static async printInvoice(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const invoice = await InvoiceService.getInvoiceById(id);
      return sendSuccess(res, 'Invoice print document payload generated', invoice);
    } catch (error) {
      next(error);
    }
  }
}
