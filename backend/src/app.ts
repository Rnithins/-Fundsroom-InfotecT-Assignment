import express, { Application } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import { config } from './config/index.js';
import { prisma } from './config/prisma.js';
import { errorHandler } from './middleware/error.middleware.js';

import authRoutes from './routes/auth.routes.js';
import userRoutes from './routes/user.routes.js';
import customerRoutes from './routes/customer.routes.js';
import productRoutes from './routes/product.routes.js';
import inventoryRoutes from './routes/inventory.routes.js';
import challanRoutes from './routes/challan.routes.js';
import invoiceRoutes from './routes/invoice.routes.js';
import dashboardRoutes from './routes/dashboard.routes.js';
import reportRoutes from './routes/report.routes.js';
import activityRoutes from './routes/activity.routes.js';
import swaggerRouter from './swagger.js';

const app: Application = express();

// Trust proxy for rate limiting behind Render/Cloudflare proxies
app.set('trust proxy', 1);

// Security & Utility Middlewares
app.use(helmet({ contentSecurityPolicy: false }));
app.use(cors({ origin: true, credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

if (config.nodeEnv !== 'test') {
  app.use(morgan('dev'));
}

// Rate Limiter for auth
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 50,
  message: { success: false, message: 'Too many login attempts, please try again later', error: { code: 'RATE_LIMIT_EXCEEDED' } },
});

// Swagger API Documentation
app.use('/api/docs', swaggerRouter);

// API Routes
app.use('/api/auth', authLimiter, authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/customers', customerRoutes);
app.use('/api/products', productRoutes);
app.use('/api/inventory', inventoryRoutes);
app.use('/api/challans', challanRoutes);
app.use('/api/invoices', invoiceRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/activity-logs', activityRoutes);

import path from 'path';
import fs from 'fs';

// Serve React Frontend Static Files (if available)
const publicDir = path.join(process.cwd(), 'public');
const fallbackFrontend = path.join(process.cwd(), '../frontend/dist');

const staticDir = fs.existsSync(publicDir)
  ? publicDir
  : fs.existsSync(fallbackFrontend)
  ? fallbackFrontend
  : null;

if (staticDir) {
  app.use(express.static(staticDir));
  app.get('/health', (req, res) => {
    res.status(200).json({ status: 'OK', environment: config.nodeEnv, timestamp: new Date().toISOString() });
  });
  app.get('/api/test-db', async (req, res) => {
    try {
      const userCount = await prisma.user.count();
      const users = await prisma.user.findMany({ select: { id: true, email: true, role: true } });
      res.status(200).json({ success: true, userCount, users, dbUrlConfigured: !!process.env.DATABASE_URL });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message, name: err.name, code: err.code, stack: err.stack });
    }
  });
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api') || req.path === '/health') return next();
    res.sendFile(path.join(staticDir, 'index.html'));
  });
} else {
  // Health check & Root routes fallback
  app.get(['/', '/health', '/api', '/api/health'], (req, res) => {
    res.status(200).json({
      success: true,
      message: 'Mini ERP + CRM Backend API is running',
      environment: config.nodeEnv,
      swaggerDocs: '/api/docs',
      timestamp: new Date().toISOString(),
    });
  });
}



// Centralized Error Handler
app.use(errorHandler);

export default app;
