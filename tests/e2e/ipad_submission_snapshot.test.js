// iPad Phase 2C: a submitted exam attempt is the original submission, kept as it was: typed answers, question-pane
// annotations (coding area too), answer-pane and diagram handwriting, per question, under the attempt's id; it
// survives reloads and Exam History, and neither the Review workspace nor a new attempt changes it. Manual Submit,
// the timer's auto-submit and a full storage all keep it; older attempts without handwriting still load.
// Run: node tests/e2e/ipad_submission_snapshot.test.js  (needs nothing running; see tests/README.md)
const puppeteer = require('puppeteer-core');
const { APP_URL, CHROME, skipTour } = require('./config');
const KEY = 'cs61a-practice:v1';
let fails = 0;
const ok = (c, m) => { console.log(`${c ? 'PASS' : 'FAIL'}  ${m}`); if (!c) fails++; };
const wait = (ms) => new Promise((r) => setTimeout(r, ms));
const IPAD_UA = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.0 Safari/605.1.15';
const EXAM = { version: 5, prefs: { mode: 'exam' }, examPrefs: { kind: 'custom', topics: [], picked: ['sp25-4b', 'fa24-2'], timerOn: true, minutes: 120 } };
const FIELDS = ['ids', 'groups', 'answers', 'eliminated', 'notes', 'annotations', 'diagrams', 'handwriting'];
const pick = (s) => JSON.stringify(FIELDS.map((k) => s[k]));

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
    const seed = async () => {
      await page.goto(APP_URL);
      await page.evaluate((k, v) => { localStorage.setItem(k, v); Storage.prototype.setItem = function () {}; }, KEY, JSON.stringify(EXAM));
      await page.goto(APP_URL); await wait(150);
      await click('[data-action="enter"]');
    };
    const newExam = async () => { await click('[data-action="start-exam"]'); await ready(); };
    const reload = async () => { await page.goto(APP_URL); await wait(300); };
    const toHome = async () => { await reload(); if (await page.$('[data-action="enter"]')) await click('[data-action="enter"]'); };
    const stroke = (pts) => page.evaluate((pts) => {
      const ev = (name, [x, y], t) => t.dispatchEvent(new PointerEvent(name, { pointerType: 'pen', pointerId: 7, isPrimary: true, clientX: x, clientY: y, button: name === 'pointermove' ? -1 : 0, buttons: name === 'pointerup' ? 0 : 1, bubbles: true, cancelable: true }));
      ev('pointerdown', pts[0], document.elementFromPoint(...pts[0]));
      pts.slice(1).forEach((p) => ev('pointermove', p, document.elementFromPoint(...p) || document));
      ev('pointerup', pts[pts.length - 1], document.elementFromPoint(...pts[pts.length - 1]) || document);
    }, pts);
    const line = ([x, y], dx, dy, n = 8) => Array.from({ length: n + 1 }, (_, i) => [x + dx * i / n, y + dy * i / n]);
    const at = (sel, dx, dy) => page.$eval(sel, (e, dx, dy) => { const r = e.getBoundingClientRect(); return [r.left + dx, r.top + dy]; }, dx, dy);
    const go = async (dir, pid) => { await click(`[data-action="${dir}"]`); await page.waitForFunction((g) => document.querySelector('#pane-right').dataset.group === g, {}, pid); await wait(150); };
    const submit = async () => { await click('[data-action="submit-exam"]'); await page.waitForFunction(() => !document.querySelector('[data-action="submit-exam"]'), { timeout: 8000 }); await wait(200); };
    const tamper = async (fn) => { await page.evaluate((k, f) => { const s = JSON.parse(localStorage.getItem(k)); new Function('s', f)(s); localStorage.setItem(k, JSON.stringify(s)); Storage.prototype.setItem = function () {}; }, KEY, fn); await reload(); };
    // Everything an iPad exam can hold: an option, typed answers, the question pane (text and coding area) in two
    // colours, the answer pane (blank area and an answer box), and the paper diagram on the second question.
    const work = async (text) => {
      await click('label[for="c-sp25-4e-1"]');
      await page.click('#ta-sp25-4d'); await page.keyboard.type(text); await wait(400);
      await click('[data-ann="pen"]');
      await stroke(line(await at('#problem-article .annot-text', 40, 10), 90, 25));
      await stroke(line(await at('.CodeMirror', 30, 20), 120, 10));
      await click('[data-ann="pencolor"]'); await click('#pen-colors [data-color="blue"]');
      await stroke(line(await at('#pane-right', 52, 140), 100, 40));
      await stroke(line(await at('#ta-sp25-4d', 20, 10), 80, 5));
      await go('next', 'fa24-2');
      await page.waitForSelector('#dg-canvas');
      await stroke(line(await at('#dg-canvas', 60, 60), 90, 30));
      await click('[data-ann="pen"]');
    };
    return { click, st, seed, newExam, reload, toHome, stroke, line, at, go, submit, tamper, work };
  };

  // ── iPad: manual Submit ──
  const pad = await open(true);
  const P = tools(pad);
  await P.seed();
  await P.newExam();
  await P.work('first attempt');
  const pre = (await P.st()).exam;
  const id1 = pre.id;
  ok(pre.handwriting['sp25-4b'].length === 2 && pre.handwriting['fa24-2'].length === 1 && pre.annotations['sp25-4b'].filter((a) => a.kind === 'pen').length === 2, 'set-up: question-pane, answer-pane and diagram handwriting saved');
  await P.submit();
  let S = await P.st();
  let A1 = S.attempts.find((a) => a.id === id1);
  ok(!S.exam && S.attempts.length === 1 && A1 && A1.submitted && !A1.autoSubmitted, 'manual Submit: one submitted attempt, under the same attempt id');
  ok(pick(A1) === pick(pre), 'it holds exactly what was on the exam: answers, eliminations, notes, annotations, diagrams, handwriting');
  ok(A1.answers['sp25-4d'] === 'first attempt' && A1.answers['sp25-4e'] === 1, 'typed answers and the chosen option are kept');
  ok(A1.handwriting['sp25-4b'].map((k) => k.color || 'red').join() === 'blue,blue' && A1.handwriting['fa24-2'].length === 1 && Object.keys(A1.handwriting).sort().join() === 'fa24-2,sp25-4b', 'answer-pane and diagram handwriting stay with their own questions, in colour');
  ok(A1.annotations['sp25-4b'].filter((a) => a.kind === 'pen').length === 2 && !(A1.annotations['fa24-2'] || []).length, 'question-pane handwriting (text and coding area) stays with its question');
  const snap1 = JSON.stringify(A1);

  // Reload and Exam History.
  await P.toHome();
  ok(JSON.stringify((await P.st()).attempts.find((a) => a.id === id1)) === snap1, 'after a reload the submitted attempt is unchanged');
  await P.click(`[data-action="open-attempt"][data-id="${id1}"]`);
  ok(!!(await pad.$('.actions [data-action="exam-review"]')), 'it opens from Exam History');

  // Review: open it and edit the workspace.
  await P.click('.actions [data-action="exam-review"]'); await pad.waitForSelector('#review-work .part'); await wait(200);
  ok(JSON.stringify((await P.st()).attempts.find((a) => a.id === id1)) === snap1, 'opening Review leaves the original unchanged');
  await pad.$eval('#ta-sp25-4d', (t) => { t.value = ''; }); await pad.click('#ta-sp25-4d'); await pad.keyboard.type('edited in review'); await wait(400);
  await P.click('[data-ann="pen"]');
  const rv = await P.at('#problem-article .annot-text', 60, 30);
  await pad.mouse.move(...rv); await pad.mouse.down(); await pad.mouse.move(rv[0] + 70, rv[1] + 15, { steps: 6 }); await pad.mouse.up(); await wait(200);
  await P.click('[data-ann="pen"]');
  await P.click('[data-ann="clear"]');
  S = await P.st();
  const W = S.reviews[id1];
  ok(W && W.answers['sp25-4d'] === 'edited in review' && !(W.annotations['sp25-4b'] || []).length, 'the Review workspace took the edits (new answer, drawing, then Clear)');
  ok(JSON.stringify(S.attempts.find((a) => a.id === id1)) === snap1, 'editing the Review workspace leaves the original submission unchanged');
  ok(!Object.values(W.handwriting || {}).some((l) => l.length), 'the workspace carries no copy of the original handwriting (its own Review layer starts empty)');

  // ── A new attempt of the same questions, then the timer's auto-submit ──
  await P.toHome();
  await P.newExam();
  ok(!(await P.st()).exam.handwriting && (await pad.$$eval('#ink-right path', (p) => p.length)) === 0, 'a new attempt starts with none of the earlier handwriting');
  await P.work('second attempt');
  const pre2 = (await P.st()).exam;
  ok(JSON.stringify((await P.st()).attempts.find((a) => a.id === id1)) === snap1, 'writing in a new attempt leaves the earlier submission unchanged');
  await P.tamper('s.exam.timer.remainingMs = 1500; s.exam.timer.runningSince = Date.now();');
  await pad.waitForFunction((k) => !JSON.parse(localStorage.getItem(k)).exam, { timeout: 8000 }, KEY).catch(() => {});
  S = await P.st();
  const A2 = S.attempts.find((a) => a.id === pre2.id);
  ok(!S.exam && S.attempts.length === 2 && A2 && A2.autoSubmitted, 'the timer runs out: auto-submitted, once');
  ok(A2 && pick(A2) === pick(pre2) && A2.handwriting['sp25-4b'].length === 2 && A2.handwriting['fa24-2'].length === 1 && A2.answers['sp25-4d'] === 'second attempt', 'auto-submit keeps the same answers and handwriting, per question');
  ok(JSON.stringify(S.attempts.find((a) => a.id === id1)) === snap1, 'the first submission is still unchanged');

  // ── Storage full at the moment of Submit: the submission is still saved ──
  await P.toHome();
  await P.newExam();
  await P.click('[data-ann="pen"]');
  await P.stroke(P.line(await P.at('#pane-right', 52, 140), 100, 40));
  const id3 = (await P.st()).exam.id;
  await pad.evaluate((id3) => { // storage takes nothing with more than one stroke on sp25-4b in this attempt
    const real = Storage.prototype.setItem;
    Storage.prototype.setItem = function (k, v) {
      const s = JSON.parse(v);
      if ([s.exam, ...(s.attempts || [])].some((x) => x && x.id === id3 && x.handwriting && (x.handwriting['sp25-4b'] || []).length > 1)) throw new DOMException('full', 'QuotaExceededError');
      return real.call(this, k, v);
    };
  }, id3);
  await P.stroke(P.line(await P.at('#pane-right', 52, 230), 100, 40));
  await P.click('[data-ann="pen"]');
  await pad.click('#ta-sp25-4d'); await pad.keyboard.type('full storage'); await wait(400);
  await P.submit();
  S = await P.st();
  const A3 = S.attempts.find((a) => a.id === id3);
  ok(!S.exam && A3 && A3.submitted && A3.answers['sp25-4d'] === 'full storage' && A3.handwriting['sp25-4b'].length === 1, 'storage full at Submit: the submission is saved, with its answers and the handwriting saved before');
  await P.toHome();
  S = await P.st();
  ok(!S.exam && S.attempts.length === 3 && S.attempts.find((a) => a.id === id3).submitted && JSON.stringify(S.attempts.find((a) => a.id === id1)) === snap1, '…and after a reload it is still submitted (not back in progress); earlier ones unchanged');

  // ── An older attempt with no handwriting field still loads and reviews ──
  await P.tamper("const o = JSON.parse(JSON.stringify(s.attempts[0])); o.id = 'xlegacy'; o.aid = undefined; delete o.handwriting; s.attempts.unshift(o);");
  if (await pad.$('[data-action="enter"]')) await P.click('[data-action="enter"]');
  await P.click('[data-action="open-attempt"][data-id="xlegacy"]');
  await P.click('.actions [data-action="exam-review"]'); await pad.waitForSelector('#review-work .part'); await wait(200);
  const legacy = await pad.evaluate((k) => JSON.parse(localStorage.getItem(k)).attempts.find((a) => a.id === 'xlegacy'), KEY);
  ok(legacy && !('handwriting' in legacy) && (await pad.$$eval('#review-work .part', (p) => p.length)) > 0, 'an attempt saved without handwriting still opens in Exam History and Review, unchanged');
  ok(pad.errors.length === 0, `iPad: no console errors (${pad.errors.join(' | ')})`);
  await pad.close();

  // ── Desktop: Submit and Review as before ──
  const desk = await open(false);
  const D = tools(desk);
  await D.seed();
  await D.newExam();
  await D.click('label[for="c-sp25-4e-1"]');
  await D.click('[data-ann="pen"]');
  const dp = await D.at('#problem-article .annot-text', 40, 10);
  await desk.mouse.move(...dp); await desk.mouse.down(); await desk.mouse.move(dp[0] + 60, dp[1] + 10, { steps: 6 }); await desk.mouse.up(); await wait(200);
  await D.submit();
  const dA = (await D.st()).attempts[0];
  ok(dA && dA.answers['sp25-4e'] === 1 && dA.annotations['sp25-4b'].filter((a) => a.kind === 'pen').length === 1 && !('handwriting' in dA), 'desktop: the attempt keeps answers and drawing, with no handwriting field');
  await D.click('.actions [data-action="exam-review"]'); await desk.waitForSelector('#review-work .part'); await wait(200);
  await D.click('[data-ann="clear"]');
  const dS = await D.st();
  ok(JSON.stringify(dS.attempts[0]) === JSON.stringify(dA) && !(dS.reviews[dA.id].annotations['sp25-4b'] || []).length, 'desktop: clearing in Review leaves the attempt unchanged');
  ok(desk.errors.length === 0, `desktop: no console errors (${desk.errors.join(' | ')})`);

  await browser.close();
  console.log(fails ? `\n${fails} failed` : '\nAll submission snapshot checks passed');
  process.exit(fails ? 1 : 0);
})().catch((e) => { console.error(e); process.exit(1); });
