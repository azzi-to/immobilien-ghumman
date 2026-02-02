const mysql = require('mysql2/promise');
require('dotenv').config();

// Parse DATABASE_URL if available (Railway provides this)
let dbConfig;

if (process.env.DATABASE_URL || process.env.MYSQL_URL) {
    // Use DATABASE_URL or MYSQL_URL from Railway
    const dbUrl = process.env.DATABASE_URL || process.env.MYSQL_URL;
    dbConfig = {
        uri: dbUrl,
        waitForConnections: true,
        connectionLimit: 10,
        queueLimit: 0,
        enableKeepAlive: true,
        keepAliveInitialDelay: 0
    };
    console.log('📦 Using DATABASE_URL for connection');
} else {
    // Fallback to individual environment variables (local development)
    dbConfig = {
        host: process.env.DB_HOST || 'localhost',
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || '',
        database: process.env.DB_NAME || 'immobilien_ghumman',
        port: process.env.DB_PORT || 3306,
        waitForConnections: true,
        connectionLimit: 10,
        queueLimit: 0,
        enableKeepAlive: true,
        keepAliveInitialDelay: 0
    };
    console.log('📦 Using individual DB config for connection');
}

// Create connection pool
const pool = dbConfig.uri
    ? mysql.createPool(dbConfig.uri)
    : mysql.createPool(dbConfig);

// Test connection
async function testConnection() {
    try {
        const connection = await pool.getConnection();
        console.log('✅ Database connected successfully');
        connection.release();
        return true;
    } catch (error) {
        console.error('❌ Database connection failed:', error.message);
        return false;
    }
}

// Execute query
async function query(sql, params) {
    try {
        const [results] = await pool.execute(sql, params);
        return results;
    } catch (error) {
        console.error('Database query error:', error);
        throw error;
    }
}

// Get single result
async function queryOne(sql, params) {
    try {
        const [results] = await pool.execute(sql, params);
        return results[0] || null;
    } catch (error) {
        console.error('Database query error:', error);
        throw error;
    }
}

// Transaction helper
async function transaction(callback) {
    const connection = await pool.getConnection();
    await connection.beginTransaction();

    try {
        await callback(connection);
        await connection.commit();
        connection.release();
    } catch (error) {
        await connection.rollback();
        connection.release();
        throw error;
    }
}

module.exports = {
    pool,
    query,
    queryOne,
    transaction,
    testConnection
};
