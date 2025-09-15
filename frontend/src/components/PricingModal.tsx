import React from 'react'
import { Button } from '@/components/ui/button'
import { X, Check } from 'lucide-react'

interface PricingModalProps {
  isOpen: boolean
  onClose: () => void
  usedPhotos?: number
  dailyLimit?: number
}

export default function PricingModal({ isOpen, onClose, usedPhotos = 0, dailyLimit = 10 }: PricingModalProps) {
  if (!isOpen) return null

  const plans = [
    {
      id: 'weekly',
      name: 'Weekly',
      price: '$4.99',
      duration: '7 days',
      popular: false,
      features: ['Unlimited photo generation', '24/7 support', 'HD quality exports']
    },
    {
      id: 'monthly', 
      name: 'Monthly',
      price: '$9.99',
      duration: '30 days',
      popular: true,
      savings: '50% savings vs weekly',
      features: ['Everything in Weekly', 'Priority processing', 'Advanced AI styles']
    },
    {
      id: 'yearly',
      name: 'Yearly', 
      price: '$99.99',
      duration: '365 days',
      popular: false,
      savings: '2 months FREE!',
      features: ['Everything in Monthly', 'Early access to new features', 'Premium support']
    }
  ]

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white p-6 rounded-t-2xl relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 bg-white/20 backdrop-blur-sm text-white p-2 rounded-full hover:bg-white/30 transition-all"
          >
            <X className="w-5 h-5" />
          </button>
          
          <div className="text-center">
            <h2 className="text-3xl font-bold mb-2">🚀 Upgrade to Premium</h2>
            <p className="text-purple-100 text-lg">
              You've used {usedPhotos}/{dailyLimit} photos today
            </p>
            <p className="text-purple-200 text-sm mt-2">
              Unlock unlimited photo generation with our premium plans
            </p>
          </div>
        </div>

        {/* Pricing Cards */}
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {plans.map((plan) => (
              <div
                key={plan.id}
                className={`relative border-2 rounded-2xl p-6 transition-all duration-200 ${
                  plan.popular
                    ? 'border-purple-500 bg-purple-50 shadow-lg scale-105'
                    : 'border-slate-200 bg-white hover:border-purple-300 hover:shadow-md'
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <span className="bg-gradient-to-r from-purple-500 to-blue-500 text-white px-4 py-1 rounded-full text-sm font-bold">
                      Most Popular
                    </span>
                  </div>
                )}

                <div className="text-center mb-6">
                  <h3 className="text-xl font-bold text-slate-900 mb-2">{plan.name}</h3>
                  <div className="text-3xl font-black text-slate-900 mb-1">{plan.price}</div>
                  <div className="text-sm text-slate-600">{plan.duration}</div>
                  {plan.savings && (
                    <div className="text-sm text-green-600 font-semibold mt-1">{plan.savings}</div>
                  )}
                </div>

                <ul className="space-y-3 mb-6">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-center gap-2 text-sm text-slate-700">
                      <Check className="w-4 h-4 text-green-500 flex-shrink-0" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>

                <Button
                  className={`w-full ${
                    plan.popular
                      ? 'bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700'
                      : 'bg-slate-600 hover:bg-slate-700'
                  }`}
                  onClick={() => {
                    // TODO: Handle subscription
                    console.log(`Selected plan: ${plan.id}`)
                  }}
                >
                  Get Started
                </Button>
              </div>
            ))}
          </div>

          {/* Footer */}
          <div className="text-center mt-8 text-sm text-slate-600">
            <p>✅ Cancel anytime • 💳 Secure payment • 🔒 No hidden fees</p>
          </div>
        </div>
      </div>
    </div>
  )
}