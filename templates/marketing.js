// Included only in the separate tfpmodels.app publication.
(() => {
  const hosts = ['tfpmodels.app', 'www.tfpmodels.app', 'localhost', '127.0.0.1'];
  if (!hosts.includes(location.hostname)) return;
  const params = new URLSearchParams(location.search);
  const campaignKeys = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content', 'utm_id'];
  const supported = ['en', 'de', 'es', 'fr', 'it', 'ja', 'ko', 'pl', 'pt-BR', 'ru'];
  const match = value => {
    const normalized = (value || '').toLowerCase();
    return supported.find(code => code.toLowerCase() === normalized)
      || supported.find(code => code.split('-')[0] === normalized.split('-')[0]);
  };
  const language = match(params.get('lang'))
    || (navigator.languages || [navigator.language]).map(match).find(Boolean)
    || 'en';
  const ua = navigator.userAgent || '';
  const preview = /bot|crawler|spider|facebookexternalhit|Facebot|Twitterbot|LinkedInBot|WhatsApp|TelegramBot/i.test(ua);
  const entry = location.pathname === '/' || location.pathname === '/index.html';
  if (entry && params.get('stay') !== '1' && !preview) {
    if (/iPhone|iPod/i.test(ua)) {
      location.replace('https://apps.apple.com/app/tfp-models/id6766621647');
      return;
    }
    if (/Android/i.test(ua) || navigator.userAgentData?.platform === 'Android') {
      const target = new URL('/android.html', location.href);
      target.searchParams.set('lang', language);
      for (const key of campaignKeys) {
        if (params.has(key)) target.searchParams.set(key, params.get(key));
      }
      target.hash = language;
      location.replace(target.href);
      return;
    }
  }

  // Keep campaign attribution when users choose Android or change language.
  // Store URLs are left untouched: Apple uses its own campaign parameters.
  document.addEventListener('DOMContentLoaded', () => {
    for (const link of document.querySelectorAll('a[href]')) {
      const url = new URL(link.href, location.href);
      if (url.origin !== location.origin) continue;
      for (const key of campaignKeys) {
        if (params.has(key)) url.searchParams.set(key, params.get(key));
      }
      if (link.matches('.language-nav a') && url.pathname !== '/android.html') {
        url.searchParams.set('stay', '1');
      }
      link.href = url.href;
    }
  });
})();
