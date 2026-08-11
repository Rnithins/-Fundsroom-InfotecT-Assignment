"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const invoice_controller_js_1 = require("../controllers/invoice.controller.js");
const auth_middleware_js_1 = require("../middleware/auth.middleware.js");
const role_middleware_js_1 = require("../middleware/role.middleware.js");
const validate_middleware_js_1 = require("../middleware/validate.middleware.js");
const invoice_validator_js_1 = require("../validators/invoice.validator.js");
const client_1 = require("@prisma/client");
const router = (0, express_1.Router)();
router.use(auth_middleware_js_1.authenticate);
// View invoices: ADMIN, ACCOUNTS
router.get('/', (0, role_middleware_js_1.authorize)(client_1.Role.ADMIN, client_1.Role.ACCOUNTS), invoice_controller_js_1.InvoiceController.getInvoices);
router.get('/:id', (0, role_middleware_js_1.authorize)(client_1.Role.ADMIN, client_1.Role.ACCOUNTS), invoice_controller_js_1.InvoiceController.getInvoiceById);
router.get('/:id/print', (0, role_middleware_js_1.authorize)(client_1.Role.ADMIN, client_1.Role.ACCOUNTS), invoice_controller_js_1.InvoiceController.printInvoice);
// Update status: ADMIN, ACCOUNTS
router.put('/:id/status', (0, role_middleware_js_1.authorize)(client_1.Role.ADMIN, client_1.Role.ACCOUNTS), (0, validate_middleware_js_1.validateRequest)(invoice_validator_js_1.updateInvoiceStatusSchema), invoice_controller_js_1.InvoiceController.updateInvoiceStatus);
exports.default = router;
