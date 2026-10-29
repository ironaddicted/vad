const { readFileSync } = require('node:fs');
const vm = require('node:vm');
const assert = require('node:assert/strict');
const source = readFileSync(`${__dirname}/analytics.js`, 'utf8');
const html = readFileSync(`${__dirname}/../index.html`, 'utf8');

function analytics(enabled, path = '/', search = '') {
    let now = 0, tick;
    const events = [], handlers = {}, windowHandlers = {};
    const formHandlers = {};
    const contactForm = {
        addEventListener: (name, fn) => { formHandlers[name] = fn; },
        removeEventListener: name => { delete formHandlers[name]; }
    };
    const section = { id: 'portfolio', getBoundingClientRect: () => ({ top: 0, bottom: 3000 }) };
    const document = {
        hidden: false, hasFocus: () => true,
        addEventListener: (name, fn) => { handlers[name] = fn; },
        querySelectorAll: () => [section],
        querySelector: selector => selector === '#mainNav' ? { getBoundingClientRect: () => ({ bottom: 100 }) } : selector === '#contactForm' ? contactForm : null
    };
    const window = {
        location: { pathname: path, search },
        innerHeight: 800,
        gtag: (...args) => {
            events.push(args);
            if (args[0] === 'event' && args[2] && typeof args[2].event_callback === 'function') {
                setImmediate(args[2].event_callback);
            }
        },
        addEventListener: (name, fn) => { windowHandlers[name] = fn; }
    };
    vm.runInNewContext(enabled ? source : source.replace(/const measurementId = '[^']*';/, "const measurementId = '';"),
        { window, document, URLSearchParams, performance: { now: () => now }, setInterval: fn => { tick = fn; } });
    if (enabled) handlers.DOMContentLoaded();
    return { events, document, handlers, formHandlers, window, step: () => { now += 1000; tick(); } };
}

const off = analytics(false);
off.window.vadAnalytics.track('generate_lead');
assert.equal(off.events.length, 0, 'No GA4 traffic before configuration');
const active = analytics(true);
active.formHandlers.input({ target: { id: 'website' } });
assert.equal(active.events.filter(e => e[1] === 'estimate_start').length, 0, 'Honeypot input is not a form start');
active.formHandlers.input({ target: { id: 'name' } });
assert.equal(active.events.filter(e => e[1] === 'estimate_start').length, 1, 'Real field still records a form start');
assert.equal(active.formHandlers.input, undefined, 'Form start listener removed after real input');
active.step(); active.step();
assert.equal(active.events.filter(e => e[1] === 'section_view').length, 1, 'Tall gallery tracked once');
active.document.hidden = true;
active.handlers.visibilitychange();
const count = active.events.length;
active.step(); active.step();
assert.equal(active.events.length, count, 'Hidden tabs add no time');
assert.equal(active.events.find(e => e[1] === 'section_engagement')[2].duration_seconds, 2);
active.window.vadAnalytics.track('generate_lead');
assert.equal(active.events.at(-1)[2].send_to, 'G-3ZWY4ES6FR', 'Custom events target only VAD GA4');
assert.equal(active.events[0][0], 'config');
assert.equal(active.events[0][1], 'G-3ZWY4ES6FR', 'VAD GA4 configured');

const categories = analytics(true);
assert.equal(categories.events.filter(e => e[1] === 'project_category_click').length, 0, 'Default category is not a click');
for (const category of ['all', 'backsplash', 'flooring', 'renovation', 'renovation']) {
    categories.handlers.click({ target: { closest: selector => selector === '#portfolio .gallery-filters button[data-filter]'
        ? { dataset: { filter: category } } : null } });
    const sent = categories.events.at(-1);
    assert.equal(sent[1], 'project_category_click');
    assert.equal(sent[2].project_category, category);
    assert.equal(sent[2].send_to, 'G-3ZWY4ES6FR');
}
assert.equal(categories.events.filter(e => e[1] === 'project_category_click').length, 5);
const beforeOtherClick = categories.events.length;
categories.handlers.click({ target: { closest: () => null } });
assert.equal(categories.events.length, beforeOtherClick, 'Unrelated clicks are ignored');

