"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InventoryController = void 0;
const inventory_service_js_1 = require("../services/inventory.service.js");
const response_js_1 = require("../utils/response.js");
class InventoryController {
    static async getStockMovements(req, res, next) {
        try {
            const { page, limit, productId, movementType } = req.query;
            const result = await inventory_service_js_1.InventoryService.getStockMovements({
                page: page ? Number(page) : undefined,
                limit: limit ? Number(limit) : undefined,
                productId: productId,
                movementType: movementType,
            });
            return (0, response_js_1.sendSuccess)(res, 'Stock movements fetched successfully', result.movements, 200, result.pagination);
        }
        catch (error) {
            next(error);
        }
    }
}
exports.InventoryController = InventoryController;
