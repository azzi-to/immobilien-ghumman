const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const { query, queryOne } = require('../config/database');
const { authMiddleware, optionalAuth } = require('../middleware/auth.middleware');
const { sendInquiryNotification, sendInquiryConfirmation } = require('../services/email.service');

// @route   POST /api/contact/inquiry
// @desc    Submit a property inquiry
// @access  Public
router.post('/inquiry', [
    body('property_id').isInt().withMessage('Gültige Immobilien-ID erforderlich'),
    body('name').trim().isLength({ min: 2 }).withMessage('Name erforderlich (min. 2 Zeichen)'),
    body('email').isEmail().withMessage('Gültige E-Mail-Adresse erforderlich'),
    body('phone').optional().trim().isLength({ min: 5 }).withMessage('Telefonnummer ungültig'),
    body('message').trim().isLength({ min: 10 }).withMessage('Nachricht erforderlich (min. 10 Zeichen)')
], async (req, res) => {
    try {
        // Validate request
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        
        const { property_id, name, email, phone, message } = req.body;
        
        // Check if property exists
        const property = await queryOne('SELECT * FROM properties WHERE id = ?', [property_id]);
        if (!property) {
            return res.status(404).json({ error: 'Immobilie nicht gefunden' });
        }
        
        // Insert inquiry
        const result = await query(`
            INSERT INTO inquiries (property_id, name, email, phone, message, status, created_at)
            VALUES (?, ?, ?, ?, ?, 'new', NOW())
        `, [property_id, name, email, phone, message]);
        
        const inquiry = await queryOne('SELECT * FROM inquiries WHERE id = ?', [result.insertId]);
        
        // Send notifications (async, don't wait for completion)
        Promise.all([
            sendInquiryNotification(inquiry, property),
            sendInquiryConfirmation(inquiry, property)
        ]).catch(err => console.error('Email notification error:', err));
        
        res.status(201).json({
            message: 'Anfrage erfolgreich gesendet',
            inquiry: {
                id: inquiry.id,
                property_id: inquiry.property_id,
                name: inquiry.name,
                email: inquiry.email,
                status: inquiry.status,
                created_at: inquiry.created_at
            }
        });
        
    } catch (error) {
        console.error('Inquiry submission error:', error);
        res.status(500).json({ error: 'Fehler beim Senden der Anfrage' });
    }
});

// @route   GET /api/contact/inquiries
// @desc    Get all inquiries (admin only)
// @access  Private (Admin, Manager)
router.get('/inquiries', [
    authMiddleware,
], async (req, res) => {
    try {
        const { status, property_id, page = 1, limit = 20 } = req.query;
        const offset = (page - 1) * limit;
        
        let whereClause = [];
        let params = [];
        
        if (status) {
            whereClause.push('i.status = ?');
            params.push(status);
        }
        
        if (property_id) {
            whereClause.push('i.property_id = ?');
            params.push(property_id);
        }
        
        const whereSql = whereClause.length > 0 ? 'WHERE ' + whereClause.join(' AND ') : '';
        
        // Get total count
        const countResult = await queryOne(
            `SELECT COUNT(*) as total FROM inquiries i ${whereSql}`,
            params
        );
        
        // Get inquiries with property details
        const inquiries = await query(`
            SELECT 
                i.*,
                p.title as property_title,
                p.type as property_type,
                p.price as property_price,
                p.location as property_location
            FROM inquiries i
            LEFT JOIN properties p ON i.property_id = p.id
            ${whereSql}
            ORDER BY i.created_at DESC
            LIMIT ? OFFSET ?
        `, [...params, parseInt(limit), parseInt(offset)]);
        
        res.json({
            inquiries,
            pagination: {
                total: countResult.total,
                page: parseInt(page),
                limit: parseInt(limit),
                pages: Math.ceil(countResult.total / limit)
            }
        });
        
    } catch (error) {
        console.error('Get inquiries error:', error);
        res.status(500).json({ error: 'Fehler beim Abrufen der Anfragen' });
    }
});

// @route   GET /api/contact/inquiries/:id
// @desc    Get single inquiry
// @access  Private (Admin, Manager)
router.get('/inquiries/:id', [
    authMiddleware
], async (req, res) => {
    try {
        const inquiry = await queryOne(`
            SELECT 
                i.*,
                p.title as property_title,
                p.type as property_type,
                p.price as property_price,
                p.location as property_location,
                p.description as property_description
            FROM inquiries i
            LEFT JOIN properties p ON i.property_id = p.id
            WHERE i.id = ?
        `, [req.params.id]);
        
        if (!inquiry) {
            return res.status(404).json({ error: 'Anfrage nicht gefunden' });
        }
        
        res.json({ inquiry });
        
    } catch (error) {
        console.error('Get inquiry error:', error);
        res.status(500).json({ error: 'Fehler beim Abrufen der Anfrage' });
    }
});

