"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const morgan_1 = __importDefault(require("morgan"));
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const index_js_1 = require("./config/index.js");
const prisma_js_1 = require("./config/prisma.js");
const error_middleware_js_1 = require("./middleware/error.middleware.js");
const auth_routes_js_1 = __importDefault(require("./routes/auth.routes.js"));
const user_routes_js_1 = __importDefault(require("./routes/user.routes.js"));
const customer_routes_js_1 = __importDefault(require("./routes/customer.routes.js"));
const product_routes_js_1 = __importDefault(require("./routes/product.routes.js"));
const inventory_routes_js_1 = __importDefault(require("./routes/inventory.routes.js"));
const challan_routes_js_1 = __importDefault(require("./routes/challan.routes.js"));
const invoice_routes_js_1 = __importDefault(require("./routes/invoice.routes.js"));
const dashboard_routes_js_1 = __importDefault(require("./routes/dashboard.routes.js"));
const report_routes_js_1 = __importDefault(require("./routes/report.routes.js"));
const activity_routes_js_1 = __importDefault(require("./routes/activity.routes.js"));
const swagger_js_1 = __importDefault(require("./swagger.js"));
const app = (0, express_1.default)();
// Trust proxy for rate limiting behind Render/Cloudflare proxies
app.set('trust proxy', 1);
// Security & Utility Middlewares
app.use((0, helmet_1.default)({ contentSecurityPolicy: false }));
app.use((0, cors_1.default)({ origin: true, credentials: true }));
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
if (index_js_1.config.nodeEnv !== 'test') {
    app.use((0, morgan_1.default)('dev'));
}
// Rate Limiter for auth
const authLimiter = (0, express_rate_limit_1.default)({
    windowMs: 15 * 60 * 1000,
    max: 50,
    message: { success: false, message: 'Too many login attempts, please try again later', error: { code: 'RATE_LIMIT_EXCEEDED' } },
});
// Swagger API Documentation
app.use('/api/docs', swagger_js_1.default);
// API Routes
app.use('/api/auth', authLimiter, auth_routes_js_1.default);
app.use('/api/users', user_routes_js_1.default);
app.use('/api/customers', customer_routes_js_1.default);
app.use('/api/products', product_routes_js_1.default);
app.use('/api/inventory', inventory_routes_js_1.default);
app.use('/api/challans', challan_routes_js_1.default);
app.use('/api/invoices', invoice_routes_js_1.default);
app.use('/api/dashboard', dashboard_routes_js_1.default);
app.use('/api/reports', report_routes_js_1.default);
app.use('/api/activity-logs', activity_routes_js_1.default);
app.get('/api/test-db', async (req, res) => {
    try {
        const userCount = await prisma_js_1.prisma.user.count();
        const users = await prisma_js_1.prisma.user.findMany({ select: { id: true, email: true, role: true } });
        res.status(200).json({ success: true, userCount, users, dbUrlConfigured: !!process.env.DATABASE_URL });
    }
    catch (err) {
        res.status(500).json({ success: false, message: err.message, name: err.name, code: err.code, stack: err.stack });
    }
});
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
// Serve React Frontend Static Files (if available)
const publicDir = path_1.default.join(process.cwd(), 'public');
const backendPublicDir = path_1.default.join(process.cwd(), 'backend/public');
const fallbackFrontend = path_1.default.join(process.cwd(), '../frontend/dist');
const staticDir = fs_1.default.existsSync(publicDir)
    ? publicDir
    : fs_1.default.existsSync(backendPublicDir)
        ? backendPublicDir
        : fs_1.default.existsSync(fallbackFrontend)
            ? fallbackFrontend
            : null;
if (staticDir) {
    app.use(express_1.default.static(staticDir));
    app.get('/health', (req, res) => {
        res.status(200).json({ status: 'OK', environment: index_js_1.config.nodeEnv, timestamp: new Date().toISOString() });
    });
    app.get('/api/test-db', async (req, res) => {
        try {
            const userCount = await prisma_js_1.prisma.user.count();
            const users = await prisma_js_1.prisma.user.findMany({ select: { id: true, email: true, role: true } });
            res.status(200).json({ success: true, userCount, users, dbUrlConfigured: !!process.env.DATABASE_URL });
        }
        catch (err) {
            res.status(500).json({ success: false, message: err.message, name: err.name, code: err.code, stack: err.stack });
        }
    });
    app.get('*', (req, res, next) => {
        if (req.path.startsWith('/api') || req.path === '/health')
            return next();
        res.sendFile(path_1.default.join(staticDir, 'index.html'));
    });
}
else {
    // Health check & Root routes fallback
    app.get(['/', '/health', '/api', '/api/health'], (req, res) => {
        res.status(200).json({
            success: true,
            message: 'Mini ERP + CRM Backend API is running',
            environment: index_js_1.config.nodeEnv,
            swaggerDocs: '/api/docs',
            timestamp: new Date().toISOString(),
        });
    });
}
// Centralized Error Handler
app.use(error_middleware_js_1.errorHandler);
exports.default = app;
