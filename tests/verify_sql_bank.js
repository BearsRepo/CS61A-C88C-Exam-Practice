// Validates the SQL questions and their Run Code tests (app/data/sql_tests.js) with the SQLite build the site ships
// (app/vendor/sqljs/sql_bundle.js) and the runner's own checking code (app/sql_runner.js):  node tests/verify_sql_bank.js
//
// For every SQL problem, the code is filled the way the app fills it (each blank replaced by an answer), then:
//   - must PASS every case: the official answer and every accepted alternative;
//   - must FAIL at least one case: every wrong multiple-choice option and every plausible wrong answer in WRONG below.
// A select-all blank is checked one option at a time (each correct option alone passes, each wrong one alone fails), the
// way Run Code tests each checked option on its own.
// It also checks that each question's printed tables load and that the official answer runs on them.
'use strict';
const fs = require('fs');
const os = require('os');
const path = require('path');
const vm = require('vm');

const ROOT = path.join(__dirname, '..');
const sandbox = { window: {} };
vm.createContext(sandbox);
for (const f of ['questions.js', 'final_questions.js', 'sql_tests.js']) {
  vm.runInContext(fs.readFileSync(path.join(ROOT, 'app', 'data', f), 'utf8'), sandbox, { filename: f });
}
const B = sandbox.window.CS61A_BANK;
const SUITES = sandbox.window.CS61A_SQL_TESTS.suites;
const { sqlCore } = require(path.join(ROOT, 'app', 'sql_runner.js'));
const CORE = sqlCore();

// Plausible wrong answers for written blanks (the suite must catch each one).
const WRONG = {
  // fa23f-8: a bare price * k (no MIN) isn't listed: SQLite picks the cheapest row here in every order tried, so no data set can catch it.
  'fa23f-8': [
    { a: 'MIN(price)' },
    { a: 'SUM(price) * k' },
    { a: 'MAX(price) * k' },
    { c: 'kind=dough' },
    { c: 'choice=flavor' },
    { c: 'kind=dough OR choice=flavor' },
  ],
  'fa24f-8': [
    { c: 'GROUP BY job' },
    { c: 'GROUP BY job HAVING COUNT(*) > 1' },
    { c: 'HAVING COUNT(*) = 1' },
    { c: 'GROUP BY name HAVING COUNT(*) = 1' },
    { c: '' },
  ],
  'fa25f-8b': [
    { c: 'ON discussion_id = id GROUP BY id HAVING COUNT(*) >= 20' },
    { c: 'ON discussion_id = id HAVING COUNT(*) > 20' },
    { c: 'ON discussion_id = id GROUP BY ta HAVING COUNT(*) > 20' },
    { c: 'ON discussion_id = id WHERE COUNT(*) > 20' },
    { c: 'GROUP BY id HAVING COUNT(*) > 20' },
    { c: 'ON discussion_id = id GROUP BY id HAVING COUNT(*) > 20 LIMIT 1' },
    { c: 'ON discussion_id = id GROUP BY id ORDER BY COUNT(*) DESC LIMIT 1' },
    { c: 'ON discussion_id = id GROUP BY id' },
  ],
};

let problems = 0;
const fail = (m) => { console.log(`FAIL  ${m}`); problems++; };

function fill(pid, answers) {
  return B.PROBLEMS[pid].code.split('\n').map((line) => line.replace(/⟦([^⟧]+)⟧/g, (m, name, col) => {
    const t = answers[name];
    return t === undefined ? `___(${name})___` : t.split('\n').map((l, i) => (i ? ' '.repeat(col) + l : l)).join('\n');
  })).join('\n');
}

