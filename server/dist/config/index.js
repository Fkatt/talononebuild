"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const config = {
    server: {
        port: parseInt(process.env.PORT || '3000', 10),
        nodeEnv: process.env.NODE_ENV || 'development',
    },
    database: {
        url: process.env.DATABASE_URL || 'postgresql://user:pass@localhost:5432/talonforge',
    },
    security: {
        encryptionKey: process.env.ENCRYPTION_KEY || 'default-key-change-in-production',
        jwtSecret: process.env.JWT_SECRET || 'default-secret-change-in-production',
    },
    talon: {},
    contentful: {},
};
if (config.server.nodeEnv === 'production') {
    if (config.security.encryptionKey === 'default-key-change-in-production') {
        throw new Error('ENCRYPTION_KEY must be set in production');
    }
    if (config.security.jwtSecret === 'default-secret-change-in-production') {
        throw new Error('JWT_SECRET must be set in production');
    }
}
exports.default = config;
//# sourceMappingURL=index.js.map