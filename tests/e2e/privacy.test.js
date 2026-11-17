// Privacy disclosures: the short notice and Privacy Policy link on the welcome page (without starting practice),
// the Privacy Policy page itself (what it covers, links back), and the link in the Home page's privacy note.
const puppeteer = require('puppeteer-core');
const { APP_URL, CHROME, skipTour } = require('./config');
let fails = 0;
const ok = (c, m) => { console.log(`${c ? 'PASS' : 'FAIL'}  ${m}`); if (!c) fails++; };
const wait = (ms) => new Promise((r) => setTimeout(r, ms));

(async () => {
  const browser = await puppeteer.launch({ executablePath: CHROME, headless: 'new' });
  const page = await browser.newPage();
  await skipTour(page);
  await page.setViewport({ width: 1300, height: 850 });
  const errors = [];
  page.on('pageerror', (e) => errors.push(String(e)));
  page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()); });
  await page.goto(APP_URL); await page.waitForSelector('.landing');

  // welcome page: one short line, a link, nothing redesigned
  const note = await page.$eval('.landing-privacy', (e) => ({ text: e.textContent.trim(), href: e.querySelector('a') && e.querySelector('a').getAttribute('href'), inFoot: !!e.closest('.landing-foot'), visible: e.getBoundingClientRect().height > 0 }));
  ok(note.inFoot && note.visible && /anonymous usage data/i.test(note.text) && note.href === 'privacy.html', `welcome page: short notice beside Start Practicing with a Privacy Policy link ("${note.text}")`);
  ok(await page.$('.landing-hit[data-action="enter"]') && await page.$('.landing-hint') && await page.$('.landing-byline'), 'the welcome image, "Click anywhere to start" and the byline are unchanged');
  const box = await page.$eval('.landing-privacy a', (a) => { const r = a.getBoundingClientRect(); return { x: r.x + r.width / 2, y: r.y + r.height / 2 }; });
  await Promise.all([page.waitForNavigation(), page.mouse.click(box.x, box.y)]);
  ok(/privacy\.html$/.test(page.url()), 'clicking the link opens the Privacy Policy (and doesn\'t start practicing)');

  // the policy page
  const txt = await page.evaluate(() => document.body.innerText);
  ok(await page.$eval('h1', (h) => h.textContent) === 'Privacy Policy' && /Last updated/.test(txt), 'Privacy Policy page: title and date');
  const must = [/anonymous ID/i, /pseudonymous/i, /Supabase/, /Cloudflare Web Analytics/, /without cookies/i, /self-grade/i, /Check/, /opened the solution/i, /active time/i, /Active days/i, /Run Code/, /Python Tutor/,
    /answers.*code.*notes/i, /Exam History/, /not .*opt-out|doesn't currently have a setting/i, /delete your anonymous account|deletion/i, /nothing is deleted automatically/i, /IP address/i, /Other students/i, /GitHub Pages/, /jsDelivr/];
  const missing = must.filter((re) => !re.test(txt)).map(String);
  ok(missing.length === 0, `covers anonymous ID, every kind of usage record, what stays local, Supabase, Cloudflare, other services, access, retention and the lack of opt-out/deletion${missing.length ? ' — missing: ' + missing.join(', ') : ''}`);
  ok(await page.$$eval('.policy-back a', (as) => as.length === 2 && as.every((a) => a.getAttribute('href') === 'index.html')), 'links back to the site at the top and bottom');
  ok(await page.$$eval('a[target="_blank"]', (as) => as.every((a) => a.rel.includes('noopener'))), 'outside links open in a new tab with noopener');
  ok(await page.evaluate(() => getComputedStyle(document.body).backgroundColor) === 'rgb(245, 246, 248)' && await page.$eval('h1', (h) => getComputedStyle(h).color) === 'rgb(0, 50, 98)', 'uses the site\'s styles');
  await page.setViewport({ width: 390, height: 800 }); await wait(100);
  ok(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth), 'readable at phone width (no sideways scrolling)');
  await page.setViewport({ width: 1300, height: 850 });
  await Promise.all([page.waitForNavigation(), page.click('.policy-back a')]);
  await page.waitForSelector('.landing');
  ok(true, 'back link returns to the site');

  // Home page note
  await page.$eval('[data-action="enter"]', (b) => b.click()); await page.waitForSelector('.disclaimer');
  const home = await page.$$eval('.disclaimer', (ps) => ps.map((p) => ({ t: p.textContent, links: [...p.querySelectorAll('a')].map((a) => a.getAttribute('href')) })).find((p) => /^Privacy:/.test(p.t)));
  ok(home && home.links.includes('privacy.html') && /self-grades/.test(home.t) && /Check counts/.test(home.t) && /Run Code/.test(home.t) && /active days/.test(home.t) && /stay in your browser/.test(home.t),
    'Home privacy note: lists what is recorded, says what stays local, links to the Privacy Policy');

  ok(errors.length === 0, `no console errors${errors.length ? ': ' + errors.join(' | ') : ''}`);
  await browser.close();
  console.log(fails ? `\n${fails} FAILED` : '\nALL PASSED');
  process.exit(fails ? 1 : 0);
})().catch((e) => { console.error(e); process.exit(2); });