(async () => {
  const bundle = fs.readFileSync(path.join(ROOT, 'app', 'vendor', 'sqljs', 'sql_bundle.js'), 'utf8');
  const assets = vm.runInNewContext(`${bundle}; window.CS61A_SQL_ASSETS`, { window: {} });
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'sqljs-'));
  fs.writeFileSync(path.join(tmp, 'sql-wasm.js'), assets.glue);
  const initSqlJs = require(path.join(tmp, 'sql-wasm.js'));
  const SQL = await initSqlJs({ wasmBinary: Buffer.from(assets.wasm, 'base64') });

  const sqlPids = Object.keys(B.PROBLEMS).filter((pid) => B.PROBLEMS[pid].lang === 'sql');
  for (const pid of sqlPids) if (!SUITES[pid]) fail(`${pid}: SQL question without tests in sql_tests.js`);
  for (const pid of Object.keys(SUITES)) if (!sqlPids.includes(pid)) fail(`sql_tests.js: ${pid} is not an SQL question`);

  let versions = 0;
  for (const pid of sqlPids.filter((p) => SUITES[p])) {
    const pr = B.PROBLEMS[pid];
    const suite = SUITES[pid];
    const parts = B.QUESTIONS.filter((q) => q.problem === pid && q.blank);
    const official = {};
    for (const q of parts) {
      const k = B.ANSWER_KEY[q.id];
      official[q.blank] = q.type === 'single_choice' ? q.choices[k.correct] : q.type === 'multi_select' ? q.choices[k.correct[0]] : k.accepted[0];
    }
    // The printed tables load, and the official answer runs on them.
    {
      const db = new SQL.Database();
      const setup = CORE.runScript(db, pr.sqlSetup || '');
      if (setup.error) fail(`${pid}: sqlSetup fails: ${setup.error}`);
      const r = CORE.runScript(db, fill(pid, official));
      if (r.error) fail(`${pid}: the official answer raises on the printed tables: ${r.error}`);
      db.close();
    }
    const versionsFor = [{ label: 'official answer', over: {}, pass: true }];
    for (const q of parts) {
      const k = B.ANSWER_KEY[q.id];
      if (q.type === 'single_choice') q.choices.forEach((c, i) => { if (i !== k.correct) versionsFor.push({ label: `(${q.blank}) wrong choice: ${c}`, over: { [q.blank]: c }, pass: false }); });
      else if (q.type === 'multi_select') q.choices.forEach((c, i) => versionsFor.push({ label: `(${q.blank}) ${k.correct.includes(i) ? 'correct' : 'wrong'} option alone: ${c}`, over: { [q.blank]: c }, pass: k.correct.includes(i) }));
      else k.accepted.slice(1).forEach((a) => versionsFor.push({ label: `(${q.blank}) accepted alternative: ${a}`, over: { [q.blank]: a }, pass: true }));
    }
    (WRONG[pid] || []).forEach((over) => versionsFor.push({ label: `wrong: ${JSON.stringify(over)}`, over, pass: false }));
    let passing = 0, failing = 0;
    for (const v of versionsFor) {
      versions++;
      const code = fill(pid, { ...official, ...v.over });
      const results = suite.cases.map((c) => CORE.runCase(SQL, code, pr.sqlSetup || '', c, 200));
      const passed = results.every((r) => r.ok);
      if (passed !== v.pass) {
        const bad = results.findIndex((r) => !r.ok);
        fail(`${pid}: ${v.label} → expected to ${v.pass ? 'pass' : 'fail'} but ${passed ? 'passed every case' : `failed case ${bad + 1} (${results[bad].error || `got\n${results[bad].got}`})`}`);
      } else if (v.pass) passing++; else failing++;
    }
    for (const c of suite.cases) if (!['exam', 'added'].includes(c.origin) || typeof c.input !== 'string' || !Array.isArray(c.expect)) fail(`${pid}: malformed case "${c.name}"`);
    console.log(`${problems ? '' : 'ok    '}${pid}: ${suite.cases.length} cases · ${passing} correct versions pass · ${failing} wrong versions caught`);
  }
  fs.rmSync(tmp, { recursive: true, force: true });
  console.log(problems ? `\n${problems} problem(s)` : `\nAll ${sqlPids.length} SQL questions verified (${versions} versions run)`);
  process.exit(problems ? 1 : 0);
})().catch((e) => { console.error(e); process.exit(1); });
