import { Express } from 'express'
import cors from 'cors'
import rateLimit from 'express-rate-limit'
import helmet from 'helmet'
import pino from 'pino'

const logger = pino()

export function setupSecurity(app: Express): void {
  // Security headers
  app.use(helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        imgSrc: ["'self'", "data:", "blob:", "https:"],
        scriptSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        connectSrc: ["'self'", "https://api.replicate.com"]
      }
    }
  }))

  // CORS configuration
  const corsOptions = {
    origin: process.env.NODE_ENV === 'production' 
      ? ['https://your-domain.com'] // Replace with your production domain
      : ['http://localhost:3000', 'http://localhost:5173'], // Dev frontend URLs
    credentials: true,
    optionsSuccessStatus: 200,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
  }
  
  app.use(cors(corsOptions))

  // Rate limiting
  const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: process.env.NODE_ENV === 'production' ? 50 : 100, // Limit each IP
    message: {
      error: 'Too many requests from this IP, please try again later.',
      retryAfter: '15 minutes'
    },
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req, res) => {
      logger.warn({ ip: req.ip }, 'Rate limit exceeded')
      res.status(429).json({
        error: 'Too many requests from this IP, please try again later.',
        retryAfter: '15 minutes'
      })
    }
  })

  app.use(limiter)

  // Stricter rate limiting for AI endpoints
  const aiLimiter = rateLimit({
    windowMs: 60 * 1000, // 1 minute
    max: process.env.NODE_ENV === 'production' ? 5 : 10, // Very limited for AI calls
    message: {
      error: 'Too many AI requests, please wait before trying again.',
      retryAfter: '1 minute'
    },
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req, res) => {
      logger.warn({ ip: req.ip, path: req.path }, 'AI rate limit exceeded')
      res.status(429).json({
        error: 'Too many AI requests, please wait before trying again.',
        retryAfter: '1 minute'
      })
    }
  })

  // Apply stricter limits to AI endpoints
  app.use('/api/restyle', aiLimiter)

  logger.info('Security middleware configured successfully')
}