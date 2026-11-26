# The feel check

Go through this for each new or changed screen or flow, after the look check, before the owner sees it.

First run `node .5ds/animations/animations.mjs` from the project folder. It reads the code and lists animations with no Reduce Motion fallback, submit buttons with no working or disabled state, state changes slower than 620 milliseconds and entrances slower than 700, and animations of width, height or position that make the page jump. Fix its fix lines. A line you keep on purpose gets the comment `ux-ok` with the reason, and the check skips it. Then use the screen yourself.

## Try it
- Tap or click everything. Each answers within 100 milliseconds with a visible change.
- Submit each form empty, with a mistake, and correctly. Errors sit by the field, in words, and what was typed stays. The button shows it is working, cannot be pressed twice, and ends in a clear success or "Try again".
- Load on a slow connection (the browser's network throttle, or a slow simulator network). Skeletons in the shape of the content, no jumps when it arrives, and every wait ends.
- Go through each flow from start to end, and back. Progress shows; going back loses nothing; the end says what happens next.
- Turn Reduce Motion on (web: the system setting, or the browser's emulation). Nothing moves; fades are fine; everything still works.
- Use only the keyboard (web and Mac). Every control is reachable, the focus ring shows, Escape closes what opened.
- Apps: try every gesture, its alternative button, and the haptics with sound off.

## Feel
- The hero headline is there on the first frame; the rest rises and fades in a staggered order, 500 to 700ms.
- Panels and sheets glide in and out on the same smooth spring.
- Text and numbers that change roll or fade; nothing jumps or reflows.
- Closing is as smooth as opening; any of Omar's moves used (at most 2 signature moves, `patterns.md`) is smooth at 375 and 1280.
- At most 1 attention effect on the screen.
- A showcase page: every section reveals, big headlines build, the signature moment moves as the art direction says, and with Reduce Motion on the page is still whole and calm.
- Buttons say what they do; errors never blame; success is short.
