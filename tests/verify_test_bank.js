// Validates the verified test suites in app/data/test_suites.js (Phase 6C).
//
// For every suite, the problem's code is filled the way the app fills it (each blank replaced by an answer) and
// run through the same Python harness the browser runner uses (extracted from app/runner.js):
//   - must PASS: the official solution, every accepted alternative in the answer key, and listed alternatives;
//   - must FAIL: every wrong multiple-choice option, every wrong multi-select subset, and every listed
//     plausible wrong answer (tests/test_bank/variants.js).
// It also checks that setups copied from other parts match their official solutions, that excluded problems have
// no suite, and that each suite's recorded `checks` counts match what was run.
const fs = require('fs');
const os = require('os');
const path = require('path');
const { execFileSync } = require('child_process');

const ROOT = path.join(__dirname, '..');
global.window = {};
require(path.join(ROOT, 'app', 'data', 'questions.js'));
require(path.join(ROOT, 'app', 'data', 'final_questions.js'));
require(path.join(ROOT, 'app', 'data', 'test_suites.js'));
const B = window.CS61A_BANK;
// ONLY=<regex> checks just the matching suites (e.g. ONLY=fa25f); PROGRESS=1 prints each version's time to stderr.
const SUITES = window.CS61A_TEST_SUITES.suites.filter((t) => !process.env.ONLY || new RegExp(process.env.ONLY).test(t.id));
const VARIANTS = require('./test_bank/variants.js');
const HARNESS = fs.readFileSync(path.join(ROOT, 'app', 'runner.js'), 'utf8').match(/const HARNESS = String\.raw`([\s\S]*?)`;/)[1];

// Problems that must never get a suite: What Would Python Display, environment diagrams, an order-of-growth
// question, and problems whose choices can't be judged by running code: sp25-3b (any one correct option of its
// select-all blank runs fine) and sp24-4b (in that skeleton the loop always ends with t empty, so the wrong option
// is_strip(s) behaves exactly like the official is_strip(s) and is_strip(t)), and fa23-4a, whose select-all blank (a) has
// three correct options, so no single answer fills it. fa23-5aplus and sp23-2b can't run without part (a)'s definitions, and Run Code
// runs the student's code alone before any tests.
// Finals: What Would Python Display, environment diagrams and orders of growth as above; Fall 2025 Q5 (async, nothing to
// run) and the Scheme questions (not Python); Spring 2025 Q4(b) (graft: tree mutation, out of scope this semester).
// SQL questions are checked by verify_sql_bank.js.
const EXCLUDED = ['fa25-1', 'sp25-1', 'fa25-2', 'sp25-2', 'sp25-2c', 'sp25-3b', 'fa24-1', 'fa24-2', 'sp24-1', 'sp24-2', 'sp24-4b',
  'fa23-1', 'fa23-2', 'fa23-4a', 'fa23-5aplus', 'sp23-1', 'sp23-2b', 'sp23-3a-iii',
  'fa25f-1', 'fa25f-2', 'fa25f-2c', 'fa25f-5', 'fa25f-6b', 'fa25f-6c', 'fa25f-9a', 'fa25f-8a', 'fa25f-8b',
  'sp25f-1', 'sp25f-2', 'sp25f-2c', 'sp25f-4b', 'sp25f-7a', 'sp25f-7b', 'sp25f-8a', 'sp25f-8b',
  // fa24f-4b: MissDict's class body calls Counter() (part (a)), and Run Code runs the student's code alone first.
  'fa24f-4b', 'fa24f-1', 'fa24f-2', 'fa24f-5c', 'fa24f-5c-v', 'fa24f-7a', 'fa24f-7b', 'fa24f-7b-iv', 'fa24f-7c', 'fa24f-8', 'fa24f-9a',
  'sp24f-1', 'sp24f-3b-ii', 'sp24f-3d', 'sp24f-4a', 'sp24f-4b', 'sp24f-5b', 'sp24f-5b-iv', 'sp24f-6', 'sp24f-6d', 'sp24f-7',
  'fa23f-1', 'fa23f-5', 'fa23f-6', 'fa23f-6d', 'fa23f-7', 'fa23f-7d', 'fa23f-8', 'fa23f-9a', 'fa23f-9b',
  'sp23f-1', 'sp23f-2', 'sp23f-5b', 'sp23f-5b-iv', 'sp23f-7', 'sp23f-8b',
  // fa22f-4a: the wrong choices s[:len(s)-1] for (a) and s[1:] for (b) always give the same result (the first number
  // found is never last, and its partner is never first), so running code can't tell them from s.
  'fa22f-4a', 'fa22f-1', 'fa22f-2', 'fa22f-3', 'fa22f-4b', 'fa22f-4c', 'fa22f-8', 'fa22f-9', 'fa22f-11', 'fa22f-12'];

