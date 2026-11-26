// 5 Day Sprint palette. Takes the colour roles you chose in your art direction (canvas, ink, action, and an optional
// accent), works out every other shadcn token from them, light and dark, measures the contrast of every text and ground
// pair, and writes the tokens into the web app's theme. It has no colours of its own and needs no packages.
//   node .5ds/taste/palette.mjs            read the roles in .5ds/taste/palette.md and write the theme
//   node .5ds/taste/palette.mjs --check    measure and print only; change nothing
//   --css <file>   the theme file (default: the first of web/app/globals.css, app/globals.css, src/app/globals.css)
//   --dir <folder> the project folder (default: the folder that holds .5ds)
// It changes nothing until canvas, ink and action are chosen, and it always ends with exit code 0.
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const args = process.argv.slice(2);
const opt = (k) => { const i = args.indexOf(k); return i >= 0 ? args[i + 1] : null; };
const ROOT = path.resolve(opt('--dir') || path.join(HERE, '..', '..'));
const PALETTE = path.join(ROOT, '.5ds', 'taste', 'palette.md');
const NUMBERS = JSON.parse(fs.readFileSync(path.join(HERE, 'numbers.json'), 'utf8'));
const BODY = NUMBERS.contrast.body, LARGE = NUMBERS.contrast.large;
const out = (s = '') => console.log(s);

