import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { prisma } from '../config/prisma.js';
import { config } from '../config/index.js';
import { UnauthorizedError } from '../utils/errors.js';

export class AuthService {
  static async login(email: string, password: string) {
    let user;
    try {
      user = await prisma.user.findUnique({
        where: { email },
      });
    } catch (dbError: any) {
      console.error('❌ Database login error:', dbError);
      throw new Error(`Database error during authentication: ${dbError.message || 'Unable to connect to database'}`);
    }

    if (!user || !user.isActive) {
      throw new UnauthorizedError('Invalid email or password');
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      throw new UnauthorizedError('Invalid email or password');
    }

    const token = jwt.sign(
      {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
      config.jwtSecret,
      { expiresIn: config.jwtExpiresIn as any }
    );

    // Log Activity (non-blocking)
    try {
      await prisma.activityLog.create({
        data: {
          userId: user.id,
          action: 'LOGIN',
          entity: 'USER',
          entityId: user.id,
          description: `User ${user.name} logged in successfully`,
        },
      });
    } catch (logErr) {
      console.warn('⚠️ Non-fatal: Failed to record login activity log:', logErr);
    }

    return {
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    };
  }

  static async me(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isActive: true,
        createdAt: true,
      },
    });

    if (!user) {
      throw new UnauthorizedError('User not found');
    }

    return user;
  }
}
