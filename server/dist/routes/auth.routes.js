"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_service_1 = require("../services/auth.service");
const response_1 = require("../utils/response");
const logger_1 = __importDefault(require("../utils/logger"));
const router = (0, express_1.Router)();
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            res.status(400).json((0, response_1.errorResponse)(response_1.ErrorCodes.VALIDATION_ERROR, 'Email and password are required'));
            return;
        }
        const result = await (0, auth_service_1.login)({ email, password });
        res.json((0, response_1.successResponse)(result));
    }
    catch (error) {
        logger_1.default.error('Login error:', error);
        res.status(401).json((0, response_1.errorResponse)(response_1.ErrorCodes.AUTH_FAILED, error instanceof Error ? error.message : 'Authentication failed'));
    }
});
exports.default = router;
//# sourceMappingURL=auth.routes.js.map