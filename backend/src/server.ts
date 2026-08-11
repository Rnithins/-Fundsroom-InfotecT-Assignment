import app from './app.js';
import { config } from './config/index.js';
import { prisma } from './config/prisma.js';

async function startServer() {
  try {
    if (!process.env.DATABASE_URL) {
      console.error('❌ CRITICAL ERROR: DATABASE_URL environment variable is missing!');
    } else if (process.env.NODE_ENV === 'production' && process.env.DATABASE_URL.includes('localhost')) {
      console.error('⚠️ WARNING: NODE_ENV is production but DATABASE_URL is set to localhost!');
      console.error('Please set DATABASE_URL in your Render dashboard environment variables to your Render PostgreSQL connection string.');
    }

    await prisma.$connect();
    console.log('✅ PostgreSQL connected via Prisma ORM');

    app.listen(config.port, '0.0.0.0', () => {
      console.log(`🚀 Mini ERP Backend running on port ${config.port}`);
      console.log(`📚 Swagger API Docs available at /api/docs`);
    });

  } catch (error) {
    console.error('❌ Failed to start server:', error);
    await prisma.$disconnect();
    process.exit(1);
  }
}

startServer();
