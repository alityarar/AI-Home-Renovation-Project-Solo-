import { create } from 'zustand'
import { RoomAnalysis } from '@/lib/api'

export type StyleKey = 'modern' | 'scandi' | 'industrial' | 'minimal' | 'boho'

export interface StyleOutput {
  dataUrl: string
  seed?: number
}

export interface ProcessingMetadata {
  provider: string
  processingTime: number
  styleApplied: string
  intensity: number
}

interface AppState {
  // Image upload state
  imageFile: File | null
  imagePreview: string | null
  
  // Style configuration
  selectedStyle: StyleKey | null
  intensity: number
  numOutputs: number
  aiProvider: 'fast' | 'smart'
  
  // AI capabilities
  intelligentAnalysisAvailable: boolean
  
  // Generation state
  loading: boolean
  error: string | null
  outputs: StyleOutput[]
  
  // Intelligent analysis results
  roomAnalysis: RoomAnalysis | null
  intelligentPrompt: string | null
  processingMetadata: ProcessingMetadata | null
  
  // Actions
  setImageFile: (file: File | null) => void
  setImagePreview: (preview: string | null) => void
  setSelectedStyle: (style: StyleKey | null) => void
  setIntensity: (intensity: number) => void
  setNumOutputs: (num: number) => void
  setAIProvider: (provider: 'fast' | 'smart') => void
  setIntelligentAnalysisAvailable: (available: boolean) => void
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
  setOutputs: (outputs: StyleOutput[]) => void
  setRoomAnalysis: (analysis: RoomAnalysis | null) => void
  setIntelligentPrompt: (prompt: string | null) => void
  setProcessingMetadata: (metadata: ProcessingMetadata | null) => void
  clearError: () => void
  reset: () => void
}

export const useAppStore = create<AppState>((set) => ({
  // Initial state
  imageFile: null,
  imagePreview: null,
  selectedStyle: null,
  intensity: 0.6,
  numOutputs: 3,
  aiProvider: 'fast',
  intelligentAnalysisAvailable: false,
  loading: false,
  error: null,
  outputs: [],
  roomAnalysis: null,
  intelligentPrompt: null,
  processingMetadata: null,
  
  // Actions
  setImageFile: (file) => set({ imageFile: file }),
  setImagePreview: (preview) => set({ imagePreview: preview }),
  setSelectedStyle: (style) => set({ selectedStyle: style }),
  setIntensity: (intensity) => set({ intensity }),
  setNumOutputs: (num) => set({ numOutputs: num }),
  setAIProvider: (provider) => set({ aiProvider: provider }),
  setIntelligentAnalysisAvailable: (available) => set({ intelligentAnalysisAvailable: available }),
  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),
  setOutputs: (outputs) => set({ outputs }),
  setRoomAnalysis: (analysis) => set({ roomAnalysis: analysis }),
  setIntelligentPrompt: (prompt) => set({ intelligentPrompt: prompt }),
  setProcessingMetadata: (metadata) => set({ processingMetadata: metadata }),
  clearError: () => set({ error: null }),
  reset: () => set({
    imageFile: null,
    imagePreview: null,
    selectedStyle: null,
    intensity: 0.6,
    numOutputs: 3,
    aiProvider: 'fast',
    loading: false,
    error: null,
    outputs: [],
    roomAnalysis: null,
    intelligentPrompt: null,
    processingMetadata: null
  })
}))