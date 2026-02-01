const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const { body, validationResult } = require('express-validator');
const { query, queryOne } = require('../config/database');
const { authMiddleware, requireRole } = require('../middleware/auth.middleware');
const { sendWelcomeEmail } = require('../services/email.service');

// @route   GET /api/users
// @desc    Get all users
// @access  Private (Admin only)
router.get('/', [
    authMiddleware,
    requireRole('admin')
], async (req, res) => {
    try {
        const { role, status, page = 1, limit = 20 } = req.query;
        const offset = (page - 1) * limit;
        
        let whereClause = [];
        let params = [];
        
        if (role) {
            whereClause.push('role = ?');
            params.push(role);
        }
        
        if (status) {
            whereClause.push('status = ?');
            params.push(status);
        }
        
        const whereSql = whereClause.length > 0 ? 'WHERE ' + whereClause.join(' AND ') : '';
        
        // Get total count
        const countResult = await queryOne(
            `SELECT COUNT(*) as total FROM users ${whereSql}`,
            params
        );
        
        // Get users (without passwords)
        const users = await query(`
            SELECT 
                id, username, email, full_name, phone, role, status,
                avatar, created_at, updated_at, last_login
            FROM users
            ${whereSql}
            ORDER BY created_at DESC
            LIMIT ? OFFSET ?
        `, [...params, parseInt(limit), parseInt(offset)]);
        
        res.json({
            users,
            pagination: {
                total: countResult.total,
                page: parseInt(page),
                limit: parseInt(limit),
                pages: Math.ceil(countResult.total / limit)
            }
        });
        
    } catch (error) {
        console.error('Get users error:', error);
        res.status(500).json({ error: 'Fehler beim Abrufen der Benutzer' });
    }
});

// @route   GET /api/users/:id
// @desc    Get single user
// @access  Private (Admin or own profile)
router.get('/:id', [
    authMiddleware
], async (req, res) => {
    try {
        // Check permission: admin can view any, user can only view own
        if (req.user.role !== 'admin' && req.user.id !== parseInt(req.params.id)) {
            return res.status(403).json({ error: 'Keine Berechtigung' });
        }
        
        const user = await queryOne(`
            SELECT 
                id, username, email, full_name, phone, role, status,
                avatar, created_at, updated_at, last_login
            FROM users
            WHERE id = ?
        `, [req.params.id]);
        
        if (!user) {
            return res.status(404).json({ error: 'Benutzer nicht gefunden' });
        }
        
        // Get user's property count
        const propertyCount = await queryOne(`
            SELECT COUNT(*) as count
            FROM properties
            WHERE user_id = ?
        `, [user.id]);
        
        user.property_count = propertyCount.count;
        
        res.json({ user });
        
    } catch (error) {
        console.error('Get user error:', error);
        res.status(500).json({ error: 'Fehler beim Abrufen des Benutzers' });
    }
});

// @route   POST /api/users
// @desc    Create new user (admin only)
// @access  Private (Admin)
router.post('/', [
    authMiddleware,
    requireRole('admin'),
    body('username').trim().isLength({ min: 3 }).withMessage('Benutzername muss mindestens 3 Zeichen lang sein'),
    body('email').isEmail().withMessage('Gültige E-Mail-Adresse erforderlich'),
    body('password').isLength({ min: 6 }).withMessage('Passwort muss mindestens 6 Zeichen lang sein'),
    body('full_name').trim().optional(),
    body('phone').trim().optional(),
    body('role').isIn(['admin', 'manager', 'agent', 'user']).withMessage('Ungültige Rolle')
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        
        const { username, email, password, full_name, phone, role } = req.body;
        
        // Check if username or email already exists
        const existing = await queryOne(
            'SELECT id FROM users WHERE username = ? OR email = ?',
            [username, email]
        );
        
        if (existing) {
            return res.status(400).json({ error: 'Benutzername oder E-Mail bereits vergeben' });
        }
        
        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);
        
        // Create user
        const result = await query(`
            INSERT INTO users (username, email, password, full_name, phone, role, status, created_at)
            VALUES (?, ?, ?, ?, ?, ?, 'active', NOW())
        `, [username, email, hashedPassword, full_name, phone, role || 'user']);
        
        const user = await queryOne(`
            SELECT 
                id, username, email, full_name, phone, role, status,
                avatar, created_at
            FROM users
            WHERE id = ?
        `, [result.insertId]);
        
        // Send welcome email (async)
        sendWelcomeEmail(user).catch(err => console.error('Welcome email error:', err));
        
        res.status(201).json({
            message: 'Benutzer erfolgreich erstellt',
            user
        });
        
    } catch (error) {
        console.error('Create user error:', error);
        res.status(500).json({ error: 'Fehler beim Erstellen des Benutzers' });
    }
});

