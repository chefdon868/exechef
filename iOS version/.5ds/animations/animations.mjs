// 5 Day Sprint feel check. It only reads the app's code: it changes nothing and sends nothing anywhere.
//   node .5ds/animations/animations.mjs              check and print what passed, what to fix, what was not checked
//   --dir <folder>                   check another folder (the default is the folder that holds .5ds)
//   --all                            show every fix line (the default shows the first 20)
// It always ends with exit code 0. It covers what code can see; .5ds/animations/checklist.md covers what only use can.
// A line holding the comment ux-ok (with its reason) is kept on purpose and skipped.
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const args = process.argv.slice(2);
const opt = (k) => { const i = args.indexOf(k); return i >= 0 ? args[i + 1] : null; };
const ROOT = path.resolve(opt('--dir') || path.join(HERE, '..', '..'));
// The numbers come from numbers.json, the same numbers motion.md quotes, so a guide value never fails its own check.
// A state change (hover, press, a menu, a text roll) has a cap; a fade or rise with no hover is an entrance, with its own cap.
const N = JSON.parse(fs.readFileSync(path.join(HERE, 'numbers.json'), 'utf8'));
const MAX_LINES = args.includes('--all') ? Infinity : 20, MAX_BYTES = 1024 * 1024, MAX_MS = N.state_change_ms.max, ENTRANCE_MS = N.entrance_ms.max;
// Omar's reveal (a scroll reveal, named so in its selector or class) has its own cap; so does the ground colour that shifts on scroll.
const REVEAL_MS = N.reveal_ms.max, GROUND_MS = N.ground_shift_ms, REVEAL_NAME = /reveal|in-?view|is-visible|data-shown|\bshown\b/i;
const COLOUR_PROPS = /^(background-color|background|color)$/, GROUND_NAME = /(^|[\s,>])(body|html|main)\b|ground|canvas|page-bg/i;
const ENTRANCE_PROPS = /^(opacity|transform|filter|translate|scale|rotate)$/;
const SKIP_DIRS = new Set(['node_modules', '.next', 'dist', '.git', 'build', 'out', '.vercel', '.turbo', 'coverage', '.cache', '.5ds', '.claude', '.worktrees']);
const CODE = /\.(tsx|jsx|ts|js|mjs|vue|svelte)$/i, STYLE = /\.(css|scss)$/i;
const out = (s = '') => console.log(s);

const RULES = [
  { id: 'reduced-motion', label: 'Motion respects Reduce Motion', ask: 'Add the Reduce Motion fallback from .5ds/animations/motion.md: MotionConfig reducedMotion="user" in the root layout, and a prefers-reduced-motion block for CSS animations.', none: 'no animations were found' },
  { id: 'submit-pending', label: 'Submit buttons show they are working', ask: 'Give each submit button a working state: disabled while it sends, with a spinner, as in .5ds/animations/patterns.md.', none: 'no submit buttons were found' },
  { id: 'fast-changes', label: `State changes take ${MAX_MS}ms or less, entrances ${ENTRANCE_MS}ms or less`, ask: `Make these state changes ${N.state_change_ms.min} to 300ms (text rolls up to ${MAX_MS}ms), and entrances ${N.entrance_ms.min} to ${ENTRANCE_MS}ms.`, none: 'no transitions were found' },
  { id: 'no-jumps', label: 'Animations move with transform, not layout', ask: 'Animate transform and opacity instead, or use Motion layout animation, as in .5ds/animations/motion.md.', none: 'no animations were found' },
];

function list(root) {
  const files = [];
  const walk = (dir) => {
    let names; try { names = fs.readdirSync(dir, { withFileTypes: true }); } catch { return; }
    for (const e of names) {
      const f = path.join(dir, e.name), rel = path.relative(root, f).split(path.sep).join('/');
      if (e.isSymbolicLink()) continue;
      if (e.isDirectory()) { if (!SKIP_DIRS.has(e.name) && !/(^|\/)components\/ui$/.test(rel)) walk(f); continue; }
      if (!e.isFile() || !(CODE.test(e.name) || STYLE.test(e.name)) || /\.(test|spec|stories|config)\./.test(e.name) || /\.d\.ts$/.test(e.name)) continue;
      try { if (fs.statSync(f).size <= MAX_BYTES) files.push(rel); } catch { /* gone */ }
    }
  };
  walk(root);
  return files.sort();
}
const lineOf = (text, i) => text.slice(0, i).split('\n').length;
const ms = (n, unit) => (unit === 's' ? Number(n) * 1000 : Number(n));
const LAYOUT_PROPS = /\b(width|height|max-height|min-height|top|left|right|bottom|margin(?:-\w+)?|padding(?:-\w+)?)\b/;

