// iPad Phase 2A: exam handwriting is saved automatically (with the exam in progress, in localStorage) and comes
// back after a reload, per question and per attempt, with its colours and order; Eraser / Undo / Redo / Clear are
// saved too; a full storage keeps saving answers. Desktop exams never write handwriting.
// Run: node tests/e2e/ipad_handwriting.test.js  (needs the local server; see tests/README.md)
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
    page.dialogs = [];
    page.on('pageerror', (e) => page.errors.push(String(e)));
    page.on('console', (m) => { if (m.type() === 'error') page.errors.push(m.text()); });
    page.on('dialog', (d) => { page.dialogs.push(d.message()); d.accept(); });
    return page;
  };
  const tools = (page) => {
    const click = async (sel) => { await page.waitForSelector(sel, { visible: true, timeout: 8000 }); await page.click(sel); await wait(80); };
    const st = async () => { await wait(350); return page.evaluate((k) => JSON.parse(localStorage.getItem(k)), KEY); };
    const ready = async () => { await page.waitForSelector('#pane-right .part'); await page.waitForSelector('.CodeMirror'); await wait(150); await page.evaluate(() => { const b = document.querySelector('#annot-bar [data-ann="pen"][aria-pressed="true"]'); if (b) b.click(); }); await wait(80); // an iPad exam opens with the Pen on (default); these checks start with no tool
    };
    const startExam = async () => {
      await page.goto(APP_URL);
      await page.evaluate((k, v) => { localStorage.setItem(k, v); Storage.prototype.setItem = function () {}; }, KEY, JSON.stringify(EXAM));
      await page.goto(APP_URL); await wait(150);
      await click('[data-action="enter"]'); await click('[data-action="start-exam"]');
      await ready();
    };
    const reloadResume = async () => {
      await page.goto(APP_URL); await wait(300);
      // An exam that wasn't explicitly left reopens by itself; otherwise resume it from the welcome page.
      if (!(await page.$('#pane-right .part'))) await click('[data-action="resume-exam"]');
      await ready();
    };
    const stroke = (pts) => page.evaluate((pts) => {
      const ev = (name, [x, y], t) => t.dispatchEvent(new PointerEvent(name, { pointerType: 'pen', pointerId: 7, isPrimary: true, clientX: x, clientY: y, button: name === 'pointermove' ? -1 : 0, buttons: name === 'pointerup' ? 0 : 1, bubbles: true, cancelable: true }));
      ev('pointerdown', pts[0], document.elementFromPoint(...pts[0]));
      pts.slice(1).forEach((p) => ev('pointermove', p, document.elementFromPoint(...p) || document));
      ev('pointerup', pts[pts.length - 1], document.elementFromPoint(...pts[pts.length - 1]) || document);
    }, pts);
    const line = ([x, y], dx, dy, n = 8) => Array.from({ length: n + 1 }, (_, i) => [x + dx * i / n, y + dy * i / n]);
    const shown = () => page.$$eval('#ink-right path:not(.live)', (p) => p.map((x) => ({ d: x.getAttribute('d'), style: x.getAttribute('style') || '' })));
    const saved = async (pid) => ((await st()).exam.handwriting || {})[pid] || [];
    const group = () => page.$eval('#pane-right', (p) => p.dataset.group);
    const go = async (dir, pid) => { await click(`[data-action="${dir}"]`); await page.waitForFunction((g) => document.querySelector('#pane-right').dataset.group === g, {}, pid); await wait(150); };
    const color = async (c) => { await click('[data-ann="pencolor"]'); await click(`#pen-colors [data-color="${c}"]`); };
    const rightBlank = () => page.$eval('#pane-right', (p) => { const r = p.getBoundingClientRect(); return [r.left + 12, r.top + 140]; });
    return { click, st, startExam, reloadResume, stroke, line, shown, saved, group, go, color, rightBlank };
  };

  // ── iPad: auto-save ──
  const pad = await open(true);
  const P = tools(pad);
  await P.startExam();
  ok((await P.group()) === 'sp25-4b', 'iPad exam started on sp25-4b');
  await P.click('[data-ann="pen"]');
  const rb = await P.rightBlank();
  await P.stroke(P.line(rb, 100, 40));                       // red, over the pane
  await P.color('blue');
  await P.stroke(P.line([rb[0] + 40, rb[1] + 90], 100, 20)); // blue, over the pane (clear of the toolbar)
  const box = await pad.$eval('#ta-sp25-4d', (t) => { const r = t.getBoundingClientRect(); return [r.left + 20, r.top + 10]; });
  await P.color('black');
  await P.stroke(P.line(box, 80, 5));                        // black, over an answer box
  const art = await pad.$eval('#problem-article .annot-text', (e) => { const r = e.getBoundingClientRect(); return [r.left + 40, r.top + 10]; });
  await P.color('blue');
  await P.stroke(P.line(art, 90, 25));                       // blue, on the question pane
  const code = await pad.$eval('.CodeMirror', (c) => { const r = c.getBoundingClientRect(); return [r.left + 30, r.top + 20]; });
  await P.stroke(P.line(code, 120, 10));                     // blue, over the coding area (under the question)
  let S = await P.saved('sp25-4b');
  ok(S.length === 3, `the three answer-pane strokes are saved with no Save button (${S.length})`);
  ok(!S[0].color && S[1].color === 'blue' && S[2].color === 'black', 'saved in drawing order with their colours (red stored without one)');
  ok(S.every((k) => k.kind === 'ink' && typeof k.id === 'string' && k.pts.length > 2 && k.pts.every((p) => p.length === 2 && p.every(Number.isFinite)) && k.w > 0), 'each stroke keeps its id, points and the pane width it was drawn at');
  let L = ((await P.st()).exam.annotations['sp25-4b'] || []).filter((a) => a.kind === 'pen');
  ok(L.length === 2 && L.every((a) => a.color === 'blue'), 'question-pane strokes, including over the coding area, are saved where they always were (annotations), in colour');
  ok(!JSON.stringify((await P.st()).exam.annotations).includes('"ink"'), 'answer-pane strokes are not duplicated into the question-pane annotations');
  const before = await P.shown();

  // Eraser / Undo / Redo are saved.
  await P.click('[data-ann="eraser"]');
  const mid = await pad.$eval('#ink-right path:nth-child(2)', (p) => { const pt = p.getPointAtLength(p.getTotalLength() / 2); const r = p.ownerSVGElement.getBoundingClientRect(); return [r.left + pt.x, r.top + pt.y]; });
  await P.stroke(P.line(mid, 0, 2, 2));
  S = await P.saved('sp25-4b');
  ok(S.length === 2 && !S.some((k) => k.color === 'blue'), 'Eraser: the erased stroke is gone from storage');
  await P.click('[data-ann="undo"]');
  ok((await P.saved('sp25-4b')).length === 3, 'Undo: it is saved again');
  await P.click('[data-ann="redo"]');
  ok((await P.saved('sp25-4b')).length === 2, 'Redo: erased again in storage');
  await P.click('[data-ann="undo"]');
  S = await P.saved('sp25-4b');

  // Another question: its own strokes, over the paper diagram.
  await P.click('[data-ann="pen"]');
  await P.go('next', 'fa24-2');
  await pad.waitForSelector('#dg-canvas');
  ok((await P.shown()).length === 0, 'the next question shows none of the first question’s strokes');
  const dg = await pad.$eval('#dg-canvas', (c) => { const r = c.getBoundingClientRect(); return [r.left + 60, r.top + 60]; });
  await P.color('red');
  await P.stroke(P.line(dg, 90, 30));
  ok((await P.saved('fa24-2')).length === 1 && (await P.saved('sp25-4b')).length === 3, 'diagram handwriting is saved under its own question; the first is untouched');
  const dgBefore = await P.shown();
  const dgRel = await pad.evaluate(() => { const c = document.querySelector('#dg-canvas').getBoundingClientRect(); const p = document.querySelector('#ink-right path').getBoundingClientRect(); return [Math.round(p.left - c.left), Math.round(p.top - c.top)]; });
  await P.go('prev', 'sp25-4b');
  ok((await P.shown()).length === 3, 'Back: the first question shows only its own three strokes');

  // ── Reload and reopen the same attempt ──
  const examId = (await P.st()).exam.id;
  await P.reloadResume();
  ok((await P.st()).exam.id === examId && (await P.group()) === 'sp25-4b', 'after a reload the same attempt reopens');
  const after = await P.shown();
  ok(after.length === 3, `after reload the answer-pane strokes are back (${after.length}), no duplicates`);
  const css = { blue: 'stroke:#1f5fd6', black: 'stroke:#1b1b1b' };
  ok(after.map((a) => a.style).join('|') === S.map((k) => css[k.color] || '').join('|'), 'colours and order match what was saved');
  ok(after.every((a) => before.some((b) => b.d === a.d)), 'every restored stroke is drawn at exactly the same place');
  L = ((await P.st()).exam.annotations['sp25-4b'] || []).filter((a) => a.kind === 'pen');
  ok(L.length === 2 && await pad.$$eval('#problem-article .annot-layer path', (p) => p.length) === 2, 'the question-pane strokes (coding area too) are restored as before');
  await P.go('next', 'fa24-2');
  await pad.waitForSelector('#dg-canvas');
  ok(JSON.stringify(await P.shown()) === JSON.stringify(dgBefore), 'the diagram question restores its own stroke, nothing else');
  const dgRel2 = await pad.evaluate(() => { const c = document.querySelector('#dg-canvas').getBoundingClientRect(); const p = document.querySelector('#ink-right path').getBoundingClientRect(); return [Math.round(p.left - c.left), Math.round(p.top - c.top)]; });
  ok(JSON.stringify(dgRel) === JSON.stringify(dgRel2), `it stays aligned with the diagram (${dgRel} → ${dgRel2})`);
  await P.go('prev', 'sp25-4b');
  ok((await P.shown()).length === 3 && (await P.saved('sp25-4b')).length === 3, 'navigating after restore duplicates nothing');
  await P.click('[data-ann="pen"]');
  await P.stroke(P.line(await P.rightBlank(), 60, 80));
  ok((await P.saved('sp25-4b')).length === 4, 'new strokes after restore add to the saved ones (nothing overwritten)');
  await P.click('[data-ann="undo"]');
  ok((await P.saved('sp25-4b')).length === 3, 'Undo after restore is saved');

  // Clear is saved, and Undo brings it back.
  await P.click('[data-ann="clear"]');
  const cleared = await P.st();
  ok(!(cleared.exam.handwriting || {})['sp25-4b'] && (cleared.exam.handwriting || {})['fa24-2'].length === 1, 'Clear: this question’s handwriting is removed from storage, the other question’s kept');
  await P.reloadResume();
  ok((await P.shown()).length === 0, 'after a reload the cleared question stays clear');
  await P.click('[data-ann="pen"]');
  await P.stroke(P.line(await P.rightBlank(), 100, 40));
  ok((await P.saved('sp25-4b')).length === 1, 'writing again after that is saved');

  // ── Storage full: answers keep saving, earlier handwriting kept ──
  await pad.evaluate(() => {
    const real = Storage.prototype.setItem;
    Storage.prototype.setItem = function (k, v) {
      const hw = (JSON.parse(v).exam || {}).handwriting || {};
      if ((hw['sp25-4b'] || []).length > 1) throw new DOMException('full', 'QuotaExceededError');
      return real.call(this, k, v);
    };
  });
  await P.stroke(P.line(await P.rightBlank(), 40, 120));
  ok((await P.shown()).length === 2, 'storage full: the new stroke still shows');
  await P.click('[data-ann="pen"]');
  await pad.click('#ta-sp25-4d'); await pad.keyboard.type('kept'); await wait(500);
  S = await P.st();
  ok(S.exam.answers['sp25-4d'] === 'kept' && S.exam.handwriting['sp25-4b'].length === 1 && S.exam.handwriting['fa24-2'].length === 1, 'storage full: answers still save, with the handwriting saved before');
  ok(pad.dialogs.filter((m) => /storage is full/i.test(m)).length === 1, 'the user is told once that new handwriting can’t be saved');
  ok(pad.errors.length === 0, `no errors from a full storage (${pad.errors.join(' | ')})`);

  // ── Attempt isolation: submit, then a new attempt of the same questions ──
  await P.reloadResume(); // fresh page, normal storage
  await P.click('[data-action="submit-exam"]'); await wait(600);
  const sub = await P.st();
  const att = sub.attempts.find((a) => a.id === examId);
  ok(!sub.exam && att && att.handwriting['sp25-4b'].length === 1 && att.handwriting['fa24-2'].length === 1, 'Submit: the attempt keeps its handwriting');
  ok(await pad.$$eval('#ink-right path', (p) => p.length).catch(() => 0) === 0, 'review/results show no Pencil ink (unchanged)');
  await pad.goto(APP_URL); await wait(150);
  await P.click('[data-action="enter"]'); await P.click('[data-action="start-exam"]');
  await pad.waitForSelector('#pane-right .part'); await wait(200);
  await pad.evaluate(() => { const b = document.querySelector('#annot-bar [data-ann="pen"][aria-pressed="true"]'); if (b) b.click(); }); await wait(80); // an iPad exam opens with the Pen on (default); these checks start with no tool
  const next = await P.st();
  ok(next.exam.id !== examId && (await P.group()) === 'sp25-4b' && (await P.shown()).length === 0 && !next.exam.handwriting, 'a new attempt of the same question starts with no handwriting');
  await P.reloadResume();
  ok((await P.shown()).length === 0 && next.attempts.find((a) => a.id === examId).handwriting['sp25-4b'].length === 1, '…even after a reload; the old attempt’s handwriting stays with it');

  // Damaged saved handwriting is cleaned, not fatal; strokes for other questions are dropped.
  await pad.evaluate((k) => { const s = JSON.parse(localStorage.getItem(k)); s.exam.handwriting = { 'sp25-4b': [{ id: 'z1', kind: 'ink', pts: [[10, 10], [40, 40]] }, { bad: 1 }, { id: 'z2', kind: 'ink', pts: [['x']] }], 'zz-nope': [{ id: 'z3', kind: 'ink', pts: [[1, 1]] }] }; localStorage.setItem(k, JSON.stringify(s)); Storage.prototype.setItem = function () {}; }, KEY);
  await P.reloadResume();
  ok((await P.shown()).length === 1, 'damaged records: only the good stroke is restored');
  ok(pad.errors.length === 0, `iPad: no console errors (${pad.errors.join(' | ')})`);
  await pad.close();

  // ── Desktop: never writes handwriting ──
  const desk = await open(false);
  const D = tools(desk);
  await D.startExam();
  await D.click('[data-ann="pen"]');
  const dArt = await desk.$eval('#problem-article .annot-text', (e) => { const r = e.getBoundingClientRect(); return [r.left + 40, r.top + 10]; });
  await desk.mouse.move(...dArt); await desk.mouse.down(); await desk.mouse.move(dArt[0] + 60, dArt[1] + 10, { steps: 6 }); await desk.mouse.up(); await wait(200);
  const ds = await D.st();
  ok(!('handwriting' in ds.exam) && ds.exam.annotations['sp25-4b'].filter((a) => a.kind === 'pen').length === 1, 'desktop exam: pen saves to annotations as before, no handwriting field');
  ok(desk.errors.length === 0, `desktop: no console errors (${desk.errors.join(' | ')})`);

  await browser.close();
  console.log(fails ? `\n${fails} failed` : '\nAll handwriting checks passed');
  process.exit(fails ? 1 : 0);
})().catch((e) => { console.error(e); process.exit(1); });
