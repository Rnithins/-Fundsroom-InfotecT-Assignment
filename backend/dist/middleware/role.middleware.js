"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authorize = void 0;
const errors_js_1 = require("../utils/errors.js");
const authorize = (...allowedRoles) => {
    return (req, res, next) => {
        if (!req.user) {
            return next(new errors_js_1.UnauthorizedError());
        }
        if (!allowedRoles.includes(req.user.role)) {
            return next(new errors_js_1.ForbiddenError(`User role '${req.user.role}' is not authorized to access this resource`));
        }
        next();
    };
};
exports.authorize = authorize;