function scan(root) {
  const found = [], seen = { motion: 0, submit: 0, transition: 0 };
  const texts = new Map();
  for (const rel of list(root)) { try { texts.set(rel, fs.readFileSync(path.join(root, rel), 'utf8')); } catch { /* gone */ } }
  const all = [...texts.values()].join('\n');
  const motionConfig = /<MotionConfig\b[^>]*reducedMotion\s*=/.test(all);
  const cssReduce = [...texts.entries()].some(([r, t]) => STYLE.test(r) && /prefers-reduced-motion/.test(t));
  // 1 line per fault: the same fault named twice on 1 line (initial and animate, say) counts once.
  const add = (rule, rel, line, detail, lines) => { if (!/ux-ok/.test(lines[line - 1] || '') && !found.some((f) => f.rule === rule && f.rel === rel && f.line === line && f.detail === detail)) found.push({ rule, rel, line, detail }); };

  for (const [rel, text] of texts) {
    const lines = text.split('\n'), style = STYLE.test(rel);
    if (style) {
      // CSS animations: keyframes, transitions and their durations.
      const reduceHere = /prefers-reduced-motion/.test(text);
      for (const m of text.matchAll(/@keyframes\s+([\w-]+)\s*\{([\s\S]*?\})\s*\}/g)) {
        seen.motion++;
        const line = lineOf(text, m.index);
        if (!reduceHere && !cssReduce) add('reduced-motion', rel, line, `the animation ${m[1]} has no prefers-reduced-motion fallback`, lines);
        const bad = m[2].match(new RegExp(`(?:^|[;{\\s])(${LAYOUT_PROPS.source})\\s*:`));
        if (bad) add('no-jumps', rel, line, `the animation ${m[1]} changes ${bad[1]}`, lines);
      }
      for (const m of text.matchAll(/transition(-duration|-property)?\s*:\s*([^;}]+)/g)) {
        seen.transition++;
        const line = lineOf(text, m.index), v = m[2];
        const slow = [...v.matchAll(/(\d*\.?\d+)(ms|s)\b/g)].map((x) => ms(x[1], x[2]));
        const props = m[1] ? [] : v.split(/,(?![^(]*\))/).map((x) => x.trim().split(/\s+/)[0]);
        const sel = text.slice(text.lastIndexOf('}', text.lastIndexOf('{', m.index)) + 1, text.lastIndexOf('{', m.index));
        const entrance = props.length && props.every((x) => ENTRANCE_PROPS.test(x)), colour = props.length && props.every((x) => COLOUR_PROPS.test(x));
        const limit = entrance ? (REVEAL_NAME.test(sel) ? REVEAL_MS : ENTRANCE_MS) : colour && GROUND_NAME.test(sel) && !/:hover|:focus|:active/.test(sel) ? GROUND_MS : MAX_MS;
        if (m[1] !== '-property' && slow.length && slow[0] > limit) add('fast-changes', rel, line, `a transition of ${slow[0]}ms, over ${limit}ms`, lines);
        const prop = m[1] === '-duration' ? null : v.match(LAYOUT_PROPS);
        if (prop) add('no-jumps', rel, line, `a transition of ${prop[1]}`, lines);
      }
      continue;
    }
    // Code: the motion library, gsap, Tailwind animation classes, submit buttons.
    const usesMotion = /from\s+['"](?:motion\/react|framer-motion|motion|motion\/react-client)['"]/.test(text);
    if (usesMotion) {
      seen.motion++;
      if (!motionConfig && !/useReducedMotion\s*\(/.test(text)) add('reduced-motion', rel, (lines.findIndex((l) => /from\s+['"](?:motion|framer-motion)/.test(l)) + 1) || 1, 'motion is used with no useReducedMotion and no MotionConfig reducedMotion in the app', lines);
      // Motion durations, in seconds: an entrance cap, or the reveal cap in a file with a whileInView reveal.
      for (const m of text.matchAll(/\bduration:\s*([^,}\n]+)/g)) {
        // The reveal cap only for a duration that sits with a whileInView reveal (within the same few lines).
        const cap = (/whileInView/.test(text.slice(Math.max(0, m.index - 400), m.index + 400)) ? REVEAL_MS : ENTRANCE_MS) / 1000;
        const v = Math.max(...[...m[1].matchAll(/\d*\.?\d+/g)].map((x) => Number(x[0])));
        if (!Number.isFinite(v)) continue;
        seen.transition++;
        if (v > cap && v <= 10) add('fast-changes', rel, lineOf(text, m.index), `a motion duration of ${v}s, over ${cap}s`, lines);
      }
      for (const m of text.matchAll(/\b(?:animate|initial|exit|whileHover|whileTap|whileInView)\s*=\s*\{\{([^}]*)\}\}/g)) {
        const bad = m[1].match(/\b(width|height|top|left|right|bottom|margin\w*|padding\w*)\s*:/);
        if (bad) add('no-jumps', rel, lineOf(text, m.index), `a motion animation of ${bad[1]}`, lines);
      }
    }
    if (/\bgsap\b/.test(text)) {
      seen.motion++;
      if (!/prefers-reduced-motion/.test(text)) add('reduced-motion', rel, (lines.findIndex((l) => /\bgsap\b/.test(l)) + 1) || 1, 'gsap is used with no prefers-reduced-motion check (gsap.matchMedia)', lines);
    }
    lines.forEach((ln, i) => {
      if (/ux-ok/.test(ln)) return;
      for (const m of ln.matchAll(/(?:^|[\s"'`])((?:[a-z-]+:)*)animate-(\[[^\]]+\]|bounce|ping|[a-z-]+)/g)) {
        if (/^(spin|pulse|none)$/.test(m[2])) continue;
        seen.motion++;
        if (!/motion-(safe|reduce):/.test(m[1] + ln) && !cssReduce) add('reduced-motion', rel, i + 1, `animate-${m[2]} with no motion-safe or motion-reduce`, lines);
      }
      const tw = [...ln.matchAll(/(?:^|[\s"'`])(?:[a-z-]+:)*duration-(\d+|\[(\d*\.?\d+)(ms|s)\])(?=[\s"'`]|$)/g)];
      if (tw.length && /\btransition\b|\btransition-|hover:/.test(ln)) {
        seen.transition++;
        const v = Math.max(...tw.map((x) => (x[2] ? ms(x[2], x[3]) : Number(x[1]))));
        const state = /(?:hover|focus|active|group-hover|peer-[\w-]+|data-\[[^\]]+\]):/.test(ln);
        const cls = [...ln.matchAll(/className=(?:"([^"]*)"|'([^']*)'|\{`([^`]*)`\})/g)].map((x) => x.slice(1).find(Boolean) || '').join(' ');
        const limit = !state && /\btransition-(opacity|transform|all)\b|\btransition\b/.test(ln) && REVEAL_NAME.test(cls) ? REVEAL_MS : !state && /\btransition-(opacity|transform)\b/.test(ln) ? ENTRANCE_MS : !state && /\btransition-colors\b/.test(ln) && /<(body|main|html)\b|ground|canvas/i.test(ln) ? GROUND_MS : MAX_MS;
        if (v > limit) add('fast-changes', rel, i + 1, `a transition of ${v}ms, over ${limit}ms`, lines);
      }
      const tp = ln.match(/transition-\[([^\]]+)\]/);
      if (tp) { seen.transition++; const p = tp[1].match(LAYOUT_PROPS); if (p) add('no-jumps', rel, i + 1, `a transition of ${p[1]}`, lines); }
    });
    // Submit buttons, read whole tag by tag (attributes may hold arrow functions).
    for (const m of text.matchAll(/<(button|Button|input)\b((?:=>|[^>])*)>/g)) {
      const attrs = m[2];
      if (!/type\s*=\s*\{?\s*["'`]submit["'`]/.test(attrs)) continue;
      seen.submit++;
      if (!/disabled|pending|isPending|isSubmitting|isLoading|loading|aria-busy|formStatus/i.test(attrs)) add('submit-pending', rel, lineOf(text, m.index), 'a submit button with no working or disabled state', lines);
    }
  }
  return { found, seen, files: texts.size };
}

try {
  const { found, seen, files } = scan(ROOT);
  const has = { 'reduced-motion': seen.motion, 'no-jumps': seen.motion + seen.transition, 'submit-pending': seen.submit, 'fast-changes': seen.transition };
  out('5 Day Sprint feel check. It only read the code: nothing was changed or sent.');
  out('');
  let shown = 0, passed = 0, notChecked = 0;
  for (const r of RULES) {
    const mine = found.filter((f) => f.rule === r.id);
    if (!files || (!has[r.id] && !mine.length)) { notChecked++; out(`not checked here  ${r.label}: ${files ? r.none : 'there is no app code yet'}.`); out('                  Ask Claude: "Run the feel check again once the screens have their interactions."'); continue; }
    if (!mine.length) { passed++; out(`pass  ${r.label}.`); continue; }
    out(`fix   ${r.label}: ${mine.length} ${mine.length === 1 ? 'place' : 'places'}.`);
    for (const f of mine) { if (shown >= MAX_LINES) break; shown++; out(`      - ${f.rel}:${f.line}: ${f.detail}.`); }
    out(`      Ask Claude: "${r.ask}"`);
  }
  out('');
  if (found.length > shown) out(`${found.length - shown} more fix lines are not shown. Fix these first, then run it again, or add --all to see every one.`);
  out(`Result: ${found.length} fix ${found.length === 1 ? 'line' : 'lines'}, ${passed} passed, ${notChecked} not checked here. Then try the screens with .5ds/animations/checklist.md.`);
} catch (e) {
  out(`The feel check could not finish (${String((e && e.message) || e).slice(0, 120)}). Nothing was changed.`);
}
process.exitCode = 0;
