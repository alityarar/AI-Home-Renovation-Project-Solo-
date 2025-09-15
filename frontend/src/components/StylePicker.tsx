import React from 'react'
import { Button } from '@/components/ui/button'
import { useAppStore } from '@/store/useAppStore'
import { STYLE_PRESETS, StylePreset } from '@/lib/prompts'
import { Sparkles } from 'lucide-react'

interface StylePickerProps {
  onGenerate: () => void
  canGenerate: boolean
}

export default function StylePicker({ onGenerate, canGenerate }: StylePickerProps) {
  const { selectedStyle, setSelectedStyle, intensity, setIntensity, numOutputs, setNumOutputs } = useAppStore()

  const handleStyleSelect = (styleKey: StylePreset['key']) => {
    setSelectedStyle(styleKey)
  }

  return (
    <div className="bg-card rounded-lg border p-6">
      <h2 className="text-xl font-semibold mb-4">Choose Style</h2>
      
      {/* Style Buttons */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
        {STYLE_PRESETS.map((preset) => (
          <button
            key={preset.key}
            onClick={() => handleStyleSelect(preset.key)}
            className={`p-4 rounded-lg border text-left transition-all hover:shadow-md ${
              selectedStyle === preset.key
                ? 'border-primary bg-primary/10 shadow-md'
                : 'border-border bg-background hover:border-primary/50'
            }`}
          >
            <div className="flex items-center gap-3 mb-2">
              <span className="text-2xl">{preset.icon}</span>
              <span className="font-medium">{preset.name}</span>
            </div>
            <p className="text-sm text-muted-foreground">
              {preset.description}
            </p>
          </button>
        ))}
      </div>

      {/* Parameters */}
      <div className="space-y-4 mb-6">
        <div>
          <label className="text-sm font-medium mb-2 block">
            Style Intensity: {intensity}
          </label>
          <input
            type="range"
            min="0.3"
            max="0.8"
            step="0.1"
            value={intensity}
            onChange={(e) => setIntensity(parseFloat(e.target.value))}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
          />
          <div className="flex justify-between text-xs text-muted-foreground mt-1">
            <span>Subtle</span>
            <span>Strong</span>
          </div>
        </div>

        <div>
          <label className="text-sm font-medium mb-2 block">
            Number of Variations: {numOutputs}
          </label>
          <div className="flex gap-2">
            {[2, 3, 4].map((num) => (
              <Button
                key={num}
                variant={numOutputs === num ? "default" : "outline"}
                size="sm"
                onClick={() => setNumOutputs(num)}
              >
                {num}
              </Button>
            ))}
          </div>
        </div>
      </div>

      {/* Generate Button */}
      <Button
        onClick={onGenerate}
        disabled={!canGenerate}
        className="w-full"
        size="lg"
      >
        <Sparkles className="mr-2 h-5 w-5" />
        Generate Styled Images
      </Button>

      {!canGenerate && (
        <p className="text-sm text-muted-foreground text-center mt-2">
          Please upload an image and select a style
        </p>
      )}
    </div>
  )
}