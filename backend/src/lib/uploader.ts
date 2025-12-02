import multer from 'multer'
import { Request, Response, NextFunction } from 'express'

export interface FileValidationResult {
  isValid: boolean
  error?: string
}

// Configure multer for file uploads
export const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true)
    } else {
      cb(new Error('Only image files are allowed') as any, false)
    }
  }
})

export const validateImageFile = (file: Express.Multer.File): FileValidationResult => {
  // Check file size
  if (file.size > 10 * 1024 * 1024) {
    return { isValid: false, error: 'File size must be less than 10MB' }
  }

  // Check MIME type
  const allowedMimeTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
  if (!allowedMimeTypes.includes(file.mimetype)) {
    return { isValid: false, error: 'Only JPEG, PNG, and WebP images are allowed' }
  }

  // Check file extension
  const allowedExtensions = ['.jpg', '.jpeg', '.png', '.webp']
  const fileExtension = file.originalname.toLowerCase().substring(file.originalname.lastIndexOf('.'))
  if (!allowedExtensions.includes(fileExtension)) {
    return { isValid: false, error: 'Invalid file extension' }
  }

  return { isValid: true }
}

export const handleUploadError = (error: any, req: Request, res: Response, next: NextFunction) => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ error: 'File too large. Maximum size is 10MB.' })
    }
    return res.status(400).json({ error: 'File upload error: ' + error.message })
  }
  
  if (error.message === 'Only image files are allowed') {
    return res.status(400).json({ error: 'Only image files are allowed' })
  }

  next(error)
}