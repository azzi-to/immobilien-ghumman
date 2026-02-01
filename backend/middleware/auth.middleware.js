const jwt = require('jsonwebtoken');
const { queryOne } = require('../config/database');

// Verify JWT token middleware
async function authMiddleware(req, res, next) {
    try {
        // Get token from header
        const authHeader = req.headers.authorization;
        
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ error: 'Keine Authentifizierung - Token fehlt' });
        }
        
        const token = authHeader.substring(7); // Remove 'Bearer ' prefix
        
        // Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        // Get user from database
        const user = await queryOne(
            'SELECT id, username, email, full_name, role, status FROM users WHERE id = ?',
            [decoded.id]
        );
        
        if (!user) {
            return res.status(401).json({ error: 'Benutzer nicht gefunden' });
        }
        
        if (user.status !== 'active') {
            return res.status(403).json({ error: 'Konto ist nicht aktiv' });
        }
        
        // Attach user to request
        req.user = user;
        next();
        
    } catch (error) {
        if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({ error: 'Ungültiger Token' });
        }
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({ error: 'Token abgelaufen' });
        }
        return res.status(500).json({ error: 'Authentifizierungsfehler' });
    }
}

// Check if user has specific role
function requireRole(...roles) {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({ error: 'Nicht authentifiziert' });
        }
        
        if (!roles.includes(req.user.role)) {
            return res.status(403).json({ error: 'Keine Berechtigung für diese Aktion' });
        }
        
        next();
    };
}

// Optional auth - doesn't fail if no token
async function optionalAuth(req, res, next) {
    try {
        const authHeader = req.headers.authorization;
        
        if (authHeader && authHeader.startsWith('Bearer ')) {
            const token = authHeader.substring(7);
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            
            const user = await queryOne(
                'SELECT id, username, email, full_name, role, status FROM users WHERE id = ?',
                [decoded.id]
            );
            
            if (user && user.status === 'active') {
                req.user = user;
            }
        }
    } catch (error) {
        // Silently fail - user just won't be authenticated
    }
    
    next();
}

module.exports = {
    authMiddleware,
    requireRole,
    optionalAuth
};
