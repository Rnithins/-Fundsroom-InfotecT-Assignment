import { prisma } from '../config/prisma.js';

export class ActivityService {
  static async getActivityLogs(limit = 50) {
    return prisma.activityLog.findMany({
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
        user: { select: { id: true, name: true, email: true, role: true } },
      },
    });
  }
}
