"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ActivityController = void 0;
const activity_service_js_1 = require("../services/activity.service.js");
const response_js_1 = require("../utils/response.js");
class ActivityController {
    static async getActivityLogs(req, res, next) {
        try {
            const limit = req.query.limit ? Number(req.query.limit) : 50;
            const logs = await activity_service_js_1.ActivityService.getActivityLogs(limit);
            return (0, response_js_1.sendSuccess)(res, 'Activity logs fetched successfully', logs);
        }
        catch (error) {
            next(error);
        }
    }
}
exports.ActivityController = ActivityController;
