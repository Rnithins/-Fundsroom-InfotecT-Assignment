"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChallanController = void 0;
const challan_service_js_1 = require("../services/challan.service.js");
const response_js_1 = require("../utils/response.js");
class ChallanController {
    static async getChallans(req, res, next) {
        try {
            const { page, limit, search, customerId, status } = req.query;
            const result = await challan_service_js_1.ChallanService.getChallans({
                page: page ? Number(page) : undefined,
                limit: limit ? Number(limit) : undefined,
                search: search,
                customerId: customerId,
                status: status,
            });
            return (0, response_js_1.sendSuccess)(res, 'Challans fetched successfully', result.challans, 200, result.pagination);
        }
        catch (error) {
            next(error);
        }
    }
    static async getChallanById(req, res, next) {
        try {
            const { id } = req.params;
            const challan = await challan_service_js_1.ChallanService.getChallanById(id);
            return (0, response_js_1.sendSuccess)(res, 'Challan details fetched successfully', challan);
        }
        catch (error) {
            next(error);
        }
    }
    static async createChallan(req, res, next) {
        try {
            const challan = await challan_service_js_1.ChallanService.createChallan(req.body, req.user.id);
            return (0, response_js_1.sendSuccess)(res, 'Sales challan draft created successfully', challan, 201);
        }
        catch (error) {
            next(error);
        }
    }
    static async updateChallan(req, res, next) {
        try {
            const { id } = req.params;
            const challan = await challan_service_js_1.ChallanService.updateChallan(id, req.body, req.user.id);
            return (0, response_js_1.sendSuccess)(res, 'Sales challan updated successfully', challan);
        }
        catch (error) {
            next(error);
        }
    }
    static async confirmChallan(req, res, next) {
        try {
            const { id } = req.params;
            const result = await challan_service_js_1.ChallanService.confirmChallan(id, req.user.id);
            return (0, response_js_1.sendSuccess)(res, 'Sales challan confirmed and stock updated successfully', result);
        }
        catch (error) {
            next(error);
        }
    }
    static async cancelChallan(req, res, next) {
        try {
            const { id } = req.params;
            const challan = await challan_service_js_1.ChallanService.cancelChallan(id, req.user.id);
            return (0, response_js_1.sendSuccess)(res, 'Sales challan cancelled successfully', challan);
        }
        catch (error) {
            next(error);
        }
    }
    static async printChallan(req, res, next) {
        try {
            const { id } = req.params;
            const challan = await challan_service_js_1.ChallanService.getChallanById(id);
            return (0, response_js_1.sendSuccess)(res, 'Challan print document payload generated', challan);
        }
        catch (error) {
            next(error);
        }
    }
}
exports.ChallanController = ChallanController;
