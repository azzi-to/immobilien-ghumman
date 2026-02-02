/**
 * Property Detail Page Loader
 * Loads specific property from database and displays it
 * Falls API nicht verfügbar: Fallback auf statische Daten
 */

// Gallery state
let currentImageIndex = 0;
let propertyImages = [];

/**
 * Load property from URL parameter
 */
async function loadPropertyDetails() {
    // Get property ID from URL
    const urlParams = new URLSearchParams(window.location.search);
    const propertyId = urlParams.get('id');
    
    if (!propertyId) {
        showError('Keine Immobilien-ID angegeben');
        return;
    }
    
    let property = null;
    
    try {
        // Show loading state
        showLoading();
        
        // Check if API client is available
        if (typeof PropertyAPI !== 'undefined') {
            const api = new PropertyAPI();
            property = await api.getProperty(propertyId);
        }
    } catch (error) {
        console.warn('API error, trying static fallback:', error.message);
    }
    
    // Fallback auf statische Daten
    if (!property && typeof getStaticPropertyById !== 'undefined') {
        console.log('Using static property data for ID:', propertyId);
        property = getStaticPropertyById(propertyId);
    }
    
    if (!property) {
        showError('Immobilie nicht gefunden');
        return;
    }
    
    // Display property details
    displayProperty(property);
}

/**
 * Display property details on the page
 */
function displayProperty(property) {
    // Update page title
    document.title = `${property.title} - ${property.city} | Immobilien Ghumman`;
    
    // Update hero section
    updateHeroSection(property);
    
    // Update key facts
    updateKeyFacts(property);
    
    // Update gallery
    updateGallery(property);
    
    // Update description (includes ALL data)
    updateDescription(property);
    
    // Update features
    updateFeatures(property);
    
    // Update location info (includes ALL location data)
    updateLocation(property);
    
    // Add complete property info section
    addCompletePropertyInfo(property);
    
    // Update structured data
    updateStructuredData(property);
    
    // Hide loading
    hideLoading();
    
    // Log property for debugging
    console.log('Property loaded:', property);
}

/**
 * Update hero section
 */
function updateHeroSection(property) {
    const heroSection = document.querySelector('.property-hero');
    const title = document.querySelector('.property-title h1');
    const location = document.querySelector('.property-location');
    const priceElement = document.querySelector('.property-price');
    
    // Update background image if available
    if (property.primary_image || (property.images && property.images.length > 0)) {
        const bgImage = property.primary_image || property.images[0].image_url;
        heroSection.style.backgroundImage = `linear-gradient(rgba(44, 62, 80, 0.8), rgba(52, 73, 94, 0.85)), url('${bgImage}')`;
    }
    
    // Update title
    if (title) {
        const typeLabel = getTypeLabel(property.type);
        title.innerHTML = `${typeLabel}: <span id="typewriter-text-property">${property.title}</span><span class="cursor">|</span>`;
    }
    
    // Update location
    if (location) {
        location.innerHTML = `
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" style="vertical-align: middle; margin-right: 8px;">
                <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
            </svg>
            ${property.city}${property.address ? ', ' + property.address : ''}
        `;
    }
    
    // Update price
    if (priceElement) {
        const formattedPrice = new Intl.NumberFormat('de-DE').format(property.price);
        const priceType = property.offer_type === 'kauf' ? 'Kaufpreis' : 'Monat';
        priceElement.textContent = `€ ${formattedPrice} / ${priceType}`;
    }
}

/**
 * Update key facts section - Shows ALL uploaded property data
 */
