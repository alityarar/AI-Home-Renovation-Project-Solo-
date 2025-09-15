"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.setupSecurity = setupSecurity;
const cors_1 = __importDefault(require("cors"));
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const helmet_1 = __importDefault(require("helmet"));
const pino_1 = __importDefault(require("pino"));
const logger = (0, pino_1.default)();
function setupSecurity(app) {
    app.use((0, helmet_1.default)({
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
    }));
    const corsOptions = {
        origin: process.env.NODE_ENV === 'production'
            ? ['https://your-domain.com']
            : ['http://localhost:3000', 'http://localhost:5173'],
        credentials: true,
        optionsSuccessStatus: 200,
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
        allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
    };
    app.use((0, cors_1.default)(corsOptions));
    const limiter = (0, express_rate_limit_1.default)({
        windowMs: 15 * 60 * 1000,
        max: process.env.NODE_ENV === 'production' ? 50 : 100,
        message: {
            error: 'Too many requests from this IP, please try again later.',
            retryAfter: '15 minutes'
        },
        standardHeaders: true,
        legacyHeaders: false,
        handler: (req, res) => {
            logger.warn({ ip: req.ip }, 'Rate limit exceeded');
            res.status(429).json({
                error: 'Too many requests from this IP, please try again later.',
                retryAfter: '15 minutes'
            });
        }
    });
    app.use(limiter);
    const aiLimiter = (0, express_rate_limit_1.default)({
        windowMs: 60 * 1000,
        max: process.env.NODE_ENV === 'production' ? 5 : 10,
        message: {
            error: 'Too many AI requests, please wait before trying again.',
            retryAfter: '1 minute'
        },
        standardHeaders: true,
        legacyHeaders: false,
        handler: (req, res) => {
            logger.warn({ ip: req.ip, path: req.path }, 'AI rate limit exceeded');
            res.status(429).json({
                error: 'Too many AI requests, please wait before trying again.',
                retryAfter: '1 minute'
            });
        }
    });
    app.use('/api/restyle', aiLimiter);
    logger.info('Security middleware configured successfully');
}
