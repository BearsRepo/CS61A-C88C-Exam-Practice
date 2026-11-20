// My Progress → Topics to Review: radar chart + two rings + topic picker, and the rules behind the numbers.
//   - each question part counts once; accuracy uses its FIRST try ever (Practice: first Check in a set; Exam: its
//     automatic grade), whichever came first; only correct / incorrect count (not "not an exact match")
//   - "Still incorrect" uses each part's LATEST result, Practice or Exam
//   - improvement (Jacob's split, 4+ parts): later half vs earlier half of the parts in the order first tried; parts
//     tried at the same moment (one exam) stay in the same half
//   - left ring: green 70%+, yellow 50–69%, red under 50%; right ring fills by still wrong ÷ tried (green ≤ 30%,
//     yellow ≤ 50%, red above)
//   - the charts draw in when scrolled into view and when the topic changes; reduce motion shows them at once
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
  await page.setViewport({ width: 1200, height: 700 });
  const errors = [];
  page.on('pageerror', (e) => errors.push(String(e)));
  page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()); });
  page.on('dialog', (d) => d.accept());
  const click = async (sel) => { await page.waitForSelector(sel, { visible: true, timeout: 8000 }); await page.click(sel); await wait(120); };
  const text = (sel) => page.$eval(sel, (e) => e.textContent.replace(/\s+/g, ' ').trim());
  const has = async (sel) => !!(await page.$(sel));
  const seed = async (obj) => {
    await page.goto(APP_URL);
    await page.evaluate((k, v) => { localStorage.setItem(k, v); Storage.prototype.setItem = function () {}; }, KEY, JSON.stringify(obj));
    await page.goto(APP_URL);
    await click('[data-action="enter"]');
    await click('[data-action="progress"]');
  };
  const showCharts = async () => { await page.evaluate(() => document.getElementById('tr-sec').scrollIntoView()); await wait(1500); };
  const rings = () => page.evaluate(() => ['.ring-pct', '.ring-wrong'].map((sel) => {
    const r = document.querySelector(sel);
    return { band: [...r.classList].find((c) => c.startsWith('band-')), text: r.querySelector('.ring-mid b').textContent, small: (r.querySelector('.ring-mid small') || {}).textContent || '',
      off: Number(getComputedStyle(r.querySelector('.ring-arc')).strokeDashoffset.replace('px', '')), c: Number(r.querySelector('.ring-arc').style.getPropertyValue('--c')) };
  }));
  const rows = () => page.$$eval('#tr-sec .mp-topic', (t) => t.map((x) => ({ topic: x.dataset.topic, meta: x.querySelector('.mp-topic-n').textContent, up: (x.querySelector('.tr-up') || {}).textContent || null, go: !!x.querySelector('.mp-topic-go') })));
  const stats = () => page.$$eval('.mp-stat b', (b) => b.map((x) => x.textContent));
  const pick = async (t) => { await page.select('#tr-topic', t); await wait(150); await showCharts(); };

  await page.goto(APP_URL);
  // four multiple-choice Trees parts from different questions, and a short answer from another question
  const P = await page.evaluate(() => {
    const B = window.CS61A_BANK;
    const seen = new Set();
    const trees = B.QUESTIONS.filter((q) => q.type === 'single_choice' && q.topics.includes('trees') && !q.problem.startsWith('sp24-1') && !seen.has(q.problem) && seen.add(q.problem)).slice(0, 4);
    const u = B.QUESTIONS.find((q) => q.type === 'short_answer' && !seen.has(q.problem) && B.ANSWER_KEY[q.id] && B.ANSWER_KEY[q.id].accepted);
    const prob = Object.fromEntries(trees.concat(u).map((q) => [q.id, q.problem]));
    return { a: trees[0].id, b: trees[1].id, c: trees[2].id, d: trees[3].id, u: u.id, prob, topics: Object.fromEntries(trees.concat(u).map((q) => [q.id, q.topics])) };
  });
  const groupsOf = (ids) => ids.map((id) => ({ pid: P.prob[id], ids: [id] }));
  const now = Date.now(), H = 3600000;
  const T1 = now - 4 * H, T2 = now - 3 * H, T3 = now - 2 * H;
  const practice = (id, ids, startedAt, first, last) => ({ id, ids, groups: groupsOf(ids), index: 0, title: id, answers: Object.fromEntries(ids.map((x) => [x, 0])),
    checked: Object.fromEntries(Object.entries(last).map(([k, v]) => [k, v[0]])), firstCheck: first, lastCheck: last, timer: null, startedAt, finishedAt: startedAt + 600000, finished: true, notes: {}, annotations: {} });
  const exam = (id, ids, graded, at) => ({ id, mode: 'exam', kind: 'custom', examId: null, title: `Custom exam · ${ids.length} questions`, ids, groups: groupsOf(ids), index: 0,
    answers: Object.fromEntries(ids.map((x) => [x, 0])), graded, score: { v: 2, earned: 0, possible: 1, auto: 1, counts: {}, staff: 0, unknown: 0, partial: false },
    notes: {}, annotations: {}, eliminated: {}, checked: {}, revealed: {}, selfGrade: {}, marked: {}, timer: null, startedAt: at - 60000, finishedAt: at, finished: true, submitted: true });
  // S1 (T1): a wrong on the first Check then right on a retry; b wrong; u "not an exact match"
  const S1 = practice('s1', [P.a, P.b, P.u], T1, { [P.a]: ['incorrect', T1], [P.b]: ['incorrect', T1 + 1], [P.u]: ['unmatched', T1 + 2] },
    { [P.a]: ['correct', T1 + 60000], [P.b]: ['incorrect', T1 + 1], [P.u]: ['unmatched', T1 + 2] });
  // S2 (T2): b right; E1 (T3, Completed): c and d right, a wrong again
  const S2 = practice('s2', [P.b], T2, { [P.b]: ['correct', T2] }, { [P.b]: ['correct', T2] });
  const E1 = exam('e1', [P.c, P.d, P.a], { [P.c]: 'correct', [P.d]: 'correct', [P.a]: 'incorrect' }, T3);

  // ── the rules ──
  await seed({ version: 5, prefs: { mode: 'practice' }, practice: [S1, S2], attempts: [E1] });
  let st = await stats();
  ok(st[1] === '5', `Questions Practiced: Checked practice parts and answered exam parts, each question once (${st[1]})`);
  ok(st[2] === '50%', `Automatic Accuracy: each part's first try ever, Practice or Exam (a, b wrong; c, d right; u not an exact match, left out): ${st[2]}`);
  await showCharts();
  let R = await rings();
  ok(R[0].text === '50%' && R[0].band === 'band-mid', `left ring: 50% correct on the first try, yellow (${R[0].text}, ${R[0].band})`);
  ok(R[1].text === '1' && R[1].small === 'of 4 tried' && R[1].band === 'band-good', `right ring: 1 still incorrect of 4 tried (a: wrong again in the later exam; b: fixed in practice), green (${R[1].text} ${R[1].small}, ${R[1].band})`);
  ok(Math.abs(R[1].off - R[1].c * 0.75) < 1 && Math.abs(R[0].off - R[0].c * 0.5) < 1, `rings fill by their share: left 50%, right 1 of 4 (offsets ${R[0].off.toFixed(1)}/${R[0].c.toFixed(1)}, ${R[1].off.toFixed(1)}/${R[1].c.toFixed(1)})`);
  let rw = await rows();
  const tr = rw.find((r) => r.topic === 'trees');
  ok(tr && tr.meta === '1 incorrect · 50% correct' && tr.up === '+100%' && tr.go, `Trees row: "${tr && tr.meta}", improvement ${tr && tr.up} (first two tries wrong, later two right), Start topic exam`);
  ok(rw.length && rw.every((r, i) => i === 0 || Number(rw[i - 1].meta.split(' ')[0]) >= Number(r.meta.split(' ')[0])), 'All: topics listed most incorrect first');
  const greenUp = await page.$eval('#tr-sec .tr-up', (e) => getComputedStyle(e).color);
  ok(greenUp === 'rgb(29, 122, 58)', `the improvement badge is green (${greenUp})`);

  // ── the radar ──
  let labels = await page.$$eval('.rd-label tspan:first-child', (t) => t.map((x) => x.textContent));
  ok(labels.length === 12 && labels.includes('Gleam') && labels.includes('SQL') && labels.includes('Trees'), `All: one axis per Python topic plus Gleam and SQL (${labels.length}: ${labels.join(', ')})`);
  const treesVal = await page.$$eval('.rd-label', (l) => { const x = l.find((e) => e.querySelector('tspan').textContent === 'Trees'); return x.querySelector('.rd-val').textContent; });
  const gleamVal = await page.$$eval('.rd-label', (l) => { const x = l.find((e) => e.querySelector('tspan').textContent === 'Gleam'); return x.querySelector('.rd-val').textContent; });
  ok(treesVal === '50%' && gleamVal === '—', `axis values are first-try % correct; a topic never tried shows — (Trees ${treesVal}, Gleam ${gleamVal})`);
  await pick('trees');
  labels = await page.$$eval('.rd-label tspan:first-child', (t) => t.map((x) => x.textContent));
  ok(labels.length >= 3 && labels.length <= 6 && labels.includes('+ Recursion') && labels.every((l) => l === 'Trees only' || l.startsWith('+ ') || l === 'Trees overall'), `one topic: its own axes, named by the real tag pairs (${labels.join(', ')})`);
  rw = await rows();
  ok(rw.length === 1 && rw[0].topic === 'trees', 'one topic: the list shows that topic’s row');
  await pick('sql-joins');
  const spokes = await page.$$eval('.rd-spoke', (s) => s.length);
  ok(spokes >= 3, `a topic with few pairs still has a radar, at least a triangle (${spokes} axes)`);
  rw = await rows();
  ok(rw.length === 1 && rw[0].meta === 'Not tried yet', 'a topic not tried yet says so');
  R = await rings();
  ok(R[0].text === '—' && R[1].text === '—' && R[0].band === 'band-none', 'its rings show — and stay empty');

  // ── one exam alone never shows an improvement; red bands ──
  const E2 = exam('e2', [P.a, P.b, P.c, P.d], { [P.a]: 'incorrect', [P.b]: 'incorrect', [P.c]: 'incorrect', [P.d]: 'correct' }, T3);
  await seed({ version: 5, prefs: { mode: 'practice' }, attempts: [E2] });
  await showCharts();
  rw = await rows();
  ok(!rw.some((r) => r.up), 'one exam on its own: no improvement badge (its parts were all tried at the same moment)');
  R = await rings();
  ok(R[0].text === '25%' && R[0].band === 'band-bad' && R[1].text === '3' && R[1].band === 'band-bad', `25% correct is red; 3 of 4 still wrong is red (${R[0].band}, ${R[1].band})`);
  const E3 = exam('e3', [P.a, P.b], { [P.a]: 'incorrect', [P.b]: 'incorrect' }, T3);
  await seed({ version: 5, prefs: { mode: 'practice' }, attempts: [E3] });
  await showCharts();
  R = await rings();
  ok(Math.abs(R[1].off) < 1, 'every part tried still wrong: the right ring is full');

  // ── animation (a short window, so the charts start below the fold) ──
  await page.setViewport({ width: 1200, height: 420 });
  await seed({ version: 5, prefs: { mode: 'practice' }, practice: [S1, S2], attempts: [E1] });
  await page.evaluate(() => window.scrollTo(0, 0)); await wait(200);
  const below = await page.evaluate(() => document.getElementById('tr-sec').getBoundingClientRect().top > window.innerHeight);
  ok(below && await has('.tr-charts.anim'), 'before the charts scroll into view: not drawn yet');
  const before = await page.$eval('.rd-shape', (g) => getComputedStyle(g).transform);
  ok(/matrix\(0, 0, 0, 0/.test(before), `the radar shape starts at the centre (${before})`);
  await page.evaluate(() => document.getElementById('tr-sec').scrollIntoView()); await wait(350);
  const mid = await page.evaluate(() => ({ anim: !!document.querySelector('.tr-charts.anim'), pct: document.querySelector('.ring-pct .ring-mid b').textContent, scale: getComputedStyle(document.querySelector('.rd-shape')).transform }));
  ok(!mid.anim && mid.pct !== '50%' && !/matrix\(1, 0, 0, 1/.test(mid.scale), `scrolling into view starts drawing: the radar grows and the numbers count up (at 0.35 s: ${mid.pct}, ${mid.scale})`);
  await wait(1100);
  const end = await page.evaluate(() => ({ pct: document.querySelector('.ring-pct .ring-mid b').textContent, scale: getComputedStyle(document.querySelector('.rd-shape')).transform }));
  ok(end.pct === '50%' && /matrix\(1, 0, 0, 1/.test(end.scale), `after about a second everything is drawn (${end.pct})`);
  await click('[data-action="menu"][data-id="hfilter"]');
  ok(!(await has('.tr-charts.anim')), 'other changes on the page (opening the Filter menu) do not replay the animation');
  await page.mouse.click(5, 5); await wait(150);
  await page.select('#tr-topic', 'trees'); await wait(50);
  ok(await page.evaluate(() => { const el = document.querySelector('.tr-charts'); return el.classList.contains('anim') || getComputedStyle(document.querySelector('.rd-shape')).transform !== 'matrix(1, 0, 0, 1, 0, 0)'; }), 'changing the topic draws the charts again');
  // reduce motion
  await page.setViewport({ width: 1200, height: 700 });
  await page.emulateMediaFeatures([{ name: 'prefers-reduced-motion', value: 'reduce' }]);
  await seed({ version: 5, prefs: { mode: 'practice' }, practice: [S1, S2], attempts: [E1] });
  await page.evaluate(() => document.getElementById('tr-sec').scrollIntoView()); await wait(120);
  const rm = await page.evaluate(() => ({ anim: !!document.querySelector('.tr-charts.anim'), pct: document.querySelector('.ring-pct .ring-mid b').textContent, scale: getComputedStyle(document.querySelector('.rd-shape')).transform }));
  ok(!rm.anim && rm.pct === '50%' && /matrix\(1, 0, 0, 1/.test(rm.scale), `reduce motion: drawn at once, no counting (${rm.pct})`);
  await page.emulateMediaFeatures([]);

  // ── empty, and phone width ──
  await seed({ version: 5, prefs: { mode: 'practice' } });
  await showCharts();
  ok(await has('#tr-sec .rd') && /Answer questions in Practice or Exam Mode/.test(await text('#tr-sec .mp-empty')), 'nothing tried yet: an empty radar grid and a hint');

  // ── a real practice set: wrong on the first Check, right on a retry → first try wrong, nothing still wrong ──
  const choices = await page.evaluate((id) => ({ n: window.CS61A_BANK.QUESTIONS.find((q) => q.id === id).choices.length, right: window.CS61A_BANK.ANSWER_KEY[id].correct }), P.a);
  await page.goto(APP_URL);
  await page.evaluate((k, id) => { localStorage.setItem(k, JSON.stringify({ version: 5, prefs: { mode: 'practice' }, session: { ids: [id], index: 0, title: 'Live set', answers: {}, timer: null, startedAt: Date.now(), finished: false } })); Storage.prototype.setItem = function () {}; }, KEY, P.a);
  await page.goto(APP_URL); await click('[data-action="enter"]'); await click('.resume [data-action="resume"]'); await page.waitForSelector('#pane-right .part');
  await page.click(`label[for="c-${P.a}-${(choices.right + 1) % choices.n}"]`); await wait(100);
  await page.click(`#part-${P.a} [data-action="check"]`); await wait(150);
  await page.click(`label[for="c-${P.a}-${choices.right}"]`); await wait(100);
  await page.click(`#part-${P.a} [data-action="check"]`); await wait(300);
  const live = await page.evaluate((k, id) => { const s = JSON.parse(localStorage.getItem(k)).session; return { first: s.firstCheck && s.firstCheck[id] && s.firstCheck[id][0], last: s.lastCheck && s.lastCheck[id] && s.lastCheck[id][0] }; }, KEY, P.a);
  ok(live.first === 'incorrect' && live.last === 'correct', `Check records the first try and the latest result (${live.first} → ${live.last})`);
  await click('[data-action="home"]'); await click('[data-action="progress"]'); await showCharts();
  R = await rings();
  st = await stats();
  ok(R[0].text === '0%' && R[1].text === '0' && st[1] === '1' && st[2] === '0%', `retrying until right does not raise accuracy (${R[0].text}), and the part is no longer "still incorrect" (${R[1].text})`);
  await seed({ version: 5, prefs: { mode: 'practice' }, practice: [S1, S2], attempts: [E1] });
  await page.setViewport({ width: 390, height: 800 }); await wait(200);
  ok(await page.evaluate(() => document.documentElement.scrollWidth <= 390), 'phone width: no sideways scroll');
  const stacked = await page.evaluate(() => document.querySelector('.tr-side').getBoundingClientRect().top >= document.querySelector('.tr-rings').getBoundingClientRect().bottom);
  ok(stacked, 'phone width: the charts sit above the topic list');

  ok(errors.length === 0, `no page errors${errors.length ? `: ${errors.slice(0, 3).join(' | ')}` : ''}`);
  await browser.close();
  console.log(fails ? `\n${fails} FAILED` : '\nAll Topics to Review checks passed');
  process.exit(fails ? 1 : 0);
})().catch((e) => { console.error(e); process.exit(1); });
