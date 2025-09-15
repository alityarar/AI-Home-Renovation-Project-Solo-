import React from 'react'
import { useAppStore } from '@/store/useAppStore'
import { useToast } from '@/components/ui/use-toast'
import { api } from '@/lib/api'
import Upload from '@/components/Upload'
import Gallery from '@/components/Gallery'
import Loader from '@/components/Loader'
import PricingModal from '@/components/PricingModal'
import AuthButtons from '@/components/AuthButtons'
import { STYLE_PRESETS } from '@/lib/prompts'

export default function Home() {
  const {
    imageFile,
    selectedStyle,
    intensity,
    numOutputs,
    aiProvider,
    intelligentAnalysisAvailable,
    loading,
    error,
    outputs,
    setLoading,
    setError,
    setOutputs,
    setRoomAnalysis,
    setIntelligentPrompt,
    setProcessingMetadata,
    setIntelligentAnalysisAvailable,
    clearError,
    setNumOutputs,
    setIntensity,
    setSelectedStyle,
    setAIProvider
  } = useAppStore()
  
  const { toast } = useToast()

  // New state for auth and pricing (Faz 1 - UI only)
  const [showPricingModal, setShowPricingModal] = React.useState(false)
  const [isLoggedIn, setIsLoggedIn] = React.useState(false)
  const [usedPhotos, setUsedPhotos] = React.useState(3) // Mock data for demo
  const dailyLimit = 10

  const handleSignIn = () => {
    console.log('Sign in clicked - TODO: Implement auth')
    // TODO: Implement sign in logic
  }

  const handleSignUp = () => {
    setShowPricingModal(true)
  }

  // Check AI health on component mount
  React.useEffect(() => {
    const checkAIHealth = async () => {
      try {
        const health = await api.checkAIHealth()
        setIntelligentAnalysisAvailable(health.intelligentAnalysis)
        
        if (health.intelligentAnalysis) {
          toast({
            title: "GPT-4 Vision Available",
            description: "Intelligent room analysis is enabled for better results!",
          })
        }
      } catch (error) {
        console.warn('Failed to check AI health:', error)
      }
    }

    checkAIHealth()
  }, [setIntelligentAnalysisAvailable, toast])

  React.useEffect(() => {
    if (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error,
      })
      clearError()
    }
  }, [error, toast, clearError])

  const handleGenerate = async () => {
    if (!imageFile || !selectedStyle) {
      setError('Please select an image and a style.')
      return
    }

    setLoading(true)
    setError(null)

    try {
      const result = await api.restyle({
        image: imageFile,
        styleKey: selectedStyle,
        intensity,
        numOutputs,
        aiProvider
      })
      
      setOutputs(result.images)
      setRoomAnalysis(result.analysis || null)
      setIntelligentPrompt(result.intelligentPrompt || null)
      setProcessingMetadata(result.metadata)

      // Show success toast with processing info
      toast({
        title: "Transformation Complete!",
        description: `Generated ${result.images.length} images using ${result.metadata.provider} in ${Math.round(result.metadata.processingTime / 1000)}s`,
      })

      // Show intelligent analysis results if available
      if (result.analysis && aiProvider === 'smart') {
        toast({
          title: "Room Analysis Complete",
          description: `Detected: ${result.analysis.roomType} with ${result.analysis.currentStyle} style`,
        })
      }
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred.')
    } finally {
      setLoading(false)
    }
  }

  const canGenerate = Boolean(imageFile && selectedStyle && !loading)

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-black">
        <Loader />
        {aiProvider === 'smart' && (
          <div className="absolute bottom-20 text-center text-white">
            <div className="text-sm opacity-75 mb-2">Using GPT-4 Vision for intelligent analysis...</div>
            <div className="text-xs opacity-50">This may take a bit longer for better results</div>
          </div>
        )}
      </div>
    )
  }

  if (outputs.length > 0) {
    return (
      <div className="h-screen bg-gradient-to-br from-slate-50 to-slate-100 overflow-y-auto">
        <div className="container mx-auto px-4 py-8">
          <Gallery />
          <div className="text-center mt-8">
            <button
              onClick={() => window.location.reload()}
              className="px-8 py-4 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-xl hover:from-purple-700 hover:to-blue-700 transition-all duration-300 transform hover:scale-105 font-semibold text-lg shadow-xl"
            >
              Generate New Styles
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black">
      <div className="flex flex-col">
        {/* Hero Section - Flexible Height */}
        <div className="relative bg-gradient-to-br from-black via-slate-900 to-purple-900 text-white" style={{ minHeight: '40vh' }}>
          <div className="absolute inset-0 opacity-20">
            <div className="w-full h-full bg-gradient-to-br from-purple-500/10 to-blue-500/10"></div>
          </div>
          
          {/* Auth Buttons - Top Right */}
          <div className="absolute top-6 right-6 z-10">
            <AuthButtons
              onSignIn={handleSignIn}
              onSignUp={handleSignUp}
              usedPhotos={usedPhotos}
              dailyLimit={dailyLimit}
              isLoggedIn={isLoggedIn}
            />
          </div>
          
          <div className="relative flex items-center py-12">
            <div className="container mx-auto px-6">
              <div className="text-center max-w-4xl mx-auto">
                {/* Brand */}
                <div className="mb-6">
                  <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-purple-500 to-blue-600 rounded-full flex items-center justify-center text-2xl border-4 border-white/20">
                    🏠
                  </div>
                  <h1 className="text-4xl md:text-6xl font-black tracking-tight mb-2">
                    AI Home Styler
                  </h1>
                  <p className="text-purple-200 text-sm tracking-[0.2em] font-semibold">
                    AI-POWERED INTERIOR DESIGN
                  </p>
                </div>

                {/* Hero Content */}
                <h2 className="text-2xl md:text-4xl font-bold mb-4 leading-tight">
                  Transform Any Room Into Your{' '}
                  <span className="bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
                    Dream Space
                  </span>
                </h2>
                
                <p className="text-lg text-slate-300 mb-6 max-w-2xl mx-auto">
                  Professional interior design powered by advanced AI technology. 
                  Upload your room photo and get instant transformations.
                </p>

                {/* AI Capabilities Badge */}
                {intelligentAnalysisAvailable && (
                  <div className="inline-flex items-center gap-2 bg-gradient-to-r from-green-500/20 to-blue-500/20 border border-green-400/30 rounded-full px-4 py-2 mb-4">
                    <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                    <span className="text-sm text-green-300 font-medium">GPT-4 Vision Enabled</span>
                  </div>
                )}

                {/* Stats - Horizontal Scroll */}
                <div className="flex justify-center gap-6 overflow-x-auto pb-2">
                  <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl px-4 py-3 flex-shrink-0">
                    <div className="text-sm text-slate-300">Processing Time</div>
                    <div className="font-bold">~30 seconds</div>
                  </div>
                  <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl px-4 py-3 flex-shrink-0">
                    <div className="text-sm text-slate-300">AI Models</div>
                    <div className="font-bold">SDXL + GPT-4</div>
                  </div>
                  <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl px-4 py-3 flex-shrink-0">
                    <div className="text-sm text-slate-300">Style Options</div>
                    <div className="font-bold">5+ Styles</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content - Flexible Height */}
        <div className="bg-white">
          {/* How It Works - Compact */}
          <div className="py-8 px-6">
            <div className="text-center mb-8">
              <h3 className="text-2xl font-bold text-slate-900 mb-2">How It Works</h3>
              <p className="text-slate-600">Three simple steps to transform your space</p>
            </div>
            
            {/* Steps Grid - Responsive */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
              {[
                { number: '01', icon: '📱', title: 'Upload', desc: 'Take or upload a photo of your room' },
                { number: '02', icon: '🎨', title: 'Customize', desc: 'Choose from professional design styles' },
                { number: '03', icon: '✨', title: 'Transform', desc: 'Get instant professional results' },
              ].map((step, index) => (
                <div key={index} className="text-center">
                  <div className="w-16 h-16 mx-auto mb-3 bg-gradient-to-br from-purple-500 to-blue-600 rounded-full flex items-center justify-center text-2xl text-white">
                    {step.icon}
                  </div>
                  <div className="text-sm text-purple-600 font-bold mb-1">{step.number}</div>
                  <h4 className="font-semibold text-slate-900 mb-1">{step.title}</h4>
                  <p className="text-sm text-slate-600">{step.desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Main Interface */}
          <div className="px-6 pb-12">
            <div className="max-w-6xl mx-auto space-y-8">
              {/* Upload Section */}
              <div className="bg-gradient-to-br from-slate-50 to-slate-100 rounded-2xl p-6 border border-slate-200 relative">
                <h2 className="text-xl font-bold text-slate-900 mb-6 flex items-center">
                  <span className="mr-2">📸</span>
                  Upload Your Room
                </h2>
                
                <Upload />

                {/* Intelligent Analysis Toggle */}
                {intelligentAnalysisAvailable && (
                  <div className="absolute top-6 right-6">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={aiProvider === 'smart'}
                        onChange={(e) => setAIProvider(e.target.checked ? 'smart' : 'fast')}
                        className="rounded border-gray-300"
                      />
                      <span className="text-sm font-medium text-slate-700">
                        GPT-4 Analysis
                      </span>
                      <div className="group relative">
                        <span className="text-xs text-slate-500 cursor-help">ℹ️</span>
                        <div className="invisible group-hover:visible absolute bottom-full right-0 mb-2 px-3 py-2 bg-slate-800 text-white text-xs rounded-lg whitespace-nowrap">
                          Analyzes your room for better style suggestions
                        </div>
                      </div>
                    </label>
                  </div>
                )}
              </div>
              
              {/* Style Selection Section */}
              <div className="bg-gradient-to-br from-slate-50 to-slate-100 rounded-2xl p-6 border border-slate-200">
                <h2 className="text-xl font-bold text-slate-900 mb-6 flex items-center">
                  <span className="mr-2">🎨</span>
                  Choose Your Style
                </h2>
                
                {/* Style Preset Grid */}
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
                  {STYLE_PRESETS.map((preset) => (
                    <button
                      key={preset.key}
                      onClick={() => setSelectedStyle(preset.key)}
                      className={`p-4 rounded-xl border-2 transition-all duration-200 text-left ${
                        selectedStyle === preset.key
                          ? 'border-purple-500 bg-purple-50 shadow-lg'
                          : 'border-slate-200 bg-white hover:border-purple-300 hover:shadow-md'
                      }`}
                    >
                      <div className="text-3xl mb-2">{preset.icon}</div>
                      <div className="font-semibold text-sm text-slate-900">{preset.name}</div>
                      <div className="text-xs text-slate-600 mt-1">{preset.description}</div>
                    </button>
                  ))}
                </div>

                {/* AI Provider Selection */}
                {selectedStyle && (
                  <div className="mb-6">
                    <label className="block text-sm font-medium text-slate-700 mb-3">
                      Choose AI Processing Mode
                    </label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Fast Mode */}
                      <button
                        onClick={() => setAIProvider('fast')}
                        className={`p-4 rounded-xl border-2 transition-all duration-200 text-left ${
                          aiProvider === 'fast'
                            ? 'border-blue-500 bg-blue-50 shadow-lg'
                            : 'border-slate-200 bg-white hover:border-blue-300 hover:shadow-md'
                        }`}
                      >
                        <div className="flex items-center gap-3 mb-2">
                          <div className="text-2xl">🚀</div>
                          <div>
                            <div className="font-semibold text-sm text-slate-900">Fast Mode</div>
                            <div className="text-xs text-blue-600">~15-20 seconds</div>
                          </div>
                        </div>
                        <div className="text-xs text-slate-600">
                          Direct SDXL transformation with optimized prompts
                        </div>
                      </button>

                      {/* Smart Mode */}
                      <button
                        onClick={() => setAIProvider('smart')}
                        disabled={!intelligentAnalysisAvailable}
                        className={`p-4 rounded-xl border-2 transition-all duration-200 text-left ${
                          !intelligentAnalysisAvailable
                            ? 'border-slate-200 bg-slate-50 opacity-50 cursor-not-allowed'
                            : aiProvider === 'smart'
                              ? 'border-purple-500 bg-purple-50 shadow-lg'
                              : 'border-slate-200 bg-white hover:border-purple-300 hover:shadow-md'
                        }`}
                      >
                        <div className="flex items-center gap-3 mb-2">
                          <div className="text-2xl">🧠</div>
                          <div>
                            <div className="font-semibold text-sm text-slate-900">Smart Mode</div>
                            <div className="text-xs text-purple-600">
                              {intelligentAnalysisAvailable ? '~30-60 seconds' : 'Unavailable'}
                            </div>
                          </div>
                        </div>
                        <div className="text-xs text-slate-600">
                          {intelligentAnalysisAvailable 
                            ? 'GPT-4 Vision analyzes your room + SDXL transformation'
                            : 'Requires OpenAI API configuration'
                          }
                        </div>
                      </button>
                    </div>
                  </div>
                )}

                {/* Controls */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Style Intensity: {Math.round(intensity * 100)}%
                    </label>
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.1"
                      value={intensity}
                      onChange={(e) => setIntensity(parseFloat(e.target.value))}
                      className="w-full"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Number of Outputs
                    </label>
                    <select
                      value={numOutputs}
                      onChange={(e) => setNumOutputs(parseInt(e.target.value))}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    >
                      <option value={1}>1 Image</option>
                      <option value={2}>2 Images</option>
                      <option value={3}>3 Images</option>
                      <option value={4}>4 Images</option>
                      <option value={5}>5 Images</option>
                    </select>
                  </div>

                  <div className="flex items-end">
                    <button
                      onClick={handleGenerate}
                      disabled={!canGenerate}
                      className={`w-full px-6 py-3 rounded-xl font-semibold text-white transition-all duration-300 ${
                        canGenerate
                          ? 'bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 transform hover:scale-105 shadow-xl'
                          : 'bg-slate-400 cursor-not-allowed'
                      }`}
                    >
                      {aiProvider === 'smart' ? '🧠 Smart Generate' : '✨ Generate'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Pricing Modal */}
      <PricingModal
        isOpen={showPricingModal}
        onClose={() => setShowPricingModal(false)}
        usedPhotos={usedPhotos}
        dailyLimit={dailyLimit}
      />
    </div>
  )
}