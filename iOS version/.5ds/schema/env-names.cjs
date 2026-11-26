/* 5 Day Sprint: prints the names of the keys this project uses, never their values.
   node .5ds/schema/env-names.cjs
   It reads the env files in the project folder, keeps only the part before each "=", and sends nothing anywhere.
   It also says, 1 line each, when a key file is already saved in git: ignoring it later does not take it out. */
'use strict';
const fs = require('fs'), path = require('path'), cp = require('child_process');
const dir = process.cwd();
// Key files git already holds (end check 1).
const git = (...a) => { try { const r = cp.spawnSync('git', a, { cwd: dir, encoding: 'utf8', windowsHide: true }); return r.status === 0 ? r.stdout : null; } catch (e) { return null; } };
const ENV_OK = /(^|\/)\.env\.(example|sample|template)$/;
const keyFile = (p) => (/(^|\/)\.env(\.[^/]*)?$/.test(p) && !ENV_OK.test(p)) || /\.(pem|key|p12|pfx|p8)$/i.test(p) || /(^|\/)id_(rsa|ed25519|ecdsa)$/.test(p) || /(^|\/)(credentials|service-account[^/]*)\.json$/i.test(p);
const tracked = (git('ls-files') || '').split('\n').map((l) => l.trim()).filter(Boolean).filter(keyFile);
if (tracked.length) {
  const remote = !!(git('remote') || '').trim();
  for (const f of tracked) console.log(`Saved in git already: ${f}. Ignoring it now does not take it out. With the owner's yes: git rm --cached ${f}, then add it to .gitignore.${remote ? ' This project has a remote, so if it was ever pushed, make new keys.' : ''}`);
}
let files = [];
try { files = fs.readdirSync(dir).filter((n) => /^\.env(\..+)?$/.test(n)).sort(); } catch (e) { files = []; }
if (!files.length) { console.log('No env files in this folder.'); process.exit(0); }
const names = new Map();
for (const f of files) {
  let text = '';
  try { text = fs.readFileSync(path.join(dir, f), 'utf8'); } catch (e) { continue; }
  for (const line of text.split(/\r?\n/)) {
    const m = line.match(/^\s*(?:export\s+)?([A-Za-z_][A-Za-z0-9_]*)\s*=/);
    if (!m) continue;
    if (!names.has(m[1])) names.set(m[1], []);
    if (!names.get(m[1]).includes(f)) names.get(m[1]).push(f);
  }
}
if (!names.size) { console.log(`No key names found in ${files.join(', ')}.`); process.exit(0); }
console.log('Key names (never the values):');
for (const [n, where] of [...names.entries()].sort()) console.log(`- ${n} (in ${where.join(', ')})`);
