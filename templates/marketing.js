// Included only in the separate tfpmodels.app publication.
(() => {
  const hosts = ['tfpmodels.app', 'www.tfpmodels.app', 'localhost', '127.0.0.1'];
  if (!hosts.includes(location.hostname)) return;
  const params = new URLSearchParams(location.search);
  const campaignKeys = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content', 'utm_id'];
  const supported = ['en', 'de', 'es', 'fr', 'it', 'ja', 'ko', 'pl', 'pt-BR', 'ru'];
  const pathLanguage = supported.find(code => {
    const prefix = '/' + code.toLowerCase();
    return [prefix, prefix + '/', prefix + '/index.html'].includes(location.pathname);
  });
  const ua = navigator.userAgent || '';
  const preview = /bot|crawler|spider|facebookexternalhit|Facebot|Twitterbot|LinkedInBot|WhatsApp|TelegramBot/i.test(ua);
  const entry = location.pathname === '/' || location.pathname === '/index.html' || Boolean(pathLanguage);
  const iphone = /iPhone|iPod/i.test(ua);
  let destination;
  if (entry && params.get('stay') !== '1' && !preview) {
    if (iphone) {
      destination = 'https://apps.apple.com/app/tfp-models/id6766621647';
    } else if (/Android/i.test(ua) || navigator.userAgentData?.platform === 'Android') {
      destination = 'https://play.google.com/store/apps/details?id=tfpmodels.app';
    }
  }

  // Keep campaign attribution on internal navigation.
  // Store URLs are left untouched.
  function start() {
    for (const link of document.querySelectorAll('a[href]')) {
      const url = new URL(link.href, location.href);
      if (url.origin !== location.origin) continue;
      for (const key of campaignKeys) {
        if (params.has(key)) url.searchParams.set(key, params.get(key));
      }
      link.href = url.href;
    }
    if (!destination) return;
    let interacted = false;
    document.addEventListener('pointerdown', () => { interacted = true; }, { once: true });
    document.addEventListener('keydown', () => { interacted = true; }, { once: true });
    // Two frames allow a complete paint before any navigation starts. The
    // short delay keeps the information and manual buttons visible first.
    requestAnimationFrame(() => requestAnimationFrame(() => {
      setTimeout(() => {
        if (interacted) return;
        try { location.replace(destination); } catch (_) { /* Manual buttons remain available. */ }
      }, 350);
    }));
  }
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', start, { once: true });
  } else {
    start();
  }
})();
