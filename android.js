(() => {
  const supported = ['ru', 'en', 'de', 'ja'];
  const requested = new URLSearchParams(location.search).get('lang');
  const preferred = (navigator.languages || [navigator.language])
    .map(language => language.toLowerCase().split('-')[0]);
  const language = supported.includes(requested)
    ? requested
    : preferred.find(language => supported.includes(language)) || 'en';
  document.documentElement.dataset.language = language;
  document.documentElement.lang = language;
  document.addEventListener('DOMContentLoaded', () => {
    const section = document.querySelector(`.translation[lang="${language}"]`);
    document.title = section.querySelector('h1').textContent;
    document.querySelector('meta[name="description"]').content = section.querySelector('.page-subtitle').textContent;
    const activeLink = document.querySelector(`[data-lang="${language}"]`);
    activeLink.setAttribute('aria-current', 'page');
    document.querySelector('.language-current').textContent = activeLink.textContent;
    const picker = document.querySelector('.language-picker');
    document.addEventListener('click', event => {
      if (!picker.contains(event.target)) picker.open = false;
    });
    document.addEventListener('keydown', event => {
      if (event.key === 'Escape' && picker.open) {
        picker.open = false;
        picker.querySelector('summary').focus();
      }
    });
    document.querySelector('.language-nav').setAttribute('aria-label', {
      ru: 'Язык', en: 'Language', de: 'Sprache', ja: '言語'
    }[language]);
  });
})();
