# Taste on Android

Checked against the official pages: 2026-11-17 (Material 3 Expressive, with the I/O 2026 layout and spacing system).
Read `.5ds/taste/instructions.md` first. Run `node .5ds/taste/sources.mjs android` before the first screen. Material's own pages need a browser; their numbers are also in Google's open Compose token files (each has a version line). The window size breakpoints below are Material's and apply only to Android apps; the web uses Tailwind's (`web.md`).

## The ground rules
1. Build with Jetpack Compose and Material 3, using the Expressive parts (button groups, split buttons, the floating action button menu, the loading indicator, the flexible navigation bar, toolbars). Read every colour, size, shape and type style from `MaterialTheme`; never raw values.
2. Support dynamic colour (the scheme made from the person's wallpaper), with the brand scheme as the fallback and for brand moments.
3. Draw edge to edge and pad with window insets; never hard code the status bar height. Apps targeting API 36 cannot opt out.
4. Decide layout by window size class, never "is it a tablet". Test in a resizable window 600dp or wider, and test predictive back.
5. Target API 36 (required on Google Play for new apps and updates).

## Touch and contrast
- Every touch target at least 48 by 48dp; larger is better. Text in `sp`, so it follows the person's font scale.
- Contrast 4.5 to 1 for body text, 3 to 1 for large text: 24sp or more, or 19sp or more in bold (the WCAG sizes in sp). Android's own accessibility page also allows 3 to 1 from 18sp, or 14sp bold; use the stricter rule.

## Type scale (size / line height in sp, weight)
| Role | Large | Medium | Small |
|---|---|---|---|
| Display | 57 / 64, 400 | 45 / 52, 400 | 36 / 44, 400 |
| Headline | 32 / 40, 400 | 28 / 36, 400 | 24 / 32, 400 |
| Title | 22 / 28, 400 | 16 / 24, 500 | 14 / 20, 500 |
| Body | 16 / 24, 400 | 14 / 20, 400 | 12 / 16, 400 |
| Label | 14 / 20, 500 | 12 / 16, 500 | 11 / 16, 500 |

Each role has an emphasised version: use it for the big brand moments.

## Shape (corner radius)
None 0, extra small 4dp, small 8dp, medium 12dp, large 16dp, large increased 20dp, extra large 28dp, extra large increased 32dp, extra extra large 48dp, full (a pill). The art direction picks which steps controls and cards use.

## Layout and spacing
| Window width | Panes | Navigation |
|---|---|---|
| Compact, under 600dp | 1 | Navigation bar |
| Medium, 600 to 839dp | 1 | Navigation bar or rail |
| Expanded, 840 to 1199dp | 2 | Navigation rail |
| Large and extra large, 1200dp and up | 2 to 3 | Navigation rail |

- Margins 16dp on phones, 24dp from medium, with 24dp between panes.
- Spacing on the 8dp scale; put padding and gaps on the parent, not margins on children.
- Navigation bar 64dp tall (80dp variant), active icon in a pill indicator, 3 to 5 destinations. Navigation rail 96dp wide (80dp narrow).

## Motion
Material 3 moves with springs, not durations. Spatial springs (position, size, shape) may overshoot; effect springs (colour, fade) never do. The numbers are in `.5ds/animations/motion.md`: use the Expressive scheme for playful, consumer products and the Standard scheme for tools.

## Your art direction on Android
Your colour roles seed the fallback colour scheme; your faces and radius go into the Material theme. Dynamic colour can stay on for system surfaces while your action colour owns the moments the art direction names.
