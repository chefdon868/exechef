# Taste on the Mac

Checked against the official pages: 2026-11-17 (macOS 27).
Read `.5ds/taste/instructions.md` and `.5ds/taste/ios.md` first: the Liquid Glass and colour rules are shared. Run `node .5ds/taste/sources.mjs macos` before the first window.

## What makes it a Mac app
- Large displays, a keyboard and a pointer first, many windows at once. Macs with touch displays exist now (cited in `sources.json`): touch is for brief, deliberate taps, so controls grow when touched while the layout keeps its Mac density.
- Build with SwiftUI's `WindowGroup`, `NavigationSplitView`, `.toolbar`, `Settings` and `.commands`. Never draw a custom title bar, window frame or window controls.

## The menu bar
- Every command lives in the menu bar, with its standard shortcut. The toolbar is a shortcut, never the only home of a command.
- Ship the standard menus in system order, even in a small app: the app menu (About first, then Settings with Command comma), File, Edit, View, Window, Help. The Window menu always has Minimize and Zoom.
- Menus always show the same items; disable an item rather than hide it. Menu titles are 1 word.

## Keyboard
- Keep the standard shortcuts (Command N, O, S, W, Z, comma) and never give them another meaning. Custom shortcuts only for the most frequent commands. Modifier order: Control, Option, Shift, Command.
- Everything works with the keyboard alone (Full Keyboard Access).

## Type and size
| Style | Size / leading (pt) |
|---|---|
| Large Title | 26 / 32 |
| Title 1 | 22 / 26 |
| Body | 13 / 16 |
| Smallest | 10 |

- Body is 13pt. Controls are 28 by 28pt by default, 20 by 20pt at the smallest. Keep Mac density; do not inflate an iPhone layout.

## Windows, sidebars and toolbars
- Windows resize, go full screen and remember their size and place.
- Nothing important at the bottom edge of a window or sidebar: people drag windows partly off screen.
- Sidebars run edge to edge and can hide when the window narrows. At most 2 levels.
- Toolbars are uniform; make every toolbar item also available in the menu bar.
- A button that opens another window ends with an ellipsis ("Export..."). 1 help button per window.
- Materials: choose by meaning (sidebar, window background, popover), not by the colour they give.

## Your art direction on the Mac
The art direction shows in the content area (empty states, onboarding, the icon, the accent colour); the window chrome stays native.
