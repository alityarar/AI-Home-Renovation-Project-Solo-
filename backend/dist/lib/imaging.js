"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.processImage = processImage;
exports.bufferToDataUrl = bufferToDataUrl;
const sharp_1 = __importDefault(require("sharp"));
const pino_1 = __importDefault(require("pino"));
const logger = (0, pino_1.default)();
async function processImage(inputBuffer) {
    try {
        const maxImageSide = parseInt(process.env.MAX_IMAGE_SIDE || '1024', 10);
        const metadata = await (0, sharp_1.default)(inputBuffer).metadata();
        if (!metadata.width || !metadata.height) {
            throw new Error('Invalid image: Could not read dimensions');
        }
        logger.info({
            originalWidth: metadata.width,
            originalHeight: metadata.height,
            format: metadata.format,
            size: inputBuffer.length
        }, 'Processing image for Replicate SDXL');
        const maxDimension = Math.max(metadata.width, metadata.height);
        let targetWidth = metadata.width;
        let targetHeight = metadata.height;
        if (maxDimension > maxImageSide) {
            if (metadata.width > metadata.height) {
                targetWidth = maxImageSide;
                targetHeight = Math.round((metadata.height * maxImageSide) / metadata.width);
            }
            else {
                targetHeight = maxImageSide;
                targetWidth = Math.round((metadata.width * maxImageSide) / metadata.height);
            }
        }
        targetWidth = Math.round(targetWidth / 8) * 8;
        targetHeight = Math.round(targetHeight / 8) * 8;
        targetWidth = Math.max(targetWidth, 512);
        targetHeight = Math.max(targetHeight, 512);
        let processedBuffer = await (0, sharp_1.default)(inputBuffer)
            .rotate()
            .resize(targetWidth, targetHeight, {
            fit: 'cover',
            withoutEnlargement: false
        })
            .jpeg({
            quality: 85,
            progressive: false,
            mozjpeg: true
        })
            .toBuffer();
        const maxReplicateSize = 20 * 1024 * 1024;
        if (processedBuffer.length > maxReplicateSize) {
            logger.info({
                processedSize: processedBuffer.length,
                maxSize: maxReplicateSize
            }, 'File too large for Replicate, applying additional compression');
            processedBuffer = await (0, sharp_1.default)(inputBuffer)
                .rotate()
                .resize(768, 768, {
                fit: 'cover',
                withoutEnlargement: false
            })
                .jpeg({
                quality: 75,
                progressive: false,
                mozjpeg: true
            })
                .toBuffer();
            if (processedBuffer.length > maxReplicateSize) {
                throw new Error(`Image is too large even after compression. Please use a smaller image.`);
            }
        }
        const finalMetadata = await (0, sharp_1.default)(processedBuffer).metadata();
        logger.info({
            processedWidth: finalMetadata.width,
            processedHeight: finalMetadata.height,
            originalSize: inputBuffer.length,
            processedSize: processedBuffer.length,
            compressionRatio: ((1 - processedBuffer.length / inputBuffer.length) * 100).toFixed(1) + '%',
            format: finalMetadata.format
        }, 'Image processing completed for Replicate SDXL');
        return processedBuffer;
    }
    catch (error) {
        logger.error(error, 'Image processing failed');
        throw new Error('Image processing failed. Please ensure you uploaded a valid image file.');
    }
}
function bufferToDataUrl(buffer, mimeType = 'image/jpeg') {
    const base64 = buffer.toString('base64');
    return `data:${mimeType};base64,${base64}`;
}
