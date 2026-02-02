/**
 * Script: Add Karben Apartments via Production API
 * Two furnished 2-room apartments in Karben
 * 
 * USAGE:
 * 1. First, get an auth token by logging in to admin-login.html
 * 2. Copy the token from localStorage (F12 > Application > Local Storage > authToken)
 * 3. Run: node scripts/add-karben-properties.js <AUTH_TOKEN>
 * 
 * OR simply use the admin-upload.html page in your browser.
 */

const https = require('https');

const API_BASE = 'https://immobilien-ghumman-production.up.railway.app';

// Helper to make HTTPS requests
function apiRequest(method, endpoint, data = null, authToken = null) {
    return new Promise((resolve, reject) => {
        const url = new URL(API_BASE + endpoint);
        const options = {
            hostname: url.hostname,
            port: 443,
            path: url.pathname + url.search,
            method: method,
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            }
        };
        
        if (authToken) {
            options.headers['Authorization'] = `Bearer ${authToken}`;
        }
        
        const req = https.request(options, (res) => {
            let body = '';
            res.on('data', chunk => body += chunk);
            res.on('end', () => {
                try {
                    const json = JSON.parse(body);
                    if (res.statusCode >= 200 && res.statusCode < 300) {
                        resolve(json);
                    } else {
                        reject({ status: res.statusCode, ...json });
                    }
                } catch (e) {
                    reject({ status: res.statusCode, error: body });
                }
            });
        });
        
        req.on('error', reject);
        
        if (data) {
            req.write(JSON.stringify(data));
        }
        req.end();
    });
}

// Add images to a property
async function addImages(propertyId, images, authToken) {
    for (const img of images) {
        try {
            await apiRequest('POST', `/api/properties/${propertyId}/images`, {
                image_url: img.url,
                is_primary: img.primary
            }, authToken);
            console.log(`   📷 Added image: ${img.url.split('/').pop()}`);
        } catch (error) {
            console.error(`   ⚠️ Failed to add image:`, error.error || error);
        }
    }
}

