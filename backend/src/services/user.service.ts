import bcrypt from 'bcrypt';
import { Role } from '@prisma/client';
import { prisma } from '../config/prisma.js';
import { BadRequestError, NotFoundError } from '../utils/errors.js';

export class UserService {
  static async getAllUsers() {
    return prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  static async createUser(data: { name: string; email: string; password: string; role: Role }, creatorId: string) {
    const existing = await prisma.user.findUnique({ where: { email: data.email } });
    if (existing) {
      throw new BadRequestError('User with this email already exists');
    }

    const passwordHash = await bcrypt.hash(data.password, 10);
    const user = await prisma.user.create({
      data: {
        name: data.name,
        email: data.email,
        passwordHash,
        role: data.role,
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isActive: true,
        createdAt: true,
      },
    });

    await prisma.activityLog.create({
      data: {
        userId: creatorId,
        action: 'USER_CREATED',
        entity: 'USER',
        entityId: user.id,
        description: `Created user account for ${user.email} (${user.role})`,
      },
    });

    return user;
  }

  static async updateUser(
    id: string,
    data: { name?: string; email?: string; password?: string; role?: Role; isActive?: boolean },
    modifierId: string
  ) {
    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) {
      throw new NotFoundError('User not found');
    }

    let passwordHash = user.passwordHash;
    if (data.password) {
      passwordHash = await bcrypt.hash(data.password, 10);
    }

    const updated = await prisma.user.update({
      where: { id },
      data: {
        ...(data.name && { name: data.name }),
        ...(data.email && { email: data.email }),
        ...(data.role && { role: data.role }),
        ...(data.isActive !== undefined && { isActive: data.isActive }),
        passwordHash,
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isActive: true,
        updatedAt: true,
      },
    });

    await prisma.activityLog.create({
      data: {
        userId: modifierId,
        action: 'USER_UPDATED',
        entity: 'USER',
        entityId: updated.id,
        description: `Updated user account ${updated.email}`,
      },
    });

    return updated;
  }
}
