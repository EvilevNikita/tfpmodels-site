const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const source = fs.readFileSync(path.join(__dirname, '../templates/marketing.js'), 'utf8');
function visit({ ua = '', url = 'https://tfpmodels.app/', languages = ['en'], platform } = {}) {
  const parsed = new URL(url);
  let destination;
  const listeners = {};
  vm.runInNewContext(source, {
    URL, URLSearchParams,
    location: {
      hostname: parsed.hostname, pathname: parsed.pathname, search: parsed.search,
      href: parsed.href, origin: parsed.origin,
      replace: value => { destination = value; },
    },
    navigator: { userAgent: ua, languages, userAgentData: { platform } },
    document: { addEventListener: (name, callback) => { listeners[name] = callback; } },
  });
  return { destination, listeners };
}

const apple = 'https://apps.apple.com/app/tfp-models/id6766621647';
assert.equal(visit({ ua: 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X)' }).destination, apple);
assert.equal(visit({ ua: 'Mozilla/5.0 (Linux; Android 16) Chrome/143.0 Mobile', languages: ['ru-RU'] }).destination,
  'https://tfpmodels.app/android.html?lang=ru#ru');
assert.equal(visit({ platform: 'Android', languages: ['pt-PT'] }).destination,
  'https://tfpmodels.app/android.html?lang=pt-BR#pt-BR');
const campaign = visit({ ua: 'Android', languages: ['de'], url: 'https://tfpmodels.app/?lang=ru&utm_source=instagram&utm_campaign=fall%20launch&redirect=https://evil.example' });
const destination = new URL(campaign.destination);
assert.equal(destination.pathname, '/android.html');
assert.equal(destination.searchParams.get('lang'), 'ru');
assert.equal(destination.searchParams.get('utm_source'), 'instagram');
assert.equal(destination.searchParams.get('utm_campaign'), 'fall launch');
assert.equal(destination.searchParams.has('redirect'), false);
assert.equal(visit({ ua: 'Android', languages: ['zh-CN'] }).destination, 'https://tfpmodels.app/android.html?lang=en#en');
for (const ua of ['', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)', 'Mozilla/5.0 (iPad; CPU OS 18_0)', 'facebookexternalhit/1.1 iPhone', 'Twitterbot Android']) {
  assert.equal(visit({ ua }).destination, undefined);
}
for (const url of ['https://www.tfpmodels.org/', 'https://tfpmodels.app/?stay=1', 'https://tfpmodels.app/about.html', 'https://tfpmodels.app/android.html', 'https://tfpmodels.app/ru/']) {
  assert.equal(visit({ ua: 'iPhone', url }).destination, undefined);
}
assert.equal(visit({ ua: 'iPhone', url: 'https://www.tfpmodels.app/index.html' }).destination, apple);

const links = [
  { href: 'https://tfpmodels.app/android.html?lang=en#en', matches: () => false },
  { href: 'https://tfpmodels.app/', matches: () => true },
  { href: apple, matches: () => false },
];
const manual = visit({ url: 'https://tfpmodels.app/?stay=1&utm_source=threads' });
// Run the saved DOM-ready handler with actual link-like objects.
vm.runInNewContext(source, {
  URL, URLSearchParams,
  location: { hostname: 'tfpmodels.app', pathname: '/', search: '?stay=1&utm_source=threads', href: 'https://tfpmodels.app/?stay=1&utm_source=threads', origin: 'https://tfpmodels.app' },
  navigator: { userAgent: '', languages: ['en'] },
  document: { addEventListener: (_, callback) => callback(), querySelectorAll: () => links },
});
assert.ok(manual.listeners.DOMContentLoaded);
assert.equal(new URL(links[0].href).searchParams.get('utm_source'), 'threads');
assert.equal(new URL(links[1].href).searchParams.get('stay'), '1');
assert.equal(links[2].href, apple);
console.log('Marketing routing checks passed: devices, languages, campaigns, bots, manual navigation, .org isolation.');
