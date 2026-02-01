const express = require('express');
const router = express.Router();
const { body, validationResult, query: validateQuery } = require('express-validator');
const { query, queryOne } = require('../config/database');
const { authMiddleware, requireRole, optionalAuth } = require('../middleware/auth.middleware');

// @route   GET /api/properties
// @desc    Get all properties with filters
// @access  Public
router.get('/', [
    validateQuery('type').optional().isIn(['wohnung', 'haus', 'gewerbe', 'grundstück']),
    validateQuery('offer_type').optional().isIn(['miete', 'kauf']),
    validateQuery('status').optional().isIn(['available', 'reserved', 'sold', 'rented']),
    validateQuery('city').optional().trim(),
    validateQuery('min_price').optional().isNumeric(),
    validateQuery('max_price').optional().isNumeric(),
    validateQuery('min_size').optional().isNumeric(),
    validateQuery('max_size').optional().isNumeric(),
    validateQuery('rooms').optional().isInt({ min: 1 }),
    validateQuery('featured').optional().isBoolean(),
    validateQuery('limit').optional().isInt({ min: 1, max: 100 }),
    validateQuery('offset').optional().isInt({ min: 0 }),
    validateQuery('sort').optional().isIn(['price_asc', 'price_desc', 'size_asc', 'size_desc', 'newest', 'oldest'])
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        
        const {
            type, offer_type, status = 'available', city, min_price, max_price,
            min_size, max_size, rooms, featured, limit = 20, offset = 0, sort = 'newest'
        } = req.query;
        
        // Build query
        let sql = `
            SELECT p.*, 
                   (SELECT image_url FROM property_images WHERE property_id = p.id AND is_primary = 1 LIMIT 1) as primary_image,
                   (SELECT COUNT(*) FROM property_images WHERE property_id = p.id) as image_count
            FROM properties p
            WHERE 1=1
        `;
        const params = [];
        
        // Add filters
        if (type) {
            sql += ' AND p.type = ?';
            params.push(type);
        }
        if (offer_type) {
            sql += ' AND p.offer_type = ?';
            params.push(offer_type);
        }
        if (status) {
            sql += ' AND p.status = ?';
            params.push(status);
        }
        if (city) {
            sql += ' AND p.city LIKE ?';
            params.push(`%${city}%`);
        }
        if (min_price) {
            sql += ' AND p.price >= ?';
            params.push(min_price);
        }
        if (max_price) {
            sql += ' AND p.price <= ?';
            params.push(max_price);
        }
        if (min_size) {
            sql += ' AND p.size >= ?';
            params.push(min_size);
        }
        if (max_size) {
            sql += ' AND p.size <= ?';
            params.push(max_size);
        }
        if (rooms) {
            sql += ' AND p.rooms = ?';
            params.push(rooms);
        }
        if (featured !== undefined) {
            sql += ' AND p.featured = ?';
            params.push(featured === 'true' ? 1 : 0);
        }
        
        // Add sorting
        switch (sort) {
            case 'price_asc':
                sql += ' ORDER BY p.price ASC';
                break;
            case 'price_desc':
                sql += ' ORDER BY p.price DESC';
                break;
            case 'size_asc':
                sql += ' ORDER BY p.size ASC';
                break;
            case 'size_desc':
                sql += ' ORDER BY p.size DESC';
                break;
            case 'oldest':
                sql += ' ORDER BY p.created_at ASC';
                break;
            case 'newest':
            default:
                sql += ' ORDER BY p.created_at DESC';
        }
        
        // Add pagination
        sql += ' LIMIT ? OFFSET ?';
        params.push(parseInt(limit), parseInt(offset));
        
        // Execute query
        const properties = await query(sql, params);
        
        // Get total count
        let countSql = 'SELECT COUNT(*) as total FROM properties p WHERE 1=1';
        const countParams = params.slice(0, -2); // Remove limit and offset
        
        if (type) countSql += ' AND p.type = ?';
        if (offer_type) countSql += ' AND p.offer_type = ?';
        if (status) countSql += ' AND p.status = ?';
        if (city) countSql += ' AND p.city LIKE ?';
        if (min_price) countSql += ' AND p.price >= ?';
        if (max_price) countSql += ' AND p.price <= ?';
        if (min_size) countSql += ' AND p.size >= ?';
        if (max_size) countSql += ' AND p.size <= ?';
        if (rooms) countSql += ' AND p.rooms = ?';
        if (featured !== undefined) countSql += ' AND p.featured = ?';
        
        const [{ total }] = await query(countSql, countParams);
        
        // Get all property IDs to fetch images
        const propertyIds = properties.map(p => p.id);
        
        // Fetch all images for these properties if there are any
        let allImages = [];
        if (propertyIds.length > 0) {
            const placeholders = propertyIds.map(() => '?').join(',');
            allImages = await query(
                `SELECT property_id, image_url, is_primary, display_order 
                 FROM property_images 
                 WHERE property_id IN (${placeholders}) 
                 ORDER BY property_id, display_order ASC, is_primary DESC`,
                propertyIds
            );
        }
        
        // Group images by property_id
        const imagesByProperty = {};
        allImages.forEach(img => {
            if (!imagesByProperty[img.property_id]) {
                imagesByProperty[img.property_id] = [];
            }
            imagesByProperty[img.property_id].push(img.image_url);
        });
        
        // Parse JSON fields and attach images
        properties.forEach(property => {
            if (property.features) {
                property.features = JSON.parse(property.features);
            }
            // Attach all images for this property
            property.images = imagesByProperty[property.id] || [];
            // Ensure primary_image is set
            if (!property.primary_image && property.images.length > 0) {
                property.primary_image = property.images[0];
            }
        });
        
        res.json({
            properties,
            pagination: {
                total,
                limit: parseInt(limit),
                offset: parseInt(offset),
                has_more: total > (parseInt(offset) + parseInt(limit))
            }
        });
        
    } catch (error) {
        console.error('Get properties error:', error);
        res.status(500).json({ error: 'Fehler beim Abrufen der Immobilien' });
    }
});

