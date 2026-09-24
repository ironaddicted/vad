/* GA4 shares the existing Google tag with Ads. No form values are collected. */
(() => {
    'use strict';
    // Google Analytics > Admin > Data streams > Web > Measurement ID.
    const measurementId = 'G-3ZWY4ES6FR';
    const enabled = /^G-[A-Z0-9]+$/.test(measurementId);
    function track(name, parameters = {}) {
        if (!enabled || typeof window.gtag !== 'function') return;
        if (parameters.event_callback) {
            const callback = parameters.event_callback;
            delete parameters.event_callback;
            window.gtag('event', name, { ...parameters, send_to: measurementId, event_callback: callback });
        } else {
            window.gtag('event', name, { ...parameters, send_to: measurementId });
        }
    }
    window.vadAnalytics = { track };
    if (!enabled) return;
    window.gtag('config', measurementId);

    document.addEventListener('DOMContentLoaded', () => {
        document.addEventListener('click', event => {
            const categoryButton = event.target.closest('#portfolio .gallery-filters button[data-filter]');
            if (categoryButton) {
                track('project_category_click', { project_category: categoryButton.dataset.filter });
                return;
            }
            const link = event.target.closest('a[href="#contact"]');
            if (!link) return;
            track('estimate_click', {
                cta_location: link.dataset.ctaLocation ||
                    (link.closest('.modal') ? 'project' : link.closest('nav') ? 'navigation' : 'portfolio')
            });
        });
        const contactForm = document.querySelector('#contactForm');
        function trackFormStart(event) {
            if (event.target.id === 'website') return;
            track('estimate_start');
            contactForm.removeEventListener('input', trackFormStart);
        }
        contactForm?.addEventListener('input', trackFormStart);

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
