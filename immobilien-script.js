/**
 * IMMOBILIEN GHUMMAN - Modern JavaScript
 * Interactive functionality for the professional real estate website
 */

// DOM Content Loaded Event
document.addEventListener('DOMContentLoaded', function () {
    initializeWebsite();
});

/**
 * Initialize all website functionality
 */
function initializeWebsite() {
    initMobileMenu();
    initSmoothScrolling();
    initPropertyFilters();
    loadSampleProperties();
    initContactMethods();
    initTypewriterAnimation();
    initManagementModal();
    initFinancingModal();
    initScrollReveal();
    initReviewsSlider();
    initFlipCard();
    initFAQ();
    initMobileServicesSlider();
    initMobileKnowledgeSlider();

    console.log('Immobilien Ghumman website initialized successfully');
}
/**
 * Scroll Reveal: show elements when they enter viewport
 */
function initScrollReveal() {
    const selector = 'section, .properties-grid .property-card, .services-grid .service-card, .contact-methods-primary .contact-method, .contact-methods-secondary .contact-method, .footer-section';
    const elements = Array.from(document.querySelectorAll(selector));

    // Assign base reveal + directional hint
    elements.forEach((el, idx) => {
        el.classList.add('reveal');
        const rect = el.getBoundingClientRect();
        const fromLeft = rect.left < window.innerWidth / 2;
        const isCard = el.classList.contains('property-card') || el.classList.contains('service-card') || el.classList.contains('contact-method');
        if (isCard) {
            // Alternate left/right for cards to feel like inwards flow
            el.classList.add(idx % 2 === 0 ? 'reveal-left' : 'reveal-right');
        } else {
            // Sections: come from bottom (upwards)
            el.classList.add('reveal-up');
        }
        // Stagger via inline style (small, fluid)
        const rowIndex = idx % 6; // simple pattern
        el.style.transitionDelay = `${rowIndex * 60}ms`;
    });

    // Reveal anything already in viewport on load (defensive)
    const isInViewport = (el) => {
        const r = el.getBoundingClientRect();
        return r.top <= window.innerHeight * 0.9 && r.bottom >= 0;
    };
    elements.forEach(el => { if (isInViewport(el)) el.classList.add('is-visible'); });

    // Fallback: if IntersectionObserver is not supported, reveal everything immediately
    if (typeof window.IntersectionObserver === 'undefined') {
        elements.forEach(el => el.classList.add('is-visible'));
        return;
    }

    const observer = new IntersectionObserver((entries, obs) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('is-visible');
                obs.unobserve(entry.target);
            }
        });
    }, { root: null, rootMargin: '0px 0px -10% 0px', threshold: 0.12 });

    elements.forEach(el => observer.observe(el));
}

/**
 * Mobile Menu Functionality
 */
function initMobileMenu() {
    const hamburger = document.querySelector('.hamburger');
    const navMenu = document.querySelector('.nav-menu');
    const navLinks = document.querySelectorAll('.nav-link');

    if (!hamburger || !navMenu) return;
    // Ensure initial ARIA state
    navMenu.setAttribute('aria-hidden', 'true');
    hamburger.setAttribute('aria-expanded', 'false');

    const openMenu = () => {
        if (hamburger.classList.contains('active')) return;
        hamburger.classList.add('active');
        navMenu.classList.add('active');
        document.body.classList.add('menu-open');
        hamburger.setAttribute('aria-expanded', 'true');
        navMenu.setAttribute('aria-hidden', 'false');
    };

    const closeMenu = () => {
        if (!hamburger.classList.contains('active')) return;
        hamburger.classList.remove('active');
        navMenu.classList.remove('active');
        document.body.classList.remove('menu-open');
        hamburger.setAttribute('aria-expanded', 'false');
        navMenu.setAttribute('aria-hidden', 'true');
    };

    const toggleMenu = () => {
        if (hamburger.classList.contains('active')) closeMenu(); else openMenu();
    };

    hamburger.addEventListener('click', toggleMenu);
    // Keyboard support on hamburger
    hamburger.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            toggleMenu();
        }
        if (e.key === 'Escape') {
            closeMenu();
        }
    });

    // Close mobile menu when clicking on nav links
    navLinks.forEach(link => {
        link.addEventListener('click', function () {
            closeMenu();
        });
    });

    // Close mobile menu when clicking outside
    document.addEventListener('click', function (event) {
        if (!navMenu.contains(event.target) && !hamburger.contains(event.target)) {
            closeMenu();
        }
    });

    // Close on ESC globally
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') closeMenu();
    });

    // Close on resize to desktop
    window.addEventListener('resize', () => {
        if (window.innerWidth > 768) {
            closeMenu();
        }
    });
}

/**
 * Smooth Scrolling for Navigation Links
 */
function initSmoothScrolling() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                const headerHeight = document.querySelector('.header').offsetHeight;
                const targetPosition = target.offsetTop - headerHeight - 20;

                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });
}

/**
 * Property Filters Functionality
 */
function initPropertyFilters() {
    const priceFilter = document.getElementById('priceFilter');
    const typeFilter = document.getElementById('typeFilter');
    const locationFilter = document.getElementById('locationFilter');
    const loadMoreBtn = document.getElementById('loadMore');

    if (priceFilter) {
        priceFilter.addEventListener('change', filterProperties);
    }
    if (typeFilter) {
        typeFilter.addEventListener('change', filterProperties);
    }
    if (locationFilter) {
        locationFilter.addEventListener('change', filterProperties);
    }
    if (loadMoreBtn) {
        loadMoreBtn.addEventListener('click', loadMoreProperties);
    }
}

/**
 * Filter Properties
 */
