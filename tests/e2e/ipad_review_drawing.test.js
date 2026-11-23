// iPad Phase 2D-1: Review uses the exam's Apple Pencil drawing: the one toolbar on the divider, Pencil ink on both
// panes (the question and review answers on the left, the submitted / official answers and diagram on the right),
// fingers never draw, strokes land under the Pencil, and Pen colours / Highlighter / Eraser / Undo / Redo / Clear
// work, all in the review workspace: the submitted attempt never changes. Desktop review is unchanged.
// Run: node tests/e2e/ipad_review_drawing.test.js  (needs nothing running; see tests/README.md)
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
    const seed = async () => {
      await page.goto(APP_URL);
      await page.evaluate((k, v) => { localStorage.setItem(k, v); Storage.prototype.setItem = function () {}; }, KEY, JSON.stringify(EXAM));
      await page.goto(APP_URL); await wait(150);
      await click('[data-action="enter"]'); await click('[data-action="start-exam"]');
      await page.waitForSelector('#pane-right .part'); await wait(200);
    };
    const toReview = async () => { await click('.actions [data-action="exam-review"]'); await page.waitForSelector('#review-work .part'); await wait(250); };
    const stroke = (type, pts) => page.evaluate((type, pts) => {
      const ev = (name, [x, y], t) => t.dispatchEvent(new PointerEvent(name, { pointerType: type, pointerId: type === 'touch' ? 3 : 7, isPrimary: true, clientX: x, clientY: y, button: name === 'pointermove' ? -1 : 0, buttons: name === 'pointerup' ? 0 : 1, bubbles: true, cancelable: true }));
      ev('pointerdown', pts[0], document.elementFromPoint(...pts[0]));
      pts.slice(1).forEach((p) => ev('pointermove', p, document.elementFromPoint(...p) || document));
      ev('pointerup', pts[pts.length - 1], document.elementFromPoint(...pts[pts.length - 1]) || document);
    }, type, pts);
    const line = ([x, y], dx, dy, n = 8) => Array.from({ length: n + 1 }, (_, i) => [x + dx * i / n, y + dy * i / n]);
    const at = (sel, dx, dy) => page.$eval(sel, (e, dx, dy) => { const r = e.getBoundingClientRect(); return [r.left + dx, r.top + dy]; }, dx, dy);
    const rect = (sel) => page.$eval(sel, (e) => { const r = e.getBoundingClientRect(); return { x: r.left, y: r.top, w: r.width, h: r.height }; });
    const lastBox = (sel) => page.$eval(sel, (e) => { const r = e.getBoundingClientRect(); return [r.left, r.top]; });
    const go = async (dir, pid) => { await click(`[data-action="${dir}"]`); await page.waitForFunction((g) => document.querySelector('#pane-right').dataset.group === g, {}, pid); await wait(200); };
    return { click, st, seed, toReview, stroke, line, at, rect, lastBox, go };
  };
  const near = (a, b, tol = 3) => Math.abs(a[0] - b[0]) <= tol && Math.abs(a[1] - b[1]) <= tol;

  // ── An iPad exam with handwriting, submitted ──
  const pad = await open(true);
  const P = tools(pad);
  await P.seed();
  await P.click('label[for="c-sp25-4e-1"]');
  await pad.click('#ta-sp25-4d'); await pad.keyboard.type('submitted text'); await wait(400);
  await P.click('[data-ann="pen"]');
  await P.stroke('pen', P.line(await P.at('#problem-article .annot-text', 40, 10), 90, 25));
  await P.stroke('pen', P.line(await P.at('#pane-right', 52, 140), 100, 40));
  await P.click('[data-ann="pen"]');
  await P.click('[data-action="submit-exam"]'); await pad.waitForSelector('.actions [data-action="exam-review"]'); await wait(200);
  const S0 = await P.st();
  const A = S0.attempts[0];
  const orig = JSON.stringify(A);
  const id = A.id;
  const wsPens = (S) => ((S.reviews[id].annotations['sp25-4b']) || []).filter((a) => a.kind === 'pen');
  const wsInk = (S, pid = 'sp25-4b') => ((S.reviews[id].handwriting || {})[pid]) || [];

  // ── Review: the exam's toolbar on the divider ──
  await P.toReview();
  ok(await pad.$eval('.p-main', (m) => m.classList.contains('pencil-ink')), 'iPad Review: Pencil mode is on');
  const bar = await P.rect('#annot-bar'), divider = await pad.$eval('#pane-left', (p) => p.getBoundingClientRect().right);
  ok(bar.h > bar.w && Math.abs(bar.x + bar.w / 2 - divider) < 4 && (await pad.$$('#annot-bar')).length === 1, `the one toolbar is a column on the divider, not top-left (${Math.round(bar.x)},${Math.round(bar.y)})`);
  ok(await pad.$eval('#annot-bar', (b) => ['hl', 'pen', 'pencolor', 'eraser', 'undo', 'redo', 'clear'].every((k) => b.querySelector(`[data-ann="${k}"]`))), 'Pen + colours, Highlighter, Eraser, Undo, Redo and Clear are all there');
  ok((await pad.$$eval('#ink-right path', (p) => p.length)) === 0, 'the right pane starts with an empty review layer (the original handwriting isn’t shown: Phase 2D-2)');
  const pens0 = wsPens(await P.st()).length;

  // Left pane: the question, and the editable review answers under it.
  await P.click('[data-ann="pen"]');
  const lp = await P.at('#problem-article .annot-text', 60, 40);
  await P.stroke('pen', P.line(lp, 90, 20));
  let S = await P.st();
  ok(wsPens(S).length === pens0 + 1 && wsInk(S).length === 0, 'Pencil on the question draws on the left only');
  ok(near(await P.lastBox('#problem-article .annot-layer path:last-child'), lp), 'the left stroke lands under the Pencil');
  await pad.$eval('#review-work textarea', (t) => t.scrollIntoView({ block: 'center' })); await wait(150);
  const ta = await P.at('#review-work textarea', 20, 10);
  ok(await pad.$eval('#review-work textarea', (t) => t.readOnly), 'with the pen on, the review answer boxes are paper (no Scribble)');
  const taVal = await pad.$eval('#review-work textarea', (t) => t.value);
  await P.stroke('pen', P.line(ta, 80, 10));
  S = await P.st();
  ok(wsPens(S).length === pens0 + 2 && (await pad.$eval('#review-work textarea', (t) => t.value)) === taVal, 'Pencil over a review answer box draws (left) and leaves the answer as it was');
  ok(near(await P.lastBox('#problem-article .annot-layer path:last-child'), ta), '…exactly under the Pencil');
  await pad.$eval('#pane-left', (p) => { p.scrollTop = 0; }); await wait(150);

  // Right pane: the submitted / official answers, on the review layer.
  await P.click('[data-ann="pencolor"]'); await P.click('#pen-colors [data-color="blue"]');
  const rp = await P.at('#pane-right', 60, 160);
  await P.stroke('pen', P.line(rp, 100, 30));
  S = await P.st();
  ok(wsInk(S).length === 1 && wsInk(S)[0].color === 'blue' && wsPens(S).length === pens0 + 2, 'Pencil on the right draws there only, in the chosen colour');
  ok(near(await P.lastBox('#ink-right path:last-child'), rp), 'the right stroke lands under the Pencil');
  await pad.$eval('#pane-right', (p) => { p.scrollTop = 120; }); await wait(100);
  const rp2 = await P.at('#pane-right', 60, 300);
  await P.stroke('pen', P.line(rp2, 80, 20));
  ok(near(await P.lastBox('#ink-right path:last-child'), rp2), 'after scrolling the pane, strokes still land under the Pencil');
  ok((await pad.$$eval('#ink-right path', (p) => p.length)) === 2 && wsInk(await P.st()).length === 2, 'one path per stroke (no duplicates)');
  await pad.$eval('#pane-right', (p) => { p.scrollTop = 0; }); await wait(100);

  // Fingers never draw, and the left overlay doesn't catch them.
  await P.stroke('touch', P.line(lp, 0, 80));
  await P.stroke('touch', P.line(rp, 0, 80));
  S = await P.st();
  ok(wsPens(S).length === pens0 + 2 && wsInk(S).length === 2, 'finger drags on either pane draw nothing');
  ok(!(await pad.evaluate(([x, y]) => document.elementFromPoint(x, y).classList.contains('annot-layer'), lp)), 'the left overlay doesn’t cover the question for fingers (they scroll)');

  // Eraser, Undo, Redo, Clear.
  await P.click('[data-ann="eraser"]');
  const mid = await pad.$eval('#ink-right path:first-child', (p) => { const pt = p.getPointAtLength(p.getTotalLength() / 2); const r = p.ownerSVGElement.getBoundingClientRect(); return [r.left + pt.x, r.top + pt.y]; });
  await P.stroke('pen', P.line(mid, 0, 2, 2));
  S = await P.st();
  ok(wsInk(S).length === 1 && wsPens(S).length === pens0 + 2, 'the eraser removes the right stroke only');
  await P.click('[data-ann="undo"]');
  ok(wsInk(await P.st()).length === 2, 'Undo brings it back');
  await P.click('[data-ann="redo"]');
  ok(wsInk(await P.st()).length === 1, 'Redo erases it again');
  await P.click('[data-ann="undo"]');
  await P.click('[data-ann="undo"]'); // the right stroke after scrolling
  S = await P.st();
  ok(wsInk(S).length === 1 && wsPens(S).length === pens0 + 2, 'Undo of a right stroke leaves the left pane alone');
  await P.click('[data-ann="undo"]'); // the blue right stroke
  await P.click('[data-ann="undo"]'); // the stroke over the answer box
  S = await P.st();
  ok(wsInk(S).length === 0 && wsPens(S).length === pens0 + 1, 'Undo of a left stroke leaves the right pane alone');
  await P.click('[data-ann="redo"]'); await P.click('[data-ann="redo"]');
  ok(wsInk(await P.st()).length === 1 && wsPens(await P.st()).length === pens0 + 2, 'Redo restores both, each on its own pane');

  // Highlighter with the Pencil on the question.
  await P.click('[data-ann="hl"]');
  const ht = await pad.$eval('#problem-article .annot-text', (e) => { const r = e.getBoundingClientRect(); return [[r.left + 8, r.top + 12], [r.left + 200, r.top + 12]]; });
  await P.stroke('pen', P.line(ht[0], ht[1][0] - ht[0][0], 0));
  ok(((await P.st()).reviews[id].annotations['sp25-4b'] || []).some((a) => a.kind === 'hl'), 'the highlighter follows a Pencil drag on the question');
  await P.click('[data-ann="hl"]');

  // Clear takes both panes; Undo brings both back.
  await P.click('[data-ann="clear"]');
  S = await P.st();
  ok(wsInk(S).length === 0 && !(S.reviews[id].annotations['sp25-4b'] || []).length, 'Clear removes this question’s review drawings on both panes');
  await P.click('[data-ann="undo"]');
  S = await P.st();
  ok(wsInk(S).length === 1 && wsPens(S).length === pens0 + 2, 'Undo after Clear restores both');

  // Other question, then back: no duplicates, nothing crosses over.
  await P.go('next', 'fa24-2');
  ok((await pad.$$eval('#ink-right path', (p) => p.length)) === 0, 'the next question shows none of these strokes');
  await P.go('prev', 'sp25-4b');
  ok((await pad.$$eval('#ink-right path', (p) => p.length)) === 1 && (await pad.$$eval('#problem-article .annot-layer path', (p) => p.length)) === pens0 + 2, 'back again: the same strokes, once each');

  // Pen off: the review answers are typeable again.
  await P.click('[data-ann="pen"]'); await P.click('[data-ann="pen"]');
  ok(await pad.$eval('#review-work textarea', (t) => !t.readOnly), 'tool off: the review answer boxes are typeable again');

  // The original submission never changed; review drawings persist after a reload.
  ok(JSON.stringify((await P.st()).attempts[0]) === orig, 'the original submission (answers, handwriting, grades) is unchanged');
  await pad.goto(APP_URL); await wait(200);
  await P.click('[data-action="enter"]');
  await P.click('[data-action="progress"]'); await P.click(`.mh-card [data-action="open-attempt"][data-id="${id}"]`);
  await P.toReview();
  ok((await pad.$$eval('#ink-right path', (p) => p.length)) === 1 && (await pad.$$eval('#problem-article .annot-layer path', (p) => p.length)) === pens0 + 2, 'after a reload the review drawings are back on both panes');
  ok(JSON.stringify((await P.st()).attempts[0]) === orig, '…and the original is still unchanged');
  ok(pad.errors.length === 0, `iPad: no console errors (${pad.errors.join(' | ')})`);
  await pad.close();

  // ── Desktop Review: unchanged ──
  const desk = await open(false);
  const D = tools(desk);
  await D.seed();
  await D.click('[data-action="submit-exam"]'); await desk.waitForSelector('.actions [data-action="exam-review"]'); await wait(200);
  await D.toReview();
  ok(!(await desk.$eval('.p-main', (m) => m.classList.contains('pencil-ink'))) && await desk.$eval('#annot-bar', (b) => getComputedStyle(b).position === 'sticky'), 'desktop Review: toolbar at the top as before, no Pencil mode');
  await D.click('[data-ann="pen"]');
  const dp = await D.at('#problem-article .annot-text', 40, 10);
  await desk.mouse.move(...dp); await desk.mouse.down(); await desk.mouse.move(dp[0] + 60, dp[1] + 10, { steps: 6 }); await desk.mouse.up(); await wait(200);
  const dS = await D.st();
  ok(dS.reviews[dS.attempts[0].id].annotations['sp25-4b'].filter((a) => a.kind === 'pen').length === 1 && !('handwriting' in dS.reviews[dS.attempts[0].id]), 'desktop Review: the mouse draws on the question as before');
  ok(await desk.$eval('#review-work textarea', (t) => !t.readOnly), 'desktop Review: answer boxes stay editable with the pen on');
  ok(desk.errors.length === 0, `desktop: no console errors (${desk.errors.join(' | ')})`);

  await browser.close();
  console.log(fails ? `\n${fails} failed` : '\nAll Review drawing checks passed');
  process.exit(fails ? 1 : 0);
})().catch((e) => { console.error(e); process.exit(1); });
