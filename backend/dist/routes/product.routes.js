"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const product_controller_js_1 = require("../controllers/product.controller.js");
const auth_middleware_js_1 = require("../middleware/auth.middleware.js");
const role_middleware_js_1 = require("../middleware/role.middleware.js");
const validate_middleware_js_1 = require("../middleware/validate.middleware.js");
const product_validator_js_1 = require("../validators/product.validator.js");
const client_1 = require("@prisma/client");
const router = (0, express_1.Router)();
router.use(auth_middleware_js_1.authenticate);
// View products & categories: ADMIN, SALES, WAREHOUSE
router.get('/categories', (0, role_middleware_js_1.authorize)(client_1.Role.ADMIN, client_1.Role.SALES, client_1.Role.WAREHOUSE), product_controller_js_1.ProductController.getCategories);
router.get('/warehouses', (0, role_middleware_js_1.authorize)(client_1.Role.ADMIN, client_1.Role.SALES, client_1.Role.WAREHOUSE), product_controller_js_1.ProductController.getWarehouses);
router.get('/', (0, role_middleware_js_1.authorize)(client_1.Role.ADMIN, client_1.Role.SALES, client_1.Role.WAREHOUSE), product_controller_js_1.ProductController.getProducts);
router.get('/:id', (0, role_middleware_js_1.authorize)(client_1.Role.ADMIN, client_1.Role.SALES, client_1.Role.WAREHOUSE), product_controller_js_1.ProductController.getProductById);
router.get('/:id/stock-movements', (0, role_middleware_js_1.authorize)(client_1.Role.ADMIN, client_1.Role.SALES, client_1.Role.WAREHOUSE), product_controller_js_1.ProductController.getProductStockMovements);
// Manage products: ADMIN only
router.post('/', (0, role_middleware_js_1.authorize)(client_1.Role.ADMIN), (0, validate_middleware_js_1.validateRequest)(product_validator_js_1.createProductSchema), product_controller_js_1.ProductController.createProduct);
router.put('/:id', (0, role_middleware_js_1.authorize)(client_1.Role.ADMIN), (0, validate_middleware_js_1.validateRequest)(product_validator_js_1.updateProductSchema), product_controller_js_1.ProductController.updateProduct);
// Stock-IN: ADMIN, WAREHOUSE
router.post('/:id/stock-in', (0, role_middleware_js_1.authorize)(client_1.Role.ADMIN, client_1.Role.WAREHOUSE), (0, validate_middleware_js_1.validateRequest)(product_validator_js_1.stockInSchema), product_controller_js_1.ProductController.stockIn);
exports.default = router;
