// Past finals and SQL: the Midterm 2 / Final choice for full past exams (with the no-Gleam notice and the final's
// default time), out-of-scope final questions left out, the SQL language in Practice Mode (never mixed into Python),
// the SQL exam chip, Run Code for SQL with its verified tests, and the scrolling Exams menu with Midterm 2 / Final
// groups.
const puppeteer = require('puppeteer-core');
const { APP_URL, CHROME, skipTour } = require('./config');
const KEY = 'cs61a-practice:v1';
let fails = 0;
const ok = (c, m) => { console.log(`${c ? 'PASS' : 'FAIL'}  ${m}`); if (!c) fails++; };
const wait = (ms) => new Promise((r) => setTimeout(r, ms));

(async () => {
  const browser = await puppeteer.launch({ executablePath: CHROME, headless: 'new' });
  const page = await browser.newPage();
  await skipTour(page);
  await page.setViewport({ width: 1400, height: 900 });
  const errors = [];
  page.on('pageerror', (e) => errors.push(String(e)));
  page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()); });
  page.on('dialog', (d) => d.accept());

  const click = async (sel) => { await page.waitForSelector(sel, { visible: true, timeout: 8000 }); await page.click(sel); await wait(80); };
  const text = (sel) => page.$eval(sel, (e) => e.textContent.replace(/\s+/g, ' ').trim());
  const has = async (sel) => !!(await page.$(sel));
  const st = async () => { await wait(300); return page.evaluate((k) => JSON.parse(localStorage.getItem(k)), KEY); };
  const fresh = async () => {
    await page.goto(APP_URL);
    // stub setItem too, so the app's save on unload can't write the old state back
    await page.evaluate((k) => { localStorage.removeItem(k); Storage.prototype.setItem = function () {}; }, KEY);
    await page.goto(APP_URL);
    await click('[data-action="enter"]');
  };
  const finished = () => page.waitForFunction(() => {
    const s = document.querySelector('#run-status');
    return s && s.textContent && !/Loading|Running/.test(s.textContent) && !document.querySelector('#run-btn').disabled;
  }, { timeout: 60000 });
  const result = () => page.evaluate(() => ({
    status: document.querySelector('#run-status').textContent,
    out: (document.querySelector('#run-console .run-out') || {}).textContent || null,
    err: (document.querySelector('#run-console .run-err') || {}).textContent || null,
    tests: (document.querySelector('#tests-summary') || {}).textContent || null,
    note: [...document.querySelectorAll('#run-tests .tests-note')].map((n) => n.textContent).join(' '),
    input: (document.querySelector('#run-tests .case-v') || {}).textContent || '',
  }));
  const run = async () => { await click('#run-btn'); await finished(); return result(); };
  const typeAnswer = async (qid, value) => {
    await page.evaluate((qid, value) => {
      const t = document.querySelector(`textarea[data-qid="${qid}"]`);
      t.value = value;
      t.dispatchEvent(new Event('input', { bubbles: true }));
    }, qid, value);
    await wait(80);
  };

  await page.goto(APP_URL);
  const B = await page.evaluate(() => window.CS61A_BANK);
  const SC = await page.evaluate(() => window.CS61A_SCOPE);
  const isSql = (pid) => B.PROBLEMS[pid].lang === 'sql';
  const finals = Object.keys(B.EXAMS).filter((id) => B.EXAMS[id].kind === 'final');
  const mids = Object.keys(B.EXAMS).filter((id) => B.EXAMS[id].kind === 'mt2');
  ok(finals.join() === 'fa25f,sp25f' && mids.length === 8, `the bank has ${mids.length} midterms and the finals ${finals.join(', ')}`);

  // ── Practice: Exams menu ──
  await fresh();
  await click('[data-action="menu"][data-id="exams"]');
  const subs = await page.$$eval('.dd-panel .dd-sub-name', (e) => e.map((x) => x.textContent));
  ok(subs.join() === 'Midterm 2,Final', `the Exams menu groups exams under Midterm 2 and Final (${subs.join(', ')})`);
  ok((await text('[data-id="exams"] .dd-val')) === 'All exams', 'all exams are selected by default ("All exams")');
  const panel = await page.$eval('.dd-panel', (p) => ({ ovf: getComputedStyle(p).overflowY, max: getComputedStyle(p).maxHeight, sh: p.scrollHeight, ch: p.clientHeight }));
  ok(panel.ovf === 'auto' && panel.max !== 'none' && panel.sh > panel.ch, `the Exams menu has a max height and scrolls (${panel.ch}px shown of ${panel.sh}px)`);
  await page.$eval('.dd-panel', (p) => { p.scrollTop = p.scrollHeight; });
  const before = await page.$eval('.dd-panel', (p) => p.scrollTop);
  await page.click('.dd-panel input[data-pref="exams"][value="sp25f"]'); await wait(150);
  const after = await page.$eval('.dd-panel', (p) => p.scrollTop);
  ok(before > 0 && Math.abs(after - before) <= 2, `checking an option keeps the menu where it was scrolled (${before} → ${after})`);
  ok(!(await st()).prefs.exams.includes('sp25f'), 'unchecking Spring 2025 Final removes it');
  await page.click('[data-action="sources-kind"][data-kind="final"][data-on=""]'); await wait(120);
  let P = (await st()).prefs;
  ok(finals.every((id) => !P.exams.includes(id)) && mids.every((id) => P.exams.includes(id)), 'Final → Clear unchecks every final and keeps the midterms');
  await page.click('[data-action="sources-kind"][data-kind="final"][data-on="1"]'); await wait(120);
  await page.click('[data-action="sources-kind"][data-kind="mt2"][data-on=""]'); await wait(120);
  P = (await st()).prefs;
  ok(finals.every((id) => P.exams.includes(id)) && mids.every((id) => !P.exams.includes(id)), 'Final → Select all and Midterm 2 → Clear leave only the finals');
  await click('[data-action="menu"][data-id="exams"]');
  await page.$eval('#set-size', (i) => { i.value = '200'; i.dispatchEvent(new Event('change', { bubbles: true })); }); await wait(100);
  await click('[data-action="start"]'); await page.waitForSelector('#problem-article');
  let S = await st();
  ok(S.session.groups.length > 10 && S.session.groups.every((g) => finals.includes(B.PROBLEMS[g.pid].exam)), `a Python set of only the finals: ${S.session.groups.length} question groups, all from the finals`);
  ok(S.session.groups.every((g) => !isSql(g.pid)), 'a Python set never includes SQL questions');
  const outPids = Object.keys(SC.problems).filter((pid) => SC.problems[pid].status === 'out');
  ok(S.session.groups.every((g) => !outPids.includes(g.pid)) && !S.session.ids.includes('fa25f-2c'), 'out-of-scope final questions (Scheme, async, tree mutation, orders of growth) are left out');

  // ── Practice: SQL language ──
  await fresh();
  await click('#lang-sql');
  ok((await text('[data-id="exams"] .dd-label')) === 'Exams' && (await text('[data-id="exams"] .dd-val')) === 'All exams', 'with SQL, the second menu is Exams (the finals with SQL questions)');
  await click('[data-action="menu"][data-id="topics"]');
  const sqlTopics = await page.$$eval('.dd-panel input[data-pref="sqlTopics"]', (e) => e.map((x) => x.value));
  ok(sqlTopics.join() === 'sql-joins,sql-agg' && !(await has('.dd-panel input[data-pref="topics"]')), `SQL lists only SQL topics (${sqlTopics.join(', ')})`);
  await click('[data-action="menu"][data-id="topics"]');
  await click('[data-action="start"]'); await page.waitForSelector('#problem-article');
  S = await st();
  ok(S.session.groups.length === 4 && S.session.groups.every((g) => isSql(g.pid)) && /^SQL · /.test(S.session.title), `an SQL set holds the 4 SQL questions, titled "${S.session.title}"`);
  ok((await text('.editor-file')) === 'query.sql' && await page.evaluate(() => document.querySelector('.CodeMirror').CodeMirror.getOption('mode') === 'text/x-sqlite'), 'SQL questions use the SQLite editor mode and a query.sql tab');
  ok(!(await has('#tutor-btn')) && /--/.test(await text('.editor-hint')), 'no Python Tutor, and the hint mentions -- comments');
  ok(/Not all rows are shown/.test(await text('#problem-article')) && /\| Chris\s+\| 2/.test(await page.$eval('#problem-article', (a) => a.textContent)), 'the left pane prints the tables from the exam');

  // fa25f-8a: official answers → the exam's example result, 3/3 tests
  await click('#c-fa25f-8a-2');
  await click('#c-fa25f-8b-5');
  let r = await run();
  ok(/Completed/.test(r.status) && /keyword\s+\| total/.test(r.out) && /tortilla \| 3/.test(r.out), `Run Code prints the result table: ${JSON.stringify((r.out || '').slice(0, 80))}`);
  ok(r.tests === 'Passed 3/3 tests!', `the official answer passes every test (${r.tests})`);
  // a wrong choice that runs fine still fails a test
  await click('#c-fa25f-8b-4');
  r = await run();
  ok(/Completed/.test(r.status) && /unit2/.test(r.out) && /^Passed [0-2]\/3 tests/.test(r.tests), `ORDER BY keyword DESC runs but fails tests (${r.tests})`);
  // a choice SQLite rejects
  await click('#c-fa25f-8a-5');
  r = await run();
  ok(/Error/.test(r.status) && /misuse of aggregate/i.test(r.err || '') && /Tests not run/.test(r.tests || ''), `MAX(COUNT(*)) is an SQLite error, and the tests don't run (${(r.err || '').trim()})`);
  // Check Answer still grades the choices as before
  await click('#c-fa25f-8a-2');
  await click('#c-fa25f-8b-5');

  // fa25f-8b (written answer): typed SQL is graded ignoring case, and Run Code checks the created table
  await click('[data-action="next"]'); await page.waitForSelector('textarea[data-qid="fa25f-8c"]');
  await typeAnswer('fa25f-8c', 'on discussion_id = id group by id having count(*) > 20');
  await click('#part-fa25f-8c [data-action="check"]');
  ok(/correct/i.test(await text('#part-fa25f-8c .feedback, #part-fa25f-8c')) && !(/not match|didn’t match/i.test(await text('#part-fa25f-8c'))), 'a lowercase SQL answer matches the official one');
  r = await run();
  ok(r.tests === 'Passed 3/3 tests!' && /SELECT ta, id FROM big;/.test(r.input), `the CREATE TABLE answer passes the tests that read big (${r.tests})`);
  await typeAnswer('fa25f-8c', 'ON discussion_id = id GROUP BY id HAVING COUNT(*) >= 20');
  r = await run();
  ok(/^Passed [0-2]\/3 tests/.test(r.tests), `>= 20 fails the "exactly 20 students" test (${r.tests})`);

  // sp25f-8b (select-all in SQL): one checked option runs as usual; several are each run and tested on their own
  await click('[data-action="next"]'); await wait(200);
  await click('[data-action="next"]'); await page.waitForSelector('#c-sp25f-8b-6');
  await click('#c-sp25f-8b-6');
  r = await run();
  ok(r.tests === 'Passed 2/2 tests!' && !(await has('.run-option')), `one checked option: a single run, and it passes (${r.tests})`);
  const slot = () => page.evaluate(() => { const e = [...document.querySelectorAll('.cm-slot')].pop(); return { text: e.textContent, more: e.dataset.more || '' }; });
  await click('#c-sp25f-8b-3');
  await click('#c-sp25f-8b-7');
  let sl = await slot();
  ok(sl.text === 'a.size >= b.size * 0.5 AND b.size >= a.size * 0.5' && sl.more === '+2 more', `the blank shows the first checked option and "+2 more" ("${sl.text}" ${sl.more})`);
  const options = async () => { await click('#run-btn'); await finished(); return page.$$eval('.run-option', (os) => os.map((o) => ({ letter: o.dataset.option, sum: (o.querySelector('.run-option-sum') || {}).textContent }))); };
  let opts = await options();
  ok(opts.map((o) => o.letter).join() === 'D,G,H' && opts.every((o) => o.sum === 'Passed 2/2 tests') && /Completed/.test(await text('#run-status')),
    `all three correct options checked: each is run on its own and passes (${opts.map((o) => `${o.letter} ${o.sum}`).join('; ')})`);
  await click('#part-sp25f-8b [data-action="check"]');
  ok(/Correct/.test(await text('#part-sp25f-8b')), 'and Check Answer agrees: correct');
  await click('#c-sp25f-8b-6'); await click('#c-sp25f-8b-7'); // now D (right) and A (wrong)
  await click('#c-sp25f-8b-0');
  opts = await options();
  ok(opts.map((o) => o.letter).join() === 'A,D' && /^Passed [01]\/2/.test(opts[0].sum) && opts[1].sum === 'Passed 2/2 tests', `a right and a wrong option: the results show which one fails (${opts.map((o) => `${o.letter} ${o.sum}`).join('; ')})`);
  sl = await slot();
  ok(sl.text === 'a.size >= b.size * 0.5' && sl.more === '+1 more', 'the blank shows option A (the first checked) and "+1 more"');

  // The same for a Python select-all blank (Spring 2025 Q3(a))
  await page.evaluate((k) => {
    const ids = ['sp25f-3a', 'sp25f-3b', 'sp25f-3c', 'sp25f-3d'];
    const store = { version: 5, prefs: { mode: 'practice', timerOn: false }, session: { ids, index: 0, title: 'Select-all test', answers: { 'sp25f-3a': [0, 2, 4], 'sp25f-3b': 's[t + u - i]', 'sp25f-3c': 2, 'sp25f-3d': 3 }, timer: null, startedAt: Date.now(), finished: false } };
    localStorage.setItem(k, JSON.stringify(store)); Storage.prototype.setItem = function () {};
  }, KEY);
  await page.goto(APP_URL);
  await click('[data-action="enter"]');
  await click('.resume [data-action="resume"]'); await page.waitForSelector('#run-btn');
  await click('#run-btn'); await page.waitForFunction(() => { const s = document.querySelector('#run-status'); return s && /Completed|Error|Timed|Couldn/.test(s.textContent) && !document.querySelector('#run-btn').disabled; }, { timeout: 120000 });
  opts = await page.$$eval('.run-option', (os) => os.map((o) => ({ letter: o.dataset.option, sum: (o.querySelector('.run-option-sum') || {}).textContent })));
  ok(opts.map((o) => o.letter).join() === 'A,C,E' && /^Passed [0-1]\/2/.test(opts[0].sum) && opts[1].sum === 'Passed 2/2 tests' && opts[2].sum === 'Passed 2/2 tests',
    `Python: options A (wrong), C and E (right) each run on their own (${opts.map((o) => `${o.letter} ${o.sum}`).join('; ')})`);

  // ── Exam Mode: full past exam ──
  await fresh();
  await click('#mode-exam');
  ok(/No Gleam questions in this mode/.test(await text('.exam-setup')) && /Practice Mode or a Topic-based exam/.test(await text('.kind-note')), 'Full past exam shows the no-Gleam notice, pointing to Practice Mode and Topic-based exams');
  ok(await has('#exam-type-mt2:checked') && (await page.$$eval('input[name="exam-id"]', (e) => e.map((x) => x.value))).join() === mids.join(), 'Midterm 2 is chosen by default and lists the 8 midterms');
  ok(await page.$eval('#exam-min', (i) => i.value) === '120', 'a midterm starts from 120 minutes');
  await click('#exam-type-final');
  const finalRows = await page.$$eval('.kind-list .kind-opt', (l) => l.map((x) => x.textContent.replace(/\s+/g, ' ').trim()));
  ok(finalRows.length === 2 && /^Fall 2025 Final/.test(finalRows[0]) && /60 points/.test(finalRows[0]) && /^Spring 2025 Final/.test(finalRows[1]) && /57 points/.test(finalRows[1]), `Final lists the finals with in-scope totals: ${finalRows.map((x) => x.slice(0, 45)).join(' / ')}`);
  ok(await page.$eval('#exam-min', (i) => i.value) === '180' && /180 minutes is this site's suggested default for a final/.test(await text('.exam-setup')), 'a final starts from 180 minutes');
  ok((await st()).examPrefs.examKind === 'final' && (await st()).examPrefs.examId === 'fa25f', 'choosing Final selects the first final');
  await click('#exam-type-mt2');
  ok(await page.$eval('#exam-min', (i) => i.value) === '120' && (await st()).examPrefs.examId === 'fa25', 'back to Midterm 2: 120 minutes and the first midterm');
  await page.$eval('#exam-min', (i) => { i.value = '90'; i.dispatchEvent(new Event('input', { bubbles: true })); }); await wait(100);
  await click('#exam-type-final');
  ok(await page.$eval('#exam-min', (i) => i.value) === '90', 'a time typed by the student is kept when switching');
  await click('#exam-id-fa25f');
  await click('#exam-timer-off');
  await click('[data-action="start-exam"]'); await page.waitForSelector('#problem-article');
  const E = (await st()).exam;
  const expectGroups = Object.keys(B.PROBLEMS).filter((pid) => B.PROBLEMS[pid].exam === 'fa25f' && !outPids.includes(pid));
  ok(JSON.stringify(E.groups.map((g) => g.pid)) === JSON.stringify(expectGroups), `the Fall 2025 Final exam: ${E.groups.length} groups in the PDF's order, no Scheme or async`);
  ok(E.groups.some((g) => g.pid === 'fa25f-8a') && !E.ids.includes('fa25f-2c'), 'it keeps its SQL question and drops the order-of-growth part');
  await click('#nav-toggle'); await click('#nav-fa25f-8a'); await wait(200);
  ok(await page.evaluate(() => document.querySelector('.CodeMirror').CodeMirror.getOption('mode') === 'text/x-sqlite') && !(await page.$eval('[data-run-slot]', (s) => !s.hidden)), 'in the exam, the SQL question uses the SQL editor and Run Code is off');

  // ── Exam Mode: topic-based SQL chip ──
  await fresh();
  await click('#mode-exam');
  await click('#exam-kind-custom');
  ok(!(await has('.kind-note')), 'the no-Gleam notice is only for full past exams');
  await click('#xt-sql');
  const picks = await page.$$eval('#pick-list [data-pick]', (e) => e.map((x) => x.dataset.pick));
  ok(picks.length === 4 && picks.every(isSql), `the SQL chip lists the SQL questions only (${picks.join(', ')})`);
  await click('#xt-sql');
  const chipNames = await page.$$eval('.exam-setup [data-action="xtopic"]', (e) => e.map((x) => x.textContent));
  ok(!chipNames.includes('Joins') && !chipNames.includes('Aggregation') && !chipNames.includes('Scheme') && !chipNames.includes('Async'), 'SQL, Scheme and Async topics are not Python topic chips');

  ok(errors.length === 0, `no page errors${errors.length ? `: ${errors.slice(0, 3).join(' | ')}` : ''}`);
  await browser.close();
  console.log(fails ? `\n${fails} FAILED` : '\nAll finals / SQL checks passed');
  process.exit(fails ? 1 : 0);
})().catch((e) => { console.error(e); process.exit(1); });
