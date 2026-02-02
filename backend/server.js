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

// Initialize database tables
async function initializeTables() {
    const { query } = require('./config/database');
    const bcrypt = require('bcryptjs');

    try {
        console.log('🔄 Checking/Creating database tables...');

        // Create users table
        await query(`
            CREATE TABLE IF NOT EXISTS users (
                id INT AUTO_INCREMENT PRIMARY KEY,
                username VARCHAR(50) UNIQUE NOT NULL,
                email VARCHAR(100) UNIQUE NOT NULL,
                password VARCHAR(255) NOT NULL,
                full_name VARCHAR(100),
                role ENUM('admin', 'manager', 'agent', 'user') DEFAULT 'user',
                status ENUM('active', 'inactive', 'suspended') DEFAULT 'active',
                phone VARCHAR(20),
                avatar_url VARCHAR(255),
                last_login DATETIME,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
            )
        `);
        console.log('✅ Users table ready');

        // Create properties table
        await query(`
            CREATE TABLE IF NOT EXISTS properties (
                id INT AUTO_INCREMENT PRIMARY KEY,
                title VARCHAR(200) NOT NULL,
                type ENUM('wohnung', 'haus', 'gewerbe', 'grundstück') DEFAULT 'wohnung',
                offer_type ENUM('miete', 'kauf') DEFAULT 'miete',
                price DECIMAL(12, 2) NOT NULL,
                size DECIMAL(8, 2),
                rooms INT,
                bathrooms INT DEFAULT 1,
                year_built INT,
                location VARCHAR(255),
                address VARCHAR(255),
                zip_code VARCHAR(10),
                city VARCHAR(100),
                description TEXT,
                features JSON,
                status ENUM('available', 'reserved', 'sold', 'rented') DEFAULT 'available',
                featured BOOLEAN DEFAULT FALSE,
                views INT DEFAULT 0,
                primary_image VARCHAR(500),
                images JSON,
                user_id INT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
            )
        `);
        console.log('✅ Properties table ready');

        // Create property_images table
        await query(`
            CREATE TABLE IF NOT EXISTS property_images (
                id INT AUTO_INCREMENT PRIMARY KEY,
                property_id INT NOT NULL,
                image_url VARCHAR(500) NOT NULL,
                thumbnail_url VARCHAR(500),
                cloudinary_id VARCHAR(255),
                is_primary BOOLEAN DEFAULT FALSE,
                display_order INT DEFAULT 0,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);
        console.log('✅ Property images table ready');

        // Create contact_requests table
        await query(`
            CREATE TABLE IF NOT EXISTS contact_requests (
                id INT AUTO_INCREMENT PRIMARY KEY,
                property_id INT,
                name VARCHAR(100) NOT NULL,
                email VARCHAR(100) NOT NULL,
                phone VARCHAR(20),
                message TEXT,
                status ENUM('new', 'read', 'replied', 'archived') DEFAULT 'new',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);
        console.log('✅ Contact requests table ready');

        // Admin credentials aus Umgebungsvariablen (sicher für Produktion)
        const ADMIN_USERNAME = process.env.ADMIN_USERNAME || 'NG-admin';
        const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD; // MUSS in Railway gesetzt werden!
        const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@immobilienghumman.de';

        // Sicherheitscheck: Passwort muss gesetzt sein
        if (!ADMIN_PASSWORD) {
            console.warn('⚠️ WARNUNG: ADMIN_PASSWORD nicht gesetzt! Admin-User wird nicht erstellt/aktualisiert.');
            console.warn('   Bitte ADMIN_PASSWORD als Umgebungsvariable setzen.');
            return; // Ohne Passwort keinen Admin erstellen
        }

        // Check if new admin user exists, create/update if needed
        const adminExists = await query('SELECT id, username FROM users WHERE username = ?', [ADMIN_USERNAME]);

        if (adminExists.length === 0) {
            // Check if old admin exists and delete it
            await query('DELETE FROM users WHERE username = ?', ['admin']);

            const hashedPassword = await bcrypt.hash(ADMIN_PASSWORD, 12); // Stärkerer Hash mit 12 Runden
            await query(
                'INSERT INTO users (username, email, password, role, full_name, status) VALUES (?, ?, ?, ?, ?, ?)',
                [ADMIN_USERNAME, ADMIN_EMAIL, hashedPassword, 'admin', 'Administrator', 'active']
            );
            console.log(`✅ Admin user created (username: ${ADMIN_USERNAME})`);
        } else {
            // Update password if admin exists (ensures password is current)
            const hashedPassword = await bcrypt.hash(ADMIN_PASSWORD, 12);
            await query('UPDATE users SET password = ?, status = ? WHERE username = ?',
                [hashedPassword, 'active', ADMIN_USERNAME]);
            console.log(`✅ Admin user updated (username: ${ADMIN_USERNAME})`);
        }

        console.log('✅ All database tables initialized successfully!\n');

    } catch (error) {
        console.error('❌ Database initialization error:', error.message);
        // Don't exit - server can still run, just DB might not be ready
    }
}

// Start server
app.listen(PORT, async () => {
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

    // Initialize database tables after server starts
    await initializeTables();
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
