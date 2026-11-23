// iPad Phase 2D-2: Review shows the original answer-pane handwriting over a read-only copy of the exam's answer
// pane: each stroke inside one part in that part's "Your submitted answer" (beside the typed answer), diagram strokes
// in "Original Diagram Work", the rest in "Other Submitted Handwriting", and the whole pane when the copy can't be
// trusted; scaled with its content; inert, with no duplicate ids or radio groups; the attempt never changes, and
// Review's own Pencil layer stays separate. Older attempts show nothing new.
// Run: node tests/e2e/ipad_original_handwriting.test.js  (needs nothing running; see tests/README.md)
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
    const toReview = async () => { await click('.actions [data-action="exam-review"]'); await page.waitForSelector('#review-work .part'); await wait(300); };
    const reopen = async (id) => { await page.goto(APP_URL); await wait(250); if (await page.$('[data-action="enter"]')) await click('[data-action="enter"]'); await click('[data-action="progress"]'); await click(`.mh-card [data-action="open-attempt"][data-id="${id}"]`); await toReview(); };
    const tamper = async (fn) => { await page.evaluate((k, f) => { const s = JSON.parse(localStorage.getItem(k)); new Function('s', f)(s); localStorage.setItem(k, JSON.stringify(s)); Storage.prototype.setItem = function () {}; }, KEY, fn); };
    const paths = (sel) => page.$$eval(`${sel} .orig-ink .orig-svg path`, (p) => p.length).catch(() => 0);
    return { click, st, stroke, line, at, go, toReview, reopen, tamper, paths };
  };

  // ── An iPad exam with handwriting in different places, submitted ──
  const pad = await open(true);
  const P = tools(pad);
  await pad.goto(APP_URL);
  await pad.evaluate((k, v) => { localStorage.setItem(k, v); Storage.prototype.setItem = function () {}; }, KEY, JSON.stringify(EXAM));
  await pad.goto(APP_URL); await wait(150);
  await P.click('[data-action="enter"]'); await P.click('[data-action="start-exam"]');
  await pad.waitForSelector('#pane-right .part'); await wait(200);
  await pad.evaluate(() => { const b = document.querySelector('#annot-bar [data-ann="pen"][aria-pressed="true"]'); if (b) b.click(); }); await wait(80); // an iPad exam opens with the Pen on (default); these checks start with no tool
  await P.click('label[for="c-sp25-4e-1"]');
  await pad.click('#ta-sp25-4d'); await pad.keyboard.type('submitted text'); await wait(400);
  await P.click('[data-ann="pen"]');
  await P.click('[data-ann="pencolor"]'); await P.click('#pen-colors [data-color="blue"]');
  const examTa = await pad.$eval('#ta-sp25-4d', (t) => { const r = t.getBoundingClientRect(); return { w: r.width }; });
  await P.stroke(P.line(await P.at('#ta-sp25-4d', 20, 10), 80, 5));                 // blue, part 4d's answer box
  await P.click('[data-ann="pencolor"]'); await P.click('#pen-colors [data-color="red"]');
  await P.stroke(P.line(await P.at('label[for="c-sp25-4e-2"]', 40, 6), 100, 8));    // red, part 4e's options
  await P.stroke(P.line(await P.at('#part-sp25-4d', 60, 140), 0, 80));               // across parts 4d → 4e
  await P.stroke(P.line(await P.at('#pane-right .q-bar', 260, 8), 60, 4));           // on the question bar
  await P.go('next', 'fa24-2');
  await pad.waitForSelector('#dg-canvas');
  await P.stroke(P.line(await P.at('#dg-canvas', 60, 60), 90, 30));                 // the diagram
  await P.click('[data-ann="pen"]');
  await P.click('[data-action="submit-exam"]'); await pad.waitForSelector('.actions [data-action="exam-review"]'); await wait(200);
  const A = (await P.st()).attempts[0];
  const id = A.id;
  const orig = JSON.stringify(A);
  ok(A.handwriting['sp25-4b'].length === 4 && A.handwriting['fa24-2'].length === 1, 'set-up: five strokes submitted (four on the first question, one on the diagram)');

  // ── Review: where each stroke shows ──
  await P.toReview();
  ok((await P.paths('#rv-sp25-4d')) === 1 && (await P.paths('#rv-sp25-4e')) === 1 && (await P.paths('#rv-sp25-4f')) === 0 && (await P.paths('#rv-sp25-4g')) === 0, 'each stroke inside one part shows in that part’s “Your submitted answer”, and only there');
  ok(await pad.$eval('#rv-sp25-4d .orig-ink .orig-svg path', (p) => /1f5fd6/.test(p.getAttribute('style') || '')), 'colours are kept (blue)');
  ok((await P.paths('[data-orig="other"]')) === 2 && /Other Submitted Handwriting/.test(await pad.$eval('[data-orig="other"]', (e) => e.textContent)), 'a stroke across two parts and one on the question bar go to “Other Submitted Handwriting”, not a part');
  ok(!(await pad.$('[data-orig="diagram"]')) && (await pad.$eval('[data-orig="full"]', (e) => e.innerHTML.trim())) === '', 'no diagram or whole-pane section on a question without them');
  ok(await pad.$eval('#rv-sp25-4d .rv-block', (b) => { const pre = b.querySelector('.rv-pre'); const ink = b.querySelector('.orig-ink'); return pre && pre.textContent === 'submitted text' && ink && (pre.compareDocumentPosition(ink) & Node.DOCUMENT_POSITION_FOLLOWING); }), 'the typed submitted answer is still there, with the handwriting under it');
  ok(await pad.$eval('#rv-sp25-4d .orig-ink', (f) => /as submitted/i.test(f.textContent) && getComputedStyle(f).borderStyle === 'dashed'), 'the original is marked “as submitted · read-only” in its own dashed card');

  // Scaled with its content: the stroke sits on the copy's answer box where it was drawn.
  const fit = await pad.$eval('#rv-sp25-4d .orig-ink', (f, examW) => {
    const ta = f.querySelector('textarea').getBoundingClientRect();
    const p = f.querySelector('.orig-svg path').getBoundingClientRect();
    const k = ta.width / examW;
    return { k, dx: p.left - (ta.left + 20 * k), dy: p.top - (ta.top + 10 * k), slot: f.getBoundingClientRect().width, copy: f.querySelector('.orig-ctx').getBoundingClientRect().width };
  }, examTa.w);
  ok(fit.k < 1 && fit.k > 0.6 && Math.abs(fit.dx) < 2 && Math.abs(fit.dy) < 2, `scaled together: the stroke lands on the copied answer box (scale ${fit.k.toFixed(2)}, off by ${fit.dx.toFixed(1)}, ${fit.dy.toFixed(1)} px)`);
  ok(Math.abs(fit.copy - fit.slot) < 4, 'the copy is scaled to the width of its section');

  // Read-only and isolated.
  ok(await pad.$$eval('.orig-ink', (fs) => fs.every((f) => f.querySelector('.orig-ctx').inert && !f.querySelector('[id], [name], [for], [data-action], [data-qid]') && Array.from(f.querySelectorAll('input, textarea, button')).every((x) => x.disabled))), 'the copy is inert, with no ids, names, labels’ targets or actions, and disabled controls');
  ok(await pad.evaluate(() => { const ids = Array.from(document.querySelectorAll('[id]')).map((e) => e.id); return ids.length === new Set(ids).size; }), 'no duplicate ids on the page');
  ok(await pad.evaluate(() => Array.from(document.querySelectorAll('input[name="sp25-4e"]')).every((r) => r.closest('#review-work'))) && await pad.$eval('#c-sp25-4e-1', (r) => r.checked), 'no radio-group clash: only the review answers carry the question’s radio name, and their choice stays checked');
  await P.click('label[for="c-sp25-4e-2"]');
  let S = await P.st();
  ok(S.reviews[id].answers['sp25-4e'] === 2 && await pad.$eval('#c-sp25-4e-2', (r) => r.checked) && await pad.$eval('#rv-sp25-4e .orig-ink', (f) => Array.from(f.querySelectorAll('input[type="radio"]')).findIndex((r) => r.checked)) === 1 && S.attempts[0].answers['sp25-4e'] === 1, 'changing the review answer leaves the original’s choice (and the attempt) alone');

  // Review's own Pencil layer stays separate; nothing reaches the original.
  const orig4d = await pad.$eval('#rv-sp25-4d .orig-ink .orig-svg path', (p) => p.getAttribute('d'));
  await P.click('[data-ann="pen"]');
  await pad.$eval('#rv-sp25-4e .orig-ink', (f) => f.scrollIntoView({ block: 'center' })); await wait(150);
  const onCopy = await pad.$eval('#rv-sp25-4e .orig-ink .orig-clip', (c) => { const r = c.getBoundingClientRect(); return [r.left + 30, r.top + 30]; });
  await P.stroke(P.line(onCopy, 120, 20));
  S = await P.st();
  ok((S.reviews[id].handwriting || {})['sp25-4b'].length === 1 && (await pad.$$eval('#ink-right path', (p) => p.length)) === 1, 'Pencil over the original draws on the review layer');
  ok(S.reviews[id].answers['sp25-4e'] === 2, 'a Pencil drag that starts on the copied options selects nothing');
  await P.click('[data-ann="eraser"]');
  await pad.$eval('#rv-sp25-4d .orig-ink', (f) => f.scrollIntoView({ block: 'center' })); await wait(150);
  const onOrig = await pad.$eval('#rv-sp25-4d .orig-ink .orig-svg path', (p) => { const pt = p.getPointAtLength(p.getTotalLength() / 2); const r = p.ownerSVGElement.getBoundingClientRect(); const k = r.width / p.ownerSVGElement.width.baseVal.value; return [r.left + pt.x * k, r.top + pt.y * k]; });
  await P.stroke(P.line(onOrig, 0, 2, 2));
  ok((await P.paths('#rv-sp25-4d')) === 1 && (await pad.$eval('#rv-sp25-4d .orig-ink .orig-svg path', (p) => p.getAttribute('d'))) === orig4d, 'the eraser can’t touch the original');
  await P.click('[data-ann="undo"]'); await P.click('[data-ann="redo"]'); await P.click('[data-ann="clear"]');
  S = await P.st();
  ok(!((S.reviews[id].handwriting || {})['sp25-4b'] || []).length && (await P.paths('#rv-sp25-4d')) === 1 && (await P.paths('[data-orig="other"]')) === 2, 'Undo, Redo and Clear change only the review layer; the original stays');
  await P.click('[data-ann="undo"]');
  await P.click('[data-ann="eraser"]');
  ok(JSON.stringify(S.attempts[0]) === orig && JSON.stringify((await P.st()).attempts[0]) === orig, 'the submitted attempt (answers, handwriting, grades) is unchanged');

  // The diagram question.
  await pad.$eval('#pane-right', (p) => { p.scrollTop = 0; });
  await P.go('next', 'fa24-2');
  ok((await P.paths('[data-orig="diagram"]')) === 1 && /Original Diagram Work/.test(await pad.$eval('[data-orig="diagram"]', (e) => e.textContent)) && (await pad.$$eval('[data-orig="part"] .orig-ink', (f) => f.length)) === 0, 'diagram handwriting shows in its own “Original Diagram Work” section, in no part');
  const dgFit = await pad.$eval('[data-orig="diagram"] .orig-ink', (f) => {
    const c = f.querySelector('.dg-canvas').getBoundingClientRect();
    const p = f.querySelector('.orig-svg path').getBoundingClientRect();
    const k = c.width / parseFloat(f.querySelector('.dg-canvas').style.width);
    return [p.left - (c.left + 60 * k), p.top - (c.top + 60 * k)];
  });
  ok(Math.abs(dgFit[0]) < 2 && Math.abs(dgFit[1]) < 2, `…aligned with the copied diagram (off by ${dgFit.map((v) => v.toFixed(1))} px)`);

  // Reload: the same display, the same attempt.
  await P.reopen(id);
  ok((await P.paths('#rv-sp25-4d')) === 1 && (await P.paths('#rv-sp25-4e')) === 1 && (await P.paths('[data-orig="other"]')) === 2 && JSON.stringify((await P.st()).attempts[0]) === orig, 'after a reload the original handwriting shows the same, and the attempt is unchanged');

  // Strokes drawn at another width (e.g. after rotating): the whole pane, as submitted.
  await P.tamper("s.attempts[0].handwriting['sp25-4b'][0].w = 500;");
  await P.reopen(id);
  ok((await P.paths('[data-orig="full"]')) === 4 && (await pad.$$eval('[data-orig="part"] .orig-ink, [data-orig="other"] .orig-ink', (f) => f.length)) === 0, 'when the copy can’t be trusted, all strokes show once over the whole pane instead of per part');

  // An older attempt without handwriting (and the first attempt's stroke width put back; this page saves nothing more).
  await pad.goto(APP_URL); await wait(200);
  await P.tamper("s.attempts[0].handwriting['sp25-4b'][0].w = " + A.handwriting['sp25-4b'][0].w + "; const o = JSON.parse(JSON.stringify(s.attempts[0])); o.id = 'xlegacy'; o.aid = undefined; delete o.handwriting; s.attempts.unshift(o);");
  await P.reopen('xlegacy');
  ok(!(await pad.$('.orig-slot, .orig-ink')) && (await pad.$$eval('.rv-part', (p) => p.length)) === 4, 'an attempt without handwriting shows its review as before (nothing added)');
  ok(pad.errors.length === 0, `iPad: no console errors (${pad.errors.join(' | ')})`);
  const stored = await pad.evaluate((k) => localStorage.getItem(k), KEY);
  await pad.close();

  // ── Desktop Review of the same attempt: shown too (read-only), desktop layout otherwise unchanged ──
  const desk = await open(false);
  const D = tools(desk);
  await desk.goto(APP_URL);
  await desk.evaluate((k, v) => { localStorage.setItem(k, v); Storage.prototype.setItem = function () {}; }, KEY, stored);
  await D.reopen(id);
  ok((await D.paths('#rv-sp25-4d')) === 1 && !(await desk.$eval('.p-main', (m) => m.classList.contains('pencil-ink'))), 'desktop Review shows the original too, with the desktop toolbar unchanged');
  ok(desk.errors.length === 0, `desktop: no console errors (${desk.errors.join(' | ')})`);

  await browser.close();
  console.log(fails ? `\n${fails} failed` : '\nAll original handwriting checks passed');
  process.exit(fails ? 1 : 0);
})().catch((e) => { console.error(e); process.exit(1); });
