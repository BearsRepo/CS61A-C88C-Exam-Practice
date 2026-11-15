// Practice history: every practice set is kept (finished or not) and listed under the practice setup with a green
// Finished / red Unfinished tag; a finished set opens its summary, an unfinished one continues; sets can be deleted.
// Reviewing a finished set has "← Summary" / "Back to summary"; the home page warns when storage is nearly full.
const puppeteer = require('puppeteer-core');
const { APP_URL, CHROME, skipTour } = require('./config');
const KEY = 'cs61a-practice:v1';
let fails = 0;
const ok = (c, m) => { console.log(`${c ? 'PASS' : 'FAIL'}  ${m}`); if (!c) fails++; };
const wait = (ms) => new Promise((r) => setTimeout(r, ms));

(async () => {
  const browser = await puppeteer.launch({ executablePath: CHROME, headless: 'new' });
  const page = await browser.newPage();
  await skipTour(page);
  await page.setViewport({ width: 1400, height: 900 });
  const errors = [];
  page.on('pageerror', (e) => errors.push(String(e)));
  page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()); });
  const dialogs = [];
  let answer = true;
  page.on('dialog', (d) => { dialogs.push(d.message()); answer ? d.accept() : d.dismiss(); });

  const click = async (sel) => { await page.waitForSelector(sel, { visible: true, timeout: 8000 }); await page.click(sel); await wait(100); };
  const text = (sel) => page.$eval(sel, (e) => e.textContent.replace(/\s+/g, ' ').trim());
  const has = async (sel) => !!(await page.$(sel));
  const st = async () => { await wait(300); return page.evaluate((k) => JSON.parse(localStorage.getItem(k)), KEY); };
  const seed = async (obj) => {
    await page.goto(APP_URL);
    await page.evaluate((k, v) => { if (v) localStorage.setItem(k, v); else localStorage.removeItem(k); Storage.prototype.setItem = function () {}; }, KEY, obj ? JSON.stringify(obj) : null);
    await wait(obj && JSON.stringify(obj).length > 1e6 ? 1500 : 50); // Chrome commits a large write asynchronously
    await page.goto(APP_URL);
    await click('[data-action="enter"]');
  };
  const rows = () => page.$$eval('.practice-history .hist-item', (items) => items.map((i) => ({
    id: i.querySelector('[data-action="open-set"]').dataset.id,
    title: i.querySelector('.t').firstChild.textContent.trim(),
    detail: i.querySelector('.t small').textContent,
    tag: i.querySelector('.badge').textContent,
    cls: i.querySelector('.badge').className,
    bg: getComputedStyle(i.querySelector('.badge')).backgroundColor,
  })));
  const setSize = async (n) => { await page.$eval('#set-size', (i, n) => { i.value = String(n); i.dispatchEvent(new Event('change', { bubbles: true })); }, n); await wait(100); };

  // ── set A: start, answer one part, leave unfinished ──
  await seed(null);
  ok(!(await has('.practice-history')), 'no history before any set');
  await setSize(2);
  await click('[data-action="start"]'); await page.waitForSelector('#pane-right .part');
  await page.evaluate(() => { const r = document.querySelector('#pane-right .part input[type=radio], #pane-right .part input[type=checkbox]'); if (r) r.click(); else { const t = document.querySelector('#pane-right textarea[data-qid]'); t.value = 'x'; t.dispatchEvent(new Event('input', { bubbles: true })); } });
  await wait(150);
  await click('[data-action="next"]');
  let S = await st();
  const A = S.session;
  ok(typeof A.id === 'string' && A.index === 1, 'a new set gets an id');
  await click('[data-action="home"]');
  let R = await rows();
  ok(R.length === 1 && R[0].id === A.id && R[0].tag === 'Unfinished' && /set-open/.test(R[0].cls) && /Question 2 of 2/.test(R[0].detail), `the unfinished set is listed with an Unfinished tag (${R[0] && R[0].detail})`);
  ok(R[0].bg === 'rgb(251, 233, 231)', `the Unfinished tag is red (${R[0].bg})`);

  // ── set B: starting a new set keeps A, no warning dialog ──
  dialogs.length = 0;
  await setSize(1);
  await click('[data-action="start"]'); await page.waitForSelector('#pane-right .part');
  ok(dialogs.length === 0, 'starting a new set no longer asks to replace the unfinished one');
  S = await st();
  const B = S.session;
  ok(B.id !== A.id && S.practice.length === 1 && S.practice[0].id === A.id, 'the unfinished set moved to the practice history');
  await page.evaluate(() => { const r = document.querySelector('#pane-right .part input[type=radio], #pane-right .part input[type=checkbox]'); if (r) r.click(); });
  answer = true;
  await click('[data-action="finish"]'); await page.waitForSelector('.results');

  // ── reviewing a finished set: back to its summary ──
  await click('.results .result-row[data-action="review"]'); await page.waitForSelector('#pane-right .part');
  ok(/Reviewing a finished set/.test(await text('#p-banner')) && await has('#p-banner [data-action="show-results"]'), 'reviewing a finished set shows a banner with Back to summary');
  ok((await text('.p-footer .left .btn')) === '← Summary' && !(await has('.p-footer [data-action="home"]')), 'the bottom-left button is "← Summary" instead of Exit');
  ok((await text('.p-footer .right [data-action="show-results"]')) === 'Summary', 'on the last question, Finish reads "Summary"');
  await click('.p-footer [data-action="show-results"]'); await page.waitForSelector('.results');
  ok(/Practice summary/.test(await text('.results h1')), '← Summary goes back to the Practice summary');
  await click('.results .result-row[data-action="review"]'); await page.waitForSelector('#p-banner [data-action="show-results"]');
  await click('#p-banner [data-action="show-results"]'); await page.waitForSelector('.results');
  ok(true, 'Back to summary in the banner also returns to the summary');

  // ── home: both sets, newest first, green Finished / red Unfinished ──
  await click('.results [data-action="go-home"]');
  R = await rows();
  ok(R.length === 2 && R[0].id === B.id && R[0].tag === 'Finished' && /set-done/.test(R[0].cls) && R[1].id === A.id && R[1].tag === 'Unfinished', `history lists B (Finished) above A (Unfinished): ${R.map((r) => r.tag).join(', ')}`);
  ok(R[0].bg === 'rgb(230, 244, 234)' && /1 question · \d+ correct · \d+ incorrect · \d+ unanswered/.test(R[0].detail), `the Finished tag is green, with the set's results (${R[0].detail})`);

  // ── open A: it continues where it was left, B goes to the history ──
  await click(`.practice-history [data-action="open-set"][data-id="${A.id}"]`); await page.waitForSelector('#pane-right .part');
  S = await st();
  ok(S.session.id === A.id && S.session.index === 1 && Object.keys(S.session.answers).length >= 1 && S.practice.some((x) => x.id === B.id), 'opening an unfinished set continues it (same question, answers kept)');
  await click('[data-action="home"]');
  // ── open B: its summary ──
  await click(`.practice-history [data-action="open-set"][data-id="${B.id}"]`); await page.waitForSelector('.results');
  ok((await st()).session.id === B.id && (await st()).practice.some((x) => x.id === A.id), 'opening a finished set shows its summary; A stays in the history');
  await click('.results [data-action="go-home"]');

  // ── delete (cancel, then confirm) ──
  answer = false;
  await click(`.practice-history [data-action="delete-set"][data-id="${A.id}"]`);
  ok((await rows()).length === 2 && /Delete .* from your practice history/.test(dialogs[dialogs.length - 1]), 'Delete asks first; Cancel keeps the set');
  answer = true;
  await click(`.practice-history [data-action="delete-set"][data-id="${A.id}"]`);
  R = await rows();
  S = await st();
  ok(R.length === 1 && R[0].id === B.id && !S.practice.some((x) => x.id === A.id), 'confirming deletes it');

  // ── Start Over moves the unfinished set to the history ──
  await setSize(1);
  await click('[data-action="start"]'); await page.waitForSelector('#pane-right .part');
  const C = (await st()).session;
  await click('[data-action="home"]');
  dialogs.length = 0;
  await click('.resume [data-action="discard"]');
  S = await st();
  ok(dialogs.length === 0 && S.session === null && S.practice.some((x) => x.id === C.id) && (await rows()).some((r) => r.id === C.id && r.tag === 'Unfinished'), 'Start Over keeps the unfinished set in the history (no dialog)');

  // ── a running timer is paused when its set is set aside, and restarts when it is continued ──
  // the countdown timer is on by default (25 minutes)
  await setSize(1);
  await click('[data-action="start"]'); await page.waitForSelector('#pane-right .part');
  const D = (await st()).session;
  ok(D.timer && D.timer.runningSince, 'the new set has a running timer');
  await click('[data-action="home"]');
  await setSize(1);
  await click('[data-action="start"]'); await page.waitForSelector('#pane-right .part');
  S = await st();
  const Dk = S.practice.find((x) => x.id === D.id);
  ok(Dk && Dk.timer.runningSince === null && Dk.timer.remainingMs > 0, 'a set in the history has its timer paused');
  await click('[data-action="home"]');
  await click(`.practice-history [data-action="open-set"][data-id="${D.id}"]`); await page.waitForSelector('#pane-right .part');
  ok(!!(await st()).session.timer.runningSince, 'continuing it restarts the timer');

  // ── older saves: the last finished set (no id) appears in the history ──
  await seed({ version: 5, prefs: { mode: 'practice' }, session: { ids: ['fa25-1a'], index: 0, title: 'Old finished set', answers: { 'fa25-1a': 3 }, timer: null, startedAt: Date.now() - 86400000, finishedAt: Date.now() - 86000000, finished: true } });
  R = await rows();
  ok(R.length === 1 && R[0].title === 'Old finished set' && R[0].tag === 'Finished', 'a finished set saved before the history is listed');

  // ── storage warning ──
  // one practice set in the history with ~4.6 million characters of code notes
  await seed({ version: 5, prefs: { mode: 'practice' }, practice: [{ id: 'big', ids: ['fa25-1a'], index: 0, title: 'Big notes', answers: {}, notes: { 'fa25-1': 'x'.repeat(4600000) }, timer: null, startedAt: Date.now(), finished: false }] });
  ok(/Storage almost full \(9\d%\)/.test(await text('.storage-warn')), `the home page warns at 90% of storage: "${(await text('.storage-warn')).slice(0, 40)}"`);
  await seed({ version: 5, prefs: { mode: 'practice' } });
  ok(!(await has('.storage-warn')), 'no warning when there is room');

  ok(errors.length === 0, `no page errors${errors.length ? `: ${errors.slice(0, 3).join(' | ')}` : ''}`);
  await browser.close();
  console.log(fails ? `\n${fails} FAILED` : '\nAll practice-history checks passed');
  process.exit(fails ? 1 : 0);
})().catch((e) => { console.error(e); process.exit(1); });
