// Property Management System
// Lädt und zeigt Immobilien aus localStorage

class PropertyManager {
    constructor() {
        this.properties = this.loadProperties();
    }

    // Lade alle Immobilien
    loadProperties() {
        try {
            const stored = localStorage.getItem('properties');
            return stored ? JSON.parse(stored) : [];
        } catch (error) {
            console.error('Fehler beim Laden der Immobilien:', error);
            return [];
        }
    }

    // Hole alle verfügbaren Immobilien
    getAvailableProperties() {
        return this.properties.filter(p => p.status === 'available');
    }

    // Hole Immobilien nach Typ
    getPropertiesByType(type) {
        return this.properties.filter(p => p.type === type && p.status === 'available');
    }

    // Erstelle HTML für Property Card
    createPropertyCard(property) {
        const features = property.features && property.features.length > 0 
            ? property.features.slice(0, 3).map(f => `<span class="feature">${f}</span>`).join('')
            : '<span class="feature">Keine Features</span>';

        const badge = property.featured 
            ? '<div class="property-badge new">Neu</div>' 
            : '';

        return `
            <div class="property-card" data-type="${property.type}" data-rooms="${property.rooms}" data-price="${property.size}" data-size="${property.size}">
                <div class="property-image">
                    <img src="${property.image || 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=400&h=250&fit=crop'}" 
                         alt="${property.title}" loading="lazy">
                    ${badge}
                    <div class="property-favorite" onclick="toggleFavorite(this)">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                        </svg>
                    </div>
                </div>
                <div class="property-info">
                    <div class="property-header">
                        <h4>${property.title}</h4>
                        <div class="property-price">${property.price}</div>
                    </div>
                    <p class="property-location">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
                        </svg>
                        ${property.location}
                    </p>
                    <div class="property-details">
                        <div class="detail-item">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-8 16H9v-6h2v6zm4 0h-2v-8h2v8zm4 0h-2V7h2v12z"/>
                            </svg>
                            <span>${property.size} m²</span>
                        </div>
                        <div class="detail-item">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M7 13c1.66 0 3-1.34 3-3S8.66 7 7 7s-3 1.34-3 3 1.34 3 3 3zm12-6h-8v7H9v5h4v-2h8V7z"/>
                            </svg>
                            <span>${property.rooms} Zimmer</span>
                        </div>
                        <div class="detail-item">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                            </svg>
                            <span>Baujahr ${property.year || 'N/A'}</span>
                        </div>
                    </div>
                    <div class="property-features">
                        ${features}
                    </div>
                    <div class="property-actions">
                        <button class="details-btn" onclick="window.location.href='property-detail.html?id=${property.id}'">
                            Details ansehen
                        </button>
                        <button class="contact-btn" onclick="openContactModal('${property.title}')">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z"/>
                            </svg>
                            Kontakt
                        </button>
                    </div>
                </div>
            </div>
        `;
    }

    // Lade Immobilien in Container
    loadIntoContainer(containerId, limit = null) {
        const container = document.getElementById(containerId);
        if (!container) {
            console.warn(`Container ${containerId} nicht gefunden`);
            return;
        }

        const properties = this.getAvailableProperties();
        const displayProperties = limit ? properties.slice(0, limit) : properties;

        if (displayProperties.length === 0) {
            container.innerHTML = `
                <div style="grid-column: 1/-1; text-align: center; padding: 60px 20px; color: #64748b;">
                    <svg width="80" height="80" viewBox="0 0 24 24" fill="currentColor" style="opacity: 0.3; margin-bottom: 20px;">
                        <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/>
                    </svg>
                    <h3>Keine Immobilien verfügbar</h3>
                    <p>Derzeit sind keine Immobilien in unserem System verfügbar.</p>
                </div>
            `;
            return;
        }

        container.innerHTML = displayProperties.map(property => 
            this.createPropertyCard(property)
        ).join('');
    }
}

// Globale Instanz
const propertyManager = new PropertyManager();

// Helper-Funktionen
function toggleFavorite(element) {
    element.classList.toggle('active');
    
    const propertyCard = element.closest('.property-card');
    const propertyTitle = propertyCard.querySelector('h4').textContent;
    
    let favorites = JSON.parse(localStorage.getItem('favorite-properties')) || [];
    
    if (element.classList.contains('active')) {
        if (!favorites.includes(propertyTitle)) {
            favorites.push(propertyTitle);
        }
    } else {
        favorites = favorites.filter(title => title !== propertyTitle);
    }
    
    localStorage.setItem('favorite-properties', JSON.stringify(favorites));
}

function openContactModal(propertyTitle) {
    // Hier kann eine Modal-Implementierung erfolgen
    const message = `Ich interessiere mich für die Immobilie: ${propertyTitle}`;
    const whatsappUrl = `https://wa.me/4916098787878?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
}

// Auto-Load wenn Seite geladen wird
document.addEventListener('DOMContentLoaded', function() {
    // Für index.html - zeige maximal 3 Immobilien
    if (document.getElementById('propertiesGrid')) {
        propertyManager.loadIntoContainer('propertiesGrid', 3);
    }
    
    // Für immobilien-angebote.html - zeige alle
    if (document.getElementById('properties-grid')) {
        propertyManager.loadIntoContainer('properties-grid');
    }

    // Lade Favoriten
    const favorites = JSON.parse(localStorage.getItem('favorite-properties')) || [];
    document.querySelectorAll('.property-card').forEach(card => {
        const title = card.querySelector('h4').textContent;
        if (favorites.includes(title)) {
            card.querySelector('.property-favorite').classList.add('active');
        }
    });
});

// Export für andere Module
if (typeof module !== 'undefined' && module.exports) {
    module.exports = PropertyManager;
}
