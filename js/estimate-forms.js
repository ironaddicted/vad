/* Shared hero/home/bottom handler; no conversion before backend success. */
(() => {
  const endpoint = 'https://htmczrw2tgityftpxj5535hdye0zreqf.lambda-url.us-east-1.on.aws';
  document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('form[data-vad-estimate]').forEach(form => {
      const button = form.querySelector('button[type="submit"]');
      const status = form.querySelector('[data-form-status]');
      let pending = false, completed = false, started = false;
      form.addEventListener('input', event => {
        if (event.target.name === 'website' || started) return;
        started = true; window.vadAnalytics?.track('estimate_start', { form_id: form.id });
      });
      function success(bot = false) {
        completed = true;
        const notice = document.createElement('div');
        notice.className = 'estimate-success'; notice.setAttribute('role', 'status'); notice.tabIndex = -1;
        const heading = document.createElement('h3'); heading.textContent = 'Thank you! Your estimate request has been sent.';
        const copy = document.createElement('p'); copy.textContent = 'We typically reply the same day. Prefer to talk? Call or text (704) 665-0505.';
        const link = document.createElement('a'); link.href = 'tel:+17046650505'; link.textContent = 'Call (704) 665-0505';
        notice.append(heading, copy, link); form.replaceWith(notice); notice.focus();
        if (!bot) window.vadAnalytics?.leadSuccess(form.id);
      }
      form.addEventListener('submit', async event => {
        event.preventDefault();
        if (pending || completed) return;
        if (form.elements.namedItem('website')?.value) { success(true); return; }
        const value = key => String(form.elements.namedItem(key)?.value || '').trim();
        const errors = {};
        if (!value('name')) errors.name = 'Please enter your name.';
        const digits = value('phone').replace(/\D/g, '');
        if (!/^\+?[\d\s().-]+$/.test(value('phone')) || !(digits.length === 10 || (digits.length === 11 && digits.startsWith('1')))) errors.phone = 'Enter a valid US phone number, including area code.';
        if (!/^\d{5}$/.test(value('zip'))) errors.zip = 'Enter a 5-digit ZIP code.';
        if (value('email') && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value('email'))) errors.email = 'Enter a valid email or leave it blank.';
        for (const key of ['name', 'phone', 'zip', 'email']) {
          const input = form.elements.namedItem(key), error = form.querySelector(`[data-error="${key}"]`);
          if (input) input.setAttribute('aria-invalid', errors[key] ? 'true' : 'false');
          if (error) error.textContent = errors[key] || '';
        }
        if (Object.keys(errors).length) {
          status.textContent = 'Please check the highlighted fields.'; status.hidden = false;
          form.elements.namedItem(Object.keys(errors)[0]).focus(); return;
        }
        pending = true; button.disabled = true; button.textContent = 'Sending…'; status.hidden = true;
        const attribution = window.vadLeadFields?.() || {};
        const payload = { source: 'vad', service: document.body.dataset.service || 'general', form_id: form.id,
          name: value('name'), phone: value('phone'), zip: value('zip'), email: value('email'), website: '',
          ...attribution, message: [value('message'), `ZIP: ${value('zip')}`, window.vadLeadContext?.()].filter(Boolean).join('\n\n') };
        window.vadAnalytics?.track('estimate_submit_attempt', { form_id: form.id });
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 20000);
        try {
          const response = await fetch(endpoint, { method: 'POST', body: JSON.stringify(payload), signal: controller.signal });
          if (!response.ok || response.type === 'opaque') throw new Error('submission');
          success();
        } catch {
          status.textContent = 'We couldn’t confirm your request. Please try again, or call/text (704) 665-0505.';
          status.hidden = false;
          window.vadAnalytics?.track('estimate_error', { form_id: form.id, error_type: 'submission' });
          pending = false; button.disabled = false; button.textContent = 'Get My Free Estimate';
        } finally { clearTimeout(timeout); }
      });
    });
  });
})();