// ---- colour maths: hex and OKLCH, gamut mapping, WCAG contrast ----
const r3 = (x) => Math.round(x * 1000) / 1000;
function oklchToLinear(L, C, H) {
  const h = (H * Math.PI) / 180, a = C * Math.cos(h), b = C * Math.sin(h);
  const l = (L + 0.3963377774 * a + 0.2158037573 * b) ** 3, m = (L - 0.1055613458 * a - 0.0638541728 * b) ** 3, s = (L - 0.0894841775 * a - 1.291485548 * b) ** 3;
  return [4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s, -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s, -0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s];
}
function hexToOklch(hex) {
  let h = hex.replace('#', ''); if (h.length === 3) h = h.split('').map((c) => c + c).join('');
  const [r, g, b] = [0, 2, 4].map((i) => { const c = parseInt(h.slice(i, i + 2), 16) / 255; return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4; });
  const l = Math.cbrt(0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b), m = Math.cbrt(0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b), s = Math.cbrt(0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b);
  const L = 0.2104542553 * l + 0.793617785 * m - 0.0040720468 * s, A = 1.9779984951 * l - 2.428592205 * m + 0.4505937099 * s, B = 0.0259040371 * l + 0.7827717662 * m - 0.808675766 * s;
  return { L, C: Math.hypot(A, B), H: ((Math.atan2(B, A) * 180) / Math.PI + 360) % 360 };
}
// A colour as written in palette.md: oklch(L C H) or a hex code, kept exactly as chosen (a browser maps a colour past its
// screen itself). null when it is neither.
export function parseColour(v) {
  const s = String(v || '').trim();
  const o = s.match(/^oklch\(\s*([\d.]+)(%?)\s+([\d.]+)\s+([\d.]+)\s*\)$/i);
  if (o) return { L: Number(o[1]) / (o[2] ? 100 : 1), C: Number(o[3]), H: Number(o[4]) };
  if (/^#([0-9a-f]{3}|[0-9a-f]{6})$/i.test(s)) return hexToOklch(s);
  return null;
}
const inGamut = (rgb) => rgb.every((v) => v >= -0.0005 && v <= 1.0005);
export function fit(L, C, H) {
  L = Math.min(1, Math.max(0, L)); C = Math.max(0, C);
  if (inGamut(oklchToLinear(L, C, H))) return { L, C, H };
  let lo = 0, hi = C;
  for (let i = 0; i < 24; i++) { const mid = (lo + hi) / 2; if (inGamut(oklchToLinear(L, mid, H))) lo = mid; else hi = mid; }
  return { L, C: lo, H };
}
const luminance = ({ L, C, H }) => { const [r, g, b] = oklchToLinear(L, C, H).map((v) => Math.min(1, Math.max(0, v))); return 0.2126 * r + 0.7152 * g + 0.0722 * b; };
export const contrast = (x, y) => { const a = luminance(x), b = luminance(y); return (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05); };
const hex = ({ L, C, H }) => '#' + oklchToLinear(L, C, H).map((v) => { const c = Math.min(1, Math.max(0, v)); const s = c <= 0.0031308 ? 12.92 * c : 1.055 * c ** (1 / 2.4) - 0.055; return Math.round(s * 255).toString(16).padStart(2, '0'); }).join('');
const css = ({ L, C, H }) => `oklch(${r3(L)} ${r3(C)} ${r3(H)})`;
const col = (L, C, H) => fit(L, C, H);
// Move a colour's lightness away from its ground until the pair reaches the target ratio (for the roles worked out here).
function reach(fg, bg, target) {
  let c = fit(fg.L, fg.C, fg.H);
  const dir = luminance(bg) > 0.18 ? -1 : 1;
  for (let i = 0; i < 100 && contrast(c, bg) < target; i++) c = fit(c.L + dir * 0.01, fg.C, fg.H);
  return c;
}

// ---- the tokens, from the chosen roles ----
const isDark = (c) => c.L < 0.5;
// Every token of 1 mode from its canvas, ink and action (and accent).
function mode(canvas, ink, action, accent) {
  const dark = isDark(canvas), step = (d) => col(canvas.L + (dark ? d : -d), canvas.C, canvas.H);
  const t = { background: canvas, foreground: ink, primary: action };
  t.card = dark ? step(0.05) : col(Math.min(1, canvas.L + 0.015), canvas.C * 0.5, canvas.H);
  t.muted = step(dark ? 0.07 : 0.03);
  t.border = step(dark ? 0.13 : 0.085);
  const light = col(0.99, 0, 0), deep = col(Math.min(ink.L, 0.2), Math.min(ink.C, 0.03), ink.H);
  t['primary-foreground'] = contrast(light, action) >= contrast(deep, action) ? light : deep;
  t.secondary = col(canvas.L + (dark ? 0.09 : -0.045), Math.min(Math.max(action.C * 0.2, canvas.C), 0.06), action.H);
  t['secondary-foreground'] = reach(col(ink.L, ink.C, ink.H), t.secondary, BODY);
  t['muted-foreground'] = reach(reach(col((ink.L + canvas.L) / 2, (ink.C + canvas.C) / 2, ink.H), t.muted, BODY), canvas, BODY);
  t['brand-soft'] = t['primary-foreground'] === light ? reach(col(0.9, Math.min(action.C * 0.3, 0.08), action.H), action, BODY) : reach(col(0.28, Math.min(action.C * 0.4, 0.1), action.H), action, BODY);
  t['surface-tint'] = col(canvas.L + (dark ? 0.04 : -0.02), Math.min(Math.max(action.C * 0.1, canvas.C), 0.035), action.H);
  t.highlight = accent || null;
  return t;
}
// The other mode, when it was not chosen: the same hues on the opposite ground.
function opposite(canvas, ink, action) {
  if (isDark(canvas)) { const c = col(0.985, Math.min(canvas.C, 0.015), canvas.H); return [c, col(0.2, Math.min(ink.C, 0.03), ink.H), reach(action, c, LARGE)]; }
  const c = col(0.16, Math.min(canvas.C, 0.02), canvas.H);
  return [c, col(0.96, Math.min(ink.C, 0.02), ink.H), reach(col(Math.max(action.L, 0.62), action.C, action.H), c, LARGE)];
}
export function tokens(input) {
  const get = (k) => parseColour(input[k]);
  const canvas = get('canvas'), ink = get('ink'), action = get('action'), accent = get('accent');
  if (!canvas || !ink || !action) return null;
  const main = mode(canvas, ink, action, accent);
  const [oc, oi, oa] = opposite(canvas, ink, action);
  const otherKey = isDark(canvas) ? 'light' : 'dark';
  const other = mode(get(`${otherKey}_canvas`) || oc, get(`${otherKey}_ink`) || oi, get(`${otherKey}_action`) || oa, accent);
  const t = isDark(canvas) ? { light: other, dark: main } : { light: main, dark: other };
  t.opens = isDark(canvas) ? 'dark' : 'light';
  return t;
}
// Every text and ground pair, with the ratio it needs: body text 4.5 to 1, large text and controls 3 to 1.
export const PAIRS = [
  ['foreground', 'background', BODY], ['foreground', 'card', BODY], ['muted-foreground', 'background', BODY], ['muted-foreground', 'muted', BODY],
  ['primary-foreground', 'primary', BODY], ['secondary-foreground', 'secondary', BODY], ['brand-soft', 'primary', BODY], ['foreground', 'surface-tint', BODY],
  ['primary', 'background', LARGE], ['primary', 'card', LARGE],
];
export function measure(t) {
  const rows = [];
  for (const m of ['light', 'dark']) for (const [fg, bg, need] of PAIRS) {
    const r = contrast(t[m][fg], t[m][bg]);
    rows.push({ mode: m, fg, bg, ratio: Math.round(r * 100) / 100, need, ok: r >= need, fix: r >= need ? null : css(reach(t[m][fg], t[m][bg], need)) });
  }
  return rows;
}
export function cssBlocks(t, radius) {
  const v = (m) => {
    const x = t[m];
    const o = {
      background: css(x.background), foreground: css(x.foreground), card: css(x.card), 'card-foreground': css(x.foreground), popover: css(x.card), 'popover-foreground': css(x.foreground),
      primary: css(x.primary), 'primary-foreground': css(x['primary-foreground']), secondary: css(x.secondary), 'secondary-foreground': css(x['secondary-foreground']),
      muted: css(x.muted), 'muted-foreground': css(x['muted-foreground']), accent: css(x.secondary), 'accent-foreground': css(x['secondary-foreground']),
      destructive: m === 'dark' ? 'oklch(0.704 0.191 22.216)' : 'oklch(0.577 0.245 27.325)', border: css(x.border), input: css(x.border), ring: css(x.primary),
      'chart-1': css(x.primary), 'chart-2': css(x.highlight || col(x.primary.L + 0.12, x.primary.C * 0.7, (x.primary.H + 40) % 360)), 'chart-3': css(col(x.primary.L + 0.24, x.primary.C * 0.45, x.primary.H)),
      'chart-4': css(col(x.primary.L - 0.12, x.primary.C * 0.6, x.primary.H)), 'chart-5': css(col((x.background.L + x.foreground.L) / 2, 0.02, x.foreground.H)),
    };
    if (m === 'light' && radius) o.radius = radius;
    Object.assign(o, {
      sidebar: css(x.card), 'sidebar-foreground': css(x.foreground), 'sidebar-primary': css(x.primary), 'sidebar-primary-foreground': css(x['primary-foreground']),
      'sidebar-accent': css(x.secondary), 'sidebar-accent-foreground': css(x['secondary-foreground']), 'sidebar-border': css(x.border), 'sidebar-ring': css(x.primary),
    });
    return o;
  };
  const block = (sel, o) => `${sel} {\n${Object.entries(o).map(([k, val]) => `    --${k}: ${val};`).join('\n')}\n}`;
  const hl = (m) => (t[m].highlight ? ` --highlight: ${css(t[m].highlight)};` : '');
  const extras = `/* 5ds palette extras start */\n:root { --brand-soft: ${css(t.light['brand-soft'])}; --surface-tint: ${css(t.light['surface-tint'])};${hl('light')} }\n.dark { --brand-soft: ${css(t.dark['brand-soft'])}; --surface-tint: ${css(t.dark['surface-tint'])};${hl('dark')} }\n@theme inline { --color-brand-soft: var(--brand-soft); --color-surface-tint: var(--surface-tint);${t.light.highlight ? ' --color-highlight: var(--highlight);' : ''} }\n/* 5ds palette extras end */`;
  return { root: block(':root', v('light')), dark: block('.dark', v('dark')), extras };
}
function replaceBlock(text, selector, body) {
  const at = text.search(new RegExp(`(^|\\n)${selector.replace('.', '\\.')}\\s*\\{`));
  if (at < 0) return `${text.trimEnd()}\n\n${body}\n`;
  const start = text.indexOf(selector, at), open = text.indexOf('{', start);
  let depth = 0, end = open;
  for (; end < text.length; end++) { if (text[end] === '{') depth++; else if (text[end] === '}') { depth--; if (depth === 0) break; } }
  return text.slice(0, start) + body + text.slice(end + 1);
}
export function writeTheme(text, blocks) {
  let t = text.replace(/\n?\/\* 5ds palette extras start \*\/[\s\S]*?\/\* 5ds palette extras end \*\/\n?/, '\n');
  t = replaceBlock(t, ':root', blocks.root);
  t = replaceBlock(t, '.dark', blocks.dark);
  return `${t.trimEnd()}\n\n${blocks.extras}\n`;
}
const KEYS = ['canvas', 'ink', 'action', 'accent', 'radius', 'light_canvas', 'light_ink', 'light_action', 'dark_canvas', 'dark_ink', 'dark_action'];
export function readInputs(text) {
  const m = String(text || '').match(/```palette\n([\s\S]*?)```/);
  if (!m) return {};
  const o = {};
  for (const line of m[1].split('\n')) { const x = line.match(/^([a-z_]+):\s*(.*?)(?:\s+#\s.*)?$/); if (x && KEYS.includes(x[1]) && x[2]) o[x[1]] = x[2].trim(); }
  return o;
}

function main() {
  let text = ''; try { text = fs.readFileSync(PALETTE, 'utf8'); } catch { /* none yet */ }
  const inputs = readInputs(text), t = tokens(inputs);
  if (!t) {
    const missing = ['canvas', 'ink', 'action'].filter((k) => !parseColour(inputs[k]));
    out(`No colours are chosen yet (${missing.join(', ')} ${missing.length === 1 ? 'is' : 'are'} missing or not a colour), so nothing was changed. Write the art direction first (.5ds/taste/art-direction.md), then put its colour roles in .5ds/taste/palette.md as oklch(L C H) or a hex code.`);
    return;
  }
  const rows = measure(t);
  out(`Palette from your roles: opens in ${t.opens} mode. Action ${hex(t[t.opens].primary)}, canvas ${hex(t[t.opens].background)}, ink ${hex(t[t.opens].foreground)}. For an app's colour sets, use these.`);
  out('');
  out('Contrast, every text and ground pair (body text needs 4.5 to 1, large text and controls 3 to 1):');
  for (const r of rows) out(`  ${r.ok ? 'pass' : 'fix '}  ${r.mode.padEnd(5)} ${r.fg} on ${r.bg}: ${r.ratio.toFixed(2)} to 1 (needs ${r.need})${r.ok ? '' : `. Nearest that passes: ${r.fix}`}`);
  const bad = rows.filter((r) => !r.ok).length;
  out('');
  if (args.includes('--check')) { out(`Checked only: ${bad ? `${bad} pairs fail` : 'every pair passes'}. Nothing was changed.`); return; }
  const file = opt('--css') ? path.resolve(opt('--css')) : ['web/app/globals.css', 'app/globals.css', 'src/app/globals.css'].map((p) => path.join(ROOT, p)).find((p) => fs.existsSync(p));
  if (!file || !fs.existsSync(file)) { out('No web theme file was found (web/app/globals.css), so the theme was not written. For an app, use the colours above.'); return; }
  fs.writeFileSync(file, writeTheme(fs.readFileSync(file, 'utf8'), cssBlocks(t, inputs.radius)));
  out(`Wrote every token, light and dark, into ${path.relative(ROOT, file)}. ${bad ? `${bad} pairs fail: your chosen colours were kept as they are; change them in palette.md (the nearest passing value is shown) and run this again.` : 'Every pair passes.'}`);
}
if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try { main(); } catch (e) { out(`The palette could not finish (${String((e && e.message) || e).slice(0, 120)}). Nothing more was changed.`); }
  process.exitCode = 0;
}
