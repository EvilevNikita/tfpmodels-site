const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const source = fs.readFileSync(path.join(__dirname, '../templates/marketing.js'), 'utf8');
const safari = 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 Version/18.0 Mobile/15E148 Safari/604.1';
const apple = 'https://apps.apple.com/app/tfp-models/id6766621647';

function visit({ ua = '', url = 'https://tfpmodels.app/', languages = ['en'], platform, links = [], blocked = false, referrer = '' } = {}) {
  const parsed = new URL(url);
  let destination;
  let attempts = 0;
  const listeners = {};
  const frames = [];
  const timers = [];
  vm.runInNewContext(source, {
    URL, URLSearchParams,
    location: {
      hostname: parsed.hostname, pathname: parsed.pathname, search: parsed.search,
      href: parsed.href, origin: parsed.origin,
      replace: value => {
        attempts++;
        if (blocked) throw new Error('External navigation blocked');
        destination = value;
      },
    },
    navigator: { userAgent: ua, languages, userAgentData: { platform } },
    document: {
      readyState: 'loading',
      referrer,
      addEventListener: (name, callback) => { listeners[name] = callback; },
      querySelectorAll: () => links,
    },
    requestAnimationFrame: callback => { frames.push(callback); },
    setTimeout: (callback, delay) => { timers.push({ callback, delay }); },
  });
  const result = {
    get destination() { return destination; },
    get attempts() { return attempts; },
    frames, timers, listeners,
    ready: () => listeners.DOMContentLoaded?.(),
    paint: () => frames.shift()?.(),
    tick: () => timers.shift()?.callback(),
    interact: () => listeners.pointerdown?.(),
    finish() { this.ready(); this.paint(); this.paint(); this.tick(); return this; },
  };
  return result;
}

const normal = visit({ ua: safari });
assert.equal(normal.destination, undefined, 'Navigation must not start while HTML is parsing');
normal.ready();
assert.equal(normal.destination, undefined, 'Information and links must load first');
normal.paint();
assert.equal(normal.timers.length, 0, 'Allow the first paint before scheduling navigation');
normal.paint();
assert.equal(normal.destination, undefined);
assert.equal(normal.timers[0].delay, 350);
normal.tick();
assert.equal(normal.destination, apple);
for (const ua of [safari + ' Threads', safari + ' Instagram', 'iPhone Telegram']) {
  assert.equal(visit({ ua }).finish().destination, apple, 'All iPhone contexts attempt the ordinary store link after paint');
}
const chosen = visit({ ua: safari });
assert.equal(visit({ ua: safari, referrer: 'https://l.threads.net/' }).finish().destination, apple);
chosen.ready(); chosen.interact(); chosen.paint(); chosen.paint(); chosen.tick();
assert.equal(chosen.attempts, 0, 'Manual interaction must cancel automatic navigation');
const denied = visit({ ua: safari, blocked: true }).finish();
assert.equal(denied.attempts, 1);
assert.equal(denied.destination, undefined, 'Blocked navigation must not crash the loaded page');
assert.equal(visit({ ua: 'Mozilla/5.0 (Linux; Android 16) Chrome/143.0 Mobile', languages: ['ru-RU'] }).finish().destination,
  'https://tfpmodels.app/android.html?lang=ru#ru');
assert.equal(visit({ ua: 'Android Threads', languages: ['ru'] }).finish().destination,
  'https://tfpmodels.app/android.html?lang=ru#ru');
assert.equal(visit({ platform: 'Android', languages: ['pt-PT'] }).finish().destination,
  'https://tfpmodels.app/android.html?lang=pt-BR#pt-BR');
const destination = new URL(visit({ ua: 'Android', languages: ['de'], url: 'https://tfpmodels.app/?lang=ru&utm_source=instagram&utm_campaign=fall%20launch&redirect=https://evil.example' }).finish().destination);
assert.equal(destination.pathname, '/android.html');
assert.equal(destination.searchParams.get('lang'), 'ru');
assert.equal(destination.searchParams.get('utm_source'), 'instagram');
assert.equal(destination.searchParams.get('utm_campaign'), 'fall launch');
assert.equal(destination.searchParams.has('redirect'), false);
assert.equal(visit({ ua: 'Android', languages: ['zh-CN'] }).finish().destination, 'https://tfpmodels.app/android.html?lang=en#en');
for (const ua of ['', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)', 'Mozilla/5.0 (iPad; CPU OS 18_0)', 'facebookexternalhit/1.1 iPhone', 'Twitterbot Android']) {
  assert.equal(visit({ ua }).finish().attempts, 0);
}
for (const url of ['https://www.tfpmodels.org/', 'https://tfpmodels.app/?stay=1', 'https://tfpmodels.app/about.html', 'https://tfpmodels.app/android.html']) {
  assert.equal(visit({ ua: safari, url }).finish().attempts, 0);
}
assert.equal(visit({ ua: safari, url: 'https://www.tfpmodels.app/index.html' }).finish().destination, apple);
const links = [
  { href: 'https://tfpmodels.app/android.html?lang=en#en', matches: () => false },
  { href: 'https://tfpmodels.app/', matches: () => true },
  { href: apple, matches: () => false },
];
visit({ url: 'https://tfpmodels.app/?stay=1&utm_source=threads', links }).finish();
assert.equal(new URL(links[0].href).searchParams.get('utm_source'), 'threads');
assert.equal(new URL(links[1].href).searchParams.has('stay'), false, 'Language navigation must not disable routing');
assert.equal(links[2].href, apple);
console.log('Marketing routing passed: paint before navigation, iPhone social-browser attempt, manual cancellation, blocked navigation, devices, languages, UTM, bot previews, .org isolation.');

for (const code of ['en', 'de', 'es', 'fr', 'it', 'ja', 'ko', 'pl', 'pt-BR', 'ru']) {
  // English is the root; the other nine locales have their own published paths.
  const prefix = code === 'en' ? '' : code.toLowerCase() + '/';
  for (const suffix of ['', 'index.html']) {
    const url = 'https://tfpmodels.app/' + prefix + suffix;
    assert.equal(visit({ ua: safari, url }).finish().destination, apple);
    assert.equal(visit({ ua: 'Android Telegram', url, languages: ['en-US'] }).finish().destination,
      'https://tfpmodels.app/android.html?lang=' + code + '#' + code);
    assert.equal(visit({ ua: 'facebookexternalhit iPhone', url }).finish().attempts, 0);
  }
}
assert.equal(visit({ ua: 'Android', url: 'https://tfpmodels.app/ru/?lang=de&utm_source=telegram' }).finish().destination,
  'https://tfpmodels.app/android.html?lang=de&utm_source=telegram#de');
for (const url of ['https://tfpmodels.app/ru/?stay=1', 'https://tfpmodels.app/ru/android.html', 'https://tfpmodels.app/unknown/']) {
  assert.equal(visit({ ua: safari, url }).finish().attempts, 0);
}
console.log('All 10 localized homepages passed: iPhone/Android, localized guide, explicit language override, UTM and bot exclusions.');
