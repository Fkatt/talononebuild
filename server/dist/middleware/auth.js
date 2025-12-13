"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authenticateToken = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const config_1 = __importDefault(require("../config"));
const response_1 = require("../utils/response");
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (!token) {
        res.status(401).json((0, response_1.errorResponse)(response_1.ErrorCodes.UNAUTHORIZED, 'No token provided'));
        return;
    }
    try {
        const decoded = jsonwebtoken_1.default.verify(token, config_1.default.security.jwtSecret);
        req.user = decoded;
        next();
    }
    catch (error) {
        if (error instanceof jsonwebtoken_1.default.TokenExpiredError) {
            res.status(401).json((0, response_1.errorResponse)(response_1.ErrorCodes.TOKEN_EXPIRED, 'Token expired'));
            return;
        }
        res.status(403).json((0, response_1.errorResponse)(response_1.ErrorCodes.FORBIDDEN, 'Invalid token'));
        return;
    }
};
exports.authenticateToken = authenticateToken;
//# sourceMappingURL=auth.js.map