const { readFileSync } = require('node:fs');
const vm = require('node:vm');
const assert = require('node:assert/strict');
const source = readFileSync(`${__dirname}/analytics.js`, 'utf8');
const html = readFileSync(`${__dirname}/../index.html`, 'utf8');

function analytics(enabled) {
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
    const window = { innerHeight: 800, gtag: (...args) => events.push(args), addEventListener: (name, fn) => { windowHandlers[name] = fn; } };
    vm.runInNewContext(enabled ? source : source.replace(/const measurementId = '[^']*';/, "const measurementId = '';"),
        { window, document, performance: { now: () => now }, setInterval: fn => { tick = fn; } });
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
assert.equal(active.events.at(-1)[2].send_to, 'G-XMQGDWGHL2', 'Custom events target only VAD GA4');
assert.equal(active.events[0][0], 'config');
assert.equal(active.events[0][1], 'G-XMQGDWGHL2', 'VAD GA4 configured');

const categories = analytics(true);
assert.equal(categories.events.filter(e => e[1] === 'project_category_click').length, 0, 'Default category is not a click');
for (const category of ['all', 'backsplash', 'flooring', 'renovation', 'renovation']) {
    categories.handlers.click({ target: { closest: selector => selector === '#portfolio .gallery-filters button[data-filter]'
        ? { dataset: { filter: category } } : null } });
    const sent = categories.events.at(-1);
    assert.equal(sent[1], 'project_category_click');
    assert.equal(sent[2].project_category, category);
    assert.equal(sent[2].send_to, 'G-XMQGDWGHL2');
}
assert.equal(categories.events.filter(e => e[1] === 'project_category_click').length, 5);
const beforeOtherClick = categories.events.length;
categories.handlers.click({ target: { closest: () => null } });
assert.equal(categories.events.length, beforeOtherClick, 'Unrelated clicks are ignored');

async function form(status, valid = true, networkFailure = false, honeypot = '') {
    let submit, calls = 0;
    const events = [], ads = [], button = { disabled: false, style: {} };
    const elements = {
        contactForm: { checkValidity: () => valid, addEventListener: (_, fn) => { submit = fn; } },
        submitButton: button, submissionMessage: { style: {} },
        website: { value: honeypot },
        name: { value: 'Private name' }, email: { value: 'private@example.com' }, phone: { value: '123' }, message: { value: 'Private message' }
    };
    const inline = [...html.matchAll(/<script>([\s\S]*?)<\/script>/g)].at(-1)[1];
    vm.runInNewContext(inline, {
        document: { addEventListener: (_, fn) => fn(), getElementById: id => elements[id] },
        window: { vadAnalytics: { track: (...args) => events.push(args) } },
        gtag: (...args) => ads.push(args), console: { error: () => {} },
        fetch: () => { calls++; return networkFailure ? Promise.reject(new Error('offline')) : Promise.resolve({ ok: status === 200, status }); }
    });
    submit({ preventDefault() {} }); submit({ preventDefault() {} });
    await new Promise(resolve => setImmediate(resolve));
    const allowed = valid && !honeypot;
    assert.equal(calls, allowed ? 1 : 0, 'Duplicate, invalid, or honeypot submissions blocked');
    assert.equal(events.filter(e => e[0] === 'generate_lead').length, allowed && status === 200 && !networkFailure ? 1 : 0);
    assert.equal(ads.length, allowed && status === 200 && !networkFailure ? 1 : 0);
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
    await form(200); await form(500); await form(200, false); await form(200, true, true);
    await form(200, true, false, 'https://spam.example');
    await form(200, true, false, '   ');
    console.log('PASS: analytics, submission success/failure, duplicate protection, and honeypot blocking without requests or conversions');
})();
