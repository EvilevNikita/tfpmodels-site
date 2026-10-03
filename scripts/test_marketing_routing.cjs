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
      assign: value => {
        attempts++;
        if (blocked) throw new Error('External navigation blocked');
        destination = value;
      },
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
      querySelectorAll: selector => selector === 'a[data-app-store]' ? links.filter(link => link.native) : links,
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
assert.equal(normal.timers[0].delay, 250);
normal.tick();
assert.equal(normal.destination, apple);
for (const ua of [safari + ' Barcelona 400.0', safari + ' Threads 400.0', safari + ' Instagram 400.0', 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 Mobile/15E148']) {
  const embedded = visit({ ua }).finish();
  assert.equal(embedded.attempts, 0, 'Embedded iPhone browsers must retain the download page');
}
const chosen = visit({ ua: safari });
assert.equal(visit({ ua: safari, referrer: 'https://l.threads.net/' }).finish().attempts, 0, 'Social referrals with Safari-like user agents must retain the page');
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
for (const url of ['https://www.tfpmodels.org/', 'https://tfpmodels.app/?stay=1', 'https://tfpmodels.app/about.html', 'https://tfpmodels.app/android.html', 'https://tfpmodels.app/ru/']) {
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
assert.equal(new URL(links[1].href).searchParams.get('stay'), '1');
assert.equal(links[2].href, apple);
console.log('Marketing routing passed: paint before navigation, Threads/Instagram fallback, manual cancellation, blocked navigation, devices, languages, UTM, bot previews, .org isolation.');

function storeLinks() {
  return [
    { href: apple, native: true, matches: () => false, addEventListener(name, callback) { this.click = callback; } },
    { href: apple, matches: () => false },
  ];
}
const manualLinks = storeLinks();
const manual = visit({ ua: safari + ' Threads', links: manualLinks }).finish();
assert.equal(manual.attempts, 0);
let prevented = false;
manualLinks[0].click({ button: 0, preventDefault() { prevented = true; } });
assert.equal(manual.destination, 'itms-apps://itunes.apple.com/app/id6766621647');
assert.equal(prevented, true);
assert.equal(manualLinks[1].href, apple);
assert.equal(manualLinks[1].click, undefined, 'HTTPS fallback must remain ordinary navigation');
const rejectedLinks = storeLinks();
visit({ ua: safari + ' Threads', links: rejectedLinks, blocked: true }).finish();
rejectedLinks[0].click({ button: 0, preventDefault() { throw new Error('Must allow HTTPS after a thrown rejection'); } });
for (const ua of ['Android', 'Desktop', 'facebookexternalhit iPhone']) {
  const anchors = storeLinks();
  visit({ ua, links: anchors }).finish();
  assert.equal(anchors[0].click, undefined);
}
const modifiedLinks = storeLinks();
const modified = visit({ ua: safari + ' Threads', links: modifiedLinks }).finish();
modifiedLinks[0].click({ button: 0, metaKey: true });
assert.equal(modified.attempts, 0);
console.log('Manual store handoff passed: synchronous native navigation, HTTPS fallback, blocked scheme, modified clicks and device isolation.');
