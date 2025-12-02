import React from 'react'
import { Loader2 } from 'lucide-react'

export default function Loader() {
  return (
    <div className="bg-card rounded-lg border p-6">
      <div className="flex flex-col items-center justify-center py-12">
        <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
        <h3 className="text-lg font-medium mb-2">Generating your styled images...</h3>
        <p className="text-muted-foreground text-center max-w-md">
          This process may take 20-60 seconds. Our AI is carefully applying your chosen style 
          while preserving the room's structure and lighting.
        </p>
        <div className="mt-4 w-full max-w-xs bg-muted rounded-full h-2">
          <div className="bg-primary h-2 rounded-full animate-pulse" style={{ width: '60%' }}></div>
        </div>
      </div>
    </div>
  )
}