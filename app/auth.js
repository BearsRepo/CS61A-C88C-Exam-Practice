// Anonymous sign-in with Supabase (backend Phase 1). Students never see a login form: the first time they go past the
// welcome page (Start Practicing, a Resume button, or an exam reopening by itself), this restores the anonymous
// session saved in this browser, or creates one, and makes sure the student has a row in public.profiles.
//
// It never blocks or changes the app. app.js calls ensureSession() without waiting for it; if Supabase is not
// configured, unreachable or failing, practice and exams work exactly as before and the error is only logged
// (console.warn), then retried later. Nothing here reads or writes the app's own saved data (cs61a-practice:v1):
// supabase-js keeps its session under its own localStorage key (sb-<project-ref>-auth-token).
//
// Configuration comes from config.js (Project URL + Publishable key only). The vendored supabase-js
// (vendor/supabase/supabase.min.js) is loaded only when sign-in actually runs, so pages that never need it (the
// welcome page, local file copies, the automated tests) don't load it.
window.CS61A_AUTH = (() => {
  const TAG = '[CS61A auth]';
  const LIB_SRC = 'vendor/supabase/supabase.min.js';
  const RETRY_AFTER_MS = 30000; // after a failure, the next attempt waits at least this long (or until back online)
  const EMPTY = { status: 'idle', reason: null, userId: null, isAnonymous: null, session: null, profile: null, error: null };
  let state = { ...EMPTY };
  let client = null;
  let inflight = null;
  let libLoading = null;
  let lastFailAt = 0;

  // A secret or service_role key must never reach the browser. Refuse to run rather than use one by mistake.
  function looksSecret(key) {
    if (/^sb_secret_/i.test(key)) return true;
    const parts = key.split('.');
    if (parts.length !== 3) return false; // legacy keys are JWTs; their payload names the role
    try { return JSON.parse(atob(parts[1].replace(/-/g, '+').replace(/_/g, '/'))).role === 'service_role'; } catch (e) { return false; }
  }
  // { url, key } when sign-in should run here, or { off: reason }.
  function settings() {
    const c = (window.CS61A_CONFIG && window.CS61A_CONFIG.supabase) || {};
    const url = typeof c.url === 'string' ? c.url.trim().replace(/\/+$/, '') : '';
    const key = typeof c.publishableKey === 'string' ? c.publishableKey.trim() : '';
    if (!url || !key) return { off: 'not configured' };
    if (looksSecret(key)) {
      console.error(TAG, 'Refusing to sign in: config.js holds a secret or service_role key. Use the publishable key only, and remove the secret key from the repository.');
      return { off: 'secret key refused' };
    }
    if (!/^https:\/\//.test(url)) return { off: 'url must start with https://' };
    const hosts = Array.isArray(c.hosts) ? c.hosts : [];
    if (!/^https?:$/.test(location.protocol) || !hosts.includes(location.hostname)) return { off: 'not enabled on this host' };
    // Automated browsers (the test suite, also when it runs against a local server) never create real users.
    if (navigator.webdriver && c.allowAutomation !== true) return { off: 'automated browser' };
    return { url, key };
  }

  function loadLib() {
    if (window.supabase && typeof window.supabase.createClient === 'function') return Promise.resolve(window.supabase);
    if (!libLoading) {
      libLoading = new Promise((resolve, reject) => {
        const s = document.createElement('script');
        s.src = LIB_SRC;
        s.async = true;
        s.onload = () => (window.supabase && typeof window.supabase.createClient === 'function' ? resolve(window.supabase) : reject(new Error('supabase-js loaded without createClient')));
        s.onerror = () => reject(new Error(`could not load ${LIB_SRC}`));
        document.head.appendChild(s);
      }).catch((e) => { libLoading = null; throw e; });
    }
    return libLoading;
  }

  // Network trouble, a timeout or a server error: worth trying again later, and never a reason to replace a saved session.
  const retryable = (e) => !!e && (e.name === 'AuthRetryableFetchError' || e.status === 0 || e.status >= 500 || /fetch|network|timeout/i.test(String(e.message || '')));

  // The saved session if there is one (supabase-js refreshes it when needed), otherwise a new anonymous user.
  async function currentUser() {
    const { data, error } = await client.auth.getSession();
    const session = data && data.session;
    if (session && session.user) return { user: session.user, session: 'restored' };
    // A saved session that couldn't be refreshed because of the network is kept for next time, not replaced.
    if (error && retryable(error)) throw error;
    const r = await client.auth.signInAnonymously();
    if (r.error) throw r.error;
    if (!r.data || !r.data.user) throw new Error('signInAnonymously returned no user');
    return { user: r.data.user, session: 'created' };
  }
  // One profile row per user, keyed by the user's id. Reading first means no failed insert on every visit; an insert
  // that hits the primary key (another tab created it meanwhile) counts as already there.
  async function ensureProfile(id) {
    const found = await client.from('profiles').select('id').eq('id', id).maybeSingle();
    if (found.error) throw found.error;
    if (found.data) return 'existing';
    const ins = await client.from('profiles').insert({ id });
    if (!ins.error) return 'created';
    if (ins.error.code === '23505') return 'existing';
    throw ins.error;
  }
  // Two tabs opened at once must not each create a user: the check-then-sign-in step runs one tab at a time.
  const exclusive = (fn) => (navigator.locks && navigator.locks.request ? navigator.locks.request('cs61a-anonymous-sign-in', fn) : fn());

  const describe = (e) => [e && e.name, e && (e.message || e.msg || String(e)), e && e.code && `code ${e.code}`, e && e.status && `status ${e.status}`].filter(Boolean).join(' · ');
  const snapshot = () => ({ ...state });

  async function run() {
    const cfg = settings();
    if (cfg.off) {
      state = { ...EMPTY, status: 'disabled', reason: cfg.off };
      return snapshot();
    }
    state = { ...EMPTY, status: 'pending' };
    try {
      const lib = await loadLib();
      if (!client) client = lib.createClient(cfg.url, cfg.key, { auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: false } });
      const { user, session } = await exclusive(currentUser);
      const profile = await ensureProfile(user.id);
      state = { ...EMPTY, status: 'ready', userId: user.id, isAnonymous: user.is_anonymous !== false, session, profile };
      console.info(TAG, `${session === 'created' ? 'Signed in anonymously' : 'Anonymous session restored'}; profile ${profile}.`);
    } catch (e) {
      lastFailAt = Date.now();
      state = { ...EMPTY, status: 'error', error: describe(e) };
      console.warn(TAG, 'Sign-in did not complete. Practice works as usual; this will be retried.', e);
    }
    return snapshot();
  }

  // Safe to call as often as you like: one attempt at a time, nothing more once signed in (or when sign-in is off
  // here), and after a failure the next attempt waits RETRY_AFTER_MS unless retry() asks for it now.
  function ensureSession() {
    if (state.status === 'ready' || state.status === 'disabled') return Promise.resolve(snapshot());
    if (inflight) return inflight;
    if (state.status === 'error' && Date.now() - lastFailAt < RETRY_AFTER_MS) return Promise.resolve(snapshot());
    inflight = run().finally(() => { inflight = null; });
    return inflight;
  }
  function retry() {
    lastFailAt = 0;
    return ensureSession();
  }
  window.addEventListener('online', () => { if (state.status === 'error') retry(); });

  return { ensureSession, retry, status: snapshot };
})();
