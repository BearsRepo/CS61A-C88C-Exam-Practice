// iPad Practice Mode works like an iPad exam: the same toolbar on the divider (same place, width and controls), the Pen
// on when the set opens, the Pencil on both panes, fingers scroll and draw nothing, Eraser / Undo / Redo / Clear,
// strokes kept per question and across a reload (answer-pane strokes in store.session.handwriting); sticky notes use
// the main toolbar and toolbar-aware placement; code strokes follow horizontal scrolling. There is no Check Answer;
// Show Solution stays, and the handwriting below a solution moves down with its part. Desktop practice is unchanged.
const puppeteer = require('puppeteer-core');
const { APP_URL, CHROME, skipTour } = require('./config');
const KEY = 'cs61a-practice:v1';
let fails = 0;
const ok = (c, m) => { console.log(`${c ? 'PASS' : 'FAIL'}  ${m}`); if (!c) fails++; };
const wait = (ms) => new Promise((r) => setTimeout(r, ms));
const IPAD_UA = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.0 Safari/605.1.15';
const EXAM = { version: 5, prefs: { mode: 'exam' }, examPrefs: { kind: 'custom', topics: [], picked: ['sp25-4b', 'fa24-2'], timerOn: true, minutes: 120 } };
const PRACTICE = { version: 5, prefs: { mode: 'practice' }, session: { ids: ['sp25-4d', 'sp25-4e', 'sp25-4f', 'fa24-2a'], index: 0, title: 'x', answers: {}, timer: null, startedAt: Date.now(), finished: false, notes: {}, annotations: {} } };
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
    const click = async (sel) => { await page.waitForSelector(sel, { visible: true, timeout: 8000 }); await page.click(sel); await wait(120); };
    const st = async () => { await wait(350); return page.evaluate((k) => JSON.parse(localStorage.getItem(k)), KEY); };
    const seed = async (rec) => {
      await page.goto(APP_URL);
      await page.evaluate((k, v) => { localStorage.setItem(k, v); Storage.prototype.setItem = function () {}; }, KEY, JSON.stringify(rec));
      await page.goto(APP_URL); await wait(150);
      await click('[data-action="enter"]');
    };
    const startPractice = async () => { await seed(PRACTICE); await click('.resume [data-action="resume"]'); await page.waitForSelector('#pane-right .part'); await wait(200); };
    const stroke = (pts, type = 'pen') => page.evaluate((pts, type) => {
      const ev = (name, [x, y], t) => t.dispatchEvent(new PointerEvent(name, { pointerType: type, pointerId: 7, isPrimary: true, clientX: x, clientY: y, button: name === 'pointermove' ? -1 : 0, buttons: name === 'pointerup' ? 0 : 1, bubbles: true, cancelable: true }));
      ev('pointerdown', pts[0], document.elementFromPoint(...pts[0]));
      pts.slice(1).forEach((p) => ev('pointermove', p, document.elementFromPoint(...p) || document));
      ev('pointerup', pts[pts.length - 1], document.elementFromPoint(...pts[pts.length - 1]) || document);
    }, pts, type);
    const tap = (sel) => page.$eval(sel, (el) => { // a Pencil tap: down and up in place
      el.scrollIntoView({ block: 'center' });
      const r = el.getBoundingClientRect();
      const [x, y] = [r.left + r.width / 2, r.top + r.height / 2];
      const ev = (name) => document.elementFromPoint(x, y).dispatchEvent(new PointerEvent(name, { pointerType: 'pen', pointerId: 7, isPrimary: true, clientX: x, clientY: y, button: 0, buttons: name === 'pointerup' ? 0 : 1, bubbles: true, cancelable: true }));
      ev('pointerdown'); ev('pointerup');
    }, sel);
    const line = ([x, y], dx, dy, n = 8) => Array.from({ length: n + 1 }, (_, i) => [x + dx * i / n, y + dy * i / n]);
    const barRect = () => page.$eval('#annot-bar', (b) => { const r = b.getBoundingClientRect(); return [r.left, r.top, r.width, r.height].map(Math.round); });
    const barTools = () => page.$$eval('#annot-bar [data-ann]', (b) => b.map((x) => x.dataset.ann).join(','));
    const rightInk = () => page.$$eval('#ink-right path:not(.live)', (p) => p.length);
    const leftInk = () => page.$$eval('#problem-article .annot-layer path:not(.live)', (p) => p.length);
    const prose = () => page.$eval('#problem-article .annot-text', (e) => { const r = e.getBoundingClientRect(); return [r.left + 40, r.top + 10]; });
    const rightBlank = () => page.$eval('#pane-right', (p) => { const r = p.getBoundingClientRect(); return [r.left + 12, r.top + 140]; });
    const group = () => page.$eval('#pane-right', (p) => p.dataset.group);
    const freeRight = () => page.evaluate(() => {
      const r = document.getElementById('pane-right').getBoundingClientRect();
      const busy = (x, y) => { const e = document.elementFromPoint(x, y); return !e || !!e.closest('button, a, label, input, textarea, select, [data-action], .choice, .CodeMirror, #annot-bar'); };
      for (let y = r.top + 200; y < r.bottom - 20; y += 8) { const x = r.left + 12; if ([0, 30, 60, 90, 110].every((dx) => !busy(x + dx, y))) return [x, y]; }
      return null;
    });
    return { click, st, seed, startPractice, stroke, tap, line, barRect, barTools, rightInk, leftInk, prose, rightBlank, group, freeRight };
  };

  // The exam's toolbar, for comparison.
  const pad = await open(true);
  const P = tools(pad);
  await P.seed(EXAM); await P.click('[data-action="start-exam"]'); await pad.waitForSelector('#pane-right .part'); await wait(200);
  const examBar = await P.barRect();
  const examTools = await P.barTools();

  // ── iPad practice: the same toolbar ──
  await P.startPractice();
  ok(await pad.$eval('.p-main', (m) => m.classList.contains('pencil-ink')) && !!(await pad.$('#ink-right')), 'iPad practice: Pencil drawing is on (answer-pane ink layer present)');
  const pb = await P.barRect();
  ok(pb[0] === examBar[0] && pb[2] === examBar[2] && Math.abs((pb[1] + pb[3] / 2) - (examBar[1] + examBar[3] / 2)) <= 1,
    `the toolbar has the exam's place, width and centre; only the exam's two extra buttons make it taller (${pb} vs ${examBar})`);
  const ptools = await P.barTools();
  ok(ptools === examTools.replace(',settings', '').replace(',autofill', '') || ptools === examTools, `same controls (${ptools} | exam: ${examTools})`);
  ok((await pad.$$('#annot-bar')).length === 1 && (await pad.$$('[data-ann="pen"]')).length === 1, 'one toolbar, no second Practice toolbar');
  const divider = await pad.$eval('#pane-left', (p) => p.getBoundingClientRect().right);
  ok(Math.abs(examBar[0] + examBar[2] / 2 - divider) < 3, 'it sits on the divider between the panes');
  ok(await pad.evaluate(() => { // nothing it can cover: answer boxes, options, buttons, the problem text and code
    const b = document.getElementById('annot-bar').getBoundingClientRect();
    return [...document.querySelectorAll('#pane-right :is(textarea, input, label, button, .choice), #problem-article :is(p, .CodeMirror, h2)')]
      .every((e) => { const r = e.getBoundingClientRect(); return !r.width || r.right <= b.left || r.left >= b.right || r.bottom <= b.top || r.top >= b.bottom; });
  }), 'it covers no question content, answer box, option or button');
  ok((await pad.$$eval('#annot-bar [data-ann][aria-pressed="true"]', (b) => b.map((x) => x.dataset.ann).join())) === 'pen', 'practice opens with the Pen on, as an exam does');
  ok(await pad.$eval('#pen-color-btn', (b) => /Red/.test(b.getAttribute('aria-label'))), '…in red');

  // ── Drawing ──
  await P.stroke(P.line(await P.prose(), 90, 20));
  await P.stroke(P.line(await P.rightBlank(), 110, 30));
  let S = await P.st();
  ok((await P.leftInk()) === 1 && (S.session.annotations[PID] || []).filter((a) => a.kind === 'pen').length === 1, 'the Pencil draws on the question (saved with the practice set)');
  ok((await P.rightInk()) === 1 && (S.session.handwriting[PID] || []).length === 1, 'the Pencil draws on the answer pane (saved in session.handwriting)');
  ok(!S.exam || !((S.exam.handwriting || {})[PID] || []).length, 'nothing goes to the exam in progress');
  await P.stroke(P.line(await P.rightBlank(), 40, 200), 'touch');
  await P.stroke(P.line(await P.prose(), 40, 60), 'touch');
  ok((await P.rightInk()) === 1 && (await P.leftInk()) === 1, 'finger touches draw nothing (they scroll)');
  ok(!(await pad.evaluate(([x, y]) => document.elementFromPoint(x, y).classList.contains('annot-layer'), await P.prose())), 'the left overlay doesn\'t catch fingers');
  await P.click('[data-ann="pencolor"]'); await P.click('#pen-colors [data-color="blue"]');
  const fr = await P.freeRight();
  ok(!!fr, 'set-up: an empty spot for a second stroke');
  await P.stroke(P.line(fr, 110, 0));
  S = await P.st();
  ok(S.session.handwriting[PID].length === 2 && S.session.handwriting[PID][1].color === 'blue', 'the pen colour works');
  await P.click('[data-ann="eraser"]');
  await P.stroke(P.line([fr[0] + 55, fr[1]], 2, 0, 2));
  S = await P.st();
  ok(S.session.handwriting[PID].length === 1, 'the Eraser erases an answer-pane stroke');
  await P.click('[data-ann="undo"]');
  ok((await P.st()).session.handwriting[PID].length === 2, 'Undo brings it back');
  await P.click('[data-ann="redo"]');
  ok((await P.st()).session.handwriting[PID].length === 1, 'Redo erases it again');
  await P.click('[data-ann="hl"]');
  ok(await pad.$eval('#problem-article', (a) => a.dataset.mode === 'hl'), 'the Highlighter can be picked');
  await P.click('[data-ann="hl"]');

  // ── Practice answers: typing, no Check Answer, Show Solution ──
  await pad.click('#ta-sp25-4d'); await pad.keyboard.type('typed in practice'); await wait(400);
  ok((await P.st()).session.answers['sp25-4d'] === 'typed in practice', 'with the Pen off, typing an answer works and is saved');
  await pad.$eval('label[for="c-sp25-4e-1"]', (l) => l.scrollIntoView({ block: 'center' }));
  await P.click('label[for="c-sp25-4e-1"]');
  ok(!(await pad.$('#pane-right [data-action="check"]')) && (await pad.$$('#pane-right [data-action="reveal"]')).length === 3, 'no Check Answer on any part (an option chosen too); Show Solution on every part');
  await P.click('[data-ann="pen"]'); // pen on: answer boxes are paper
  ok(await pad.$eval('#ta-sp25-4d', (t) => t.readOnly), 'with the pen on, the answer box is paper');
  // Handwriting on the later parts, then the first part's solution opens above them.
  const near = (sel) => pad.$eval(sel, (e) => { e.scrollIntoView({ block: 'center' }); const r = e.getBoundingClientRect(); return [r.left + 30, r.top + r.height / 2]; });
  await P.stroke(P.line(await near('label[for="c-sp25-4f-0"]'), 120, 4));
  await P.stroke(P.line(await near('#ta-sp25-4d'), 90, 3));
  S = await P.st();
  const before = S.session.handwriting[PID].map((k) => JSON.stringify(Object.keys(k).sort()));
  const offsets = () => pad.evaluate(() => { // each stroke's top, relative to its part's top
    const paths = [...document.querySelectorAll('#ink-right path:not(.live)')];
    const part = (y) => [...document.querySelectorAll('#pane-right .part')].filter((p) => p.getBoundingClientRect().top <= y).pop();
    return paths.map((p) => { const r = p.getBoundingClientRect(); const pt = part(r.top + r.height / 2); return pt ? [pt.dataset.part, Math.round(r.top - pt.getBoundingClientRect().top)] : null; });
  });
  const o1 = await offsets();
  const same = (a, b) => a.length === b.length && a.every((x, i) => x && b[i] && x[0] === b[i][0] && Math.abs(x[1] - b[i][1]) <= 1.5);
  const fTop = () => pad.$eval('#part-sp25-4f', (p) => p.getBoundingClientRect().top - document.getElementById('pane-right').getBoundingClientRect().top + document.getElementById('pane-right').scrollTop);
  const f0 = await fTop();
  await P.tap('#part-sp25-4d [data-action="reveal"]'); await wait(250);
  ok(!!(await pad.$('#pane-right [data-action="reveal-yes"]')), 'a Pencil tap on Show Solution asks to confirm, as before');
  await P.tap('#pane-right [data-action="reveal-yes"]'); await wait(300);
  S = await P.st();
  ok(S.session.revealed['sp25-4d'] && await pad.$eval('#problem-article', (a) => a.dataset.mode === 'pen'), 'a Pencil tap on Yes shows the solution, with the Pen still on');
  const f1 = await fTop();
  ok(f1 - f0 > 40, `set-up: the solution pushes the next parts down (${Math.round(f1 - f0)}px)`);
  const o2 = await offsets();
  ok(same(o1, o2), `every stroke stays on its part: those below the solution move down with theirs (${JSON.stringify(o1)} → ${JSON.stringify(o2)})`);
  ok((await P.rightInk()) === 3 && JSON.stringify(S.session.handwriting[PID].map((k) => JSON.stringify(Object.keys(k).sort()))) === JSON.stringify(before), 'all handwriting is kept, in the same saved format');
  ok(await pad.$eval('#ta-sp25-4d', (t) => t.value === 'typed in practice'), 'the typed answer is kept after Show Solution');

  // ── Per question, and after a reload ──
  await P.click('[data-action="next"]'); await pad.waitForFunction((g) => document.querySelector('#pane-right').dataset.group !== g, {}, PID); await wait(200);
  ok((await P.rightInk()) === 0 && (await P.leftInk()) === 0, 'the next question starts with no strokes');
  await P.click('[data-action="prev"]'); await pad.waitForFunction((g) => document.querySelector('#pane-right').dataset.group === g, {}, PID); await wait(200);
  ok((await P.rightInk()) === 3 && (await P.leftInk()) === 1, 'back: this question\'s strokes, once each');
  await pad.goto(APP_URL); await wait(300);
  if (await pad.$('[data-action="enter"]')) await P.click('[data-action="enter"]');
  if (!(await pad.$('#pane-right .part'))) await P.click('.resume [data-action="resume"]');
  await pad.waitForSelector('#pane-right .part'); await wait(300);
  ok((await P.group()) === PID && (await P.rightInk()) === 3 && (await P.leftInk()) === 1, 'after a reload the strokes are back');
  ok(same(o1, await offsets()), 'after a reload they are still on their parts, below the solution');
  ok(await pad.$eval('#annot-bar [data-ann="pen"]', (b) => b.getAttribute('aria-pressed') === 'true'), 'after a reload the Pen is on again');
  await P.click('[data-ann="clear"]'); await wait(200);
  S = await P.st();
  ok((await P.rightInk()) === 0 && (await P.leftInk()) === 0 && !(S.session.handwriting || {})[PID], 'Clear removes both panes\' strokes');
  await P.click('[data-ann="undo"]');
  ok((await P.rightInk()) === 3 && (await P.leftInk()) === 1, 'Undo restores both');

  // ── Sticky notes: the exam's (main toolbar, placement, size) ──
  await P.click('[data-ann="note"]'); await wait(200);
  const ng = await pad.evaluate(() => { const R = (e) => e.getBoundingClientRect(); const n = R(document.querySelector('.snote')), b = R(document.getElementById('annot-bar')); return { w: Math.round(n.width), h: Math.round(n.height), clear: n.right <= b.left || n.left >= b.right || n.bottom <= b.top || n.top >= b.bottom, tools: !!document.querySelector('.snote .snote-tools') }; });
  ok(!ng.tools && ng.w === 300 && ng.h === 210 && ng.clear, `a note has no toolbar of its own, is 300 × 210 and clear of the toolbar (${JSON.stringify(ng)})`);
  ok((await pad.$$eval('#annot-bar [data-ann][aria-pressed="true"]', (b) => b.length)) === 0, 'making a note turns the Pen off for typing, as in an exam');
  await pad.keyboard.type('practice note'); await pad.mouse.click(600, 12); await wait(150);
  await P.click('[data-ann="pen"]');
  ok(await pad.$eval('.snote', (n) => n.dataset.tool === 'pen'), 'the main Pen draws in the note');
  const nb = await pad.$eval('.snote .snote-body', (b) => { const r = b.getBoundingClientRect(); return [r.left + 30, r.top + r.height * 0.8]; });
  await pad.evaluate(([x, y]) => { // pointerId 1: the note captures the pointer, as with a real Pencil
    const ev = (name, px) => document.elementFromPoint(px, y).dispatchEvent(new PointerEvent(name, { pointerType: 'pen', pointerId: 1, isPrimary: true, clientX: px, clientY: y, button: name === 'pointermove' ? -1 : 0, buttons: name === 'pointerup' ? 0 : 1, bubbles: true, cancelable: true }));
    ev('pointerdown', x); for (let i = 1; i <= 6; i++) ev('pointermove', x + i * 15); ev('pointerup', x + 90);
  }, nb); await wait(200);
  const note = ((await P.st()).session.annotations[PID] || []).find((a) => a.kind === 'note');
  ok(note && note.items[0].text === 'practice note' && (note.ink || []).length === 1, 'the note keeps its text and the Pencil stroke');
  await P.click('[data-ann="undo"]');
  ok(!((((await P.st()).session.annotations[PID] || []).find((a) => a.kind === 'note') || {}).ink || []).length, 'the main Undo takes the note stroke back');
  await P.click('.snote [data-nd="delete"]'); await wait(200);

  // ── Code strokes follow horizontal scrolling (the exam's fix) ──
  await pad.evaluate(() => { const cm = document.querySelector('.CodeMirror').CodeMirror; cm.setValue(`${cm.getValue()}\n# ${'wide '.repeat(80)}`); });
  const cp = await pad.evaluate(() => { document.querySelector('.CodeMirror').scrollIntoView({ block: 'center' }); const r = document.querySelector('.CodeMirror-line').getBoundingClientRect(); const g = document.querySelector('.CodeMirror-gutters').getBoundingClientRect(); return [g.right + 60, r.top + r.height / 2]; });
  await P.stroke(P.line(cp, 80, 0));
  const code = ((await P.st()).session.annotations[PID] || []).filter((a) => a.kind === 'pen').pop();
  ok(code && code.sx === 0, 'a stroke on the code records the editor scroll (sx), as in an exam');
  const cx = () => pad.evaluate((id) => Number(document.querySelector(`#problem-article .annot-layer path[data-aid="${id}"]`).getAttribute('d').slice(1).split(' ')[0]), code.id);
  const x0 = await cx();
  await pad.evaluate(async () => { document.querySelector('.CodeMirror').CodeMirror.scrollTo(100, null); await new Promise((r) => setTimeout(r, 120)); });
  ok(Math.abs((await cx()) - (x0 - 100)) < 1.5, 'scrolling the code sideways moves the stroke with it');

  // ── Portrait: the same row near the bottom as in an exam ──
  await pad.setViewport({ width: 820, height: 1180 }); await wait(300);
  ok(await pad.$eval('#annot-bar', (b) => getComputedStyle(b).position === 'fixed' && getComputedStyle(b).flexDirection === 'row'), 'portrait: the toolbar becomes the row above the bottom bar, as in an exam');
  await pad.setViewport({ width: 1180, height: 820 }); await wait(300);
  ok(pad.errors.length === 0, `iPad: no console errors (${pad.errors.join(' | ')})`);
  await pad.close();

  // ── Desktop practice: unchanged ──
  const desk = await open(false);
  const D = tools(desk);
  await D.startPractice();
  ok(!(await desk.$eval('.p-main', (m) => m.classList.contains('pencil-ink'))) && !(await desk.$('#ink-right')) && !(await desk.$('#pen-colors')), 'desktop practice: no Pencil mode, no answer-pane ink layer, no colour menu');
  ok(await desk.$eval('#annot-bar', (b) => getComputedStyle(b).position === 'sticky'), 'desktop practice: the toolbar stays at the top of the left pane');
  await D.click('[data-ann="pen"]');
  ok(await desk.evaluate(() => !document.querySelector('#ta-sp25-4d').readOnly), 'desktop practice: answer boxes stay editable with the pen on');
  ok((await desk.$$eval('#annot-bar [data-ann][aria-pressed="true"]', (b) => b.map((x) => x.dataset.ann).join())) === 'pen', 'desktop practice: the set opened with no tool (Pen on only from the click)');
  ok((await desk.$$('#pane-right [data-action="check"]')).length > 0, 'desktop practice: Check Answer is still there');
  await D.click('[data-ann="pen"]');
  await D.click('[data-ann="note"]'); await wait(200);
  ok(!!(await desk.$('.snote .snote-tools [data-nt="pen"]')), 'desktop practice: a note keeps its own toolbar');
  ok(desk.errors.length === 0, `desktop: no console errors (${desk.errors.join(' | ')})`);
  await desk.close();

  await browser.close();
  console.log(fails ? `\n${fails} FAILED` : '\nALL PASSED');
  process.exit(fails ? 1 : 0);
})().catch((e) => { console.error(e); process.exit(1); });