// @route   GET /api/properties/:id
// @desc    Get single property by ID
// @access  Public
router.get('/:id', optionalAuth, async (req, res) => {
    try {
        const propertyId = req.params.id;
        
        // Get property with images
        const property = await queryOne(`
            SELECT p.*, 
                   u.username as created_by_username,
                   u.full_name as created_by_name
            FROM properties p
            LEFT JOIN users u ON p.user_id = u.id
            WHERE p.id = ?
        `, [propertyId]);
        
        if (!property) {
            return res.status(404).json({ error: 'Immobilie nicht gefunden' });
        }
        
        // Get images
        const images = await query(
            'SELECT id, image_url, thumbnail_url, title, is_primary, display_order FROM property_images WHERE property_id = ? ORDER BY display_order ASC, is_primary DESC',
            [propertyId]
        );
        
        // Parse JSON fields
        if (property.features) {
            property.features = JSON.parse(property.features);
        }
        
        property.images = images;
        
        // Increment view count (async, don't wait)
        query('UPDATE properties SET views = views + 1 WHERE id = ?', [propertyId]).catch(err => 
            console.error('Error incrementing views:', err)
        );
        
        // Check if user favorited (if authenticated)
        if (req.user) {
            const favorite = await queryOne(
                'SELECT id FROM favorites WHERE user_id = ? AND property_id = ?',
                [req.user.id, propertyId]
            );
            property.is_favorited = !!favorite;
        }
        
        res.json({ property });
        
    } catch (error) {
        console.error('Get property error:', error);
        res.status(500).json({ error: 'Fehler beim Abrufen der Immobilie' });
    }
});

// @route   POST /api/properties
// @desc    Create new property
// @access  Private (Admin, Manager, Agent)
router.post('/', [
    authMiddleware,
    requireRole('admin', 'manager', 'agent'),
    body('title').trim().isLength({ min: 5 }).withMessage('Titel muss mindestens 5 Zeichen lang sein'),
    body('type').isIn(['wohnung', 'haus', 'gewerbe', 'grundstück']).withMessage('Ungültiger Immobilientyp'),
    body('offer_type').isIn(['miete', 'kauf']).withMessage('Ungültiger Angebotstyp'),
    body('price').isNumeric().withMessage('Preis muss eine Zahl sein'),
    body('size').isNumeric().withMessage('Größe muss eine Zahl sein'),
    body('rooms').isInt({ min: 1 }).withMessage('Anzahl Zimmer muss mindestens 1 sein'),
    body('location').trim().notEmpty().withMessage('Standort erforderlich'),
    body('description').trim().isLength({ min: 20 }).withMessage('Beschreibung muss mindestens 20 Zeichen lang sein')
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        
        const {
            title, type, offer_type, price, size, rooms, bathrooms, year_built,
            location, address, zip_code, city, state, description, features,
            status = 'available', featured = false, latitude, longitude
        } = req.body;
        
        // Insert property
        const result = await query(`
            INSERT INTO properties (
                title, type, offer_type, price, size, rooms, bathrooms, year_built,
                location, address, zip_code, city, state, description, features,
                status, featured, user_id, published_at, latitude, longitude
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), ?, ?)
        `, [
            title, type, offer_type, price, size, rooms, bathrooms || 1, year_built || null,
            location, address || null, zip_code || null, city || null, state || null,
            description, JSON.stringify(features || []), status, featured ? 1 : 0,
            req.user.id, latitude || null, longitude || null
        ]);
        
        const propertyId = result.insertId;
        
        // Get created property
        const property = await queryOne(
            'SELECT * FROM properties WHERE id = ?',
            [propertyId]
        );
        
        if (property.features) {
            property.features = JSON.parse(property.features);
        }
        
        res.status(201).json({
            message: 'Immobilie erfolgreich erstellt',
            property
        });
        
    } catch (error) {
        console.error('Create property error:', error);
        res.status(500).json({ error: 'Fehler beim Erstellen der Immobilie' });
    }
});

