(() => {
  const measurementId = 'G-C2QFGZH9KC';
  const storageKey = 'tfp-analytics-consent';
  let choice = null;
  let started = false;
  try { choice = localStorage.getItem(storageKey); } catch (_) { /* Storage can be unavailable. */ }

  function startAnalytics() {
    if (started || choice !== 'granted') return;
    started = true;
    window.dataLayer = window.dataLayer || [];
    window.gtag = function () { window.dataLayer.push(arguments); };
    window.gtag('consent', 'default', {
      analytics_storage: 'denied', ad_storage: 'denied',
      ad_user_data: 'denied', ad_personalization: 'denied'
    });
    window.gtag('consent', 'update', { analytics_storage: 'granted' });
    window.gtag('js', new Date());
    window.gtag('config', measurementId, {
      allow_google_signals: false,
      allow_ad_personalization_signals: false,
      cookie_domain: 'none'
    });
    const script = document.createElement('script');
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${measurementId}`;
    document.head.append(script);
  }

  const copy = document.documentElement.lang === 'ru' ? {
    label: 'Аналитика сайта',
    question: 'Разрешить cookies аналитики, чтобы мы могли считать посещения и переходы к скачиванию приложения?',
    privacy: 'О конфиденциальности (на английском)',
    decline: 'Нет, спасибо', accept: 'Разрешить', settings: 'Настройки аналитики'
  } : {
    label: 'Website analytics',
    question: 'Allow analytics cookies to help us understand visits and app download clicks?',
    privacy: 'Privacy details', decline: 'No thanks', accept: 'Allow analytics', settings: 'Analytics settings'
  };
  const banner = document.createElement('section');
  banner.className = 'analytics-banner';
  banner.setAttribute('aria-label', copy.label);
  banner.innerHTML = `
    <p>${copy.question}
      <a href="/privacy.html#website-analytics">${copy.privacy}</a></p>
    <div class="analytics-banner__actions">
      <button type="button" data-consent="denied">${copy.decline}</button>
      <button type="button" data-consent="granted">${copy.accept}</button>
    </div>`;
  banner.hidden = choice === 'granted' || choice === 'denied';

  const footer = document.createElement('footer');
  footer.className = 'analytics-footer';
  const settings = document.createElement('button');
  settings.type = 'button';
  settings.textContent = copy.settings;
  settings.addEventListener('click', () => {
    banner.hidden = false;
    banner.querySelector('button').focus();
  });
  footer.append(settings);
  document.body.append(footer, banner);

  banner.addEventListener('click', event => {
    const button = event.target.closest('[data-consent]');
    if (!button) return;
    choice = button.dataset.consent;
    try { localStorage.setItem(storageKey, choice); } catch (_) { /* Use this visit's choice. */ }
    banner.hidden = true;
    settings.focus({ preventScroll: true });
    if (choice === 'granted') {
      startAnalytics();
    } else if (started) {
      window[`ga-disable-${measurementId}`] = true;
      for (const cookie of document.cookie.split(';')) {
        const name = cookie.trim().split('=')[0];
        if (name === '_ga' || name.startsWith('_ga_')) {
          document.cookie = `${name}=; Max-Age=0; Path=/; SameSite=Lax`;
        }
      }
      location.reload();
    }
  });

  document.addEventListener('click', event => {
    if (choice !== 'granted' || !started) return;
    const link = event.target.closest('a[href]');
    if (!link) return;
    const url = new URL(link.href, location.href);
    let name;
    if (url.hostname === 'apps.apple.com') name = 'iphone_download_click';
    if (url.origin === location.origin && url.pathname === '/android.html') name = 'android_install_click';
    if (!name) return;
    window.gtag('event', name, {
      link_url: url.origin + url.pathname,
      link_placement: link.closest('.hero__downloads') ? 'header' : 'direct_links',
      transport_type: 'beacon'
    });
  });

  // Honor a changed choice in another open page as well.
  window.addEventListener('storage', event => {
    if (event.key === storageKey || event.key === null) location.reload();
  });
  startAnalytics();
})();
