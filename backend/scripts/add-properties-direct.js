/**
 * Script zum direkten Hinzufügen der Immobilien in die Railway-Datenbank
 * 
 * Verwendung:
 * 1. Setze DATABASE_URL oder MYSQL_URL Umgebungsvariable
 * 2. node scripts/add-properties-direct.js
 * 
 * Oder: Führe das SQL-Script direkt in Railway MySQL aus:
 *   - Gehe zu Railway Dashboard
 *   - Öffne MySQL Service
 *   - Klicke auf "Data" Tab
 *   - Führe das SQL aus add-usingen-karben.sql aus
 */

require('dotenv').config();
const mysql = require('mysql2/promise');

// Railway MySQL Connection
const DATABASE_URL = process.env.DATABASE_URL || process.env.MYSQL_URL;

if (!DATABASE_URL) {
    console.log('❌ DATABASE_URL nicht gesetzt!\n');
    console.log('Bitte setze die DATABASE_URL Umgebungsvariable oder');
    console.log('führe das SQL-Script direkt in Railway MySQL aus:\n');
    console.log('1. Gehe zu Railway Dashboard');
    console.log('2. Öffne den MySQL Service');
    console.log('3. Klicke auf "Data" Tab');
    console.log('4. Führe das SQL aus add-usingen-karben.sql aus');
    process.exit(1);
}

// Immobilien-Daten
const properties = [
    {
        title: '3 Zimmer Wohnung mit Einbauküche in Usingen',
        description: `Neubau-Wohnung in Usingen – Ab 01.04.2026 verfügbar

Diese hochwertige Neubau-Wohnung bietet Ihnen 100 m² Wohnfläche in erstklassiger Ausstattung.

Ausstattung:
• 3 Zimmer
• 1 Badezimmer mit Dusche
• 1 Gäste-WC
• Moderne Einbauküche
• Großer Balkon (8 m²)
• Eigener Garten
• 3 Parkplätze
• 1 Abstellraum

Kosten:
• Kaltmiete: 1.600 €
• Nebenkosten: 220 €
• Heizkosten: 80 €
• Warmmiete: 1.900 €
• Kaution: 2.000 €

🎬 Video-Tour: https://player.cloudinary.com/embed/?cloud_name=dlpdbr0ey&public_id=WhatsApp_Video_2026-02-01_at_23.03.11_jsmxts

Verfügbar ab: 01.04.2026

Kontakt:
Immobilien Ghumman
Mobil: 0160 98 78 78 78`,
        type: 'wohnung',
        offer_type: 'miete',
        price: 1600,
        size: 100,
        rooms: 3,
        city: 'Usingen',
        zip_code: '61250',
        address: 'Usingen',
        features: JSON.stringify(['Neubau', 'Einbauküche', 'Badezimmer mit Dusche', 'Gäste-WC', 'Großer Balkon (8 m²)', 'Garten', '3 Parkplätze', 'Abstellraum']),
        status: 'available',
        featured: true,
        images: [
            { url: 'https://res.cloudinary.com/dlpdbr0ey/image/upload/v1758552673/1758059506092_asauj1.png', isPrimary: true }
        ]
    },
    {
        title: '2 Zimmer Wohnung Möbliert in Karben',
        description: `Möblierte 2 Zimmer Wohnung in Karben – Ab sofort verfügbar

Diese gemütliche möblierte Wohnung ist ideal für Singles oder Paare.

Ausstattung:
• 2 Zimmer (Wohnzimmer + Schlafzimmer)
• 1 Einbauküche
• 1 Badezimmer mit Dusche
• 1 Abstellraum
• 1 Flur

Kosten:
• Kaltmiete: 660 €
• Nebenkosten: 140 €
• Heizkosten: 60 €
• Warmmiete: 860 €
• Kaution: 2.000 €

Verfügbar: Ab sofort

Kontakt:
Immobilien Ghumman
Mobil: 0160 98 78 78 78`,
        type: 'wohnung',
        offer_type: 'miete',
        price: 660,
        size: 50,
        rooms: 2,
        city: 'Karben',
        zip_code: '61184',
        address: 'Karben',
        features: JSON.stringify(['Möbliert', 'Einbauküche', 'Badezimmer mit Dusche', 'Abstellraum', 'Sofort verfügbar']),
        status: 'available',
        featured: true,
        images: [
            { url: 'https://res.cloudinary.com/dlpdbr0ey/image/upload/v1770002887/WhatsApp_Image_2026-02-01_at_23.05.51_4_nr6xyb.jpg', isPrimary: true },
            { url: 'https://res.cloudinary.com/dlpdbr0ey/image/upload/v1770002887/WhatsApp_Image_2026-02-01_at_23.05.51_5_pnvf9y.jpg', isPrimary: false },
            { url: 'https://res.cloudinary.com/dlpdbr0ey/image/upload/v1770002888/WhatsApp_Image_2026-02-01_at_23.05.51_6_gysngj.jpg', isPrimary: false },
            { url: 'https://res.cloudinary.com/dlpdbr0ey/image/upload/v1770002889/WhatsApp_Image_2026-02-01_at_23.05.51_1_xobsew.jpg', isPrimary: false },
            { url: 'https://res.cloudinary.com/dlpdbr0ey/image/upload/v1770002889/WhatsApp_Image_2026-02-01_at_23.05.51_mvrcv5.jpg', isPrimary: false },
            { url: 'https://res.cloudinary.com/dlpdbr0ey/image/upload/v1770002889/WhatsApp_Image_2026-02-01_at_23.05.51_3_j5zmjb.jpg', isPrimary: false },
            { url: 'https://res.cloudinary.com/dlpdbr0ey/image/upload/v1770002889/WhatsApp_Image_2026-02-01_at_23.05.51_2_ehexg5.jpg', isPrimary: false }
        ]
    }
];

