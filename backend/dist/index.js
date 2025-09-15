"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const dotenv_1 = __importDefault(require("dotenv"));
const cors_1 = __importDefault(require("cors"));
const pino_1 = __importDefault(require("pino"));
const security_js_1 = require("./lib/security.js");
const aiProviders_js_1 = require("./lib/aiProviders.js");
const restyle_js_1 = __importDefault(require("./routes/restyle.js"));
dotenv_1.default.config();
const logger = (0, pino_1.default)({
    transport: {
        target: 'pino-pretty',
        options: {
            colorize: true
        }
    }
});
const app = (0, express_1.default)();
const PORT = process.env.PORT || 3001;
const corsOptions = {
    origin: [
        'http://localhost:5173',
        'http://localhost:3000',
        'http://localhost:19006',
        'exp://192.168.1.*',
        'exp://localhost:19000',
        /^exp:\/\/.*/,
        /^https?:\/\/.*\.expo\.dev$/,
        '*'
    ],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
};
app.use((0, cors_1.default)(corsOptions));
app.use(express_1.default.json({ limit: '10mb' }));
app.use(express_1.default.urlencoded({ extended: true, limit: '10mb' }));
(0, security_js_1.setupSecurity)(app);
app.get('/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});
app.get('/api/test-replicate', async (req, res) => {
    try {
        const isConnected = await (0, aiProviders_js_1.testReplicateAuth)();
        res.json({
            connected: isConnected,
            message: isConnected ? 'Replicate API is working' : 'Replicate API connection failed'
        });
    }
    catch (error) {
        logger.error({ error }, 'Replicate test failed');
        res.status(500).json({
            connected: false,
            message: 'Failed to test Replicate connection'
        });
    }
});
app.use('/api/restyle', restyle_js_1.default);
app.use((error, req, res, next) => {
    logger.error({ error: error.message, stack: error.stack }, 'Unhandled error');
    res.status(500).json({ error: 'Internal server error' });
});
app.use('*', (req, res) => {
    res.status(404).json({ message: 'Route not found' });
});
app.listen(PORT, () => {
    logger.info(`🚀 Server running on port ${PORT}`);
    logger.info(`🔒 CORS enabled for: ${JSON.stringify(corsOptions.origin)}`);
    logger.info(`📁 Max upload size: 10MB`);
});
