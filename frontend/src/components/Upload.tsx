import React, { useRef } from 'react'
import { Upload as UploadIcon, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useAppStore } from '@/store/useAppStore'

export default function Upload() {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { imageFile, imagePreview, setImageFile, setImagePreview, setError } = useAppStore()

  const handleFileSelect = (file: File) => {
    // Validate file type
    if (!file.type.match(/^image\/(jpeg|jpg|png)$/)) {
      setError('Please select a JPEG or PNG image file.')
      return
    }

    // Validate file size (10MB limit)
    if (file.size > 10 * 1024 * 1024) {
      setError('Image file must be smaller than 10MB.')
      return
    }

    setImageFile(file)

    // Create preview
    const reader = new FileReader()
    reader.onload = (e) => {
      setImagePreview(e.target?.result as string)
    }
    reader.readAsDataURL(file)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    const files = Array.from(e.dataTransfer.files)
    if (files.length > 0) {
      handleFileSelect(files[0])
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files && files.length > 0) {
      handleFileSelect(files[0])
    }
  }

  const clearImage = () => {
    setImageFile(null)
    setImagePreview(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const checkImageDimensions = (file: File) => {
    const img = new Image()
    img.onload = () => {
      const maxDimension = Math.max(img.width, img.height)
      if (maxDimension > 2048) {
        setError(`Image dimensions are ${img.width}x${img.height}. Images larger than 2048px on the longest side will be automatically resized.`)
      }
    }
    img.src = URL.createObjectURL(file)
  }

  React.useEffect(() => {
    if (imageFile) {
      checkImageDimensions(imageFile)
    }
  }, [imageFile])

  return (
    <div className="bg-card rounded-lg border p-6">
      <h2 className="text-xl font-semibold mb-4">Upload Image</h2>
      
      {!imagePreview ? (
        <div
          className="border-2 border-dashed border-border rounded-lg p-8 text-center cursor-pointer hover:border-primary/50 transition-colors"
          onDrop={handleDrop}
          onDragOver={(e) => e.preventDefault()}
          onClick={() => fileInputRef.current?.click()}
        >
          <UploadIcon className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
          <p className="text-lg font-medium mb-2">Drop your image here</p>
          <p className="text-muted-foreground mb-4">
            or click to browse files
          </p>
          <p className="text-sm text-muted-foreground">
            Supports JPEG and PNG files up to 10MB
          </p>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/jpg,image/png"
            onChange={handleFileChange}
            className="hidden"
          />
        </div>
      ) : (
        <div className="space-y-4">
          <div className="relative">
            <img
              src={imagePreview}
              alt="Preview"
              className="w-full h-64 object-cover rounded-lg"
            />
            <Button
              variant="destructive"
              size="icon"
              className="absolute top-2 right-2"
              onClick={clearImage}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <span>{imageFile?.name}</span>
            <span>{(imageFile?.size || 0 / 1024 / 1024).toFixed(2)}MB</span>
          </div>
        </div>
      )}
    </div>
  )
}