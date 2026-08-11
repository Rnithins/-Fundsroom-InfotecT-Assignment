"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const inventory_controller_js_1 = require("../controllers/inventory.controller.js");
const auth_middleware_js_1 = require("../middleware/auth.middleware.js");
const role_middleware_js_1 = require("../middleware/role.middleware.js");
const client_1 = require("@prisma/client");
const router = (0, express_1.Router)();
router.use(auth_middleware_js_1.authenticate);
// View stock movements: ADMIN, WAREHOUSE
router.get('/stock-movements', (0, role_middleware_js_1.authorize)(client_1.Role.ADMIN, client_1.Role.WAREHOUSE), inventory_controller_js_1.InventoryController.getStockMovements);
exports.default = router;
