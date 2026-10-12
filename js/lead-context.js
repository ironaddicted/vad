/* Inquiry attribution is sent only with the inquiry, never as Analytics content. */
(() => {
  function context() {
    try {
      const params = new URLSearchParams(window.location.search);
      const fields = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term', 'gclid', 'gbraid', 'wbraid'];
      const campaign = fields.filter(key => params.has(key)).map(key => `${key}=${params.get(key).replace(/[\r\n]/g, ' ').slice(0, 180)}`).join('; ');
      if (campaign) sessionStorage.setItem('vad-lead-campaign', campaign);
      return `Website: VAD; Entry: ${window.location.pathname}; Campaign: ${campaign || sessionStorage.getItem('vad-lead-campaign') || 'not tagged'}`;
    } catch { return 'Website: VAD'; }
  }
  window.vadLeadContext = context;
  context();
})();
