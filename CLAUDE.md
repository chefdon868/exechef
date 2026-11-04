# CLAUDE.md — Project Constitution (System Pilot / B.L.A.S.T. + A.N.T.)

> Status: **INITIALIZED — HALTED at Discovery.** No logic in `/execution/` until every
> Blueprint question is answered, the Data Schema below is confirmed, and `memory/task_plan.md`
> has an approved Blueprint.

## 0. Project context (existing system)
- Repo `chefdon868/exechef` already contains **ExeChef COGs Analysis System** (Node 20 / Express /
  Sequelize / Postgres; Heroku target). See `memory/findings.md` F1.
- Open question: extend the existing app, or treat this as a new B.L.A.S.T. build? (Discovery Q1)

## 1. Data Schema (Data-First Rule)
Status: **PENDING — defined after Discovery Q1–Q5 and confirmed by user.**

```jsonc
// INPUT shape  — TBD
// OUTPUT shape — TBD (the Payload)
```

## 2. Behavioral Rules
Status: **PENDING — Discovery Q5.**
- Never guess business logic. If a rule is unknown, ask.
- Surgical changes only. Simplicity first. No speculative abstractions.
- Intermediate files go to `/.tmp/`, never the repo root.
- Credentials live in `.env` (or platform equivalent), never committed.

## 3. Architectural Invariants
- **A.N.T. 3-layer build:**
  - `/architecture/` — Layer A: SOPs (markdown). **Golden Rule: logic changes → SOP first, code second.**
  - Navigation — routing/reasoning only; calls tools in order; does no heavy work itself.
  - `/execution/` — Layer T: deterministic, atomic, testable scripts.
- Probabilistic reasoning never replaces deterministic business logic.
- Per-task rhythm: explore → plan → code → commit. No skipping.
- A project is "Complete" only when the **Payload lands** at its final destination.
- Folders `/architecture/`, `/execution/`, `/.tmp/` are created when Blueprint is approved (D2).

## 4. B.L.A.S.T. Phase Outputs

| Phase | Output | Status |
|---|---|---|
| **B — Blueprint** | North Star, Integrations, Source of Truth, Delivery Payload, Behavioral Rules, Data Schema | ⏳ Discovery Q1 pending |
| **L — Link** | Verified credentials + handshake probes (`/execution/`) logged in `memory/progress.md` | ⛔ blocked on B |
| **A — Architect** | SOPs in `/architecture/`, Navigation rules, Tools in `/execution/` | ⛔ blocked on B |
| **S — Stylize** | Payload formatting, UI/UX, verification per output, user sign-off | ⛔ blocked on A |
| **T — Trigger** | Deployment, automation triggers (listed below), maintenance log | ⛔ blocked on S |

### Triggers (Phase T — filled after deployment)
- _None yet._

### Self-Annealing Repair Loop (Phase T.4)
When anything fails: **Analyze** the error (no guessing) → **Patch** `/execution/` → **Test** the fix → **Update** the relevant `/architecture/` SOP so the error cannot recur.

## 5. Maintenance Log
- 2026-11-04 — Protocol 0 complete. Memory initialized. Constitution created. Awaiting Discovery.

## 6. File Structure
```
├── CLAUDE.md            # this file
├── .env                 # credentials (verified in Phase L) — not yet created
├── memory/              # task_plan.md, findings.md, progress.md, decisions.md
├── architecture/        # Layer A — not yet created
├── execution/           # Layer T — not yet created
└── .tmp/                # temporary workbench — not yet created
```