async function form(status, valid = true, networkFailure = false, honeypot = '', tagAvailable = true) {
    let submit, calls = 0, resolveResponse, rejectResponse;
    const pendingResponse = new Promise((resolve, reject) => {
        resolveResponse = resolve;
        rejectResponse = reject;
    });
    const events = [], ads = [], redirects = [], timers = [], button = { disabled: false, style: {} };
    const elements = {
        contactForm: { checkValidity: () => valid, addEventListener: (_, fn) => { submit = fn; } },
        submitButton: button, submissionMessage: { style: {} },
        website: { value: honeypot },
        name: { value: 'Private name' }, email: { value: 'private@example.com' }, phone: { value: '123' }, message: { value: 'Private message' }
    };
    const inline = [...html.matchAll(/<script>([\s\S]*?)<\/script>/g)].at(-1)[1];
    vm.runInNewContext(inline, {
        document: { body: { dataset: { service: 'kitchen' } }, addEventListener: (_, fn) => fn(), getElementById: id => elements[id] },
        window: {
            location: { assign: url => redirects.push(url) },
            vadAnalytics: {
                track: (name, params = {}) => {
                    events.push([name, params]);
                    // Deliberately never invoke analytics callbacks (e.g. blocked tag).
                }
            }
        },
        gtag: tagAvailable ? (...args) => ads.push(args) : undefined, console: { error: () => {} }, setTimeout: fn => timers.push(fn),
        fetch: () => { calls++; return pendingResponse; }
    });
    submit({ preventDefault() {} }); submit({ preventDefault() {} });
    assert.equal(calls, valid && !honeypot ? 1 : 0, 'Request starts without an analytics callback');
    await new Promise(resolve => setImmediate(resolve));
    assert.equal(ads.length, 0, 'No Ads conversion while Lambda response is pending');
    assert.equal(redirects.length, 0, 'No redirect while backend response is pending');
    assert.equal(events.filter(e => e[0] === 'estimate_submit_attempt').length, valid && !honeypot ? 1 : 0, 'One diagnostic attempt for a valid request');
    assert.equal(events.filter(e => e[0] === 'estimate_submit').length, 0, 'An attempt must not emit the historical submission conversion event');
    assert.equal(events.filter(e => e[0] === 'generate_lead').length, 0, 'No GA4 lead before Lambda responds');
    if (calls) {
        if (networkFailure) rejectResponse(new Error('offline'));
        else resolveResponse({ ok: status >= 200 && status < 300, status });
    }
    await new Promise(resolve => setImmediate(resolve));
    const allowed = valid && !honeypot;
    assert.equal(calls, allowed ? 1 : 0, 'Duplicate, invalid, or honeypot submissions blocked');
    assert.equal(events.filter(e => e[0] === 'generate_lead').length, allowed && status === 200 && !networkFailure ? 1 : 0);
    assert.equal(ads.length, allowed && status === 200 && !networkFailure && tagAvailable ? 1 : 0);
    timers.forEach(fn => fn());
    events.filter(e => e[0] === 'generate_lead').forEach(e => e[1].event_callback());
    timers.forEach(fn => fn());
    assert.deepEqual(redirects, allowed && status === 200 && !networkFailure ? ['/quote-thank-you/?service=kitchen'] : [], 'Only backend success redirects, once, even with blocked analytics');
    if (valid && honeypot) {
        assert.equal(events.length, 0, 'Blocked submissions do not pollute analytics');
        assert.equal(elements.submissionMessage.style.display, 'block');
        assert.equal(button.style.display, 'none');
        assert.equal(button.disabled, true);
    }
    if (status !== 200 || networkFailure) assert.equal(button.disabled, false, 'Failure allows retry');
    assert.ok(!JSON.stringify(events).includes('Private'), 'No form contents in analytics');
}
(async () => {
    await form(200); await form(403); await form(500); await form(503); await form(200, false); await form(200, true, true);
    await form(200, true, false, 'https://spam.example');
    await form(200, true, false, '   ');
    await form(200, true, false, '', false);
    console.log('PASS: analytics, submission success/failure, duplicate protection, and honeypot blocking without requests or conversions');
})();

for (const service of ['kitchen', 'bathroom']) {
    const tracked = analytics(true, `/${service}-remodeling/`);
    tracked.window.vadAnalytics.track('generate_lead');
    assert.equal(tracked.events.at(-1)[2].service_type, service);
    assert.equal(tracked.events[0][2].content_group, service);
    const phone = { closest: () => null };
    tracked.handlers.click({ target: { closest: selector => selector === 'a[href^="tel:"]' ? phone : null } });
    assert.equal(tracked.events.at(-1)[1], 'phone_click');
    assert.equal(tracked.events.at(-1)[2].service_type, service);
}

for (const service of ['kitchen', 'bathroom', 'general', 'invalid']) {
    const thanks = analytics(true, '/quote-thank-you/', `?service=${service}`);
    assert.equal(thanks.events[0][2].content_group, service === 'invalid' ? 'general' : service);
    assert.equal(thanks.events.filter(e => e[1] === 'generate_lead' || e[1] === 'conversion').length, 0, 'Opening or refreshing thank-you page never generates a conversion');
}
