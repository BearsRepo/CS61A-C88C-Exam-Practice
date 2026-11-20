// iPad: a pen stroke drawn on the code editor follows the code when the editor scrolls sideways. It keeps sx (the
// editor's horizontal scroll when drawn), moves by the scroll since then and is clipped to the editor. Strokes
// started elsewhere, and strokes on desktop, are unchanged. Positions survive question navigation and a reload.
const puppeteer = require('puppeteer-core');
const { APP_URL, CHROME, skipTour } = require('./config');
const KEY = 'cs61a-practice:v1';
let fails = 0;
const ok = (c, m) => { console.log(`${c ? 'PASS' : 'FAIL'}  ${m}`); if (!c) fails++; };
const wait = (ms) => new Promise((r) => setTimeout(r, ms));
const IPAD_UA = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.0 Safari/605.1.15';
const EXAM = { version: 5, prefs: { mode: 'exam' }, examPrefs: { kind: 'custom', topics: [], picked: ['sp25-4b', 'fa24-2'], timerOn: true, minutes: 120 } };
const PID = 'sp25-4b';

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
    const pens = async () => ((await st()).exam.annotations[PID] || []).filter((a) => a.kind === 'pen');
    const startExam = async () => {
      await page.goto(APP_URL);
      await page.evaluate((k, v) => { localStorage.setItem(k, v); Storage.prototype.setItem = function () {}; }, KEY, JSON.stringify(EXAM));
      await page.goto(APP_URL); await wait(150);
      await click('[data-action="enter"]'); await click('[data-action="start-exam"]');
      await page.waitForSelector('#pane-right .part'); await page.waitForSelector('.CodeMirror');
      await page.evaluate(() => { const b = document.querySelector('#annot-bar [data-ann="pen"][aria-pressed="true"]'); if (b) b.click(); }); await wait(80); // an iPad exam opens with the Pen on (default); these checks start with no tool
      // a long line, so the editor scrolls sideways
      await page.evaluate(() => { const cm = document.querySelector('.CodeMirror').CodeMirror; cm.setValue(`${cm.getValue()}\n# ${'wide '.repeat(80)}`); });
      await wait(100);
    };
    const stroke = (type, pts) => page.evaluate((type, pts) => {
      const ev = (name, [x, y], t) => t.dispatchEvent(new PointerEvent(name, { pointerType: type, pointerId: 7, isPrimary: true, clientX: x, clientY: y, button: name === 'pointermove' ? -1 : 0, buttons: name === 'pointerup' ? 0 : 1, bubbles: true, cancelable: true }));
      ev('pointerdown', pts[0], document.elementFromPoint(...pts[0]));
      pts.slice(1).forEach((p) => ev('pointermove', p, document.elementFromPoint(...p) || document));
      ev('pointerup', pts[pts.length - 1], document.elementFromPoint(...pts[pts.length - 1]) || document);
    }, type, pts);
    const line = ([x, y], dx, dy, n = 8) => Array.from({ length: n + 1 }, (_, i) => [x + dx * i / n, y + dy * i / n]);
    const codePt = () => page.evaluate(() => { // a point on the first code line, right of the line numbers
      document.querySelector('.CodeMirror').scrollIntoView({ block: 'center' });
      const r = document.querySelector('.CodeMirror-line').getBoundingClientRect();
      const g = document.querySelector('.CodeMirror-gutters').getBoundingClientRect();
      return [g.right + 60, r.top + r.height / 2];
    });
    const proseX = () => page.evaluate(() => { const r = document.querySelector('#problem-article .annot-text').getBoundingClientRect(); return [r.left + 40, r.top + 10]; });
    const scrollCode = (x) => page.evaluate(async (x) => { document.querySelector('.CodeMirror').CodeMirror.scrollTo(x, null); await new Promise((r) => setTimeout(r, 120)); }, x);
    const pathX = (id) => page.evaluate((id) => { const p = document.querySelector(`#problem-article .annot-layer path[data-aid="${id}"]`); return p ? Number(p.getAttribute('d').slice(1).split(' ')[0]) : null; }, id);
    const clipped = (id) => page.evaluate((id) => { const p = document.querySelector(`#problem-article .annot-layer path[data-aid="${id}"]`); return !!(p && p.getAttribute('clip-path')); }, id);
    return { click, st, pens, startExam, stroke, line, codePt, proseX, scrollCode, pathX, clipped };
  };

  // ── iPad ──
  const pad = await open(true);
  const P = tools(pad);
  await P.startExam();
  ok(await pad.evaluate(() => { const i = document.querySelector('.CodeMirror').CodeMirror.getScrollInfo(); return i.width > i.clientWidth + 200; }), 'setup: the code editor scrolls sideways');
  await P.click('[data-ann="pen"]');

  await P.stroke('pen', P.line(await P.codePt(), 80, 0));
  let list = await P.pens();
  ok(list.length === 1 && list[0].sx === 0, 'a stroke started on the code records sx = 0 (the editor scroll when drawn)');
  const A = list[0].id;
  const ax0 = await P.pathX(A);
  ok(!(await P.clipped(A)), 'unscrolled: the stroke is drawn exactly as before (no clip)');

  await P.stroke('pen', P.line(await P.proseX(), 80, 10));
  list = await P.pens();
  const B = list.find((a) => a.id !== A);
  ok(B && !('sx' in B), 'a stroke started on the prose has no sx (unchanged format)');
  const bx0 = await P.pathX(B.id);

  await P.scrollCode(100);
  ok(Math.abs((await P.pathX(A)) - (ax0 - 100)) < 1.5, 'scrolling the code right by 100px moves the code stroke left by 100px');
  ok(await P.clipped(A), 'scrolled: the code stroke is clipped to the editor');
  ok((await P.pathX(B.id)) === bx0, 'the prose stroke does not move');

  await P.stroke('pen', P.line(await P.codePt(), 60, 4));
  list = await P.pens();
  const C = list.find((a) => a.id !== A && a.id !== B.id);
  ok(C && C.sx === 100, 'a stroke drawn while scrolled records sx = 100');
  const cx100 = await P.pathX(C.id);
  await P.scrollCode(0);
  ok(Math.abs((await P.pathX(C.id)) - (cx100 + 100)) < 1.5 && Math.abs((await P.pathX(A)) - ax0) < 1.5, 'scrolling back: both code strokes return with the code');

  // The eraser finds a code stroke where it is shown now.
  await P.scrollCode(100);
  await P.click('[data-ann="eraser"]');
  const cPt = await pad.evaluate((id) => { const p = document.querySelector(`#problem-article .annot-layer path[data-aid="${id}"]`); const r = p.getBoundingClientRect(); return [r.left + r.width / 2, r.top + r.height / 2]; }, C.id);
  await P.stroke('pen', P.line(cPt, 2, 0, 2));
  list = await P.pens();
  ok(!list.some((a) => a.id === C.id) && list.some((a) => a.id === A), 'the eraser erases the code stroke at its scrolled position, not its neighbour');
  await P.click('[data-ann="eraser"]');

  // Navigation: away and back, still aligned with the editor's current scroll.
  await P.click('[data-action="next"]'); await wait(200);
  await P.click('[data-action="prev"]'); await pad.waitForSelector('.CodeMirror'); await wait(200);
  const sl = await pad.evaluate(() => document.querySelector('.CodeMirror').CodeMirror.getScrollInfo().left);
  ok(Math.abs((await P.pathX(A)) - (ax0 - sl)) < 1.5, `after question navigation the code stroke matches the code (scroll ${sl})`);

  // Reload (Exam Resume): the editor starts unscrolled, the stroke is where it was drawn on the code.
  await pad.reload(); await wait(300);
  if (!(await pad.$('.CodeMirror'))) { const r = await pad.$('[data-action="resume-exam"]'); if (r) { await r.click(); } }
  await pad.waitForSelector('.CodeMirror'); await wait(300);
  const sl2 = await pad.evaluate(() => document.querySelector('.CodeMirror').CodeMirror.getScrollInfo().left);
  ok(Math.abs((await P.pathX(A)) - (ax0 - sl2)) < 1.5 && (await P.pathX(B.id)) === bx0, `after reload both strokes restore aligned (editor scroll ${sl2})`);
  await P.scrollCode(50);
  ok(Math.abs((await P.pathX(A)) - (ax0 - 50)) < 1.5, 'after reload the code stroke still follows horizontal scrolling');
  ok(pad.errors.length === 0, `iPad: no console errors (${pad.errors.join(' | ')})`);
  await pad.close();

  // ── Desktop: unchanged ──
  const desk = await open(false);
  const D = tools(desk);
  await D.startExam();
  await D.click('[data-ann="pen"]');
  const dp = await D.codePt();
  await desk.mouse.move(...dp); await desk.mouse.down();
  for (let i = 1; i <= 8; i++) { await desk.mouse.move(dp[0] + 10 * i, dp[1]); await wait(10); }
  await desk.mouse.up(); await wait(150);
  list = await D.pens();
  ok(list.length === 1 && !('sx' in list[0]), 'desktop: a stroke on the code is saved exactly as before (no sx)');
  const dx0 = await D.pathX(list[0].id);
  await D.scrollCode(100);
  ok((await D.pathX(list[0].id)) === dx0, 'desktop: drawing behaviour unchanged');
  ok(desk.errors.length === 0, `desktop: no console errors (${desk.errors.join(' | ')})`);
  await desk.close();

  await browser.close();
  console.log(fails ? `\n${fails} FAILED` : '\nALL PASSED');
  process.exit(fails ? 1 : 0);
})().catch((e) => { console.error(e); process.exit(1); });
