"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProductController = void 0;
const product_service_js_1 = require("../services/product.service.js");
const inventory_service_js_1 = require("../services/inventory.service.js");
const response_js_1 = require("../utils/response.js");
class ProductController {
    static async getProducts(req, res, next) {
        try {
            const { page, limit, search, categoryId, warehouseId, lowStockOnly } = req.query;
            const result = await product_service_js_1.ProductService.getProducts({
                page: page ? Number(page) : undefined,
                limit: limit ? Number(limit) : undefined,
                search: search,
                categoryId: categoryId,
                warehouseId: warehouseId,
                lowStockOnly: lowStockOnly === 'true',
            });
            return (0, response_js_1.sendSuccess)(res, 'Products fetched successfully', result.products, 200, result.pagination);
        }
        catch (error) {
            next(error);
        }
    }
    static async getProductById(req, res, next) {
        try {
            const { id } = req.params;
            const product = await product_service_js_1.ProductService.getProductById(id);
            return (0, response_js_1.sendSuccess)(res, 'Product details fetched successfully', product);
        }
        catch (error) {
            next(error);
        }
    }
    static async createProduct(req, res, next) {
        try {
            const product = await product_service_js_1.ProductService.createProduct(req.body, req.user.id);
            return (0, response_js_1.sendSuccess)(res, 'Product created successfully', product, 201);
        }
        catch (error) {
            next(error);
        }
    }
    static async updateProduct(req, res, next) {
        try {
            const { id } = req.params;
            const product = await product_service_js_1.ProductService.updateProduct(id, req.body, req.user.id);
            return (0, response_js_1.sendSuccess)(res, 'Product updated successfully', product);
        }
        catch (error) {
            next(error);
        }
    }
    static async stockIn(req, res, next) {
        try {
            const { id } = req.params;
            const { quantity, reason } = req.body;
            const product = await product_service_js_1.ProductService.stockIn(id, quantity, reason, req.user.id);
            return (0, response_js_1.sendSuccess)(res, 'Stock added successfully', product);
        }
        catch (error) {
            next(error);
        }
    }
    static async getProductStockMovements(req, res, next) {
        try {
            const { id } = req.params;
            const { page, limit } = req.query;
            const result = await inventory_service_js_1.InventoryService.getStockMovements({
                productId: id,
                page: page ? Number(page) : undefined,
                limit: limit ? Number(limit) : undefined,
            });
            return (0, response_js_1.sendSuccess)(res, 'Product stock movements fetched successfully', result.movements, 200, result.pagination);
        }
        catch (error) {
            next(error);
        }
    }
    static async getCategories(req, res, next) {
        try {
            const categories = await product_service_js_1.ProductService.getCategories();
            return (0, response_js_1.sendSuccess)(res, 'Categories fetched successfully', categories);
        }
        catch (error) {
            next(error);
        }
    }
    static async getWarehouses(req, res, next) {
        try {
            const warehouses = await product_service_js_1.ProductService.getWarehouses();
            return (0, response_js_1.sendSuccess)(res, 'Warehouses fetched successfully', warehouses);
        }
        catch (error) {
            next(error);
        }
    }
}
exports.ProductController = ProductController;
