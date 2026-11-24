/* GA4 shares the existing Google tag with Ads. No form values are collected. */
(() => {
    'use strict';
    // Google Analytics > Admin > Data streams > Web > Measurement ID.
    const measurementId = 'G-3ZWY4ES6FR';
    const enabled = /^G-[A-Z0-9]+$/.test(measurementId);
    const path = window.location?.pathname || '/';
    const thankYouService = path.startsWith('/quote-thank-you/') ?
        new URLSearchParams(window.location.search).get('service') : null;
    const service = ['kitchen', 'bathroom', 'general'].includes(thankYouService) ? thankYouService :
        path.startsWith('/kitchen-remodeling') ? 'kitchen' :
        path.startsWith('/bathroom-remodeling') ? 'bathroom' : 'general';
    function track(name, parameters = {}) {
        if (!enabled || typeof window.gtag !== 'function') return;
        if (parameters.event_callback) {
            const callback = parameters.event_callback;
            delete parameters.event_callback;
            window.gtag('event', name, { service_type: service, ...parameters, send_to: measurementId, event_callback: callback });
        } else {
            window.gtag('event', name, { service_type: service, ...parameters, send_to: measurementId });
        }
    }
    const adsId = 'AW-16582460982';
    const leadDestination = adsId + '/cr4VCNeZ2bMZELaMkeM9';
    function ads(name, destination) {
        if (typeof window.gtag !== 'function') return;
        window.gtag('event', 'conversion', { send_to: destination, event_category: name });
    }
    window.vadAnalytics = { track, leadSuccess(formId) {
        track('generate_lead', { form_id: formId });
        ads('generate_lead', leadDestination);
    } };
    if (!enabled) return;
    window.gtag('config', measurementId, { content_group: service });

    document.addEventListener('DOMContentLoaded', () => {
        document.addEventListener('click', event => {
            const origin = event.composedPath?.().find(el => el.matches?.('a[href^="tel:"],a[href^="sms:"]')) || event.target;
            const phone = origin.closest('a[href^="tel:"]');
            const text = origin.closest('a[href^="sms:"]');
            if (phone || text) {
                const name = phone ? 'click_to_call' : 'click_to_text';
                track(name, {
                    cta_location: (phone || text).closest('[data-cta-location]')?.dataset.ctaLocation || ((phone || text).closest('.mobile-cta') ? 'mobile-bar' :
                        (phone || text).closest('nav') ? 'navigation' : 'contact'
                    )
                });
                const destination = window.vadContactConversionDestinations?.[name];
                if (destination) ads(name, destination);
                return;
            }
            const categoryButton = event.target.closest('#portfolio .gallery-filters button[data-filter]');
            if (categoryButton) {
                track('project_category_click', { project_category: categoryButton.dataset.filter });
                return;
            }
            const link = event.target.closest('a[href="#contact"],a[href="#heroEstimateForm"]');
            if (!link) return;
            track('estimate_click', {
                cta_location: link.dataset.ctaLocation ||
                    (link.closest('.modal') ? 'project' : link.closest('nav') ? 'navigation' : 'portfolio')
            });
        });
        // Per-form lifecycle events are owned by estimate-forms.js.

        // Attribute active time to the section occupying the largest visible area.
        // This also works for sections taller than the viewport, such as the gallery.
        const sections = [...document.querySelectorAll('header.masthead, section[id]')];
        const seen = new Set();
        let current = null;
        let elapsed = 0;
        let last = performance.now();
        function flush() {
            if (current && elapsed >= 1) {
                track('section_engagement', { section_name: current, duration_seconds: Math.round(elapsed * 100) / 100 });
            }
            elapsed = 0;
        }
        function visibleSection() {
            if (document.hidden || !document.hasFocus() || document.querySelector('.modal.show')) return null;
            const top = document.querySelector('#mainNav').getBoundingClientRect().bottom;
            let largest = 0;
            let name = null;
            sections.forEach(section => {
                const rect = section.getBoundingClientRect();
                const height = Math.max(0, Math.min(rect.bottom, window.innerHeight) - Math.max(rect.top, top));
                if (height > largest) { largest = height; name = section.id || 'hero'; }
            });
            return name;
        }
        function sample() {
            const now = performance.now();
            const next = visibleSection();
            // Discard long scheduling gaps (sleep/background throttling).
            if (current && next === current) elapsed += Math.min((now - last) / 1000, 1.5);
            last = now;
            if (next !== current) { flush(); current = next; }
            if (current && elapsed >= 1 && !seen.has(current)) {
                seen.add(current);
                track('section_view', { section_name: current });
            }
            if (elapsed >= 15) flush();
        }
        sample();
        setInterval(sample, 1000);
        function pause() { flush(); current = null; last = performance.now(); }
        window.addEventListener('blur', pause);
        window.addEventListener('pagehide', pause);
        window.addEventListener('focus', sample);
        document.addEventListener('visibilitychange', () => document.hidden ? pause() : sample());
    });
})();
