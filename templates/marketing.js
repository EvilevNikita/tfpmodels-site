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
  // Embedded iOS browsers can block an automatic store handoff and show a
  // blank webview. Keep the download page there and use the visitor's tap.
  const iphone = /iPhone|iPod/i.test(ua);
  let socialReferrer = false;
  try {
    socialReferrer = /(^|\.)(threads\.net|threads\.com|instagram\.com|facebook\.com|tiktok\.com)$/.test(new URL(document.referrer).hostname);
  } catch (_) { /* A direct visit has no referrer. */ }
  const embedded = /Instagram|Barcelona|Threads|FBAN|FBAV|TikTok|Bytedance|Line\/|Pinterest|Snapchat/i.test(ua)
    || (iphone && (!/Safari|CriOS|FxiOS|EdgiOS|OPiOS/i.test(ua) || socialReferrer));
  let destination;
  if (entry && params.get('stay') !== '1' && !preview) {
    if (iphone && !embedded) {
      destination = 'https://apps.apple.com/app/tfp-models/id6766621647';
    } else if (/Android/i.test(ua) || navigator.userAgentData?.platform === 'Android') {
      const target = new URL('/android.html', location.href);
      target.searchParams.set('lang', language);
      for (const key of campaignKeys) {
        if (params.has(key)) target.searchParams.set(key, params.get(key));
      }
      target.hash = language;
      destination = target.href;
    }
  }

  // Keep campaign attribution when users choose Android or change language.
  // Store URLs are left untouched: Apple uses its own campaign parameters.
  function start() {
    if (iphone && !preview) {
      for (const link of document.querySelectorAll('a[data-app-store]')) {
        link.addEventListener('click', event => {
          if (event.defaultPrevented || event.button > 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
          // Stay inside the user's tap: no popup, timer, or intermediate web page.
          // Keep the HTTPS href for no-JS browsing, analytics, and the separate fallback.
          try {
            location.assign('itms-apps://itunes.apple.com/app/id6766621647');
            event.preventDefault();
          } catch (_) { /* Let the ordinary HTTPS link handle a rejected scheme. */ }
        });
      }
    }
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
      }, 250);
    }));
  }
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', start, { once: true });
  } else {
    start();
  }
})();
