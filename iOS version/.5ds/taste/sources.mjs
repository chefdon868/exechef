// 5 Day Sprint sources check. Fetches only the official pages in .5ds/taste/sources.json (and .5ds/animations/sources.json), reads
// the date on each, and writes 1 line per platform to .5ds/taste/notes.md: the date checked, the newest official page
// date, and whether that is newer than the guide. It reads; it sends nothing but the page requests. Offline is fine.
//   node .5ds/taste/sources.mjs                 check the platforms this project uses
//   node .5ds/taste/sources.mjs web ios         check these platforms
//   --all  every platform   --verbose  each page's date   --dir <folder>  another project folder
// It always ends with exit code 0.
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const MONTHS = ['january', 'february', 'march', 'april', 'may', 'june', 'july', 'august', 'september', 'october', 'november', 'december'];
const iso = (y, m, d) => `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
const today = () => new Date().toISOString().slice(0, 10);

// Every date in a piece of text: 2026-11-10, November 10, 2026, Nov 10, 2026, and 10 November 2026.
export function datesIn(text) {
  const out = [], mon = (s) => MONTHS.findIndex((m) => m.startsWith(s.toLowerCase().slice(0, 3))) + 1;
  for (const m of text.matchAll(/\b(20\d\d)-(\d\d)-(\d\d)\b/g)) out.push(iso(m[1], m[2], m[3]));
  for (const m of text.matchAll(/\b(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\.? (\d{1,2}), (20\d\d)\b/gi)) out.push(iso(m[3], mon(m[1]), m[2]));
  for (const m of text.matchAll(/\b(\d{1,2}) (Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]* (20\d\d)\b/gi)) out.push(iso(m[3], mon(m[2]), m[1]));
  return out.filter((d) => /^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])$/.test(d));
}
// The page's date: the newest date after the "near" words (for example "Change log" or "Last updated"), else in the whole page.
export function pageDate(text, near) {
  const plain = text.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ');
  let part = plain;
  // Every place the near words appear counts: a page can name them first in its menu or its data, before the real line.
  if (near) { const at = []; for (let i = plain.indexOf(near); i >= 0; i = plain.indexOf(near, i + 1)) at.push(i); if (!at.length) return null; part = near === 'Change log' ? plain.slice(at[0]) : at.map((i) => plain.slice(i, i + 200)).join(' '); }
  const ds = datesIn(part).filter((d) => d <= today());
  return ds.length ? ds.sort().pop() : null;
}
async function get(url, ms) {
  const c = new AbortController(), t = setTimeout(() => c.abort(), ms);
  try {
    const r = await fetch(url, { signal: c.signal, headers: { 'user-agent': 'Mozilla/5.0 (5 Day Sprint sources check)' } });
    if (!r.ok) return { error: `answered ${r.status}` };
    return { text: await r.text(), modified: r.headers.get('last-modified') };
  } catch (e) { return { error: e && e.name === 'AbortError' ? 'timed out' : 'could not be reached' }; } finally { clearTimeout(t); }
}
// Which platforms this project uses, from its files.
export function platformsUsed(root) {
  const has = (p) => fs.existsSync(path.join(root, p));
  const any = (re) => { try { return fs.readdirSync(root).some((n) => re.test(n)); } catch { return false; } };
  const pkg = ['package.json', 'web/package.json'].map((p) => { try { return fs.readFileSync(path.join(root, p), 'utf8'); } catch { return ''; } }).join('\n');
  const out = [];
  if (/"(next|react|vite|astro|vue|svelte)"/.test(pkg) || has('web')) out.push('web');
  if (any(/\.xcodeproj$|^Package\.swift$/) || has('ios')) out.push('ios');
  if (any(/\.xcodeproj$/) && /macOS|macosx/i.test(fs.readdirSync(root).join(' '))) out.push('macos');
  if (has('android') || any(/^build\.gradle(\.kts)?$/)) out.push('android');
  if (/"expo"|"react-native"/.test(pkg) || has('pubspec.yaml')) out.push('cross-platform');
  return out.length ? out : ['web'];
}
// Checks the platforms and returns 1 result each: { platform, state: 'same' | 'newer' | 'offline', line, newest, guideChecked }.
export async function checkSources({ root = path.join(HERE, '..', '..'), platforms, all = false, timeoutMs = 8000, write = true, files } = {}) {
  const lists = (files || [path.join(HERE, 'sources.json'), path.join(root, '.5ds', 'animations', 'sources.json')]).filter((f) => fs.existsSync(f)).map((f) => JSON.parse(fs.readFileSync(f, 'utf8')));
  const table = {}; for (const l of lists) for (const [k, v] of Object.entries(l.platforms || {})) table[k] = v;
  const want = all ? Object.keys(table) : (platforms && platforms.length ? platforms : [...platformsUsed(root), 'motion']).filter((p) => table[p]);
  const results = await Promise.all(want.map(async (p) => {
    const v = table[p];
    const pages = await Promise.all(v.pages.map(async (pg) => { const r = await get(pg.url, timeoutMs); const d = r.text ? pageDate(r.text, pg.near) : null; return { url: pg.url, date: d, error: r.error || (r.text && !d ? 'no date found' : null) }; }));
    const dated = pages.filter((x) => x.date).sort((a, b) => (a.date < b.date ? 1 : -1));
    if (!dated.length) return { platform: p, state: 'offline', pages, line: null, guideChecked: v.checked };
    const newest = dated[0], newer = newest.date > v.checked;
    const line = `- sources ${p}, checked ${today()}: newest official page ${newest.date} (${newest.url}), ${newer ? `NEWER than the guide (checked ${v.checked}): read that page and write the new rule below` : `same as the guide (checked ${v.checked})`}.`;
    return { platform: p, state: newer ? 'newer' : 'same', pages, line, newest: newest.date, guideChecked: v.checked };
  }));
  if (write) {
    const f = path.join(root, '.5ds', 'taste', 'notes.md');
    let text = ''; try { text = fs.readFileSync(f, 'utf8'); } catch { text = '# Newer than the guides\n\n'; }
    for (const r of results) if (r.line) { const re = new RegExp(`^- sources ${r.platform}, .*$`, 'm'); text = re.test(text) ? text.replace(re, r.line) : `${text.trimEnd()}\n${r.line}\n`; }
    if (results.some((r) => r.line)) { fs.mkdirSync(path.dirname(f), { recursive: true }); fs.writeFileSync(f, text.endsWith('\n') ? text : `${text}\n`); }
  }
  return results;
}
// Today's line already in notes.md for a platform, so a second run the same day fetches nothing.
export function checkedToday(root, platform) {
  try { return new RegExp(`^- sources ${platform}, checked ${today()}:`, 'm').test(fs.readFileSync(path.join(root, '.5ds', 'taste', 'notes.md'), 'utf8')); } catch { return false; }
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const a = process.argv.slice(2), i = a.indexOf('--dir'), root = path.resolve(i >= 0 ? a[i + 1] : path.join(HERE, '..', '..'));
  const named = a.filter((x, j) => !x.startsWith('--') && a[j - 1] !== '--dir');
  try {
    const rs = await checkSources({ root, platforms: named, all: a.includes('--all') });
    console.log('5 Day Sprint sources check. It only read the official pages.');
    for (const r of rs) {
      console.log(r.state === 'offline' ? `not checked here  ${r.platform}: no official page could be read (offline, or the pages moved).` : `${r.state === 'newer' ? 'fix ' : 'pass'}  ${r.platform}: newest official page ${r.newest}, guide checked ${r.guideChecked}${r.state === 'newer' ? '. Read the newer page and note the new rule in .5ds/taste/notes.md' : ''}.`);
      if (a.includes('--verbose')) for (const pg of r.pages) console.log(`      ${pg.date || '-'}  ${pg.url}${pg.error ? `  (${pg.error})` : ''}`);
    }
  } catch (e) { console.log(`The sources check could not finish (${String((e && e.message) || e).slice(0, 120)}). Nothing was changed.`); }
  process.exitCode = 0;
}
