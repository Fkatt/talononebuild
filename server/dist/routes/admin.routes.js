"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = require("../middleware/auth");
const response_1 = require("../utils/response");
const logger_1 = __importDefault(require("../utils/logger"));
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const router = (0, express_1.Router)();
router.use(auth_1.authenticateToken);
router.get('/logs', async (req, res) => {
    try {
        const logPath = path_1.default.join(__dirname, '../../logs/app.log');
        if (!fs_1.default.existsSync(logPath)) {
            res.json((0, response_1.successResponse)({ logs: [] }));
            return;
        }
        const logContent = fs_1.default.readFileSync(logPath, 'utf-8');
        const logLines = logContent.trim().split('\n');
        const recentLogs = logLines.slice(-100);
        const parsedLogs = recentLogs
            .map((line) => {
            try {
                return JSON.parse(line);
            }
            catch {
                return { message: line };
            }
        })
            .reverse();
        res.json((0, response_1.successResponse)({ logs: parsedLogs }));
    }
    catch (error) {
        logger_1.default.error('Get logs error:', error);
        res.status(500).json((0, response_1.errorResponse)(response_1.ErrorCodes.INTERNAL_ERROR, error instanceof Error ? error.message : 'Failed to retrieve logs'));
    }
});
router.get('/stats', async (req, res) => {
    try {
        const stats = {
            uptime: process.uptime(),
            memory: process.memoryUsage(),
            timestamp: new Date().toISOString(),
        };
        res.json((0, response_1.successResponse)(stats));
    }
    catch (error) {
        logger_1.default.error('Get stats error:', error);
        res.status(500).json((0, response_1.errorResponse)(response_1.ErrorCodes.INTERNAL_ERROR, error instanceof Error ? error.message : 'Failed to retrieve stats'));
    }
});
exports.default = router;
//# sourceMappingURL=admin.routes.js.map