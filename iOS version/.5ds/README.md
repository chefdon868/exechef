# This folder

## What is installed
- `rules.md`: how Claude works in this project.
- `schema.md`: a list of the files in this project and what each is for.
- `charter.md` (in the project folder): what the project is for and what Claude may do on its own.
- A small helper: it tells Claude the date and time with each message, and checks 5daysprint.com once a day for updates. It never sends your code, files, chats or keys. It runs from `.claude/settings.json` (the file is `.5ds/hook.cjs`) and sends only an install id, the operating system and the sign-in token.
- 1 line in `CLAUDE.md` that points Claude to `rules.md`.

## Using it

- This folder is the 5 Day Sprint framework for this project.
- You can edit `rules.md` and `schema.md`. Updates will not overwrite your changes.
- To update: `npx @5daysprint/framework update project`
- To see what is installed: `npx @5daysprint/framework status`
- To take it out: `npx @5daysprint/framework remove`
