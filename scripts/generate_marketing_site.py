#!/usr/bin/env python3
"""Build the separate tfpmodels.app site without modifying the .org publication."""
import argparse
import re
import shutil
import subprocess
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
parser = argparse.ArgumentParser(description=__doc__)
parser.add_argument('--output', type=Path, default=ROOT.parent / 'website-app')
output = parser.parse_args().output.resolve()
if output == ROOT or ROOT in output.parents or output in ROOT.parents:
    parser.error('Marketing output must be separate from the existing website source.')

subprocess.run([sys.executable, str(ROOT / 'scripts/generate_site.py'), '--output', str(output)], check=True)
assets = [
    'styles.css', 'android.css', 'android.js', 'analytics.css', 'analytics.js',
    'favicon.png', 'apple-touch-icon.png', 'privacy.html', 'support.html',
    'community-guidelines.html', '.nojekyll',
]
for asset in assets:
    shutil.copyfile(ROOT / asset, output / asset)
shutil.copyfile(ROOT / 'templates/marketing.js', output / 'marketing.js')

for page in output.rglob('*.html'):
    # Existing .org canonicals and hreflang remain the source of SEO authority.
    html = page.read_text()
    html = re.sub(r'  <meta name="google-site-verification"[^>]*>\n', '', html)
    if 'name="robots"' not in html:
        html = html.replace('</head>', '  <meta name="robots" content="noindex">\n</head>')
    if page.name == 'index.html':
        html = html.replace('<meta charset="UTF-8">', '<meta charset="UTF-8">\n  <script src="/marketing.js"></script>')
        html = html.replace('</head>', '''  <meta property="og:type" content="website">
  <meta property="og:title" content="TFP Models — Models and Creators">
  <meta property="og:description" content="Find a team for TFP shoots. Get TFP Models for iPhone or Android.">
  <meta property="og:url" content="https://tfpmodels.app/">
  <meta property="og:image" content="https://tfpmodels.app/favicon.png">
  <meta name="twitter:card" content="summary">
</head>''')
    elif page.name == 'android.html':
        html = html.replace('</head>', '  <script src="/marketing.js"></script>\n</head>')
    page.write_text(html)

# A stable description link for mobile visitors who want to bypass routing.
shutil.copyfile(output / 'index.html', output / 'about.html')
(output / 'CNAME').write_text('tfpmodels.app\n')
(output / 'robots.txt').write_text('User-agent: *\nAllow: /\n')
(output / 'README.md').write_text('''# TFP Models marketing site

Published separately at https://tfpmodels.app using GitHub Pages, `main` / root.
The existing https://www.tfpmodels.org publication remains separate.

The root routes iPhone visitors to the existing App Store listing and Android
visitors to `/android.html`. Desktop and unrecognized devices see the landing
page. `/about.html` and `/?stay=1` bypass automatic routing.

Android installation instructions and homepages share the ten-language content
from [tfpmodels-site](https://github.com/EvilevNikita/tfpmodels-site).
This repository contains generated deployable files. To update them, run in
the source repository:

```sh
python3 scripts/generate_marketing_site.py --output ../tfpmodels-app-site
node scripts/test_marketing_routing.cjs
```

Use the cloned checkout of this repository as the output directory, review its
diff, then commit and push. Do not manually edit generated HTML or marketing.js.

Porkbun DNS: apex ALIAS `evilevnikita.github.io`, www CNAME
`evilevnikita.github.io`, TTL 600. The Pages custom domain is `tfpmodels.app`.
Keep the .org DNS and repository custom domain unchanged.

Marketing pages are noindex and retain .org homepage canonicals. Standard UTM
parameters survive the Android route and internal links. GA4 only loads after
consent, so fresh immediate iPhone redirects do not produce GA4 events and do
not measure installation. Store URLs and support email remain unchanged.
''')
# The marketing copy is noindex and must not advertise the .org sitemap as its own.
(output / 'sitemap.xml').unlink()
print(f'Marketing site ready: {output}')
