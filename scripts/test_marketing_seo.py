#!/usr/bin/env python3
"""Check search eligibility, localized canonicals, and .org isolation."""
import json
import subprocess
import sys
import tempfile
import xml.etree.ElementTree as ET
from html.parser import HTMLParser
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
COPY = json.loads((ROOT / 'content/marketing-locales.json').read_text())


class Head(HTMLParser):
    def __init__(self, html):
        super().__init__()
        self.links = []
        self.metas = []
        self.scripts = []
        self.anchors = []
        self.feed(html)

    def handle_starttag(self, tag, attrs):
        if tag == 'link':
            self.links.append(dict(attrs))
        if tag == 'meta':
            self.metas.append(dict(attrs))
        if tag == 'script':
            self.scripts.append(dict(attrs))
        if tag == 'a':
            self.anchors.append(dict(attrs))

    def noindex(self):
        return any(meta.get('name') == 'robots' and 'noindex' in meta.get('content', '') for meta in self.metas)


def home_path(code):
    return '/' if code == 'en' else f'/{code.lower()}/'


with tempfile.TemporaryDirectory() as folder:
    output = Path(folder)
    subprocess.run([sys.executable, str(ROOT / 'scripts/generate_marketing_site.py'), '--output', str(output)], check=True)
    expected = {code: 'https://tfpmodels.app' + home_path(code) for code in COPY}
    for code, url in expected.items():
        page = output / home_path(code).lstrip('/') / 'index.html'
        html = page.read_text()
        head = Head(html)
        assert not head.noindex(), code
        assert [link['href'] for link in head.links if link.get('rel') == 'canonical'] == [url], code
        alternate = {link['hreflang']: link['href'] for link in head.links if link.get('rel') == 'alternate'}
        assert alternate == {**expected, 'x-default': expected['en']}, code
        assert any(meta.get('property') == 'og:url' and meta['content'] == url for meta in head.metas), code
        assert any(meta.get('name') == 'description' and meta['content'] == COPY[code]['description'] for meta in head.metas), code
        assert '/marketing.js' not in html, code
        store_links = [link for link in head.anchors if link.get('href', '').startswith('https://apps.apple.com/')]
        assert len(store_links) == 2 and all('target' not in link for link in store_links), code
        assert all('data-app-store' not in link for link in store_links), code
        assert not any(token in html for token in ['barcelona:', 'x-safari-', 'itms-apps:']), code
        assert COPY[code]['heading'] in html, code
    ns = {'s': 'http://www.sitemaps.org/schemas/sitemap/0.9'}
    sitemap = ET.parse(output / 'sitemap.xml')
    urls = [node.text for node in sitemap.findall('s:url/s:loc', ns)]
    assert len(urls) == 10 and set(urls) == set(expected.values())
    assert 'Sitemap: https://tfpmodels.app/sitemap.xml' in (output / 'robots.txt').read_text()
    for page in ['android.html', 'about.html', 'privacy.html', 'support.html', 'community-guidelines.html']:
        assert Head((output / page).read_text()).noindex(), page
    assert 'https://tfpmodels.app/' in (output / 'about.html').read_text()
    org = Head((ROOT / 'index.html').read_text())
    assert not org.noindex()
    assert [link['href'] for link in org.links if link.get('rel') == 'canonical'] == ['https://www.tfpmodels.org/']
    assert '/marketing.js' not in (ROOT / 'index.html').read_text()

print('Marketing SEO checks passed: 10 indexable download pages, self-canonicals, reciprocal hreflang, sitemap, noindex exclusions, .org isolation.')
