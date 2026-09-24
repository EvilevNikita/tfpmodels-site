#!/usr/bin/env python3
"""Generate the ten static homepages, Android guide, and language metadata."""
import json
from html import escape
from pathlib import Path
from string import Template

ROOT = Path(__file__).resolve().parents[1]
BASE = 'https://www.tfpmodels.org'
CODES = ['en', 'de', 'es', 'fr', 'it', 'ja', 'ko', 'pl', 'pt-BR', 'ru']
LOCALES = json.loads((ROOT / 'content/locales.json').read_text())
assert set(LOCALES) == set(CODES)


def home_path(code):
    return '/' if code == 'en' else f'/{code.lower()}/'


def picker(code, android=False):
    locale = LOCALES[code]
    links = []
    for language in CODES:
        href = f'?lang={language}#{language}' if android else home_path(language)
        current = ' aria-current="page"' if language == code else ''
        links.append(f'<a href="{href}" lang="{language}" hreflang="{language}" data-lang="{language}"{current}>{escape(LOCALES[language]["name"])}</a>')
    return f'''<details class="language-picker">
            <summary><span class="language-current">{escape(locale['name'])}</span><svg class="language-chevron" width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true" focusable="false"><path d="m6 9 6 6 6-6" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"/></svg></summary>
            <nav class="language-nav" aria-label="{escape(locale['language'])}">
              {chr(10).join(links)}
            </nav>
          </details>'''


home_template = Template((ROOT / 'templates/home.html').read_text())
for code in CODES:
    locale = LOCALES[code]
    values = {key: escape(value) for key, value in locale['home'].items() if isinstance(value, str)}
    values.update({f'feature_{i}': escape(value) for i, value in enumerate(locale['home']['features'])})
    links = [f'<link rel="canonical" href="{BASE}{home_path(code)}">']
    links += [f'<link rel="alternate" hreflang="{other}" href="{BASE}{home_path(other)}">' for other in CODES]
    links += [f'<link rel="alternate" hreflang="x-default" href="{BASE}/">']
    values.update(code=code, seo_links='\n  '.join(links), picker=picker(code))
    output = ROOT / home_path(code).lstrip('/') / 'index.html'
    output.parent.mkdir(exist_ok=True)
    output.write_text(home_template.substitute(values))

steps = [
    'https://groups.google.com/g/tfpmodels-android-testers',
    'https://play.google.com/apps/testing/tfpmodels.app',
    'https://play.google.com/store/apps/details?id=tfpmodels.app',
]
articles = []
for code in CODES:
    copy = LOCALES[code]['android']
    assert len(copy) == 18, code
    text = [escape(value) for value in copy]
    cards = '\n'.join(f'''          <li class="card">
            <h2>{text[6 + i * 3]}</h2>
            <p>{text[7 + i * 3]}</p>
            <a class="button button--primary" href="{url}">{text[8 + i * 3]}</a>
          </li>''' for i, url in enumerate(steps))
    help_text = text[17].replace('support@tfpmodels.org', '<a href="mailto:support@tfpmodels.org">support@tfpmodels.org</a>')
    articles.append(f'''      <article class="translation" lang="{code}" id="{code}" aria-labelledby="title-{code}">
        <header class="install-header">
          <h1 id="title-{code}">{text[0]}</h1>
          <p class="page-subtitle">{text[1]}</p>
          <h2>{text[2]}</h2>
          <p>{text[3]}</p>
        </header>
        <aside class="install-note">
          <h2>{text[4]}</h2>
          <p>{text[5]}</p>
        </aside>
        <ol class="install-steps" role="list">
{cards}
        </ol>
        <section class="install-help">
          <h2>{text[15]}</h2>
          <p>{text[16]}</p>
          <p>{help_text}</p>
        </section>
      </article>''')
android_template = Template((ROOT / 'templates/android.html').read_text())
(ROOT / 'android.html').write_text(android_template.substitute(picker=picker('en', android=True), articles='\n'.join(articles)))

client_locales = {code: {key: LOCALES[code][key] for key in ['name', 'language', 'consent']} for code in CODES}
runtime = (ROOT / 'templates/languages.js').read_text().replace('__LOCALES__', json.dumps(client_locales, ensure_ascii=False, indent=2))
(ROOT / 'languages.js').write_text(runtime)

urls = [BASE + home_path(code) for code in CODES]
urls += [f'{BASE}/{page}.html' for page in ['privacy', 'support', 'community-guidelines']]
sitemap = '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n'
sitemap += '\n'.join(f'  <url><loc>{escape(url)}</loc></url>' for url in urls)
(ROOT / 'sitemap.xml').write_text(sitemap + '\n</urlset>\n')
print(f'Generated {len(CODES)} homepages and Android translations, shared language controls, and sitemap.')
