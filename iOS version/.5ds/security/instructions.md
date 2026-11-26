# Security

Follow this before anything goes online, whenever the owner asks for a safety check, and when the check's lines show up in a build. It keeps the owner's keys, data and customers safe.

## The rules
- **Keys stay out of the code.** A key or password lives only in `.env.local` on this computer and in the host's settings online. Never in a code file, never in git, never in a chat message. `.env.example` lists the names only, never the values.
- **Secret work runs on the server.** Anything that needs a secret key (payments, the database's admin key, sending email, an AI service) runs in a server route or server code, never in code the browser loads.
- **Only public keys get a public name.** A name starting `NEXT_PUBLIC_` is sent to every visitor's browser. Only keys made to be public go there, such as a database's anon or publishable key.
- **The database admin key never reaches the browser.** The Supabase service role key (or secret key) is used only in server code, and only where the anon key cannot do the job.
- **Database rules on for every table.** Every table has row level security turned on, with rules that let each person see only what they should. A table without rules is open to anyone who has the public key.
- **Admin pages need a sign-in and a role check.** Being signed in is not enough: the page and its server route both check that this person is an admin. Every route that changes data checks who is asking first.
- **Check what comes in.** Anything a visitor sends is checked on the server (its type, its length, that it belongs to them) before it is used or saved.
- **No secrets in logs.** Never print a key, a password, a payment detail or a customer's private data to the console or a log.

## The check
Run it from the project folder:
```
node .5ds/security/check.mjs
```
It only reads: it changes nothing and sends nothing anywhere. Each rule prints 1 of 3 states:
- **pass**: checked, and fine.
- **fix**: checked, and something to fix, with the file and line. A key shows only its first 4 characters.
- **not checked here**: there was nothing to check yet, with the reason, such as no database folder or no git yet. This is not a pass. The same words, under a rule, list what the check left to you: key-shaped text in test files, and routes that look open on purpose (sign-in, sign-up, webhooks, forms, search). Look at each one and tell the owner what you found.

The project passes when there are 0 fix lines.

## The prebuild line
This is the 1 home of the line that runs the check before every build, here and on the host. When the app exists, add it to the scripts in the app's `package.json`. For an app in the `web` folder (every new project):
```
"prebuild": "node ../.5ds/security/check.mjs"
```
For an app whose `package.json` sits in the project folder itself:
```
"prebuild": "node .5ds/security/check.mjs"
```
The check's rule "The check runs before every build" prints the right one for where the app sits. The check never stops a build; it tells.

## Telling the owner
- Start with the result in 1 line: "The safety check passed" or "The safety check found 2 things to fix".
- Then each fix in 1 plain line: what it is, why it matters, and what you would do. For example: "A payment key is written in the code, so anyone who sees the code could charge cards. I'd move it to the private settings file and make a new key."
- Say "not checked" lines honestly, as not checked yet, never as passed.
- Never repeat a key's value, even in part beyond the first 4 characters.

## Fixing
- Ask the owner before you fix anything. A yes to 1 fix is not a yes to the others.
- A key that was ever in git, or ever pushed online, is not safe even after it is taken out: tell the owner to make a new key at that service, and offer to walk them through it.
- Run the check again after a fix and say what it shows now.

## When the owner decides a finding is fine
Some findings are fine on purpose, such as a public contact form route that needs no sign-in. Only on the owner's yes, run:
```
node .5ds/security/check.mjs accept <id> "why, in a few words"
```
The id is shown beside each fix line. It is saved in `.5ds/security/known-ok.md`, tied to that rule, file and line, so the check stops repeating it. If that line changes, the check looks at it again.
