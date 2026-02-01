const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');
require('dotenv').config();

// Database initialization script
async function initDatabase() {
    let connection;
    
    try {
        console.log('🔄 Initializing database...\n');
        
        // Connect to MySQL without database
        connection = await mysql.createConnection({
            host: process.env.DB_HOST || 'localhost',
            user: process.env.DB_USER || 'root',
            password: process.env.DB_PASSWORD || '',
            port: process.env.DB_PORT || 3306
        });
        
        console.log('✅ Connected to MySQL server');
        
        // Create database if not exists
        const dbName = process.env.DB_NAME || 'immobilien_ghumman';
        await connection.query(`CREATE DATABASE IF NOT EXISTS ${dbName}`);
        console.log(`✅ Database '${dbName}' created/verified`);
        
        // Use the database
        await connection.query(`USE ${dbName}`);
        
        // Create users table
        await connection.query(`
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
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                INDEX idx_username (username),
                INDEX idx_email (email),
                INDEX idx_role (role)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
        `);
        console.log('✅ Users table created');
        
        // Create properties table
        await connection.query(`
            CREATE TABLE IF NOT EXISTS properties (
                id INT AUTO_INCREMENT PRIMARY KEY,
                title VARCHAR(200) NOT NULL,
                type ENUM('wohnung', 'haus', 'gewerbe', 'grundstück') NOT NULL,
                offer_type ENUM('miete', 'kauf') NOT NULL,
                price DECIMAL(12, 2) NOT NULL,
                size DECIMAL(8, 2) NOT NULL,
                rooms INT NOT NULL,
                bathrooms INT DEFAULT 1,
                year_built INT,
                location VARCHAR(255) NOT NULL,
                address VARCHAR(255),
                zip_code VARCHAR(10),
                city VARCHAR(100),
                state VARCHAR(100),
                country VARCHAR(100) DEFAULT 'Deutschland',
                latitude DECIMAL(10, 8),
                longitude DECIMAL(11, 8),
                description TEXT,
                features JSON,
                status ENUM('available', 'reserved', 'sold', 'rented') DEFAULT 'available',
                featured BOOLEAN DEFAULT FALSE,
                views INT DEFAULT 0,
                user_id INT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                published_at TIMESTAMP NULL,
                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
                INDEX idx_type (type),
                INDEX idx_offer_type (offer_type),
                INDEX idx_status (status),
                INDEX idx_city (city),
                INDEX idx_price (price),
                INDEX idx_featured (featured),
                FULLTEXT idx_search (title, description, location)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
        `);
        console.log('✅ Properties table created');
        
        // Create property_images table
        await connection.query(`
            CREATE TABLE IF NOT EXISTS property_images (
                id INT AUTO_INCREMENT PRIMARY KEY,
                property_id INT NOT NULL,
                image_url VARCHAR(500) NOT NULL,
                thumbnail_url VARCHAR(500),
                cloudinary_id VARCHAR(255),
                title VARCHAR(200),
                is_primary BOOLEAN DEFAULT FALSE,
                display_order INT DEFAULT 0,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (property_id) REFERENCES properties(id) ON DELETE CASCADE,
                INDEX idx_property_id (property_id),
                INDEX idx_is_primary (is_primary)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
        `);
        console.log('✅ Property images table created');
        
        // Create inquiries table
        await connection.query(`
            CREATE TABLE IF NOT EXISTS inquiries (
                id INT AUTO_INCREMENT PRIMARY KEY,
                property_id INT,
                name VARCHAR(100) NOT NULL,
                email VARCHAR(100) NOT NULL,
                phone VARCHAR(20),
                message TEXT NOT NULL,
                status ENUM('new', 'replied', 'closed') DEFAULT 'new',
                ip_address VARCHAR(45),
                user_agent TEXT,
                replied_at DATETIME,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (property_id) REFERENCES properties(id) ON DELETE SET NULL,
                INDEX idx_property_id (property_id),
                INDEX idx_status (status),
                INDEX idx_email (email)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
        `);
        console.log('✅ Inquiries table created');
        
        // Create favorites table
        await connection.query(`
            CREATE TABLE IF NOT EXISTS favorites (
                id INT AUTO_INCREMENT PRIMARY KEY,
                user_id INT NOT NULL,
                property_id INT NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
                FOREIGN KEY (property_id) REFERENCES properties(id) ON DELETE CASCADE,
                UNIQUE KEY unique_favorite (user_id, property_id),
                INDEX idx_user_id (user_id),
                INDEX idx_property_id (property_id)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
        `);
        console.log('✅ Favorites table created');
        
        // Create activity_logs table
        await connection.query(`
            CREATE TABLE IF NOT EXISTS activity_logs (
                id INT AUTO_INCREMENT PRIMARY KEY,
                user_id INT,
                action VARCHAR(100) NOT NULL,
                entity_type VARCHAR(50),
                entity_id INT,
                ip_address VARCHAR(45),
                user_agent TEXT,
                details JSON,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
                INDEX idx_user_id (user_id),
                INDEX idx_action (action),
                INDEX idx_created_at (created_at)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
        `);
        console.log('✅ Activity logs table created');
        
        // Create default admin user
        const adminPassword = await bcrypt.hash('admin123', 10);
        await connection.query(`
            INSERT INTO users (username, email, password, full_name, role, status)
            VALUES (?, ?, ?, ?, ?, ?)
            ON DUPLICATE KEY UPDATE password = VALUES(password)
        `, ['admin', 'admin@immobilien-ghumman.de', adminPassword, 'Administrator', 'admin', 'active']);
        console.log('✅ Default admin user created (username: admin, password: admin123)');
        
        console.log('\n✅ Database initialization completed successfully!\n');
        console.log('📝 Next steps:');
        console.log('   1. Update .env file with your database credentials');
        console.log('   2. Run: npm install');
        console.log('   3. Run: npm start');
        console.log('   4. Access API at: http://localhost:3000\n');
        
    } catch (error) {
        console.error('❌ Database initialization failed:', error);
        throw error;
    } finally {
        if (connection) {
            await connection.end();
        }
    }
}

// Run initialization
initDatabase()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