function filterProperties() {
    const priceFilter = document.getElementById('priceFilter')?.value;
    const typeFilter = document.getElementById('typeFilter')?.value;
    const locationFilter = document.getElementById('locationFilter')?.value;

    const propertyCards = document.querySelectorAll('.property-card');
    let visibleCount = 0;

    propertyCards.forEach(card => {
        let showCard = true;

        // Price filtering
        if (priceFilter && priceFilter !== '') {
            const cardPrice = parseInt(card.dataset.price);
            if (priceFilter === '0-300000' && cardPrice > 300000) showCard = false;
            if (priceFilter === '300000-500000' && (cardPrice < 300000 || cardPrice > 500000)) showCard = false;
            if (priceFilter === '500000-800000' && (cardPrice < 500000 || cardPrice > 800000)) showCard = false;
            if (priceFilter === '800000+' && cardPrice < 800000) showCard = false;
        }

        // Type filtering
        if (typeFilter && typeFilter !== '') {
            if (card.dataset.type !== typeFilter) showCard = false;
        }

        // Location filtering
        if (locationFilter && locationFilter !== '') {
            if (card.dataset.location !== locationFilter) showCard = false;
        }

        if (showCard) {
            card.style.display = 'block';
            visibleCount++;
        } else {
            card.style.display = 'none';
        }
    });

    // Show notification with results
    showNotification(`${visibleCount} Immobilien gefunden`, 'info');
}

/**
 * Load More Properties
 */
function loadMoreProperties() {
    const loadMoreBtn = document.getElementById('loadMore');
    const originalText = loadMoreBtn.textContent;

    loadMoreBtn.textContent = 'Wird geladen...';
    loadMoreBtn.disabled = true;

    // Simulate loading more properties
    setTimeout(() => {
        loadMoreBtn.textContent = originalText;
        loadMoreBtn.disabled = false;
        showNotification('Weitere Immobilien geladen', 'success');
    }, 1500);
}

/**
 * Load Properties from Database - NUR AKTUELLE (neueste 3 für Startseite)
 * Ältere Immobilien werden auf der Angebote-Seite angezeigt
 * Falls API nicht verfügbar: Fallback auf statische Daten
 */
async function loadSampleProperties() {
    const propertiesGrid = document.getElementById('propertiesGrid');
    if (!propertiesGrid) return;

    // Show loading state
    propertiesGrid.innerHTML = '<div class="loading-message">Immobilien werden geladen...</div>';

    let properties = [];

    try {
        // Check if API client is available
        if (typeof PropertyAPI !== 'undefined') {
            const api = new PropertyAPI();

            // ⬇️ NUR die neuesten 3 Immobilien für die Startseite laden
            const response = await api.getRecentProperties(3);
            properties = response.properties || [];
        }
    } catch (error) {
        console.warn('API error, using static fallback:', error.message);
    }

    // Fallback auf statische Daten wenn API fehlschlägt
    if (properties.length === 0 && typeof STATIC_PROPERTIES !== 'undefined') {
        console.log('Using static properties as fallback');
        properties = STATIC_PROPERTIES.slice(0, 3);
    }

    // Clear loading message
    propertiesGrid.innerHTML = '';

    if (properties.length === 0) {
        console.log('No properties found');
        showEmptyPropertiesState(propertiesGrid, 'Keine Immobilien vorhanden');
        return;
        }

        // Create and append property cards with "NEU" badge for recent properties
        const now = new Date();
        const twoWeeksAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);

        properties.forEach(property => {
            // Check if property is "new" (< 14 days old)
            const createdAt = new Date(property.created_at);
            const isNew = createdAt >= twoWeeksAgo;

            // Convert database property to card format
            const propertyData = {
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
                isNew: isNew // NEU-Badge anzeigen
            };

            const propertyCard = createPropertyCard(propertyData);
            propertiesGrid.appendChild(propertyCard);
        });

        console.log(`Loaded ${properties.length} properties`);
}

/**
 * Zeigt eine leere Ansicht, wenn keine Immobilien vorhanden sind
 * KEINE Demo- oder Platzhalter-Immobilien!
 */
function showEmptyPropertiesState(container, reason = '') {
    if (!container) return;

    container.innerHTML = `
        <div class="empty-properties-message" style="
            grid-column: 1 / -1;
            text-align: center;
            padding: 60px 20px;
            background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
            border-radius: 16px;
            border: 2px dashed #dee2e6;
        ">
            <svg width="80" height="80" viewBox="0 0 24 24" fill="none" style="margin-bottom: 20px; opacity: 0.5;">
                <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" stroke="#6c757d" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                <polyline points="9 22 9 12 15 12 15 22" stroke="#6c757d" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            <h3 style="color: #495057; margin-bottom: 12px; font-size: 1.4rem;">Derzeit keine Immobilien verfügbar</h3>
            <p style="color: #6c757d; margin-bottom: 20px; max-width: 400px; margin-left: auto; margin-right: auto;">
                Neue Angebote werden hier angezeigt, sobald sie verfügbar sind.
            </p>
            <a href="#contact" class="cta-button" style="display: inline-block;">Kontaktieren Sie uns</a>
        </div>
    `;

    console.log('Empty state displayed:', reason);
}



/**
 * Create Property Card Element
 * @param {Object} property - Property-Daten
 * @returns {HTMLElement} - Property Card Element
 */
