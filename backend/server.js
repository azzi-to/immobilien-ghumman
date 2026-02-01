const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

// Import routes
const authRoutes = require('./routes/auth.routes');
const propertyRoutes = require('./routes/property.routes');
const userRoutes = require('./routes/user.routes');
const uploadRoutes = require('./routes/upload.routes');
const contactRoutes = require('./routes/contact.routes');

// Initialize express app
const app = express();
const PORT = process.env.PORT || 3000;

// Security middleware
app.use(helmet());

// CORS configuration
app.use(cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:8080',
    credentials: true
}));

// Rate limiting
const limiter = rateLimit({
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000,
    max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100,
    message: 'Zu viele Anfragen von dieser IP, bitte versuchen Sie es später erneut.'
});
app.use('/api/', limiter);

// Body parsing middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Compression middleware
app.use(compression());

// Logging middleware
if (process.env.NODE_ENV === 'development') {
    app.use(morgan('dev'));
} else {
    app.use(morgan('combined'));
}

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/properties', propertyRoutes);
app.use('/api/users', userRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/contact', contactRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({ 
        status: 'OK', 
        message: 'Immobilien Ghumman API is running',
        timestamp: new Date().toISOString()
    });
});

// Root endpoint
app.get('/', (req, res) => {
    res.json({
        message: 'Willkommen zur Immobilien Ghumman API',
        version: '1.0.0',
        endpoints: {
            health: '/api/health',
            auth: '/api/auth',
            properties: '/api/properties',
            users: '/api/users',
            upload: '/api/upload',
            contact: '/api/contact'
        }
    });
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({
        error: 'Endpoint nicht gefunden',
        path: req.path
    });
});

// Global error handler
app.use((err, req, res, next) => {
    console.error('Error:', err);
    
    res.status(err.status || 500).json({
        error: err.message || 'Interner Serverfehler',
        ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    });
});

// Start server
app.listen(PORT, () => {
    console.log(`
    ╔═══════════════════════════════════════════════════╗
    ║                                                   ║
    ║   🏠 Immobilien Ghumman API Server               ║
    ║                                                   ║
    ║   Status: ✅ Running                             ║
    ║   Port: ${PORT}                                  ║
    ║   Environment: ${process.env.NODE_ENV || 'development'}          ║
    ║   URL: http://localhost:${PORT}                  ║
    ║                                                   ║
    ╚═══════════════════════════════════════════════════╝
    `);
});

// Graceful shutdown
process.on('SIGTERM', () => {
    console.log('SIGTERM signal received: closing HTTP server');
    server.close(() => {
        console.log('HTTP server closed');
        process.exit(0);
    });
});

module.exports = app;
