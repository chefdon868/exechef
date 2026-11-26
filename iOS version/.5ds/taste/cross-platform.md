# One codebase for several platforms

Checked against the official pages: 2026-11-17 (Expo SDK 58 with React Native 0.88, SwiftUI for iOS 27 and macOS 27, Flutter 3.50).
Read `.5ds/taste/instructions.md` first, then this, then each target platform's guide (`ios.md`, `android.md`, `macos.md`, `web.md`). Run `node .5ds/taste/sources.mjs cross-platform` before the first screen: the newest release notes say what is native today. Every version here is cited in `.5ds/taste/sources.json` under facts.

## Choose the stack by how native it must feel
- **Fully native, best feel:** SwiftUI for Apple devices, Jetpack Compose for Android.
- **1 codebase that still uses the real system bars:** Expo (React Native) with native navigation. The default for a member's first app on phones.
- **1 custom brand look, the same on both:** Flutter. It draws its own pixels, so it never gets Liquid Glass or Material 3 Expressive for free.
- A website that works well on phones: the web guide. Do not build an app when a site does the job.

## Expo and React Native
- Navigation: Expo Router `Stack` and `NativeTabs`. They use the system's own navigation and tab bars, so they get Liquid Glass on iOS. Never fake a tab bar in JavaScript.
- Native parts: Expo UI wraps real SwiftUI and Jetpack Compose views. Offer it only when its docs page (in `sources.json`) marks it neither alpha nor beta; on 2026-11-17 it carried no such badge. If it does, use React Native's own components.
- Glass: `expo-glass-effect`; check `isLiquidGlassAvailable` first and fall back to a plain material.
- Safe areas everywhere, including the sides (`SafeAreaView` or the safe area hooks). Do not lock orientation or rely on full screen: apps built for iOS 27 resize (Expo SDK 58 notes).
- Icons: SF Symbols on iOS, Material Symbols on Android. System fonts for body text.
- Touch targets 44pt on iOS and 48dp on Android. Haptics with `expo-haptics`, used as the iOS guide says.
- Motion: Reanimated springs with the numbers in `.5ds/animations/motion.md`, and `useReducedMotion()` from Reanimated to honour Reduce Motion.

## SwiftUI across Apple devices
- 1 SwiftUI codebase can serve iPhone, iPad and Mac: `NavigationSplitView` adapts from a stack to a sidebar. Follow `ios.md` for touch and `macos.md` for menus, windows and density.
- Standard `TabView`, `NavigationStack`, `.toolbar` and `.sheet` with detents adopt Liquid Glass automatically.

## Flutter
- Material and Cupertino are separate packages now: `material_ui` and `cupertino_ui`. Migrate with `dart fix --apply --code=migrate_design_widgets`.
- Use `material_ui` on Android and `cupertino_ui` (or adaptive widgets) on iOS, and follow each platform's navigation: back gesture, tab bar on iOS, navigation bar on Android, sheets.
- Liquid Glass and Expressive support in those packages is still arriving: read their changelogs before promising either.

## Same everywhere
The colour roles, faces, radius and motion feel come from 1 art direction (`.5ds/taste/art-direction.md`) and 1 palette (`.5ds/taste/palette.md`), translated into each platform's theme. The platform's own controls and navigation stay native.
