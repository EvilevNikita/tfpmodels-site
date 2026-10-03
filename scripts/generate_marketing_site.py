#!/usr/bin/env python3
"""Build the separate tfpmodels.app site without modifying the .org publication."""
import argparse
import json
import re
import shutil
import subprocess
import sys
from pathlib import Path
from html import escape

ROOT = Path(__file__).resolve().parents[1]
parser = argparse.ArgumentParser(description=__doc__)
parser.add_argument('--output', type=Path, default=ROOT.parent / 'website-app')
output = parser.parse_args().output.resolve()
if output == ROOT or ROOT in output.parents or output in ROOT.parents:
    parser.error('Marketing output must be separate from the existing website source.')

subprocess.run([
    sys.executable, str(ROOT / 'scripts/generate_site.py'), '--output', str(output),
    '--base-url', 'https://tfpmodels.app',
    '--home-template', str(ROOT / 'templates/marketing-home.html'),
    '--home-overrides', str(ROOT / 'content/marketing-locales.json'),
], check=True)
marketing = json.loads((ROOT / 'content/marketing-locales.json').read_text())
assets = [
    'styles.css', 'android.css', 'android.js', 'analytics.css', 'analytics.js',
    'favicon.png', 'apple-touch-icon.png', 'privacy.html', 'support.html',
    'community-guidelines.html', '.nojekyll',
]
for asset in assets:
    shutil.copyfile(ROOT / asset, output / asset)
shutil.copyfile(ROOT / 'templates/marketing.js', output / 'marketing.js')

for page in output.rglob('*.html'):
    html = page.read_text()
    html = re.sub(r'  <meta name="google-site-verification"[^>]*>\n', '', html)
    if page.name != 'index.html' and 'name="robots"' not in html:
        html = html.replace('</head>', '  <meta name="robots" content="noindex">\n</head>')
    if page.name == 'index.html':
        html = html.replace('<meta charset="UTF-8">', '<meta charset="UTF-8">\n  <script defer src="/marketing.js?v=20261003-safari-link"></script>')
        code = re.search(r'<html lang="([^"]+)"', html).group(1)
        canonical = re.search(r'<link rel="canonical" href="([^"]+)"', html).group(1)
        html = html.replace('</head>', f'''  <meta property="og:type" content="website">
  <meta property="og:title" content="{escape(marketing[code]['title'])}">
  <meta property="og:description" content="{escape(marketing[code]['description'])}">
  <meta property="og:url" content="{canonical}">
  <meta property="og:image" content="https://tfpmodels.app/favicon.png">
  <meta name="twitter:card" content="summary">
</head>''')
    elif page.name == 'android.html':
        html = html.replace('</head>', '  <script defer src="/marketing.js?v=20261003-safari-link"></script>\n</head>')
    page.write_text(html)

# A stable description link for mobile visitors who want to bypass routing.
(output / 'about.html').write_text((output / 'index.html').read_text().replace(
    '</head>', '  <meta name="robots" content="noindex">\n</head>'))
cname = output / 'CNAME'
if not cname.exists() or cname.read_text().strip() != 'tfpmodels.app':
    cname.write_text('tfpmodels.app\n')
(output / 'robots.txt').write_text('User-agent: *\nAllow: /\n\nSitemap: https://tfpmodels.app/sitemap.xml\n')
urls = ['https://tfpmodels.app/' if code == 'en' else f'https://tfpmodels.app/{code.lower()}/' for code in marketing]
sitemap = '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n'
sitemap += '\n'.join(f'  <url><loc>{escape(url)}</loc></url>' for url in urls)
(output / 'sitemap.xml').write_text(sitemap + '\n</urlset>\n')
analytics = (output / 'analytics.js').read_text()
analytics = analytics.replace("url.hostname === 'apps.apple.com'", "url.hostname === 'apps.apple.com' || link.matches('a[data-app-store]')")
analytics = analytics.replace('link_url: url.origin + url.pathname,', "link_url: link.matches('a[data-app-store]') ? 'https://apps.apple.com/app/tfp-models/id6766621647' : url.origin + url.pathname,")
(output / 'analytics.js').write_text(analytics)
(output / 'README.md').write_text('''# TFP Models marketing site

Published separately at https://tfpmodels.app using GitHub Pages, `main` / root.
The existing https://www.tfpmodels.org publication remains separate.

The root displays the download page before routing iPhone browsers to the existing App Store listing and Android
visitors to `/android.html`. Desktop and unrecognized devices see the landing
page. Embedded iPhone browsers (including Threads and Instagram) keep the
information visible and use the App Store button instead of an automatic store
handoff. On iPhone, buttons use a clickable x-safari-https link to reopen the root
in Safari, which then attempts the ordinary App Store handoff. A separate HTTPS link and Safari instructions remain available.
Manual interaction cancels a pending automatic redirect.
`/about.html` and `/?stay=1` bypass automatic routing.

Android installation instructions and download pages use ten-language content
from [tfpmodels-site](https://github.com/EvilevNikita/tfpmodels-site).
This repository contains generated deployable files. To update them, run in
the source repository:

```sh
python3 scripts/generate_marketing_site.py --output ../tfpmodels-app-site
node scripts/test_marketing_routing.cjs
python3 scripts/test_marketing_seo.py
```

Use the cloned checkout of this repository as the output directory, review its
diff, then commit and push. Do not manually edit generated HTML or marketing.js.

Porkbun DNS: apex ALIAS `evilevnikita.github.io`, www CNAME
`evilevnikita.github.io`, TTL 600. The Pages custom domain is `tfpmodels.app`.
Keep the .org DNS and repository custom domain unchanged.

Download homepages are indexable, with self-canonicals and reciprocal hreflang
on .app, and are listed in the .app sitemap. Android, legal pages, and the
duplicate /about.html stay noindex. Download copy lives in
`content/marketing-locales.json`; its template is `templates/marketing-home.html`.
Search indexing and search-result appearance are decided by the search engine.
Standard UTM
parameters survive the Android route and internal links. GA4 only loads after
consent, so fresh immediate iPhone redirects do not produce GA4 events and do
not measure installation. Store URLs and support email remain unchanged.
''')
print(f'Marketing site ready: {output}')