function createPropertyCard(property) {
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
            <p class="property-description">${property.description}</p>
            <div class="property-actions">
                <button class="cta-button property-details-btn" type="button">Details ansehen</button>
            </div>
        </div>
    `;

    // Open modal with full details when button is clicked
    const btn = card.querySelector('.property-details-btn');
    if (btn) {
        btn.addEventListener('click', async () => {
            // If property has ID, load full details from API
            if (property.id) {
                await openPropertyModalWithFullDetails(property.id);
            } else {
                // Fallback for sample properties
                openPropertyModal(property);
            }
        });
    }

    return card;
}

/**
 * Property Details Modal: open and populate
 */
function openPropertyModal(property) {
    const modal = document.getElementById('property-modal');
    const closeBtn = document.getElementById('close-property-modal');
    if (!modal || !closeBtn) return;

    // Build rich details from property or fallback example
    const example = {
        title: '1 Zimmer Wohnung',
        rent: '€550 / Kaltmiete',
        location: 'Bad Vilbel',
        intro: 'Ab sofort verfügbar: Gepflegte 1-Zimmer-Wohnung im Erdgeschoss eines ruhigen Mehrfamilienhauses in der Kernstadt Bad Vilbel. Ideal für Singles, Pendler oder Studierende.',
        specs: [
            'Wohnfläche: ca. 25.76 m²',
            'Zimmer: 1',
            'Etage: Erdgeschoss',
            'Kaltmiete: 550 €',
            'Nebenkosten: 125 €',
            'Heizkosten: 75 €',
            'Gesamtmiete: 750 €',
            'Verfügbar ab: sofort',
            'Bad: mit Dusche',
            'Bodenbelag: Fliesen',
            'Küche: Einbauküche vorhanden',
            'Heizung: Gasheizung',
            'Möbliert: ja'
        ],
        locationText: 'Die Wohnung befindet sich in einer ruhigen Seitenstraße mit sehr guter ÖPNV-Anbindung. Einkaufsmöglichkeiten, Restaurants, Ärzte und Apotheken sind fußläufig erreichbar. Ruhig wohnen, aber dennoch zentral – die perfekte Kombination.',
        notes: ['Keine Haustiere', 'Nichtraucherwohnung', 'Möblierte Vermietung'],
        images: [
            'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=800&q=80',
            'https://images.unsplash.com/photo-1505691723518-36a5ac3b2b8f?auto=format&fit=crop&w=800&q=80',
            'https://images.unsplash.com/photo-1493809842364-78817add7ffb?auto=format&fit=crop&w=800&q=80',
            'https://images.unsplash.com/photo-1484101403633-562f891dc89a?auto=format&fit=crop&w=800&q=80'
        ]
    };

    const formatPrice = (price) => new Intl.NumberFormat('de-DE').format(price);
    const priceLabel = property && typeof property.price !== 'undefined'
        ? `€${formatPrice(property.price)}${property.pricingType ? ' / ' + property.pricingType : ''}`
        : example.rent;

    const dynamicSpecs = [];
    if (property?.area) dynamicSpecs.push(`Wohnfläche: ca. ${property.area} m²`);
    if (property?.rooms || property?.rooms === 0) dynamicSpecs.push(`Zimmer: ${property.rooms}`);
    if (property && typeof property.price !== 'undefined') {
        if (property.pricingType === 'Kaltmiete') dynamicSpecs.push(`Kaltmiete: ${formatPrice(property.price)} €`);
        else if (property.pricingType === 'Kaufpreis') dynamicSpecs.push(`Kaufpreis: ${formatPrice(property.price)} €`);
        else dynamicSpecs.push(`Preis: ${formatPrice(property.price)} €`);
    }
    const mergedSpecs = dynamicSpecs.length ? dynamicSpecs : example.specs;

    const data = {
        title: property?.title || example.title,
        rent: priceLabel,
        location: property?.locationName || example.location,
        intro: property?.description || example.intro,
        specs: mergedSpecs,
        locationText: example.locationText,
        notes: example.notes,
        images: (property?.images && property.images.length > 0)
            ? property.images
            : (property?.image ? [property.image] : example.images)
    };

    // Populate modal
    document.getElementById('property-modal-title').textContent = 'Objektdetails';
    document.getElementById('property-summary-title').textContent = data.title;
    document.getElementById('property-rent').textContent = data.rent;
    document.getElementById('property-location').textContent = data.location;
    document.getElementById('property-intro').textContent = data.intro;

    const specsList = document.getElementById('property-specs');
    specsList.innerHTML = '';
    data.specs.forEach(item => {
        const li = document.createElement('li');
        li.textContent = item;
        specsList.appendChild(li);
    });

    const notesList = document.getElementById('property-notes');
    notesList.innerHTML = '';
    data.notes.forEach(item => {
        const li = document.createElement('li');
        li.textContent = item;
        notesList.appendChild(li);
    });

    const mainImg = document.getElementById('property-gallery-main');
    const thumbs = document.getElementById('property-gallery-thumbs');
    if (mainImg && thumbs) {
        mainImg.src = data.images[0];
        thumbs.innerHTML = '';
        data.images.forEach((src, idx) => {
            const t = document.createElement('img');
            t.src = src;
            t.alt = `Bild ${idx + 1}`;
            t.loading = 'lazy';
            t.className = 'thumb';
            t.addEventListener('click', () => { mainImg.src = src; });
            thumbs.appendChild(t);
        });
    }

    // Open modal
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';

    // Close events
    const close = () => {
        modal.classList.remove('active');
        document.body.style.overflow = '';
    };
    closeBtn.onclick = close;
    modal.addEventListener('click', (e) => { if (e.target === modal) close(); });
    document.addEventListener('keydown', function onEsc(e) { if (e.key === 'Escape' && modal.classList.contains('active')) { close(); document.removeEventListener('keydown', onEsc); } });
}

/**
 * Open Property Modal with FULL Details from API
 */
async function openPropertyModalWithFullDetails(propertyId) {
    const modal = document.getElementById('property-modal');
    const closeBtn = document.getElementById('close-property-modal');

    if (!modal || !closeBtn) {
        console.error('Modal elements not found');
        return;
    }

    // Show loading state
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
    document.getElementById('property-modal-title').textContent = 'Laden...';

    try {
        // Check if API client is available
        if (typeof PropertyAPI === 'undefined') {
            throw new Error('API nicht verfügbar');
        }

        const api = new PropertyAPI();
        const property = await api.getProperty(propertyId);

        if (!property) {
            throw new Error('Immobilie nicht gefunden');
        }

        // Build complete property data
        const formatPrice = (price) => new Intl.NumberFormat('de-DE').format(price);
        const priceLabel = `€ ${formatPrice(property.price)} / ${property.offer_type === 'kauf' ? 'Kaufpreis' : 'Monat'}`;

        // Collect all images
        const images = [];
        if (property.images && property.images.length > 0) {
            property.images.forEach(img => {
                images.push(typeof img === 'string' ? img : img.image_url);
            });
        } else if (property.primary_image) {
            images.push(property.primary_image);
        }

        if (images.length === 0) {
            images.push('https://via.placeholder.com/800x500?text=Kein+Bild');
        }

        // Build comprehensive specs list
        const specs = [];

        // Basic information
        if (property.size) specs.push(`Wohnfläche: ${property.size} m²`);
        if (property.rooms) specs.push(`Zimmer: ${property.rooms}`);
        if (property.bathrooms) specs.push(`Badezimmer: ${property.bathrooms}`);
        if (property.year_built) specs.push(`Baujahr: ${property.year_built}`);
        if (property.type) {
            const typeLabels = { 'wohnung': 'Wohnung', 'haus': 'Haus', 'gewerbe': 'Gewerbe', 'grundstück': 'Grundstück' };
            specs.push(`Objektart: ${typeLabels[property.type] || property.type}`);
        }
        if (property.offer_type) {
            specs.push(`Angebotstyp: ${property.offer_type === 'kauf' ? 'Kaufobjekt' : 'Mietobjekt'}`);
        }

        // Location details
        if (property.address) specs.push(`Adresse: ${property.address}`);
        if (property.zip_code) specs.push(`PLZ: ${property.zip_code}`);
        if (property.state) specs.push(`Bundesland: ${property.state}`);

        // Additional info
        if (property.status) {
            const statusLabels = { 'available': 'Verfügbar', 'reserved': 'Reserviert', 'sold': 'Verkauft', 'rented': 'Vermietet' };
            specs.push(`Status: ${statusLabels[property.status] || property.status}`);
        }
        if (property.featured) specs.push('⭐ Top-Angebot');
        if (property.created_at) {
            const date = new Date(property.created_at).toLocaleDateString('de-DE');
            specs.push(`Veröffentlicht: ${date}`);
        }

        // Features
        const notes = [];
        if (property.features && Array.isArray(property.features)) {
            property.features.forEach(feature => notes.push(feature));
        }
        if (notes.length === 0) {
            notes.push('Weitere Details auf Anfrage');
        }

        // Location text
        let locationText = property.location || '';
        if (property.city && property.address) {
            locationText = `Die Immobilie befindet sich in ${property.city}, ${property.address}.`;
        } else if (property.city) {
            locationText = `Die Immobilie befindet sich in ${property.city}.`;
        }

        // Populate modal with FULL data
        document.getElementById('property-modal-title').textContent = 'Objektdetails';
        document.getElementById('property-summary-title').textContent = property.title;
        document.getElementById('property-rent').textContent = priceLabel;
        document.getElementById('property-location').textContent = property.city || 'Standort';
        document.getElementById('property-intro').textContent = property.description || 'Keine Beschreibung verfügbar.';

        // Specs list
        const specsList = document.getElementById('property-specs');
        specsList.innerHTML = '';
        specs.forEach(item => {
            const li = document.createElement('li');
            li.textContent = item;
            specsList.appendChild(li);
        });

        // Location text
        document.getElementById('property-location-text').textContent = locationText;

        // Notes/Features list
        const notesList = document.getElementById('property-notes');
        notesList.innerHTML = '';
        notes.forEach(item => {
            const li = document.createElement('li');
            li.textContent = item;
            notesList.appendChild(li);
        });

        // Gallery
        const mainImg = document.getElementById('property-gallery-main');
        const thumbs = document.getElementById('property-gallery-thumbs');
        if (mainImg && thumbs) {
            mainImg.src = images[0];
            thumbs.innerHTML = '';
            images.forEach((src, idx) => {
                const t = document.createElement('img');
                t.src = src;
                t.alt = `${property.title} - Bild ${idx + 1}`;
                t.loading = 'lazy';
                t.className = 'thumb';
                t.addEventListener('click', () => { mainImg.src = src; });
                thumbs.appendChild(t);
            });
        }

        console.log('Property loaded in modal:', property);

    } catch (error) {
        console.error('Error loading property details:', error);
        document.getElementById('property-modal-title').textContent = 'Fehler';
        document.getElementById('property-summary-title').textContent = 'Fehler beim Laden';
        document.getElementById('property-intro').textContent = error.message || 'Die Immobilie konnte nicht geladen werden.';
    }

    // Close events
    const close = () => {
        modal.classList.remove('active');
        document.body.style.overflow = '';
    };
    closeBtn.onclick = close;
    modal.addEventListener('click', (e) => { if (e.target === modal) close(); });
    document.addEventListener('keydown', function onEsc(e) {
        if (e.key === 'Escape' && modal.classList.contains('active')) {
            close();
            document.removeEventListener('keydown', onEsc);
        }
    });
}

/**
 * Initialize Contact Methods
 */
function initContactMethods() {
    // Track clicks on contact methods
    document.querySelectorAll('.contact-method, .contact-icon, .whatsapp-sticky a').forEach(element => {
        element.addEventListener('click', function () {
            const method = this.classList.contains('whatsapp') || this.href?.includes('wa.me') ? 'WhatsApp' :
                this.classList.contains('email') || this.href?.includes('mailto') ? 'Email' :
                    this.classList.contains('phone') || this.href?.includes('tel') ? 'Phone' : 'Contact';

            console.log(`Contact method clicked: ${method}`);
            showNotification(`${method} wird geöffnet...`, 'info');
        });
    });
}

/**
 * Show Notification
 */
function showNotification(message, type = 'info') {
    // Remove existing notifications
    const existingNotifications = document.querySelectorAll('.notification');
    existingNotifications.forEach(notification => notification.remove());

    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;

    const colors = {
        success: '#10b981',
        error: '#ef4444',
        warning: '#f59e0b',
        info: '#336699'
    };

    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${colors[type] || colors.info};
        color: white;
        padding: 15px 20px;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        z-index: 10000;
        transform: translateX(100%);
        transition: transform 0.3s ease;
        max-width: 300px;
        font-weight: 500;
    `;

    notification.textContent = message;
    document.body.appendChild(notification);

    // Show notification
    setTimeout(() => {
        notification.style.transform = 'translateX(0)';
    }, 100);

    // Hide notification after 3 seconds
    setTimeout(() => {
        notification.style.transform = 'translateX(100%)';
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
    }, 3000);
}

