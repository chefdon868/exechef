# Taste on the web

Checked against the official pages: 2026-11-17.
Read `.5ds/taste/instructions.md` first. The numbers here come from `.5ds/taste/numbers.json`, the same file the look check reads. Nothing here picks a look: colours, fonts, radius and shapes come from your art direction.

## The base
Every new web app starts on Next.js, Tailwind and shadcn/ui.

Pinned: shadcn 4.23.0, checked 2026-11-17. Use this exact version in every command below. (The version and the command are cited in `.5ds/taste/sources.json`, under facts.)

- Make the app with 1 command, from the project folder. It asks nothing and puts the app in a folder called `web`:
  ```
  npx shadcn@4.23.0 init -t next -d -y -n web
  ```
- It makes `web/app/globals.css` (the theme) and `web/app/layout.tsx` (the fonts). It loads a default font and grey tokens: both are placeholders until your art direction replaces them.
- It also makes a separate history folder at `web/.git`. The whole project, `.5ds` included, should be saved as 1 history. From the project folder, run this 1 guarded command:
  ```
  test -d .git && test -d web/.git && rm -rf web/.git
  ```
  It removes nothing unless the project folder has its own `.git` and `web/.git` exists. If it does nothing because the first test fails (no `.git` in the project folder), run `git init` in the project folder, then run it again.
- After the art direction: `node .5ds/taste/palette.mjs` writes your colours into `web/app/globals.css`, and you load your faces in `web/app/layout.tsx` with `next/font/google`.
- Add components when a screen needs them, from inside `web`: `npx shadcn@4.23.0 add card input dialog`. Restyle them through the tokens, radius and type; never leave the stock look.
- Motion: `npm install motion`. The recipes are in `.5ds/animations/motion.md`.
- Going online: tell the host the app is in the `web` folder.

An app that already exists keeps its own stack. Offer shadcn/ui once, in 1 line, for new screens; never move a working app onto it without the owner's yes.

## Breakpoints
Tailwind's, the 1 set for the web: `sm` 640px, `md` 768px, `lg` 1024px, `xl` 1280px. Build at 375px first, then check 1280px.

## Spacing scale
The 1 scale, for every padding, gap and margin: 4, 8, 12, 16, 20, 24, 32, 40, 48, 56, 64, 80, 96, 128px (Tailwind 1, 2, 3, 4, 5, 6, 8, 10, 12, 14, 16, 20, 24, 32). Nothing in between. Breathing room is part of the floor: start with more space than feels needed, then remove. Apps use the same steps in points or dp.

## Type sizes
The faces and the scale are yours; the hierarchy has a floor, from `numbers.json`.
| Rule | Value | numbers.json |
|---|---|---|
| The largest text on the first screen, against the body | at least 3 times | first_screen_ratio |
| The home page headline on a phone | 44px or more | hero_headline_px.phone_min |
| Body text | 16px or more | body_min_px |
| A title on an app screen | 60px at most | app_title_max_px |

- The look check fails a home page headline under 44px on a phone, or whose largest size is under 3 times the body (48px), and an app screen title over 60px.
- For fluid headlines, `clamp()` mixing `rem` and `vw` (never `vw` alone).
- `text-balance` on headlines, `text-pretty` on paragraphs. Text columns 560 to 720px (`numbers.json` text_column_px).
- Changing numbers use `tabular-nums`.

## Layout and rhythm
- Content up to 1280px wide, 24px side padding on phones, 32 to 48px on laptops (steps of the spacing scale).
- How much space between sections is the art direction's density: airy uses the large steps (96 to 128px), dense the small ones (32 to 48px).
- The order of sections comes from the content and the visitor's job (`.5ds/taste/layouts.md` has structure ideas).

## Components (the floor, any style)
- The craft for every control, card and headline (corners, heights, type, space, lines) is in `.5ds/taste/craft.md`, with its numbers in `numbers.json` (craft).
- Buttons and fields at least 44px tall (`h-11`, `numbers.json` touch_min_px: the framework's floor; WCAG 2.2 AA asks for 24px), 1 primary action per screen.
- Fields with a visible label above, 16px apart.
- A sticky nav gains a background and a divider once the page scrolls, so text never sits on text.
- Icons from 1 set, next to words; never emoji as icons.

## Pictures
- The real photos, product and people. Every image has a width and height set, so nothing jumps while it loads; the hero image uses `priority` in `next/image`.

## Speed and access (the official floor)
- Core Web Vitals at the 75th percentile on phones: Largest Contentful Paint 2.5 seconds or less, Interaction to Next Paint 200 milliseconds or less, Cumulative Layout Shift 0.1 or less. The hero headline and image are visible on the first frame, never faded in from nothing.
- WCAG 2.2 AA: text contrast 4.5 to 1 (3 to 1 for large text and controls), a visible focus ring never hidden by a sticky bar, no action that needs dragging, no puzzle to sign in.
- Touch targets 44px or more (the framework's floor, `numbers.json` touch_min_px; WCAG 2.2 AA's own minimum is 24px).
- Test at 200 percent zoom and at 320px wide: no sideways scroll.
- Newer CSS (scroll-driven animations, cross-document view transitions, anchor positioning): check its Baseline badge on its MDN page first, wrap it in `@supports`, and make the page work without it.
