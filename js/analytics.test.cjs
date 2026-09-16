const { readFileSync } = require('node:fs');
const vm = require('node:vm');
const assert = require('node:assert/strict');
const source = readFileSync(`${__dirname}/analytics.js`, 'utf8');
const html = readFileSync(`${__dirname}/../index.html`, 'utf8');

function analytics(enabled) {
    let now = 0, tick;
    const events = [], handlers = {}, windowHandlers = {};
    const section = { id: 'portfolio', getBoundingClientRect: () => ({ top: 0, bottom: 3000 }) };
    const document = {
        hidden: false, hasFocus: () => true,
        addEventListener: (name, fn) => { handlers[name] = fn; },
        querySelectorAll: () => [section],
        querySelector: selector => selector === '#mainNav' ? { getBoundingClientRect: () => ({ bottom: 100 }) } : null
    };
    const window = { innerHeight: 800, gtag: (...args) => events.push(args), addEventListener: (name, fn) => { windowHandlers[name] = fn; } };
    vm.runInNewContext(enabled ? source : source.replace(/const measurementId = '[^']*';/, "const measurementId = '';"),
        { window, document, performance: { now: () => now }, setInterval: fn => { tick = fn; } });
    if (enabled) handlers.DOMContentLoaded();
    return { events, document, handlers, window, step: () => { now += 1000; tick(); } };
}

const off = analytics(false);
off.window.vadAnalytics.track('generate_lead');
assert.equal(off.events.length, 0, 'No GA4 traffic before configuration');
const active = analytics(true);
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

async function form(status, valid = true, networkFailure = false) {
    let submit, calls = 0;
    const events = [], ads = [], button = { disabled: false, style: {} };
    const elements = {
        contactForm: { checkValidity: () => valid, addEventListener: (_, fn) => { submit = fn; } },
        submitButton: button, submissionMessage: { style: {} },
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
    assert.equal(calls, valid ? 1 : 0, 'Duplicate or invalid submissions blocked');
    assert.equal(events.filter(e => e[0] === 'generate_lead').length, valid && status === 200 && !networkFailure ? 1 : 0);
    assert.equal(ads.length, valid && status === 200 && !networkFailure ? 1 : 0);
    if (status !== 200 || networkFailure) assert.equal(button.disabled, false, 'Failure allows retry');
    assert.ok(!JSON.stringify(events).includes('Private'), 'No form contents in analytics');
}
(async () => {
    await form(200); await form(500); await form(200, false); await form(200, true, true);
    console.log('PASS: analytics configuration, section visibility/time, event routing, submission success/failure and duplicate protection');
})();
