# Decisions

## D1 — Memory location
- Memory lives at project-relative /memory/ (protocol path interpreted as repo root /memory/).
- Reason: protocol's file structure places /memory/ under project root.

## D2 — Defer 3-layer folders
- /architecture/, /execution/, /.tmp/ are not created during Protocol 0.
- Reason: protocol forbids execution logic until Blueprint is approved; creating empty folders adds noise.

## D3 — Existing app is not replaced by default
- The current COGs app will be treated as the existing system of record for the Blueprint.
- Reason: Surgical Changes principle. Whether to extend, rebuild, or run B.L.A.S.T. on a new
  project is an open Discovery question (see Q1).
