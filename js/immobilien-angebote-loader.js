/**
 * IMMOBILIEN ANGEBOTE LOADER
 * Lädt und kategorisiert alle Immobilien für die Angebote-Seite
 * 
 * Kategorien:
 * - NEU: Immobilien, die weniger als 14 Tage alt sind
 * - ARCHIV: Ältere Immobilien
 */

document.addEventListener('DOMContentLoaded', async function () {
    await loadAllProperties();
});

/**
 * Lädt ALLE Immobilien für die Angebote-Seite
 * Sortiert nach Datum: Neueste zuerst, ältere weiter unten
 */
async function loadAllProperties() {
    const propertiesContainer = document.getElementById('properties-grid') || document.getElementById('propertiesGrid');
    if (!propertiesContainer) {
        console.warn('Properties container not found');
        return;
    }

    propertiesContainer.innerHTML = '<div class="loading-message">🏠 Immobilien werden geladen...</div>';

    try {
        // Check if API client is available
        if (typeof PropertyAPI === 'undefined') {
            console.error('PropertyAPI not available');
            propertiesContainer.innerHTML = `
                <div class="error-message">
                    <p>⚠️ Verbindung zum Server konnte nicht hergestellt werden.</p>
                </div>
            `;
            return;
        }

        const api = new PropertyAPI();

        // Kategorisierte Immobilien laden (neu vs. archiviert)
        const { recent, archived, total } = await api.getCategorizedProperties(14); // 14 Tage Schwelle

        propertiesContainer.innerHTML = '';

        if (total === 0) {
            propertiesContainer.innerHTML = `
                <div class="empty-state">
                    <h3>🏠 Derzeit keine Immobilien verfügbar</h3>
                    <p>Schauen Sie bald wieder vorbei oder kontaktieren Sie uns für individuelle Anfragen!</p>
                    <a href="index.html#contact" class="cta-button" style="margin-top: 20px;">Kontakt aufnehmen</a>
                </div>
            `;
            return;
        }

        // === NEUE IMMOBILIEN SEKTION ===
        if (recent.length > 0) {
            const newSection = document.createElement('div');
            newSection.className = 'property-section new-properties-section';
            newSection.innerHTML = `
                <h3 class="section-subtitle">🆕 Neue Angebote <span class="count-badge">${recent.length}</span></h3>
                <div class="properties-grid-inner" id="new-properties-grid"></div>
            `;
            propertiesContainer.appendChild(newSection);

            const newGrid = document.getElementById('new-properties-grid');
            recent.forEach(property => {
                const propertyData = convertPropertyData(property, true);
                const card = createAngebotePropertyCard(propertyData);
                newGrid.appendChild(card);
            });
        }

        // === WEITERE/ARCHIVIERTE IMMOBILIEN SEKTION ===
        if (archived.length > 0) {
            const archiveSection = document.createElement('div');
            archiveSection.className = 'property-section archive-section';
            archiveSection.innerHTML = `
                <h3 class="section-subtitle">📁 Weitere Angebote <span class="count-badge">${archived.length}</span></h3>
                <div class="properties-grid-inner" id="archive-properties-grid"></div>
            `;
            propertiesContainer.appendChild(archiveSection);

            const archiveGrid = document.getElementById('archive-properties-grid');
            archived.forEach(property => {
                const propertyData = convertPropertyData(property, false);
                const card = createAngebotePropertyCard(propertyData);
                archiveGrid.appendChild(card);
            });
        }

        console.log(`✅ Loaded ${total} properties (${recent.length} new, ${archived.length} archived)`);

    } catch (error) {
        console.error('Error loading properties:', error);
        propertiesContainer.innerHTML = `
            <div class="error-message">
                <p>⚠️ Fehler beim Laden der Immobilien.</p>
                <p>Bitte versuchen Sie es später erneut oder kontaktieren Sie uns.</p>
                <a href="index.html#contact" class="cta-button" style="margin-top: 15px;">Kontakt</a>
            </div>
        `;
    }
}

/**
 * Konvertiert API Property-Daten in Card-Format
 * @param {Object} property - Raw property data from API
 * @param {boolean} isNew - Whether to show "NEU" badge
 * @returns {Object} - Formatted property data
 */
function convertPropertyData(property, isNew = false) {
    return {
        id: property.id,
        title: property.title,
        location: property.city?.toLowerCase().replace(/\s+/g, '-') || 'unbekannt',
        locationName: property.city || 'Unbekannt',
        price: property.price,
        pricingType: property.offer_type === 'kauf' ? 'Kaufpreis' : 'Kaltmiete',
        rooms: property.rooms,
        area: property.size,
        type: property.type,
        image: property.primary_image || property.images?.[0] || 'https://via.placeholder.com/400x300?text=Kein+Bild',
        images: property.images || [property.primary_image],
        description: property.description || '',
        features: property.features || [],
        isNew: isNew,
        createdAt: property.created_at
    };
}

/**
 * Erstellt eine Property Card für die Angebote-Seite
 * @param {Object} property - Property data
 * @returns {HTMLElement} - Property card element
 */
function createAngebotePropertyCard(property) {
    const card = document.createElement('div');
    card.className = 'property-card';
    card.dataset.type = property.type;
    card.dataset.price = property.price;
    card.dataset.location = property.location;

    const formatPrice = (price) => {
        return new Intl.NumberFormat('de-DE').format(price);
    };

    const getTypeLabel = (type) => {
        const types = {
            'haus': 'Haus',
            'wohnung': 'Wohnung',
            'gewerbe': 'Gewerbe',
            'grundstück': 'Grundstück'
        };
        return types[type] || type;
    };

    // Truncate description if too long
    const shortDescription = property.description.length > 120
        ? property.description.substring(0, 120) + '...'
        : property.description;

    // NEU-Badge HTML nur wenn property.isNew = true
    const newBadgeHTML = property.isNew ? '<span class="new-badge">NEU</span>' : '';

    card.innerHTML = `
        ${newBadgeHTML}
        <div class="property-image">
            <img src="${property.image}" alt="${property.title}" loading="lazy">
        </div>
        <div class="property-content">
            <div class="property-price">€ ${formatPrice(property.price)}${property.pricingType ? ` / ${property.pricingType}` : ''}</div>
            <h3 class="property-title">${property.title}</h3>
            <div class="property-location">📍 ${property.locationName}</div>
            <div class="property-features">
                ${property.rooms > 0 ? `<span>🏠 ${property.rooms} Zimmer</span>` : ''}
                <span>📐 ${property.area} m²</span>
                <span>🏷️ ${getTypeLabel(property.type)}</span>
            </div>
            <p class="property-description">${shortDescription}</p>
            <div class="property-actions">
                <a href="property-detail.html?id=${property.id}" class="cta-button">Details ansehen</a>
            </div>
        </div>
    `;

    return card;
}

/**
 * Filter properties by type
 * @param {string} type - Property type to filter
 */
function filterByType(type) {
    const cards = document.querySelectorAll('.property-card');

    cards.forEach(card => {
        if (type === 'all' || card.dataset.type === type) {
            card.style.display = 'block';
        } else {
            card.style.display = 'none';
        }
    });

    // Update active filter button
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.classList.remove('active');
        if (btn.dataset.filter === type) {
            btn.classList.add('active');
        }
    });
}