function updateKeyFacts(property) {
    const keyFactsContainer = document.querySelector('.key-facts');
    if (!keyFactsContainer) return;
    
    const facts = [];
    
    // Size (Wohnfläche)
    if (property.size) {
        facts.push({
            icon: `<path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-8 16H9v-6h2v6zm4 0h-2v-8h2v8zm4 0h-2V7h2v12z"/>`,
            label: `${property.size} m²`,
            sublabel: 'Wohnfläche'
        });
    }
    
    // Rooms (Zimmer)
    if (property.rooms) {
        facts.push({
            icon: `<path d="M7 13c1.66 0 3-1.34 3-3S8.66 7 7 7s-3 1.34-3 3 1.34 3 3 3zm12-6h-8v7H9v5h4v-2h8V7z"/>`,
            label: `${property.rooms} Zimmer`,
            sublabel: property.rooms > 1 ? 'Mehrere Zimmer' : 'Ein Zimmer'
        });
    }
    
    // Bathrooms (Badezimmer)
    if (property.bathrooms) {
        facts.push({
            icon: `<path d="M20 2H4c-1 0-2 .9-2 2v16c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zM7 18c-.55 0-1-.45-1-1s.45-1 1-1 1 .45 1 1-.45 1-1 1zm0-3c-.55 0-1-.45-1-1s.45-1 1-1 1 .45 1 1-.45 1-1 1zm0-3c-.55 0-1-.45-1-1s.45-1 1-1 1 .45 1 1-.45 1-1 1zm10 6c-.55 0-1-.45-1-1s.45-1 1-1 1 .45 1 1-.45 1-1 1zm0-3c-.55 0-1-.45-1-1s.45-1 1-1 1 .45 1 1-.45 1-1 1zm0-3c-.55 0-1-.45-1-1s.45-1 1-1 1 .45 1 1-.45 1-1 1z"/>`,
            label: `${property.bathrooms} ${property.bathrooms === 1 ? 'Badezimmer' : 'Bäder'}`,
            sublabel: 'Sanitärräume'
        });
    }
    
    // Year built (Baujahr)
    if (property.year_built) {
        const age = new Date().getFullYear() - property.year_built;
        facts.push({
            icon: `<path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>`,
            label: `Baujahr ${property.year_built}`,
            sublabel: age <= 5 ? 'Neubau' : age <= 15 ? 'Modernisiert' : 'Bestand'
        });
    }
    
    // Offer type (Miete/Kauf)
    if (property.offer_type) {
        const offerIcon = property.offer_type === 'kauf' 
            ? `<path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1.41 16.09V20h-2.67v-1.93c-1.71-.36-3.16-1.46-3.27-3.4h1.96c.1 1.05.82 1.87 2.65 1.87 1.96 0 2.4-.98 2.4-1.59 0-.83-.44-1.61-2.67-2.14-2.48-.6-4.18-1.62-4.18-3.67 0-1.72 1.39-2.84 3.11-3.21V4h2.67v1.95c1.86.45 2.79 1.86 2.85 3.39H14.3c-.05-1.11-.64-1.87-2.22-1.87-1.5 0-2.4.68-2.4 1.64 0 .84.65 1.39 2.67 1.91s4.18 1.39 4.18 3.91c-.01 1.83-1.38 2.83-3.12 3.16z"/>`
            : `<path d="M11.8 10.9c-2.27-.59-3-1.2-3-2.15 0-1.09 1.01-1.85 2.7-1.85 1.78 0 2.44.85 2.5 2.1h2.21c-.07-1.72-1.12-3.3-3.21-3.81V3h-3v2.16c-1.94.42-3.5 1.68-3.5 3.61 0 2.31 1.91 3.46 4.7 4.13 2.5.6 3 1.48 3 2.41 0 .69-.49 1.79-2.7 1.79-2.06 0-2.87-.92-2.98-2.1h-2.2c.12 2.19 1.76 3.42 3.68 3.83V21h3v-2.15c1.95-.37 3.5-1.5 3.5-3.55 0-2.84-2.43-3.81-4.7-4.4z"/>`;
        
        facts.push({
            icon: offerIcon,
            label: property.offer_type === 'kauf' ? 'Kaufobjekt' : 'Mietobjekt',
            sublabel: property.offer_type === 'kauf' ? 'Zum Verkauf' : 'Zur Miete'
        });
    }
    
    // Type (Wohnung/Haus/etc.)
    if (property.type) {
        const typeLabels = {
            'wohnung': { label: 'Wohnung', sublabel: 'Eigentumswohnung' },
            'haus': { label: 'Haus', sublabel: 'Einfamilienhaus' },
            'gewerbe': { label: 'Gewerbe', sublabel: 'Gewerbeobjekt' },
            'grundstück': { label: 'Grundstück', sublabel: 'Bauland' }
        };
        const typeInfo = typeLabels[property.type] || { label: property.type, sublabel: 'Immobilie' };
        
        facts.push({
            icon: `<path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/>`,
            label: typeInfo.label,
            sublabel: typeInfo.sublabel
        });
    }
    
    // Availability (Verfügbarkeit)
    const availabilityText = property.available_from ? new Date(property.available_from).toLocaleDateString('de-DE') : 'ab sofort';
    facts.push({
        icon: `<path d="M9 11H7v2h2v-2zm4 0h-2v2h2v-2zm4 0h-2v2h2v-2zm2-7h-1V2h-2v2H8V2H6v2H5c-1.11 0-1.99.9-1.99 2L3 20c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 16H5V9h14v11z"/>`,
        label: 'Verfügbar',
        sublabel: availabilityText
    });
    
    // Generate HTML
    keyFactsContainer.innerHTML = facts.map(fact => `
        <div class="fact-item">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" class="animated-icon">
                ${fact.icon}
            </svg>
            <div>
                <strong>${fact.label}</strong>
                <span>${fact.sublabel}</span>
            </div>
        </div>
    `).join('');
}

