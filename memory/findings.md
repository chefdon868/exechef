# Findings

## F1 — Existing codebase (discovered at init)
- Repo: chefdon868/exechef, branch claude/brave-pasteur-1tbdz1, working tree clean.
- Existing product: "ExeChef COGs Analysis System" — Cost of Goods tracking for resort outlets
  (food cost % vs per-outlet targets, 24–25%). Revenue + procurement import, dynamic target
  adjustment, dashboard, user auth with roles (Admin / Manager / Data Entry).
- Stack: Node 20, Express, Sequelize + Postgres (pg), multer, exceljs, csv-parser, joi,
  jsonwebtoken, bcrypt, @sendgrid/mail, Jest/supertest. Heroku deploy target.
- Frontend files (.jsx) sit in the repo root alongside backend (.js) — no src/ or deployment/ folder
  yet. package.json scripts reference src/server.js and deployment/*.md which do NOT exist at root.
- Docs at root: requirements.md, system_design.md, data_integration_design.md, formulas.md,
  dynamic_adjustment_mechanism.md, reporting_dashboard.md, testing_plan.md, user_guide.md,
  deployment guides, todo.md (prior work marked complete on an earlier Google Sheets approach).
- Note: todo.md describes a Google Sheets solution; requirements.md describes a web app. Current
  direction unclear — to confirm in Discovery.

## F2 — B.L.A.S.T. scaffold
- /architecture/, /execution/, /.tmp/ NOT yet created (deliberately deferred until Blueprint approved).

## F3 — Research (Phase B step 3)
- Pending.
