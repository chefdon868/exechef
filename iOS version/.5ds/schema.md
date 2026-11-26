# The files in this project

This is the list of what lives where. Add 1 line when you create something that matters.

## Files
- `CLAUDE.md`: points to `.5ds/rules.md`.
- `.5ds/rules.md`: how this project works.
- `.5ds/schema.md`: this list.
- `.5ds/research/`: market research reports, a page and a text copy for each.
- `charter.md`: why this project exists and how far the AI may run on its own.
- `.5ds/schema/`: the schema guide. Follow `.5ds/schema/instructions.md` whenever you create, file or look for something.
- `.5ds/taste/`: Taste. Before you build or change any screen, on any platform, follow `.5ds/taste/instructions.md`; the art direction lives in `.5ds/taste/art-direction.md`.
- `.5ds/animations/`: Animations. Before you build any tap, form, flow, loading state or animation, follow `.5ds/animations/instructions.md`.
- `.5ds/security/`: Security. Before anything goes online, and when the owner asks for a safety check, follow `.5ds/security/instructions.md`.

## Where the data comes from
List each place this project gets numbers from, and what it tells you. For a website, PostHog is the default for what visitors do.
- `core/allergens.mjs`: allergen matrix logic (14 EU allergens; an unrecorded ingredient is unknown, never safe). Tests in `core/allergens.test.mjs`, run with `node --test core/`.