let problems = 0;
const fail = (m) => { console.log(`FAIL  ${m}`); problems++; };

const partsOf = (pid) => B.QUESTIONS.filter((q) => q.problem === pid && q.blank);
// Select-all blanks of the finals are checked one option at a time (each correct option
// alone passes, each wrong one alone fails), the way Run Code tests each checked option of such a blank on its own.
const perOption = (q) => B.PROBLEMS[q.problem].exam.endsWith('f');
const officialAnswer = (q) => {
  const k = B.ANSWER_KEY[q.id];
  if (q.type === 'single_choice') return { choice: typeof k.correct === 'number' ? k.correct : k.correct[0] };
  // A final's select-all blank is filled with its first correct option; see `perOption` below.
  if (q.type === 'multi_select') return perOption(q) ? { choice: k.correct[0] } : { choices: [...k.correct].sort((a, b) => a - b) };
  return { text: k.accepted[0] };
};
const textOf = (q, ans) => {
  if (ans.text !== undefined) return ans.text;
  if (ans.choice !== undefined) return q.choices[ans.choice];
  return ans.choices.map((i) => q.choices[i]).join(' | '); // how the app shows a multi-select answer in a blank
};
// Same fill as the app's runnableCode(): continuation lines are indented to the blank's column.
function fill(pid, answers) {
  return B.PROBLEMS[pid].code.split('\n').map((line) => line.replace(/⟦([^⟧]+)⟧/g, (m, name, col) => {
    const t = answers[name];
    return t === undefined ? `___(${name})___` : t.split('\n').map((l, i) => (i ? ' '.repeat(col) + l : l)).join('\n');
  })).join('\n');
}
const officialTexts = (pid) => Object.fromEntries(partsOf(pid).map((q) => [q.blank, textOf(q, officialAnswer(q))]));
const stripDocstrings = (src) => src.replace(/[ \t]*"""[\s\S]*?"""\n/g, '');
const norm = (s) => s.replace(/\s+/g, ' ').trim();

// ── static checks ──
for (const pid of EXCLUDED) if (SUITES.some((t) => t.problem === pid)) fail(`${pid} is excluded but has a suite`);
const ids = new Set();
for (const t of SUITES) {
  if (ids.has(t.id)) fail(`duplicate suite id ${t.id}`);
  ids.add(t.id);
  if (!B.PROBLEMS[t.problem]) fail(`${t.id}: unknown problem ${t.problem}`);
  if (SUITES.filter((x) => x.problem === t.problem).length > 1) fail(`${t.problem}: more than one suite`);
  if (t.verified !== true || !t.verification || !t.verification.checks) fail(`${t.id}: missing verification record`);
  if (!t.provenance) fail(`${t.id}: missing provenance`);
  if (t.setup && !t.setupNote) fail(`${t.id}: setup provides definitions but has no setupNote shown to students`);
  for (const c of t.cases) if (!/^>>> /m.test(c.input) || !['exam', 'added'].includes(c.origin)) fail(`${t.id}: malformed case ${JSON.stringify(c.input.slice(0, 40))}`);
  for (const from of t.setupFrom || []) {
    if (!norm(t.setup).includes(norm(stripDocstrings(fill(from, officialTexts(from)))))) fail(`${t.id}: setup does not match the official solution of ${from}`);
  }
  if (!VARIANTS[t.problem]) fail(`${t.id}: no wrong-answer variants listed in tests/test_bank/variants.js`);
}

