"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserController = void 0;
const user_service_js_1 = require("../services/user.service.js");
const response_js_1 = require("../utils/response.js");
class UserController {
    static async getAllUsers(req, res, next) {
        try {
            const users = await user_service_js_1.UserService.getAllUsers();
            return (0, response_js_1.sendSuccess)(res, 'Users fetched successfully', users);
        }
        catch (error) {
            next(error);
        }
    }
    static async createUser(req, res, next) {
        try {
            const user = await user_service_js_1.UserService.createUser(req.body, req.user.id);
            return (0, response_js_1.sendSuccess)(res, 'User created successfully', user, 201);
        }
        catch (error) {
            next(error);
        }
    }
    static async updateUser(req, res, next) {
        try {
            const { id } = req.params;
            const user = await user_service_js_1.UserService.updateUser(id, req.body, req.user.id);
            return (0, response_js_1.sendSuccess)(res, 'User updated successfully', user);
        }
        catch (error) {
            next(error);
        }
    }
}
exports.UserController = UserController;