// Initialize scroll-based header behavior for floating navigation
let lastScrollTop = 0;
window.addEventListener('scroll', function () {
    const header = document.querySelector('.header');
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;

    // Add/remove scrolled class based on scroll position
    if (scrollTop > 100) {
        header.classList.add('scrolled');
    } else {
        header.classList.remove('scrolled');
    }

    // Hide/show navigation on scroll (optional enhancement)
    if (scrollTop > lastScrollTop && scrollTop > 300) {
        // Scrolling down - slightly fade
        header.style.opacity = '0.9';
    } else {
        // Scrolling up - full opacity
        header.style.opacity = '1';
    }

    lastScrollTop = scrollTop;
});

/**
 * Management Modal functionality
 */
function initManagementModal() {
    const modal = document.getElementById('management-modal');
    const openBtn = document.getElementById('management-modal-btn');
    const closeBtn = document.getElementById('close-modal');
    const tabButtons = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');

    if (!modal || !openBtn || !closeBtn) return;

    // Open modal
    openBtn.addEventListener('click', function (e) {
        e.preventDefault();
        modal.classList.add('active');
        document.body.style.overflow = 'hidden';

        // Add entrance animation delay for content
        setTimeout(() => {
            const modalContainer = modal.querySelector('.modal-container');
            if (modalContainer) {
                modalContainer.style.transform = 'scale(1) translateY(0)';
            }
        }, 100);
    });

    // Close modal
    closeBtn.addEventListener('click', function () {
        closeModal();
    });

    // Close modal on overlay click
    modal.addEventListener('click', function (e) {
        if (e.target === modal) {
            closeModal();
        }
    });

    // Close modal on Escape key
    document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape' && modal.classList.contains('active')) {
            closeModal();
        }
    });

    function closeModal() {
        modal.classList.remove('active');
        document.body.style.overflow = '';

        // Reset to first tab after close
        setTimeout(() => {
            switchTab('mieter');
        }, 400);
    }

    // Tab functionality
    tabButtons.forEach(button => {
        button.addEventListener('click', function () {
            const tabId = this.getAttribute('data-tab');
            switchTab(tabId);
        });
    });

    function switchTab(activeTabId) {
        // Remove active class from all tabs and contents
        tabButtons.forEach(btn => btn.classList.remove('active'));
        tabContents.forEach(content => content.classList.remove('active'));

        // Add active class to selected tab and content
        const activeBtn = document.querySelector(`[data-tab="${activeTabId}"]`);
        const activeContent = document.getElementById(`${activeTabId}-tab`);

        if (activeBtn && activeContent) {
            activeBtn.classList.add('active');
            activeContent.classList.add('active');

            // Add smooth transition effect
            activeContent.style.opacity = '0';
            activeContent.style.transform = 'translateY(20px)';

            setTimeout(() => {
                activeContent.style.opacity = '1';
                activeContent.style.transform = 'translateY(0)';
                activeContent.style.transition = 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)';
            }, 50);
        }
    }

    // Initialize with first tab active
    switchTab('mieter');

    // Smooth scroll for modal CTA button
    const modalCtaBtn = document.querySelector('.modal-cta-btn');
    if (modalCtaBtn) {
        modalCtaBtn.addEventListener('click', function (e) {
            e.preventDefault();
            closeModal();
            setTimeout(() => {
                const contactSection = document.querySelector('#contact');
                if (contactSection) {
                    contactSection.scrollIntoView({
                        behavior: 'smooth'
                    });
                }
            }, 500);
        });
    }
}

