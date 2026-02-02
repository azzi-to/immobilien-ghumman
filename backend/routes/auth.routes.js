const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const { query, queryOne } = require('../config/database');
const { authMiddleware, requireRole } = require('../middleware/auth.middleware');

// Generate JWT token
function generateToken(user) {
    return jwt.sign(
        { id: user.id, username: user.username, role: user.role },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );
}

// @route   POST /api/auth/register
// @desc    Register new user
// @access  Private (nur Admins können neue User anlegen)
router.post('/register', authMiddleware, requireRole('admin'), [
    body('username').trim().isLength({ min: 3 }).withMessage('Benutzername muss mindestens 3 Zeichen lang sein'),
    body('email').isEmail().normalizeEmail().withMessage('Ungültige E-Mail-Adresse'),
    body('password').isLength({ min: 6 }).withMessage('Passwort muss mindestens 6 Zeichen lang sein'),
    body('full_name').optional().trim()
], async (req, res) => {
    try {
        // Validate input
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        
        const { username, email, password, full_name, phone } = req.body;
        
        // Check if user exists
        const existingUser = await queryOne(
            'SELECT id FROM users WHERE username = ? OR email = ?',
            [username, email]
        );
        
        if (existingUser) {
            return res.status(409).json({ error: 'Benutzername oder E-Mail bereits vergeben' });
        }
        
        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);
        
        // Create user
        const result = await query(
            `INSERT INTO users (username, email, password, full_name, phone, role) 
             VALUES (?, ?, ?, ?, ?, 'user')`,
            [username, email, hashedPassword, full_name || null, phone || null]
        );
        
        const userId = result.insertId;
        
        // Get created user
        const user = await queryOne(
            'SELECT id, username, email, full_name, role, created_at FROM users WHERE id = ?',
            [userId]
        );
        
        // Generate token
        const token = generateToken(user);
        
        res.status(201).json({
            message: 'Benutzer erfolgreich registriert',
            token,
            user: {
                id: user.id,
                username: user.username,
                email: user.email,
                full_name: user.full_name,
                role: user.role
            }
        });
        
    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ error: 'Registrierung fehlgeschlagen' });
    }
});

// @route   POST /api/auth/login
// @desc    Login user
// @access  Public
router.post('/login', [
    body('username').trim().notEmpty().withMessage('Benutzername erforderlich'),
    body('password').notEmpty().withMessage('Passwort erforderlich')
], async (req, res) => {
    try {
        // Validate input
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        
        const { username, password } = req.body;
        
        // Find user
        const user = await queryOne(
            'SELECT * FROM users WHERE username = ? OR email = ?',
            [username, username]
        );
        
        if (!user) {
            return res.status(401).json({ error: 'Ungültige Zugangsdaten' });
        }
        
        // Check if account is active
        if (user.status !== 'active') {
            return res.status(403).json({ error: 'Konto ist nicht aktiv' });
        }
        
        // Verify password
        const isValidPassword = await bcrypt.compare(password, user.password);
        
        if (!isValidPassword) {
            return res.status(401).json({ error: 'Ungültige Zugangsdaten' });
        }
        
        // Update last login
        await query('UPDATE users SET last_login = NOW() WHERE id = ?', [user.id]);
        
        // Generate token
        const token = generateToken(user);
        
        res.json({
            message: 'Login erfolgreich',
            token,
            user: {
                id: user.id,
                username: user.username,
                email: user.email,
                full_name: user.full_name,
                role: user.role,
                avatar_url: user.avatar_url
            }
        });
        
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ error: 'Login fehlgeschlagen' });
    }
});

// @route   GET /api/auth/me
// @desc    Get current user
// @access  Private
router.get('/me', authMiddleware, async (req, res) => {
    try {
        const user = await queryOne(
            `SELECT id, username, email, full_name, role, phone, avatar_url, 
                    last_login, created_at 
             FROM users WHERE id = ?`,
            [req.user.id]
        );
        
        if (!user) {
            return res.status(404).json({ error: 'Benutzer nicht gefunden' });
        }
        
        res.json({ user });
        
    } catch (error) {
        console.error('Get user error:', error);
        res.status(500).json({ error: 'Fehler beim Abrufen der Benutzerdaten' });
    }
});

// @route   PUT /api/auth/change-password
// @desc    Change user password
// @access  Private
router.put('/change-password', [
    authMiddleware,
    body('currentPassword').notEmpty().withMessage('Aktuelles Passwort erforderlich'),
    body('newPassword').isLength({ min: 6 }).withMessage('Neues Passwort muss mindestens 6 Zeichen lang sein')
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        
        const { currentPassword, newPassword } = req.body;
        
        // Get user with password
        const user = await queryOne(
            'SELECT password FROM users WHERE id = ?',
            [req.user.id]
        );
        
        // Verify current password
        const isValid = await bcrypt.compare(currentPassword, user.password);
        if (!isValid) {
            return res.status(401).json({ error: 'Aktuelles Passwort ist falsch' });
        }
        
        // Hash new password
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        
        // Update password
        await query(
            'UPDATE users SET password = ? WHERE id = ?',
            [hashedPassword, req.user.id]
        );
        
        res.json({ message: 'Passwort erfolgreich geändert' });
        
    } catch (error) {
        console.error('Change password error:', error);
        res.status(500).json({ error: 'Fehler beim Ändern des Passworts' });
    }
});

// @route   POST /api/auth/logout
// @desc    Logout user (client-side token removal)
// @access  Private
router.post('/logout', authMiddleware, (req, res) => {
    // In a JWT implementation, logout is handled client-side by removing the token
    // Here we just confirm the action
    res.json({ message: 'Erfolgreich abgemeldet' });
});

module.exports = router;
