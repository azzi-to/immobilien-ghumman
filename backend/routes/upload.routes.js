const express = require('express');
const router = express.Router();
const multer = require('multer');
const cloudinary = require('cloudinary').v2;
const { authMiddleware, requireRole } = require('../middleware/auth.middleware');
const { query } = require('../config/database');

// Configure Cloudinary
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

// Configure Multer for memory storage
const storage = multer.memoryStorage();
const upload = multer({
    storage,
    limits: {
        fileSize: parseInt(process.env.MAX_FILE_SIZE) || 5 * 1024 * 1024 // 5MB default
    },
    fileFilter: (req, file, cb) => {
        const allowedTypes = (process.env.ALLOWED_FILE_TYPES || 'image/jpeg,image/png,image/webp,image/jpg').split(',');
        if (allowedTypes.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error('Ungültiger Dateityp. Erlaubt sind: ' + allowedTypes.join(', ')));
        }
    }
});

// @route   POST /api/upload/image
// @desc    Upload single image to Cloudinary
// @access  Private (Admin, Manager, Agent)
router.post('/image', [
    authMiddleware,
    requireRole('admin', 'manager', 'agent'),
    upload.single('image')
], async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'Keine Datei hochgeladen' });
        }
        
        // Upload to Cloudinary
        const uploadPromise = new Promise((resolve, reject) => {
            const uploadStream = cloudinary.uploader.upload_stream(
                {
                    folder: 'immobilien-ghumman',
                    transformation: [
                        { width: 1200, height: 800, crop: 'limit', quality: 'auto:good' },
                        { fetch_format: 'auto' } // Automatische Format-Optimierung
                    ],
                    secure: true // ⬅️ WICHTIG: Erzwingt HTTPS-URLs
                },
                (error, result) => {
                    if (error) reject(error);
                    else resolve(result);
                }
            );
            
            uploadStream.end(req.file.buffer);
        });
        
        const result = await uploadPromise;
        
        // Generate thumbnail
        const thumbnailUrl = cloudinary.url(result.public_id, {
            transformation: [
                { width: 400, height: 300, crop: 'fill', quality: 'auto:low' }
            ]
        });
        
        res.json({
            message: 'Bild erfolgreich hochgeladen',
            image: {
                url: result.secure_url,
                thumbnail_url: thumbnailUrl,
                cloudinary_id: result.public_id,
                width: result.width,
                height: result.height,
                format: result.format,
                size: result.bytes
            }
        });
        
    } catch (error) {
        console.error('Image upload error:', error);
        res.status(500).json({ error: 'Fehler beim Hochladen des Bildes: ' + error.message });
    }
});

// @route   POST /api/upload/property-images
// @desc    Upload multiple images for a property
// @access  Private (Admin, Manager, Agent)
router.post('/property-images', [
    authMiddleware,
    requireRole('admin', 'manager', 'agent'),
    upload.array('images', 10) // Max 10 images
], async (req, res) => {
    try {
        if (!req.files || req.files.length === 0) {
            return res.status(400).json({ error: 'Keine Dateien hochgeladen' });
        }
        
        const { property_id } = req.body;
        
        if (!property_id) {
            return res.status(400).json({ error: 'property_id erforderlich' });
        }
        
        // Upload all images to Cloudinary
        const uploadPromises = req.files.map((file, index) => {
            return new Promise((resolve, reject) => {
                const uploadStream = cloudinary.uploader.upload_stream(
                    {
                        folder: `immobilien-ghumman/property-${property_id}`,
                        transformation: [
                            { width: 1200, height: 800, crop: 'limit', quality: 'auto:good' },
                            { fetch_format: 'auto' } // Automatische Format-Optimierung
                        ],
                        secure: true // ⬅️ WICHTIG: Erzwingt HTTPS-URLs für alle Bilder
                    },
                    (error, result) => {
                        if (error) reject(error);
                        else resolve({ result, index });
                    }
                );
                
                uploadStream.end(file.buffer);
            });
        });
        
        const uploads = await Promise.all(uploadPromises);
        
        // Save to database
        const imageInserts = uploads.map(({ result, index }) => {
            const thumbnailUrl = cloudinary.url(result.public_id, {
                transformation: [
                    { width: 400, height: 300, crop: 'fill', quality: 'auto:low' }
                ]
            });
            
            return query(`
                INSERT INTO property_images (property_id, image_url, thumbnail_url, cloudinary_id, display_order, is_primary)
                VALUES (?, ?, ?, ?, ?, ?)
            `, [
                property_id,
                result.secure_url,
                thumbnailUrl,
                result.public_id,
                index,
                index === 0 ? 1 : 0 // First image is primary
            ]);
        });
        
        await Promise.all(imageInserts);
        
        res.json({
            message: `${uploads.length} Bilder erfolgreich hochgeladen`,
            images: uploads.map(({ result }, index) => ({
                url: result.secure_url,
                thumbnail_url: cloudinary.url(result.public_id, {
                    transformation: [{ width: 400, height: 300, crop: 'fill' }]
                }),
                cloudinary_id: result.public_id,
                display_order: index
            }))
        });
        
    } catch (error) {
        console.error('Property images upload error:', error);
        res.status(500).json({ error: 'Fehler beim Hochladen der Bilder: ' + error.message });
    }
});

// @route   DELETE /api/upload/image/:cloudinary_id
// @desc    Delete image from Cloudinary
// @access  Private (Admin, Manager, Agent)
router.delete('/image/:cloudinary_id', [
    authMiddleware,
    requireRole('admin', 'manager', 'agent')
], async (req, res) => {
    try {
        const cloudinaryId = req.params.cloudinary_id.replace(/-/g, '/'); // Convert back to path format
        
        // Delete from Cloudinary
        await cloudinary.uploader.destroy(cloudinaryId);
        
        // Delete from database
        await query('DELETE FROM property_images WHERE cloudinary_id = ?', [cloudinaryId]);
        
        res.json({ message: 'Bild erfolgreich gelöscht' });
        
    } catch (error) {
        console.error('Image delete error:', error);
        res.status(500).json({ error: 'Fehler beim Löschen des Bildes' });
    }
});

module.exports = router;