/**
 * Typewriter Animation for Hero Section
 */
function initTypewriterAnimation() {
    const typewriterText = document.getElementById('typewriter-text');
    const dynamicCta = document.getElementById('dynamic-cta');

    if (!typewriterText || !dynamicCta) return;

    const services = [
        { text: 'Verkauf', cta: 'Jetzt verkaufen', href: '#contact' },
        { text: 'Vermietung', cta: 'Jetzt vermieten', href: '#management' },
        { text: 'Finanzierung', cta: 'Jetzt Finanzierung prüfen', href: '#financing' },
        { text: 'Verwaltung', cta: 'Mehr zur Verwaltung', href: '#management' }
    ];

    let currentServiceIndex = 0;
    let currentCharIndex = 0;
    let isDeleting = false;
    let isPaused = false;

    function typeWriter() {
        const currentService = services[currentServiceIndex];
        const currentText = currentService.text;

        if (!isDeleting && !isPaused) {
            // Typing
            if (currentCharIndex < currentText.length) {
                typewriterText.textContent = currentText.substring(0, currentCharIndex + 1);
                currentCharIndex++;
                setTimeout(typeWriter, 150); // Typing speed
            } else {
                // Finished typing, update CTA and pause
                dynamicCta.textContent = currentService.cta;
                dynamicCta.href = currentService.href;
                isPaused = true;
                setTimeout(typeWriter, 2000); // Pause before deleting
            }
        } else if (isPaused) {
            // Start deleting
            isPaused = false;
            isDeleting = true;
            setTimeout(typeWriter, 100);
        } else if (isDeleting) {
            // Deleting
            if (currentCharIndex > 0) {
                typewriterText.textContent = currentText.substring(0, currentCharIndex - 1);
                currentCharIndex--;
                setTimeout(typeWriter, 100); // Deleting speed
            } else {
                // Finished deleting, move to next service
                isDeleting = false;
                currentServiceIndex = (currentServiceIndex + 1) % services.length;
                setTimeout(typeWriter, 500); // Pause before typing next word
            }
        }
    }

    // Start the animation
    setTimeout(typeWriter, 1000); // Initial delay
}

// Add some CSS for mobile responsiveness improvements
const mobileStyles = document.createElement('style');
mobileStyles.textContent = `
    @media (max-width: 768px) {
        .notification {
            top: 10px !important;
            right: 10px !important;
            left: 10px !important;
            max-width: none !important;
        }
        
        body.menu-open {
            overflow: hidden;
        }
    }
`;
document.head.appendChild(mobileStyles);

/**
 * Financing Modal Functionality
 * Handles the financing modal open/close and tab navigation
 */
