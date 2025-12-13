"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.login = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const prisma_1 = __importDefault(require("../models/prisma"));
const config_1 = __importDefault(require("../config"));
const logger_1 = __importDefault(require("../utils/logger"));
const login = async (credentials) => {
    const { email, password } = credentials;
    const user = await prisma_1.default.user.findUnique({
        where: { email },
    });
    if (!user) {
        logger_1.default.warn(`Login attempt failed: User not found (${email})`);
        throw new Error('Invalid credentials');
    }
    const isValidPassword = await bcryptjs_1.default.compare(password, user.passwordHash);
    if (!isValidPassword) {
        logger_1.default.warn(`Login attempt failed: Invalid password (${email})`);
        throw new Error('Invalid credentials');
    }
    const token = jsonwebtoken_1.default.sign({
        id: user.id,
        email: user.email,
        role: user.role,
    }, config_1.default.security.jwtSecret, {
        expiresIn: '24h',
    });
    logger_1.default.info(`User logged in successfully: ${email}`);
    return {
        token,
        user: {
            id: user.id,
            email: user.email,
            role: user.role,
        },
    };
};
exports.login = login;
//# sourceMappingURL=auth.service.js.map