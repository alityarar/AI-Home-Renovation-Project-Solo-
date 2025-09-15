import pino from 'pino'
import { ReplicateProvider } from './aiProviders'

const logger = pino()

// Style-specific prompts for interior design transformation
const STYLE_PROMPTS = {
  modern: "Modern minimalist interior design with clean lines, neutral colors, and contemporary furniture",
  scandi: "Scandinavian interior design with light wood, white walls, cozy textures, and hygge atmosphere", 
  industrial: "Industrial interior design with exposed brick, metal fixtures, concrete floors, and urban aesthetics",
  minimal: "Minimal interior design with uncluttered spaces, clean lines, and carefully chosen elements",
  boho: "Bohemian interior design with colorful textiles, eclectic furniture, plants, and artistic decorations"
}

export function buildPrompt(styleKey: string, intensity: number): string {
  const stylePrompt = STYLE_PROMPTS[styleKey as keyof typeof STYLE_PROMPTS]
  
  if (!stylePrompt) {
    throw new Error(`Unknown style: ${styleKey}`)
  }

  const intensityText = intensity > 0.7 
    ? "dramatic transformation, bold changes" 
    : intensity > 0.5 
      ? "moderate transformation, balanced changes"
      : "subtle transformation, gentle enhancements"

  return `${stylePrompt}, ${intensityText}`
}

// Get Replicate AI provider
function getAIProvider() {
  if (!process.env.REPLICATE_API_TOKEN) {
    throw new Error('REPLICATE_API_TOKEN environment variable is not set')
  }
  
  logger.info('Using Replicate for image-to-image transformation')
  return new ReplicateProvider()
}

// Main edit function that uses Replicate
export async function editImage(
  imageBuffer: Buffer,
  prompt: string,
  numOutputs: number = 2
): Promise<string[]> {
  const provider = getAIProvider()
  
  try {
    logger.info({ provider: provider.name }, 'Starting image transformation')
    return await provider.editImage(imageBuffer, prompt, numOutputs)
  } catch (error) {
    logger.error({ provider: provider.name, error }, 'Image transformation failed')
    throw error
  }
}