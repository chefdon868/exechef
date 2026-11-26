# Interaction patterns

Recipes for how things respond. Timings and springs come from `.5ds/animations/motion.md` and `.5ds/animations/numbers.json`.

## Press and hover
- **Web press:** buttons and cards scale to 0.97 while pressed (`active:scale-[0.97]` with `transition-transform duration-150`, or Motion's `whileTap` set to `{ scale: 0.97 }`), and spring back.
- **Web hover:** only on devices that hover (`@media (hover: hover)`, Tailwind `hover:` already does this). A soft fill deepens (white at 15 to 22 percent on colour; the brand at 10 to 15 percent on white), the primary lightens to 90 percent, a text link's colour shifts. 150 to 200ms. Never move layout on hover.
- **Native press:** scale 0.97 on the quick spring, or a faint highlight capsule at about 10 percent while held. A light haptic on taps that change something.

## The button that tells the story
For any action that talks to a server (send, save, book, pay):
1. **Ready:** the label says what will happen. Muted (soft fill, text at about 70 percent) until the form is valid, then solid.
2. **Working:** at once, the label gives way to a small spinner inside the button. The button keeps its size, or shrinks to a circle through Motion's `layout` prop (never a CSS width transition). The button is disabled, so it cannot be pressed twice, and has `aria-busy="true"`.
3. **Done:** the spinner gives way to a short success in the success colour ("Invite sent", a tick) for about 3 seconds, then the form resets or moves on.
4. **Failed:** "Try again" on the button and 1 short line under it saying what happened. Keep everything they typed.

On the web with a server action, read the state with `useFormStatus()` or `useActionState()` and set `disabled={pending}`.

## Omar's moves
How Omar's own products move, as recipes. Rolling text, the press, the springs, the gliding pill and closing as smooth as opening are everyday craft. Which moves count toward the 2 a project may pick is listed once, in `.5ds/taste/craft.md`. Numbers: `.5ds/animations/numbers.json`.
- **Text and digits that roll.** The old leaves up to -110 percent as the new arrives from +110 percent, a 2 to 3px blur, 420 to 620ms on `[0.22, 1, 0.36, 1]` (roll_ms), tabular figures, the width held (`Roll` in `motion.md`). A rotating word rolls letter by letter, each 26ms after the last (letter_stagger_ms).
- **The button that morphs.** Press: the label rolls out and the pill shrinks to a circle the size of its height through Motion's `layout`, a small spinner rolls in. Done: it widens again and rolls in the result ("Sent", a tick) for 3000ms (result_hold_ms), then rolls back to its label. Muted until the form is valid. The colour change trails the size by 40ms (colour_trail_ms).
- **The staggered fold.** When a form steps on, its rows fold away 1 after another, 60ms apart (fold_stagger_ms), each lifting 6px as it fades, through Motion's `layout` and `AnimatePresence` (never a height transition). The next step rolls in once they have gone. Going back unfolds in the reverse order.
- **The ground that shifts.** As a section reaches the middle of the screen, the page ground changes colour over 700ms (ground_shift_ms, `transition-colors duration-700` on the page). Light, then the leading colour, then light again. Text colours change with it, so contrast always passes.
- **The reveal with a blur.** Omar's reveal in `motion.md`: 24px rise (reveal_rise_px), a 6px blur clearing (reveal_blur_px), 700 to 900ms (reveal_ms), once per section.
- **The gliding pill.** The active tab's pill glides to the new tab through `layoutId` on the panel spring; its colour follows.
- **The floating nav pill.** After the first screen scrolls away, a compact pill nav slides down on the panel spring; it leaves the same way when the page returns to the top.
- **Native springs on the web.** A SwiftUI spring of response r and damping d is close to Motion's `{ type: "spring", visualDuration: r, bounce: 1 - d }`. Panels: response 0.5, damping 0.86 (the panel spring above). Presses: response 0.3, damping 0.7 (the press spring).
- **Closing as smooth as opening.** Every sheet, menu and fold closes on the same curve it opened on; nothing snaps shut.

## Optimistic updates
For small, likely to succeed actions (like, tick off, rename, reorder, add to a list): show the result at once, save in the background, and if saving fails, put it back with a toast that says so and offers "Try again". Never for payments, bookings or anything hard to undo.

## Toasts
- For results of actions the person took, not for news. 1 line, 4 to 6 seconds, at the bottom on phones (above the tab bar) and bottom right or top centre on laptops.
- Offer Undo in the toast instead of a confirmation dialog, wherever undo is possible.
- Errors that need action stay until dismissed. Never more than 1 toast at a time on a phone.
- Web: shadcn's `sonner`. Toasts are announced to screen readers.

## Loading
- Under 300ms: show nothing extra (a flash of spinner looks broken).
- 300ms to 2 seconds: a skeleton in the shape of the content (rounded bars, the tinted surface colour, a gentle shimmer that stops under Reduce Motion), or a spinner inside the control that started it.
- Over 2 seconds: say what is happening ("Finding open tables...").
- Over 10 seconds: progress if you can, a plain line, and a way out ("Keep waiting" or "Cancel").
- Content replaces the skeleton in place, so nothing jumps: same size, same place.

## Page and element transitions
- **Between pages:** the new page's content enters with the entrance recipe; the old one simply goes. Keep the nav still.
- **Panels, sheets and drawers:** slide in from the edge they belong to, on the panel spring, with the background dimming to about 40 percent. They close the same way, as smoothly as they opened.
- **Shared elements:** a tab pill or a selected card glides to its new place with Motion's `layoutId` (web) or `matchedGeometryEffect` (SwiftUI).
- **Content swaps** (a tab's content, a step in a flow): the old leaves fast (100 to 150ms fade), the new arrives once the container has settled (fade and rise 8 to 14px).
- **View Transitions, as an extra:** on the web, `document.startViewTransition()` gives smooth same page changes in current browsers. Cross page view transitions (`@view-transition { navigation: auto; }`) only work in some browsers: add them as a bonus, never rely on them.

## Scroll
- Reveal sections as they arrive (15 percent visible), once per section: a fade and a small rise, or Omar's reveal with its soft blur (above). In an app, sparingly; on a showcase page, every section, with text that builds (`motion.md`, Showcase pages). Never animate every paragraph, and never hijack the scroll speed.
- A sticky nav gains a blur and a hairline after about 8px of scroll.
- Parallax: in an app, only on 1 hero picture and a few pixels; on a showcase page, 1 drifting layer per section at most, up to 80px. Never under Reduce Motion.
- Long pages: a way back to the top on phones.

## Gestures (apps)
- Swipe back works everywhere it is expected. Rows can swipe for their 1 or 2 most used actions.
- Sheets follow the finger and close past a threshold or a fast flick; otherwise they spring back.
- Pull to refresh on lists that change, with a haptic when it triggers.
- Every gesture has a visible alternative (a button or a menu item).

## Haptics (apps)
- Light impact on taps that change something; selection ticks on pickers and toggles; success when a task completes; warning or error when something fails. A medium impact for the biggest action in the app.
- Use the system patterns for their meanings, always together with a visible change, never on scrolling or every tap, and off when the person turns haptics off.

## Sound (optional)
Tap and success sounds can make a product feel crafted. Quiet, short, only on key moments, off by default or easy to turn off.