// Add properties via API
async function addKarbenProperties(authToken) {
    console.log('\n📦 Adding Karben properties via Production API...\n');
    
    try {
        // =====================================================
        // Property 1: 2 Zimmer Wohnung Möbliert - 1600€ Kaltmiete
        // =====================================================
        console.log('Creating Property 1 (1.600€ Kaltmiete)...');
        
        const property1Data = {
            title: '2 Zimmer Wohnung Möbliert Karben - Premium',
            description: `Moderne, möblierte 2-Zimmer-Wohnung in Karben - Ab Sofort frei!

Diese komplett möblierte Wohnung bietet alles, was Sie für ein komfortables Wohnen benötigen:

• 1 Einbauküche (voll ausgestattet)
• 1 Wohnzimmer (möbliert)
• 1 Schlafzimmer (möbliert)
• 1 Badezimmer mit Dusche
• 1 Abstellraum
• 1 Flur

Die Wohnung ist ideal für Singles oder Paare, die eine bezugsfertige Unterkunft suchen.

Mietkonditionen:
- Kaltmiete: 1.600,00 €
- Nebenkosten: 220,00 €
- Heizkosten: 80,00 €
- Warmmiete: 1.900,00 €
- Kaution: 2.000,00 €

Kontakt:
Immobilien Ghumman
Mobil: 0160 98 78 78 78`,
            type: 'wohnung',
            offer_type: 'miete',
            price: 1600,
            size: 55,
            rooms: 2,
            bathrooms: 1,
            location: 'Karben',
            city: 'Karben',
            zip_code: '61184',
            status: 'available',
            featured: true,
            features: ['Möbliert', 'Einbauküche', 'Dusche', 'Abstellraum', 'Sofort verfügbar']
        };

        const result1 = await apiRequest('POST', '/api/properties', property1Data, authToken);
        console.log(`✅ Property 1 created with ID: ${result1.property.id}`);

        // Add video thumbnail as image for Property 1
        const images1 = [
            { url: 'https://res.cloudinary.com/dlpdbr0ey/video/upload/so_0/WhatsApp_Video_2026-02-01_at_23.03.11_jsmxts.jpg', primary: true }
        ];
        await addImages(result1.property.id, images1, authToken);

        // =====================================================
        // Property 2: 2 Zimmer Wohnung Möbliert - 660€ Kaltmiete
        // =====================================================
        console.log('\nCreating Property 2 (660€ Kaltmiete)...');
        
        const property2Data = {
            title: '2 Zimmer Wohnung Möbliert Karben - Günstig',
            description: `Gemütliche, möblierte 2-Zimmer-Wohnung in Karben - Ab Sofort frei!

Diese komplett möblierte Wohnung bietet alles, was Sie für ein komfortables Wohnen benötigen:

• 1 Einbauküche (voll ausgestattet)
• 1 Wohnzimmer (möbliert)
• 1 Schlafzimmer (möbliert)
• 1 Badezimmer mit Dusche
• 1 Abstellraum
• 1 Flur

Perfekt für Singles oder Paare, die eine bezugsfertige und günstige Unterkunft suchen.

Mietkonditionen:
- Kaltmiete: 660,00 €
- Nebenkosten: 140,00 €
- Heizkosten: 60,00 €
- Warmmiete: 860,00 €
- Kaution: 2.000,00 €

Kontakt:
Immobilien Ghumman
Mobil: 0160 98 78 78 78`,
            type: 'wohnung',
            offer_type: 'miete',
            price: 660,
            size: 45,
            rooms: 2,
            bathrooms: 1,
            location: 'Karben',
            city: 'Karben',
            zip_code: '61184',
            status: 'available',
            featured: true,
            features: ['Möbliert', 'Einbauküche', 'Dusche', 'Abstellraum', 'Sofort verfügbar']
        };

        const result2 = await apiRequest('POST', '/api/properties', property2Data, authToken);
        console.log(`✅ Property 2 created with ID: ${result2.property.id}`);

        // Add all images for Property 2
        const images2 = [
            { url: 'https://res.cloudinary.com/dlpdbr0ey/image/upload/v1770002887/WhatsApp_Image_2026-02-01_at_23.05.51_4_nr6xyb.jpg', primary: true },
            { url: 'https://res.cloudinary.com/dlpdbr0ey/image/upload/v1770002887/WhatsApp_Image_2026-02-01_at_23.05.51_5_pnvf9y.jpg', primary: false },
            { url: 'https://res.cloudinary.com/dlpdbr0ey/image/upload/v1770002888/WhatsApp_Image_2026-02-01_at_23.05.51_6_gysngj.jpg', primary: false },
            { url: 'https://res.cloudinary.com/dlpdbr0ey/image/upload/v1770002889/WhatsApp_Image_2026-02-01_at_23.05.51_1_xobsew.jpg', primary: false },
            { url: 'https://res.cloudinary.com/dlpdbr0ey/image/upload/v1770002889/WhatsApp_Image_2026-02-01_at_23.05.51_mvrcv5.jpg', primary: false },
            { url: 'https://res.cloudinary.com/dlpdbr0ey/image/upload/v1770002889/WhatsApp_Image_2026-02-01_at_23.05.51_3_j5zmjb.jpg', primary: false },
            { url: 'https://res.cloudinary.com/dlpdbr0ey/image/upload/v1770002889/WhatsApp_Image_2026-02-01_at_23.05.51_2_ehexg5.jpg', primary: false }
        ];
        await addImages(result2.property.id, images2, authToken);

        console.log('\n========================================');
        console.log('✅ Both properties successfully added!');
        console.log('========================================');
        console.log(`\nProperty 1 (1.600€): ID ${result1.property.id}`);
        console.log(`Property 2 (660€): ID ${result2.property.id}`);
        console.log('\nThe properties will now appear on:');
        console.log('- https://immobilienghumman.de/ (if among newest 3)');
        console.log('- https://immobilienghumman.de/immobilien-angebote.html');
        console.log('- Admin Dashboard');

    } catch (error) {
        console.error('\n❌ Error adding properties:', error.error || error.message || error);
        if (error.status === 401) {
            console.log('\n⚠️ Authentication failed. Please check your auth token.');
            console.log('Get a new token by logging in at: https://immobilienghumman.de/admin-login.html');
        }
        process.exit(1);
    }
}

// Main
const args = process.argv.slice(2);

if (args.length === 0) {
    console.log(`
╔════════════════════════════════════════════════════════════════╗
║         ADD KARBEN PROPERTIES TO DATABASE                       ║
╠════════════════════════════════════════════════════════════════╣
║                                                                 ║
║  Two 2-room furnished apartments in Karben:                    ║
║  1. Premium - 1.600€ Kaltmiete (with video)                    ║
║  2. Günstig - 660€ Kaltmiete (with 7 images)                   ║
║                                                                 ║
╠════════════════════════════════════════════════════════════════╣
║  USAGE:                                                         ║
║                                                                 ║
║  1. Login to admin-login.html in browser                       ║
║  2. Open DevTools (F12) > Application > Local Storage          ║
║  3. Copy the 'authToken' value                                 ║
║  4. Run: node scripts/add-karben-properties.js <TOKEN>         ║
║                                                                 ║
║  OR simply use admin-upload.html to add manually.              ║
║                                                                 ║
╚════════════════════════════════════════════════════════════════╝
`);
} else {
    const authToken = args[0];
    addKarbenProperties(authToken);
}
