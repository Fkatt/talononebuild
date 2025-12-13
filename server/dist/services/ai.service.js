"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateSystemSettings = exports.getSystemSettings = exports.submitFeedback = exports.enhance = exports.generate = void 0;
const prisma_1 = __importDefault(require("../models/prisma"));
const logger_1 = __importDefault(require("../utils/logger"));
const generate = async (params) => {
    const { prompt, context } = params;
    logger_1.default.info('AI generation requested');
    const generatedRule = {
        type: 'rule',
        name: 'Generated Rule',
        description: `Rule generated based on: ${prompt}`,
        conditions: [],
        effects: [],
    };
    return {
        prompt,
        generated: generatedRule,
        metadata: {
            model: 'placeholder',
            timestamp: new Date().toISOString(),
        },
    };
};
exports.generate = generate;
const enhance = async (params) => {
    const { prompt } = params;
    logger_1.default.info('AI enhancement requested');
    const enhanced = `Enhanced: ${prompt} - with additional context and clarity`;
    return {
        original: prompt,
        enhanced,
        metadata: {
            model: 'placeholder',
            timestamp: new Date().toISOString(),
        },
    };
};
exports.enhance = enhance;
const submitFeedback = async (params) => {
    const { prompt, response, rating, feedback } = params;
    const feedbackRecord = await prisma_1.default.aIFeedback.create({
        data: {
            prompt,
            response,
            rating,
            feedback,
        },
    });
    logger_1.default.info(`AI feedback submitted: ${rating}/5`);
    return {
        id: feedbackRecord.id,
        message: 'Feedback received, thank you!',
    };
};
exports.submitFeedback = submitFeedback;
const getSystemSettings = async () => {
    const settings = await prisma_1.default.systemSettings.findFirst();
    if (!settings) {
        throw new Error('System settings not found');
    }
    return settings;
};
exports.getSystemSettings = getSystemSettings;
const updateSystemSettings = async (aiProvider, aiConfig) => {
    const settings = await prisma_1.default.systemSettings.findFirst();
    if (!settings) {
        throw new Error('System settings not found');
    }
    const updated = await prisma_1.default.systemSettings.update({
        where: { id: settings.id },
        data: {
            aiProvider,
            aiConfig,
        },
    });
    logger_1.default.info('System AI settings updated');
    return updated;
};
exports.updateSystemSettings = updateSystemSettings;
//# sourceMappingURL=ai.service.js.map