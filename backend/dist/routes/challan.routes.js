"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const challan_controller_js_1 = require("../controllers/challan.controller.js");
const auth_middleware_js_1 = require("../middleware/auth.middleware.js");
const role_middleware_js_1 = require("../middleware/role.middleware.js");
const validate_middleware_js_1 = require("../middleware/validate.middleware.js");
const challan_validator_js_1 = require("../validators/challan.validator.js");
const client_1 = require("@prisma/client");
const router = (0, express_1.Router)();
router.use(auth_middleware_js_1.authenticate);
// View challans: ADMIN, SALES, WAREHOUSE, ACCOUNTS
router.get('/', (0, role_middleware_js_1.authorize)(client_1.Role.ADMIN, client_1.Role.SALES, client_1.Role.WAREHOUSE, client_1.Role.ACCOUNTS), challan_controller_js_1.ChallanController.getChallans);
router.get('/:id', (0, role_middleware_js_1.authorize)(client_1.Role.ADMIN, client_1.Role.SALES, client_1.Role.WAREHOUSE, client_1.Role.ACCOUNTS), challan_controller_js_1.ChallanController.getChallanById);
router.get('/:id/print', (0, role_middleware_js_1.authorize)(client_1.Role.ADMIN, client_1.Role.SALES, client_1.Role.WAREHOUSE, client_1.Role.ACCOUNTS), challan_controller_js_1.ChallanController.printChallan);
// Create / edit draft challans: ADMIN, SALES
router.post('/', (0, role_middleware_js_1.authorize)(client_1.Role.ADMIN, client_1.Role.SALES), (0, validate_middleware_js_1.validateRequest)(challan_validator_js_1.createChallanSchema), challan_controller_js_1.ChallanController.createChallan);
router.put('/:id', (0, role_middleware_js_1.authorize)(client_1.Role.ADMIN, client_1.Role.SALES), (0, validate_middleware_js_1.validateRequest)(challan_validator_js_1.updateChallanSchema), challan_controller_js_1.ChallanController.updateChallan);
// Confirm challan: ADMIN, SALES
router.post('/:id/confirm', (0, role_middleware_js_1.authorize)(client_1.Role.ADMIN, client_1.Role.SALES), challan_controller_js_1.ChallanController.confirmChallan);
// Cancel challan: ADMIN only
router.post('/:id/cancel', (0, role_middleware_js_1.authorize)(client_1.Role.ADMIN), challan_controller_js_1.ChallanController.cancelChallan);
exports.default = router;
