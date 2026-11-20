// iPad: an exam opens with the Pen on, ready for the Apple Pencil (red, as before). Other tools switch normally,
// the student's choice stays across questions, and desktop still opens with no tool selected.
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
    const click = async (sel) => { await page.waitForSelector(sel, { visible: true, timeout: 8000 }); await page.click(sel); await wait(120); };
    const startExam = async () => {
      await page.goto(APP_URL);
      await page.evaluate((k, v) => { localStorage.setItem(k, v); Storage.prototype.setItem = function () {}; }, KEY, JSON.stringify(EXAM));
      await page.goto(APP_URL); await wait(150);
      await click('[data-action="enter"]'); await click('[data-action="start-exam"]');
      await page.waitForSelector('#pane-right .part'); await wait(150);
    };
    const tool = () => page.evaluate(() => {
      const on = [...document.querySelectorAll('#annot-bar [data-ann][aria-pressed="true"]')].map((b) => b.dataset.ann);
      return { pressed: on.join(','), mode: document.getElementById('problem-article').dataset.mode, paper: document.querySelector('.p-main').classList.contains('paper') || !!document.querySelector('.p-main.pencil-ink') };
    });
    const stroke = (pts) => page.evaluate((pts) => {
      const ev = (name, [x, y], t) => t.dispatchEvent(new PointerEvent(name, { pointerType: 'pen', pointerId: 7, isPrimary: true, clientX: x, clientY: y, button: name === 'pointermove' ? -1 : 0, buttons: name === 'pointerup' ? 0 : 1, bubbles: true, cancelable: true }));
      ev('pointerdown', pts[0], document.elementFromPoint(...pts[0]));
      pts.slice(1).forEach((p) => ev('pointermove', p, document.elementFromPoint(...p) || document));
      ev('pointerup', pts[pts.length - 1], document.elementFromPoint(...pts[pts.length - 1]) || document);
    }, pts);
    const prose = () => page.evaluate(() => { const r = document.querySelector('#problem-article .annot-text').getBoundingClientRect(); return [r.left + 40, r.top + 10]; });
    return { click, startExam, tool, stroke, prose };
  };

  // ── iPad ──
  const pad = await open(true);
  const P = tools(pad);
  await P.startExam();
  let t = await P.tool();
  ok(t.pressed === 'pen' && t.mode === 'pen', `entering the iPad exam selects the Pen (${JSON.stringify(t)})`);
  ok(/Apple Pencil/.test(await pad.$eval('#annot-hint', (h) => h.textContent)), 'the Pen hint is shown');
  ok(await pad.$eval('#pen-color-btn', (b) => /Red/.test(b.getAttribute('aria-label'))), 'the default pen colour is still Red');
  const [x, y] = await P.prose();
  await P.stroke(Array.from({ length: 9 }, (_, i) => [x + 10 * i, y + 2 * i]));
  await wait(150);
  ok(await pad.$$eval('#problem-article .annot-layer path:not(.live)', (p) => p.length === 1 && !p[0].getAttribute('style')), 'the Pencil draws straight away, in the default red');

  await P.click('[data-ann="eraser"]');
  t = await P.tool();
  ok(t.pressed === 'eraser' && t.mode === 'eraser', 'switching to the Eraser works');
  await P.click('[data-action="next"]'); await wait(150);
  t = await P.tool();
  ok(t.pressed === 'eraser', 'question navigation keeps the Eraser (no reset to Pen)');
  await P.click('[data-ann="hl"]');
  ok((await P.tool()).pressed === 'hl', 'switching to the Highlighter works');
  await P.click('[data-ann="hl"]');
  t = await P.tool();
  ok(t.pressed === '' && t.mode === 'none', 'turning the tool off works');
  await P.click('[data-action="prev"]'); await wait(150);
  ok((await P.tool()).mode === 'none', 'navigating back keeps no tool (the explicit choice is not overridden)');
  await P.click('[data-ann="pen"]');
  await P.click('[data-action="next"]'); await wait(150);
  ok((await P.tool()).pressed === 'pen', 'navigation keeps the Pen when chosen');

  // Save & Leave, then Resume: the exam opens ready for the Pencil again.
  await P.click('[data-ann="eraser"]');
  await P.click('[data-action="save-leave"]').catch(() => {});
  if (await pad.$('[data-action="resume-exam"]')) {
    await P.click('[data-action="resume-exam"]'); await pad.waitForSelector('#pane-right .part'); await wait(150);
    ok((await P.tool()).pressed === 'pen', 'resuming the exam opens with the Pen');
  } else ok(false, 'Save & Leave reached the resume button');
  ok(pad.errors.length === 0, `iPad: no console errors (${pad.errors.join(' | ')})`);
  await pad.close();

  // ── Desktop: unchanged ──
  const desk = await open(false);
  const D = tools(desk);
  await D.startExam();
  t = await D.tool();
  ok(t.pressed === '' && t.mode === 'none', 'desktop exam: no tool selected on entry (unchanged)');
  await D.click('[data-ann="pen"]');
  ok((await D.tool()).pressed === 'pen', 'desktop: the Pen still turns on with a click');
  ok(desk.errors.length === 0, `desktop: no console errors (${desk.errors.join(' | ')})`);
  await desk.close();

  await browser.close();
  console.log(fails ? `\n${fails} FAILED` : '\nALL PASSED');
  process.exit(fails ? 1 : 0);
})().catch((e) => { console.error(e); process.exit(1); });
