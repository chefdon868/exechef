# The palette

The colour roles from this project's art direction, ready for code. It belongs to the owner, and updates to 5 Day Sprint never overwrite it. It starts empty: nothing is chosen until the art direction in `.5ds/taste/art-direction.md` is written and picked.

Fill in the block below with the same roles as the art direction, each as `oklch(L C H)` or a hex code, then run `node .5ds/taste/palette.mjs`. It works out every other token, light and dark, measures every text and ground pair, and writes the theme into `web/app/globals.css`.

- `canvas`, `ink`, `action`: needed. The canvas decides which mode the app opens in (a dark canvas means dark); the other mode is worked out from the same hues.
- `accent`: optional, for 1 role such as data or a highlight.
- After a role that came from an existing logo or brand colours, add `# from the logo` (or where it came from).
- `radius`: optional, for example `0.5rem`.
- `light_canvas`, `light_ink`, `light_action` or `dark_canvas`, `dark_ink`, `dark_action`: optional, to choose the other mode yourself.

```palette
```

For an app, `palette.mjs` prints the chosen colours as hex codes: add them as colour sets in the asset catalogue (iOS and Mac) or the theme file (Android, Expo, Flutter).
