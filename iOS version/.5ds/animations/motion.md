# Motion

Checked against the official pages: 2026-11-17.
Every number here comes from `.5ds/animations/numbers.json`, the same file the feel check reads; the official pages behind this guide are in `.5ds/animations/sources.json`. The motion feel itself (how much moves, how fast, where it stays still) comes from the project's art direction in `.5ds/taste/art-direction.md`; these numbers are the range it lives in.

Whatever the feel: presses answer at once, things that arrive do so in a clear order, panels open and close on the same smooth curve, and nothing moves without a job. Every effect stays smooth; one that stutters is removed or simplified.

## The rules
- Motion has a job: show where something came from, what changed, or that the app heard you. Never motion for its own sake, and never the only way information is shown.
- Animate only `transform` (move, scale, rotate) and `opacity`, plus a small `filter: blur`. They are smooth on every device. Never animate width, height, top, left, margin or padding: they make the page jump and stutter. To grow or move a box, use Motion's `layout` prop (web), `matchedGeometryEffect` (SwiftUI) or `animateContentSize` (Compose).
- Interactions are fast. A state change (hover, press, toggle, a menu opening) takes 150 to 300 milliseconds; a text or number roll up to 620. Nothing that answers a person takes longer than 620 milliseconds.
- Entrances take 500 to 700 milliseconds on the first screen: people are waiting to read. A scroll reveal below the first screen may take 700 to 900 (Omar's reveal, below).
- Frequent actions get the least motion: a button pressed 50 times a day just changes, it does not perform.
- Every motion can be interrupted: a new tap wins and the animation continues from where it is. Springs do this for free.
- Respect Reduce Motion everywhere (below). Test with it on.

## The web
Use the `motion` library (`npm install motion`, import from `motion/react`) for anything beyond a hover; plain CSS transitions for hovers and colour.

### The easing family
| Use | Easing | Duration |
|---|---|---|
| Entrances, reveals, things arriving | `cubic-bezier(0.16, 1, 0.3, 1)` (a long, soft ease out) | 500 to 700ms |
| State changes, menus, buttons changing, text rolling | `cubic-bezier(0.22, 1, 0.36, 1)` | 150 to 620ms |
| Hover and colour | `ease-out` | 150 to 200ms |
| Leaving (an item exits) | `cubic-bezier(0.32, 0, 0.67, 0)` | 150 to 250ms, faster than it came |

In Motion, write easings as arrays: `ease: [0.16, 1, 0.3, 1]`. In Tailwind: `ease-[cubic-bezier(0.16,1,0.3,1)]`.

### Springs (Motion)
| Use | Spring |
|---|---|
| Panels, sheets, drawers, a sliding tab pill | `{ type: "spring", visualDuration: 0.5, bounce: 0.14 }` (or stiffness 320, damping 32, mass 0.9) |
| A press on a card or button | `{ type: "spring", visualDuration: 0.3, bounce: 0.3 }` |
| A playful settle (a tick filling in, a badge landing) | `{ type: "spring", visualDuration: 0.5, bounce: 0.25 }` |

### The entrance recipe
- **The hero headline never starts invisible.** It is on screen from the first frame, so the page paints fast (Largest Contentful Paint). The things around it enter: the badge, the subtitle, the buttons, the picture.
- From: `opacity: 0`, `y` 8 to 16px (the art direction says which). To: `opacity: 1`, `y: 0`.
- Timing: 500 to 700ms on `[0.16, 1, 0.3, 1]`.
- Stagger: each item starts 40 to 120ms after the one before (the art direction says which).
- Blur: on 1 hero element at most (the hero picture or product shot), 4px clearing to 0. Never in lists; in scroll reveals only as Omar's reveal.
- Scroll reveals: start when 15 percent of a section is visible, once per section: a fade and a small rise, or Omar's reveal. Never for every paragraph.
- With Reduce Motion: no rise and no blur, a short fade (200ms), via `useReducedMotion()`.

```tsx
"use client"
import { motion, useReducedMotion } from "motion/react"

export function Rise({ children, order = 0, blur = false }) {
  const still = useReducedMotion()
  const from = still ? { opacity: 0 } : { opacity: 0, y: 14, filter: blur ? "blur(4px)" : "blur(0px)" }
  const to = { opacity: 1, y: 0, filter: "blur(0px)" }
  const timing = { duration: still ? 0.2 : 0.6, ease: [0.16, 1, 0.3, 1], delay: still ? 0 : order * 0.08 }
  return <motion.div initial={from} animate={to} transition={timing}>{children}</motion.div>
}
```

### Text and numbers never jump
- A word or a digit that changes rolls: the old one moves up and out (to -110 percent) as the new one moves up and in (from +110 percent), with a 2 to 3px blur, over 420 to 620ms on `[0.22, 1, 0.36, 1]`.
- Use tabular figures for changing numbers.

### Omar's reveal and the roll
Omar's own sections arrive softly: each block rises 24px as a 6px blur clears, over 700 to 900ms on `[0.16, 1, 0.3, 1]`, each block 120ms after the one before, once per section, when 15 percent of it is visible. Text that changes rolls over 420 to 620ms. With Reduce Motion: a 200ms fade, no rise, no blur. More of Omar's moves: `.5ds/animations/patterns.md`.

```tsx
"use client"
import { AnimatePresence, motion, useReducedMotion } from "motion/react"

// Omar's reveal: a block rises and a soft blur clears as its section arrives, once.
export function Reveal({ children, order = 0 }) {
  const still = useReducedMotion()
  const from = still ? { opacity: 0 } : { opacity: 0, y: 24, filter: "blur(6px)" }
  const to = { opacity: 1, y: 0, filter: "blur(0px)" }
  const timing = { duration: still ? 0.2 : 0.9, ease: [0.16, 1, 0.3, 1], delay: still ? 0 : order * 0.12 }
  const once = { once: true, amount: 0.15 }
  return <motion.div initial={from} whileInView={to} viewport={once} transition={timing}>{children}</motion.div>
}

// The roll: the old word leaves up and out as the new one comes up and in. The slot keeps its line, so nothing jumps.
export function Roll({ text }) {
  const still = useReducedMotion()
  const from = still ? { opacity: 0 } : { y: "110%", opacity: 0, filter: "blur(3px)" }
  const gone = still ? { opacity: 0 } : { y: "-110%", opacity: 0, filter: "blur(3px)" }
  const to = { y: "0%", opacity: 1, filter: "blur(0px)" }
  const timing = { duration: still ? 0.2 : 0.56, ease: [0.22, 1, 0.36, 1] }
  return (
    <span className="relative inline-grid overflow-hidden align-bottom tabular-nums">
      <AnimatePresence mode="popLayout" initial={false}>
        <motion.span key={text} className="col-start-1 row-start-1" initial={from} animate={to} exit={gone} transition={timing}>{text}</motion.span>
      </AnimatePresence>
    </span>
  )
}
```

### Showcase pages
An agency, studio, portfolio, launch or brand page is the product itself, so its motion carries the personality. The default there is richer, still inside these numbers and still off with Reduce Motion:
- **Every section reveals** as it arrives (15 percent visible), with its own order: the label, then the headline, then the rest.
- **Text that builds.** Big headlines build line by line, each line rising out of its own mask, 500 to 700ms per line, 40 to 120ms apart. The hero headline may build this way too, because it is never transparent: it starts at once and is whole within 700ms.
- **Depth on scroll.** A picture or a block of type drifts slower than the page (parallax), up to 80px over its pass, by transform only.
- **The signature moment** from the art direction is built properly: scroll linked where it fits (`useScroll` and `useTransform`), smooth at 60 frames a second, and still a complete page with Reduce Motion on.
- Hovers have character: a picture that scales a little inside its frame, a link whose underline draws in, a cursor label on the work.

```tsx
"use client"
import { motion, useReducedMotion, useScroll, useTransform } from "motion/react"
import { useRef } from "react"

// A headline that builds line by line: each line rises out of its own mask, so it is never transparent.
export function BuildLines({ lines, onScroll = false }) {
  const still = useReducedMotion()
  const go = onScroll ? { whileInView: { y: "0%" }, viewport: { once: true, amount: 0.15 } } : { animate: { y: "0%" } }
  const from = still ? false : { y: "105%" }
  const timing = (i) => ({ duration: 0.7, ease: [0.16, 1, 0.3, 1], delay: i * 0.09 })
  return (
    <span className="block">
      {lines.map((line, i) => (
        <span key={i} className="block overflow-hidden pb-[0.08em]">
          <motion.span className="block" initial={from} {...go} transition={timing(i)}>{line}</motion.span>
        </span>
      ))}
    </span>
  )
}

// Depth on scroll: the child drifts slower than the page. Transform only; still with Reduce Motion.
export function Drift({ children, range = 60 }) {
  const ref = useRef(null), still = useReducedMotion()
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] })
  const y = useTransform(scrollYProgress, [0, 1], still ? [0, 0] : [-range, range]), drift = { y }
  return <div ref={ref} className="overflow-hidden"><motion.div style={drift}>{children}</motion.div></div>
}
```

### Reduce Motion on the web
- Wrap the app once: `<MotionConfig reducedMotion="user">` in the root layout. Motion then drops movement and keeps fades.
- In CSS, every keyframe animation sits inside `@media (prefers-reduced-motion: no-preference) { }`, or the file ends with a block under `@media (prefers-reduced-motion: reduce)` that turns movement off. In Tailwind, use `motion-safe:` and `motion-reduce:`.
- With Reduce Motion on: no movement, no parallax, no zoom, no auto playing motion, no blur. A short fade (150 to 200ms) is fine.

## iPhone, iPad and Mac (SwiftUI)
| Use | Value |
|---|---|
| Sheets, panels, bars (the house spring) | `.spring(response: 0.5, dampingFraction: 0.86)` |
| A sheet opening, and closing on the same feel | `.spring(response: 0.55, dampingFraction: 0.86)` and `.spring(response: 0.6, dampingFraction: 0.86)` |
| Press on a card or button | scale 0.97, `.spring(response: 0.3, dampingFraction: 0.7)` |
| Staggered entrance | offset 14 to 18pt up plus fade, `.spring(response: 0.6, dampingFraction: 0.86)`, delay 0.04 + index x 0.07 seconds |
| Small value changes | `.snappy(duration: 0.2)` |
| A playful settle | `.spring(duration: 0.5, bounce: 0.25)` |
| Content swap inside a card | out: `.easeIn(duration: 0.1)`; in: `.easeOut(duration: 0.28)` after 0.16 seconds |

- Numbers: `.contentTransition(.numericText())`. Icon swaps: `.symbolEffect(.replace)`.
- Drags follow the finger. Past a threshold (about 110pt, or a fast flick) the action completes; otherwise it springs back. Pulling past the end gives a soft rubber band, never a hard stop.
- A panel rises whole; content never grows from its centre.
- Read `@Environment(\.accessibilityReduceMotion)`. When it is on: tighten springs to remove bounce, swap moves for fades, no depth or zoom, no blur in or out, and still the loaders.

## Android (Material 3 springs)
Material 3 Expressive moves with springs. Spatial springs move position, size and shape and may overshoot; effect springs change colour and opacity and never overshoot.

| Scheme | Spatial fast / default / slow (damping, stiffness) | Effects fast / default / slow |
|---|---|---|
| Expressive (playful products) | 0.6, 800 / 0.8, 380 / 0.8, 200 | 1.0, 3800 / 1.0, 1600 / 1.0, 800 |
| Standard (tools) | 0.9, 1400 / 0.9, 700 / 0.9, 300 | 1.0, 3800 / 1.0, 1600 / 1.0, 800 |

- Read them from `MaterialTheme.motionScheme` instead of typing numbers.
- Where a duration is needed: short 50 to 200ms, medium 250 to 400ms, long 450 to 600ms; emphasised easing `cubic-bezier(0.2, 0, 0, 1)`.
- When the person turns animations off (animator duration scale 0), the app still works and shows the end state at once.

## Never animate
- Width, height, top, left, margin or padding (use transforms or layout animation).
- Anything that blocks the person: no animation before a button works, no forced intro that cannot be skipped.
- Text people are reading, while they read it.
- More than 1 attention effect on a screen (a glow, a beam, a pulse).
- Infinite loops in the corner of the eye, except a loader that is actually loading.
