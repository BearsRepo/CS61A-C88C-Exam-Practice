// Cloudflare Web Analytics (app/web_analytics.js, loaded by index.html, menu.html and privacy.html). Nothing is ever
// sent to Cloudflare: part 1 runs the loader in a sandbox, part 2 serves the pages to a real Chrome as if from each
// published hostname (answered from app/ by request interception) and blocks the beacon request after counting it.
//   - jacobkao-cal.github.io keeps its existing token; bearsrepo.github.io uses its own token
//   - local servers, file copies and look-alike hostnames load nothing
//   - every page loads the loader once, at the end of <body>, and the beacon is requested exactly once per page
//   - the beacon tag carries only the token (no answers, notes, grades or other saved data)
const puppeteer = require('puppeteer-core');
const fs = require('fs');
const path = require('path');
const vm = require('vm');
const { CHROME } = require('./config');

const APP_DIR = path.join(__dirname, '..', '..', 'app');
const LOADER = 'web_analytics.js';
const PAGES = ['index.html', 'menu.html', 'privacy.html'];
const BEACON = 'https://static.cloudflareinsights.com/beacon.min.js';
const SITES = {
  'jacobkao-cal.github.io': { token: '629fadce777742a0838d877beeb3f5d5', base: 'https://jacobkao-cal.github.io/61a-practice-helper/' },
  'bearsrepo.github.io': { token: 'bf4412a0c1354a81af3e410b43e9deb1', base: 'https://bearsrepo.github.io/CS61A-C88C-Exam-Practice/' },
};
const TYPES = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.webmanifest': 'application/manifest+json', '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg', '.woff2': 'font/woff2' };
let fails = 0;
const ok = (c, m) => { console.log(`${c ? 'PASS' : 'FAIL'}  ${m}`); if (!c) fails++; };

// ── 1. The loader on its own ──
const code = fs.readFileSync(path.join(APP_DIR, LOADER), 'utf8');
function run(hostname, protocol = 'https:', doc) {
  const d = doc || {
    added: [],
    body: { appendChild: (el) => d.added.push(el) },
    createElement: () => ({ attrs: {}, setAttribute(k, v) { this.attrs[k] = v; } }),
    querySelector: (sel) => (sel === 'script[data-cf-beacon]' ? d.added.find((el) => 'data-cf-beacon' in el.attrs) || null : null),
  };
  vm.runInNewContext(code, { location: { hostname, protocol }, document: d, JSON, Object });
  return d;
}
const tokenOf = (el) => { try { return JSON.parse(el.attrs['data-cf-beacon']).token; } catch (e) { return null; } };
for (const [host, { token }] of Object.entries(SITES)) {
  const d = run(host);
  ok(d.added.length === 1 && d.added[0].src === BEACON && d.added[0].type === 'module' && tokenOf(d.added[0]) === token,
    `${host}: the beacon with token ${token.slice(0, 6)}…`);
  ok(JSON.stringify(Object.keys(d.added[0].attrs)) === '["data-cf-beacon"]' && JSON.stringify(JSON.parse(d.added[0].attrs['data-cf-beacon'])) === JSON.stringify({ token }),
    `${host}: the beacon tag carries the token and nothing else`);
  run(host, 'https:', d);
  ok(d.added.length === 1, `${host}: loading the loader twice still adds one beacon`);
}
ok(SITES['jacobkao-cal.github.io'].token !== SITES['bearsrepo.github.io'].token, 'the two hostnames use different tokens');
for (const [host, proto] of [['localhost', 'http:'], ['127.0.0.1', 'http:'], ['', 'file:'], ['jacobkao-cal.github.io.evil.example', 'https:'],
  ['evil-bearsrepo.github.io', 'https:'], ['bearsrepo.github.io.example', 'https:'], ['github.io', 'https:'], ['constructor', 'https:'], ['__proto__', 'https:']]) {
  ok(run(host, proto).added.length === 0, `nothing loaded on ${host || 'a file:// copy'}`);
}
ok(!/localStorage|sessionStorage|CS61A_|\.value\b|innerText|textContent|fetch\(|XMLHttpRequest|sendBeacon/.test(code.replace(/\/\/.*$/gm, '')),
  `${LOADER} reads no saved data, page text or inputs and sends nothing itself`);

// ── 2. The pages ──
const appFiles = fs.readdirSync(APP_DIR).filter((f) => /\.(html|js)$/.test(f));
for (const f of appFiles) {
  if (f === LOADER) continue;
  const src = fs.readFileSync(path.join(APP_DIR, f), 'utf8');
  if (/cloudflareinsights|data-cf-beacon/.test(src)) ok(false, `${f}: no beacon code outside ${LOADER}`);
}
ok(true, `no beacon code in app/*.html or app/*.js outside ${LOADER}`);
for (const p of PAGES) {
  const html = fs.readFileSync(path.join(APP_DIR, p), 'utf8');
  const tags = html.match(/<script\b[^>]*\bsrc="web_analytics\.js"[^>]*><\/script>/g) || [];
  const after = html.slice(html.lastIndexOf('web_analytics.js'));
  ok(tags.length === 1 && !/<script/.test(after.slice(after.indexOf('</script>'))) && /<\/body>/.test(after), `${p}: loads ${LOADER} once, as the last script in <body>`);
}

(async () => {
  const browser = await puppeteer.launch({ executablePath: CHROME, headless: 'new' });
  try {
    for (const [host, { token, base }] of Object.entries(SITES)) {
      for (const p of PAGES) {
        const page = await browser.newPage();
        // The tour would cover the page; decline it like a returning visitor.
        await page.evaluateOnNewDocument(() => { try { localStorage.setItem('cs61a-practice:tour', '{"asked":true,"on":false,"seen":{}}'); } catch (e) { /* none */ } });
        await page.setRequestInterception(true);
        const beacons = [];
        page.on('request', (r) => {
          const u = r.url();
          if (u.startsWith(base)) {
            const file = path.join(APP_DIR, decodeURIComponent(new URL(u).pathname.slice(new URL(base).pathname.length)) || 'index.html');
            if (!file.startsWith(APP_DIR) || !fs.existsSync(file)) return r.respond({ status: 404, body: '' });
            return r.respond({ status: 200, contentType: TYPES[path.extname(file)] || 'application/octet-stream', body: fs.readFileSync(file) });
          }
          if (u.startsWith(BEACON)) beacons.push(u); // counted, never sent
          return r.abort();
        });
        await page.goto(base + p, { waitUntil: 'load' });
        await new Promise((r) => setTimeout(r, 300));
        const tags = await page.evaluate(() => [...document.querySelectorAll('script[data-cf-beacon]')].map((s) => ({ src: s.src, cfg: s.getAttribute('data-cf-beacon') })));
        ok(beacons.length === 1 && tags.length === 1 && tags[0].src === BEACON && JSON.parse(tags[0].cfg).token === token,
          `${host}/${p}: beacon requested once, with this host's token (${beacons.length} request(s), ${tags.length} tag(s))`);
        await page.close();
      }
    }
  } finally { await browser.close(); }
  console.log(fails ? `\n${fails} FAILED` : '\nALL PASSED');
  process.exit(fails ? 1 : 0);
})().catch((e) => { console.error(e); process.exit(2); });
