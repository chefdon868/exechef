// 5 Day Sprint safety check. It only reads this project's files: it changes nothing and sends nothing anywhere.
//   node .5ds/security/check.mjs                      check the project and print what passed, what to fix, what was not checked
//   node .5ds/security/check.mjs accept <id> "why"    the owner's yes: save a finding as fine in .5ds/security/known-ok.md
//   --dir <folder>                                   check another folder (the default is the folder that holds .5ds)
//   --all                                            show every fix line (the default shows the first 20)
// It always ends with exit code 0: it informs, it never stops a build.
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { fileURLToPath } from 'url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const MAX_BYTES = 1024 * 1024;
const SKIP_DIRS = new Set(['node_modules', '.next', 'dist', '.git', 'build', 'out', '.vercel', '.turbo', 'coverage', '.cache', '.svelte-kit', '.nuxt', '.output', '.venv', 'venv', '__pycache__']);
const SKIP_UNDER = ['.5ds/backups/', '.5ds/updates/', '.claude/worktrees/', '.worktrees/'];
const SELF = ['.5ds/security/check.mjs', '.5ds/security/known-ok.md'];
const LOCKS = new Set(['package-lock.json', 'pnpm-lock.yaml', 'yarn.lock', 'bun.lockb', 'bun.lock', 'npm-shrinkwrap.json', 'Cargo.lock', 'poetry.lock', 'Gemfile.lock', 'composer.lock']);
const BINARY = /\.(png|jpe?g|gif|webp|avif|ico|icns|bmp|tiff?|pdf|zip|gz|tgz|rar|7z|mp3|mp4|m4a|mov|wav|webm|ogg|woff2?|ttf|otf|eot|sqlite|db|wasm|psd|sketch|fig)$/i;
const CODE = /\.(m?[jt]sx?|cjs|cts|mts)$/i;
const sha = (s) => crypto.createHash('sha256').update(s).digest('hex');
const fingerprint = (text) => sha(String(text).trim()).slice(0, 12);

