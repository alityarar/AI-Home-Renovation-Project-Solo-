import axios from 'axios'
import { StyleKey, StyleOutput } from '@/store/useAppStore'

const API_BASE_URL = '/api'

export interface RoomAnalysis {
  roomType: string
  currentStyle: string
  suggestions: string[]
  colorPalette: string[]
  lighting: string
  furniture: string[]
  improvements: string[]
}

export interface RestyleRequest {
  image: File
  styleKey: StyleKey
  intensity: number
  numOutputs: number
  useIntelligentAnalysis?: boolean
  aiProvider: 'fast' | 'smart'
}

export interface RestyleResponse {
  images: StyleOutput[]
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

export interface AIHealthResponse {
  openai: boolean
  intelligentAnalysis: boolean
}

export const api = {
  async checkAIHealth(): Promise<AIHealthResponse> {
    try {
      const response = await axios.get<AIHealthResponse>(`${API_BASE_URL}/restyle/health`)
      return response.data
    } catch (error) {
      console.warn('Failed to check AI health:', error)
      return { openai: false, intelligentAnalysis: false }
    }
  },

  async restyle(params: RestyleRequest): Promise<RestyleResponse> {
    const formData = new FormData()
    formData.append('image', params.image)
    formData.append('styleKey', params.styleKey)
    formData.append('intensity', params.intensity.toString())
    formData.append('numOutputs', params.numOutputs.toString())
    formData.append('useIntelligentAnalysis', (params.useIntelligentAnalysis || false).toString())
    formData.append('aiProvider', params.aiProvider)

    try {
      const response = await axios.post<RestyleResponse>(
        `${API_BASE_URL}/restyle`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
          timeout: params.aiProvider === 'smart' ? 120000 : 60000, // Smart mode için daha uzun timeout
        }
      )

      return response.data
    } catch (error) {
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 429) {
          throw new Error('Too many requests. Please wait a moment and try again.')
        }
        if (error.response?.status === 413) {
          throw new Error('Image file is too large. Please use an image under 10MB.')
        }
        if (error.response?.status === 400) {
          throw new Error(error.response.data?.error || 'Invalid request. Please check your image and try again.')
        }
        if (error.code === 'ECONNABORTED') {
          throw new Error('Request timed out. Please try again.')
        }
        throw new Error(error.response?.data?.error || 'Failed to process image. Please try again.')
      }
      throw new Error('Network error. Please check your connection and try again.')
    }
  }
}