// @route   PUT /api/users/:id
// @desc    Update user
// @access  Private (Admin or own profile)
router.put('/:id', [
    authMiddleware,
    body('email').optional().isEmail().withMessage('Gültige E-Mail-Adresse erforderlich'),
    body('full_name').optional().trim(),
    body('phone').optional().trim(),
    body('role').optional().isIn(['admin', 'manager', 'agent', 'user']).withMessage('Ungültige Rolle'),
    body('status').optional().isIn(['active', 'inactive', 'suspended']).withMessage('Ungültiger Status')
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        
        // Check permission
        const isOwnProfile = req.user.id === parseInt(req.params.id);
        const isAdmin = req.user.role === 'admin';
        
        if (!isOwnProfile && !isAdmin) {
            return res.status(403).json({ error: 'Keine Berechtigung' });
        }
        
        // Non-admins can't change role or status
        if (!isAdmin) {
            delete req.body.role;
            delete req.body.status;
        }
        
        const { email, full_name, phone, role, status, avatar } = req.body;
        
        // Check if user exists
        const user = await queryOne('SELECT * FROM users WHERE id = ?', [req.params.id]);
        if (!user) {
            return res.status(404).json({ error: 'Benutzer nicht gefunden' });
        }
        
        // Check email uniqueness if changed
        if (email && email !== user.email) {
            const emailExists = await queryOne('SELECT id FROM users WHERE email = ? AND id != ?', [email, req.params.id]);
            if (emailExists) {
                return res.status(400).json({ error: 'E-Mail bereits vergeben' });
            }
        }
        
        // Build update query
        const updates = [];
        const params = [];
        
        if (email) { updates.push('email = ?'); params.push(email); }
        if (full_name !== undefined) { updates.push('full_name = ?'); params.push(full_name); }
        if (phone !== undefined) { updates.push('phone = ?'); params.push(phone); }
        if (avatar !== undefined) { updates.push('avatar = ?'); params.push(avatar); }
        if (role && isAdmin) { updates.push('role = ?'); params.push(role); }
        if (status && isAdmin) { updates.push('status = ?'); params.push(status); }
        
        updates.push('updated_at = NOW()');
        params.push(req.params.id);
        
        // Update user
        await query(`
            UPDATE users
            SET ${updates.join(', ')}
            WHERE id = ?
        `, params);
        
        const updated = await queryOne(`
            SELECT 
                id, username, email, full_name, phone, role, status,
                avatar, created_at, updated_at, last_login
            FROM users
            WHERE id = ?
        `, [req.params.id]);
        
        res.json({
            message: 'Benutzer erfolgreich aktualisiert',
            user: updated
        });
        
    } catch (error) {
        console.error('Update user error:', error);
        res.status(500).json({ error: 'Fehler beim Aktualisieren des Benutzers' });
    }
});

// @route   DELETE /api/users/:id
// @desc    Delete user
// @access  Private (Admin only)
router.delete('/:id', [
    authMiddleware,
    requireRole('admin')
], async (req, res) => {
    try {
        // Can't delete yourself
        if (req.user.id === parseInt(req.params.id)) {
            return res.status(400).json({ error: 'Sie können Ihr eigenes Konto nicht löschen' });
        }
        
        // Check if user exists
        const user = await queryOne('SELECT * FROM users WHERE id = ?', [req.params.id]);
        if (!user) {
            return res.status(404).json({ error: 'Benutzer nicht gefunden' });
        }
        
        // Delete user (cascades to properties via foreign key)
        await query('DELETE FROM users WHERE id = ?', [req.params.id]);
        
        res.json({ message: 'Benutzer erfolgreich gelöscht' });
        
    } catch (error) {
        console.error('Delete user error:', error);
        res.status(500).json({ error: 'Fehler beim Löschen des Benutzers' });
    }
});

// @route   GET /api/users/stats/overview
// @desc    Get user statistics
// @access  Private (Admin only)
router.get('/stats/overview', [
    authMiddleware,
    requireRole('admin')
], async (req, res) => {
    try {
        const stats = {
            total: 0,
            active: 0,
            inactive: 0,
            suspended: 0,
            by_role: {
                admin: 0,
                manager: 0,
                agent: 0,
                user: 0
            },
            recent_registrations: 0
        };
        
        // Total and by status
        const statusCounts = await query(`
            SELECT status, COUNT(*) as count
            FROM users
            GROUP BY status
        `);
        
        statusCounts.forEach(row => {
            stats[row.status] = row.count;
            stats.total += row.count;
        });
        
        // By role
        const roleCounts = await query(`
            SELECT role, COUNT(*) as count
            FROM users
            GROUP BY role
        `);
        
        roleCounts.forEach(row => {
            stats.by_role[row.role] = row.count;
        });
        
        // Recent registrations (last 7 days)
        const recentCount = await queryOne(`
            SELECT COUNT(*) as count
            FROM users
            WHERE created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)
        `);
        stats.recent_registrations = recentCount.count;
        
        res.json({ stats });
        
    } catch (error) {
        console.error('Get user stats error:', error);
        res.status(500).json({ error: 'Fehler beim Abrufen der Statistiken' });
    }
});

module.exports = router;