// Key shapes, from the services members use most. Each match shows only its first 4 characters.
const KEYS = [
  ['an Anthropic key', /sk-ant-[A-Za-z0-9_-]{20,}/g],
  ['an OpenAI key', /sk-proj-[A-Za-z0-9_-]{20,}/g],
  ['an OpenAI key', /\bsk-[A-Za-z0-9]{40,}\b/g],
  ['a Stripe secret key', /\b[rs]k_live_[A-Za-z0-9]{16,}/g],
  ['a Stripe webhook secret', /\bwhsec_[A-Za-z0-9]{20,}/g],
  ['a Supabase secret key', /\bsb_secret_[A-Za-z0-9_-]{16,}/g],
  ['a Supabase access token', /\bsbp_[a-f0-9]{30,}/g],
  ['a Resend key', /\bre_[A-Za-z0-9]{8,}_[A-Za-z0-9]{16,}/g],
  ['a GitHub token', /\bghp_[A-Za-z0-9]{30,}/g],
  ['a GitHub token', /\bgithub_pat_[A-Za-z0-9_]{30,}/g],
  ['an Amazon key', /\bAKIA[0-9A-Z]{16}\b/g],
  ['a Slack token', /\bxox[bap]-[A-Za-z0-9-]{20,}/g],
  ['a Google sign-in secret', /\bGOCSPX-[A-Za-z0-9_-]{10,}/g],
  ['an Apify key', /\bapify_api_[A-Za-z0-9]{20,}/g],
  ['a bot token', /\b[0-9]{8,10}:AA[A-Za-z0-9_-]{30,}/g],
  ['a private key', /-----BEGIN [A-Z ]*PRIVATE KEY-----/g],
  ['a database address with its password', /\bpostgres(?:ql)?:\/\/[^\s:@/'"`]+:[^\s@/'"`]{6,}@[^\s'"`]+/g],
];
const JWT = /\beyJ[A-Za-z0-9_-]{10,}\.eyJ[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}/g;
// Sample text in guides, never a real key.
const PLACEHOLDER = /x{6,}|X{6,}|\*{4,}|0{10,}|your|example|placeholder|dummy|redacted/i;
const PUBLIC_PREFIX = /\b(?:NEXT_PUBLIC_|VITE_|EXPO_PUBLIC_|REACT_APP_)[A-Z0-9_]+\b/g;
const SECRET_WORD = /SECRET|SERVICE_ROLE|SERVICE_KEY|PRIVATE|PASSWORD|ADMIN|_TOKEN\b/;
const PUBLIC_BY_DESIGN = /MAPBOX|PUBLISHABLE|ANON/;
// The server's own admin key read in browser code, or the server's admin helper imported there. A key the owner's users paste in is not this.
const ADMIN_KEY = /(?:process\.env|import\.meta\.env)\.\w*(?:SERVICE_ROLE|SECRET_KEY)\w*|\bsb_secret_|supabase-admin['"]|\bsupabaseAdmin\b|createAdminClient/;
// A sign-in check is a call or a header read, never a bare word (Fable R408 10): comments are blanked before this is tested.
const SIGN_IN = new RegExp([
  'getUser\\s*\\(', 'getSession\\s*\\(', 'getServerSession\\s*\\(', 'currentUser\\s*\\(', '\\bauth\\s*\\(\\s*\\)', 'withAuth\\s*\\(', 'verifyToken\\s*\\(', 'jwtVerify\\s*\\(', 'clerkClient\\s*\\(',
  'headers(?:\\(\\))?\\.get\\(\\s*[\'"`](?:authorization|x-api-key|x-[\\w-]*(?:secret|token|signature|key)[\\w-]*)[\'"`]', 'headers\\s*\\[\\s*[\'"`](?:authorization|x-api-key)[\'"`]\\s*\\]', 'headers\\.authorization\\b',
  'timingSafeEqual\\s*\\(', 'process\\.env\\.CRON_SECRET', 'constructEvent(?:Async)?\\s*\\(', 'webhooks?\\.verify\\s*\\(', 'verifySignature\\s*\\(', 'validateRequest\\s*\\(', 'new\\s+Webhook\\s*\\(',
  ':\\s*40[13]\\b', ',\\s*40[13]\\s*\\)', 'status\\(\\s*40[13]\\s*\\)',
].join('|'), 'i');
// A call to the project's own helper counts too, such as getCurrentUser(), requireOwner() or whoIs().
const SIGN_IN_HELPER = /\b(?:get|require|check|verify|ensure|assert|is|has|with|load)\w*(?:Auth|User|Session|Admin|Owner|Member|Signed|Login|Token)\w*\s*\(|\bwhoIs\s*\(/;
const ROLE = /\brole\b|isAdmin|is_admin|requireAdmin|adminOnly|checkAdmin|assertAdmin|admin_users/i;
const CHANGES = /export\s+(?:async\s+)?(?:function|const)\s+(?:POST|PUT|PATCH|DELETE)\b/;
const PAGES_CHANGES = /\b(?:POST|PUT|PATCH|DELETE)\b/;

const RULES = [
  { id: 'keys-in-code', label: 'Keys kept out of the code', ask: 'Move each key into .env.local and the host settings, and tell me which keys to make new.' },
  { id: 'env-in-git', label: 'Key files kept out of git', ask: 'Take the key files out of git and tell me which keys to make new.', none: 'there is no git history here yet', noneAsk: 'When we set up git, keep the key files out of it.' },
  { id: 'public-names', label: 'Secret keys never given a public name', ask: 'Rename these so the browser never gets them, and move the work that needs them to the server.' },
  { id: 'admin-key-browser', label: 'Database admin key only on the server', ask: 'Move the work that uses the admin key into a server route.', none: 'there is no app code yet', noneAsk: 'When we build the app, keep the database admin key in server code only.' },
  { id: 'database-rules', label: 'Database rules on for every table', ask: 'Turn on row level security for these tables, with rules for who may see what.', none: 'no database migrations were found', noneAsk: 'When we add a database, turn on row level security for every table.' },
  { id: 'build-wired', label: 'The check runs before every build', ask: 'Add the prebuild line to package.json, as the check shows it.', none: 'there is no package.json yet', noneAsk: 'When the app exists, add the prebuild line from .5ds/security/instructions.md.' },
  { id: 'routes-sign-in', label: 'Server routes check who is asking', ask: 'Add a sign-in check to these routes, and an admin role check to the admin ones.', none: 'no server routes were found', noneAsk: 'When we add server routes, make each one check who is asking.' },
];

const args = process.argv.slice(2);
const opt = (k) => { const i = args.indexOf(k); return i >= 0 ? args[i + 1] : null; };
const ROOT = path.resolve(opt('--dir') || path.join(HERE, '..', '..'));
const KNOWN = path.join(ROOT, '.5ds', 'security', 'known-ok.md');
const out = (s = '') => console.log(s);
const MAX_LINES = args.includes('--all') ? Infinity : 20;

// Every file to read: text only, under 1 MB, outside the folders that hold other people's code or build output.
function listFiles(root) {
  const files = [];
  const walk = (dir) => {
    let names; try { names = fs.readdirSync(dir, { withFileTypes: true }); } catch { return; }
    for (const e of names) {
      const f = path.join(dir, e.name), rel = path.relative(root, f).split(path.sep).join('/');
      if (e.isSymbolicLink()) continue;
      if (e.isDirectory()) { if (!SKIP_DIRS.has(e.name) && !SKIP_UNDER.some((p) => (rel + '/').startsWith(p))) walk(f); continue; }
      if (!e.isFile() || SELF.includes(rel) || LOCKS.has(e.name) || BINARY.test(e.name)) continue;
      let size = 0; try { size = fs.statSync(f).size; } catch { continue; }
      if (size > MAX_BYTES) continue;
      files.push(rel);
    }
  };
  walk(root);
  return files.sort();
}
function readText(root, rel) {
  try { const b = fs.readFileSync(path.join(root, rel)); if (b.subarray(0, 8000).includes(0)) return null; return b.toString('utf8'); } catch { return null; }
}
// Test files often hold made-up keys on purpose: their key shapes are listed as not checked here, never as fixes (Fable R408 2).
const isTestFile = (rel) => /(^|\/)(tests?|__tests__|fixtures?|__mocks__|e2e)\//i.test(rel) || /(\.|_)(test|spec)\.[^/]+$|(^|\/)test_[^/]+$|Tests?\.swift$/i.test(rel);
// Routes whose job is to be open: sign-in, sign-up, webhooks, public forms, search and tracking. Listed, never a fix.
const OPEN_ROUTE = /(^|[/-])(auth|login|log-in|logout|signin|sign-in|signup|sign-up|register|verify|magic-link|otp|callback|webhooks?|unsubscribe|checkout|contact|support|subscribe|newsletter|search|track|health|og)([/-]|$)/i;
const isEnvFile = (rel) => /(^|\/)\.env(\.[^/]*)?$/.test(rel);
const isEnvSample = (rel) => /(example|sample|template|dist)$/i.test(rel);
const lineAt = (text, index) => text.slice(0, index).split('\n').length;

// The files git saves, read straight from git's own file list (.git/index), so no program is started. null: no git here.
function gitFiles(root) {
  let top = null, gitdir = null;
  for (let d = root; ; d = path.dirname(d)) {
    const g = path.join(d, '.git');
    if (fs.existsSync(g)) {
      top = d;
      if (fs.statSync(g).isDirectory()) gitdir = g;
      else { const m = fs.readFileSync(g, 'utf8').match(/gitdir:\s*(.+)/); if (m) gitdir = path.resolve(d, m[1].trim()); }
      break;
    }
    if (path.dirname(d) === d) break;
  }
  if (!top || !gitdir) return null;
  const idx = path.join(gitdir, 'index');
  if (!fs.existsSync(idx)) return { files: new Set() };
  const buf = fs.readFileSync(idx);
  if (buf.toString('latin1', 0, 4) !== 'DIRC') throw new Error('git file list not readable');
  const ver = buf.readUInt32BE(4), n = buf.readUInt32BE(8), files = new Set();
  let off = 12, prev = '';
  for (let i = 0; i < n; i++) {
    const start = off, flags = buf.readUInt16BE(off + 60), ext = ver >= 3 && (flags & 0x4000) ? 2 : 0;
    off += 62 + ext;
    let name;
    if (ver === 4) {
      let b = buf[off++], strip = b & 127;
      while (b & 128) { b = buf[off++]; strip = ((strip + 1) << 7) | (b & 127); }
      const nul = buf.indexOf(0, off);
      name = prev.slice(0, prev.length - strip) + buf.toString('utf8', off, nul);
      off = nul + 1;
    } else {
      const nul = buf.indexOf(0, off), len = nul - off;
      name = buf.toString('utf8', off, nul);
      off = start + ((62 + ext + len + 8) & ~7);
    }
    prev = name;
    const rel = path.relative(root, path.join(top, name)).split(path.sep).join('/');
    if (!rel.startsWith('..')) files.add(rel);
  }
  return { files };
}

// Code comments become spaces of the same length too (a // inside a quoted address is kept).
const blankCode = (js) => js.replace(/\/\*[\s\S]*?\*\//g, (m) => m.replace(/[^\n]/g, ' ')).replace(/(^|[^:'"`\\])\/\/[^\n]*/gm, (m, pre) => pre + ' '.repeat(m.length - pre.length));
// Comments become spaces of the same length, so line numbers still match the file.
const blankComments = (sql) => sql.replace(/--[^\n]*/g, (m) => ' '.repeat(m.length)).replace(/\/\*[\s\S]*?\*\//g, (m) => m.replace(/[^\n]/g, ' '));
const tableName = (raw) => { const parts = raw.replace(/\s+/g, '').split('.').map((p) => p.replace(/^"|"$/g, '').toLowerCase()); return parts.length === 2 ? parts : ['public', parts[0]]; };
const NAME = '((?:"[^"]+"|[\\w$]+)(?:\\s*\\.\\s*(?:"[^"]+"|[\\w$]+))?)';

function scan(root) {
  const files = listFiles(root), found = [], states = {}, notes = {};
  const add = (rule, rel, line, text, detail) => found.push({ rule, path: rel, line, detail, hash: fingerprint(text) });
  let git = null, gitError = false;
  try { git = gitFiles(root); } catch { gitError = true; }
  const texts = new Map();
  for (const rel of files) { const t = readText(root, rel); if (t !== null) texts.set(rel, t); }

  // 1. Keys in the code: key shapes in any file but the .env files themselves. A sample env file (.env.example) is checked:
  // it is saved in git and meant to hold names only (Fable R408 9).
  const testKeys = new Set();
  for (const [rel, text] of texts) {
    if (isEnvFile(rel) && !isEnvSample(rel)) continue;
    const lines = text.split('\n');
    lines.forEach((ln, i) => {
      if (ln.length > 5000) return;
      for (const [what, re] of KEYS) for (const m of ln.matchAll(re)) {
        // A password or key body filled in by the code itself (${...}) is not a written down secret.
        if (PLACEHOLDER.test(m[0]) || (/^postgres/.test(m[0]) && /[$<{%]/.test(m[0].split('@')[0].split(':').slice(2).join(':'))) || (/^-----/.test(m[0]) && ln.slice(m.index).includes('${'))) continue;
        if (isTestFile(rel)) { testKeys.add(rel); continue; }
        const saved = isEnvFile(rel) ? ', and this file is meant to hold names only' : git && git.files.has(rel) ? ', and this file is saved in git, so make a new key' : '';
        add('keys-in-code', rel, i + 1, ln, `${what}, starts "${m[0].slice(0, 4)}"${saved}`);
      }
      for (const m of ln.matchAll(JWT)) {
        let role = '';
        try { role = JSON.parse(Buffer.from(m[0].split('.')[1], 'base64url').toString('utf8')).role || ''; } catch { /* not a token */ }
        if (role !== 'service_role' && role !== 'supabase_admin') continue;
        if (isTestFile(rel)) { testKeys.add(rel); continue; }
        add('keys-in-code', rel, i + 1, ln, `the database admin key, starts "${m[0].slice(0, 4)}"`);
      }
    });
  }
  states['keys-in-code'] = 'checked';
  if (testKeys.size) notes['keys-in-code'] = { text: `${testKeys.size} test ${testKeys.size === 1 ? 'file holds' : 'files hold'} key-shaped text, usually made up on purpose: ${[...testKeys].slice(0, 5).join(', ')}${testKeys.size > 5 ? ', and more' : ''}`, ask: 'Check the keys in the test files are made up, never real ones.' };

  // 2. Key files saved in git.
  if (gitError) states['env-in-git'] = 'could not read git\'s file list';
  else if (!git) states['env-in-git'] = null;
  else {
    for (const rel of [...git.files].sort()) if (isEnvFile(rel) && !isEnvSample(rel)) add('env-in-git', rel, 1, rel, 'this key file is saved in git, so anyone with the code has the keys');
    states['env-in-git'] = 'checked';
  }

  // 3. Secret looking names with a public prefix, in code and in the .env files (names only, never values).
  const seen = new Set();
  for (const [rel, text] of texts) {
    text.split('\n').forEach((ln, i) => {
      for (const m of ln.matchAll(PUBLIC_PREFIX)) {
        const name = m[0];
        if (!SECRET_WORD.test(name) || PUBLIC_BY_DESIGN.test(name) || seen.has(rel + name)) continue;
        seen.add(rel + name);
        add('public-names', rel, i + 1, name, `${name} goes to every visitor's browser`);
      }
    });
  }
  states['public-names'] = 'checked';

  // 4. The database admin key in code the browser loads.
  const code = [...texts.keys()].filter((r) => CODE.test(r) && !r.startsWith('.5ds/'));
  if (!code.length) states['admin-key-browser'] = null;
  else {
    let vite = false;
    for (const pj of [...texts.keys()].filter((r) => /(^|\/)package\.json$/.test(r))) { const t = texts.get(pj); if (/"vite"/.test(t) && !/"next"/.test(t)) vite = true; }
    for (const rel of code) {
      const text = texts.get(rel);
      const client = /^\s*(?:\/\/[^\n]*\n|\/\*[\s\S]*?\*\/\s*)*\s*['"]use client['"]/.test(text) || rel.startsWith('public/') || /(^|\/)public\//.test(rel) || (vite && /(^|\/)src\//.test(rel) && !/(^|\/)(server|api)\//.test(rel));
      if (!client) continue;
      // 1 line per file: the first place, with a count of the rest.
      const lines = text.split('\n'), at = lines.map((ln, i) => (ADMIN_KEY.test(ln) ? i : -1)).filter((i) => i >= 0);
      if (at.length) add('admin-key-browser', rel, at[0] + 1, lines[at[0]], `the database admin key is used in code the browser loads${at.length > 1 ? ` (and ${at.length - 1} more ${at.length === 2 ? 'line' : 'lines'} in this file)` : ''}`);
    }
    states['admin-key-browser'] = 'checked';
  }

  // 5. Tables made in the migrations without row level security.
  const sqls = [...texts.keys()].filter((r) => /\.sql$/i.test(r));
  if (!sqls.length) states['database-rules'] = null;
  else {
    const made = [], secured = new Set(), dropped = new Set();
    for (const rel of sqls) {
      const raw = texts.get(rel), sql = blankComments(raw);
      for (const m of sql.matchAll(new RegExp(`create\\s+(?:unlogged\\s+)?table\\s+(?:if\\s+not\\s+exists\\s+)?${NAME}`, 'gi'))) {
        const [schema, name] = tableName(m[1]);
        const line = lineAt(sql, m.index);
        made.push({ schema, name, rel, line, text: raw.split('\n')[line - 1] });
      }
      for (const m of sql.matchAll(new RegExp(`alter\\s+table\\s+(?:if\\s+exists\\s+)?(?:only\\s+)?${NAME}\\s+enable\\s+row\\s+level\\s+security`, 'gi'))) secured.add(tableName(m[1]).join('.'));
      for (const m of sql.matchAll(new RegExp(`drop\\s+table\\s+(?:if\\s+exists\\s+)?${NAME}`, 'gi'))) dropped.add(tableName(m[1]).join('.'));
    }
    const done = new Set();
    for (const t of made) {
      const key = `${t.schema}.${t.name}`;
      if (t.schema !== 'public' || secured.has(key) || done.has(key)) continue;
      if (dropped.has(key) && !made.some((x) => x !== t && `${x.schema}.${x.name}` === key)) continue;
      done.add(key);
      add('database-rules', t.rel, t.line, t.text, `the table ${t.name} has no row level security, so anyone with the public key can read it`);
    }
    states['database-rules'] = 'checked';
  }

  // 6. Server routes that change data, or sit under admin, with no check of who is asking.
  const routes = [...texts.keys()].filter((r) => CODE.test(r) && !/\.(test|spec)\./.test(r) && (/(^|\/)app\/(.+\/)?route\.[^/]+$/.test(r) || /(^|\/)pages\/api\/.+/.test(r) || /(^|\/)supabase\/functions\/[^/]+\/index\.[^/]+$/.test(r)));
  if (!routes.length) states['routes-sign-in'] = null;
  else {
    // A Next.js middleware or proxy file that checks sign-in covers the paths it names (its matcher and its path checks).
    // Each covers only its own app: the folder it sits in (above src), and the nearest one wins.
    const gates = [], bases = new Set();
    for (const rel of [...texts.keys()].filter((r) => /(^|\/)(middleware|proxy)\.(m?[jt]s)$/.test(r) && !/(^|\/)app\//.test(r))) {
      const base = path.posix.dirname(rel).replace(/(^|\/)src$/, '').replace(/^\.$/, '');
      bases.add(base);
      const text = texts.get(rel);
      if (!SIGN_IN.test(text) && !SIGN_IN_HELPER.test(text)) continue;
      const role = ROLE.test(text);
      for (const m of text.matchAll(/(URL\(\s*)?['"`](\/[A-Za-z0-9_\-/]*[A-Za-z0-9_\-])(?::path\*)?['"`]/g)) if (!m[1]) gates.push({ base, prefix: m[2], role });
    }
    // A route built by an imported handler (export const POST = makeHandler(...)) is checked in that handler's file.
    const resolve = (from, spec) => {
      const tries = spec.startsWith('@/') ? [path.posix.join(near0(from), 'src', spec.slice(2)), path.posix.join(near0(from), spec.slice(2))] : spec.startsWith('.') ? [path.posix.join(path.posix.dirname(from), spec)] : [];
      for (const b of tries) for (const ext of ['', '.ts', '.tsx', '.js', '.mjs', '/index.ts', '/index.js']) if (texts.has(b + ext)) return b + ext;
      return null;
    };
    const near0 = (rel) => [...bases].filter((b) => !b || rel.startsWith(b + '/')).sort((x, y) => y.length - x.length)[0] || (rel.match(/^(.*?)(?:\/src)?\/(?:app|pages)\//) || [, ''])[1];
    const delegated = (rel, text) => {
      const out = [];
      // Each is { text } of the handler itself: from its declaration to the next export in that file, or null when outside.
      const body = (file, name) => {
        const t = texts.get(file), m = name ? t.match(new RegExp(`(?:^|\\n)\\s*(?:export\\s+)?(?:const|let|function|async\\s+function)\\s+${name}\\b`)) : null;
        if (!m) return { text: t };
        const rest = t.slice(m.index + m[0].length), next = rest.search(/\n\s*export\s/);
        return { text: m[0] + (next < 0 ? rest : rest.slice(0, next)) };
      };
      for (const m of text.matchAll(/export\s+const\s+(?:GET|POST|PUT|PATCH|DELETE)\s*=\s*(\w+)\s*\(/g)) {
        const im = text.match(new RegExp(`import\\s*\\{[^}]*\\b${m[1]}\\b[^}]*\\}\\s*from\\s*['"]([^'"]+)['"]`));
        const f = im ? resolve(rel, im[1]) : null;
        out.push(f ? body(f, m[1]) : null);
      }
      for (const m of text.matchAll(/export\s*\{[^}]*\b(?:GET|POST|PUT|PATCH|DELETE)\b[^}]*\}\s*from\s*['"]([^'"]+)['"]/g)) { const f = resolve(rel, m[1]); out.push(f ? body(f, null) : null); }
      return out;
    };
    const signedIn = (t) => { const c = blankCode(t); return SIGN_IN.test(c) || SIGN_IN_HELPER.test(c); };
    const open = [], unread = [];
    const urlOf = (rel) => { const i = rel.lastIndexOf('app/'); return i < 0 ? '' : '/' + rel.slice(i + 4).split('/').slice(0, -1).filter((x) => !/^\(.*\)$/.test(x)).join('/'); };
    for (const rel of routes) {
      const url = /(^|\/)pages\/api\//.test(rel) ? '/api/' + rel.split('pages/api/')[1].replace(/\.[^/.]+$/, '').replace(/\/index$/, '') : urlOf(rel);
      const near = [...bases].filter((b) => !b || rel.startsWith(b + '/')).sort((x, y) => y.length - x.length)[0];
      const gate = gates.filter((g) => g.base === near && (url === g.prefix || url.startsWith(g.prefix + '/')));
      if (gate.length && gate.some((g) => g.role)) continue;
      const text = (gate.length ? 'getUser() ' : '') + texts.get(rel), admin = /(^|\/)admin(\/|$)/.test(path.posix.dirname(rel));
      const changes = /(^|\/)pages\/api\//.test(rel) ? PAGES_CHANGES.test(text) : CHANGES.test(text) || /supabase\/functions\//.test(rel);
      const m = text.match(CHANGES), line = m ? lineAt(text, m.index) : 1, ln = text.split('\n')[line - 1];
      const handlers = delegated(rel, text);
      const viaHelper = handlers.some((h) => h && signedIn(h.text));
      const ok = gate.length || signedIn(text) || viaHelper;
      if (!ok && (changes || admin)) {
        if (handlers.length && handlers.every((h) => !h)) { unread.push(rel); continue; }
        if (!admin && OPEN_ROUTE.test(url)) { open.push(url || rel); continue; }
        add('routes-sign-in', rel, line, ln, admin ? 'an admin route with no sign-in check' : 'this route changes data with no check of who is asking');
      } else if (admin && !ROLE.test(blankCode(text)) && !(viaHelper && handlers.some((h) => h && ROLE.test(blankCode(h.text))))) add('routes-sign-in', rel, line, ln, 'an admin route that checks sign-in but not the admin role');
    }
    states['routes-sign-in'] = 'checked';
    const parts = [];
    if (open.length) parts.push(`${open.length} ${open.length === 1 ? 'route looks' : 'routes look'} open on purpose (sign-in, sign-up, webhooks, forms, search or tracking): ${open.slice(0, 5).join(', ')}${open.length > 5 ? ', and more' : ''}`);
    if (unread.length) parts.push(`${unread.length} ${unread.length === 1 ? 'route hands' : 'routes hand'} its work to a file outside this project: ${unread.slice(0, 5).join(', ')}`);
    if (parts.length) notes['routes-sign-in'] = { text: parts.join('. '), ask: 'Confirm each open route is meant to be open, checks what it is sent, and has a rate limit.' };
  }
  // 7. The check runs before every build (Fable R408 3): the app's package.json has a script naming check.mjs. The line to add
  // is worked out for where that package.json sits; its 1 home in words is .5ds/security/instructions.md.
  const pjs = [...texts.keys()].filter((r) => /(^|\/)package\.json$/.test(r) && !r.startsWith('.5ds/'));
  if (!pjs.length) states['build-wired'] = null;
  else {
    const scripts = (r) => { try { return JSON.parse(texts.get(r)).scripts || {}; } catch { return null; } };
    // The apps: a build script and a web framework among the packages. A library package (a command, a helper) is not an app.
    const WEB = /"(next|vite|astro|nuxt|@sveltejs\/kit|@remix-run\/[a-z-]+|react-scripts|gatsby|expo)"\s*:/;
    let apps = pjs.filter((r) => { const s = scripts(r); return s && typeof s.build === 'string' && WEB.test(texts.get(r)); });
    if (!apps.length) apps = [pjs.sort((a, b) => a.split('/').length - b.split('/').length)[0]];
    for (const r of apps) {
      const s = scripts(r) || {};
      if (Object.values(s).some((v) => typeof v === 'string' && /check\.mjs/.test(v))) continue;
      const rel = path.posix.relative(path.posix.dirname(r), '.5ds/security/check.mjs') || '.5ds/security/check.mjs';
      add('build-wired', r, 1, `${r}|${JSON.stringify(s)}`, `the check does not run before a build: add "prebuild": "node ${rel}" to its scripts`);
    }
    states['build-wired'] = 'checked';
  }
  for (const f of found) f.id = sha(`${f.rule}|${f.path}|${f.hash}`).slice(0, 8);
  return { found, states, notes, files: files.length };
}

// known-ok.md lines: "- rule | file | fingerprint | why".
function knownOk() {
  const keys = new Set();
  let text = ''; try { text = fs.readFileSync(KNOWN, 'utf8'); } catch { return keys; }
  for (const l of text.split('\n')) { const m = l.match(/^- ([a-z-]+) \| (.+?) \| ([a-f0-9]{12})(?: \||$)/); if (m) keys.add(`${m[1]}|${m[2]}|${m[3]}`); }
  return keys;
}

function report() {
  const { found, states, notes } = scan(ROOT), ok = knownOk();
  const open = found.filter((f) => !ok.has(`${f.rule}|${f.path}|${f.hash}`)), accepted = found.length - open.length;
  out('5 Day Sprint safety check. It only read the files: nothing was changed or sent.');
  out('');
  let shown = 0, passed = 0, notChecked = 0;
  for (const r of RULES) {
    const mine = open.filter((f) => f.rule === r.id), st = states[r.id];
    if (st !== 'checked') {
      notChecked++;
      out(`not checked here  ${r.label}: ${st || r.none}.`);
      out(`                  Ask Claude: "${r.noneAsk || 'Run the safety check again once this can be read.'}"`);
      continue;
    }
    const note = notes[r.id] ? () => { out(`      not checked here: ${notes[r.id].text}.`); out(`      Ask Claude: "${notes[r.id].ask}"`); } : () => {};
    if (!mine.length) { passed++; out(`pass  ${r.label}.`); note(); continue; }
    out(`fix   ${r.label}: ${mine.length} ${mine.length === 1 ? 'place' : 'places'}.`);
    for (const f of mine) { if (shown >= MAX_LINES) break; shown++; out(`      - ${f.path}:${f.line}: ${f.detail}. [id ${f.id}]`); }
    out(`      Ask Claude: "${r.ask}"`);
    note();
  }
  out('');
  if (open.length > shown) out(`${open.length - shown} more fix lines are not shown. Fix these first, then run the check again, or add --all to see every one.`);
  if (accepted) out(`${accepted} ${accepted === 1 ? 'finding' : 'findings'} the owner accepted in .5ds/security/known-ok.md ${accepted === 1 ? 'was' : 'were'} skipped.`);
  out(`Result: ${open.length} fix ${open.length === 1 ? 'line' : 'lines'}, ${passed} passed, ${notChecked} not checked here. ${open.length ? 'Not a pass yet: the project passes at 0 fix lines.' : notChecked ? 'No fixes; the rules not checked here are not a pass.' : 'A pass.'}`);
  if (open.length) out('If the owner decides a finding is fine: node .5ds/security/check.mjs accept <id> "why"');
}

function accept(id, why) {
  if (!/^[a-f0-9]{8}$/.test(id || '')) { out('Give the id shown beside a fix line, such as: node .5ds/security/check.mjs accept 1a2b3c4d "a public form, open on purpose"'); return; }
  const f = scan(ROOT).found.find((x) => x.id === id);
  if (!f) { out(`No current finding has the id ${id}. Run the check again and copy the id beside the line.`); return; }
  if (knownOk().has(`${f.rule}|${f.path}|${f.hash}`)) { out('That finding is already accepted.'); return; }
  const reason = String(why || 'accepted by the owner').replace(/[\r\n|]+/g, ' ').trim().slice(0, 200);
  fs.mkdirSync(path.dirname(KNOWN), { recursive: true });
  let cur = ''; try { cur = fs.readFileSync(KNOWN, 'utf8'); } catch { cur = '# Accepted findings\n\n'; }
  fs.writeFileSync(KNOWN, `${cur}${cur.endsWith('\n') ? '' : '\n'}- ${f.rule} | ${f.path} | ${f.hash} | ${reason}\n`);
  out(`Saved: ${f.path}:${f.line} is accepted for this rule. The check skips it until that line changes.`);
}

try {
  // The words after accept, without the options.
  const words = args.filter((x, i) => x !== '--dir' && args[i - 1] !== '--dir' && x !== '--all');
  if (words[0] === 'accept') accept(words[1], words.slice(2).join(' '));
  else report();
} catch (e) {
  out(`The safety check could not finish (${String((e && e.message) || e).slice(0, 120)}). Nothing was changed. Ask Claude to look at why.`);
}
process.exitCode = 0;
