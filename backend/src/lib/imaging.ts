import sharp from 'sharp'
import pino from 'pino'

const logger = pino()

export async function processImage(inputBuffer: Buffer): Promise<Buffer> {
  try {
    // For Replicate SDXL, use smaller dimensions to avoid CUDA memory issues
    const maxImageSide = parseInt(process.env.MAX_IMAGE_SIDE || '1024', 10) // Reduced from 2048
    
    // Get image metadata
    const metadata = await sharp(inputBuffer).metadata()
    
    if (!metadata.width || !metadata.height) {
      throw new Error('Invalid image: Could not read dimensions')
    }

    logger.info({
      originalWidth: metadata.width,
      originalHeight: metadata.height,
      format: metadata.format,
      size: inputBuffer.length
    }, 'Processing image for Replicate SDXL')

    // Calculate target dimensions maintaining aspect ratio
    const maxDimension = Math.max(metadata.width, metadata.height)
    let targetWidth = metadata.width
    let targetHeight = metadata.height

    // For SDXL, optimize dimensions to be divisible by 8 for better performance
    if (maxDimension > maxImageSide) {
      if (metadata.width > metadata.height) {
        targetWidth = maxImageSide
        targetHeight = Math.round((metadata.height * maxImageSide) / metadata.width)
      } else {
        targetHeight = maxImageSide
        targetWidth = Math.round((metadata.width * maxImageSide) / metadata.height)
      }
    }

    // Round to nearest multiple of 8 for optimal SDXL performance
    targetWidth = Math.round(targetWidth / 8) * 8
    targetHeight = Math.round(targetHeight / 8) * 8

    // Ensure minimum size for good quality
    targetWidth = Math.max(targetWidth, 512)
    targetHeight = Math.max(targetHeight, 512)

    // Process image with optimized settings for Replicate
    let processedBuffer = await sharp(inputBuffer)
      .rotate() // Auto-rotate based on EXIF orientation
      .resize(targetWidth, targetHeight, {
        fit: 'cover', // Better for maintaining aspect ratio
        withoutEnlargement: false
      })
      .jpeg({
        quality: 85, // High quality JPEG is better for Replicate than PNG
        progressive: false,
        mozjpeg: true
      })
      .toBuffer()

    // Check file size constraints for Replicate (max 20MB)
    const maxReplicateSize = 20 * 1024 * 1024
    
    if (processedBuffer.length > maxReplicateSize) {
      logger.info({ 
        processedSize: processedBuffer.length, 
        maxSize: maxReplicateSize 
      }, 'File too large for Replicate, applying additional compression')
      
      // Apply more aggressive compression
      processedBuffer = await sharp(inputBuffer)
        .rotate()
        .resize(768, 768, { // Smaller size for memory efficiency
          fit: 'cover',
          withoutEnlargement: false
        })
        .jpeg({
          quality: 75,
          progressive: false,
          mozjpeg: true
        })
        .toBuffer()
      
      if (processedBuffer.length > maxReplicateSize) {
        throw new Error(`Image is too large even after compression. Please use a smaller image.`)
      }
    }
    
    // Final metadata logging
    const finalMetadata = await sharp(processedBuffer).metadata()
    
    logger.info({
      processedWidth: finalMetadata.width,
      processedHeight: finalMetadata.height,
      originalSize: inputBuffer.length,
      processedSize: processedBuffer.length,
      compressionRatio: ((1 - processedBuffer.length / inputBuffer.length) * 100).toFixed(1) + '%',
      format: finalMetadata.format
    }, 'Image processing completed for Replicate SDXL')

    return processedBuffer

  } catch (error) {
    logger.error(error, 'Image processing failed')
    throw new Error('Image processing failed. Please ensure you uploaded a valid image file.')
  }
}

export function bufferToDataUrl(buffer: Buffer, mimeType: string = 'image/jpeg'): string {
  const base64 = buffer.toString('base64')
  return `data:${mimeType};base64,${base64}`
}