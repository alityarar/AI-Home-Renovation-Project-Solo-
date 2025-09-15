import React from 'react'
import { Button } from '@/components/ui/button'
import { Crown, LogIn } from 'lucide-react'

interface AuthButtonsProps {
  onSignIn: () => void
  onSignUp: () => void
  usedPhotos?: number
  dailyLimit?: number
  isLoggedIn?: boolean
  userEmail?: string
}

export default function AuthButtons({ 
  onSignIn, 
  onSignUp, 
  usedPhotos = 0, 
  dailyLimit = 10, 
  isLoggedIn = false,
  userEmail 
}: AuthButtonsProps) {
  if (isLoggedIn) {
    return (
      <div className="flex items-center gap-3">
        <div className="text-sm text-slate-600">
          Welcome, {userEmail}
        </div>
        <Button variant="outline" size="sm">
          Account
        </Button>
      </div>
    )
  }

  return (
    <div className="flex items-center gap-3">
      {/* Daily Limit Indicator */}
      <div className="hidden sm:flex items-center gap-2 bg-slate-100 rounded-full px-3 py-1 text-sm">
        <span className="text-slate-600">Today:</span>
        <span className={`font-semibold ${usedPhotos >= dailyLimit ? 'text-red-600' : 'text-slate-900'}`}>
          {usedPhotos}/{dailyLimit}
        </span>
      </div>

      {/* Sign In Button */}
      <Button 
        variant="ghost" 
        size="sm"
        onClick={onSignIn}
        className="text-slate-600 hover:text-slate-900"
      >
        <LogIn className="w-4 h-4 mr-1" />
        Sign In
      </Button>

      {/* Upgrade Button */}
      <Button 
        size="sm"
        onClick={onSignUp}
        className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-semibold"
      >
        <Crown className="w-4 h-4 mr-1" />
        Unlimited Access
      </Button>
    </div>
  )
}