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
node scripts/test_marketing_routing.cjs
```

Output defaults to `../website-app/`. Publish that directory as a separate
GitHub Pages site with the custom domain `tfpmodels.app`; keep this repository's
existing `www.tfpmodels.org` domain and publication unchanged.

- Only `/` and `/index.html` automatically route: iPhone/iPod to the existing
  App Store URL, Android to the local Android guide. Desktop, iPad, unknown
  devices, and recognized social-preview bots see the existing landing page.
- `/about.html`, `/?stay=1`, and translated homepages display the description
  without automatic routing. If external navigation is blocked, the landing
  page's manual download buttons remain available.
- Android routing uses the requested language, then browser language, then
  English. Standard UTM parameters survive routing and internal navigation;
  store URLs use their existing parameters.
- The Android guide retains all three closed-testing steps. Once Google Play
  is publicly available, change the Android destination in `templates/marketing.js`.
- Marketing pages are `noindex`; existing home canonical/hreflang URLs point
  to `.org`. The `.app` copy has social-preview metadata and no sitemap.
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