function initFinancingModal() {
    const modal = document.getElementById('financing-modal');
    const openBtn = document.getElementById('financing-modal-btn');
    const closeBtn = document.getElementById('close-financing-modal');
    const tabButtons = document.querySelectorAll('#financing-modal .tab-btn');
    const tabContents = document.querySelectorAll('#financing-modal .tab-content');

    if (!modal || !openBtn || !closeBtn) return;

    // Open modal
    openBtn.addEventListener('click', function (e) {
        e.preventDefault();
        modal.classList.add('active');
        document.body.style.overflow = 'hidden';

        // Add entrance animation delay for content
        setTimeout(() => {
            const modalContainer = modal.querySelector('.modal-container');
            if (modalContainer) {
                modalContainer.style.transform = 'scale(1) translateY(0)';
            }
        }, 100);
    });

    // Close modal
    closeBtn.addEventListener('click', function () {
        closeFinancingModal();
    });

    // Close modal on overlay click
    modal.addEventListener('click', function (e) {
        if (e.target === modal) {
            closeFinancingModal();
        }
    });

    // Close modal on Escape key
    document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape' && modal.classList.contains('active')) {
            closeFinancingModal();
        }
    });

    function closeFinancingModal() {
        modal.classList.remove('active');
        document.body.style.overflow = '';

        // Reset to first tab after close
        setTimeout(() => {
            switchFinancingTab('immobilien');
        }, 400);
    }

    // Tab functionality
    tabButtons.forEach(button => {
        button.addEventListener('click', function () {
            const tabId = this.getAttribute('data-tab');
            switchFinancingTab(tabId);
        });
    });

    function switchFinancingTab(activeTabId) {
        // Remove active class from all tabs and contents
        tabButtons.forEach(btn => btn.classList.remove('active'));
        tabContents.forEach(content => content.classList.remove('active'));

        // Add active class to selected tab and content
        const activeBtn = document.querySelector(`#financing-modal [data-tab="${activeTabId}"]`);
        const activeContent = document.getElementById(`${activeTabId}-tab`);

        if (activeBtn) activeBtn.classList.add('active');
        if (activeContent) activeContent.classList.add('active');

        // Smooth transition effect
        if (activeContent) {
            activeContent.style.opacity = '0';
            setTimeout(() => {
                activeContent.style.opacity = '1';
            }, 150);
        }
    }
}

/**
 * Google Reviews Slider
 * Cycles through provided reviews every 3 seconds with slide-in animation
 */
function initReviewsSlider() {
    const reviews = [
        { name: 'A. Müller', text: 'Sehr professionelle und freundliche Beratung. Schnelle Abwicklung – absolut empfehlenswert!', stars: 5 },
        { name: 'S. Becker', text: 'Von der ersten Besichtigung bis zum Vertragsabschluss – top Service!', stars: 5 },
        { name: 'M. Schneider', text: 'Sehr transparent, zuverlässig und schnell erreichbar. Klare Empfehlung.', stars: 5 }
    ];
    const imageUrl = 'https://www.seo-agentur.com/templates/maxx/images/seo_ratgeber/google-reviews-stars.png';
    const sliders = [
        document.getElementById('reviewsSliderHome'),
        document.getElementById('reviewsSliderContact')
    ].filter(Boolean);
    if (!sliders.length) return;

    function renderReviews(activeIdx = 0, isMobile = false) {
        sliders.forEach((slider) => {
            slider.innerHTML = '';
            if (isMobile) {
                // Only show one review at a time
                const r = reviews[activeIdx];
                const item = document.createElement('div');
                item.className = 'review-item active';
                item.setAttribute('role', 'group');
                item.setAttribute('aria-roledescription', 'slide');
                item.setAttribute('aria-label', `${activeIdx + 1} von ${reviews.length}`);
                item.innerHTML = `
                    <div class="review-img"><img src="${imageUrl}" alt="Google Rezension Sterne"/></div>
                    <div class="review-content">
                        <div class="review-name">${r.name}</div>
                        <div class="review-text">${r.text}</div>
                    </div>
                `;
                slider.appendChild(item);
            } else {
                // Show all reviews in a row
                const row = document.createElement('div');
                row.className = 'review-row';
                reviews.forEach((r) => {
                    const item = document.createElement('div');
                    item.className = 'review-item active';
                    item.innerHTML = `
                        <div class="review-img"><img src="${imageUrl}" alt="Google Rezension Sterne"/></div>
                        <div class="review-content">
                            <div class="review-name">${r.name}</div>
                            <div class="review-text">${r.text}</div>
                        </div>
                    `;
                    row.appendChild(item);
                });
                slider.appendChild(row);
            }
        });
    }

    // Responsive: slider on mobile, row on desktop
    let current = 0;
    let isMobile = window.innerWidth <= 900;
    renderReviews(current, isMobile);
    let interval = null;
    function startSlider() {
        if (interval) clearInterval(interval);
        if (isMobile) {
            interval = setInterval(() => {
                current = (current + 1) % reviews.length;
                renderReviews(current, true);
            }, 3000);
        }
    }
    function stopSlider() { if (interval) clearInterval(interval); }
    window.addEventListener('resize', () => {
        const nowMobile = window.innerWidth <= 900;
        if (nowMobile !== isMobile) {
            isMobile = nowMobile;
            current = 0;
            renderReviews(current, isMobile);
            startSlider();
        }
    });
    startSlider();
}

// FAQ Tabs & Accordion
(function () {
    // Tabs
    const tabButtons = document.querySelectorAll('.faq-tab');
    const tabContents = document.querySelectorAll('.faq-tab-content');
    tabButtons.forEach(btn => {
        btn.addEventListener('click', function () {
            tabButtons.forEach(b => b.classList.remove('active'));
            tabContents.forEach(tc => tc.classList.remove('active'));
            this.classList.add('active');
            const tab = this.getAttribute('data-faqtab');
            document.getElementById('faqtab-' + tab).classList.add('active');
        });
    });
    // Accordion
    document.querySelectorAll('.faq-accordion').forEach(acc => {
        acc.querySelectorAll('.faq-item').forEach(item => {
            const btn = item.querySelector('.faq-question');
            btn.addEventListener('click', function () {
                // Only one open per accordion
                acc.querySelectorAll('.faq-item').forEach(i => {
                    if (i !== item) i.classList.remove('open');
                });
                item.classList.toggle('open');
            });
        });
    });
})();

/**
 * Flip Card (About Section)
 * Enables click/tap and keyboard flipping with ARIA updates
 */
