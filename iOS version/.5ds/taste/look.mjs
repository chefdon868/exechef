// 5 Day Sprint look check. It reads the app's screen files and changes nothing. Its numbers come from numbers.json, the same
// numbers the guides quote, so a guide value never fails its own check.
//   node .5ds/taste/look.mjs              check every screen, by kind: marketing pages, app screens and forms
//   --dir <folder>   check another folder (the default is the folder that holds .5ds)
//   --all            show every fix line (the default shows the first 20)
//   --offline        skip the official pages check (sources.mjs), which is skipped by itself when there is no network
//   --no-record      compare this project's look with earlier ones, without adding it to ~/.5ds/looks.ndjson
// It keeps 1 line per project in ~/.5ds/looks.ndjson (the faces, colours, radius and structure of its art direction), on this
// computer only and never sent, so a new project's look can be compared with the earlier ones.
// It always ends with exit code 0. It covers what code can see; .5ds/taste/checklist.md covers what only eyes can.
// A line holding the comment look-ok (with its reason) is kept on purpose and skipped.
import crypto from 'crypto';
import fs from 'fs';
import os from 'os';
import path from 'path';
import { fileURLToPath } from 'url';
import { checkSources, checkedToday, platformsUsed } from './sources.mjs';
import { parseColour } from './palette.mjs';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const N = JSON.parse(fs.readFileSync(path.join(HERE, 'numbers.json'), 'utf8'));
const args = process.argv.slice(2);
const opt = (k) => { const i = args.indexOf(k); return i >= 0 ? args[i + 1] : null; };
const ROOT = path.resolve(opt('--dir') || path.join(HERE, '..', '..'));
const MAX_LINES = args.includes('--all') ? Infinity : 20, MAX_BYTES = 1024 * 1024;
const OFFLINE = args.includes('--offline') || process.env.FDS_OFFLINE === '1';
// --no-record compares with earlier projects but does not add this one to ~/.5ds/looks.ndjson.
const NO_WRITE = args.includes('--no-record');
const SKIP_DIRS = new Set(['node_modules', '.next', 'dist', '.git', 'build', 'out', '.vercel', '.turbo', 'coverage', '.cache', '.5ds', '.claude', '.worktrees']);
// Screen files: React, Vue and Svelte components and pages. The shadcn primitives in components/ui are its own code, so they are left out.
const SCREEN = /\.(tsx|jsx|vue|svelte)$/i;
const out = (s = '') => console.log(s);

// The 3 kinds of screen. A marketing page is the home page or a page under a marketing route; a form is any screen with a
// form; every other screen is an app screen. A file can be a marketing page and hold a form: it gets both sets of rules.
const MARKETING = /(^|\/)(?:src\/)?(?:app|pages)\/(?:\((?:marketing|site|landing|home|www)\)\/)?(?:(?:about|pricing|features|contact|book|menu|services|work|blog)\/)?(?:page|index)\.(tsx|jsx|vue)$|(^|\/)(?:src\/)?app\/\((?:marketing|site|landing|home|www)\)\//;
const LANDING = /(^|\/)(?:src\/)?app\/(?:\([^/]+\)\/)*page\.(tsx|jsx)$|(^|\/)(?:src\/)?pages\/index\.(tsx|jsx|vue)$/;
const kindsOf = (rel, text) => {
  const k = [];
  if (MARKETING.test(rel)) k.push('marketing');
  if (/<(form|Form)\b/.test(text)) k.push('form');
  if (!k.includes('marketing')) k.push('app');
  return k;
};

