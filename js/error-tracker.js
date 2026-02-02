/**
 * Error Tracking / Logging Service
 * Immobilien Ghumman - Lightweight error tracking
 * 
 * Kann später durch Sentry oder ähnliches ersetzt werden
 */

(function () {
    'use strict';

    const IS_PRODUCTION = window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1';
    const API_BASE = IS_PRODUCTION
        ? 'https://immobilien-ghumman-production.up.railway.app/api'
        : 'http://localhost:3000/api';

    // Error-Queue für Batch-Sending
    let errorQueue = [];
    let isProcessing = false;

    /**
     * Error-Objekt erstellen
     */
    function createErrorReport(error, context = {}) {
        return {
            timestamp: new Date().toISOString(),
            url: window.location.href,
            userAgent: navigator.userAgent,
            message: error.message || String(error),
            stack: error.stack || null,
            type: error.name || 'Error',
            context: context,
            // Keine sensiblen Daten!
            screenSize: `${window.innerWidth}x${window.innerHeight}`,
            online: navigator.onLine
        };
    }

    /**
     * Error in Konsole loggen (Development)
     */
    function logToConsole(report) {
        console.group('%c🚨 Error Tracked', 'color: #ef4444; font-weight: bold;');
        console.log('Message:', report.message);
        console.log('URL:', report.url);
        console.log('Time:', report.timestamp);
        if (report.stack) console.log('Stack:', report.stack);
        if (Object.keys(report.context).length) console.log('Context:', report.context);
        console.groupEnd();
    }

    /**
     * Error an Backend senden (Production)
     */
    async function sendToBackend(reports) {
        if (!IS_PRODUCTION || reports.length === 0) return;

        try {
            await fetch(`${API_BASE}/errors/log`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ errors: reports })
            });
        } catch (e) {
            // Stilles Fehlschlagen - wir wollen keine Endlosschleife
            console.warn('Failed to send error report:', e.message);
        }
    }

    /**
     * Error zur Queue hinzufügen
     */
    function trackError(error, context = {}) {
        const report = createErrorReport(error, context);

        if (!IS_PRODUCTION) {
            logToConsole(report);
        }

        errorQueue.push(report);

        // Batch-Processing (max 5 Errors alle 5 Sekunden)
        if (!isProcessing) {
            isProcessing = true;
            setTimeout(() => {
                const batch = errorQueue.splice(0, 10);
                sendToBackend(batch);
                isProcessing = false;
            }, 5000);
        }
    }

    /**
     * Global Error Handler
     */
    window.onerror = function (message, source, lineno, colno, error) {
        trackError(error || new Error(message), {
            source: source,
            line: lineno,
            column: colno
        });
        return false; // Fehler nicht unterdrücken
    };

    /**
     * Unhandled Promise Rejection Handler
     */
    window.addEventListener('unhandledrejection', function (event) {
        trackError(event.reason || new Error('Unhandled Promise Rejection'), {
            type: 'unhandledrejection'
        });
    });

    /**
     * Network Error Tracking (optional)
     */
    const originalFetch = window.fetch;
    window.fetch = async function (...args) {
        try {
            const response = await originalFetch.apply(this, args);

            // Nur Server-Errors tracken (5xx)
            if (response.status >= 500) {
                trackError(new Error(`Server Error: ${response.status}`), {
                    url: args[0],
                    status: response.status
                });
            }

            return response;
        } catch (error) {
            // Network-Fehler tracken
            if (error.name === 'TypeError' && error.message.includes('fetch')) {
                trackError(error, {
                    url: args[0],
                    type: 'network'
                });
            }
            throw error;
        }
    };

    // Public API
    window.ErrorTracker = {
        /**
         * Manuell einen Error tracken
         */
        track: trackError,

        /**
         * Info-Event tracken (kein Error)
         */
        info: function (message, context = {}) {
            if (!IS_PRODUCTION) {
                console.info('📝 Info:', message, context);
            }
        },

        /**
         * Warning tracken
         */
        warn: function (message, context = {}) {
            trackError(new Error(message), { ...context, level: 'warning' });
        },

        /**
         * Queue leeren und senden
         */
        flush: function () {
            const batch = errorQueue.splice(0);
            sendToBackend(batch);
        }
    };

    // Info beim Start
    if (!IS_PRODUCTION) {
        console.log('%c✅ Error Tracking aktiv (Development Mode)', 'color: #10b981;');
    }
})();
