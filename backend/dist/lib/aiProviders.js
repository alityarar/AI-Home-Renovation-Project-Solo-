"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.HybridAIProvider = exports.OpenAIProvider = exports.ReplicateSDProvider = exports.ReplicateProvider = void 0;
exports.testReplicateAuth = testReplicateAuth;
exports.testOpenAIAuth = testOpenAIAuth;
exports.processImageWithAI = processImageWithAI;
const replicate_1 = __importDefault(require("replicate"));
const openai_1 = __importDefault(require("openai"));
const sharp_1 = __importDefault(require("sharp"));
const pino_1 = __importDefault(require("pino"));
const logger = (0, pino_1.default)();
async function testReplicateAuth() {
    try {
        if (!process.env.REPLICATE_API_TOKEN) {
            logger.warn('REPLICATE_API_TOKEN not found');
            return false;
        }
        const replicate = new replicate_1.default({
            auth: process.env.REPLICATE_API_TOKEN,
        });
        const models = await replicate.models.list();
        logger.info('Replicate authentication successful');
        return true;
    }
    catch (error) {
        logger.error({ error: error instanceof Error ? error.message : 'Unknown error' }, 'Replicate authentication failed');
        return false;
    }
}
async function testOpenAIAuth() {
    try {
        if (!process.env.OPENAI_API_KEY) {
            logger.warn('OPENAI_API_KEY not found');
            return false;
        }
        const openai = new openai_1.default({
            apiKey: process.env.OPENAI_API_KEY,
        });
        await openai.models.list();
        logger.info('OpenAI authentication successful');
        return true;
    }
    catch (error) {
        logger.error({ error: error instanceof Error ? error.message : 'Unknown error' }, 'OpenAI authentication failed');
        return false;
    }
}
async function optimizeImageForAI(imageBuffer) {
    try {
        const metadata = await (0, sharp_1.default)(imageBuffer).metadata();
        logger.info({
            originalWidth: metadata.width,
            originalHeight: metadata.height,
            originalSize: imageBuffer.length
        }, 'Original image info');
        let processedBuffer = imageBuffer;
        if (metadata.width && metadata.height && (metadata.width > 1024 || metadata.height > 1024)) {
            processedBuffer = await (0, sharp_1.default)(imageBuffer)
                .resize(1024, 1024, {
                fit: 'inside',
                withoutEnlargement: true
            })
                .jpeg({ quality: 85 })
                .toBuffer();
            logger.info({
                newSize: processedBuffer.length,
                reduction: `${Math.round((1 - processedBuffer.length / imageBuffer.length) * 100)}%`
            }, 'Image optimized for AI processing');
        }
        if (processedBuffer.length > 4 * 1024 * 1024) {
            processedBuffer = await (0, sharp_1.default)(processedBuffer)
                .jpeg({ quality: 70 })
                .toBuffer();
            logger.info({
                finalSize: processedBuffer.length
            }, 'Image compressed for memory efficiency');
        }
        return processedBuffer;
    }
    catch (error) {
        logger.warn({ error }, 'Failed to optimize image, using original');
        return imageBuffer;
    }
}
class ReplicateProvider {
    constructor() {
        this.name = 'Replicate SDXL img2img';
        if (!process.env.REPLICATE_API_TOKEN) {
            throw new Error('REPLICATE_API_TOKEN environment variable is not set');
        }
        this.replicate = new replicate_1.default({
            auth: process.env.REPLICATE_API_TOKEN,
        });
    }
    async editImage(imageBuffer, prompt, numOutputs = 2) {
        try {
            logger.info({ prompt, numOutputs }, 'Starting SDXL img2img transformation');
            const startTime = Date.now();
            const optimizedBuffer = await optimizeImageForAI(imageBuffer);
            const base64Image = `data:image/jpeg;base64,${optimizedBuffer.toString('base64')}`;
            logger.info({
                base64Size: base64Image.length,
                bufferSize: optimizedBuffer.length
            }, 'Optimized image prepared for SDXL');
            const results = [];
            for (let i = 0; i < Math.min(numOutputs, 2); i++) {
                try {
                    logger.info({ iteration: i + 1 }, 'Starting SDXL iteration');
                    const output = await Promise.race([
                        this.replicate.run("stability-ai/sdxl:39ed52f2a78e934b3ba6e2a89f5b1c712de7dfea535525255b1aa35c5565e08b", {
                            input: {
                                image: base64Image,
                                prompt: `Interior design transformation: ${prompt}. Professional interior photography, high quality, realistic lighting, maintain room structure and layout`,
                                negative_prompt: "blurry, low quality, distorted, ugly, cartoon, anime, painting, sketch, people, text, watermark, border, frame",
                                strength: 0.5 + (i * 0.1),
                                guidance_scale: 7.5,
                                num_inference_steps: 25,
                                seed: Math.floor(Math.random() * 100000),
                            }
                        }),
                        new Promise((_, reject) => setTimeout(() => reject(new Error('SDXL request timed out')), 120000))
                    ]);
                    if (output && Array.isArray(output) && output[0]) {
                        logger.info({ iteration: i + 1 }, 'SDXL output received, fetching image');
                        const imageUrl = output[0];
                        const imageResponse = await Promise.race([
                            fetch(imageUrl),
                            new Promise((_, reject) => setTimeout(() => reject(new Error('Image fetch timed out')), 30000))
                        ]);
                        if (!imageResponse.ok) {
                            throw new Error(`Failed to fetch image: ${imageResponse.status}`);
                        }
                        const arrayBuffer = await imageResponse.arrayBuffer();
                        const buffer = Buffer.from(arrayBuffer);
                        const base64 = buffer.toString('base64');
                        results.push(`data:image/jpeg;base64,${base64}`);
                        logger.info({ iteration: i + 1 }, 'SDXL iteration completed successfully');
                    }
                    else if (output && typeof output === 'string') {
                        logger.info({ iteration: i + 1 }, 'SDXL output received as string');
                        const imageResponse = await Promise.race([
                            fetch(output),
                            new Promise((_, reject) => setTimeout(() => reject(new Error('Image fetch timed out')), 30000))
                        ]);
                        const arrayBuffer = await imageResponse.arrayBuffer();
                        const buffer = Buffer.from(arrayBuffer);
                        const base64 = buffer.toString('base64');
                        results.push(`data:image/jpeg;base64,${base64}`);
                        logger.info({ iteration: i + 1 }, 'SDXL iteration completed successfully');
                    }
                    else {
                        logger.warn({ iteration: i + 1, output }, 'Unexpected SDXL output format');
                    }
                }
                catch (iterationError) {
                    logger.warn({
                        error: iterationError instanceof Error ? iterationError.message : 'Unknown error',
                        iteration: i + 1
                    }, 'Failed SDXL iteration');
                    continue;
                }
            }
            if (results.length > 0) {
                const duration = Date.now() - startTime;
                logger.info({ duration, outputCount: results.length }, 'SDXL transformation completed successfully');
                return results;
            }
            throw new Error('No images returned from SDXL after all attempts');
        }
        catch (error) {
            logger.error({
                error: error instanceof Error ? error.message : 'Unknown error',
                stack: error instanceof Error ? error.stack : undefined
            }, 'SDXL transformation failed');
            if (error instanceof Error) {
                if (error.message.includes('CUDA out of memory')) {
                    throw new Error('GPU memory insufficient. Trying alternative approach.');
                }
                if (error.message.includes('timed out')) {
                    throw new Error('SDXL request timed out. Please try again.');
                }
                if (error.message.includes('rate_limit') || error.message.includes('429')) {
                    throw new Error('Rate limit exceeded. Please wait and try again.');
                }
            }
            throw new Error('SDXL transformation failed. Trying fallback.');
        }
    }
}
exports.ReplicateProvider = ReplicateProvider;
class ReplicateSDProvider {
    constructor() {
        this.name = 'Replicate SD 1.5 img2img';
        if (!process.env.REPLICATE_API_TOKEN) {
            throw new Error('REPLICATE_API_TOKEN environment variable is not set');
        }
        this.replicate = new replicate_1.default({
            auth: process.env.REPLICATE_API_TOKEN,
        });
    }
    async editImage(imageBuffer, prompt, numOutputs = 2) {
        try {
            logger.info({ prompt, numOutputs }, 'Starting SD 1.5 img2img transformation');
            const startTime = Date.now();
            const optimizedBuffer = await optimizeImageForAI(imageBuffer);
            const base64Image = `data:image/jpeg;base64,${optimizedBuffer.toString('base64')}`;
            const results = [];
            for (let i = 0; i < Math.min(numOutputs, 2); i++) {
                try {
                    logger.info({ iteration: i + 1 }, 'Starting SD 1.5 iteration');
                    const output = await Promise.race([
                        this.replicate.run("timothybrooks/instruct-pix2pix:30c1d0b916a6f8efce20493a5b39ad6a4710c63cfa5c146e6b25b2046119ae23", {
                            input: {
                                image: base64Image,
                                prompt: `Transform this interior to: ${prompt}. Keep the room layout and structure, only change style, colors, furniture and decor`,
                                num_inference_steps: 20,
                                guidance_scale: 7.5,
                                image_guidance_scale: 1.5,
                                seed: Math.floor(Math.random() * 100000),
                            }
                        }),
                        new Promise((_, reject) => setTimeout(() => reject(new Error('SD 1.5 request timed out')), 90000))
                    ]);
                    if (output && typeof output === 'string') {
                        const imageResponse = await fetch(output);
                        const arrayBuffer = await imageResponse.arrayBuffer();
                        const buffer = Buffer.from(arrayBuffer);
                        const base64 = buffer.toString('base64');
                        results.push(`data:image/jpeg;base64,${base64}`);
                        logger.info({ iteration: i + 1 }, 'SD 1.5 iteration completed');
                    }
                    else if (output && Array.isArray(output) && output[0]) {
                        const imageResponse = await fetch(output[0]);
                        const arrayBuffer = await imageResponse.arrayBuffer();
                        const buffer = Buffer.from(arrayBuffer);
                        const base64 = buffer.toString('base64');
                        results.push(`data:image/jpeg;base64,${base64}`);
                        logger.info({ iteration: i + 1 }, 'SD 1.5 iteration completed');
                    }
                }
                catch (iterationError) {
                    logger.warn({
                        error: iterationError instanceof Error ? iterationError.message : 'Unknown error',
                        iteration: i + 1
                    }, 'Failed SD 1.5 iteration');
                    continue;
                }
            }
            if (results.length === 0) {
                throw new Error('No images returned from SD 1.5');
            }
            const duration = Date.now() - startTime;
            logger.info({ duration, outputCount: results.length }, 'SD 1.5 transformation completed');
            return results;
        }
        catch (error) {
            logger.error({ error }, 'SD 1.5 transformation failed');
            throw new Error('SD 1.5 transformation failed. Please try again.');
        }
    }
}
exports.ReplicateSDProvider = ReplicateSDProvider;
class OpenAIProvider {
    constructor() {
        if (!process.env.OPENAI_API_KEY) {
            throw new Error('OPENAI_API_KEY environment variable is not set');
        }
        this.openai = new openai_1.default({
            apiKey: process.env.OPENAI_API_KEY,
        });
    }
    async analyzeRoom(imageBuffer) {
        try {
            const base64Image = imageBuffer.toString('base64');
            const response = await this.openai.chat.completions.create({
                model: "gpt-4o-mini",
                messages: [
                    {
                        role: "user",
                        content: [
                            {
                                type: "text",
                                text: `Analyze this interior space and provide a detailed JSON response with:
                1. roomType: Type of room (living room, bedroom, kitchen, etc.)
                2. currentStyle: Current design style (modern, traditional, eclectic, etc.)
                3. suggestions: Array of 3-5 specific improvement suggestions
                4. colorPalette: Array of current dominant colors
                5. lighting: Description of current lighting situation
                6. furniture: Array of main furniture pieces visible
                7. improvements: Array of specific areas that could be enhanced
                
                IMPORTANT: Return ONLY valid JSON, no markdown formatting, no code blocks, no additional text.`
                            },
                            {
                                type: "image_url",
                                image_url: {
                                    url: `data:image/jpeg;base64,${base64Image}`
                                }
                            }
                        ]
                    }
                ],
                max_tokens: 1000,
                temperature: 0.3
            });
            const content = response.choices[0].message.content;
            if (!content) {
                throw new Error('No response from GPT-4 Vision');
            }
            try {
                let cleanContent = content.trim();
                if (cleanContent.startsWith('```json')) {
                    cleanContent = cleanContent.replace(/^```json\s*/, '').replace(/\s*```$/, '');
                }
                else if (cleanContent.startsWith('```')) {
                    cleanContent = cleanContent.replace(/^```\s*/, '').replace(/\s*```$/, '');
                }
                const parsed = JSON.parse(cleanContent);
                logger.info({ roomType: parsed.roomType, currentStyle: parsed.currentStyle }, 'Room analysis completed successfully');
                return parsed;
            }
            catch (parseError) {
                logger.warn({ content, parseError }, 'Failed to parse GPT-4 response as JSON, using fallback');
                return {
                    roomType: 'unknown',
                    currentStyle: 'mixed',
                    suggestions: ['Improve lighting', 'Add plants', 'Organize space'],
                    colorPalette: ['neutral', 'white', 'brown'],
                    lighting: 'moderate',
                    furniture: ['seating', 'table'],
                    improvements: ['color coordination', 'lighting enhancement']
                };
            }
        }
        catch (error) {
            logger.error({ error }, 'OpenAI room analysis failed');
            throw new Error('Failed to analyze room with GPT-4 Vision');
        }
    }
    async generateStylePrompt(roomAnalysis, targetStyle, intensity) {
        try {
            const intensityDescription = intensity > 0.7
                ? "dramatic and bold transformation"
                : intensity > 0.5
                    ? "moderate but noticeable changes"
                    : "subtle and refined enhancements";
            const response = await this.openai.chat.completions.create({
                model: "gpt-4",
                messages: [
                    {
                        role: "system",
                        content: "You are an expert interior designer. Create detailed, specific prompts for AI image generation that will transform rooms into the requested style while maintaining the room's structure and layout."
                    },
                    {
                        role: "user",
                        content: `Based on this room analysis:
            - Room Type: ${roomAnalysis.roomType}
            - Current Style: ${roomAnalysis.currentStyle}
            - Current Colors: ${roomAnalysis.colorPalette.join(', ')}
            - Current Furniture: ${roomAnalysis.furniture.join(', ')}
            - Lighting: ${roomAnalysis.lighting}
            
            Create a detailed prompt to transform this into ${targetStyle} style with ${intensityDescription}.
            
            Focus on:
            - Specific furniture styles and materials
            - Color schemes and textures
            - Lighting and ambiance
            - Decorative elements and accessories
            - Wall treatments and finishes
            
            Keep the room layout and basic structure intact. Provide only the transformation prompt, no explanations.`
                    }
                ],
                max_tokens: 300,
                temperature: 0.7
            });
            return response.choices[0].message.content || `${targetStyle} interior design transformation`;
        }
        catch (error) {
            logger.error({ error }, 'OpenAI prompt generation failed');
            const stylePrompts = {
                modern: "Modern minimalist interior design with clean lines, neutral colors, and contemporary furniture",
                scandi: "Scandinavian interior design with light wood, white walls, cozy textures, and hygge atmosphere",
                industrial: "Industrial interior design with exposed brick, metal fixtures, concrete floors, and urban aesthetics",
                minimal: "Minimal interior design with uncluttered spaces, clean lines, and carefully chosen elements",
                boho: "Bohemian interior design with colorful textiles, eclectic furniture, plants, and artistic decorations"
            };
            return stylePrompts[targetStyle] || stylePrompts.modern;
        }
    }
}
exports.OpenAIProvider = OpenAIProvider;
class HybridAIProvider {
    constructor() {
        this.openaiProvider = new OpenAIProvider();
        this.replicateProvider = new ReplicateProvider();
    }
    async intelligentRestyle(imageBuffer, targetStyle, options) {
        try {
            const startTime = Date.now();
            logger.info('Analyzing room with GPT-4 Vision');
            const roomAnalysis = await this.openaiProvider.analyzeRoom(imageBuffer);
            logger.info('Generating intelligent style-specific prompt');
            const intelligentPrompt = await this.openaiProvider.generateStylePrompt(roomAnalysis, targetStyle, options.intensity);
            logger.info('Transforming image with Replicate SDXL using intelligent prompt');
            const transformedImages = await this.replicateProvider.editImage(imageBuffer, intelligentPrompt, options.numOutputs);
            const processingTime = Date.now() - startTime;
            return {
                images: transformedImages,
                analysis: roomAnalysis,
                intelligentPrompt,
                metadata: {
                    provider: 'Hybrid (GPT-4 Vision + Replicate SDXL)',
                    processingTime,
                    styleApplied: targetStyle,
                    intensity: options.intensity,
                    aiProvider: 'smart'
                }
            };
        }
        catch (error) {
            logger.error({ error }, 'Hybrid AI processing failed');
            throw error;
        }
    }
}
exports.HybridAIProvider = HybridAIProvider;
async function processImageWithAI(imageBuffer, options) {
    const { styleKey, intensity, numOutputs, aiProvider } = options;
    const startTime = Date.now();
    try {
        logger.info({
            styleKey,
            intensity,
            numOutputs,
            aiProvider
        }, 'Processing image with AI');
        if (aiProvider === 'smart' && process.env.OPENAI_API_KEY) {
            try {
                const hybridProvider = new HybridAIProvider();
                const result = await hybridProvider.intelligentRestyle(imageBuffer, styleKey, {
                    intensity,
                    numOutputs
                });
                return {
                    ...result,
                    metadata: {
                        ...result.metadata,
                        aiProvider: 'smart'
                    }
                };
            }
            catch (smartError) {
                logger.warn({ error: smartError }, 'Smart mode failed, falling back to fast mode');
            }
        }
        const stylePrompts = {
            modern: "Modern minimalist interior design with clean lines, neutral colors, and contemporary furniture",
            scandi: "Scandinavian interior design with light wood, white walls, cozy textures, and hygge atmosphere",
            industrial: "Industrial interior design with exposed brick, metal fixtures, concrete floors, and urban aesthetics",
            minimal: "Minimal interior design with uncluttered spaces, clean lines, and carefully chosen elements",
            boho: "Bohemian interior design with colorful textiles, eclectic furniture, plants, and artistic decorations"
        };
        const basePrompt = stylePrompts[styleKey] || stylePrompts.modern;
        const intensityPrompt = intensity > 0.7
            ? "dramatic transformation, bold changes"
            : intensity > 0.5
                ? "moderate transformation, balanced changes"
                : "subtle transformation, gentle enhancements";
        const fullPrompt = `${basePrompt}, ${intensityPrompt}`;
        try {
            const sdxlProvider = new ReplicateProvider();
            const images = await sdxlProvider.editImage(imageBuffer, fullPrompt, numOutputs);
            const processingTime = Date.now() - startTime;
            logger.info({ processingTime, provider: 'SDXL', imageCount: images.length, mode: aiProvider }, 'Restyle completed successfully');
            return {
                images,
                metadata: {
                    provider: 'Replicate SDXL img2img',
                    processingTime,
                    styleApplied: styleKey,
                    intensity,
                    aiProvider
                }
            };
        }
        catch (sdxlError) {
            logger.warn({ error: sdxlError }, 'SDXL failed, trying SD 1.5 fallback');
            try {
                const sdProvider = new ReplicateSDProvider();
                const images = await sdProvider.editImage(imageBuffer, fullPrompt, numOutputs);
                const processingTime = Date.now() - startTime;
                logger.info({ processingTime, provider: 'SD 1.5', imageCount: images.length, mode: aiProvider }, 'Restyle completed with fallback');
                return {
                    images,
                    metadata: {
                        provider: 'Replicate SD 1.5 img2img',
                        processingTime,
                        styleApplied: styleKey,
                        intensity,
                        aiProvider
                    }
                };
            }
            catch (sdError) {
                logger.error({ error: sdError }, 'All Replicate providers failed');
                throw new Error('Image transformation failed. Please try again with a different image or style.');
            }
        }
    }
    catch (error) {
        logger.error({ error }, 'processImageWithAI failed');
        throw new Error('Failed to process image with AI. Please try again.');
    }
}
