// iPad Phase 2D-2 Review UX fixes: (1) a written part answered only in handwriting shows as a handwritten answer
// (not graded, never scored), while notes on a question, MCQ marks and eliminations don't count as answers; (2) Review
// has a blank editable environment diagram on the left, above part (a), saved only in the review workspace, and the
// submitted diagram (labels and handwriting) read-only on the right; (3) the right pane no longer shows the current
// review answer. The submitted attempt never changes.
// Run: node tests/e2e/ipad_review_ux.test.js  (needs nothing running; see tests/README.md)
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
    const stroke = (pts) => page.evaluate((pts) => {
      const ev = (name, [x, y], t) => t.dispatchEvent(new PointerEvent(name, { pointerType: 'pen', pointerId: 7, isPrimary: true, clientX: x, clientY: y, button: name === 'pointermove' ? -1 : 0, buttons: name === 'pointerup' ? 0 : 1, bubbles: true, cancelable: true }));
      ev('pointerdown', pts[0], document.elementFromPoint(...pts[0]));
      pts.slice(1).forEach((p) => ev('pointermove', p, document.elementFromPoint(...p) || document));
      ev('pointerup', pts[pts.length - 1], document.elementFromPoint(...pts[pts.length - 1]) || document);
    }, pts);
    const line = ([x, y], dx, dy, n = 8) => Array.from({ length: n + 1 }, (_, i) => [x + dx * i / n, y + dy * i / n]);
    const at = (sel, dx, dy) => page.$eval(sel, (e, dx, dy) => { const r = e.getBoundingClientRect(); return [r.left + dx, r.top + dy]; }, dx, dy);
    const go = async (dir, pid) => { await click(`[data-action="${dir}"]`); await page.waitForFunction((g) => document.querySelector('#pane-right').dataset.group === g, {}, pid); await wait(200); };
    const results = async (id) => { await page.goto(APP_URL); await wait(250); if (await page.$('[data-action="enter"]')) await click('[data-action="enter"]'); await click(`[data-action="open-attempt"][data-id="${id}"]`); await page.waitForSelector('.exam-results'); };
    const toReview = async () => { await click('.actions [data-action="exam-review"]'); await page.waitForSelector('#review-work .part'); await wait(300); };
    const text = (sel) => page.$eval(sel, (e) => e.textContent.replace(/\s+/g, ' ').trim());
    return { click, st, stroke, line, at, go, results, toReview, text };
  };

  // ── An iPad exam: handwriting in an answer box, notes elsewhere, MCQ marks, a diagram ──
  const pad = await open(true);
  const P = tools(pad);
  await pad.goto(APP_URL);
  await pad.evaluate((k, v) => { localStorage.setItem(k, v); Storage.prototype.setItem = function () {}; }, KEY, JSON.stringify(EXAM));
  await pad.goto(APP_URL); await wait(150);
  await P.click('[data-action="enter"]'); await P.click('[data-action="start-exam"]');
  await pad.waitForSelector('#pane-right .part'); await wait(200);
  await pad.evaluate(() => { const b = document.querySelector('#annot-bar [data-ann="pen"][aria-pressed="true"]'); if (b) b.click(); }); await wait(80); // an iPad exam opens with the Pen on (default); these checks start with no tool
  await P.click('#x-sp25-4e-0');                                                   // 4e: an option eliminated, none chosen
  const key4f = await pad.evaluate(() => window.CS61A_BANK.ANSWER_KEY['sp25-4f'].correct);
  await P.click(`label[for="c-sp25-4f-${key4f}"]`);                               // 4f: chosen as usual (correct)
  await pad.$eval('#pane-right', (p) => { p.scrollTop = 0; }); await wait(100);
  await P.click('[data-ann="pen"]');
  await P.stroke(P.line(await P.at('#ta-sp25-4d', 20, 14), 90, 6));                 // 4d: written in the answer box
  await P.stroke(P.line(await P.at('label[for="c-sp25-4e-2"]', 40, 6), 90, 6));    // 4e: a mark over an option
  await pad.$eval('#part-sp25-4g', (p) => p.scrollIntoView({ block: 'center' })); await wait(150);
  await P.stroke(P.line(await P.at('#part-sp25-4g .q-head', 40, 4), 90, 2));       // 4g: a note on the prompt only
  await pad.$eval('#pane-right', (p) => { p.scrollTop = 0; }); await wait(100);
  await P.go('next', 'fa24-2');
  await pad.waitForSelector('#dg-canvas');
  await P.stroke(P.line(await P.at('#dg-canvas', 60, 60), 90, 30));                // the diagram
  await P.click('[data-ann="pen"]');
  await P.click('[data-action="submit-exam"]'); await pad.waitForSelector('.exam-results'); await wait(200);
  let S = await P.st();
  const id = S.attempts[0].id;
  ok(S.attempts[0].graded['sp25-4d'] === 'skipped' && S.attempts[0].graded['sp25-4e'] === 'skipped', 'set-up: the frozen grades have the handwritten and marked parts as unanswered');
  // The submitted diagram also has labels, as one made with the desktop toolkit would.
  await pad.evaluate((k, aid) => {
    const s = JSON.parse(localStorage.getItem(k));
    s.attempts.find((a) => a.id === aid).diagrams = { 'fa24-2': [{ id: 'dslot', kind: 'text', slot: 0, text: '42' }, { id: 'dfree', kind: 'text', x: 30, y: 40, text: 'frame!' }] };
    localStorage.setItem(k, JSON.stringify(s)); Storage.prototype.setItem = function () {};
  }, KEY, id);
  await P.results(id);
  S = await P.st();
  const orig = JSON.stringify(S.attempts[0]);

  // ── 1. Status ──
  const row = (q) => pad.$$eval('.part-row', (rs, q) => { const r = rs.find((x) => x.querySelector(`[data-q="${q}"]`)); return r ? r.querySelector('.badge').textContent + '|' + r.querySelector('.pr-pts').textContent : ''; }, q);
  ok(/^Handwritten · not graded\|—$/.test(await row('sp25-4d')), `a written part answered in handwriting shows as handwritten, not graded, no points (${await row('sp25-4d')})`);
  ok(/^Unanswered/.test(await row('sp25-4e')), 'an MCQ with only an elimination and a pen mark stays Unanswered');
  ok(/^Unanswered/.test(await row('sp25-4g')), 'a written part with only a note on its prompt stays Unanswered');
  ok(/^(Correct|Incorrect)/.test(await row('sp25-4f')), 'a chosen MCQ is graded as before');
  const tiles = await pad.$$eval('.exam-results .stat', (t) => t.map((x) => x.textContent.replace(/\s+/g, ' ').trim()).join(' | '));
  const sc = S.attempts[0].score;
  ok(new RegExp(`(^|\\| )${sc.counts.skipped - 1} ?Unanswered parts`).test(tiles) && /(^|\| )1 ?Handwritten · not graded/.test(tiles) && (await P.text('.score-main')).includes(`${sc.earned}`), `the score card counts it apart; the frozen score is unchanged (${tiles})`);
  ok(JSON.stringify((await P.st()).attempts[0]) === orig, 'showing the status changes nothing in the attempt (grades, score)');

  // ── Review ──
  await P.toReview();
  ok((await P.text('#rv-sp25-4d .badge')) === 'Handwritten · not graded' && /answered this part in handwriting/.test(await P.text('#rv-sp25-4d .rv-block')) && !!(await pad.$('#rv-sp25-4d .feedback .title')), 'Review: the part says handwritten answer, not graded, with the official answer');
  ok((await P.text('#rv-sp25-4e .badge')) === 'Unanswered', 'Review: the marked MCQ stays Unanswered');
  // Official Answer cards: neutral and the same for every part; the grade stays with the submitted answer.
  const cards = await pad.$$eval('#pane-right .rv-part', (ps) => ps.map((p) => { const f = p.querySelector('.feedback'); return { id: p.id, info: f.classList.contains('info') && !/\b(good|bad)\b/.test(f.className), title: (f.querySelector('.title') || {}).textContent, says: /(✓|✗)|\b(Correct|Incorrect|Unanswered)\b/.test(f.textContent.replace(/Explanation.*$/s, '')), badge: p.querySelector('.badge').textContent }; }));
  ok(cards.length === 4 && cards.every((c) => c.info && c.title === 'Official Answer' && !c.says), `every Official Answer card is neutral, titled "Official Answer", with no grade in it (${JSON.stringify(cards.map((c) => [c.id, c.info, c.title, c.says]))})`);
  ok(cards.find((c) => c.id === 'rv-sp25-4f').badge === 'Correct', 'a correct MCQ keeps its "Correct" badge');
  ok(!/No answer submitted/.test(await P.text('#rv-sp25-4d .rv-block')) && !!(await pad.$('#rv-sp25-4d .rv-block .orig-ink')), 'a handwritten answer shows its handwriting, without “No answer submitted”');
  ok(/No answer submitted/.test(await P.text('#rv-sp25-4g .rv-block')), 'a truly unanswered written part still says “No answer submitted”');

  // ── 3. The right pane compares only ──
  await pad.$eval('#review-work #ta-sp25-4d', (t) => t.scrollIntoView({ block: 'center' }));
  await pad.click('#review-work #ta-sp25-4d'); await pad.keyboard.type('review try'); await wait(400);
  ok(!(await pad.$('#pane-right .rv-current, #pane-right [data-action="reset-answer"], #pane-right .rv-same')) && !/Current review answer/.test(await P.text('#pane-right')), 'no “Current review answer” or Reset button on the right, even after an edit');
  ok((await P.st()).reviews[id].answers['sp25-4d'] === 'review try' && (await P.text('#rv-sp25-4d .rv-block')).includes('Your submitted answer'), 'the review answer is kept (left); the right still shows the submitted one');

  // ── 2. Diagrams ──
  await P.go('next', 'fa24-2');
  ok(!(await pad.$('#pane-right #diagram-slot')) && !!(await pad.$('#review-work #diagram-slot .dg-canvas')), 'the editable diagram is on the left, not the right');
  ok(await pad.evaluate(() => { const d = document.querySelector('#review-work #diagram-slot'); const p = document.querySelector('#review-parts .part'); return !!(d.compareDocumentPosition(p) & Node.DOCUMENT_POSITION_FOLLOWING); }), '…above part (a)');
  ok(await pad.evaluate(() => Array.from(document.querySelectorAll('#review-work .dg-text')).every((i) => !i.value) && !document.querySelector('#review-work .dg-layer path')), '…and blank');
  const right = '[data-orig="diagram"] .orig-ink';
  ok(await pad.$eval(right, (f) => { const v = Array.from(f.querySelectorAll('.dg-text')).map((i) => i.value); return v.includes('42') && v.includes('frame!') && f.querySelectorAll('.orig-svg path').length === 1; }), 'the submitted diagram is on the right, with its labels and handwriting');
  ok(await pad.$eval(right, (f) => f.querySelector('.orig-ctx').inert && Array.from(f.querySelectorAll('input')).every((i) => i.disabled && !i.id)), '…read-only');
  ok(await pad.evaluate(() => { const ids = Array.from(document.querySelectorAll('[id]')).map((e) => e.id); return ids.length === new Set(ids).size; }), 'no duplicate ids with the two diagrams');
  // iPad: the left diagram is paper; Pencil work there is the review workspace's.
  await P.click('[data-ann="pen"]');
  await pad.$eval('#review-work #diagram-slot', (d) => d.scrollIntoView({ block: 'center' })); await wait(150);
  await P.stroke(P.line(await P.at('#review-work .dg-canvas', 80, 80), 120, 40));
  await P.click('[data-ann="pen"]');
  S = await P.st();
  ok((S.reviews[id].annotations['fa24-2'] || []).some((a) => a.kind === 'pen') && JSON.stringify(S.attempts[0]) === orig, 'Pencil on the left diagram saves to the review workspace only');
  ok(await pad.$eval(right, (f) => f.querySelectorAll('.orig-svg path').length === 1), '…and the submitted diagram on the right is unchanged');
  ok(!!(await pad.$('#tutor-btn')), 'Python Tutor is still available');

  // ── 7. Left answers: editable and kept after a reload ──
  await P.results(id); await P.toReview();
  ok((await pad.$eval('#review-work #ta-sp25-4d', (t) => t.value)) === 'review try', 'the left review answer is kept after a reload');
  ok(JSON.stringify((await P.st()).attempts[0]) === orig, 'the submitted attempt is unchanged');
  ok(pad.errors.length === 0, `iPad: no console errors (${pad.errors.join(' | ')})`);
  const stored = await pad.evaluate((k) => localStorage.getItem(k), KEY);
  await pad.close();

  // ── Desktop: the left diagram is the interactive one; its labels go to the review workspace only ──
  const desk = await open(false);
  const D = tools(desk);
  await desk.goto(APP_URL);
  await desk.evaluate((k, v) => { localStorage.setItem(k, v); Storage.prototype.setItem = function () {}; }, KEY, stored);
  await desk.goto(APP_URL); await wait(200);
  await D.results(id); await D.toReview();
  await D.go('next', 'fa24-2');
  ok(await desk.$eval('#review-work #dg-bar', (b) => b.offsetParent !== null), 'desktop: the left diagram has its toolkit');
  await desk.$eval('#review-work .dg-slot[data-slot="0"]', (i) => i.scrollIntoView({ block: 'center' })); await wait(100);
  await desk.click('#review-work .dg-slot[data-slot="0"]'); await desk.keyboard.type('7'); await desk.keyboard.press('Enter'); await wait(500);
  const dS = await D.st();
  ok((dS.reviews[id].diagrams['fa24-2'] || []).some((a) => a.text === '7') && JSON.stringify(dS.attempts[0]) === orig, 'desktop: a label on the left diagram is saved in the review workspace; the attempt is unchanged');
  ok(await desk.$eval(right, (f) => Array.from(f.querySelectorAll('.dg-text')).map((i) => i.value).includes('42') && !Array.from(f.querySelectorAll('.dg-text')).some((i) => i.value === '7')), 'desktop: the submitted diagram on the right still shows its own labels');
  ok(desk.errors.length === 0, `desktop: no console errors (${desk.errors.join(' | ')})`);

  await browser.close();
  console.log(fails ? `\n${fails} failed` : '\nAll Review UX checks passed');
  process.exit(fails ? 1 : 0);
})().catch((e) => { console.error(e); process.exit(1); });
