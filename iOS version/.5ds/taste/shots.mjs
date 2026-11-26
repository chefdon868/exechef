// 5 Day Sprint screenshots. Shoots each page of the running app at 320, 375 and 1280 wide, light and dark, and at 200 percent
// zoom, with Playwright, into a temporary folder; fails a page wider than its window; lists what it could not shoot. It also
// shows candidate faces on the real headline. It changes nothing in the project and sends nothing anywhere.
//   node .5ds/taste/shots.mjs                    the home page of the app running on port 3000
//   node .5ds/taste/shots.mjs / /pricing /book   these pages
//   --url <address>   the running app (default: the local dev server on port 3000)
//   node .5ds/taste/shots.mjs --ref --url <its address>   a reference site at 1280 and 375, light only, to set beside
//                     your own page in the beauty pass (no width check: it is not your page)
//   node .5ds/taste/shots.mjs --type "The real headline" --faces "Face One,Face Two,Face Three"
//                     1 image of each candidate face (from Google Fonts) on the headline at real sizes
// It needs Playwright (pinned below). If it is missing or offline, it says so and lists every shot it could not take.
// It always ends with exit code 0.
import cp from 'child_process';
import fs from 'fs';
import os from 'os';
import path from 'path';

const PLAYWRIGHT = 'playwright@1.65.1';
// [label, width, height, zoom]: 200 percent zoom on a 1280 window shows the page 640 pixels wide.
const SIZES = [['320', 320, 640, 1], ['375', 375, 812, 1], ['1280', 1280, 800, 1], ['1280 at 200 percent zoom', 640, 400, 2]], SCHEMES = ['light', 'dark'];
const a = process.argv.slice(2), opt = (k) => { const i = a.indexOf(k); return i >= 0 ? a[i + 1] : null; };
const base = (opt('--url') || 'http://localhost:3000').replace(/\/$/, '');
const pages = a.filter((x, i) => x.startsWith('/') && !['--url', '--type', '--faces'].includes(a[i - 1]));
const isWin = process.platform === 'win32';
const npx = (args, timeout) => cp.spawnSync(isWin ? 'npx.cmd' : 'npx', ['--yes', PLAYWRIGHT, ...args], { encoding: 'utf8', timeout, shell: isWin, windowsHide: true });
const out = (s = '') => console.log(s);
// The width of a PNG, from its header, to catch a page wider than its window.
const pngWidth = (f) => { try { const b = fs.readFileSync(f); return b.toString('latin1', 12, 16) === 'IHDR' ? b.readUInt32BE(16) : null; } catch { return null; } };
const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

function typeSheet(dir, headline, faces) {
  const fam = faces.map((f) => `family=${encodeURIComponent(f).replace(/%20/g, '+')}:wght@400;700`).join('&');
  const rows = faces.map((f) => `<section><p class="label">${esc(f)}</p>${[44, 72, 96].map((s) => `<h1 style="font-family:'${esc(f)}';font-size:${s}px">${esc(headline)}</h1>`).join('')}<p style="font-family:'${esc(f)}';font-size:16px;max-width:640px">The body at 16px, to judge the face as text as well as display: ${esc(headline)}</p></section>`).join('');
  const html = `<!doctype html><html><head><meta charset="utf-8"><link rel="stylesheet" href="https://fonts.googleapis.com/css2?${fam}&display=block"><style>body{margin:48px;font-family:system-ui}h1{margin:0 0 16px;line-height:1.05;font-weight:400}section{margin-bottom:64px}.label{font:14px system-ui;color:#666}</style></head><body>${rows}</body></html>`;
  const f = path.join(dir, 'faces.html'); fs.writeFileSync(f, html); return f;
}

try {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), '5ds-shots-'));
  const probe = npx(['--version'], 180000), ready = probe.status === 0;
  out('5 Day Sprint screenshots. Nothing in the project was changed.');
  out('');
  if (a.includes('--type')) {
    const headline = opt('--type') || '', faces = (opt('--faces') || '').split(',').map((x) => x.trim()).filter(Boolean);
    if (!headline || faces.length < 2) { out('Give the real headline and 2 or 3 faces: --type "The headline" --faces "Face One,Face Two"'); }
    else if (!ready) out('Could not make the type image: Playwright could not start (not installed, or offline). Set the headline in each face in the app instead.');
    else {
      const sheet = typeSheet(dir, headline, faces), png = path.join(dir, 'faces.png');
      const r = npx(['screenshot', '--full-page', '--viewport-size=1280,800', '--wait-for-timeout=2500', `file://${sheet}`, png], 120000);
      out(r.status === 0 && fs.existsSync(png) ? `The candidate faces on the headline, at 44, 72 and 96px: ${png}` : 'Could not make the type image: the screenshot failed (Google Fonts may be out of reach).');
    }
  } else {
    const REF = a.includes('--ref'), sizes = REF ? SIZES.filter(([l]) => l === '375' || l === '1280') : SIZES, schemes = REF ? ['light'] : SCHEMES;
    const want = (pages.length ? pages : ['/']).flatMap((p) => sizes.flatMap(([label, w, h, z]) => schemes.map((s) => ({ p, label, w, h, z, s }))));
    const shot = [], missed = [], wide = [];
    if (!ready) for (const x of want) missed.push(`${x.p} at ${x.label}, ${x.s}: Playwright could not start (not installed, or offline)`);
    else for (const x of want) {
      const file = path.join(dir, `${REF ? `ref-${base.replace(/^https?:\/\//, '').replace(/[^a-z0-9]+/gi, '-')}-` : ''}${(x.p.replace(/[^a-z0-9]+/gi, '-').replace(/^-|-$/g, '') || 'home')}-${x.label.replace(/\D+/g, '-').replace(/-$/, '')}-${x.s}.png`);
      const r = npx(['screenshot', '--full-page', `--viewport-size=${x.w},${x.h}`, `--color-scheme=${x.s}`, '--wait-for-timeout=1500', `${base}${x.p}`, file], 120000);
      if (r.status === 0 && fs.existsSync(file)) { shot.push(file); const pw = pngWidth(file); if (!REF && pw && pw > x.w) wide.push(`${x.p} at ${x.label}, ${x.s}: the page is ${pw}px wide in a ${x.w}px window, so it scrolls sideways`); }
      else missed.push(`${x.p} at ${x.label}, ${x.s}: ${/ERR_CONNECTION_REFUSED|ECONNREFUSED/.test(`${r.stderr}${r.stdout}`) ? 'the app is not running at that address' : /Executable doesn't exist|install/i.test(`${r.stderr}${r.stdout}`) ? 'the browser is not installed (npx playwright install chromium downloads it)' : 'the screenshot failed'}`);
    }
    if (shot.length) { out(`Shot ${shot.length} of ${want.length}, in ${dir}:`); shot.forEach((f) => out(`  ${f}`)); out(REF ? 'Open each and set it beside the same width of your own page.' : 'Open each and check it against .5ds/taste/checklist.md.'); }
    if (wide.length) { out(''); out(`fix   ${wide.length} ${wide.length === 1 ? 'shot is' : 'shots are'} wider than the window:`); wide.forEach((m) => out(`  - ${m}`)); }
    if (missed.length) { out(''); out(`Could not shoot ${missed.length} of ${want.length}:`); missed.forEach((m) => out(`  - ${m}`)); out('Say so to the owner in 1 line, and check those another way (a browser tool, or ask the owner to look).'); }
  }
} catch (e) {
  out(`The screenshots could not finish (${String((e && e.message) || e).slice(0, 120)}). Nothing was changed.`);
}
process.exitCode = 0;
