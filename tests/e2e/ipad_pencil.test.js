// iPad: the site turns on Apple Pencil annotation by itself on an iPad (iPadOS Safari reports a Mac user agent, so
// it is recognized by a Mac platform with touch points). During an exam the existing red pen and eraser draw on
// both panes with the Pencil (or a mouse / trackpad); fingers still scroll and tap; a Pencil tap on an option still
// selects it, and a drag that starts on one draws instead. Right-pane strokes share Undo / Redo / Clear and are not
// saved. Desktop is unchanged; iPad practice uses the same drawing (Task 5).
// Real Pencil input can't be produced here, so pen strokes are synthetic PointerEvents with pointerType "pen";
// mouse input (page.mouse) takes the same path.
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
    const center = (sel) => page.$eval(sel, (e) => { const r = e.getBoundingClientRect(); return [r.left + r.width / 2, r.top + r.height / 2]; });
    const startExam = async () => {
      await page.goto(APP_URL);
      await page.evaluate((k, v) => { localStorage.setItem(k, v); Storage.prototype.setItem = function () {}; }, KEY, JSON.stringify(EXAM)); // the page being left can't save over it
      await page.goto(APP_URL); await wait(150);
      await click('[data-action="enter"]'); await click('[data-action="start-exam"]');
      await page.waitForSelector('#pane-right .part'); await page.waitForSelector('.CodeMirror');
      await page.evaluate(() => { const b = document.querySelector('#annot-bar [data-ann="pen"][aria-pressed="true"]'); if (b) b.click(); }); await wait(80); // an iPad exam opens with the Pen on (default); these checks start with no tool
    };
    // A synthetic stroke: pointerdown on whatever is under the first point, then moves and up on the document.
    const stroke = (type, pts) => page.evaluate((type, pts) => {
      const ev = (name, [x, y], t) => t.dispatchEvent(new PointerEvent(name, { pointerType: type, pointerId: 7, isPrimary: true, clientX: x, clientY: y, button: name === 'pointermove' ? -1 : 0, buttons: name === 'pointerup' ? 0 : 1, bubbles: true, cancelable: true }));
      const down = document.elementFromPoint(...pts[0]);
      ev('pointerdown', pts[0], down);
      pts.slice(1).forEach((p) => ev('pointermove', p, document.elementFromPoint(...p) || document));
      ev('pointerup', pts[pts.length - 1], document.elementFromPoint(...pts[pts.length - 1]) || document);
    }, type, pts);
    const line = ([x, y], dx, dy, n = 8) => Array.from({ length: n + 1 }, (_, i) => [x + dx * i / n, y + dy * i / n]);
    const mouseDrag = async ([x, y], dx, dy) => {
      await page.mouse.move(x, y); await page.mouse.down();
      for (let i = 1; i <= 8; i++) { await page.mouse.move(x + dx * i / 8, y + dy * i / 8); await wait(10); }
      await page.mouse.up(); await wait(150);
    };
    const rightInk = () => page.$$eval('#ink-right path:not(.live)', (p) => p.length);
    const leftPens = async () => ((await st()).exam.annotations['sp25-4b'] || []).filter((a) => a.kind === 'pen').length;
    // An empty spot in the right pane: the pane's own padding beside the first part.
    const rightBlank = () => page.$eval('#pane-right', (p) => { const r = p.getBoundingClientRect(); return [r.left + 12, r.top + 140]; });
    return { click, st, center, startExam, stroke, line, mouseDrag, rightInk, leftPens, rightBlank };
  };

  // ── Desktop: nothing changes ──
  const desk = await open(false);
  const D = tools(desk);
  await D.startExam();
  ok(!(await desk.$eval('html', (h) => h.classList.contains('ipad'))) && !(await desk.$('#ink-right')), 'desktop: not treated as an iPad, no right-pane ink layer');
  await D.click('[data-ann="pen"]');
  ok(!(await desk.$eval('.p-main', (m) => m.classList.contains('pencil-ink'))), 'desktop exam: Pencil mode stays off');
  const dArt = await desk.$eval('#problem-article .annot-text', (e) => { const r = e.getBoundingClientRect(); return [r.left + 40, r.top + 10]; });
  ok(await desk.evaluate(([x, y]) => document.elementFromPoint(x, y).classList.contains('annot-layer'), dArt), 'desktop: in pen mode the left overlay still catches the mouse');
  await D.mouseDrag(dArt, 80, 20);
  ok((await D.leftPens()) === 1, 'desktop: drawing on the left pane still saves a red-pen stroke');
  ok((await desk.$eval('#annot-hint', (h) => h.textContent)) === 'Draw with the mouse or trackpad. Scrolling still works.', 'desktop: pen hint unchanged');
  const deskRects = await desk.$$eval('#right-body *', (els) => els.slice(0, 80).map((e) => { const r = e.getBoundingClientRect(); return [Math.round(r.left), Math.round(r.top), Math.round(r.width), Math.round(r.height)].join(','); }));
  ok(await desk.evaluate(() => { const ta = document.querySelector('#ta-sp25-4d'); return !ta.readOnly && document.querySelector('.CodeMirror').CodeMirror.getOption('readOnly') === false; }), 'desktop: in pen mode the code editor and answer boxes stay editable');
  await D.click('[data-ann="pen"]');
  await D.click('[data-action="next"]');
  await desk.waitForSelector('#dg-canvas');
  ok(await desk.$eval('#dg-bar', (b) => b.offsetParent !== null) && await desk.$eval('#dg-canvas', (c) => getComputedStyle(c).pointerEvents !== 'none'), 'desktop exam: the environment diagram keeps its own toolkit and editing');
  ok(!(await desk.$('#pen-colors')) && await desk.$eval('#annot-bar', (b) => getComputedStyle(b).position === 'sticky' && getComputedStyle(b).flexDirection === 'row'), 'desktop: the toolbar stays at the top of the left pane, no colour menu');
  ok(desk.errors.length === 0, `desktop: no console errors (${desk.errors.join(' | ')})`);
  await desk.close();

  // ── iPad: detected automatically ──
  const pad = await open(true);
  const P = tools(pad);
  await pad.goto(APP_URL);
  ok(await pad.$eval('html', (h) => h.classList.contains('ipad')), 'iPad (desktop-style user agent + touch points) is detected with no toggle');
  ok(!(await pad.$('[data-action="ipad"], #ipad-toggle')), 'no iPad button or device toggle on the page');
  await P.startExam();
  ok(!!(await pad.$('#ink-right')), 'iPad exam: the right pane has its ink layer');
  const padRects = await pad.$$eval('#right-body *', (els) => els.slice(0, 80).map((e) => { const r = e.getBoundingClientRect(); return [Math.round(r.left), Math.round(r.top), Math.round(r.width), Math.round(r.height)].join(','); }));
  ok(JSON.stringify(padRects) === JSON.stringify(deskRects), 'iPad: the right pane lays out exactly as on desktop');
  ok(await pad.$eval('.p-main', (m) => m.classList.contains('pencil-ink')), 'iPad exam: Pencil mode is on');
  await P.click('[data-ann="pen"]');
  ok(/Apple Pencil/.test(await pad.$eval('#annot-hint', (h) => h.textContent)), 'pen hint mentions Apple Pencil');

  // Nothing covers the controls for fingers.
  const art = await pad.$eval('#problem-article .annot-text', (e) => { const r = e.getBoundingClientRect(); return [r.left + 40, r.top + 10]; });
  ok(!(await pad.evaluate(([x, y]) => document.elementFromPoint(x, y).classList.contains('annot-layer'), art)), 'pen on: the left overlay no longer covers the problem (fingers reach it)');
  const opt = await P.center('label[for="c-sp25-4e-1"]');
  ok(await pad.evaluate(([x, y]) => !!document.elementFromPoint(x, y).closest('label[for="c-sp25-4e-1"]'), opt), 'pen on: an MCQ option is still the thing under the finger');

  // Pencil on the left: the existing saved red-pen stroke.
  await P.stroke('pen', P.line(art, 90, 25));
  ok((await P.leftPens()) === 1, 'Pencil on the left pane draws a red-pen stroke (saved as before)');
  // Pencil on the right: a stroke on the ink layer, not saved.
  await P.stroke('pen', P.line(await P.rightBlank(), 120, 30));
  ok((await P.rightInk()) === 1, 'Pencil on the right pane draws a stroke');
  let S = await P.st();
  ok(S.exam.handwriting['sp25-4b'].length === 1 && !JSON.stringify(S.exam.annotations).includes('"ink"'), 'right-pane strokes are saved with the exam (handwriting), not in the annotations (Phase 2A)');
  // Finger touches don't draw.
  await P.stroke('touch', P.line(await P.rightBlank(), 60, 200));
  await P.stroke('touch', P.line(art, 60, 60));
  ok((await P.rightInk()) === 1 && (await P.leftPens()) === 1, 'finger (touch) drags draw nothing on either pane');

  // MCQ options: a Pencil tap selects (and toggles Eliminate), a Pencil drag that starts on one draws.
  const tapPen = async (sel) => { const c = await P.center(sel); await P.stroke('pen', [c, [c[0] + 1, c[1] + 1], [c[0] + 1, c[1] + 1]]); await wait(100); };
  await tapPen('label[for="c-sp25-4e-1"]');
  ok(await pad.$eval('#c-sp25-4e-1', (i) => i.checked) && (await P.st()).exam.answers['sp25-4e'] === 1, 'Pencil tap selects an MCQ option');
  ok((await P.rightInk()) === 1, 'the Pencil tap drew nothing');
  await tapPen('#x-sp25-4e-3');
  ok(((await P.st()).exam.eliminated['sp25-4e'] || []).includes(3), 'Pencil tap toggles Option Elimination on');
  await tapPen('#x-sp25-4e-3');
  ok(!((await P.st()).exam.eliminated['sp25-4e'] || []).includes(3), '…and a second Pencil tap toggles it off (no double click)');
  await P.stroke('pen', P.line(await P.center('label[for="c-sp25-4e-2"]'), 70, 4));
  ok((await P.rightInk()) === 2, 'a Pencil drag that starts on an option draws a stroke');
  ok(await pad.$eval('#c-sp25-4e-1', (i) => i.checked) && (await P.st()).exam.answers['sp25-4e'] === 1, '…and does not change the selected option');
  await pad.click('label[for="c-sp25-4e-0"]'); await wait(100);
  ok((await P.st()).exam.answers['sp25-4e'] === 0, 'a tap (mouse / finger) selects an option normally');
  await P.mouseDrag(await P.center('label[for="c-sp25-4e-2"]'), 70, 4);
  ok((await P.rightInk()) === 3 && (await P.st()).exam.answers['sp25-4e'] === 0, 'a mouse drag from an option draws without selecting it');
  await P.click('[data-ann="undo"]');

  // Code editor and answer boxes are paper while a tool is on (no Scribble, no typing), typeable again after.
  ok(await pad.evaluate(() => document.querySelector('#ta-sp25-4d').readOnly && document.querySelector('.CodeMirror').CodeMirror.getOption('readOnly') === 'nocursor'), 'pen on: the answer box and code editor are read-only (Scribble can’t convert writing)');
  const taPt = await P.center('#ta-sp25-4d');
  await P.stroke('pen', P.line([taPt[0] - 40, taPt[1]], 80, 2));
  ok((await P.rightInk()) === 3 && (await P.st()).exam.answers['sp25-4d'] === undefined, 'Pencil writing over the answer box stays ink, not text');
  const codePt = await pad.$eval('.CodeMirror-code', (e) => { const r = e.getBoundingClientRect(); return [r.left + 60, r.top + 30]; });
  const code0 = await pad.evaluate(() => document.querySelector('.CodeMirror').CodeMirror.getValue());
  await P.stroke('pen', P.line(codePt, 120, 30));
  ok((await P.leftPens()) === 2 && (await pad.evaluate(() => document.querySelector('.CodeMirror').CodeMirror.getValue())) === code0, 'Pencil writing over the code stays ink; the code is unchanged');
  await P.click('[data-ann="undo"]'); await P.click('[data-ann="undo"]'); // the code stroke, then the answer-box stroke
  await P.click('[data-ann="pen"]');
  ok(await pad.evaluate(() => !document.querySelector('#ta-sp25-4d').readOnly && document.querySelector('.CodeMirror').CodeMirror.getOption('readOnly') === false), 'pen off: the answer box and code editor are editable again');
  await pad.click('#ta-sp25-4d'); await pad.keyboard.type('x + 1'); await wait(100);
  ok((await P.st()).exam.answers['sp25-4d'] === 'x + 1', 'pen off: typing in the answer box works');
  await P.click('[data-ann="pen"]');
  ok(await pad.evaluate(() => document.activeElement.id !== 'ta-sp25-4d' && document.querySelector('#ta-sp25-4d').readOnly), 'pen back on: the box loses focus (keyboard closes) and is paper again');

  // Undo / Redo / Eraser / Clear cover both panes.
  await P.click('[data-ann="undo"]');
  ok((await P.rightInk()) === 1, 'Undo removes the last right-pane stroke');
  await P.click('[data-ann="redo"]');
  ok((await P.rightInk()) === 2, 'Redo brings it back');
  await P.click('[data-ann="eraser"]');
  const first = await pad.$eval('#ink-right path', (p) => { const b = p.getBoundingClientRect(); const pt = p.getPointAtLength(p.getTotalLength() / 2); const svg = p.ownerSVGElement.getBoundingClientRect(); return [svg.left + pt.x, svg.top + pt.y]; });
  await P.stroke('pen', P.line(first, 0, 2, 2));
  ok((await P.rightInk()) === 1, 'the eraser removes a right-pane stroke under the Pencil');
  await P.click('[data-ann="undo"]');
  ok((await P.rightInk()) === 2, 'Undo restores an erased stroke');
  await P.click('[data-ann="eraser"]');
  ok(!(await pad.$eval('[data-ann="clear"]', (b) => b.disabled)), 'Clear is enabled');
  await P.click('[data-ann="clear"]');
  ok((await P.rightInk()) === 0 && (await P.leftPens()) === 0, 'Clear removes strokes on both panes');
  await P.click('[data-ann="undo"]');
  ok((await P.rightInk()) === 2 && (await P.leftPens()) === 1, 'Undo after Clear restores both panes');

  // ── One toolbar on the divider, with a pen colour menu ──
  const mode = () => pad.$eval('#problem-article', (a) => a.dataset.mode);
  const rect = (sel) => pad.$eval(sel, (e) => { const r = e.getBoundingClientRect(); return { x: r.left, y: r.top, w: r.width, h: r.height }; });
  const hits = (p, q) => p.x < q.x + q.w && q.x < p.x + p.w && p.y < q.y + q.h && q.y < p.y + p.h;
  const menuOpen = () => pad.$eval('#pen-colors', (m) => !m.hidden);
  const checked = () => pad.$eval('#pen-colors [aria-checked="true"]', (b) => b.dataset.color);
  ok(!(await pad.$('#pencil-switch')) && (await pad.$$('#annot-bar')).length === 1 && (await pad.$$('[data-ann="pen"]')).length === 1, 'one toolbar: no separate switcher, no duplicated tools');
  ok(await pad.$eval('#annot-bar', (b) => ['hl', 'pen', 'pencolor', 'eraser', 'note', 'undo', 'redo', 'clear', 'settings'].every((k) => b.querySelector(`[data-ann="${k}"]`))), 'every tool is still there (highlighter, pen, colour, eraser, sticky note, undo, redo, clear, settings)');
  const bar = await rect('#annot-bar'), divider = await pad.$eval('#pane-left', (p) => p.getBoundingClientRect().right);
  ok(bar.h > bar.w && Math.abs(bar.x + bar.w / 2 - divider) < 4, `landscape: a column centred on the divider (${Math.round(bar.w)}×${Math.round(bar.h)})`);
  const covered = [];
  for (const b of ['#problem-article', '#right-body', '#p-footer', '#p-header', '#nav-toggle']) if (await pad.$(b) && hits(bar, await rect(b))) covered.push(b);
  ok(!covered.length && bar.w <= 44, `it covers no question, answers, navigation or bars (${covered.join(',') || 'nothing covered'})`);
  const bar0 = bar.y;
  await pad.$eval('#pane-left', (p) => { p.scrollTop = 300; }); await pad.$eval('#pane-right', (p) => { p.scrollTop = 200; }); await wait(100);
  ok(Math.abs((await rect('#annot-bar')).y - bar0) < 1, 'it stays put while either pane scrolls');
  await pad.$eval('#pane-left', (p) => { p.scrollTop = 0; }); await pad.$eval('#pane-right', (p) => { p.scrollTop = 0; }); await wait(100);
  await pad.click('[data-ann="pen"]'); await wait(80);
  ok((await mode()) === 'pen' && (await checked()) === 'red', 'finger tap on Pen: on in one tap, red by default');
  await tapPen('[data-ann="eraser"]');
  ok((await mode()) === 'eraser', 'Pencil tap on Eraser switches to the eraser');
  await tapPen('[data-ann="pen"]');
  ok((await mode()) === 'pen', 'Pencil tap on Pen switches back');
  ok((await P.rightInk()) === 2 && (await P.leftPens()) === 1, 'tapping the toolbar draws nothing');
  await P.stroke('pen', P.line(await P.rightBlank(), 100, 60));
  ok(!(await pad.$eval('#ink-right path:last-child', (p) => p.getAttribute('style'))), 'red strokes use the default red');
  await P.click('[data-ann="undo"]');
  await tapPen('[data-ann="pencolor"]');
  ok((await menuOpen()) && (await pad.$eval('#pen-color-btn', (b) => b.getAttribute('aria-expanded'))) === 'true', 'Pencil tap on the colour dot opens the colour menu');
  ok((await pad.$$eval('#pen-colors [role="menuitemradio"]', (b) => b.map((x) => x.textContent.trim()).join(','))) === 'Red,Blue,Black', 'it offers Red, Blue, Black');
  const menu = await rect('#pen-colors');
  ok(menu.x >= bar.x + bar.w && menu.x + menu.w <= 1180, 'the menu opens beside the toolbar, on screen');
  await tapPen('#pen-colors [data-color="blue"]');
  ok(!(await menuOpen()) && (await checked()) === 'blue' && (await mode()) === 'pen', 'picking Blue closes the menu and keeps the pen on, in blue');
  ok(/blue/i.test(await pad.$eval('#pen-color-btn', (b) => b.getAttribute('aria-label'))) && (await pad.$eval('#pen-color-btn .pc-dot', (d) => getComputedStyle(d).backgroundColor)) === 'rgb(31, 95, 214)', 'the toolbar shows blue as the current colour');
  await P.stroke('pen', P.line(await P.rightBlank(), 100, 60));
  ok(/1f5fd6/.test(await pad.$eval('#ink-right path:last-child', (p) => p.getAttribute('style') || '')), 'a blue stroke on the right pane is blue');
  await P.stroke('pen', P.line([art[0], art[1] + 30], 90, 10));
  let L = ((await P.st()).exam.annotations['sp25-4b'] || []).filter((a) => a.kind === 'pen');
  ok(L.length === 2 && L[1].color === 'blue' && !('color' in L[0]), 'a blue stroke on the left is saved as blue; red strokes have no colour field');
  await pad.click('[data-ann="eraser"]'); await wait(80);
  const bluePt = await pad.$eval('#ink-right path:last-child', (p) => { const pt = p.getPointAtLength(p.getTotalLength() / 2); const r = p.ownerSVGElement.getBoundingClientRect(); return [r.left + pt.x, r.top + pt.y]; });
  await P.stroke('pen', P.line(bluePt, 0, 2, 2));
  ok((await P.rightInk()) === 2, 'the eraser removes a blue stroke');
  await P.click('[data-ann="undo"]');
  ok((await P.rightInk()) === 3, 'Undo restores it');
  await pad.click('[data-ann="pencolor"]'); await wait(80);
  await pad.click('#pen-colors [data-color="black"]'); await wait(80);
  ok((await mode()) === 'pen' && (await checked()) === 'black' && !(await menuOpen()), 'finger: picking Black from the eraser switches to a black pen');
  await P.stroke('pen', P.line(await P.rightBlank(), 80, 90));
  ok(/1b1b1b/.test(await pad.$eval('#ink-right path:last-child', (p) => p.getAttribute('style') || '')), 'a black stroke is black');
  await P.click('[data-ann="undo"]'); await P.click('[data-ann="undo"]'); await P.click('[data-ann="undo"]'); // black, blue left, blue right
  ok((await P.rightInk()) === 2 && (await P.leftPens()) === 1, 'Undo removes the coloured strokes');
  await P.click('[data-ann="redo"]');
  ok((await P.rightInk()) === 3, 'Redo brings a coloured stroke back');
  await P.click('[data-ann="undo"]');
  await pad.click('[data-ann="pencolor"]'); await wait(80);
  await pad.$eval('#problem-article h2', (h) => h.click()); await wait(80); // a finger tap: a click with no pen / mouse stroke
  ok(!(await menuOpen()), 'tapping elsewhere closes the menu');
  await pad.click('[data-ann="pencolor"]'); await wait(80);
  await pad.click('#pen-colors [data-color="red"]'); await wait(80);
  await tapPen('[data-ann="pen"]');
  ok((await mode()) === 'none' && (await checked()) === 'red', 'tapping the active Pen turns it off in one tap');
  ok(await pad.evaluate(() => !document.querySelector('#ta-sp25-4d').readOnly), '…and the answer boxes are typeable again');
  await tapPen('[data-ann="note"]');
  ok((((await P.st()).exam.annotations['sp25-4b'] || []).filter((a) => a.kind === 'note').length) === 1, 'the sticky-note button still makes a note');
  await pad.click('#problem-article h2'); await wait(80); // leave the note (typing in it is the note's own business)
  await tapPen('[data-ann="settings"]');
  const set = await rect('#exam-settings');
  ok(set.x >= bar.x + bar.w && set.x + set.w <= 1180 && set.y >= 0, 'Exam Settings (⋮) opens beside the toolbar, on screen');
  await tapPen('[data-ann="settings"]');
  // Portrait (one column of panes): a row just above the bottom bar.
  await pad.setViewport({ width: 800, height: 1100 }); await wait(250);
  await P.click('[data-ann="pen"]');
  const barP = await rect('#annot-bar'), foot = await rect('#p-footer');
  ok(barP.w > barP.h && barP.y + barP.h <= foot.y && barP.x >= 0 && barP.x + barP.w <= 800, `portrait: a row above the bottom bar, on screen (${JSON.stringify(barP)})`);
  await pad.click('[data-ann="pencolor"]'); await wait(80);
  const menuP = await rect('#pen-colors');
  ok(menuP.y + menuP.h <= barP.y && menuP.x >= 0 && menuP.x + menuP.w <= 800, 'portrait: the colour menu opens above it, on screen');
  await pad.click('#pen-colors [data-color="red"]'); await wait(80);
  await pad.click('[data-ann="eraser"]'); await wait(80);
  ok((await mode()) === 'eraser', 'portrait: the toolbar still switches tools');
  await pad.click('[data-ann="eraser"]'); await wait(80);
  await pad.setViewport({ width: 1180, height: 820 }); await wait(250);

  // Highlighter with the Pencil: a drag over the text, or over the code, highlights it.
  await P.click('[data-ann="hl"]');
  ok(await pad.evaluate(() => document.querySelector('#ta-sp25-4d').readOnly), 'highlighter on: answer boxes are paper too');
  const intro = await pad.$eval('#problem-article [data-annot="intro"] p, #problem-article [data-annot="intro"]', (e) => { const r = e.getBoundingClientRect(); return [r.left + 4, r.top + 8, r.width]; });
  await P.stroke('pen', P.line([intro[0], intro[1]], Math.min(220, intro[2] - 10), 0));
  let A = (await P.st()).exam.annotations['sp25-4b'] || [];
  ok(A.some((a) => a.kind === 'hl' && a.end - a.start > 5) && await pad.$('#problem-article mark.hl'), 'Pencil drag over the problem text highlights it');
  await P.stroke('pen', P.line(codePt, 100, 0));
  A = (await P.st()).exam.annotations['sp25-4b'] || [];
  ok(A.some((a) => a.kind === 'code') && await pad.$('.CodeMirror .cm-hl'), 'Pencil drag over the code highlights it');
  ok((await pad.evaluate(() => document.querySelector('.CodeMirror').CodeMirror.getValue())) === code0, '…without changing the code');
  await tapPen('label[for="c-sp25-4e-2"]');
  ok((await P.st()).exam.answers['sp25-4e'] === 2, 'highlighter on: a Pencil tap still selects an option');
  await P.click('[data-ann="undo"]'); await P.click('[data-ann="undo"]');
  ok(!((await P.st()).exam.annotations['sp25-4b'] || []).some((a) => a.kind === 'hl' || a.kind === 'code'), 'Undo removes the Pencil highlights');

  // Navigation, timer, diagram, Save & Leave, Submit.
  await P.click('[data-ann="pen"]');
  const clock0 = await pad.$eval('.timer .clock', (c) => c.textContent);
  await P.click('[data-action="next"]');
  await pad.waitForFunction(() => document.querySelector('#pane-right').dataset.group === 'fa24-2');
  ok((await P.rightInk()) === 0, 'Next works with the pen on; the next question has its own (empty) right-pane ink');
  ok(await pad.$eval('#dg-canvas img', (i) => i.offsetWidth > 100 && i.complete), 'the environment diagram is shown');
  ok(await pad.$eval('#dg-bar', (b) => b.offsetParent === null), 'iPad exam: the diagram’s own toolkit is hidden');
  ok(await pad.$eval('#dg-canvas', (c) => getComputedStyle(c).pointerEvents === 'none'), 'iPad exam: frame / binding editing is off');
  ok(await pad.$eval('.dg-scroll', (d) => d.scrollHeight <= d.clientHeight + 1), 'the diagram is shown at full size (no inner scrolling)');
  const dgc = await pad.$eval('#dg-canvas', (c) => { const r = c.getBoundingClientRect(); return [r.left + 60, r.top + 60]; });
  const dgTexts = await pad.$$eval('#dg-canvas .dg-text', (t) => t.length);
  await P.stroke('pen', P.line(dgc, 90, 30));
  ok((await P.rightInk()) === 1 && (await pad.$$eval('#dg-canvas .dg-layer path', (p) => p.length)) === 0 && (await pad.$$eval('#dg-canvas .dg-text', (t) => t.length)) === dgTexts, 'the main pen draws over the diagram (nothing added to the diagram itself)');
  await P.click('[data-ann="undo"]');
  ok((await P.rightInk()) === 0, 'Undo removes it');
  await P.click('[data-ann="redo"]');
  await P.click('[data-ann="eraser"]');
  await P.stroke('pen', P.line([dgc[0] + 45, dgc[1] + 15], 0, 2, 2));
  ok((await P.rightInk()) === 0, 'the eraser removes it');
  await P.click('[data-ann="undo"]');
  await P.click('[data-ann="clear"]');
  ok((await P.rightInk()) === 0, 'Clear removes it');
  await P.click('[data-ann="pen"]');
  await P.click('[data-action="prev"]');
  await pad.waitForFunction(() => document.querySelector('#pane-right').dataset.group === 'sp25-4b');
  ok((await P.rightInk()) === 2, 'Back: the first question’s right-pane strokes are still there');
  ok(await pad.evaluate(() => document.querySelector('#ta-sp25-4d').readOnly), 'Back: the answer box is still paper with the pen on (re-rendered boxes too)');
  await wait(1100);
  ok((await pad.$eval('.timer .clock', (c) => c.textContent)) !== clock0, 'the timer keeps running');
  await P.click('[data-action="save-leave"]');
  await pad.waitForSelector('[data-action="resume-exam"], [data-action="resume"]');
  ok(true, 'Save & Leave works with the pen on');
  await P.click('[data-action="resume-exam"]').catch(() => P.click('[data-action="resume"]'));
  await pad.waitForSelector('#pane-right .part');
  ok((await P.leftPens()) === 1, 'resume: the saved left-pane stroke is still there');
  await P.click('[data-action="submit-exam"]');
  await wait(400);
  const conf = await pad.$('[data-action="confirm-submit"]');
  if (conf) { await conf.click(); await wait(400); }
  ok(!(await pad.$('#pane-right .part')) || (await pad.$eval('.practice', (p) => p.dataset.view)) !== 'exam', 'Submit works');

  // Practice on an iPad uses the same Pencil drawing and toolbar as an exam (Task 5).
  await pad.evaluate((k) => { const s = JSON.parse(localStorage.getItem(k)); s.prefs.mode = 'practice'; s.session = { ids: ['sp25-4d', 'sp25-4e', 'fa24-2a'], index: 0, title: 'x', answers: {}, timer: null, startedAt: Date.now(), finished: false, notes: {}, annotations: {} }; localStorage.setItem(k, JSON.stringify(s)); Storage.prototype.setItem = function () {}; }, KEY);
  await pad.goto(APP_URL); await wait(150);
  await P.click('[data-action="enter"]'); await P.click('.resume [data-action="resume"]'); await pad.waitForSelector('#pane-right .part');
  ok(await pad.$eval('.p-main', (m) => m.classList.contains('pencil-ink')), 'iPad practice: Pencil-on-both-panes is on, as in an exam');
  ok(!!(await pad.$('#pen-colors')) && await pad.$eval('#annot-bar', (b) => getComputedStyle(b).position === 'absolute' && getComputedStyle(b).flexDirection === 'column'), 'iPad practice: the same toolbar on the divider, with the colour menu');
  ok(await pad.$eval('#annot-bar [data-ann="pen"]', (b) => b.getAttribute('aria-pressed') === 'true'), 'iPad practice: the set opens with the Pen on, as an exam does');
  ok(await pad.evaluate(() => document.querySelector('#pane-right textarea').readOnly && document.querySelector('.CodeMirror').CodeMirror.getOption('readOnly') === 'nocursor'), 'iPad practice: with the pen on, code and answer boxes are paper, as in an exam');
  await P.click('[data-ann="pen"]');
  ok(await pad.evaluate(() => !document.querySelector('#pane-right textarea').readOnly && document.querySelector('.CodeMirror').CodeMirror.getOption('readOnly') === false), 'iPad practice: with no tool on they are editable again');
  await P.click('[data-action="next"]');
  await pad.waitForSelector('#dg-canvas');
  ok(await pad.$eval('#dg-bar', (b) => b.offsetParent === null) && await pad.$eval('#dg-canvas', (c) => getComputedStyle(c).pointerEvents === 'none'), 'iPad practice: the environment diagram is paper, as in an exam');
  ok(pad.errors.length === 0, `iPad: no console errors (${pad.errors.join(' | ')})`);

  await browser.close();
  console.log(fails ? `\n${fails} failed` : '\nAll iPad checks passed');
  process.exit(fails ? 1 : 0);
})().catch((e) => { console.error(e); process.exit(1); });