// ── build every variant ──
const jobs = [];
for (const t of SUITES) {
  const pid = t.problem;
  const parts = partsOf(pid);
  const base = officialTexts(pid);
  const add = (label, over, expectPass) => jobs.push({ suite: t.id, label, expectPass, code: fill(pid, { ...base, ...over }), setup: t.setup || '', cases: t.cases.map((c) => c.input) });
  add('official solution', {}, true);
  for (const q of parts) {
    const k = B.ANSWER_KEY[q.id];
    if (q.type === 'single_choice') {
      const right = officialAnswer(q).choice;
      q.choices.forEach((c, i) => { if (i !== right) add(`(${q.blank}) wrong choice: ${c}`, { [q.blank]: c }, false); });
    } else if (q.type === 'multi_select' && officialAnswer(q).choice !== undefined) {
      q.choices.forEach((c, i) => { if (i !== k.correct[0]) add(`(${q.blank}) ${k.correct.includes(i) ? 'correct' : 'wrong'} option alone: ${c}`, { [q.blank]: c }, k.correct.includes(i)); });
    } else if (q.type === 'multi_select') {
      const right = officialAnswer(q).choices.join();
      for (let mask = 1; mask < 1 << q.choices.length; mask++) {
        const pick = q.choices.map((_, i) => i).filter((i) => mask & (1 << i));
        if (pick.join() !== right) add(`(${q.blank}) wrong selection: ${pick.map((i) => q.choices[i]).join(' + ')}`, { [q.blank]: textOf(q, { choices: pick }) }, false);
      }
    } else {
      k.accepted.slice(1).forEach((a) => add(`(${q.blank}) accepted alternative: ${a}`, { [q.blank]: a }, true));
    }
  }
  const v = VARIANTS[pid] || {};
  (v.alternatives || []).forEach((over) => add(`alternative: ${JSON.stringify(over)}`, over, true));
  (v.wrong || []).forEach((over) => add(`wrong: ${JSON.stringify(over)}`, over, false));
}

// ── run them in Python with the browser's harness ──
const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'testbank-'));
fs.writeFileSync(path.join(dir, 'harness.py'), HARNESS);
fs.writeFileSync(path.join(dir, 'jobs.json'), JSON.stringify(jobs));
let results;
try {
  results = JSON.parse(execFileSync('python3', ['-I', path.join(__dirname, 'verify_test_bank.py'), dir], { encoding: 'utf8', maxBuffer: 64 * 1024 * 1024, stdio: ['ignore', 'pipe', process.env.PROGRESS ? 'inherit' : 'pipe'], env: { ...process.env } }));
} catch (e) {
  console.log(e.stdout || '', e.stderr || '');
  process.exit(1);
}

const counts = {};
jobs.forEach((j, i) => {
  const r = results[i];
  const c = counts[j.suite] || (counts[j.suite] = { passing: 0, failing: 0 });
  c[j.expectPass ? 'passing' : 'failing']++;
  if (r.passed !== j.expectPass) {
    fail(`${j.suite}: ${j.label} → expected to ${j.expectPass ? 'pass' : 'fail'} but ${r.passed ? 'passed' : `failed (${r.summary})`}`);
  }
});
for (const t of SUITES) {
  const c = counts[t.id];
  const rec = t.verification.checks;
  const line = `${t.id}: ${t.cases.length} cases · ${c.passing} correct versions pass · ${c.failing} wrong versions caught`;
  if (rec.passing !== c.passing || rec.failing !== c.failing) fail(`${line} (record says ${rec.passing} / ${rec.failing}; update verification.checks)`);
  else console.log(`ok    ${line}`);
}
console.log(problems ? `\n${problems} problem(s)` : `\nAll ${SUITES.length} suites verified (${jobs.length} versions run)`);
process.exit(problems ? 1 : 0);