function initFlipCard() {
    const card = document.querySelector('.about-image .flip-card');
    if (!card) return;
    const inner = card.querySelector('.flip-card-inner');
    if (!inner) return;

    const setPressed = (pressed) => {
        card.setAttribute('aria-pressed', String(pressed));
        card.classList.toggle('is-flipped', pressed);
    };

    // If user has a mouse, hover already flips; clicking toggles sticky flip for mobile
    let pressed = false;
    const toggle = () => { pressed = !pressed; setPressed(pressed); };

    card.addEventListener('click', (e) => {
        // Prevent following links etc.
        e.preventDefault();
        toggle();
    });

    card.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            toggle();
        }
    });

    console.log('Flip card initialized');
}

/**
 * FAQ Section Functionality
 * Handles accordion-style FAQ interactions
 */
function initFAQ() {
    const faqQuestions = document.querySelectorAll('.faq-question');

    faqQuestions.forEach(question => {
        question.addEventListener('click', function () {
            const faqItem = this.parentElement;
            const isActive = faqItem.classList.contains('active');

            // Close all other FAQ items
            document.querySelectorAll('.faq-item.active').forEach(item => {
                if (item !== faqItem) {
                    item.classList.remove('active');
                }
            });

            // Toggle current FAQ item
            faqItem.classList.toggle('active', !isActive);

            // Update ARIA attributes for accessibility
            const isExpanded = !isActive;
            this.setAttribute('aria-expanded', isExpanded);

            // Smooth scroll to question if opening on mobile
            if (isExpanded && window.innerWidth <= 768) {
                setTimeout(() => {
                    this.scrollIntoView({
                        behavior: 'smooth',
                        block: 'center'
                    });
                }, 300);
            }
        });

        // Initialize ARIA attributes
        question.setAttribute('aria-expanded', 'false');
        question.setAttribute('role', 'button');
        question.setAttribute('tabindex', '0');

        // Keyboard navigation
        question.addEventListener('keydown', function (e) {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                this.click();
            }
        });
    });

    console.log('FAQ functionality initialized');
}

/**
 * Typewriter Animation for Subpages
 */
function initSubpageTypewriterAnimation() {
    // Hausverwaltung Page
    const hausverwaltungText = document.getElementById('typewriter-text-hausverwaltung');
    if (hausverwaltungText) {
        const words = ['Hausverwaltung', 'Mietverwaltung', 'Objektbetreuung', 'Immobilienverwaltung'];
        startTypewriterAnimation(hausverwaltungText, words);
    }

    // Finanzierung Page
    const finanzierungText = document.getElementById('typewriter-text-finanzierung');
    if (finanzierungText) {
        const words = ['Finanzierung', 'Baufinanzierung', 'Immobiliendarlehen', 'Kreditberatung'];
        startTypewriterAnimation(finanzierungText, words);
    }

    // Immobilien Angebote Page
    const immobilienText = document.getElementById('typewriter-text-immobilien');
    if (immobilienText) {
        const words = ['Immobilien', 'Wohnungen', 'Häuser', 'Gewerbeimmobilien'];
        startTypewriterAnimation(immobilienText, words);
    }

    // Property Detail Page
    const propertyText = document.getElementById('typewriter-text-property');
    if (propertyText) {
        const words = ['3-Zimmer Wohnung', '2-Zimmer Wohnung', 'Einfamilienhaus', 'Penthouse', 'Maisonette'];
        startTypewriterAnimation(propertyText, words);
    }
}

function startTypewriterAnimation(element, words) {
    let currentWordIndex = 0;
    let currentCharIndex = 0;
    let isDeleting = false;
    let isPaused = false;

    function typeWriter() {
        const currentWord = words[currentWordIndex];

        if (!isDeleting && !isPaused) {
            // Typing
            if (currentCharIndex < currentWord.length) {
                element.textContent = currentWord.substring(0, currentCharIndex + 1);
                currentCharIndex++;
                setTimeout(typeWriter, 150); // Typing speed
            } else {
                // Finished typing, pause before deleting
                isPaused = true;
                setTimeout(typeWriter, 2000); // Pause before deleting
            }
        } else if (isPaused) {
            // Start deleting
            isPaused = false;
            isDeleting = true;
            setTimeout(typeWriter, 100);
        } else if (isDeleting) {
            // Deleting
            if (currentCharIndex > 0) {
                element.textContent = currentWord.substring(0, currentCharIndex - 1);
                currentCharIndex--;
                setTimeout(typeWriter, 100); // Deleting speed
            } else {
                // Finished deleting, move to next word
                isDeleting = false;
                currentWordIndex = (currentWordIndex + 1) % words.length;
                setTimeout(typeWriter, 500); // Pause before typing next word
            }
        }
    }

    // Start the animation
    setTimeout(typeWriter, 1000); // Initial delay
}

// Initialize subpage typewriter when DOM is loaded
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initSubpageTypewriterAnimation);
} else {
    initSubpageTypewriterAnimation();
}

/**
 * Mobile Services Slider (ohne Scrollen)
 */
