"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = require("../middleware/auth");
const ai_service_1 = require("../services/ai.service");
const response_1 = require("../utils/response");
const logger_1 = __importDefault(require("../utils/logger"));
const router = (0, express_1.Router)();
router.use(auth_1.authenticateToken);
router.post('/generate', async (req, res) => {
    try {
        const { prompt, context } = req.body;
        if (!prompt) {
            res.status(400).json((0, response_1.errorResponse)(response_1.ErrorCodes.VALIDATION_ERROR, 'Missing required field: prompt'));
            return;
        }
        const result = await (0, ai_service_1.generate)({ prompt, context });
        res.json((0, response_1.successResponse)(result));
    }
    catch (error) {
        logger_1.default.error('AI generation error:', error);
        res.status(500).json((0, response_1.errorResponse)(response_1.ErrorCodes.INTERNAL_ERROR, error instanceof Error ? error.message : 'AI generation failed'));
    }
});
router.post('/enhance', async (req, res) => {
    try {
        const { prompt } = req.body;
        if (!prompt) {
            res.status(400).json((0, response_1.errorResponse)(response_1.ErrorCodes.VALIDATION_ERROR, 'Missing required field: prompt'));
            return;
        }
        const result = await (0, ai_service_1.enhance)({ prompt });
        res.json((0, response_1.successResponse)(result));
    }
    catch (error) {
        logger_1.default.error('AI enhancement error:', error);
        res.status(500).json((0, response_1.errorResponse)(response_1.ErrorCodes.INTERNAL_ERROR, error instanceof Error ? error.message : 'AI enhancement failed'));
    }
});
router.post('/feedback', async (req, res) => {
    try {
        const { prompt, response, rating, feedback } = req.body;
        if (!prompt || !response || !rating) {
            res.status(400).json((0, response_1.errorResponse)(response_1.ErrorCodes.VALIDATION_ERROR, 'Missing required fields: prompt, response, rating'));
            return;
        }
        if (rating < 1 || rating > 5) {
            res.status(400).json((0, response_1.errorResponse)(response_1.ErrorCodes.VALIDATION_ERROR, 'Rating must be between 1 and 5'));
            return;
        }
        const result = await (0, ai_service_1.submitFeedback)({ prompt, response, rating, feedback });
        res.json((0, response_1.successResponse)(result));
    }
    catch (error) {
        logger_1.default.error('AI feedback error:', error);
        res.status(500).json((0, response_1.errorResponse)(response_1.ErrorCodes.INTERNAL_ERROR, error instanceof Error ? error.message : 'Failed to submit feedback'));
    }
});
exports.default = router;
//# sourceMappingURL=ai.routes.js.map