// A raw colour code: #abc, #aabbcc or #aabbccdd, not a page link such as href="#add".
const HEX = /(^|[\s'"`[(:,])#(?:[0-9a-fA-F]{8}|[0-9a-fA-F]{6}|[0-9a-fA-F]{3})(?![\w-])/g;
const NOT_DARK = /\b(bg-white|text-black|bg-black|text-white|border-white|border-black)\b/g;
const FILLER = /lorem ipsum|\bFeature [1-9]\b|\bYour (?:title|headline|text) here\b|\bplaceholder text\b|\bJohn Doe\b|\bPlaceholder:|\[(?:your|their|insert|add)[^\]]{0,30}\]|\bTBC\b|\bAcme(?: Inc| Corp)?\b/gi;
const GREY_BOX = /<(div|span|figure)\b[^>]*className=\{?["'`][^"'`]*\b(?:bg-muted|bg-secondary|bg-(?:gray|grey|neutral|zinc|slate|stone)-(?:50|100|200|300))\b[^"'`]*["'`]\}?[^>]*>\s*<([A-Z]\w*)\b[^>]*\/>\s*<\/\1>/g;
const SIZES = { xs: 12, sm: 14, base: 16, lg: 18, xl: 20, '2xl': 24, '3xl': 30, '4xl': 36, '5xl': 48, '6xl': 60, '7xl': 72, '8xl': 96, '9xl': 128 };
const HEIGHTS = { 8: 32, 9: 36, 10: 40, 11: 44, 12: 48, 14: 56 };
const HERO = N.hero_headline_px, TOUCH = N.touch_min_px, RATIO_PX = N.first_screen_ratio * N.body_min_px;

const RULES = [
  { id: 'theme-colours', kinds: ['marketing', 'app', 'form'], label: 'Colours only through the theme', ask: 'Swap the raw colour codes for theme colours, such as bg-primary or text-muted-foreground.' },
  { id: 'dark-mode', kinds: ['marketing', 'app', 'form'], label: 'Light and dark both work', ask: 'Swap these for theme colours, such as bg-background or bg-card, so dark mode works.' },
  { id: 'real-words', kinds: ['marketing', 'app', 'form'], label: 'Real words, no filler', ask: 'Write real words for these, from the charter and what I said.' },
  { id: 'no-grey-boxes', kinds: ['marketing', 'app', 'form'], label: 'No grey boxes holding only an icon', ask: 'Swap the grey boxes for real photos, a tile in the art direction colours with the name on it, or leave the picture out.' },
  { id: 'hero', kinds: ['marketing'], label: `The home page headline is clearly the biggest text (${HERO.phone_min}px on a phone, ${N.first_screen_ratio} times the body)`, ask: `Make the home headline clearly the biggest thing: ${HERO.phone_min}px or more on a phone and at least ${N.first_screen_ratio} times the body (${RATIO_PX}px), in your chosen face.`, none: 'no home page with a main headline was found' },
  { id: 'craft', kinds: ['marketing', 'app', 'form'], label: 'Omar\'s craft: no letter-spaced capitals, the home headline set tight, the text selection styled', ask: 'Set small labels in normal case, set the home headline tight (tracking from .5ds/taste/craft.md, such as tracking-tight or tracking-[-0.04em]), and style ::selection in the leading colour in globals.css.' },
  { id: 'habits', kinds: ['marketing'], label: 'Habits from notice.md have a reason', ask: 'Write the reason from the concept in art-direction.md (Layout), or choose a structure that serves the visitor\'s 1 job.' },
  { id: 'app-title', kinds: ['app'], label: 'App screens use a calm title, not a hero', ask: `Keep app screen titles at ${N.app_title_max_px}px or less; save the big headline for the home page.` },
  { id: 'labels', kinds: ['form'], label: 'Every field has a visible label', ask: 'Give each field a visible label above it (Label with htmlFor), not only a placeholder.' },
  { id: 'targets', kinds: ['form'], label: `Fields and buttons are at least ${TOUCH}px tall`, ask: `Make fields and buttons at least ${TOUCH}px tall (h-11).` },
];

function screens(root) {
  const files = [];
  const walk = (dir) => {
    let names; try { names = fs.readdirSync(dir, { withFileTypes: true }); } catch { return; }
    for (const e of names) {
      const f = path.join(dir, e.name), rel = path.relative(root, f).split(path.sep).join('/');
      if (e.isSymbolicLink()) continue;
      if (e.isDirectory()) { if (!SKIP_DIRS.has(e.name) && !/(^|\/)components\/ui$/.test(rel)) walk(f); continue; }
      if (!e.isFile() || !SCREEN.test(e.name) || /\.(test|spec|stories)\./.test(e.name)) continue;
      try { if (fs.statSync(f).size <= MAX_BYTES) files.push(rel); } catch { /* gone */ }
    }
  };
  walk(root);
  return files.sort();
}
const classOf = (tag) => (tag.match(/className=(?:"([^"]*)"|'([^']*)'|\{`([^`]*)`\})/) || []).slice(1).find(Boolean) || '';
// Tailwind text sizes in a class list: { base, max } in pixels, the base size being the phone size.
function sizes(cls) {
  let base = 0, max = 0;
  for (const x of cls.matchAll(/(?:^|\s)((?:[a-z0-9]+:)*)text-(xs|sm|base|lg|xl|[2-9]xl|\[(\d+(?:\.\d+)?)(px|rem)\])(?=\s|$)/g)) {
    const px = x[3] ? Number(x[3]) * (x[4] === 'rem' ? 16 : 1) : SIZES[x[2]];
    if (!x[1]) base = Math.max(base, px);
    max = Math.max(max, px);
  }
  return { base, max };
}

// Reasons in the art direction's Layout section for the 2 structure habits.
function habitReasons(root) {
  let md = ''; try { md = fs.readFileSync(path.join(root, '.5ds', 'taste', 'art-direction.md'), 'utf8'); } catch { return { centred: false, cards: false }; }
  const lines = section(md, 'Layout').filter((l) => words(l) >= 8);
  return { centred: lines.some((l) => /centred|centered/i.test(l)), cards: lines.some((l) => /\b(3|three) (equal )?(icon )?cards\b/i.test(l)) };
}
// Omar's craft (craft.md): letter-spaced capitals, a home headline set tight, the text selection styled.
const CAPS = /\btracking-(?:wide|wider|widest)\b|tracking-\[(?!-)(?!0*\.?0+(?:em|px|rem)\])\d*\.?\d+(?:em|px|rem)\]|letterSpacing:\s*['"`]?(?!-)(?!0*\.?0+(?:em|px|rem)?['"`]?[,}\s])\d*\.?\d+/;
const TIGHT = /\btracking-(?:tight|tighter)\b|tracking-\[-|letterSpacing:\s*['"`]?-/;
export const CSS_FILES = ['web/app/globals.css', 'app/globals.css', 'src/app/globals.css'];
function cssOf(root) { const f = CSS_FILES.map((p) => path.join(root, p)).find((p) => fs.existsSync(p)); if (!f) return null; try { return { rel: path.relative(root, f).split(path.sep).join('/'), text: fs.readFileSync(f, 'utf8') }; } catch { return null; } }
// CSS rules as [selector, body, line].
const cssRules = (css) => [...css.matchAll(/([^{}]+)\{([^{}]*)\}/g)].map((m) => [m[1].trim(), m[2], css.slice(0, m.index + m[0].indexOf(m[1].trim())).split('\n').length]);
// The home headline is tight when its class, its style or a CSS rule for h1 or 1 of its classes sets negative tracking.
// CSS custom properties with a negative value, so a token such as --tracking-display: -0.04em counts as tight.
const negVars = (css) => new Set([...(css || '').matchAll(/(--[\w-]+)\s*:\s*-\s*\d/g)].map((m) => m[1]));
export function tightHeadline(tag, css) {
  if (TIGHT.test(tag)) return true;
  const neg = negVars(css);
  if ([...tag.matchAll(/var\((--[\w-]+)\)/g)].some((m) => neg.has(m[1]) && /tracking|letterSpacing/.test(tag))) return true;
  if ([...classOf(tag).matchAll(/(?:^|\s)(?:[a-z]+:)*tracking-([a-z][\w-]*)/g)].some((m) => neg.has(`--tracking-${m[1]}`))) return true;
  const classes = classOf(tag).split(/\s+/).filter((c) => /^[\w-]+$/.test(c));
  return cssRules(css || '').some(([sel, body]) => /letter-spacing:\s*-/.test(body) && (/(^|[\s,>])h1\b/.test(sel) || classes.some((c) => new RegExp(`\\.${c}(?![\\w-])`).test(sel))));
}
function scan(root) {
  const found = [], files = screens(root), count = { marketing: 0, app: 0, form: 0 };
  let landing = 0, selection = false;
  const css = cssOf(root);
  for (const rel of files) {
    let text; try { text = fs.readFileSync(path.join(root, rel), 'utf8'); } catch { continue; }
    // Shared rules report under the file's main kind (marketing, then form, then app), so nothing is counted twice.
    const lines = text.split('\n'), kinds = kindsOf(rel, text), main = kinds.includes('marketing') ? 'marketing' : kinds.includes('form') ? 'form' : 'app';
    const KIND = { hero: 'marketing', habits: 'marketing', 'app-title': 'app', labels: 'form', targets: 'form' };
    if (/\bselection:/.test(text)) selection = true;
    const add = (rule, line, detail) => { if (!/look-ok/.test(lines[line - 1] || '')) found.push({ rule, rel, line, detail, kind: KIND[rule] || main }); };
    kinds.forEach((k) => { count[k]++; });
    lines.forEach((ln, i) => {
      if (ln.length > 5000 || /look-ok/.test(ln)) return;
      const hex = [...ln.matchAll(HEX)];
      if (hex.length && !/href\s*=\s*["'`]?#/.test(ln)) add('theme-colours', i + 1, `a raw colour code (${hex.map((m) => m[0].trim().replace(/^[^#]+/, '')).slice(0, 3).join(', ')})`);
      for (const m of ln.matchAll(NOT_DARK)) if (!new RegExp(`dark:${m[1].split('-')[0]}-`).test(ln)) { add('dark-mode', i + 1, `${m[1]} with no dark version`); break; }
      const fill = [...ln.matchAll(FILLER)];
      if (fill.length) add('real-words', i + 1, `filler text ("${fill[0][0]}")`);
      // Uppercase and wide tracking in the same class list or the same style object.
      const attrs = [...ln.matchAll(/className=(?:"([^"]*)"|'([^']*)'|\{`([^`]*)`\})|style=\{\{([^}]*)\}\}/g)].map((m) => m.slice(1).find(Boolean) || '');
      if (attrs.some((v) => /\buppercase\b|textTransform:\s*['"`]uppercase/.test(v) && CAPS.test(v))) add('craft', i + 1, 'letter-spaced capitals (uppercase with wide tracking); craft.md sets small labels in normal case');
    });
    for (const m of text.matchAll(GREY_BOX)) add('no-grey-boxes', text.slice(0, m.index).split('\n').length, `a grey box holding only an icon (${m[2]})`);
    const h = text.match(/<h1\b[^>]*>/), hLine = h ? text.slice(0, h.index).split('\n').length : 0, cls = h ? classOf(h[0]) : '';
    // The home page: phone size at least the phone floor, laptop size at least the laptop floor. clamp() sizes are trusted.
    if (h && LANDING.test(rel)) {
      landing++;
      const s = sizes(cls);
      if (!/clamp\(/.test(cls)) {
        if (!s.max) add('hero', hLine, 'the main headline has no text size, so it shows at body size');
        else if (s.base && s.base < HERO.phone_min) add('hero', hLine, `on a phone the main headline is ${s.base}px, under ${HERO.phone_min}px`);
        else if (s.max < RATIO_PX) add('hero', hLine, `the main headline is at most ${s.max}px, under ${N.first_screen_ratio} times the body (${RATIO_PX}px)`);
      }
      if (!tightHeadline(h[0], css && css.text)) { if (!/look-ok/.test(lines[hLine - 1] || '')) found.push({ rule: 'craft', rel, line: hLine, detail: `the home headline is not set tight (no negative tracking; craft.md asks ${N.craft.tracking_em.display.min} to ${N.craft.tracking_em.display.max}em on big type)`, kind: 'marketing' }); }
    }
    // 2 structure habits from notice.md (layouts.md lists them): a centred first screen with 2 buttons and a picture, and a row
    // of 3 equal icon cards. Each needs a reason in the art direction's Layout section.
    if (kinds.includes('marketing')) {
      const layout = habitReasons(root);
      const first = text.slice(0, 2500);
      if (/text-center/.test(first) && (first.match(/<(a|Button|button|Link)\b/g) || []).length >= 2 && /<(Image|img|video)\b/.test(first) && !layout.centred) add('habits', 1, 'a centred first screen with 2 buttons and a picture (a notice habit) and no reason in the art direction');
      const g = text.search(/grid-cols-3/);
      if (g >= 0) { const near = text.slice(g, g + 1500); if (/<[A-Z]\w*(Icon)?\s+className=["'][^"']*\bsize-\d/.test(near) && /<h3\b/.test(near) && !layout.cards) add('habits', text.slice(0, g).split('\n').length, 'a row of 3 equal icon cards (a notice habit) and no reason in the art direction'); }
    }
    if (h && kinds.includes('app') && !LANDING.test(rel)) { const s = sizes(cls); if (s.max > N.app_title_max_px) add('app-title', hLine, `the title is ${s.max}px, a hero size on an app screen`); }
    if (kinds.includes('form')) {
      const fields = [...text.matchAll(/<(input|Input|textarea|Textarea|select|SelectTrigger)\b((?:=>|[^>])*)>/g)].filter((m) => !/type\s*=\s*["'](hidden|submit|checkbox|radio)["']/.test(m[2]));
      const labelled = (text.match(/<(label|Label|FormLabel)\b/g) || []).length + fields.filter((m) => /aria-label(ledby)?\s*=/.test(m[2])).length;
      if (fields.length > labelled) add('labels', text.slice(0, fields[0].index).split('\n').length, `${fields.length} fields and ${labelled} labels`);
      for (const m of text.matchAll(/<(Input|input|Button|button|SelectTrigger)\b((?:=>|[^>])*)>/g)) {
        const hc = classOf(m[0]).match(/(?:^|\s)h-(\d+)(?=\s|$)/), sz = m[2].match(/size\s*=\s*["'](sm|xs)["']/);
        const px = hc ? HEIGHTS[hc[1]] || Number(hc[1]) * 4 : null;
        if ((px && px < TOUCH) || sz) add('targets', text.slice(0, m.index).split('\n').length, px ? `a ${m[1]} ${px}px tall` : `a ${m[1]} at size ${sz[1]}`);
      }
    }
  }
  // The stylesheet: letter-spaced capitals in a CSS rule, and the text selection styled (::selection, or a selection: class).
  if (css && files.length) {
    const kind = count.marketing ? 'marketing' : 'app', cl = css.text.split('\n');
    for (const [sel, body, line] of cssRules(css.text)) if (/text-transform:\s*uppercase/.test(body) && /letter-spacing:\s*(?!-)\d*\.?\d+(em|px|rem)/.test(body) && !/^0(\.0+)?(em|px|rem)/.test((body.match(/letter-spacing:\s*([^;]+)/) || [, ''])[1].trim()) && !/look-ok/.test(cl[line - 1] || '')) found.push({ rule: 'craft', rel: css.rel, line, detail: `letter-spaced capitals in ${sel.split('\n').pop().trim()}`, kind });
    if (!selection && !/::selection/.test(css.text) && !/look-ok[^\n]*selection|selection[^\n]*look-ok/i.test(css.text)) found.push({ rule: 'craft', rel: css.rel, line: 1, detail: 'the text selection is not styled (::selection in the leading colour, craft.md; to keep it on purpose, add a look-ok comment with the reason on a line that says selection)', kind });
  }
  return { found, files: files.length, count, landing };
}

// ---- the art direction: written with reasons, picked by the owner, its own look ----
const SAT = JSON.parse(fs.readFileSync(path.join(HERE, 'saturated-fonts.json'), 'utf8'));
const SATURATED = [...new Set([...SAT.most_used.fonts, ...SAT.ai_saturated.fonts])];
const SEEN = JSON.parse(fs.readFileSync(path.join(HERE, 'seen.json'), 'utf8')).looks;
const words = (t) => t.trim().split(/\s+/).filter(Boolean).length;
function section(md, title) {
  const i = md.search(new RegExp(`^## ${title}\\s*$`, 'm'));
  if (i < 0) return [];
  const rest = md.slice(i).split('\n').slice(1), out = [];
  for (const l of rest) { if (/^## /.test(l)) break; out.push(l); }
  return out;
}
// A filled line: not a bracketed hint, with at least n words after its label.
const filled = (lines, n = 3) => lines.filter((l) => { const rest = l.replace(/^\s*(-|\d+\.)\s*[\w ',-]*?:/, '').trim(); return l.trim() && !/^\(/.test(l.trim()) && !/^\(/.test(rest) && words(rest) >= n; });
// The 4 axes of a direction line: "1. ground: dark; type: slab serif; structure: editorial; density: airy."
const AXES = ['ground', 'type', 'structure', 'density'];
export function axesOf(line) {
  const o = {};
  for (const a of AXES) { const m = line.match(new RegExp(`\\b${a}:\\s*([^;.]+)`, 'i')); if (m && m[1].trim()) o[a] = m[1].trim().toLowerCase(); }
  return o;
}
// The moves in craft.md, by the words that name them.
const MOVES = [['an object in the headline', /object|toggle|inside the headline|in the headline/i], ['a word that carries the meaning', /word that carries|carries the meaning|coloured word|rolling word|accent word/i], ['the shot bleeding off its card', /bleed/i], ['the ground that shifts', /ground[^,;.]{0,12}shift|shift[^,;.]{0,12}ground|ground colour/i], ['the button that morphs', /morph/i], ['a faint grain', /grain/i], ['the floating pill nav', /floating|pill nav/i], ['the reveal with a blur', /reveal|blur/i]];
export const movesOf = (line) => (/^- Moves:\s*none\b/i.test(line) ? [] : MOVES.filter(([, re]) => re.test(line.replace(/^- Moves:/i, ''))).map(([n]) => n));
export function artDirection(md) {
  const faults = [];
  if (/^Status: not written yet/m.test(md)) faults.push('it still says "Status: not written yet"');
  const roles = section(md, 'Colour roles').filter((l) => /^- [\w -]+:/.test(l) && /oklch\(|#[0-9a-fA-F]{3,6}\b/.test(l) && words(l.replace(/^- [\w -]+:/, '').replace(/oklch\([^)]*\)|#[0-9a-fA-F]{3,6}\b/g, '')) >= 6);
  if (roles.length < 4) faults.push(`${roles.length} colour ${roles.length === 1 ? 'role has' : 'roles have'} a colour and a reason (needs 4 to 6)`);
  if (!filled(section(md, 'The governing idea'), 6).length) faults.push('there is no governing idea');
  if (!section(md, 'Type').filter((l) => /^- (Headings|Body):/i.test(l) && words(l.replace(/^- [\w -]+:/, '')) >= 6).length) faults.push('no typeface has a reason');
  // The directions: at least 2 written on the 4 axes, every 2 differing on at least 3.
  const dirs = section(md, 'Directions shown to the owner').filter((l) => /^\d+\.\s/.test(l)).map(axesOf).filter((o) => Object.keys(o).length === 4);
  if (dirs.length < 2) faults.push('fewer than 2 directions are written on the 4 axes (ground, type, structure, density)');
  for (let i = 0; i < dirs.length; i++) for (let j = i + 1; j < dirs.length; j++) {
    const diff = AXES.filter((a) => dirs[i][a] !== dirs[j][a]).length;
    if (diff < 3) faults.push(`directions ${i + 1} and ${j + 1} differ on only ${diff} of the 4 axes (needs 3)`);
  }
  // The pick quotes the owner.
  const picked = md.split('\n').find((l) => /^- Picked:/.test(l)) || '';
  const quote = picked.match(/["“]([^"”]{3,})["”]/);
  if (!quote || /their own words here/i.test(quote[1])) faults.push('the Picked line does not quote the owner');
  // The bar: 3 to 5 real sites or apps, each with its address and why it is beautiful.
  const bar = filled(section(md, 'The bar'), 6).filter((l) => /https?:\/\/|\b[\w-]+\.(com|co|io|design|studio|website|net|org|app|dev|uk|fr|de|nl|it|es|ch|se)\b/i.test(l));
  if (bar.length < 3) faults.push(`"The bar" names ${bar.length} real ${bar.length === 1 ? 'site' : 'sites'} with an address and why it is beautiful (needs 3 to 5)`);
  const sig = section(md, 'The signature moment').length ? 'The signature moment' : 'The move';
  for (const [title, n] of [[sig, 4], ['Shape', 2], ['Density', 2], ['Pictures', 3], ['Voice', 3], ['Competitor test', 2]]) if (filled(section(md, title), n).length < (title === 'Competitor test' ? 2 : 1)) faults.push(`"${title === 'The move' ? 'The signature moment' : title}" is not written`);
  // The beauty pass: the built page set beside the bar, with what changed.
  const pass = filled(section(md, 'Beauty pass'), 4).filter((l) => /^- (Before|After):/i.test(l));
  if (pass.length < 2) faults.push('"Beauty pass" is not written: shoot the page, set it beside the bar, fix the 3 biggest things, and write the before and after');
  // Omar's moves: named on the Moves line, at most moves_max of them (craft.md).
  const movesLine = section(md, 'Motion').find((l) => /^- Moves:/i.test(l)) || '';
  if (!filled([movesLine], 1).length) faults.push('the Motion section has no Moves line: name at most ' + N.craft.moves_max + ' of Omar\'s moves from .5ds/taste/craft.md, or none');
  else if (movesOf(movesLine).length > N.craft.moves_max) faults.push(`the Moves line names ${movesOf(movesLine).length} of Omar's moves (${movesOf(movesLine).join(', ')}); pick at most ${N.craft.moves_max}`);
  const craftLine = filled(section(md, 'Beauty pass'), 8).find((l) => /^- Craft:/i.test(l));
  if (!craftLine || (craftLine.match(/\d+(?:\.\d+)?\s*(?:px|em|percent|%)/g) || []).length < 2) faults.push('"Beauty pass" has no Craft line naming at least 2 craft numbers: check the page against .5ds/taste/craft.md and write what you checked and fixed');
  return faults;
}
// The fingerprint of an art direction: the faces, the canvas, the action hue, the radius and the first screen structure.
export function fingerprint(md, paletteText = '', parseColour) {
  const face = (label) => { const l = section(md, 'Type').find((x) => new RegExp(`^- ${label}:`, 'i').test(x)) || ''; const v = l.replace(/^- [\w ]+:\s*/, ''); return { name: (v.split(/[,(:]/)[0] || '').trim(), kind: (v.match(/\(([^)]+)\)/) || [, ''])[1].toLowerCase() || v.toLowerCase() }; };
  const colour = (role) => { const l = section(md, 'Colour roles').find((x) => new RegExp(`^- ${role}:`, 'i').test(x)) || ''; const m = l.match(/oklch\([^)]*\)|#[0-9a-fA-F]{6}\b|#[0-9a-fA-F]{3}\b/); return m ? parseColour(m[0]) : null; };
  const structure = ((section(md, 'Layout').find((x) => /^- First screen structure:/i.test(x)) || '').match(/\b(centred|centered|left|editorial|grid)\b/i) || [, ''])[1].toLowerCase().replace('centered', 'centred');
  const radius = ((paletteText.match(/```palette\n[\s\S]*?```/) || [''])[0].match(/^radius:\s*(\S+)/m) || [, ''])[1];
  const h = face('Headings'), b = face('Body'), canvas = colour('canvas'), action = colour('action');
  return { heading: h.name, heading_kind: h.kind, body: b.name, body_kind: b.kind, canvas: canvas && { L: +canvas.L.toFixed(3), C: +canvas.C.toFixed(3), H: +canvas.H.toFixed(1) }, action: action && { L: +action.L.toFixed(3), C: +action.C.toFixed(3), H: +action.H.toFixed(1) }, radius, structure };
}
const hueNear = (a, b, d = 30) => Math.min(Math.abs(a - b), 360 - Math.abs(a - b)) <= d;
// The 5 axes 2 projects are compared on.
export function sameAxes(x, y) {
  const same = [];
  if (x.heading && y.heading && x.heading.toLowerCase() === y.heading.toLowerCase()) same.push(`heading face ${x.heading}`);
  if (x.body && y.body && x.body.toLowerCase() === y.body.toLowerCase()) same.push(`body face ${x.body}`);
  if (x.canvas && y.canvas && (x.canvas.L < 0.5) === (y.canvas.L < 0.5) && ((x.canvas.C <= 0.03 && y.canvas.C <= 0.03) || hueNear(x.canvas.H, y.canvas.H))) same.push('canvas');
  if (x.action && y.action && hueNear(x.action.H, y.action.H)) same.push('action hue');
  if (x.structure && y.structure && x.structure === y.structure) same.push(`${x.structure} first screen`);
  return same;
}
const inRange = (h, r) => (r[0] <= r[1] ? h >= r[0] && h <= r[1] : h >= r[0] || h <= r[1]);
export function seenMatch(fp) {
  return SEEN.filter((s) => {
    if (s.canvas) { if (!fp.canvas) return false; if (s.canvas.mode === 'light' && fp.canvas.L < 0.5) return false; if (s.canvas.mode === 'dark' && fp.canvas.L >= 0.5) return false; if (s.canvas.hue && !inRange(fp.canvas.H, s.canvas.hue)) return false; if (s.canvas.chroma_max !== undefined && fp.canvas.C > s.canvas.chroma_max) return false; }
    if (s.action_hue && !(fp.action && inRange(fp.action.H, s.action_hue))) return false;
    if (s.action && !(fp.action && fp.action.L >= s.action.lightness_min && fp.action.C >= s.action.chroma_min)) return false;
    if (s.heading_kind && !(/serif/.test(fp.heading_kind) && !/sans/.test(fp.heading_kind))) return false;
    if (s.any_kind && ![fp.heading_kind, fp.body_kind].some((k) => k.includes(s.any_kind))) return false;
    if (s.face && ![fp.heading, fp.body].some((f) => f.toLowerCase() === s.face.toLowerCase())) return false;
    return true;
  }).map((s) => s.name);
}
// This machine's looks, 1 line per project, kept on this computer only and never sent: ~/.5ds/looks.ndjson.
const LOOKS = () => process.env.FDS_LOOKS_FILE || path.join(os.homedir(), '.5ds', 'looks.ndjson');
export function compareLooks(id, name, fp, write = true) {
  let rows = [];
  try { rows = fs.readFileSync(LOOKS(), 'utf8').split('\n').filter(Boolean).map((l) => { try { return JSON.parse(l); } catch { return null; } }).filter(Boolean); } catch { rows = []; }
  const matches = rows.filter((r) => r.id !== id).map((r) => ({ project: r.name, same: sameAxes(fp, r.fp) })).filter((m) => m.same.length >= 3);
  if (write) {
    try {
      const keep = rows.filter((r) => r.id !== id).slice(-199);
      fs.mkdirSync(path.dirname(LOOKS()), { recursive: true, mode: 0o700 });
      const tmp = `${LOOKS()}.${process.pid}.tmp`;
      fs.writeFileSync(tmp, [...keep, { id, name, at: new Date().toISOString().slice(0, 10), fp }].map((r) => JSON.stringify(r)).join('\n') + '\n', { mode: 0o600 });
      fs.renameSync(tmp, LOOKS());
    } catch { /* a read-only home: compare only */ }
  }
  return matches;
}
// The Google faces the app loads: next/font imports and Google Fonts links.
function facesUsed(root) {
  const used = new Map(), add = (name, rel) => { const n = name.replace(/_/g, ' ').replace(/\+/g, ' ').trim(); if (n && !used.has(n.toLowerCase())) used.set(n.toLowerCase(), { name: n, rel }); };
  const walk = (dir) => {
    let names; try { names = fs.readdirSync(dir, { withFileTypes: true }); } catch { return; }
    for (const e of names) {
      const f = path.join(dir, e.name), rel = path.relative(root, f).split(path.sep).join('/');
      if (e.isSymbolicLink()) continue;
      if (e.isDirectory()) { if (!SKIP_DIRS.has(e.name)) walk(f); continue; }
      if (!/\.(tsx|jsx|ts|js|mjs|css|html)$/.test(e.name)) continue;
      let t = ''; try { if (fs.statSync(f).size > MAX_BYTES) continue; t = fs.readFileSync(f, 'utf8'); } catch { continue; }
      for (const m of t.matchAll(/import\s*\{([^}]+)\}\s*from\s*["']next\/font\/google["']/g)) for (const n of m[1].split(',')) { const name = n.trim().split(/\s+as\s+/)[0]; if (name) add(name, rel); }
      for (const m of t.matchAll(/fonts\.googleapis\.com\/css2?\?family=([A-Za-z+]+)/g)) add(m[1], rel);
    }
  };
  walk(root);
  return [...used.values()];
}
function fontFaults(root, md) {
  const faces = facesUsed(root), faults = [];
  for (const f of faces) {
    const sat = SATURATED.find((x) => x.toLowerCase() === f.name.toLowerCase());
    if (!sat) continue;
    const reason = md.split('\n').some((l) => l.toLowerCase().includes(sat.toLowerCase()) && words(l) >= 8);
    if (!reason) faults.push({ rel: f.rel, detail: `${sat} is in saturated-fonts.json and art-direction.md gives no reason for it` });
  }
  return { faces, faults };
}
// shadcn restyled beyond colour: the radius changed, or a shadow, heading font or other non-colour token set.
export function silhouette(css) {
  const root = (css.match(/:root\s*\{[^}]*\}/) || [''])[0];
  const radius = (root.match(/--radius:\s*([^;]+);/) || [, ''])[1].trim();
  // The starter sets --font-heading to the body font; a heading face of its own counts.
  const heading = [...css.matchAll(/--font-heading:\s*([^;]+);/g)].some((m) => m[1].trim() !== 'var(--font-sans)');
  const extra = heading || /--shadow[\w-]*:|--tracking[\w-]*:|--spacing:|--border-width|--ring-width|outline-offset|--focus[\w-]*:/.test(css);
  return (!radius || radius === '0.625rem') && !extra;
}

async function main() {
  const { found, files, count, landing } = scan(ROOT);
  out('5 Day Sprint look check. It read the screen files, checks the official pages once a day, and writes 1 line to .5ds/taste/notes.md. Nothing else was changed or sent.');
  let shown = 0, passed = 0, notChecked = 0, fixes = 0;
  const groups = [['marketing', 'Marketing pages'], ['app', 'App screens'], ['form', 'Forms']];
  for (const [kind, title] of groups) {
    out(''); out(`${title} (${count[kind]} ${count[kind] === 1 ? 'file' : 'files'})`);
    if (!count[kind]) { notChecked++; out(`not checked here  ${title}: there are none yet.`); continue; }
    for (const r of RULES.filter((x) => x.kinds.includes(kind))) {
      if (r.id === 'hero' && !landing) { notChecked++; out(`not checked here  ${r.label}: ${r.none}.`); out('                  Ask Claude: "Give the home page a clear main headline in an h1, sized as web.md says."'); continue; }
      const mine = found.filter((f) => f.rule === r.id && f.kind === kind);
      if (!mine.length) { passed++; out(`pass  ${r.label}.`); continue; }
      fixes += mine.length;
      out(`fix   ${r.label}: ${mine.length} ${mine.length === 1 ? 'place' : 'places'}.`);
      for (const f of mine) { if (shown >= MAX_LINES) break; shown++; out(`      - ${f.rel}:${f.line}: ${f.detail}.`); }
      out(`      Ask Claude: "${r.ask}"`);
    }
  }
  // The art direction: only once there are screens to hold to it.
  out(''); out('Art direction');
  let md = null; try { md = fs.readFileSync(path.join(ROOT, '.5ds', 'taste', 'art-direction.md'), 'utf8'); } catch { md = null; }
  let pal = ''; try { pal = fs.readFileSync(path.join(ROOT, '.5ds', 'taste', 'palette.md'), 'utf8'); } catch { pal = ''; }
  const block = (label, items, ask) => { if (!items.length) { passed++; out(`pass  ${label}.`); return; } fixes += items.length; out(`fix   ${label}: ${items.length} ${items.length === 1 ? 'place' : 'places'}.`); items.forEach((x) => out(`      - ${x}.`)); out(`      Ask Claude: "${ask}"`); };
  if (!files) { notChecked += 4; for (const l of ['The art direction is written, picked by the owner, with reasons', 'Saturated faces have a stated reason', 'Its own look: not seen everywhere, not a repeat of another project', 'shadcn restyled beyond colour']) out(`not checked here  ${l}: there are no screens yet. Write the art direction before the first one.`); }
  else {
    block('The art direction is written, picked by the owner, with reasons', (md === null ? ['the file is missing'] : artDirection(md)).map((x) => `.5ds/taste/art-direction.md: ${x}`), 'Write the art direction from .5ds/taste/instructions.md before more screens.');
    const ff = fontFaults(ROOT, md || '');
    if (!ff.faces.length) { notChecked++; out('not checked here  Saturated faces have a stated reason: no Google fonts are loaded yet.'); }
    else block(`Saturated faces have a stated reason (${ff.faces.map((f) => f.name).join(', ')})`, ff.faults.map((x) => `${x.rel}: ${x.detail}`), 'Write why this face fits the idea in art-direction.md, by name, or choose another after trying 2 or 3 on the real headline.');
    const fp = md ? fingerprint(md, pal, parseColour) : null;
    if (!fp || [fp.heading, fp.body, fp.canvas, fp.action, fp.structure].filter(Boolean).length < 3) { notChecked++; out('not checked here  Its own look: not seen everywhere, not a repeat of another project: the art direction does not name enough faces, colours and structure yet.'); }
    else {
      const id = crypto.createHash('sha256').update(ROOT).digest('hex').slice(0, 16);
      // A seen look is an end check, not a ban: it passes once the art direction says why it is a choice here.
      const idea = filled(section(md, 'The governing idea'), 6).join(' ').toLowerCase();
      const why = md.split('\n').find((l) => /^- Close to a seen look:/i.test(l)) || '', chosen = filled([why], 6).length && !/^- Close to a seen look:\s*none\b/i.test(why);
      const seen = chosen ? [] : seenMatch(fp).filter((n) => !idea.includes(n.split(',')[0].toLowerCase()));
      const repeats = compareLooks(id, path.basename(ROOT), fp, !NO_WRITE);
      block('Its own look: not seen everywhere, not a repeat of another project', [
        ...seen.map((n) => `.5ds/taste/art-direction.md: it matches a look seen everywhere (${n}); if it is a choice, say why on the Close to a seen look line; if it is a default, change the ground, the type kind or the structure`),
        ...repeats.map((r) => `.5ds/taste/art-direction.md: it matches your project "${r.project}" on ${r.same.length} of 5 axes (${r.same.join(', ')}); change at least 3`),
      ], 'Go back to step 4 of the art direction and change the ground, the type kind and the structure together.');
    }
    const cssFile = CSS_FILES.map((p) => path.join(ROOT, p)).find((p) => fs.existsSync(p));
    if (!cssFile) { notChecked++; out('not checked here  shadcn restyled beyond colour: no globals.css was found.'); }
    else block('shadcn restyled beyond colour', silhouette(fs.readFileSync(cssFile, 'utf8')) ? [`${path.relative(ROOT, cssFile)}: only the colours differ from the shadcn starter (radius 0.625rem, no shadow, focus or heading tokens)`] : [], 'Set the radius, shadows, focus style and heading face from the Shape section of the art direction.');
  }
  // The official pages: newer than the guides? Once a day, only when online.
  out(''); out('Official guidelines');
  const used = [...platformsUsed(ROOT), 'motion'];
  if (OFFLINE) { notChecked++; out('not checked here  The guides match the latest official pages: skipped (offline mode). Ask Claude: "Run node .5ds/taste/sources.mjs when online."'); }
  else {
    const todo = used.filter((p) => !checkedToday(ROOT, p));
    let rs = [];
    try { rs = todo.length ? await checkSources({ root: ROOT, platforms: todo, timeoutMs: 6000 }) : []; } catch { rs = []; }
    for (const p of used) {
      const r = rs.find((x) => x.platform === p);
      if (!r && !todo.includes(p)) { passed++; out(`pass  ${p}: already checked today (see .5ds/taste/notes.md).`); }
      else if (!r || r.state === 'offline') { notChecked++; out(`not checked here  ${p}: no official page could be read (offline?). Ask Claude: "Run node .5ds/taste/sources.mjs when online."`); }
      else if (r.state === 'newer') { fixes++; out(`fix   ${p}: an official page dated ${r.newest} is newer than the guide (${r.guideChecked}). Read it and note the new rule in .5ds/taste/notes.md.`); }
      else { passed++; out(`pass  ${p}: the guide is as new as the official pages (newest ${r.newest}).`); }
    }
  }
  out('');
  if (found.length > shown) out(`${found.length - shown} more fix lines are not shown. Fix these first, then run it again, or add --all to see every one.`);
  out(`Result: ${fixes} fix ${fixes === 1 ? 'line' : 'lines'}, ${passed} passed, ${notChecked} not checked here, in ${files} screen ${files === 1 ? 'file' : 'files'}. Then look at the screens with .5ds/taste/checklist.md.`);
}
try { await main(); } catch (e) { out(`The look check could not finish (${String((e && e.message) || e).slice(0, 120)}). Nothing was changed.`); }
process.exitCode = 0;
