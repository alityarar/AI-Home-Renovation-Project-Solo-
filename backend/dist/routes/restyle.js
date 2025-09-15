"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const pino_1 = __importDefault(require("pino"));
const uploader_1 = require("../lib/uploader");
const aiProviders_1 = require("../lib/aiProviders");
const router = express_1.default.Router();
const logger = (0, pino_1.default)();
router.get('/health', async (req, res) => {
    try {
        const openaiAvailable = await (0, aiProviders_1.testOpenAIAuth)();
        res.json({
            openai: openaiAvailable,
            intelligentAnalysis: openaiAvailable
        });
    }
    catch (error) {
        logger.error({ error }, 'Health check failed');
        res.status(500).json({ error: 'Health check failed' });
    }
});
router.post('/', uploader_1.upload.single('image'), uploader_1.handleUploadError, async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No image file provided' });
        }
        const validation = (0, uploader_1.validateImageFile)(req.file);
        if (!validation.isValid) {
            return res.status(400).json({ error: validation.error });
        }
        const { styleKey = 'modern', intensity = '0.5', numOutputs = '3', aiProvider = 'fast' } = req.body;
        const intensityNum = parseFloat(intensity);
        const numOutputsNum = parseInt(numOutputs);
        if (isNaN(intensityNum) || intensityNum < 0 || intensityNum > 1) {
            return res.status(400).json({ error: 'Intensity must be a number between 0 and 1' });
        }
        if (isNaN(numOutputsNum) || numOutputsNum < 1 || numOutputsNum > 5) {
            return res.status(400).json({ error: 'Number of outputs must be between 1 and 5' });
        }
        if (!['fast', 'smart'].includes(aiProvider)) {
            return res.status(400).json({ error: 'AI provider must be either "fast" or "smart"' });
        }
        if (aiProvider === 'smart' && !process.env.OPENAI_API_KEY) {
            logger.warn('Smart mode requested but OPENAI_API_KEY not configured');
            return res.status(400).json({
                error: 'Smart mode requires OpenAI API configuration'
            });
        }
        logger.info({
            fileSize: req.file.size,
            styleKey,
            intensity: intensityNum,
            numOutputs: numOutputsNum,
            aiProvider
        }, 'Processing restyle request');
        const options = {
            styleKey,
            intensity: intensityNum,
            numOutputs: numOutputsNum,
            aiProvider
        };
        const result = await (0, aiProviders_1.processImageWithAI)(req.file.buffer, options);
        const formattedImages = result.images.map((dataUrl, index) => ({
            dataUrl,
            seed: Math.floor(Math.random() * 1000000)
        }));
        logger.info({
            processingTime: result.metadata.processingTime,
            provider: result.metadata.provider,
            imageCount: formattedImages.length,
            hasAnalysis: !!result.analysis
        }, 'Restyle completed successfully');
        res.json({
            images: formattedImages,
            analysis: result.analysis,
            intelligentPrompt: result.intelligentPrompt,
            metadata: result.metadata
        });
    }
    catch (error) {
        logger.error({ error: error instanceof Error ? error.message : 'Unknown error' }, 'Restyle failed');
        const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
        res.status(500).json({
            error: errorMessage,
            success: false
        });
    }
});
exports.default = router;
