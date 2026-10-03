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

## Separate tfpmodels.app marketing site

Build from these same templates without altering the published `.org` files:

```sh
python3 scripts/generate_marketing_site.py
python3 scripts/test_marketing_seo.py
```

Output defaults to `../website-app/`. Publish that directory as a separate
GitHub Pages site with the custom domain `tfpmodels.app`; keep this repository's
existing `www.tfpmodels.org` domain and publication unchanged.

- Every device sees the download page. For iPhone opens the ordinary HTTPS
  App Store link; For Android opens the local installation guide. There are no
  automatic redirects, custom protocols, or external-browser handoffs.
- The Android guide retains all three closed-testing steps. Once Google Play
  is publicly available, change the Android links in `templates/marketing-home.html`.
- Download homepages on `.app` are indexable, with self-canonical URLs,
  reciprocal `.app` hreflang, localized social-preview metadata, and a sitemap.
  Android, legal pages, and the duplicate `/about.html` remain `noindex`.
- Edit the distinct download copy in `content/marketing-locales.json` and its
  layout in `templates/marketing-home.html`. The `.org` homepage uses its
  existing template and content. Search engines decide when and whether to
  index the pages; these settings make them eligible for organic search.
- The existing consent-based GA4 policy applies on `.app`. A fresh iPhone visit
  immediately goes to Apple without loading GA4; neither routing nor a store
  click proves installation. Consent and cookies are separate across domains.

Deployment: configure and verify the new domain in GitHub Pages, then configure
only the `.app` DNS zone in Porkbun. GitHub Pages apex A records are
`185.199.108.153`, `185.199.109.153`, `185.199.110.153`, `185.199.111.153`;
`www` CNAME points to `evilevnikita.github.io`. Enable HTTPS when the certificate
is ready. The live `.app` setup uses the equivalent Porkbun apex ALIAS
`evilevnikita.github.io` and `www` CNAME `evilevnikita.github.io`, TTL 600.
Test both apex and `www`, device routing, manual buttons, translations,
social previews, and continued `.org` availability before running ads.
