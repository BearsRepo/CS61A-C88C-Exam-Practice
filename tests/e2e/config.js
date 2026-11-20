// Shared settings for the browser tests. Override with environment variables:
//   CHROME=/path/to/chrome   APP_URL=http://localhost:8000/   (a URL ending in "/" gets the app page added)
const fs = require('fs');
const path = require('path');
const { pathToFileURL } = require('url');

const DEFAULT_CHROME = {
  darwin: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  linux: '/usr/bin/google-chrome',
  win32: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
}[process.platform];

// The page that loads the app. Once the site has a separate landing page, the app is app/menu.html
// (body data-page="menu") and app/index.html is the landing page; before that, the app is app/index.html.
const APP_PAGE = fs.existsSync(path.join(__dirname, '..', '..', 'app', 'menu.html')) ? 'menu.html' : 'index.html';
const envURL = process.env.APP_URL;

// menu.html opens the app straight on Home. The suites start from the app's own welcome screen and click
// Enter (`[data-action="enter"]`), so this drops data-page="menu" before app.js reads it: the app then starts
// on its welcome screen exactly as app/index.html did, and Enter goes to Home as before. Nothing else reads
// data-page. A no-op on a page without it (app/index.html before the landing page split).
const welcomeScreen = (page) => page.evaluateOnNewDocument(() => {
  const drop = () => { if (document.body && document.body.dataset.page === 'menu') { delete document.body.dataset.page; return true; } return false; };
  if (drop()) return;
  // Mutation callbacks run at the microtask checkpoint before each parser-inserted script, so before app.js.
  const mo = new MutationObserver(() => { if (document.body) { drop(); mo.disconnect(); } });
  mo.observe(document, { childList: true, subtree: true });
});

module.exports = {
  APP_PAGE,
  APP_URL: envURL ? (envURL.endsWith('/') ? envURL + APP_PAGE : envURL)
    : pathToFileURL(path.join(__dirname, '..', '..', 'app', APP_PAGE)).href,
  CHROME: process.env.CHROME || DEFAULT_CHROME,
  welcomeScreen,
  // The first-visit tour (app/tour.js) would cover the page and hold timers, so other suites start with it
  // declined, on every load (including after a test clears localStorage). tour.test.js covers the tour itself.
  // Every suite that uses this also gets welcomeScreen (above).
  skipTour: async (page) => {
    await welcomeScreen(page);
    return page.evaluateOnNewDocument(() => {
      try { if (!localStorage.getItem('cs61a-practice:tour')) localStorage.setItem('cs61a-practice:tour', '{"asked":true,"on":false,"seen":{}}'); } catch (e) { /* no storage */ }
    });
  },
  // Load the app without this semester's scope (app/data/in_scope.js), so every transcribed question is offered.
  // Suites that check an exam against its PDF (all parts, points, official answers) use this; in_scope.test.js
  // covers what the scope hides and notes.
  fullBank: (page) => page.evaluateOnNewDocument(() => {
    Object.defineProperty(window, 'CS61A_SCOPE', { configurable: true, get: () => undefined, set: () => {} });
  }),
};
