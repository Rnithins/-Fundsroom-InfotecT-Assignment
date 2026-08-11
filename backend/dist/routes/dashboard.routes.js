"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const dashboard_controller_js_1 = require("../controllers/dashboard.controller.js");
const auth_middleware_js_1 = require("../middleware/auth.middleware.js");
const router = (0, express_1.Router)();
router.use(auth_middleware_js_1.authenticate);
router.get('/', dashboard_controller_js_1.DashboardController.getDashboardMetrics);
exports.default = router;
