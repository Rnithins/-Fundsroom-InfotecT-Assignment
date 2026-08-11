"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InvoiceController = void 0;
const invoice_service_js_1 = require("../services/invoice.service.js");
const response_js_1 = require("../utils/response.js");
class InvoiceController {
    static async getInvoices(req, res, next) {
        try {
            const { page, limit, search, customerId, status } = req.query;
            const result = await invoice_service_js_1.InvoiceService.getInvoices({
                page: page ? Number(page) : undefined,
                limit: limit ? Number(limit) : undefined,
                search: search,
                customerId: customerId,
                status: status,
            });
            return (0, response_js_1.sendSuccess)(res, 'Invoices fetched successfully', result.invoices, 200, result.pagination);
        }
        catch (error) {
            next(error);
        }
    }
    static async getInvoiceById(req, res, next) {
        try {
            const { id } = req.params;
            const invoice = await invoice_service_js_1.InvoiceService.getInvoiceById(id);
            return (0, response_js_1.sendSuccess)(res, 'Invoice details fetched successfully', invoice);
        }
        catch (error) {
            next(error);
        }
    }
    static async updateInvoiceStatus(req, res, next) {
        try {
            const { id } = req.params;
            const { status } = req.body;
            const invoice = await invoice_service_js_1.InvoiceService.updateInvoiceStatus(id, status, req.user.id);
            return (0, response_js_1.sendSuccess)(res, 'Invoice status updated successfully', invoice);
        }
        catch (error) {
            next(error);
        }
    }
    static async printInvoice(req, res, next) {
        try {
            const { id } = req.params;
            const invoice = await invoice_service_js_1.InvoiceService.getInvoiceById(id);
            return (0, response_js_1.sendSuccess)(res, 'Invoice print document payload generated', invoice);
        }
        catch (error) {
            next(error);
        }
    }
}
exports.InvoiceController = InvoiceController;
