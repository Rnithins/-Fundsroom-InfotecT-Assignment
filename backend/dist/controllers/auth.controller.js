"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthController = void 0;
const auth_service_js_1 = require("../services/auth.service.js");
const response_js_1 = require("../utils/response.js");
class AuthController {
    static async login(req, res, next) {
        try {
            const { email, password } = req.body;
            const result = await auth_service_js_1.AuthService.login(email, password);
            return (0, response_js_1.sendSuccess)(res, 'Login successful', result);
        }
        catch (error) {
            next(error);
        }
    }
    static async me(req, res, next) {
        try {
            const result = await auth_service_js_1.AuthService.me(req.user.id);
            return (0, response_js_1.sendSuccess)(res, 'Current user profile fetched', result);
        }
        catch (error) {
            next(error);
        }
    }
}
exports.AuthController = AuthController;