function initMobileServicesSlider() {
    const slider = document.querySelector('.mobile-services-slider');
    const dots = document.querySelectorAll('.slider-dots .dot');

    if (!slider || dots.length === 0) return;

    const cards = slider.querySelectorAll('.mobile-service-card');
    let currentIndex = 0;
    let autoSlideInterval;
    let isUserInteracting = false;

    // Update active card and dots
    function updateSlide(index, direction = 'next') {
        // Remove all classes
        cards.forEach(card => {
            card.classList.remove('active', 'prev', 'next');
        });

        // Set previous card
        const prevIndex = currentIndex;
        if (direction === 'next') {
            cards[prevIndex].classList.add('prev');
        } else {
            cards[prevIndex].classList.add('next');
        }

        // Set active card
        cards[index].classList.add('active');

        // Update dots
        dots.forEach((dot, i) => {
            if (i === index) {
                dot.classList.add('active');
            } else {
                dot.classList.remove('active');
            }
        });

        currentIndex = index;
    }

    // Auto slide function (alle 3 Sekunden)
    function startAutoSlide() {
        stopAutoSlide();
        autoSlideInterval = setInterval(() => {
            if (!isUserInteracting) {
                const nextIndex = (currentIndex + 1) % cards.length;
                updateSlide(nextIndex, 'next');
            }
        }, 3000);
    }

    // Stop auto slide
    function stopAutoSlide() {
        if (autoSlideInterval) {
            clearInterval(autoSlideInterval);
            autoSlideInterval = null;
        }
    }

    // Handle dot navigation
    dots.forEach((dot, index) => {
        dot.addEventListener('click', () => {
            isUserInteracting = true;
            const direction = index > currentIndex ? 'next' : 'prev';
            updateSlide(index, direction);
            stopAutoSlide();
            setTimeout(() => {
                isUserInteracting = false;
                startAutoSlide();
            }, 5000);
        });
    });

    // Touch swipe support
    let touchStartX = 0;
    let touchEndX = 0;
    let touchStartTime = 0;

    slider.addEventListener('touchstart', (e) => {
        touchStartX = e.changedTouches[0].screenX;
        touchStartTime = Date.now();
        isUserInteracting = true;
        stopAutoSlide();
    }, { passive: true });

    slider.addEventListener('touchend', (e) => {
        touchEndX = e.changedTouches[0].screenX;
        handleSwipe();
        setTimeout(() => {
            isUserInteracting = false;
            startAutoSlide();
        }, 5000);
    }, { passive: true });

    function handleSwipe() {
        const swipeThreshold = 50;
        const diff = touchStartX - touchEndX;
        const swipeTime = Date.now() - touchStartTime;

        if (Math.abs(diff) < swipeThreshold || swipeTime > 500) return;

        if (diff > 0) {
            // Swipe left - next card
            const nextIndex = (currentIndex + 1) % cards.length;
            updateSlide(nextIndex, 'next');
        } else if (diff < 0) {
            // Swipe right - previous card
            const prevIndex = currentIndex === 0 ? cards.length - 1 : currentIndex - 1;
            updateSlide(prevIndex, 'prev');
        }
    }

    // Pause auto-slide when user hovers
    slider.addEventListener('mouseenter', () => {
        isUserInteracting = true;
        stopAutoSlide();
    });

    slider.addEventListener('mouseleave', () => {
        isUserInteracting = false;
        startAutoSlide();
    });

    // Pause when page is not visible
    document.addEventListener('visibilitychange', () => {
        if (document.hidden) {
            stopAutoSlide();
        } else if (!isUserInteracting) {
            startAutoSlide();
        }
    });

    // Initialize first card as active
    cards[0].classList.add('active');
    dots[0].classList.add('active');

    // Start auto-slide
    startAutoSlide();
}

/**
 * Mobile Knowledge Slider (Hausverwaltung)
 */
function initMobileKnowledgeSlider() {
    const slider = document.querySelector('.mobile-knowledge-slider');
    const dots = document.querySelectorAll('.knowledge-slider-dots .k-dot');

    if (!slider || dots.length === 0) return;

    const cards = slider.querySelectorAll('.mobile-knowledge-card');
    let currentIndex = 0;
    let autoSlideInterval;
    let isUserInteracting = false;

    // Update active card and dots
    function updateSlide(index, direction = 'next') {
        // Remove all classes
        cards.forEach(card => {
            card.classList.remove('active', 'prev', 'next');
        });

        // Set previous card
        const prevIndex = currentIndex;
        if (direction === 'next') {
            cards[prevIndex].classList.add('prev');
        } else {
            cards[prevIndex].classList.add('next');
        }

        // Set active card
        cards[index].classList.add('active');

        // Update dots
        dots.forEach((dot, i) => {
            if (i === index) {
                dot.classList.add('active');
            } else {
                dot.classList.remove('active');
            }
        });

        currentIndex = index;
    }

    // Auto slide function (alle 4 Sekunden für mehr Lesedauer)
    function startAutoSlide() {
        stopAutoSlide();
        autoSlideInterval = setInterval(() => {
            if (!isUserInteracting) {
                const nextIndex = (currentIndex + 1) % cards.length;
                updateSlide(nextIndex, 'next');
            }
        }, 4000); // 4 Sekunden
    }

    // Stop auto slide
    function stopAutoSlide() {
        if (autoSlideInterval) {
            clearInterval(autoSlideInterval);
            autoSlideInterval = null;
        }
    }

    // Handle dot navigation
    dots.forEach((dot, index) => {
        dot.addEventListener('click', () => {
            isUserInteracting = true;
            const direction = index > currentIndex ? 'next' : 'prev';
            updateSlide(index, direction);
            stopAutoSlide();
            setTimeout(() => {
                isUserInteracting = false;
                startAutoSlide();
            }, 6000); // Längere Pause nach manueller Navigation
        });
    });

    // Touch swipe support
    let touchStartX = 0;
    let touchEndX = 0;
    let touchStartTime = 0;

    slider.addEventListener('touchstart', (e) => {
        touchStartX = e.changedTouches[0].screenX;
        touchStartTime = Date.now();
        isUserInteracting = true;
        stopAutoSlide();
    }, { passive: true });

    slider.addEventListener('touchend', (e) => {
        touchEndX = e.changedTouches[0].screenX;
        handleSwipe();
        setTimeout(() => {
            isUserInteracting = false;
            startAutoSlide();
        }, 6000);
    }, { passive: true });

    function handleSwipe() {
        const swipeThreshold = 50;
        const diff = touchStartX - touchEndX;
        const swipeTime = Date.now() - touchStartTime;

        if (Math.abs(diff) < swipeThreshold || swipeTime > 500) return;

        if (diff > 0) {
            // Swipe left - next card
            const nextIndex = (currentIndex + 1) % cards.length;
            updateSlide(nextIndex, 'next');
        } else if (diff < 0) {
            // Swipe right - previous card
            const prevIndex = currentIndex === 0 ? cards.length - 1 : currentIndex - 1;
            updateSlide(prevIndex, 'prev');
        }
    }

    // Pause auto-slide when user hovers
    slider.addEventListener('mouseenter', () => {
        isUserInteracting = true;
        stopAutoSlide();
    });

    slider.addEventListener('mouseleave', () => {
        isUserInteracting = false;
        startAutoSlide();
    });

    // Pause when page is not visible
    document.addEventListener('visibilitychange', () => {
        if (document.hidden) {
            stopAutoSlide();
        } else if (!isUserInteracting) {
            startAutoSlide();
        }
    });

    // Initialize first card as active
    cards[0].classList.add('active');
    dots[0].classList.add('active');

    // Start auto-slide
    startAutoSlide();
}