/**
 * Update gallery with property images
 */
function updateGallery(property) {
    propertyImages = [];
    
    // Collect all images
    if (property.images && property.images.length > 0) {
        propertyImages = property.images.map(img => 
            typeof img === 'string' ? img : img.image_url
        );
    } else if (property.primary_image) {
        propertyImages = [property.primary_image];
    }
    
    if (propertyImages.length === 0) {
        propertyImages = ['https://via.placeholder.com/800x500?text=Kein+Bild+verfügbar'];
    }
    
    // Update main image
    const mainImage = document.getElementById('main-image');
    if (mainImage) {
        mainImage.src = propertyImages[0];
        mainImage.alt = property.title;
    }
    
    // Update thumbnails
    const thumbnailsContainer = document.getElementById('gallery-thumbnails');
    if (thumbnailsContainer) {
        thumbnailsContainer.innerHTML = propertyImages.map((img, index) => `
            <div class="thumbnail ${index === 0 ? 'active' : ''}" onclick="showImage(${index})">
                <img src="${img}" alt="${property.title} - Bild ${index + 1}">
            </div>
        `).join('');
    }
    
    currentImageIndex = 0;
}

/**
 * Update description section - Shows ALL text data
 */
function updateDescription(property) {
    const descSection = document.querySelector('.property-details .content-section');
    if (!descSection) return;
    
    const description = property.description || 'Keine Beschreibung verfügbar.';
    
    // Build comprehensive property information
    let html = `
        <h2>Objektbeschreibung</h2>
        <div class="description-text">
            ${description.split('\n').map(para => para.trim() ? `<p>${para}</p>` : '').join('')}
        </div>
        
        <h3 style="margin-top: 2rem; color: var(--secondary-color);">Objektdaten im Detail</h3>
        <div class="property-data-grid" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 1.5rem; margin-top: 1rem;">
    `;
    
    // Create data sections
    const dataGroups = [];
    
    // Basic Information
    const basicInfo = [];
    if (property.type) basicInfo.push({ label: 'Objektart', value: getTypeLabel(property.type) });
    if (property.offer_type) basicInfo.push({ label: 'Angebotstyp', value: property.offer_type === 'kauf' ? 'Kaufobjekt' : 'Mietobjekt' });
    if (property.price) basicInfo.push({ label: 'Preis', value: `€ ${new Intl.NumberFormat('de-DE').format(property.price)}` });
    if (property.size) basicInfo.push({ label: 'Wohnfläche', value: `${property.size} m²` });
    if (property.rooms) basicInfo.push({ label: 'Zimmer', value: property.rooms });
    if (property.bathrooms) basicInfo.push({ label: 'Badezimmer', value: property.bathrooms });
    
    if (basicInfo.length > 0) {
        dataGroups.push({ title: 'Basisdaten', items: basicInfo });
    }
    
    // Building Information
    const buildingInfo = [];
    if (property.year_built) buildingInfo.push({ label: 'Baujahr', value: property.year_built });
    if (property.status) {
        const statusLabels = {
            'available': 'Verfügbar',
            'reserved': 'Reserviert',
            'sold': 'Verkauft',
            'rented': 'Vermietet'
        };
        buildingInfo.push({ label: 'Status', value: statusLabels[property.status] || property.status });
    }
    
    if (buildingInfo.length > 0) {
        dataGroups.push({ title: 'Gebäudedaten', items: buildingInfo });
    }
    
    // Location Information
    const locationInfo = [];
    if (property.address) locationInfo.push({ label: 'Adresse', value: property.address });
    if (property.zip_code) locationInfo.push({ label: 'PLZ', value: property.zip_code });
    if (property.city) locationInfo.push({ label: 'Stadt', value: property.city });
    if (property.state) locationInfo.push({ label: 'Bundesland', value: property.state });
    if (property.location) locationInfo.push({ label: 'Lage', value: property.location });
    
    if (locationInfo.length > 0) {
        dataGroups.push({ title: 'Lage', items: locationInfo });
    }
    
    // Additional Information
    const additionalInfo = [];
    if (property.created_at) {
        additionalInfo.push({ 
            label: 'Veröffentlicht am', 
            value: new Date(property.created_at).toLocaleDateString('de-DE', { 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
            })
        });
    }
    if (property.views) additionalInfo.push({ label: 'Aufrufe', value: property.views });
    if (property.featured) additionalInfo.push({ label: 'Highlight', value: '⭐ Top-Angebot' });
    
    if (additionalInfo.length > 0) {
        dataGroups.push({ title: 'Weitere Informationen', items: additionalInfo });
    }
    
    // Generate HTML for data groups
    dataGroups.forEach(group => {
        html += `
            <div class="data-group" style="background: white; padding: 1.5rem; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.08);">
                <h4 style="color: var(--primary-color); margin-bottom: 1rem; font-size: 1.1rem;">${group.title}</h4>
                <table style="width: 100%; border-collapse: collapse;">
                    <tbody>
                        ${group.items.map(item => `
                            <tr style="border-bottom: 1px solid #f0f0f0;">
                                <td style="padding: 0.75rem 0; font-weight: 600; color: var(--text-gray);">${item.label}:</td>
                                <td style="padding: 0.75rem 0; text-align: right; color: var(--secondary-color);">${item.value}</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        `;
    });
    
    html += `</div>`;
    
    descSection.innerHTML = html;
}

/**
 * Update features section
 */
function updateFeatures(property) {
    const featuresSection = document.querySelector('.property-features-section');
    if (!featuresSection) {
        // Create features section if it doesn't exist
        const detailsSection = document.querySelector('.property-details');
        if (detailsSection) {
            const newSection = document.createElement('div');
            newSection.className = 'property-features-section';
            detailsSection.appendChild(newSection);
        }
        return updateFeatures(property); // Retry
    }
    
    const features = property.features || [];
    const featuresList = Array.isArray(features) ? features : [];
    
    if (featuresList.length === 0) {
        featuresSection.style.display = 'none';
        return;
    }
    
    featuresSection.style.display = 'block';
    featuresSection.innerHTML = `
        <div class="container">
            <h2>Ausstattung & Merkmale</h2>
            <div class="features-grid">
                ${featuresList.map(feature => `
                    <div class="feature-item">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M9 16.2L4.8 12l-1.4 1.4L9 19 21 7l-1.4-1.4L9 16.2z"/>
                        </svg>
                        <span>${feature}</span>
                    </div>
                `).join('')}
            </div>
        </div>
    `;
}

/**
 * Update location information - Shows ALL location data
 */
function updateLocation(property) {
    const locationSection = document.querySelector('.location-info');
    if (!locationSection) return;
    
    let locationHTML = `
        <div class="container">
            <h2>Lage & Standort</h2>
    `;
    
    // Main location info
    locationHTML += `<div style="background: white; padding: 2rem; border-radius: 12px; box-shadow: 0 2px 10px rgba(0,0,0,0.08); margin-bottom: 2rem;">`;
    
    if (property.city) {
        locationHTML += `<h3 style="color: var(--primary-color); margin-bottom: 1rem;">📍 ${property.city}</h3>`;
    }
    
    if (property.address) {
        locationHTML += `<p style="font-size: 1.1rem; margin-bottom: 0.5rem;"><strong>Adresse:</strong> ${property.address}</p>`;
    }
    
    if (property.zip_code && property.city) {
        locationHTML += `<p style="margin-bottom: 0.5rem;"><strong>PLZ/Ort:</strong> ${property.zip_code} ${property.city}</p>`;
    }
    
    if (property.state) {
        locationHTML += `<p style="margin-bottom: 0.5rem;"><strong>Bundesland:</strong> ${property.state}</p>`;
    }
    
    if (property.country) {
        locationHTML += `<p style="margin-bottom: 0.5rem;"><strong>Land:</strong> ${property.country}</p>`;
    }
    
    if (property.location) {
        locationHTML += `<p style="margin-top: 1rem; color: var(--text-gray); line-height: 1.6;">${property.location}</p>`;
    }
    
    locationHTML += `</div>`;
    
    // Coordinates (if available)
    if (property.latitude && property.longitude) {
        locationHTML += `
            <div style="background: #f8f9fa; padding: 1.5rem; border-radius: 8px; margin-bottom: 2rem;">
                <h4 style="color: var(--secondary-color); margin-bottom: 1rem;">🗺️ Koordinaten</h4>
                <p><strong>Breitengrad:</strong> ${property.latitude}</p>
                <p><strong>Längengrad:</strong> ${property.longitude}</p>
                <a href="https://www.google.com/maps?q=${property.latitude},${property.longitude}" 
                   target="_blank" 
                   class="cta-button" 
                   style="display: inline-block; margin-top: 1rem; padding: 0.75rem 1.5rem; background: var(--primary-color); color: white; text-decoration: none; border-radius: 8px;">
                    📍 Auf Google Maps öffnen
                </a>
            </div>
        `;
    }
    
    locationHTML += `</div>`;
    
    locationSection.innerHTML = locationHTML;
}

/**
 * Add complete property information section - Shows EVERYTHING uploaded
 */
function addCompletePropertyInfo(property) {
    // Find or create a section for complete info
    let completeInfoSection = document.querySelector('.complete-property-info');
    
    if (!completeInfoSection) {
        // Create section after location info
        const locationSection = document.querySelector('.location-info');
        if (locationSection) {
            completeInfoSection = document.createElement('section');
            completeInfoSection.className = 'complete-property-info';
            completeInfoSection.style.cssText = 'margin: 3rem 0; padding: 3rem 0; background: #f8f9fa;';
            locationSection.parentNode.insertBefore(completeInfoSection, locationSection.nextSibling);
        } else {
            return; // Can't add section
        }
    }
    
    let html = `
        <div class="container">
            <h2 style="text-align: center; color: var(--secondary-color); margin-bottom: 2rem;">
                📋 Vollständige Immobiliendaten
            </h2>
            <div style="background: white; padding: 2rem; border-radius: 12px; box-shadow: 0 4px 20px rgba(0,0,0,0.1);">
                <table style="width: 100%; border-collapse: collapse;">
                    <thead>
                        <tr style="background: var(--primary-color); color: white;">
                            <th style="padding: 1rem; text-align: left; border-radius: 8px 0 0 0;">Eigenschaft</th>
                            <th style="padding: 1rem; text-align: right; border-radius: 0 8px 0 0;">Wert</th>
                        </tr>
                    </thead>
                    <tbody>
    `;
    
    // Add all property data
    const allData = [
        { label: 'Immobilien-ID', value: property.id, show: true },
        { label: 'Titel', value: property.title, show: true },
        { label: 'Objektart', value: getTypeLabel(property.type), show: property.type },
        { label: 'Angebotstyp', value: property.offer_type === 'kauf' ? 'Kaufobjekt' : 'Mietobjekt', show: property.offer_type },
        { label: 'Preis', value: `€ ${new Intl.NumberFormat('de-DE').format(property.price)}`, show: property.price },
        { label: 'Wohnfläche', value: `${property.size} m²`, show: property.size },
        { label: 'Anzahl Zimmer', value: property.rooms, show: property.rooms !== undefined },
        { label: 'Anzahl Badezimmer', value: property.bathrooms, show: property.bathrooms },
        { label: 'Baujahr', value: property.year_built, show: property.year_built },
        { label: 'Lage/Beschreibung', value: property.location, show: property.location },
        { label: 'Straße/Adresse', value: property.address, show: property.address },
        { label: 'Postleitzahl', value: property.zip_code, show: property.zip_code },
        { label: 'Stadt', value: property.city, show: property.city },
        { label: 'Bundesland', value: property.state, show: property.state },
        { label: 'Land', value: property.country, show: property.country },
        { label: 'Breitengrad', value: property.latitude, show: property.latitude },
        { label: 'Längengrad', value: property.longitude, show: property.longitude },
        { label: 'Status', value: getStatusLabel(property.status), show: property.status },
        { label: 'Top-Angebot', value: property.featured ? '⭐ Ja' : 'Nein', show: property.featured !== undefined },
        { label: 'Anzahl Bilder', value: (property.images?.length || 0) + ' Bild(er)', show: true },
        { label: 'Aufrufe', value: property.views || 0, show: property.views !== undefined },
        { label: 'Veröffentlicht am', value: formatDate(property.created_at), show: property.created_at },
        { label: 'Letzte Aktualisierung', value: formatDate(property.updated_at), show: property.updated_at }
    ];
    
    let rowIndex = 0;
    allData.forEach(item => {
        if (item.show && item.value) {
            const bgColor = rowIndex % 2 === 0 ? '#f8f9fa' : 'white';
            html += `
                <tr style="background: ${bgColor}; border-bottom: 1px solid #e0e0e0;">
                    <td style="padding: 1rem; font-weight: 600; color: var(--text-gray);">${item.label}</td>
                    <td style="padding: 1rem; text-align: right; color: var(--secondary-color);">${item.value}</td>
                </tr>
            `;
            rowIndex++;
        }
    });
    
    html += `
                    </tbody>
                </table>
            </div>
            
            <div style="margin-top: 2rem; text-align: center; color: var(--text-gray); font-size: 0.9rem;">
                <p>✅ Alle hochgeladenen Daten werden hier vollständig angezeigt</p>
            </div>
        </div>
    `;
    
    completeInfoSection.innerHTML = html;
}

/**
 * Helper: Format date
 */
function formatDate(dateString) {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('de-DE', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

/**
 * Helper: Get status label
 */
function getStatusLabel(status) {
    const labels = {
        'available': '✅ Verfügbar',
        'reserved': '⏳ Reserviert',
        'sold': '✔️ Verkauft',
        'rented': '🏠 Vermietet'
    };
    return labels[status] || status;
}

/**
 * Update structured data for SEO
 */
function updateStructuredData(property) {
    // Remove existing structured data
    const existingScript = document.querySelector('script[type="application/ld+json"]');
    if (existingScript) {
        existingScript.remove();
    }
    
    // Create new structured data
    const structuredData = {
        "@context": "https://schema.org",
        "@type": property.type === 'haus' ? "SingleFamilyResidence" : "Apartment",
        "name": property.title,
        "description": property.description,
        "address": {
            "@type": "PostalAddress",
            "addressLocality": property.city,
            "addressRegion": "HE",
            "postalCode": property.zip_code || "",
            "addressCountry": "DE"
        },
        "numberOfRooms": property.rooms,
        "floorSize": {
            "@type": "QuantitativeValue",
            "value": property.size,
            "unitCode": "MTK"
        }
    };
    
    if (propertyImages.length > 0) {
        structuredData.image = propertyImages;
    }
    
    if (property.price) {
        structuredData.price = {
            "@type": "MonetaryAmount",
            "value": property.price,
            "currency": "EUR"
        };
    }
    
    // Add to page
    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.textContent = JSON.stringify(structuredData);
    document.head.appendChild(script);
}

/**
 * Gallery navigation functions
 */
function showImage(index) {
    if (index < 0 || index >= propertyImages.length) return;
    
    currentImageIndex = index;
    const mainImage = document.getElementById('main-image');
    if (mainImage) {
        mainImage.src = propertyImages[index];
    }
    
    // Update active thumbnail
    document.querySelectorAll('.thumbnail').forEach((thumb, i) => {
        thumb.classList.toggle('active', i === index);
    });
}

function nextImage() {
    showImage((currentImageIndex + 1) % propertyImages.length);
}

function previousImage() {
    showImage((currentImageIndex - 1 + propertyImages.length) % propertyImages.length);
}

/**
 * Helper: Get type label
 */
function getTypeLabel(type) {
    const types = {
        'haus': 'Haus',
        'wohnung': 'Wohnung',
        'gewerbe': 'Gewerbe',
        'grundstück': 'Grundstück'
    };
    return types[type] || 'Immobilie';
}

/**
 * Show loading state
 */
function showLoading() {
    const heroSection = document.querySelector('.property-hero .container');
    if (heroSection) {
        heroSection.innerHTML = '<div class="loading-message">Immobilie wird geladen...</div>';
    }
}

/**
 * Hide loading state
 */
function hideLoading() {
    // Loading message will be replaced by actual content
}

/**
 * Show error message
 */
function showError(message) {
    const heroSection = document.querySelector('.property-hero .container');
    if (heroSection) {
        heroSection.innerHTML = `
            <div class="error-message">
                <h2>Fehler</h2>
                <p>${message}</p>
                <a href="immobilien-angebote.html" class="cta-button">Zurück zu den Angeboten</a>
            </div>
        `;
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', loadPropertyDetails);

// Make gallery functions globally available
window.showImage = showImage;
window.nextImage = nextImage;
window.previousImage = previousImage;
