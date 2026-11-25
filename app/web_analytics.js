// Cloudflare Web Analytics: aggregate visits and page views only (no cookies). Loaded at the end of <body> by
// index.html, menu.html and privacy.html, the only place the beacon is added.
//
// One Cloudflare Web Analytics site, and so one beacon token, per published hostname. Any other host (a local server,
// a file:// copy, the test suite, a look-alike domain) loads nothing, so it sends nothing (Cloudflare would also
// reject the other origin and log console errors). The beacon is added at most once per page.
//
// The app never passes anything to the beacon: it is a separate script that reports page loads and timings, and it
// does not read localStorage, answers, code, notes, grades or exam history.
(() => {
  const CF_TOKENS = {
    'jacobkao-cal.github.io': '629fadce777742a0838d877beeb3f5d5',
    'bearsrepo.github.io': 'bf4412a0c1354a81af3e410b43e9deb1',
  };
  const BEACON = 'https://static.cloudflareinsights.com/beacon.min.js';
  const host = location.hostname;
  const token = Object.prototype.hasOwnProperty.call(CF_TOKENS, host) && CF_TOKENS[host];
  if (!token || !document.body) return;
  if (document.querySelector('script[data-cf-beacon]')) return; // already added on this page
  const cf = document.createElement('script');
  cf.type = 'module';
  cf.src = BEACON;
  cf.setAttribute('data-cf-beacon', JSON.stringify({ token }));
  document.body.appendChild(cf);
})();
