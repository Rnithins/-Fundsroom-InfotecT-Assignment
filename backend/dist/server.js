"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const app_js_1 = __importDefault(require("./app.js"));
const index_js_1 = require("./config/index.js");
const prisma_js_1 = require("./config/prisma.js");
async function startServer() {
    try {
        if (!process.env.DATABASE_URL) {
            console.error('❌ CRITICAL ERROR: DATABASE_URL environment variable is missing!');
        }
        else if (process.env.NODE_ENV === 'production' && process.env.DATABASE_URL.includes('localhost')) {
            console.error('⚠️ WARNING: NODE_ENV is production but DATABASE_URL is set to localhost!');
            console.error('Please set DATABASE_URL in your Render dashboard environment variables to your Render PostgreSQL connection string.');
        }
        await prisma_js_1.prisma.$connect();
        console.log('✅ PostgreSQL connected via Prisma ORM');
        app_js_1.default.listen(index_js_1.config.port, '0.0.0.0', () => {
            console.log(`🚀 Mini ERP Backend running on port ${index_js_1.config.port}`);
            console.log(`📚 Swagger API Docs available at /api/docs`);
        });
    }
    catch (error) {
        console.error('❌ Failed to start server:', error);
        await prisma_js_1.prisma.$disconnect();
        process.exit(1);
    }
}
startServer();
