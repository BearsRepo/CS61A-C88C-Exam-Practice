// iPad exams: sticky notes have no toolbar of their own. The main toolbar's Pen (with its colour), Eraser,
// Highlighter, Undo and Redo work in them; with no tool on a note is for typing. Notes are still made, typed in,
// moved, resized, minimized and deleted as before, and their ink is saved. New notes open a little bigger
// (300 × 210). Desktop notes keep their toolbar.
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
    const click = async (sel) => { await page.waitForSelector(sel, { visible: true, timeout: 8000 }); await page.click(sel); await wait(120); };
    const st = async () => { await wait(350); return page.evaluate((k) => JSON.parse(localStorage.getItem(k)), KEY); };
    const note = async () => ((await st()).exam.annotations[PID] || []).find((a) => a.kind === 'note');
    const startExam = async () => {
      await page.goto(APP_URL);
      await page.evaluate((k, v) => { localStorage.setItem(k, v); Storage.prototype.setItem = function () {}; }, KEY, JSON.stringify(EXAM));
      await page.goto(APP_URL); await wait(150);
      await click('[data-action="enter"]'); await click('[data-action="start-exam"]');
      await page.waitForSelector('#pane-right .part'); await wait(150);
    };
    const stroke = (pts, type = 'pen') => page.evaluate((pts, type) => {
      const ev = (name, [x, y], t) => t.dispatchEvent(new PointerEvent(name, { pointerType: type, pointerId: 1, isPrimary: true, clientX: x, clientY: y, button: name === 'pointermove' ? -1 : 0, buttons: name === 'pointerup' ? 0 : 1, bubbles: true, cancelable: true }));
      ev('pointerdown', pts[0], document.elementFromPoint(...pts[0]));
      pts.slice(1).forEach((p) => ev('pointermove', p, document.elementFromPoint(...p) || document));
      ev('pointerup', pts[pts.length - 1], document.elementFromPoint(...pts[pts.length - 1]) || document);
    }, pts, type);
    const line = ([x, y], dx, dy, n = 8) => Array.from({ length: n + 1 }, (_, i) => [x + dx * i / n, y + dy * i / n]);
    const body = (fx, fy) => page.$eval('.snote .snote-body', (b, fx, fy) => { const r = b.getBoundingClientRect(); return [r.left + r.width * fx, r.top + r.height * fy]; }, fx, fy);
    const pressed = () => page.$$eval('#annot-bar [data-ann][aria-pressed="true"]', (b) => b.map((x) => x.dataset.ann).join(','));
    const away = async () => { await page.mouse.click(600, 12); await wait(150); };
    const geo = () => page.evaluate(() => { // each note, the toolbar and the note layer, in viewport pixels
      const R = (e) => { const r = e.getBoundingClientRect(); return { l: r.left, t: r.top, r: r.right, b: r.bottom }; };
      const L = R(document.getElementById('note-layer'));
      const ft = document.querySelector('.p-footer').getBoundingClientRect().top;
      const vis = { l: Math.max(L.l, 0), t: Math.max(L.t, 0), r: Math.min(L.r, innerWidth), b: Math.min(L.b, innerHeight, ft > 0 ? ft : Infinity) };
      return { bar: R(document.getElementById('annot-bar')), layer: vis, notes: [...document.querySelectorAll('.snote')].map(R) };
    });
    const clear = (n, t) => n.r <= t.l || n.l >= t.r || n.b <= t.t || n.t >= t.b;
    const inside = (n, L) => n.l >= L.l - 0.5 && n.t >= L.t - 0.5 && n.r <= L.r + 0.5 && n.b <= L.b + 0.5;
    return { click, st, note, startExam, stroke, line, body, pressed, away, geo, clear, inside };
  };

  // ── iPad exam ──
  const pad = await open(true);
  const P = tools(pad);
  await P.startExam();
  ok((await P.pressed()) === 'pen', 'set-up: the exam opens with the Pen on');
  await P.click('[data-ann="note"]'); await wait(200);
  ok((await pad.$$('.snote')).length === 1, 'the note button makes a note');
  ok(!(await pad.$('.snote .snote-tools')) && !(await pad.$('.snote [data-nt]')), 'the note has no toolbar of its own (no Pen, Eraser, Undo, Redo, Tree or Clear in it)');
  ok((await pad.$$('#annot-bar [data-ann="pen"]')).length === 1, 'one Pen: the main toolbar\'s');
  const size = await pad.$eval('.snote', (n) => [n.offsetWidth, n.offsetHeight]);
  ok(size[0] === 300 && size[1] === 210, `a new note opens bigger: 300 × 210 (${size})`);
  ok((await P.pressed()) === '' && (await pad.$eval('.snote', (n) => n.dataset.tool)) === 'select', 'making a note turns the Pen off so you can type, as before');
  let G = await P.geo();
  // 1180 × 820: 694px of work area and a 300px toolbar leave no room for a 210px note above or below it.
  ok(G.bar.b + 20 + 210 > G.layer.b && G.bar.t - 20 - 210 < G.layer.t, 'set-up: no room above or below the toolbar on this screen');
  const side = G.bar.l - G.notes[0].r;
  ok(P.clear(G.notes[0], G.bar) && side >= 16 && side <= 24, `no room below: the new note goes beside the toolbar, 16–24px from it, not over it (${Math.round(side)}px)`);
  ok(P.inside(G.notes[0], G.layer), 'the whole note is visible in the work area');
  await pad.keyboard.type('hello note'); await P.away();
  let n = await P.note();
  ok(n && n.items.length === 1 && n.items[0].text === 'hello note', 'typing in the new note works and is saved');

  // The main Pen draws in the note.
  await P.click('[data-ann="pen"]');
  ok((await pad.$eval('.snote', (x) => x.dataset.tool)) === 'pen', 'main Pen on: the note is in pen mode');
  const leftPensBefore = ((await P.st()).exam.annotations[PID] || []).filter((a) => a.kind === 'pen').length;
  await P.stroke(P.line(await P.body(0.2, 0.75), 120, 6));
  n = await P.note();
  ok(n.ink && n.ink.length === 1 && !n.ink[0].color, 'a Pencil stroke in the note is saved on the note (default red, stored without a colour)');
  const S = await P.st();
  ok(((S.exam.annotations[PID] || []).filter((a) => a.kind === 'pen').length === leftPensBefore) && !((S.exam.handwriting || {})[PID] || []).length, '…and not on the page underneath');
  await P.click('[data-ann="pencolor"]'); await P.click('#pen-colors [data-color="blue"]');
  await P.stroke(P.line(await P.body(0.2, 0.9), 120, 0));
  n = await P.note();
  ok(n.ink.length === 2 && n.ink[1].color === 'blue', 'the main Pen\'s colour applies in the note (blue)');
  ok(await pad.$$eval('.snote .snote-ink path', (p) => p.length === 2 && !p[0].getAttribute('style') && /stroke/.test(p[1].getAttribute('style') || '')), 'the note shows red and blue strokes');

  // Eraser, Undo, Redo from the main toolbar.
  await P.click('[data-ann="eraser"]');
  ok((await pad.$eval('.snote', (x) => x.dataset.tool)) === 'eraser', 'main Eraser on: the note is in eraser mode');
  const first = n.ink[0].id;
  const p0 = await pad.$eval('.snote .snote-ink path', (p) => { const r = p.getBoundingClientRect(); return [r.left + r.width / 2, r.top + r.height / 2]; });
  await P.stroke(P.line(p0, 2, 0, 2));
  n = await P.note();
  ok(n.ink.length === 1 && n.ink[0].id !== first, 'the main Eraser erases the touched stroke in the note, not the other');
  await P.click('[data-ann="undo"]');
  n = await P.note();
  ok(n.ink.length === 2, 'main Undo brings it back');
  await P.click('[data-ann="redo"]');
  n = await P.note();
  ok(n.ink.length === 1, 'main Redo erases it again');
  await P.click('[data-ann="hl"]');
  ok((await pad.$eval('.snote', (x) => x.dataset.tool)) === 'hl', 'main Highlighter on: the note is in highlighter mode');
  await P.click('[data-ann="hl"]');
  ok((await pad.$eval('.snote', (x) => x.dataset.tool)) === 'select', 'no tool: the note is for typing again');

  // Move, resize, minimize still work.
  const before = await pad.$eval('.snote', (x) => [x.offsetLeft, x.offsetTop, x.offsetWidth, x.offsetHeight]);
  const bar = await pad.$eval('.snote .snote-title', (t) => { const r = t.getBoundingClientRect(); return [r.left + 5, r.top + r.height / 2]; });
  await pad.mouse.move(...bar); await pad.mouse.down(); await pad.mouse.move(bar[0] - 60, bar[1] + 40, { steps: 6 }); await pad.mouse.up(); await wait(200);
  const moved = await pad.$eval('.snote', (x) => [x.offsetLeft, x.offsetTop]);
  ok(Math.abs(moved[0] - (before[0] - 60)) <= 2 && Math.abs(moved[1] - (before[1] + 40)) <= 2, `dragging the note's bar moves it (${before} → ${moved})`);
  const grip = await pad.$eval('.snote .snote-size', (g) => { const r = g.getBoundingClientRect(); return [r.left + r.width / 2, r.top + r.height / 2]; });
  await pad.mouse.move(...grip); await pad.mouse.down(); await pad.mouse.move(grip[0] + 50, grip[1] + 30, { steps: 6 }); await pad.mouse.up(); await wait(200);
  const sized = await pad.$eval('.snote', (x) => [x.offsetWidth, x.offsetHeight]);
  ok(sized[0] >= before[2] + 45 && sized[1] >= before[3] + 25, 'dragging the corner resizes it');
  n = await P.note();
  ok(n.w === sized[0] && n.h === sized[1], 'the new size is saved');
  await P.click('.snote [data-nd="min"]'); await wait(500);
  ok((await pad.$$('.dock-note')).length === 1, 'minimize still works');
  await P.click('.dock-note'); await wait(500);
  ok((await pad.$$('.snote')).length === 1, '…and the note comes back');

  // Persistence, and the tool following the main toolbar across questions.
  await P.click('[data-ann="pen"]');
  await P.click('[data-action="next"]'); await wait(200);
  await P.click('[data-action="prev"]'); await pad.waitForSelector('.snote'); await wait(200);
  ok((await pad.$eval('.snote', (x) => x.dataset.tool)) === 'pen' && !(await pad.$('.snote .snote-tools')), 'back on the question: the note follows the main Pen, still no toolbar');
  await pad.reload(); await wait(400);
  if (!(await pad.$('#pane-right .part'))) await P.click('[data-action="resume-exam"]');
  await pad.waitForSelector('.snote'); await wait(200);
  n = await P.note();
  ok(n.ink.length === 1 && n.ink[0].color === 'blue' && n.items[0].text === 'hello note' && (await pad.$$('.snote .snote-ink path')).length === 1, 'after a reload the note keeps its text and ink (colour too)');
  ok(!(await pad.$('.snote .snote-tools')) && (await pad.$eval('.snote', (x) => x.dataset.tool)) === 'pen', 'after a reload: no note toolbar, and the default Pen works in the note');
  await P.click('.snote [data-nd="delete"]'); await wait(200);
  ok(!(await pad.$('.snote')) && !(await P.note()), 'deleting the note still works');
  // A second and third note: still clear of the toolbar and wholly visible, the first one not moved.
  await P.click('[data-ann="note"]'); await wait(200); await P.away();
  const firstAt = (await P.geo()).notes[0];
  await P.click('[data-ann="note"]'); await wait(200); await P.away();
  G = await P.geo();
  ok(G.notes.length === 2 && G.notes.every((n) => P.clear(n, G.bar) && P.inside(n, G.layer)), 'another new note is also clear of the toolbar and inside the work area');
  ok(Math.abs(G.notes[0].l - firstAt.l) < 1 && Math.abs(G.notes[0].t - firstAt.t) < 1, 'making a note doesn\'t move the notes already there');
  ok(Math.abs(G.notes[1].l - G.notes[0].l) >= 12 || Math.abs(G.notes[1].t - G.notes[0].t) >= 12, 'it doesn\'t sit exactly on the other new note');
  // A taller screen (12.9-inch iPad landscape): there is room, so the note goes below the toolbar.
  await pad.setViewport({ width: 1366, height: 1024 }); await wait(300);
  await P.click('[data-ann="note"]'); await wait(200); await P.away();
  G = await P.geo();
  const tall = G.notes[G.notes.length - 1];
  const gap = tall.t - G.bar.b;
  ok(gap >= 16 && gap <= 24 && P.clear(tall, G.bar) && P.inside(tall, G.layer), `room below: the new note is below the toolbar, 16–24px under it, wholly visible (gap ${Math.round(gap)}px)`);
  ok(Math.abs((tall.l + tall.r) / 2 - (G.bar.l + G.bar.r) / 2) < 3, '…centred under it');
  // Portrait: the toolbar is a row near the bottom; a new note still avoids it.
  await pad.setViewport({ width: 820, height: 1180 }); await wait(300);
  await P.click('[data-ann="note"]'); await wait(200); await P.away();
  G = await P.geo();
  const newest = G.notes[G.notes.length - 1];
  ok(P.clear(newest, G.bar) && P.inside(newest, G.layer), `portrait: a new note is clear of the toolbar and inside the work area (${JSON.stringify(newest)} vs ${JSON.stringify(G.bar)})`);
  await pad.setViewport({ width: 1180, height: 820 }); await wait(300);
  ok(pad.errors.length === 0, `iPad: no console errors (${pad.errors.join(' | ')})`);
  await pad.close();

  // ── Desktop exam: the note keeps its own toolbar ──
  const desk = await open(false);
  const D = tools(desk);
  await D.startExam();
  await D.click('[data-ann="note"]'); await wait(200);
  ok(!!(await desk.$('.snote .snote-tools [data-nt="pen"]')) && !!(await desk.$('.snote [data-nt="tree"]')), 'desktop: the note keeps its own toolbar (Pen, Tree, …)');
  const dsize = await desk.$eval('.snote', (x) => [x.offsetWidth, x.offsetHeight]);
  ok(dsize[0] === 300 && dsize[1] === 210, `desktop: a new note is also 300 × 210 (${dsize})`);
  const dmid = await desk.evaluate(() => { const l = document.getElementById('note-layer').getBoundingClientRect(), n = document.querySelector('.snote').getBoundingClientRect(); return [n.left + n.width / 2 - (l.left + l.width / 2), n.top + n.height / 2 - (l.top + l.height / 2)]; });
  ok(Math.abs(dmid[0]) < 3 && Math.abs(dmid[1]) < 3, `desktop: a new note still opens in the middle (${dmid.map(Math.round)})`);
  await D.click('.snote [data-nt="pen"]');
  ok((await desk.$eval('.snote', (x) => x.dataset.tool)) === 'pen' && (await D.pressed()) === '', `desktop: the note's own Pen works separately from the main toolbar (${await desk.$eval('.snote', (x) => x.dataset.tool)}, '${await D.pressed()}')`);
  ok(desk.errors.length === 0, `desktop: no console errors (${desk.errors.join(' | ')})`);
  await desk.close();

  await browser.close();
  console.log(fails ? `\n${fails} FAILED` : '\nALL PASSED');
  process.exit(fails ? 1 : 0);
})().catch((e) => { console.error(e); process.exit(1); });
