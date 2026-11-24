/* Campaign fields travel with the inquiry, never in Analytics event parameters. */
(() => {
  const keys = ['gclid', 'utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content', 'gbraid', 'wbraid'];
  let fields = {};
  try {
    fields = JSON.parse(sessionStorage.getItem('vad-lead-fields') || '{}');
    if (!fields || typeof fields !== 'object' || Array.isArray(fields)) fields = {};
  } catch { fields = {}; }
  const params = new URLSearchParams(location.search);
  for (const key of keys) {
    if (params.has(key)) fields[key] = params.get(key).replace(/[\r\n]/g, ' ').slice(0, 180);
    else if (typeof fields[key] !== 'string') delete fields[key];
    else fields[key] = fields[key].replace(/[\r\n]/g, ' ').slice(0, 180);
  }
  try { sessionStorage.setItem('vad-lead-fields', JSON.stringify(fields)); } catch { /* In-memory attribution still works. */ }
  window.vadLeadFields = () => ({ ...fields });
  window.vadLeadContext = () => `Website: VAD; Entry: ${location.pathname}; Campaign: ${keys.filter(k => fields[k]).map(k => `${k}=${fields[k]}`).join('; ') || 'not tagged'}`;
  const populate = () => document.querySelectorAll('form[data-vad-estimate]').forEach(form => keys.forEach(key => {
    let input = form.querySelector(`input[type="hidden"][name="${key}"]`);
    if (!input) { input = document.createElement('input'); input.type = 'hidden'; input.name = key; form.append(input); }
    input.value = fields[key] || '';
  }));
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', populate); else populate();
})();
