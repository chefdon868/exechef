# Animations

Read this before you build any tap, form, flow, loading state or animation. Taste (`.5ds/taste/instructions.md`) is how the app looks; this is how it feels: interactions, states and motion. A product made with 5 Day Sprint feels calm, quick and alive: it answers every touch at once, never leaves a person wondering, and moves smoothly.

## The 8 rules
1. **Answer within 100 milliseconds.** Every tap, click and key press shows a change at once: a press state, a highlight, a spinner inside the button. The real result can follow; the acknowledgement cannot wait.
2. **Every state is designed.** Each screen and part has 5: empty (what to do first, and a glimpse of what it will look like once used: a sample row, a preview or 1 starter item, never a mostly blank screen), loading (a skeleton in the shape of what is coming), loaded, error (what went wrong in plain words and a way to try again), and done (a short, clear success). Never a blank screen, a frozen button or a spinner with no end.
3. **Every wait ends on screen.** A spinner or skeleton always turns into a result, a plain line ("This is taking longer than usual") with a way out, or an error with "Try again". Nothing waits forever.
4. **Make the right thing easy.** 1 main action per screen, the most likely choice already chosen, the fewest taps and fields that do the job. Ask only what you need now; the rest can come later.
5. **Forms help.** Labels above fields. Check each field when the person leaves it, not on every key. Errors say what to do ("Use at least 8 characters"), next to the field, in words, not only in red. The submit button shows that it is working and cannot be pressed twice. Keep what they typed when something fails.
6. **Words that do the job.** Buttons say what happens ("Book the table", "Send invite"), never "Submit" or "OK". Errors never blame. Success is short ("Invite sent"). Plain words a 12 year old reads in 1 go.
7. **Motion explains, never decorates.** Things enter by rising and fading in a staggered order, panels slide from where they came from, content swaps smoothly, and nothing jumps. Smooth beats showy: if an effect stutters, simplify it. On a showcase site (an agency, studio, portfolio, launch or brand page) motion is the personality: every section reveals, big text builds, depth moves on scroll where it fits, and the art direction's signature moment is built properly. The exact timings, springs and the showcase recipes are in `.5ds/animations/motion.md`.
8. **Respect people's settings.** Reduce Motion (web `prefers-reduced-motion`) turns movement into gentle fades or nothing. Dark mode, larger text and keyboard use all work. Sounds and haptics are optional and never the only signal.

## Navigation and flows
- People always know where they are (a title, the active tab), how to go back (the system back, a Back button, Escape), and what comes next.
- A flow of several steps shows its progress ("Step 2 of 4" or a thin bar), lets people go back without losing anything, and ends on a clear confirmation with the next step.
- Destructive actions ask first, in words that name what is lost ("Delete 3 bookings? This cannot be undone."), or better, offer Undo for a few seconds.
- After sign up, land on something useful: 1 starter item, never an empty screen.

## Where the details are
- `.5ds/animations/motion.md`: durations, easings, springs per platform, the entrance recipe, stagger, Reduce Motion, and what never to animate.
- `.5ds/animations/patterns.md`: the interaction recipes: press and hover, loading buttons, optimistic updates, toasts, skeletons, transitions, scroll reveals, gestures, haptics, and Omar's moves (rolling text, the button that morphs, the staggered fold, the ground that shifts, the reveal with a blur).
- `.5ds/animations/checklist.md`: what to check before showing a screen.

## Before you show a screen
Run `node .5ds/animations/animations.mjs`, fix its fix lines, then go through `.5ds/animations/checklist.md`. Try the screen yourself: tap everything, submit the form with a mistake, wait on a slow connection, and turn Reduce Motion on.
