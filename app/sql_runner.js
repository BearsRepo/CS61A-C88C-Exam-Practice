// Browser SQL runner: the SQL counterpart of runner.js and gleam_runner.js, with the same API and result shape, so the
// Run Code panel and the Test Results list work unchanged.
//
// How a run works
//   - SQLite is sql.js (SQLite compiled to WebAssembly), vendored in vendor/sqljs/sql_bundle.js by
//     tools/vendor_sqljs.mjs. The bundle is added as a <script> on the first SQL run only, and works on file:// pages
//     as well as when served. CS 61A uses SQLite, so its functions and quirks (two-argument MIN/MAX, `||`) match.
//   - Everything runs in a dedicated Web Worker created from a Blob URL, like the other runners. Each run starts from a
//     new, empty database: the question's tables (`tables`, the rows printed with the question), then the student's
//     SQL, one statement at a time. Every statement that returns rows (a SELECT) prints a table to Console Output; an
//     error stops the run and is shown after any tables printed before it.
//   - A run, or one test case, that exceeds RUN_TIMEOUT_MS is stopped by terminating the worker.
//
// Tests (data/sql_tests.js): each case brings its own `data` (SQL that creates and fills the tables) or uses the
// question's tables, runs the student's SQL on it, then runs `input` (a query, e.g. SELECT * FROM big) or, when `input`
// is empty, takes the result of the student's last statement that returned rows. It passes when the rows equal
// `expect` (in order when `ordered`, otherwise as a multiset). Numbers are compared numerically.
(function () {
  'use strict';

  const config = {
    bundleURL: 'vendor/sqljs/sql_bundle.js',
    LOAD_TIMEOUT_MS: 30000,
    RUN_TIMEOUT_MS: 5000,
    OUTPUT_LIMIT: 20000,
    ROW_LIMIT: 200, // rows printed per table in Console Output
  };

  // ── SQL helpers (pure; run inside the worker and, through module.exports, by tests/verify_sql_bank.js) ──
  function sqlCore() {
    const show = (v) => (v === null || v === undefined ? 'NULL' : v instanceof Uint8Array ? `<${v.length} bytes>` : String(v));
    // A result table as aligned text, like the exams print them: a header, a rule, then one line per row.
    function formatTable(columns, rows, rowLimit) {
      const shown = rowLimit && rows.length > rowLimit ? rows.slice(0, rowLimit) : rows;
      const cells = [columns.map(String)].concat(shown.map((r) => r.map(show)));
      const widths = columns.map((_, i) => Math.max(...cells.map((r) => (r[i] || '').length)));
      const line = (r) => r.map((c, i) => (i === r.length - 1 ? c : c.padEnd(widths[i]))).join(' | ');
      const out = [line(cells[0]), widths.map((w) => '-'.repeat(w)).join('-+-')].concat(cells.slice(1).map(line));
      if (shown.length < rows.length) out.push(`… ${rows.length - shown.length} more rows`);
      if (!rows.length) out.push('(no rows)');
      return out.join('\n');
    }
    // Runs a script statement by statement. Returns every result that has columns, and the first error (if any).
    function runScript(db, sql) {
      const results = [];
      try {
        for (const stmt of db.iterateStatements(sql)) {
          try {
            const columns = stmt.getColumnNames();
            const rows = [];
            while (stmt.step()) rows.push(stmt.get());
            if (columns.length) results.push({ columns, rows });
          } finally { stmt.free(); }
        }
        return { results, error: null };
      } catch (err) {
        return { results, error: String(err && err.message ? err.message : err) };
      }
    }
    const sameValue = (a, b) => (typeof a === 'number' && typeof b === 'number' ? Math.abs(a - b) <= 1e-9 * Math.max(1, Math.abs(a), Math.abs(b)) : a === b);
    const sameRow = (a, b) => a.length === b.length && a.every((v, i) => sameValue(v, b[i]));
    const key = (r) => JSON.stringify(r.map((v) => (typeof v === 'number' ? Number(v.toPrecision(12)) : v)));
    function sameRows(got, want, ordered) {
      if (got.length !== want.length) return false;
      if (ordered) return got.every((r, i) => sameRow(r, want[i]));
      const a = got.map(key).sort(), b = want.map(key).sort();
      return a.every((k, i) => k === b[i]);
    }
    // One test case on a fresh database. Returns { ok, error, got: text, want: text }.
    function runCase(SQL, code, tables, c, rowLimit) {
      const db = new SQL.Database();
      try {
        const data = typeof c.data === 'string' ? c.data : tables;
        const setup = runScript(db, data || '');
        if (setup.error) return { ok: false, error: `The test data could not be created: ${setup.error}` };
        const student = runScript(db, code);
        if (student.error) return { ok: false, error: student.error };
        let res;
        if (c.input && c.input.trim()) {
          const check = runScript(db, c.input);
          if (check.error) return { ok: false, error: check.error, want: formatTable(c.columns || [], c.expect, rowLimit) };
          res = check.results[check.results.length - 1];
        } else res = student.results[student.results.length - 1];
        const columns = c.columns || (res ? res.columns : []);
        const want = formatTable(columns, c.expect, rowLimit);
        if (!res) return { ok: false, error: null, want, got: '(your SQL returned no table)' };
        const ok = res.rows.every((r) => r.length === (c.expect[0] || r).length) && sameRows(res.rows, c.expect, !!c.ordered);
        return { ok, error: null, want, got: formatTable(res.columns, res.rows, rowLimit) };
      } finally { db.close(); }
    }
    return { formatTable, runScript, sameRows, runCase };
  }

  // ── Worker ──
  function workerMain() {
    /* global CORE, initSqlJs */
    let SQL = null;
    self.onmessage = async (e) => {
      const m = e.data;
      if (m.type === 'init') {
        try {
          const url = URL.createObjectURL(new Blob([m.glue], { type: 'text/javascript' }));
          importScripts(url);
          URL.revokeObjectURL(url);
          const bin = atob(m.wasm);
          const bytes = new Uint8Array(bin.length);
          for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
          SQL = await initSqlJs({ wasmBinary: bytes });
          self.postMessage({ type: 'ready' });
        } catch (err) {
          self.postMessage({ type: 'init-error', message: String(err && err.message ? err.message : err) });
        }
        return;
      }
      if (m.type === 'run') {
        const db = new SQL.Database();
        let stdout = '', truncated = false, error = null;
        try {
          const setup = CORE.runScript(db, m.tables || '');
          if (setup.error) error = `The question's tables could not be created: ${setup.error}`;
          else {
            const r = CORE.runScript(db, m.code);
            stdout = r.results.map((t) => CORE.formatTable(t.columns, t.rows, m.rowLimit)).join('\n\n');
            if (stdout.length > m.limit) { stdout = stdout.slice(0, m.limit); truncated = true; }
            if (r.error) error = `Error: ${r.error}`;
          }
        } finally { db.close(); }
        self.postMessage({ type: 'result', id: m.id, stdout, error, truncated });
        return;
      }
      if (m.type === 'test') {
        const r = CORE.runCase(SQL, m.code, m.tables, m.case, m.rowLimit);
        self.postMessage({ type: 'case', id: m.id, result: r });
      }
    };
  }

  // ── Main thread ──
  let assetsPromise = null;
  function loadAssets() {
    if (window.CS61A_SQL_ASSETS) return Promise.resolve(window.CS61A_SQL_ASSETS);
    if (assetsPromise) return assetsPromise;
    assetsPromise = new Promise((resolve, reject) => {
      const s = document.createElement('script');
      s.src = config.bundleURL;
      s.onload = () => (window.CS61A_SQL_ASSETS ? resolve(window.CS61A_SQL_ASSETS) : reject(new Error('The SQLite bundle is empty.')));
      s.onerror = () => reject(new Error('SQLite could not be loaded.'));
      document.head.appendChild(s);
    }).catch((err) => { assetsPromise = null; throw err; });
    return assetsPromise;
  }

  let worker = null;
  let starting = null;
  let chain = Promise.resolve();
  let seq = 0;

  function discard() {
    if (worker) worker.terminate();
    worker = null;
  }

  function startWorker() {
    if (worker) return Promise.resolve(worker);
    if (starting) return starting;
    starting = loadAssets().then((a) => new Promise((resolve, reject) => {
      const src = `const CORE = (${sqlCore.toString()})();\n(${workerMain.toString()})();`;
      const url = URL.createObjectURL(new Blob([src], { type: 'text/javascript' }));
      const w = new Worker(url);
      URL.revokeObjectURL(url);
      const fail = (message) => { clearTimeout(timer); w.terminate(); reject(new Error(message)); };
      const timer = setTimeout(() => fail('Loading SQLite took too long.'), config.LOAD_TIMEOUT_MS);
      w.onmessage = (e) => {
        if (e.data.type === 'ready') { clearTimeout(timer); w.onmessage = null; w.onerror = null; worker = w; resolve(w); }
        else if (e.data.type === 'init-error') fail(e.data.message);
      };
      w.onerror = (e) => { e.preventDefault(); fail(e.message || 'The SQLite worker could not start.'); };
      w.postMessage({ type: 'init', glue: a.glue, wasm: a.wasm });
    })).finally(() => { starting = null; });
    return starting;
  }

  function request(w, msg, ms) {
    return new Promise((resolve) => {
      const t0 = performance.now();
      const finish = (r) => {
        clearTimeout(timer);
        w.onmessage = null; w.onerror = null;
        resolve(Object.assign({}, r, { ms: Math.round(performance.now() - t0) }));
      };
      const timer = setTimeout(() => { discard(); finish({ type: 'timeout' }); }, ms);
      w.onmessage = (e) => { if (e.data.id === msg.id) finish(e.data); };
      w.onerror = (e) => { e.preventDefault(); discard(); finish({ type: 'crash', message: e.message || 'SQLite stopped unexpectedly.' }); };
      w.postMessage(msg);
    });
  }

  function testCases(tests) {
    return tests.cases.map((c, i) => ({ name: c.name || `Case ${i + 1}`, origin: c.origin || null, input: c.input || '', status: 'not-run', examples: [], error: null, ms: 0 }));
  }
  function skipped(tests, reason) {
    const cases = testCases(tests);
    return { total: cases.length, passed: 0, notRun: cases.length, reason, cases };
  }
  // What a case shows as its Input: the check query, or a reminder that the student's own query is checked.
  const caseSource = (c) => (c.input && c.input.trim() ? c.input : '-- (the result of your query)');

  async function execute(code, onPhase, tests, tables) {
    const t0 = performance.now();
    const base = { stdout: '', error: null, truncated: false };
    if (!worker) onPhase('loading');
    let w;
    try {
      w = await startWorker();
    } catch (err) {
      const r = Object.assign(base, { status: 'load-error', message: err.message, ms: Math.round(performance.now() - t0) });
      if (tests) r.tests = skipped(tests, 'load-error');
      return r;
    }
    onPhase('running');
    const m = await request(w, { type: 'run', id: ++seq, code, tables, limit: config.OUTPUT_LIMIT, rowLimit: config.ROW_LIMIT }, config.RUN_TIMEOUT_MS);
    const r = Object.assign(base,
      m.type === 'timeout' ? { status: 'timeout', ms: m.ms }
        : m.type === 'crash' ? { status: 'crash', message: m.message, ms: m.ms }
          : { status: m.error ? 'error' : 'ok', stdout: m.stdout, error: m.error || null, truncated: !!m.truncated, ms: m.ms });
    if (!tests) return r;
    if (r.status !== 'ok') { r.tests = skipped(tests, r.status); return r; }
    const summary = skipped(tests, null);
    for (let i = 0; i < summary.cases.length; i++) {
      if (!worker) { summary.reason = 'stopped'; break; }
      onPhase('testing', { done: i, total: summary.cases.length });
      const c = summary.cases[i];
      const src = tests.cases[i];
      const res = await request(worker, { type: 'test', id: ++seq, code, tables, case: { data: src.data, input: src.input, expect: src.expect, ordered: src.ordered, columns: src.columns }, rowLimit: config.ROW_LIMIT }, config.RUN_TIMEOUT_MS);
      summary.notRun--;
      c.ms = res.ms;
      if (res.type === 'timeout') { c.status = 'timeout'; continue; }
      if (res.type === 'crash') { c.status = 'error'; c.error = 'SQLite stopped unexpectedly while running this case.'; continue; }
      const x = res.result;
      if (x.error && !x.want) { c.status = 'error'; c.error = x.error; continue; }
      c.status = x.ok ? 'passed' : 'failed';
      c.examples = [{ source: caseSource(src), want: x.want || '', got: x.got || '', ok: x.ok, error: x.error || null }];
      if (x.ok) summary.passed++;
    }
    r.tests = summary;
    return r;
  }

  const api = {
    language: 'SQL',
    config,
    get ready() { return !!worker; },
    run(code, opts) {
      const onPhase = (opts && opts.onPhase) || (() => {});
      const tests = opts && opts.tests && Array.isArray(opts.tests.cases) && opts.tests.cases.length ? opts.tests : null;
      const tables = opts && typeof opts.tables === 'string' ? opts.tables : '';
      const p = chain.then(() => execute(String(code), onPhase, tests, tables));
      chain = p.catch(() => {});
      return p;
    },
  };
  if (typeof window !== 'undefined') window.CS61A_SQL_RUNNER = api;
  if (typeof module !== 'undefined' && module.exports) module.exports = { sqlCore, config };
})();
