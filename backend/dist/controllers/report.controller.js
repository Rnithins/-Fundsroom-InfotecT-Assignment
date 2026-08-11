"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReportController = void 0;
const report_service_js_1 = require("../services/report.service.js");
const response_js_1 = require("../utils/response.js");
class ReportController {
    static async getReports(req, res, next) {
        try {
            const { startDate, endDate } = req.query;
            const data = await report_service_js_1.ReportService.getReports({
                startDate: startDate,
                endDate: endDate,
            });
            return (0, response_js_1.sendSuccess)(res, 'Reports generated successfully', data);
        }
        catch (error) {
            next(error);
        }
    }
}
exports.ReportController = ReportController;
