(() => {
  const supported = Object.keys(window.TFP_LOCALES);
  const match = value => {
    const normalized = (value || '').toLowerCase();
    return supported.find(code => code.toLowerCase() === normalized)
      || supported.find(code => code.split('-')[0] === normalized.split('-')[0]);
  };
  const requested = match(new URLSearchParams(location.search).get('lang'));
  const preferred = (navigator.languages || [navigator.language])
    .map(match).find(Boolean);
  const language = requested || preferred || 'en';
  document.documentElement.dataset.language = language;
  document.documentElement.lang = language;
  document.addEventListener('DOMContentLoaded', () => {
    const section = document.querySelector(`.translation[lang="${language}"]`);
    section.classList.add('is-active');
    document.title = section.querySelector('h1').textContent;
    document.querySelector('meta[name="description"]').content = section.querySelector('.page-subtitle').textContent;
  });
})();
