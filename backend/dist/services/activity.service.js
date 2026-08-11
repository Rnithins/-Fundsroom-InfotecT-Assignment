"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ActivityService = void 0;
const prisma_js_1 = require("../config/prisma.js");
class ActivityService {
    static async getActivityLogs(limit = 50) {
        return prisma_js_1.prisma.activityLog.findMany({
            take: limit,
            orderBy: { createdAt: 'desc' },
            include: {
                user: { select: { id: true, name: true, email: true, role: true } },
            },
        });
    }
}
exports.ActivityService = ActivityService;
