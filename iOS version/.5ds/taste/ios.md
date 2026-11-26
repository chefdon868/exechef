# Taste on iPhone and iPad

Checked against the official pages: 2026-11-17 (iOS 27 and iPadOS 27, with Liquid Glass).
Read `.5ds/taste/instructions.md` first, and run `node .5ds/taste/sources.mjs ios` before the first screen. Every version fact here is cited in `.5ds/taste/sources.json` under facts.

## The ground rules
1. Build with SwiftUI and its standard parts first: `TabView`, `NavigationStack`, `NavigationSplitView`, `.toolbar`, `.sheet`, `List`, `Form`. They get Liquid Glass, Dynamic Type, dark mode and accessibility for free.
2. Lay out against safe areas and size classes, never device names or orientation. Apps must handle window size changes (iPad windows and resizable scenes).
3. The brand lives in the content, not in the system bars. Let the system draw bars, tab bars, toolbars and sheets.

## Liquid Glass
- Liquid Glass is the layer for controls and navigation that float over content. Standard bars, sheets, popovers and controls adopt it when built with the latest SDK.
- Never put a solid or tinted background behind bars, tab bars or toolbars. To separate controls from content, rely on the system's scroll edge effect.
- Never use Liquid Glass in the content layer: content cards use normal backgrounds and materials.
- Custom glass, sparingly: `.glassEffect()` (the regular variant in a capsule by default), `.interactive()` for touch response, and several glass views inside 1 `GlassEffectContainer` so they perform well and morph together. Use the `clear` variant only over rich photos or video.
- Tab bars stay monochrome; do not tint bar items in a colour that fights bright content. Bar item corners are concentric with the bar.
- People can set glass from ultra clear to fully tinted in Settings: check your screens at both ends.

## Type
Use system text styles, never fixed sizes, so Dynamic Type works. SF Pro is the system face; New York is the serif. Never embed the system fonts.

| Style | Size / leading (pt) | Weight |
|---|---|---|
| Large Title | 34 / 41 | Regular (Bold emphasised) |
| Title 1 | 28 / 34 | Regular |
| Title 2 | 22 / 28 | Regular |
| Title 3 | 20 / 25 | Regular |
| Headline | 17 / 22 | Semibold |
| Body | 17 / 22 | Regular |
| Callout | 16 / 21 | Regular |
| Subhead | 15 / 20 | Regular |
| Footnote | 13 / 18 | Regular |
| Caption 1 / 2 | 12 / 16, 11 / 13 | Regular |

- Body is 17pt; nothing under 11pt. Large text, for the 3 to 1 contrast rule, is 24pt or more, or 19pt or more in bold. Support text up to at least 200 percent: at large sizes, stack text above secondary items and use fewer columns.
- A custom display face for the brand is fine for big titles only; it must scale with Dynamic Type (`relativeTo:`) and respect Bold Text.
- Changing numbers: `.contentTransition(.numericText())` and `.monospacedDigit()`.

## Layout and touch
- Use the system margins and readable content guides; do not hard code 16 or 20pt margins.
- Every tappable thing is at least 44 by 44pt (Apple's own minimum; the web's WCAG floor is 24px) (28 by 28pt is the absolute minimum for small secondary controls). About 12pt of space around bordered controls, 24pt around borderless ones.
- Put frequent controls in the middle or bottom of the screen, within thumb reach. Support swipe back and swipe actions on rows.

## Navigation
- **Tab bar:** 3 to 5 top level sections, each a 1 word label and an SF Symbol. It floats at the bottom on Liquid Glass and can minimise on scroll (`.tabBarMinimizeBehavior(.onScrollDown)`). A search tab can sit at the trailing end. Tabs are for places, never actions; never hide or disable a tab; avoid a More tab.
- **Toolbars:** at most 3 groups; 1 primary action, prominent, on the trailing side; titles under 15 characters; the large title collapses on scroll.
- **iPad:** a tab bar that can turn into a sidebar; a sidebar has at most 2 levels and people can hide it.

## Sheets
- Detents: large, and medium on iPhone for a quick choice (`.presentationDetents([.medium, .large])`). Show the grabber on resizable sheets. Swipe down dismisses; ask before losing unsaved changes.
- Cancel on the leading side of the top bar, Done on the trailing side. Always pair Done with Cancel or Back. 1 sheet at a time.

## Buttons and feedback
- Every custom button has a press state (see `.5ds/animations/motion.md`: scale 0.97 on a quick spring).
- Mark the preferred choice by style (`.borderedProminent`), not size. A destructive action is never the primary.
- A slow action shows a progress indicator inside the button.
- Haptics: use the system patterns for their meanings (selection, light impact on a tap, success on completion), consistently, alongside a visual change, never alone.

## Colour and dark mode
- Brand colours live in the asset catalogue with light and dark values; screens read them by name. Use semantic system colours (`.primary`, `.secondary`, `Color(.systemBackground)`) for text and grounds.
- Support light and dark; never add an app-only appearance switch. Contrast 4.5 to 1 for text, 3 to 1 for large text (24pt or more, or 19pt bold).
- Test with Reduce Transparency and Increase Contrast, separately and together.

## App icon
- A layered Icon Composer file, 1024 by 1024px, vector layers. The system masks the shape and draws the glass, highlights and shadows: never bake them in.
- Check the default, dark, clear and tinted appearances. Text only if essential.

## Check every screen in
Light and dark; the largest accessibility text size; Reduce Motion; Reduce Transparency; Increase Contrast; iPhone and iPad sizes; glass set to clear and to tinted.