// @route   PUT /api/contact/inquiries/:id
// @desc    Update inquiry status
// @access  Private (Admin, Manager)
router.put('/inquiries/:id', [
    authMiddleware,
    body('status').isIn(['new', 'contacted', 'in_progress', 'completed', 'cancelled']).withMessage('Ungültiger Status')
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        
        const { status, notes } = req.body;
        
        // Check if inquiry exists
        const inquiry = await queryOne('SELECT * FROM inquiries WHERE id = ?', [req.params.id]);
        if (!inquiry) {
            return res.status(404).json({ error: 'Anfrage nicht gefunden' });
        }
        
        // Update inquiry
        await query(`
            UPDATE inquiries
            SET status = ?, notes = ?, updated_at = NOW()
            WHERE id = ?
        `, [status, notes || inquiry.notes, req.params.id]);
        
        const updated = await queryOne('SELECT * FROM inquiries WHERE id = ?', [req.params.id]);
        
        res.json({
            message: 'Anfrage erfolgreich aktualisiert',
            inquiry: updated
        });
        
    } catch (error) {
        console.error('Update inquiry error:', error);
        res.status(500).json({ error: 'Fehler beim Aktualisieren der Anfrage' });
    }
});

// @route   POST /api/contact/general
// @desc    Submit general contact form
// @access  Public
router.post('/general', [
    body('name').trim().isLength({ min: 2 }).withMessage('Name erforderlich'),
    body('email').isEmail().withMessage('Gültige E-Mail-Adresse erforderlich'),
    body('subject').trim().isLength({ min: 3 }).withMessage('Betreff erforderlich'),
    body('message').trim().isLength({ min: 10 }).withMessage('Nachricht erforderlich')
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        
        const { name, email, phone, subject, message } = req.body;
        
        // Send email to admin
        const emailService = require('../services/email.service');
        await emailService.sendEmail({
            to: process.env.ADMIN_EMAIL,
            subject: `Kontaktformular: ${subject}`,
            html: `
                <h3>Neue Kontaktanfrage</h3>
                <p><strong>Von:</strong> ${name} (${email})</p>
                ${phone ? `<p><strong>Telefon:</strong> ${phone}</p>` : ''}
                <p><strong>Betreff:</strong> ${subject}</p>
                <p><strong>Nachricht:</strong></p>
                <p>${message}</p>
            `,
            text: `Neue Kontaktanfrage von ${name} (${email}): ${message}`
        });
        
        res.json({ message: 'Nachricht erfolgreich gesendet' });
        
    } catch (error) {
        console.error('Contact form error:', error);
        res.status(500).json({ error: 'Fehler beim Senden der Nachricht' });
    }
});

// @route   GET /api/contact/stats
// @desc    Get inquiry statistics
// @access  Private (Admin, Manager)
router.get('/stats', [
    authMiddleware
], async (req, res) => {
    try {
        const stats = {
            total: 0,
            new: 0,
            contacted: 0,
            in_progress: 0,
            completed: 0,
            cancelled: 0,
            today: 0,
            this_week: 0,
            this_month: 0
        };
        
        // Total by status
        const statusCounts = await query(`
            SELECT status, COUNT(*) as count
            FROM inquiries
            GROUP BY status
        `);
        
        statusCounts.forEach(row => {
            stats[row.status] = row.count;
            stats.total += row.count;
        });
        
        // Today
        const todayCount = await queryOne(`
            SELECT COUNT(*) as count
            FROM inquiries
            WHERE DATE(created_at) = CURDATE()
        `);
        stats.today = todayCount.count;
        
        // This week
        const weekCount = await queryOne(`
            SELECT COUNT(*) as count
            FROM inquiries
            WHERE YEARWEEK(created_at) = YEARWEEK(NOW())
        `);
        stats.this_week = weekCount.count;
        
        // This month
        const monthCount = await queryOne(`
            SELECT COUNT(*) as count
            FROM inquiries
            WHERE YEAR(created_at) = YEAR(NOW()) AND MONTH(created_at) = MONTH(NOW())
        `);
        stats.this_month = monthCount.count;
        
        res.json({ stats });
        
    } catch (error) {
        console.error('Get stats error:', error);
        res.status(500).json({ error: 'Fehler beim Abrufen der Statistiken' });
    }
});

module.exports = router;
