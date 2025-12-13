"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const config_1 = __importDefault(require("./config"));
const app = (0, express_1.default)();
app.use((0, cors_1.default)());
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
app.get('/health', (_req, res) => {
    res.json({
        success: true,
        data: {
            status: 'healthy',
            timestamp: new Date().toISOString(),
            version: '3.0',
        },
    });
});
app.get('/', (_req, res) => {
    res.json({
        success: true,
        data: {
            message: 'TalonForge API Server',
            version: '3.0',
            docs: '/api/docs',
        },
    });
});
const auth_routes_1 = __importDefault(require("./routes/auth.routes"));
const instance_routes_1 = __importDefault(require("./routes/instance.routes"));
const migration_routes_1 = __importDefault(require("./routes/migration.routes"));
const backup_routes_1 = __importDefault(require("./routes/backup.routes"));
const ai_routes_1 = __importDefault(require("./routes/ai.routes"));
const admin_routes_1 = __importDefault(require("./routes/admin.routes"));
app.use('/auth', auth_routes_1.default);
app.use('/instances', instance_routes_1.default);
app.use('/migrate', migration_routes_1.default);
app.use('/backups', backup_routes_1.default);
app.use('/ai', ai_routes_1.default);
app.use('/admin', admin_routes_1.default);
app.use((err, _req, res, _next) => {
    console.error('Error:', err);
    res.status(500).json({
        success: false,
        error: {
            code: 'INTERNAL_ERROR',
            message: err.message || 'Internal server error',
        },
    });
});
app.use((_req, res) => {
    res.status(404).json({
        success: false,
        error: {
            code: 'NOT_FOUND',
            message: 'Route not found',
        },
    });
});
const PORT = config_1.default.server.port;
app.listen(PORT, () => {
    console.log(`🚀 TalonForge API Server running on port ${PORT}`);
    console.log(`📝 Environment: ${config_1.default.server.nodeEnv}`);
    console.log(`🔗 Health check: http://localhost:${PORT}/health`);
});
exports.default = app;
//# sourceMappingURL=index.js.map