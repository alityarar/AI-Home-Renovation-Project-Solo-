import express, { Request, Response, Router } from 'express'
import pino from 'pino'
import { upload, validateImageFile, handleUploadError } from '../lib/uploader'
import { processImageWithAI, EnhancedStyleOptions, testOpenAIAuth } from '../lib/aiProviders'

const router: Router = express.Router()
const logger = pino()

// Health check endpoint for AI providers
router.get('/health', async (req: Request, res: Response) => {
  try {
    const openaiAvailable = await testOpenAIAuth()
    
    res.json({
      openai: openaiAvailable,
      intelligentAnalysis: openaiAvailable
    })
  } catch (error) {
    logger.error({ error }, 'Health check failed')
    res.status(500).json({ error: 'Health check failed' })
  }
})

// Restyle endpoint
router.post('/', upload.single('image'), handleUploadError, async (req: Request, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No image file provided' })
    }

    // Validate the uploaded file
    const validation = validateImageFile(req.file)
    if (!validation.isValid) {
      return res.status(400).json({ error: validation.error })
    }

    // Extract parameters from request
    const { 
      styleKey = 'modern', 
      intensity = '0.5', 
      numOutputs = '3',
      aiProvider = 'fast'
    } = req.body

    // Validate and convert parameters
    const intensityNum = parseFloat(intensity)
    const numOutputsNum = parseInt(numOutputs)

    if (isNaN(intensityNum) || intensityNum < 0 || intensityNum > 1) {
      return res.status(400).json({ error: 'Intensity must be a number between 0 and 1' })
    }

    if (isNaN(numOutputsNum) || numOutputsNum < 1 || numOutputsNum > 5) {
      return res.status(400).json({ error: 'Number of outputs must be between 1 and 5' })
    }

    if (!['fast', 'smart'].includes(aiProvider)) {
      return res.status(400).json({ error: 'AI provider must be either "fast" or "smart"' })
    }

    // Check if smart mode is requested but OpenAI is not configured
    if (aiProvider === 'smart' && !process.env.OPENAI_API_KEY) {
      logger.warn('Smart mode requested but OPENAI_API_KEY not configured')
      return res.status(400).json({ 
        error: 'Smart mode requires OpenAI API configuration' 
      })
    }

    logger.info({ 
      fileSize: req.file.size, 
      styleKey, 
      intensity: intensityNum, 
      numOutputs: numOutputsNum,
      aiProvider
    }, 'Processing restyle request')

    // Process image with AI
    const options: EnhancedStyleOptions = {
      styleKey,
      intensity: intensityNum,
      numOutputs: numOutputsNum,
      aiProvider
    }

    const result = await processImageWithAI(req.file.buffer, options)

    // Convert raw image URLs to StyleOutput format expected by frontend
    const formattedImages = result.images.map((dataUrl, index) => ({
      dataUrl,
      seed: Math.floor(Math.random() * 1000000) // Generate a seed for each image
    }))

    logger.info({ 
      processingTime: result.metadata.processingTime,
      provider: result.metadata.provider,
      imageCount: formattedImages.length,
      hasAnalysis: !!result.analysis
    }, 'Restyle completed successfully')

    res.json({
      images: formattedImages,
      analysis: result.analysis,
      intelligentPrompt: result.intelligentPrompt,
      metadata: result.metadata
    })

  } catch (error) {
    logger.error({ error: error instanceof Error ? error.message : 'Unknown error' }, 'Restyle failed')
    
    const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred'
    res.status(500).json({ 
      error: errorMessage,
      success: false 
    })
  }
})

export default router