async function main() {
    console.log('🔌 Verbinde mit der Datenbank...\n');

    const pool = mysql.createPool(DATABASE_URL);

    try {
        // Test connection
        const connection = await pool.getConnection();
        console.log('✅ Datenbankverbindung hergestellt\n');
        connection.release();

        for (const property of properties) {
            console.log(`📍 Erstelle: ${property.title}...`);

            // Insert property
            const [result] = await pool.query(`
                INSERT INTO properties (
                    title, description, type, offer_type, price, size, rooms,
                    city, zip_code, address, features, status, featured, created_at, updated_at
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
            `, [
                property.title,
                property.description,
                property.type,
                property.offer_type,
                property.price,
                property.size,
                property.rooms,
                property.city,
                property.zip_code,
                property.address,
                property.features,
                property.status,
                property.featured ? 1 : 0
            ]);

            const propertyId = result.insertId;
            console.log(`   ✅ Erstellt mit ID: ${propertyId}`);

            // Insert images
            if (property.images && property.images.length > 0) {
                console.log(`   📸 Füge ${property.images.length} Bilder hinzu...`);

                for (let i = 0; i < property.images.length; i++) {
                    const img = property.images[i];
                    await pool.query(`
                        INSERT INTO property_images (property_id, image_url, is_primary, display_order, created_at)
                        VALUES (?, ?, ?, ?, NOW())
                    `, [propertyId, img.url, img.isPrimary ? 1 : 0, i]);
                }
                console.log(`   ✅ Alle Bilder hinzugefügt`);
            }

            console.log('');
        }

        console.log('🎉 Fertig! Beide Immobilien wurden erfolgreich hinzugefügt.\n');
        console.log('Überprüfe die Immobilien unter:');
        console.log('- https://immobilien-ghumman.de/immobilien-angebote.html');
        console.log('- Admin Dashboard: https://immobilien-ghumman.de/admin-dashboard.html');

    } catch (error) {
        console.error('❌ Fehler:', error.message);
        process.exit(1);
    } finally {
        await pool.end();
    }
}

main();
