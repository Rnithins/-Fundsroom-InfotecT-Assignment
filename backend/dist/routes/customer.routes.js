"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const customer_controller_js_1 = require("../controllers/customer.controller.js");
const auth_middleware_js_1 = require("../middleware/auth.middleware.js");
const role_middleware_js_1 = require("../middleware/role.middleware.js");
const validate_middleware_js_1 = require("../middleware/validate.middleware.js");
const customer_validator_js_1 = require("../validators/customer.validator.js");
const client_1 = require("@prisma/client");
const router = (0, express_1.Router)();
router.use(auth_middleware_js_1.authenticate);
// View customers: ADMIN, SALES, ACCOUNTS
router.get('/', (0, role_middleware_js_1.authorize)(client_1.Role.ADMIN, client_1.Role.SALES, client_1.Role.ACCOUNTS), customer_controller_js_1.CustomerController.getCustomers);
router.get('/:id', (0, role_middleware_js_1.authorize)(client_1.Role.ADMIN, client_1.Role.SALES, client_1.Role.ACCOUNTS), customer_controller_js_1.CustomerController.getCustomerById);
router.get('/:id/followups', (0, role_middleware_js_1.authorize)(client_1.Role.ADMIN, client_1.Role.SALES, client_1.Role.ACCOUNTS), customer_controller_js_1.CustomerController.getFollowUps);
// Create / edit customers & followups: ADMIN, SALES
router.post('/', (0, role_middleware_js_1.authorize)(client_1.Role.ADMIN, client_1.Role.SALES), (0, validate_middleware_js_1.validateRequest)(customer_validator_js_1.createCustomerSchema), customer_controller_js_1.CustomerController.createCustomer);
router.put('/:id', (0, role_middleware_js_1.authorize)(client_1.Role.ADMIN, client_1.Role.SALES), (0, validate_middleware_js_1.validateRequest)(customer_validator_js_1.updateCustomerSchema), customer_controller_js_1.CustomerController.updateCustomer);
router.post('/:id/followups', (0, role_middleware_js_1.authorize)(client_1.Role.ADMIN, client_1.Role.SALES), (0, validate_middleware_js_1.validateRequest)(customer_validator_js_1.createFollowUpSchema), customer_controller_js_1.CustomerController.addFollowUp);
// Delete customer: ADMIN only
router.delete('/:id', (0, role_middleware_js_1.authorize)(client_1.Role.ADMIN), customer_controller_js_1.CustomerController.deleteCustomer);
exports.default = router;
