"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CustomerController = void 0;
const customer_service_js_1 = require("../services/customer.service.js");
const response_js_1 = require("../utils/response.js");
class CustomerController {
    static async getCustomers(req, res, next) {
        try {
            const { page, limit, search, status, customerType } = req.query;
            const result = await customer_service_js_1.CustomerService.getCustomers({
                page: page ? Number(page) : undefined,
                limit: limit ? Number(limit) : undefined,
                search: search,
                status: status,
                customerType: customerType,
            });
            return (0, response_js_1.sendSuccess)(res, 'Customers fetched successfully', result.customers, 200, result.pagination);
        }
        catch (error) {
            next(error);
        }
    }
    static async getCustomerById(req, res, next) {
        try {
            const { id } = req.params;
            const customer = await customer_service_js_1.CustomerService.getCustomerById(id);
            return (0, response_js_1.sendSuccess)(res, 'Customer details fetched successfully', customer);
        }
        catch (error) {
            next(error);
        }
    }
    static async createCustomer(req, res, next) {
        try {
            const customer = await customer_service_js_1.CustomerService.createCustomer(req.body, req.user.id);
            return (0, response_js_1.sendSuccess)(res, 'Customer created successfully', customer, 201);
        }
        catch (error) {
            next(error);
        }
    }
    static async updateCustomer(req, res, next) {
        try {
            const { id } = req.params;
            const customer = await customer_service_js_1.CustomerService.updateCustomer(id, req.body, req.user.id);
            return (0, response_js_1.sendSuccess)(res, 'Customer updated successfully', customer);
        }
        catch (error) {
            next(error);
        }
    }
    static async deleteCustomer(req, res, next) {
        try {
            const { id } = req.params;
            const result = await customer_service_js_1.CustomerService.deleteCustomer(id, req.user.id);
            return (0, response_js_1.sendSuccess)(res, result.message);
        }
        catch (error) {
            next(error);
        }
    }
    static async addFollowUp(req, res, next) {
        try {
            const { id } = req.params;
            const { note, followUpDate } = req.body;
            const followUp = await customer_service_js_1.CustomerService.addFollowUp(id, note, followUpDate, req.user.id);
            return (0, response_js_1.sendSuccess)(res, 'Follow-up note added successfully', followUp, 201);
        }
        catch (error) {
            next(error);
        }
    }
    static async getFollowUps(req, res, next) {
        try {
            const { id } = req.params;
            const followUps = await customer_service_js_1.CustomerService.getFollowUps(id);
            return (0, response_js_1.sendSuccess)(res, 'Customer follow-up history fetched successfully', followUps);
        }
        catch (error) {
            next(error);
        }
    }
}
exports.CustomerController = CustomerController;
