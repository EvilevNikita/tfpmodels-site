// Generated from content/locales.json and templates/languages.js.
window.TFP_LOCALES = __LOCALES__;
document.addEventListener('DOMContentLoaded', () => {
  const locale = window.TFP_LOCALES[document.documentElement.lang] || window.TFP_LOCALES.en;
  document.querySelectorAll('.language-picker').forEach(picker => {
    picker.querySelector('.language-current').textContent = locale.name;
    picker.querySelector('.language-nav').setAttribute('aria-label', locale.language);
    picker.querySelectorAll('[data-lang]').forEach(link => {
      if (link.dataset.lang === document.documentElement.lang) link.setAttribute('aria-current', 'page');
      else link.removeAttribute('aria-current');
    });
    document.addEventListener('click', event => {
      if (!picker.contains(event.target)) picker.open = false;
    });
    document.addEventListener('keydown', event => {
      if (event.key === 'Escape' && picker.open) {
        picker.open = false;
        picker.querySelector('summary').focus();
      }
    });
  });
});
