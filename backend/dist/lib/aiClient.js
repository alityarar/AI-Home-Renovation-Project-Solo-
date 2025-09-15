"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.buildPrompt = buildPrompt;
exports.editImage = editImage;
const pino_1 = __importDefault(require("pino"));
const aiProviders_1 = require("./aiProviders");
const logger = (0, pino_1.default)();
const STYLE_PROMPTS = {
    modern: "Modern minimalist interior design with clean lines, neutral colors, and contemporary furniture",
    scandi: "Scandinavian interior design with light wood, white walls, cozy textures, and hygge atmosphere",
    industrial: "Industrial interior design with exposed brick, metal fixtures, concrete floors, and urban aesthetics",
    minimal: "Minimal interior design with uncluttered spaces, clean lines, and carefully chosen elements",
    boho: "Bohemian interior design with colorful textiles, eclectic furniture, plants, and artistic decorations"
};
function buildPrompt(styleKey, intensity) {
    const stylePrompt = STYLE_PROMPTS[styleKey];
    if (!stylePrompt) {
        throw new Error(`Unknown style: ${styleKey}`);
    }
    const intensityText = intensity > 0.7
        ? "dramatic transformation, bold changes"
        : intensity > 0.5
            ? "moderate transformation, balanced changes"
            : "subtle transformation, gentle enhancements";
    return `${stylePrompt}, ${intensityText}`;
}
function getAIProvider() {
    if (!process.env.REPLICATE_API_TOKEN) {
        throw new Error('REPLICATE_API_TOKEN environment variable is not set');
    }
    logger.info('Using Replicate for image-to-image transformation');
    return new aiProviders_1.ReplicateProvider();
}
async function editImage(imageBuffer, prompt, numOutputs = 2) {
    const provider = getAIProvider();
    try {
        logger.info({ provider: provider.name }, 'Starting image transformation');
        return await provider.editImage(imageBuffer, prompt, numOutputs);
    }
    catch (error) {
        logger.error({ provider: provider.name, error }, 'Image transformation failed');
        throw error;
    }
}
