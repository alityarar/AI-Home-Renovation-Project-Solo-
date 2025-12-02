import React from 'react'
import { useAppStore } from '@/store/useAppStore'
import { RoomAnalysis } from '@/lib/api'

interface RoomAnalysisDisplayProps {
  analysis: RoomAnalysis
  intelligentPrompt?: string
}

export default function RoomAnalysisDisplay({ analysis, intelligentPrompt }: RoomAnalysisDisplayProps) {
  const [isExpanded, setIsExpanded] = React.useState(false)

  return (
    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-6 mb-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white">
            🧠
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-900">AI Room Analysis</h3>
            <p className="text-sm text-blue-600">Powered by GPT-4 Vision</p>
          </div>
        </div>
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="text-blue-600 hover:text-blue-800 transition-colors"
        >
          {isExpanded ? '▼' : '▶'}
        </button>
      </div>

      {/* Quick Summary */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="bg-white/60 rounded-lg p-3">
          <div className="text-sm text-slate-600 mb-1">Room Type</div>
          <div className="font-semibold text-slate-900 capitalize">{analysis.roomType}</div>
        </div>
        <div className="bg-white/60 rounded-lg p-3">
          <div className="text-sm text-slate-600 mb-1">Current Style</div>
          <div className="font-semibold text-slate-900 capitalize">{analysis.currentStyle}</div>
        </div>
      </div>

      {/* Expanded Details */}
      {isExpanded && (
        <div className="space-y-4">
          {/* Color Palette */}
          <div>
            <h4 className="font-semibold text-slate-900 mb-2">Detected Colors</h4>
            <div className="flex flex-wrap gap-2">
              {analysis.colorPalette.map((color, index) => (
                <span
                  key={index}
                  className="px-3 py-1 bg-white/80 rounded-full text-sm text-slate-700 border border-slate-200"
                >
                  {color}
                </span>
              ))}
            </div>
          </div>

          {/* Furniture */}
          <div>
            <h4 className="font-semibold text-slate-900 mb-2">Furniture Detected</h4>
            <div className="flex flex-wrap gap-2">
              {analysis.furniture.map((item, index) => (
                <span
                  key={index}
                  className="px-3 py-1 bg-white/80 rounded-full text-sm text-slate-700 border border-slate-200"
                >
                  {item}
                </span>
              ))}
            </div>
          </div>

          {/* Lighting */}
          <div>
            <h4 className="font-semibold text-slate-900 mb-2">Lighting Assessment</h4>
            <p className="text-sm text-slate-700 bg-white/60 rounded-lg p-3">{analysis.lighting}</p>
          </div>

          {/* Suggestions */}
          <div>
            <h4 className="font-semibold text-slate-900 mb-2">AI Suggestions</h4>
            <ul className="space-y-2">
              {analysis.suggestions.map((suggestion, index) => (
                <li key={index} className="flex items-start gap-2 text-sm text-slate-700">
                  <span className="text-blue-500 mt-1">•</span>
                  <span>{suggestion}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Improvements */}
          <div>
            <h4 className="font-semibold text-slate-900 mb-2">Areas for Improvement</h4>
            <ul className="space-y-2">
              {analysis.improvements.map((improvement, index) => (
                <li key={index} className="flex items-start gap-2 text-sm text-slate-700">
                  <span className="text-amber-500 mt-1">⚠</span>
                  <span>{improvement}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Intelligent Prompt */}
          {intelligentPrompt && (
            <div>
              <h4 className="font-semibold text-slate-900 mb-2">AI-Generated Style Prompt</h4>
              <div className="bg-white/60 rounded-lg p-3 text-sm text-slate-700 italic">
                "{intelligentPrompt}"
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}