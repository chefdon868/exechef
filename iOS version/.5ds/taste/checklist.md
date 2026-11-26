# The look check

Go through this for each new or changed screen, before the owner sees it. Numbers here are in `web.md`'s type table and `numbers.json`.

## 1. Run the checks
- `node .5ds/taste/look.mjs`: the screens by kind (marketing pages, app screens, forms), and the art direction (written, picked in the owner's words, its own look, shadcn restyled beyond colour). A line you keep on purpose gets the comment `look-ok` with the reason.
- `node .5ds/taste/palette.mjs --check`: the contrast of every text and ground pair. All pass.
- With the app running: `node .5ds/taste/shots.mjs / /your-other-pages` shoots each page at 320, 375 and 1280 wide, light and dark, and at 200 percent zoom, and fails a page wider than its window. Look at every shot.
- Speed, for a marketing page: Lighthouse on the running app (`npx lighthouse http://localhost:3000 --only-categories=performance --form-factor=mobile --quiet`), within the Core Web Vitals in `web.md`.

## 2. Look at it in every state
- Every width and zoom the shots cover; on apps, the smallest and largest phone, and iPad or a 600dp window when the app runs there.
- Light and dark.
- Empty, loading, loaded with real looking data, and an error.
- Apps: the largest accessibility text size, and Reduce Motion on.

## 3. Is it beautiful?
- Set the 1280 and 375 shots beside the shots of the references in "The bar". Would it sit next to them? If not, what would a top studio change? Fix the 3 biggest things and write the before and after under "Beauty pass".
- The signature moment is there, built with care, and works at 375 as well as 1280.
- The type is set at real scale, the colours stay within the roles, and the page has rhythm: quiet space, then a big moment.
- Finishing details are done: labels, the footer, hover and focus states.
- It carries the house craft: go through The craft test in `.5ds/taste/craft.md`, and write the Craft line under "Beauty pass".

## 4. Is it its own?
- The first screen carries the art direction's signature moment, or leads to it, and the visitor's 1 job is reachable without scrolling.
- Name the 2 products this page could be confused with, and the 1 difference that sets it apart. If you cannot name the difference, it is not done.
- The faces, colours, shape and density are the ones the art direction says.

## 5. App screens and forms
- A calm title and the screen's 1 main action easy to find.
- Every list has its empty state and its loading state.
- Every field has a visible label; errors sit next to the field, in words; 1 action that says what happens.

## 6. Everywhere
- Nothing scrolls sideways, overlaps, or is cut off.
- Only tokens: no raw colours or fixed white in screens.
- Spacing only on the scale in `web.md`.
- Targets at the floor in `numbers.json` (touch_min_px); the keyboard reaches everything and the focus ring shows.
- It follows the platform guide (system bars on iOS, edge to edge on Android, the menu bar on the Mac).
- Real words and real pictures.

## Then
Fix what fails and look again. Then go through `.5ds/animations/checklist.md`. Show the owner the screen with 1 short line on what to look at, and say what you could not check, in 1 line.
