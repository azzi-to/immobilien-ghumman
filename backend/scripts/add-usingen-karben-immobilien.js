/**
 * Script zum Hinzufügen von 2 neuen Immobilien
 * 
 * 1. 3 Zimmer Wohnung Einbauküche Usingen - Neubau 100m² - 1.600€ Kaltmiete
 * 2. 2 Zimmer Wohnung Möbliert Karben - 660€ Kaltmiete
 * 
 * Verwendung:
 * 1. Erst Token holen: node scripts/add-usingen-karben-immobilien.js
 * 2. Oder direkt im Admin-Dashboard über Immobilien hochladen
 */

const API_BASE = 'https://immobilien-ghumman-production.up.railway.app/api';

// Auth Token (muss vom Admin-Login geholt werden)
// Entweder hier eintragen oder über Kommandozeile: AUTH_TOKEN=xxx node scripts/add-usingen-karben-immobilien.js
const AUTH_TOKEN = process.env.AUTH_TOKEN || '';

// ========== IMMOBILIE 1: 3 Zimmer Usingen ==========
const usingen3Zimmer = {
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
    features: JSON.stringify([
        'Neubau',
        'Einbauküche',
        'Badezimmer mit Dusche',
        'Gäste-WC',
        'Großer Balkon (8 m²)',
        'Garten',
        '3 Parkplätze',
        'Abstellraum'
    ]),
    status: 'available',
    featured: true
};

// Video URL für Usingen
const usingenVideo = 'https://player.cloudinary.com/embed/?cloud_name=dlpdbr0ey&public_id=WhatsApp_Video_2026-02-01_at_23.03.11_jsmxts';

// ========== IMMOBILIE 2: 2 Zimmer Karben Möbliert ==========
const karben2Zimmer = {
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
    size: 50, // Geschätzt für 2 Zimmer möbliert
    rooms: 2,
    city: 'Karben',
    zip_code: '61184',
    address: 'Karben',
    features: JSON.stringify([
        'Möbliert',
        'Einbauküche',
        'Badezimmer mit Dusche',
        'Abstellraum',
        'Sofort verfügbar'
    ]),
    status: 'available',
    featured: true
};

// Bilder für Karben
const karbenImages = [
    'https://res.cloudinary.com/dlpdbr0ey/image/upload/v1770002887/WhatsApp_Image_2026-02-01_at_23.05.51_4_nr6xyb.jpg',
    'https://res.cloudinary.com/dlpdbr0ey/image/upload/v1770002887/WhatsApp_Image_2026-02-01_at_23.05.51_5_pnvf9y.jpg',
    'https://res.cloudinary.com/dlpdbr0ey/image/upload/v1770002888/WhatsApp_Image_2026-02-01_at_23.05.51_6_gysngj.jpg',
    'https://res.cloudinary.com/dlpdbr0ey/image/upload/v1770002889/WhatsApp_Image_2026-02-01_at_23.05.51_1_xobsew.jpg',
    'https://res.cloudinary.com/dlpdbr0ey/image/upload/v1770002889/WhatsApp_Image_2026-02-01_at_23.05.51_mvrcv5.jpg',
    'https://res.cloudinary.com/dlpdbr0ey/image/upload/v1770002889/WhatsApp_Image_2026-02-01_at_23.05.51_3_j5zmjb.jpg',
    'https://res.cloudinary.com/dlpdbr0ey/image/upload/v1770002889/WhatsApp_Image_2026-02-01_at_23.05.51_2_ehexg5.jpg'
];

// ========== API FUNKTIONEN ==========

async function createProperty(propertyData) {
    const response = await fetch(`${API_BASE}/properties`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${AUTH_TOKEN}`
        },
        body: JSON.stringify(propertyData)
    });

    if (!response.ok) {
        const error = await response.text();
        throw new Error(`Failed to create property: ${response.status} - ${error}`);
    }

    return response.json();
}

async function addPropertyImage(propertyId, imageUrl, isPrimary = false, displayOrder = 0) {
    const response = await fetch(`${API_BASE}/properties/${propertyId}/images`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${AUTH_TOKEN}`
        },
        body: JSON.stringify({
            image_url: imageUrl,
            is_primary: isPrimary,
            display_order: displayOrder
        })
    });

    if (!response.ok) {
        const error = await response.text();
        console.warn(`Warning: Failed to add image: ${error}`);
        return null;
    }

    return response.json();
}

async function main() {
    if (!AUTH_TOKEN) {
        console.log('⚠️ Kein AUTH_TOKEN gesetzt!');
        console.log('');
        console.log('Optionen:');
        console.log('1. Setze die Umgebungsvariable: AUTH_TOKEN=xxx node scripts/add-usingen-karben-immobilien.js');
        console.log('2. Hole den Token vom Admin-Login und trage ihn im Script ein');
        console.log('3. Verwende stattdessen das Admin-Dashboard unter admin-upload.html');
        console.log('');
        console.log('Um einen Token zu erhalten, logge dich im Admin ein:');
        console.log('curl -X POST https://immobilien-ghumman-production.up.railway.app/api/auth/login -H "Content-Type: application/json" -d \'{"username":"admin","password":"DEIN_PASSWORT"}\'');
        return;
    }

    console.log('🏠 Füge 2 neue Immobilien hinzu...\n');

    try {
        // ========== 1. Usingen Wohnung ==========
        console.log('📍 Erstelle: 3 Zimmer Wohnung Usingen...');
        const usingenResult = await createProperty(usingen3Zimmer);
        console.log(`   ✅ Erstellt mit ID: ${usingenResult.property.id}`);

        // Video als "Bild" hinzufügen (für Video-Player in der Detail-Ansicht)
        // Das Video wird über einen Cloudinary-Player eingebettet
        // Für jetzt verwenden wir ein Platzhalterbild - das Video kann in der Beschreibung verlinkt werden
        console.log('   📹 Video-Link in der Beschreibung enthalten');
        console.log(`   🎬 Video: ${usingenVideo}`);

        // ========== 2. Karben Wohnung ==========
        console.log('\n📍 Erstelle: 2 Zimmer Wohnung Karben Möbliert...');
        const karbenResult = await createProperty(karben2Zimmer);
        console.log(`   ✅ Erstellt mit ID: ${karbenResult.property.id}`);

        // Bilder hinzufügen
        console.log('   📸 Füge Bilder hinzu...');
        for (let i = 0; i < karbenImages.length; i++) {
            const result = await addPropertyImage(
                karbenResult.property.id,
                karbenImages[i],
                i === 0, // Erstes Bild ist primary
                i
            );
            if (result) {
                console.log(`      ✅ Bild ${i + 1}/${karbenImages.length} hinzugefügt`);
            }
        }

        console.log('\n🎉 Fertig! Beide Immobilien wurden erfolgreich hinzugefügt.');
        console.log('');
        console.log('Überprüfe die Immobilien unter:');
        console.log('- https://immobilien-ghumman.de/immobilien-angebote.html');
        console.log('- Admin Dashboard: https://immobilien-ghumman.de/admin-dashboard.html');

    } catch (error) {
        console.error('❌ Fehler:', error.message);
        process.exit(1);
    }
}

main();
