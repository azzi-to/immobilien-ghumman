/**
 * DSGVO Cookie-Consent Banner
 * Immobilien Ghumman - GDPR compliant
 */

(function () {
    'use strict';

    const CONSENT_KEY = 'cookie_consent';
    const CONSENT_VERSION = '1.0';

    // Consent-Status abrufen
    function getConsent() {
        try {
            const consent = localStorage.getItem(CONSENT_KEY);
            if (consent) {
                const parsed = JSON.parse(consent);
                if (parsed.version === CONSENT_VERSION) {
                    return parsed;
                }
            }
        } catch (e) {
            console.error('Cookie consent parse error:', e);
        }
        return null;
    }

    // Consent speichern
    function saveConsent(preferences) {
        const consent = {
            version: CONSENT_VERSION,
            timestamp: new Date().toISOString(),
            necessary: true, // Immer erforderlich
            analytics: preferences.analytics || false,
            marketing: preferences.marketing || false
        };
        localStorage.setItem(CONSENT_KEY, JSON.stringify(consent));
        return consent;
    }

    // Google Analytics aktivieren/deaktivieren
    function updateAnalytics(enabled) {
        if (enabled) {
            // GA aktivieren
            window['ga-disable-G-Q5J1C2PTR2'] = false;
        } else {
            // GA deaktivieren
            window['ga-disable-G-Q5J1C2PTR2'] = true;
            // Bestehende Cookies löschen
            document.cookie = '_ga=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
            document.cookie = '_gid=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
            document.cookie = '_gat=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
        }
    }

    // Banner HTML erstellen
    function createBanner() {
        const banner = document.createElement('div');
        banner.id = 'cookie-consent-banner';
        banner.innerHTML = `
            <div class="cookie-banner-content">
                <div class="cookie-banner-text">
                    <h3>🍪 Cookie-Einstellungen</h3>
                    <p>Wir verwenden Cookies, um Ihnen die bestmögliche Erfahrung auf unserer Website zu bieten. 
                    Sie können wählen, welche Cookies Sie zulassen möchten.</p>
                    <a href="datenschutz.html" class="cookie-privacy-link">Datenschutzerklärung</a>
                </div>
                
                <div class="cookie-options">
                    <label class="cookie-option">
                        <input type="checkbox" id="cookie-necessary" checked disabled>
                        <span class="cookie-option-text">
                            <strong>Notwendig</strong>
                            <small>Erforderlich für grundlegende Funktionen</small>
                        </span>
                    </label>
                    
                    <label class="cookie-option">
                        <input type="checkbox" id="cookie-analytics">
                        <span class="cookie-option-text">
                            <strong>Analyse</strong>
                            <small>Hilft uns, die Website zu verbessern</small>
                        </span>
                    </label>
                    
                    <label class="cookie-option">
                        <input type="checkbox" id="cookie-marketing">
                        <span class="cookie-option-text">
                            <strong>Marketing</strong>
                            <small>Für personalisierte Inhalte</small>
                        </span>
                    </label>
                </div>
                
                <div class="cookie-buttons">
                    <button type="button" class="cookie-btn cookie-btn-settings" id="cookie-save-selection">
                        Auswahl speichern
                    </button>
                    <button type="button" class="cookie-btn cookie-btn-accept" id="cookie-accept-all">
                        Alle akzeptieren
                    </button>
                </div>
            </div>
        `;

        // Styles
        const style = document.createElement('style');
        style.textContent = `
            #cookie-consent-banner {
                position: fixed;
                bottom: 0;
                left: 0;
                right: 0;
                background: white;
                box-shadow: 0 -4px 20px rgba(0, 0, 0, 0.15);
                z-index: 99999;
                padding: 20px;
                font-family: 'Montserrat', sans-serif;
                animation: slideUp 0.4s ease;
            }

            @keyframes slideUp {
                from { transform: translateY(100%); opacity: 0; }
                to { transform: translateY(0); opacity: 1; }
            }

            .cookie-banner-content {
                max-width: 1200px;
                margin: 0 auto;
                display: grid;
                grid-template-columns: 1fr auto auto;
                gap: 30px;
                align-items: center;
            }

            .cookie-banner-text h3 {
                margin: 0 0 8px 0;
                color: #333;
                font-size: 18px;
            }

            .cookie-banner-text p {
                margin: 0 0 8px 0;
                color: #666;
                font-size: 14px;
                line-height: 1.5;
            }

            .cookie-privacy-link {
                color: #336699;
                font-size: 13px;
                text-decoration: none;
            }

            .cookie-privacy-link:hover {
                text-decoration: underline;
            }

            .cookie-options {
                display: flex;
                gap: 20px;
            }

            .cookie-option {
                display: flex;
                align-items: flex-start;
                gap: 10px;
                cursor: pointer;
            }

            .cookie-option input[type="checkbox"] {
                width: 20px;
                height: 20px;
                margin-top: 2px;
                cursor: pointer;
                accent-color: #336699;
            }

            .cookie-option input[type="checkbox"]:disabled {
                cursor: not-allowed;
                opacity: 0.7;
            }

            .cookie-option-text {
                display: flex;
                flex-direction: column;
            }

            .cookie-option-text strong {
                font-size: 14px;
                color: #333;
            }

            .cookie-option-text small {
                font-size: 12px;
                color: #888;
            }

            .cookie-buttons {
                display: flex;
                gap: 12px;
            }

            .cookie-btn {
                padding: 12px 24px;
                border-radius: 8px;
                font-weight: 600;
                font-size: 14px;
                cursor: pointer;
                transition: all 0.3s ease;
                font-family: 'Montserrat', sans-serif;
                white-space: nowrap;
            }

            .cookie-btn-settings {
                background: white;
                border: 2px solid #336699;
                color: #336699;
            }

            .cookie-btn-settings:hover {
                background: #f0f5fa;
            }

            .cookie-btn-accept {
                background: #336699;
                border: 2px solid #336699;
                color: white;
            }

            .cookie-btn-accept:hover {
                background: #2a5580;
                border-color: #2a5580;
            }

            /* Mobile Responsive */
            @media (max-width: 992px) {
                .cookie-banner-content {
                    grid-template-columns: 1fr;
                    gap: 20px;
                }

                .cookie-options {
                    flex-wrap: wrap;
                }
            }

            @media (max-width: 480px) {
                #cookie-consent-banner {
                    padding: 15px;
                }

                .cookie-banner-text h3 {
                    font-size: 16px;
                }

                .cookie-buttons {
                    flex-direction: column;
                }

                .cookie-btn {
                    width: 100%;
                    text-align: center;
                }
            }
        `;

        document.head.appendChild(style);
        document.body.appendChild(banner);

        // Event Listeners
        document.getElementById('cookie-accept-all').addEventListener('click', function () {
            const consent = saveConsent({ analytics: true, marketing: true });
            updateAnalytics(true);
            hideBanner();
        });

        document.getElementById('cookie-save-selection').addEventListener('click', function () {
            const analytics = document.getElementById('cookie-analytics').checked;
            const marketing = document.getElementById('cookie-marketing').checked;
            const consent = saveConsent({ analytics, marketing });
            updateAnalytics(analytics);
            hideBanner();
        });
    }

    // Banner ausblenden
    function hideBanner() {
        const banner = document.getElementById('cookie-consent-banner');
        if (banner) {
            banner.style.animation = 'slideUp 0.3s ease reverse';
            setTimeout(() => banner.remove(), 300);
        }
    }

    // Initialisierung
    function init() {
        const consent = getConsent();

        if (consent) {
            // Consent vorhanden - Einstellungen anwenden
            updateAnalytics(consent.analytics);
        } else {
            // Kein Consent - GA standardmäßig deaktivieren und Banner zeigen
            updateAnalytics(false);

            // Warten bis DOM geladen ist
            if (document.readyState === 'loading') {
                document.addEventListener('DOMContentLoaded', createBanner);
            } else {
                createBanner();
            }
        }
    }

    // Global verfügbar machen für manuelle Aufrufe
    window.CookieConsent = {
        show: createBanner,
        reset: function () {
            localStorage.removeItem(CONSENT_KEY);
            location.reload();
        },
        getStatus: getConsent
    };

    // Starten
    init();
})();
