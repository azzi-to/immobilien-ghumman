/**
 * Statische Immobilien-Daten als Fallback
 * Diese werden angezeigt, wenn die API nicht verfügbar ist
 * 
 * Stand: Februar 2026
 */

const STATIC_PROPERTIES = [
    {
        id: 'usingen-3z-2026',
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

🎬 Video-Tour verfügbar!

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
        features: ['Neubau', 'Einbauküche', 'Badezimmer mit Dusche', 'Gäste-WC', 'Großer Balkon (8 m²)', 'Garten', '3 Parkplätze', 'Abstellraum'],
        status: 'available',
        featured: true,
        primary_image: 'https://res.cloudinary.com/dlpdbr0ey/image/upload/v1758552673/1758059506092_asauj1.png',
        images: ['https://res.cloudinary.com/dlpdbr0ey/image/upload/v1758552673/1758059506092_asauj1.png'],
        video_url: 'https://player.cloudinary.com/embed/?cloud_name=dlpdbr0ey&public_id=WhatsApp_Video_2026-02-01_at_23.03.11_jsmxts',
        created_at: '2026-02-01T23:03:11.000Z'
    },
    {
        id: 'karben-2z-moebliert-2026',
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
        features: ['Möbliert', 'Einbauküche', 'Badezimmer mit Dusche', 'Abstellraum', 'Sofort verfügbar'],
        status: 'available',
        featured: true,
        primary_image: 'https://res.cloudinary.com/dlpdbr0ey/image/upload/v1770002887/WhatsApp_Image_2026-02-01_at_23.05.51_4_nr6xyb.jpg',
        images: [
            'https://res.cloudinary.com/dlpdbr0ey/image/upload/v1770002887/WhatsApp_Image_2026-02-01_at_23.05.51_4_nr6xyb.jpg',
            'https://res.cloudinary.com/dlpdbr0ey/image/upload/v1770002887/WhatsApp_Image_2026-02-01_at_23.05.51_5_pnvf9y.jpg',
            'https://res.cloudinary.com/dlpdbr0ey/image/upload/v1770002888/WhatsApp_Image_2026-02-01_at_23.05.51_6_gysngj.jpg',
            'https://res.cloudinary.com/dlpdbr0ey/image/upload/v1770002889/WhatsApp_Image_2026-02-01_at_23.05.51_1_xobsew.jpg',
            'https://res.cloudinary.com/dlpdbr0ey/image/upload/v1770002889/WhatsApp_Image_2026-02-01_at_23.05.51_mvrcv5.jpg',
            'https://res.cloudinary.com/dlpdbr0ey/image/upload/v1770002889/WhatsApp_Image_2026-02-01_at_23.05.51_3_j5zmjb.jpg',
            'https://res.cloudinary.com/dlpdbr0ey/image/upload/v1770002889/WhatsApp_Image_2026-02-01_at_23.05.51_2_ehexg5.jpg'
        ],
        created_at: '2026-02-01T23:05:51.000Z'
    }
];

/**
 * Gibt statische Immobilien zurück (für Fallback)
 */
function getStaticProperties() {
    return STATIC_PROPERTIES;
}

/**
 * Gibt eine einzelne statische Immobilie nach ID zurück
 */
function getStaticPropertyById(id) {
    return STATIC_PROPERTIES.find(p => p.id === id || p.id === parseInt(id));
}

// Export für Module
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { STATIC_PROPERTIES, getStaticProperties, getStaticPropertyById };
}
