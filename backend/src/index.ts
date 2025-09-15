import express from 'express'
import dotenv from 'dotenv'
import cors from 'cors'
import pino from 'pino'
import { setupSecurity } from './lib/security.js'
import { testReplicateAuth } from './lib/aiProviders.js'
import restyleRouter from './routes/restyle.js'

// Load environment variables
dotenv.config()

const logger = pino({
  transport: {
    target: 'pino-pretty',
    options: {
      colorize: true
    }
  }
})

const app = express()
const PORT = process.env.PORT || 3001

// Configure CORS for mobile app
const corsOptions = {
  origin: [
    'http://localhost:5173', // Web frontend
    'http://localhost:3000', // Alternative web port
    'http://localhost:19006', // Expo web
    'exp://192.168.1.*', // Expo mobile on local network
    'exp://localhost:19000', // Expo mobile localhost
    /^exp:\/\/.*/, // Any Expo URL
    /^https?:\/\/.*\.expo\.dev$/, // Expo tunnel URLs
    '*' // Allow all origins for mobile development
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}

app.use(cors(corsOptions))

// Parse JSON bodies first
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true, limit: '10mb' }))

// Setup security middleware (this will override the CORS above with its own config)
setupSecurity(app)

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
})

// Test Replicate connection endpoint
app.get('/api/test-replicate', async (req, res) => {
  try {
    const isConnected = await testReplicateAuth()
    res.json({ 
      connected: isConnected,
      message: isConnected ? 'Replicate API is working' : 'Replicate API connection failed'
    })
  } catch (error) {
    logger.error({ error }, 'Replicate test failed')
    res.status(500).json({ 
      connected: false, 
      message: 'Failed to test Replicate connection' 
    })
  }
})

// API routes
app.use('/api/restyle', restyleRouter)

// Global error handler
app.use((error: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  logger.error({ error: error.message, stack: error.stack }, 'Unhandled error')
  res.status(500).json({ error: 'Internal server error' })
})

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ message: 'Route not found' })
})

app.listen(PORT, () => {
  logger.info(`🚀 Server running on port ${PORT}`)
  logger.info(`🔒 CORS enabled for: ${JSON.stringify(corsOptions.origin)}`)
  logger.info(`📁 Max upload size: 10MB`)
})