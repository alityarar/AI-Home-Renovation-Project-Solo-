export interface RestyleRequest {
  styleKey: string
  intensity: number
  numOutputs: number
  aiProvider: 'fast' | 'smart' // Yeni provider seçimi
}

export interface RoomAnalysis {
  roomType: string
  currentStyle: string
  suggestions: string[]
  colorPalette: string[]
  lighting: string
  furniture: string[]
  improvements: string[]
}

export interface RestyleResponse {
  images: Array<{
    dataUrl: string
    seed?: number
  }>
  analysis?: RoomAnalysis
  intelligentPrompt?: string
  metadata: {
    provider: string
    processingTime: number
    styleApplied: string
    intensity: number
    aiProvider: 'fast' | 'smart'
  }
}

export interface ErrorResponse {
  message: string
  details?: string
}