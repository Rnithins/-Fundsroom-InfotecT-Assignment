import app from './app.js';
import { config } from './config/index.js';
import { prisma } from './config/prisma.js';

async function startServer() {
  try {
    await prisma.$connect();
    console.log('✅ PostgreSQL connected via Prisma ORM');

    app.listen(config.port, () => {
      console.log(`🚀 Mini ERP Backend running on http://localhost:${config.port}`);
      console.log(`📚 Swagger API Docs available at http://localhost:${config.port}/api/docs`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    await prisma.$disconnect();
    process.exit(1);
  }
}

startServer();