// @route   PUT /api/properties/:id
// @desc    Update property
// @access  Private (Admin, Manager, Agent - own properties)
router.put('/:id', [
    authMiddleware,
    requireRole('admin', 'manager', 'agent')
], async (req, res) => {
    try {
        const propertyId = req.params.id;
        
        // Check if property exists and user has permission
        const property = await queryOne(
            'SELECT user_id FROM properties WHERE id = ?',
            [propertyId]
        );
        
        if (!property) {
            return res.status(404).json({ error: 'Immobilie nicht gefunden' });
        }
        
        // Only admin can edit any property, others only their own
        if (req.user.role !== 'admin' && property.user_id !== req.user.id) {
            return res.status(403).json({ error: 'Keine Berechtigung diese Immobilie zu bearbeiten' });
        }
        
        const allowedFields = [
            'title', 'type', 'offer_type', 'price', 'size', 'rooms', 'bathrooms',
            'year_built', 'location', 'address', 'zip_code', 'city', 'state',
            'description', 'features', 'status', 'featured', 'latitude', 'longitude'
        ];
        
        const updates = [];
        const values = [];
        
        Object.keys(req.body).forEach(key => {
            if (allowedFields.includes(key)) {
                updates.push(`${key} = ?`);
                values.push(key === 'features' ? JSON.stringify(req.body[key]) : req.body[key]);
            }
        });
        
        if (updates.length === 0) {
            return res.status(400).json({ error: 'Keine gültigen Felder zum Aktualisieren' });
        }
        
        values.push(propertyId);
        
        await query(
            `UPDATE properties SET ${updates.join(', ')} WHERE id = ?`,
            values
        );
        
        // Get updated property
        const updatedProperty = await queryOne(
            'SELECT * FROM properties WHERE id = ?',
            [propertyId]
        );
        
        if (updatedProperty.features) {
            updatedProperty.features = JSON.parse(updatedProperty.features);
        }
        
        res.json({
            message: 'Immobilie erfolgreich aktualisiert',
            property: updatedProperty
        });
        
    } catch (error) {
        console.error('Update property error:', error);
        res.status(500).json({ error: 'Fehler beim Aktualisieren der Immobilie' });
    }
});

// @route   DELETE /api/properties/:id
// @desc    Delete property
// @access  Private (Admin, Manager - own properties)
router.delete('/:id', [
    authMiddleware,
    requireRole('admin', 'manager', 'agent')
], async (req, res) => {
    try {
        const propertyId = req.params.id;
        
        // Check if property exists and user has permission
        const property = await queryOne(
            'SELECT user_id FROM properties WHERE id = ?',
            [propertyId]
        );
        
        if (!property) {
            return res.status(404).json({ error: 'Immobilie nicht gefunden' });
        }
        
        // Only admin can delete any property, others only their own
        if (req.user.role !== 'admin' && property.user_id !== req.user.id) {
            return res.status(403).json({ error: 'Keine Berechtigung diese Immobilie zu löschen' });
        }
        
        // Delete property (cascades to images and favorites)
        await query('DELETE FROM properties WHERE id = ?', [propertyId]);
        
        res.json({ message: 'Immobilie erfolgreich gelöscht' });
        
    } catch (error) {
        console.error('Delete property error:', error);
        res.status(500).json({ error: 'Fehler beim Löschen der Immobilie' });
    }
});

// @route   GET /api/properties/:id/similar
// @desc    Get similar properties
// @access  Public
router.get('/:id/similar', async (req, res) => {
    try {
        const propertyId = req.params.id;
        const limit = req.query.limit || 4;
        
        // Get original property
        const property = await queryOne(
            'SELECT type, offer_type, city, price FROM properties WHERE id = ?',
            [propertyId]
        );
        
        if (!property) {
            return res.status(404).json({ error: 'Immobilie nicht gefunden' });
        }
        
        // Find similar properties
        const similar = await query(`
            SELECT p.*, 
                   (SELECT image_url FROM property_images WHERE property_id = p.id AND is_primary = 1 LIMIT 1) as primary_image
            FROM properties p
            WHERE p.id != ?
              AND p.status = 'available'
              AND p.type = ?
              AND p.offer_type = ?
              AND (p.city = ? OR p.price BETWEEN ? AND ?)
            ORDER BY 
                CASE WHEN p.city = ? THEN 0 ELSE 1 END,
                ABS(p.price - ?) ASC
            LIMIT ?
        `, [
            propertyId,
            property.type,
            property.offer_type,
            property.city,
            property.price * 0.8,
            property.price * 1.2,
            property.city,
            property.price,
            parseInt(limit)
        ]);
        
        // Parse features
        similar.forEach(prop => {
            if (prop.features) {
                prop.features = JSON.parse(prop.features);
            }
        });
        
        res.json({ similar });
        
    } catch (error) {
        console.error('Get similar properties error:', error);
        res.status(500).json({ error: 'Fehler beim Abrufen ähnlicher Immobilien' });
    }
});

module.exports = router;
