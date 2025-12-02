import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { useAppStore } from '@/store/useAppStore'
import { Download, RotateCcw, X, Share2, ZoomIn } from 'lucide-react'
import RoomAnalysisDisplay from './RoomAnalysisDisplay'

export default function Gallery() {
  const { 
    outputs, 
    selectedStyle, 
    intensity, 
    imagePreview,
    roomAnalysis,
    intelligentPrompt,
    processingMetadata
  } = useAppStore()
  const [selectedImageModal, setSelectedImageModal] = useState<string | null>(null)

  const handleDownload = (dataUrl: string, index: number) => {
    const link = document.createElement('a')
    link.href = dataUrl
    link.download = `styled-room-${selectedStyle}-${index + 1}.jpg`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const handleShare = async (dataUrl: string) => {
    if (navigator.share) {
      try {
        // Convert data URL to blob
        const response = await fetch(dataUrl)
        const blob = await response.blob()
        const file = new File([blob], `styled-room-${selectedStyle}.jpg`, { type: 'image/jpeg' })
        
        await navigator.share({
          title: 'AI Styled Room',
          text: `Check out my ${selectedStyle} styled room!`,
          files: [file]
        })
      } catch (error) {
        console.log('Error sharing:', error)
      }
    } else {
      // Fallback: copy to clipboard or download
      handleDownload(dataUrl, 0)
    }
  }

  const openImageModal = (dataUrl: string) => {
    setSelectedImageModal(dataUrl)
  }

  const closeImageModal = () => {
    setSelectedImageModal(null)
  }

  if (outputs.length === 0) return null

  return (
    <>
      {/* Header Section */}
      <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-2xl p-8 mb-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold mb-2">🎉 Your Styled Room is Ready!</h1>
          <p className="text-purple-100 text-lg">
            AI transformed your space with <span className="font-semibold capitalize">{selectedStyle}</span> style
          </p>
          <div className="flex justify-center gap-6 mt-4 text-sm">
            <span className="bg-white/20 px-3 py-1 rounded-full">
              Intensity: {Math.round(intensity * 100)}%
            </span>
            <span className="bg-white/20 px-3 py-1 rounded-full">
              {outputs.length} Variations
            </span>
            {processingMetadata && (
              <span className="bg-white/20 px-3 py-1 rounded-full">
                {processingMetadata.provider}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Room Analysis Display - Only shown if analysis is available */}
      {roomAnalysis && (
        <RoomAnalysisDisplay 
          analysis={roomAnalysis} 
          intelligentPrompt={intelligentPrompt || undefined}
        />
      )}

      {/* Before & After Comparison */}
      <div className="grid lg:grid-cols-2 gap-8 mb-8">
        {/* Original Image */}
        {imagePreview && (
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-lg">
            <h3 className="text-xl font-bold text-slate-900 mb-4 flex items-center">
              <span className="w-8 h-8 bg-slate-500 rounded-lg flex items-center justify-center text-white text-sm mr-3">📷</span>
              Original Photo
            </h3>
            <div className="relative group cursor-pointer" onClick={() => openImageModal(imagePreview)}>
              <img
                src={imagePreview}
                alt="Original room"
                className="w-full h-64 object-cover rounded-xl border-2 border-slate-100"
              />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all rounded-xl flex items-center justify-center">
                <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                  <ZoomIn className="w-8 h-8 text-white" />
                </div>
              </div>
              <div className="absolute top-3 right-3 bg-black/50 text-white text-xs px-3 py-1 rounded-full">
                Click to enlarge
              </div>
            </div>
          </div>
        )}

        {/* Style Info */}
        <div className="bg-gradient-to-br from-slate-50 to-slate-100 rounded-2xl p-6 border border-slate-200">
          <h3 className="text-xl font-bold text-slate-900 mb-4 flex items-center">
            <span className="w-8 h-8 bg-purple-500 rounded-lg flex items-center justify-center text-white text-sm mr-3">🎨</span>
            Style Applied
          </h3>
          <div className="space-y-4">
            <div className="bg-white rounded-xl p-4 border">
              <div className="text-2xl mb-2 capitalize font-bold text-slate-800">{selectedStyle}</div>
              <div className="text-slate-600">Professional interior design transformation</div>
              {processingMetadata && (
                <div className="text-sm text-slate-500 mt-2">
                  Generated in {Math.round(processingMetadata.processingTime / 1000)}s using {processingMetadata.provider}
                </div>
              )}
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white rounded-lg p-3 text-center border">
                <div className="text-lg font-bold text-purple-600">{Math.round(intensity * 100)}%</div>
                <div className="text-xs text-slate-500">Intensity</div>
              </div>
              <div className="bg-white rounded-lg p-3 text-center border">
                <div className="text-lg font-bold text-blue-600">{outputs.length}</div>
                <div className="text-xs text-slate-500">Variations</div>
              </div>
            </div>
            {roomAnalysis && (
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-3 border border-blue-200">
                <div className="flex items-center gap-2 text-sm">
                  <span className="text-blue-600">🧠</span>
                  <span className="font-medium text-blue-800">Enhanced with GPT-4 Vision Analysis</span>
                </div>
                <div className="text-xs text-blue-600 mt-1">
                  Room analysis enabled for better style matching
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Generated Results */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-lg">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-slate-900 flex items-center">
            <span className="w-8 h-8 bg-gradient-to-r from-purple-500 to-blue-500 rounded-lg flex items-center justify-center text-white text-sm mr-3">✨</span>
            AI Generated Results
          </h2>
          <Button
            variant="outline"
            size="sm"
            onClick={() => window.location.reload()}
            className="flex items-center gap-2 hover:bg-purple-50"
          >
            <RotateCcw className="h-4 w-4" />
            Generate New
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {outputs.map((output, index) => (
            <div key={index} className="group relative">
              <div className="bg-gradient-to-br from-slate-50 to-white rounded-xl p-3 border-2 border-slate-100 hover:border-purple-200 transition-all shadow-sm hover:shadow-lg">
                <div className="relative cursor-pointer" onClick={() => openImageModal(output.dataUrl)}>
                  <img
                    src={output.dataUrl}
                    alt={`Styled room ${index + 1}`}
                    className="w-full h-48 object-cover rounded-lg"
                  />
                  
                  {/* Hover Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-all rounded-lg flex items-end justify-center pb-4">
                    <div className="flex gap-2">
                      <button className="bg-white/20 backdrop-blur-sm text-white p-2 rounded-full hover:bg-white/30 transition-all">
                        <ZoomIn className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Image Number Badge */}
                  <div className="absolute top-2 left-2 bg-gradient-to-r from-purple-500 to-blue-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                    #{index + 1}
                  </div>

                  {/* Tap to enlarge hint */}
                  <div className="absolute top-2 right-2 bg-black/50 text-white text-xs px-2 py-1 rounded-full opacity-0 group-hover:opacity-100 transition-all">
                    Click to enlarge
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2 mt-3">
                  <Button
                    size="sm"
                    onClick={() => handleDownload(output.dataUrl, index)}
                    className="flex-1 flex items-center gap-2 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                  >
                    <Download className="h-3 w-3" />
                    Download
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleShare(output.dataUrl)}
                    className="flex items-center gap-2 hover:bg-blue-50"
                  >
                    <Share2 className="h-3 w-3" />
                    Share
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Full Screen Image Modal */}
      {selectedImageModal && (
        <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4">
          <div className="relative max-w-7xl max-h-full">
            <img
              src={selectedImageModal}
              alt="Full size styled room"
              className="max-w-full max-h-full object-contain rounded-lg"
            />
            
            {/* Close Button */}
            <button
              onClick={closeImageModal}
              className="absolute top-4 right-4 bg-white/20 backdrop-blur-sm text-white p-2 rounded-full hover:bg-white/30 transition-all"
            >
              <X className="w-6 h-6" />
            </button>

            {/* Modal Action Buttons */}
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-4">
              <Button
                onClick={() => {
                  const index = outputs.findIndex(o => o.dataUrl === selectedImageModal)
                  handleDownload(selectedImageModal, index >= 0 ? index : 0)
                }}
                className="flex items-center gap-2 bg-white/20 backdrop-blur-sm text-white hover:bg-white/30 border-white/30"
                variant="outline"
              >
                <Download className="h-4 w-4" />
                Download
              </Button>
              <Button
                onClick={() => handleShare(selectedImageModal)}
                className="flex items-center gap-2 bg-white/20 backdrop-blur-sm text-white hover:bg-white/30 border-white/30"
                variant="outline"
              >
                <Share2 className="h-4 w-4" />
                Share
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}