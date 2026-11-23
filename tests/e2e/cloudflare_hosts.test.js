// Cloudflare Web Analytics hostname check (app/menu.html, app/privacy.html), without a browser: each page's inline
// beacon script runs in a sandbox with a fake location and document, so nothing is ever sent to Cloudflare.
//   - the old published site keeps its existing token
//   - bearsrepo.github.io loads nothing until its own token is filled in (never borrows the old site's token)
//   - local servers, file copies and look-alike hostnames load nothing
//   - both pages use the same hostname → token map
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const APP_DIR = path.join(__dirname, '..', '..', 'app');
const OLD_HOST = 'jacobkao-cal.github.io';
const NEW_HOST = 'bearsrepo.github.io';
const OLD_TOKEN = '629fadce777742a0838d877beeb3f5d5';
let fails = 0;
const ok = (c, m) => { console.log(`${c ? 'PASS' : 'FAIL'}  ${m}`); if (!c) fails++; };

// The inline script that adds the beacon: the one <script> without src that mentions cloudflareinsights.
function beaconScript(file) {
  const html = fs.readFileSync(path.join(APP_DIR, file), 'utf8');
  const found = [...html.matchAll(/<script>([\s\S]*?)<\/script>/g)].map((m) => m[1]).filter((s) => s.includes('cloudflareinsights'));
  return found.length === 1 ? found[0] : null;
}
// Runs it as if served from `hostname`: returns the scripts it appended ({ src, type, beacon }).
function run(code, hostname, protocol = 'https:') {
  const added = [];
  const document = {
    createElement: () => { const el = { attrs: {}, setAttribute(k, v) { this.attrs[k] = v; } }; return el; },
    body: { appendChild: (el) => added.push({ src: el.src, type: el.type, beacon: el.attrs['data-cf-beacon'] }) },
  };
  vm.runInNewContext(code, { location: { hostname, protocol }, document, JSON, Object });
  return added;
}
const tokenOf = (added) => { try { return JSON.parse(added[0].beacon).token; } catch (e) { return null; } };

for (const file of ['menu.html', 'privacy.html']) {
  const code = beaconScript(file);
  ok(!!code, `${file}: one inline Cloudflare beacon script`);
  if (!code) continue;

  const old = run(code, OLD_HOST);
  ok(old.length === 1 && old[0].src === 'https://static.cloudflareinsights.com/beacon.min.js' && old[0].type === 'module' && tokenOf(old) === OLD_TOKEN,
    `${file}: ${OLD_HOST} loads the beacon with the existing token`);

  const m = code.match(/['"]bearsrepo\.github\.io['"]\s*:\s*['"]([^'"]*)['"]/);
  ok(!!m, `${file}: ${NEW_HOST} is listed in the token map`);
  const newToken = m ? m[1] : '';
  const nu = run(code, NEW_HOST);
  if (newToken) ok(nu.length === 1 && tokenOf(nu) === newToken && newToken !== OLD_TOKEN, `${file}: ${NEW_HOST} loads the beacon with its own token`);
  else ok(nu.length === 0, `${file}: ${NEW_HOST} loads nothing while it has no token (old token not reused)`);

  for (const [host, proto] of [['localhost', 'http:'], ['127.0.0.1', 'http:'], ['', 'file:'], ['jacobkao-cal.github.io.evil.example', 'https:'],
    ['evil-jacobkao-cal.github.io', 'https:'], ['BearsRepo.github.io.example', 'https:'], ['constructor', 'https:'], ['__proto__', 'https:']]) {
    ok(run(code, host, proto).length === 0, `${file}: nothing loaded on ${host || 'a file:// copy'}`);
  }
}
const map = (file) => { const c = beaconScript(file); const m = c && c.match(/const CF_TOKENS = (\{[\s\S]*?\});/); return m ? m[1].replace(/\/\/.*$/gm, '').replace(/\s+/g, '') : null; };
ok(map('menu.html') && map('menu.html') === map('privacy.html'), 'menu.html and privacy.html use the same hostname → token map');

console.log(fails ? `\n${fails} FAILED` : '\nALL PASSED');
process.exit(fails ? 1 : 0);
