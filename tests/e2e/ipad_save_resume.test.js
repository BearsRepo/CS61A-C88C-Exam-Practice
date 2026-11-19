// iPad Phase 2B: Save & Leave / Resume reopens the same exam attempt with its answers, annotations and handwriting,
// on the question last shown, with the clock paused while away; auto-submit still happens at zero (also when
// time ran out just as the student left); a stroke under the Pencil at Save & Leave is dropped harmlessly.
// Run: node tests/e2e/ipad_save_resume.test.js  (needs nothing running; see tests/README.md)
const puppeteer = require('puppeteer-core');
const { APP_URL, CHROME, skipTour } = require('./config');
const KEY = 'cs61a-practice:v1';
let fails = 0;
const ok = (c, m) => { console.log(`${c ? 'PASS' : 'FAIL'}  ${m}`); if (!c) fails++; };
const wait = (ms) => new Promise((r) => setTimeout(r, ms));
const IPAD_UA = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.0 Safari/605.1.15';
const EXAM = { version: 5, prefs: { mode: 'exam' }, examPrefs: { kind: 'custom', topics: [], picked: ['sp25-4b', 'fa24-2'], timerOn: true, minutes: 120 } };

(async () => {
  const browser = await puppeteer.launch({ executablePath: CHROME, headless: 'new' });
  const open = async (ipad) => {
    const page = await browser.newPage();
    await skipTour(page);
    if (ipad) {
      await page.setUserAgent(IPAD_UA);
      await page.evaluateOnNewDocument(() => {
        Object.defineProperty(Navigator.prototype, 'platform', { get: () => 'MacIntel' });
        Object.defineProperty(Navigator.prototype, 'maxTouchPoints', { get: () => 5 });
      });
    }
    await page.setViewport({ width: 1180, height: 820 });
    page.errors = [];
    page.on('pageerror', (e) => page.errors.push(String(e)));
    page.on('console', (m) => { if (m.type() === 'error') page.errors.push(m.text()); });
    page.on('dialog', (d) => d.accept());
    return page;
  };
  const tools = (page) => {
    const click = async (sel) => { await page.waitForSelector(sel, { visible: true, timeout: 8000 }); await page.click(sel); await wait(80); };
    const st = async () => { await wait(350); return page.evaluate((k) => JSON.parse(localStorage.getItem(k)), KEY); };
    const ready = async () => { await page.waitForSelector('#pane-right .part'); await wait(200); };
    const startExam = async () => {
      await page.goto(APP_URL);
      await page.evaluate((k, v) => { localStorage.setItem(k, v); Storage.prototype.setItem = function () {}; }, KEY, JSON.stringify(EXAM));
      await page.goto(APP_URL); await wait(150);
      await click('[data-action="enter"]'); await click('[data-action="start-exam"]');
      await ready();
    };
    const stroke = (pts, opts = {}) => page.evaluate((pts, leave) => {
      const ev = (name, [x, y], t) => t.dispatchEvent(new PointerEvent(name, { pointerType: 'pen', pointerId: 7, isPrimary: true, clientX: x, clientY: y, button: name === 'pointermove' ? -1 : 0, buttons: name === 'pointerup' ? 0 : 1, bubbles: true, cancelable: true }));
      ev('pointerdown', pts[0], document.elementFromPoint(...pts[0]));
      pts.slice(1).forEach((p) => ev('pointermove', p, document.elementFromPoint(...p) || document));
      if (leave) document.querySelector('[data-action="save-leave"]').click(); // Save & Leave mid-stroke
      ev('pointerup', pts[pts.length - 1], document.elementFromPoint(...pts[pts.length - 1]) || document);
    }, pts, !!opts.leave);
    const line = ([x, y], dx, dy, n = 8) => Array.from({ length: n + 1 }, (_, i) => [x + dx * i / n, y + dy * i / n]);
    const shown = () => page.$$eval('#ink-right path:not(.live)', (p) => p.length);
    const group = () => page.$eval('#pane-right', (p) => p.dataset.group);
    const go = async (dir, pid) => { await click(`[data-action="${dir}"]`); await page.waitForFunction((g) => document.querySelector('#pane-right').dataset.group === g, {}, pid); await wait(150); };
    const leave = async () => { await click('[data-action="save-leave"]'); await page.waitForSelector('[data-action="resume-exam"]'); };
    const resume = async () => { await click('[data-action="resume-exam"]'); await ready(); };
    const reload = async () => { await page.goto(APP_URL); await wait(300); };
    // Edit the saved record behind the app's back (this page can't save over it afterwards), then reload.
    const tamper = async (fn) => { await page.evaluate((k, f) => { const s = JSON.parse(localStorage.getItem(k)); new Function('s', f)(s); localStorage.setItem(k, JSON.stringify(s)); Storage.prototype.setItem = function () {}; }, KEY, fn); await reload(); };
    const rightBlank = () => page.$eval('#pane-right', (p) => { const r = p.getBoundingClientRect(); return [r.left + 52, r.top + 140]; });
    return { click, st, startExam, stroke, line, shown, group, go, leave, resume, reload, tamper, rightBlank };
  };

  // ── iPad: work on two questions ──
  const pad = await open(true);
  const P = tools(pad);
  await P.startExam();
  await P.click('label[for="c-sp25-4e-1"]');
  await pad.click('#ta-sp25-4d'); await pad.keyboard.type('typed answer'); await wait(400);
  await P.click('[data-ann="pen"]');
  await P.stroke(P.line(await P.rightBlank(), 100, 40));
  const art = await pad.$eval('#problem-article .annot-text', (e) => { const r = e.getBoundingClientRect(); return [r.left + 40, r.top + 10]; });
  await P.stroke(P.line(art, 90, 25));
  await P.go('next', 'fa24-2');
  await pad.waitForSelector('#dg-canvas');
  const dg = await pad.$eval('#dg-canvas', (c) => { const r = c.getBoundingClientRect(); return [r.left + 60, r.top + 60]; });
  await P.stroke(P.line(dg, 90, 30));
  const before = await P.st();
  const id = before.exam.id;
  ok(before.exam.answers['sp25-4e'] === 1 && before.exam.answers['sp25-4d'] === 'typed answer' && before.exam.handwriting['sp25-4b'].length === 1 && before.exam.handwriting['fa24-2'].length === 1, 'set-up: answers, question-pane and answer-pane handwriting saved');

  // ── Save & Leave ──
  await P.leave();
  const left = await P.st();
  const t = left.exam.timer;
  ok(left.exam.id === id && !left.exam.submitted && left.attempts.length === 0, 'Save & Leave keeps the same attempt, not submitted or graded');
  ok(!t.runningSince && t.remainingMs > 0 && t.remainingMs <= 120 * 60000 && left.exam.leftAt, 'Save & Leave pauses the timer');
  ok(JSON.stringify(left.exam.handwriting) === JSON.stringify(before.exam.handwriting) && JSON.stringify(left.exam.annotations) === JSON.stringify(before.exam.annotations), 'answers, annotations and handwriting are saved unchanged');
  ok(left.exam.index === 1, 'the last active question is saved');

  // Away for a while, across a reload.
  await wait(2500);
  await P.reload();
  ok(!(await pad.$('#pane-right .part')) && !!(await pad.$('[data-action="resume-exam"]')), 'after a reload, a left exam waits for Resume (doesn’t reopen by itself)');
  ok((await P.st()).exam.timer.remainingMs === t.remainingMs, 'the clock didn’t move while away');
  await P.resume();
  const back = await P.st();
  ok(back.exam.id === id && back.attempts.length === 0 && !back.exam.leftAt, 'Resume reopens the same attempt (no new or duplicate attempt)');
  ok((await P.group()) === 'fa24-2', 'Resume opens the last active question');
  const left1 = t.remainingMs - (Date.now() - back.exam.timer.runningSince);
  ok(back.exam.timer.runningSince && t.remainingMs - left1 < 1500, `the remaining time is what it was at Save & Leave (time away not counted, ${Math.round((t.remainingMs - left1) / 1000)} s used since)`);
  ok((await P.shown()) === 1, 'the diagram handwriting is back');
  await P.go('prev', 'sp25-4b');
  ok((await P.shown()) === 1 && await pad.$$eval('#problem-article .annot-layer path', (p) => p.length) === 1, 'the first question’s answer-pane and question-pane handwriting are back');
  ok(await pad.$eval('#c-sp25-4e-1', (r) => r.checked) && await pad.$eval('#ta-sp25-4d', (t) => t.value) === 'typed answer', 'answers are back');
  const c0 = await pad.$eval('.timer .clock', (c) => c.textContent);
  await wait(1300);
  ok((await pad.$eval('.timer .clock', (c) => c.textContent)) !== c0, 'the timer runs again after Resume');
  const now = await P.st();
  ok(JSON.stringify(now.exam.handwriting) === JSON.stringify(before.exam.handwriting) && JSON.stringify(now.exam.annotations) === JSON.stringify(before.exam.annotations) && now.exam.answers['sp25-4d'] === 'typed answer', 'Resume overwrote nothing');

  // Leave and resume again without a reload, then keep writing.
  await P.leave(); await P.resume();
  ok((await P.st()).exam.id === id && (await P.st()).attempts.length === 0 && (await P.group()) === 'sp25-4b' && (await P.shown()) === 1, 'a second Save & Leave / Resume: same attempt, same question, nothing duplicated');
  await P.click('[data-ann="pen"]');
  await P.stroke(P.line(await P.rightBlank(), 60, 90));
  ok(((await P.st()).exam.handwriting['sp25-4b'] || []).length === 2, 'writing after Resume adds to the saved handwriting');

  // Save & Leave with a stroke still under the Pencil: nothing stray is written anywhere.
  const pre = await P.st();
  await P.stroke(P.line(await P.rightBlank(), 80, 60), { leave: true });
  const mid = await P.st();
  ok(JSON.stringify(mid.exam.handwriting) === JSON.stringify(pre.exam.handwriting) && JSON.stringify(mid.exam.annotations) === JSON.stringify(pre.exam.annotations) && !JSON.stringify(mid.session || {}).includes('"null"'), 'Save & Leave mid-stroke: the unfinished stroke is dropped, nothing written elsewhere');
  await P.resume();

  // ── Auto-submit still happens at zero after Resume ──
  await P.leave();
  await P.tamper("s.exam.timer.remainingMs = 1500;");
  await P.resume();
  await pad.waitForFunction((k) => { const s = JSON.parse(localStorage.getItem(k)); return !s.exam && s.attempts.length; }, { timeout: 6000 }, KEY).catch(() => {});
  let done = await P.st();
  const att = done.attempts.find((a) => a.id === id);
  ok(!done.exam && done.attempts.length === 1 && att && att.autoSubmitted, 'the clock runs out after Resume: submitted automatically, once');
  ok(att && att.handwriting['sp25-4b'].length === 2 && att.answers['sp25-4d'] === 'typed answer', '…with its answers and handwriting');

  // ── Time ran out just as the student left (paused at 0:00): Resume submits instead of reopening ──
  await P.reload();
  await P.click('[data-action="enter"]').catch(() => {});
  await P.click('[data-action="start-exam"]'); await pad.waitForSelector('#pane-right .part');
  const id2 = (await P.st()).exam.id;
  await P.leave();
  await P.tamper("s.exam.timer.remainingMs = 0;");
  await P.click('[data-action="resume-exam"]'); await wait(300); // submits instead of reopening
  done = await P.st();
  ok(!done.exam && done.attempts.length === 2 && done.attempts.filter((a) => a.id === id2).length === 1 && done.attempts.find((a) => a.id === id2).autoSubmitted, 'an exam left at 0:00 is submitted on Resume, once');
  ok(pad.errors.length === 0, `iPad: no console errors (${pad.errors.join(' | ')})`);
  await pad.close();

  // ── Desktop: Save & Leave / Resume as before ──
  const desk = await open(false);
  const D = tools(desk);
  await D.startExam();
  await D.click('label[for="c-sp25-4e-1"]');
  await D.go('next', 'fa24-2');
  const did = (await D.st()).exam.id;
  await D.leave();
  const dl = await D.st();
  ok(!dl.exam.timer.runningSince && dl.exam.leftAt && !('handwriting' in dl.exam), 'desktop: Save & Leave pauses the timer (no handwriting field)');
  await wait(1200);
  await D.resume();
  const dr = await D.st();
  ok(dr.exam.id === did && dr.attempts.length === 0 && (await D.group()) === 'fa24-2' && dr.exam.answers['sp25-4e'] === 1 && dr.exam.timer.runningSince, 'desktop: Resume reopens the same attempt on the same question, with its answers');
  ok(desk.errors.length === 0, `desktop: no console errors (${desk.errors.join(' | ')})`);

  await browser.close();
  console.log(fails ? `\n${fails} failed` : '\nAll Save & Leave / Resume checks passed');
  process.exit(fails ? 1 : 0);
})().catch((e) => { console.error(e); process.exit(1); });
