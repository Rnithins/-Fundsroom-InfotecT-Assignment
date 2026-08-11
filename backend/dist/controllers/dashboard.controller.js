"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DashboardController = void 0;
const dashboard_service_js_1 = require("../services/dashboard.service.js");
const response_js_1 = require("../utils/response.js");
class DashboardController {
    static async getDashboardMetrics(req, res, next) {
        try {
            const data = await dashboard_service_js_1.DashboardService.getDashboardMetrics();
            return (0, response_js_1.sendSuccess)(res, 'Dashboard metrics fetched successfully', data);
        }
        catch (error) {
            next(error);
        }
    }
}
exports.DashboardController = DashboardController;
