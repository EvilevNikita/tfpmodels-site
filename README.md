# TFP Models website

Static site served by GitHub Pages. No client-side routing or build dependencies.

## Translations

The site's ten languages match the mobile app: `en`, `de`, `es`, `fr`, `it`,
`ja`, `ko`, `pl`, `pt-BR`, and `ru`.

- Edit translated text in `content/locales.json`.
- Edit the shared home and Android markup in `templates/`.
- Regenerate with `python3 scripts/generate_site.py` and commit the generated files.
- `index.html`, language-directory homepages, `android.html`, `languages.js`,
  and `sitemap.xml` are generated. Do not edit them directly.
- English lives at `/`; other homepages use lowercase language paths such as
  `/ja/` and `/pt-br/`. The Portuguese language tag remains `pt-BR`.
- Homepages use explicit language links, self-canonical URLs, and reciprocal
  `hreflang` links. There is no automatic language redirect.
- The Android guide honors `?lang=...`, then browser language, then English.
  It remains `noindex` and is intentionally excluded from the sitemap.
- Privacy, support, and community rules remain in English. Translated homepages
  label the English destinations accordingly.

Preview with `python3 -m http.server 8765 --bind 127.0.0.1`.

## Analytics

`analytics.js` uses the page's language for consent controls. Google Analytics
loads only after consent; download events retain the same names in all languages.
Do not remove the site's Search Console verification tag from the home template.
