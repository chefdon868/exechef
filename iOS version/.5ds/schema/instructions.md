# How to keep the schema

`.5ds/schema.md` is the list of what lives where in this project. This file says how to keep it, and where the 6 essentials live. Every other part reads the homes from here.

## The 6 essentials and their homes
Make each one only when it is first needed. Nothing is made empty.

| Essential | Home | Made when |
|---|---|---|
| The rules | `CLAUDE.md`, under "## Rules from the owner" | The owner corrects you for the first time |
| The list | `.5ds/schema.md` | Already there |
| The spec | `PRD.md`, with 3 sections: "## What we are building", "## Decisions", "## Where the work is" | The first decision worth keeping |
| The notebook | `docs/memory/`, 1 small file per lesson learned, indexed in `docs/memory/README.md` | The first thing learned that is not in the spec |
| The tickets | `docs/tickets.md`, rows T-1, T-2 and upwards, each with a state: open, done or dropped | The first note that is not done at once |
| The plans | `docs/specs/<date>-<name>.md`, ending with "## What done looks like" | A feature that would hurt to get wrong |
| The reports | `docs/reviews/<date>-<name>.md` | The first independent review |

- Decisions in `PRD.md` are numbered (D1, D2), dated, and quote the owner's own words.
- "## Where the work is" starts with 1 line `Updated: YYYY-MM-DD`, then a few short lines on where things stand.
- Dates are written YYYY-MM-DD. The owner keeps none of this up. You do.

## Adding to the list
- When you make something that matters, add 1 line under "## Files": "- `path`: what it is for."
- When you are unsure where something goes, read the list first.
- If a file on the list is gone, fix the line or ask.

## File every message first
Before you act on a message, split it into what it holds and file each piece:
- An idea for later goes in `docs/tickets.md` as a new ticket.
- A bug goes in `docs/tickets.md`, or gets fixed now if it is small.
- A decision goes in `PRD.md` under "## Decisions", with the owner's words and the date.
- A correction to how you work goes in `CLAUDE.md` under "## Rules from the owner".
Then do the work.

## Reviewing the tickets
When the owner asks to go through the tickets, give each open one a fate: now, later with a date, or dropped with why. Write the fate on the ticket.

## Where the data comes from
This section of `.5ds/schema.md` lists each place the project gets numbers or data from: 1 line each, "- Name: what it tells you."
When the owner asks you to find the data sources:
- Look at the dependencies (such as `package.json`) and the scripts each page loads.
- For the names of the keys, run `node .5ds/schema/env-names.cjs`. It prints names only.
- Never open `.env`, `.env.local` or any other env file except `.env.example`. Opening one puts every key in the chat.
- If you see a key written straight into code, tell the owner it should move to `.env.local`, without repeating it.
- For a website with no visitor numbers yet, suggest PostHog once: it shows what visitors do. Making an account is the owner's step, so ask first, then walk them through it.
- Keys go in `.env.local` and their names in `.env.example`. Never ask the owner to paste a key in the chat. Ask them to put it in `.env.local` themselves.
- If the names script says a key file is already saved in git, say so to the owner in its own line: "Your keys file is already saved in git. Ignoring it now doesn't remove it." Offer `git rm --cached <the file>` and run it only on a yes. If the script says the project has a remote, add: "If this was ever pushed, make new keys." Never call adding it to `.gitignore` a fix on its own.
