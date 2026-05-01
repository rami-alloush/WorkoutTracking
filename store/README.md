# Store Assets

Icons and marketing graphics for uploading WorkoutTracker to the App Store and Google Play.

## What's in this folder

| File | Size | Use |
|------|------|-----|
| `app-store-icon-1024.png` | 1024×1024 | **iOS App Store** marketing icon (no alpha, flattened). Upload in App Store Connect → App Information → App Icon. |
| `play-store-icon-512.png` | 512×512 | **Google Play** high-res icon. Upload in Play Console → Main store listing → App icon. |
| `play-feature-graphic-1024x500.png` | 1024×500 | **Google Play** feature graphic. Upload in Play Console → Main store listing → Feature graphic. |

## Regenerating

All assets are derived from SVG sources in `resources/`. To regenerate everything (store assets, native app icons, splash screens, web favicons, PWA icons):

```bash
npm run assets:generate
```

This runs:
1. `node scripts/generate-icons.mjs` — rasterizes `resources/*.svg` via sharp into:
   - `resources/icon.png`, `icon-foreground.png`, `icon-background.png`, `splash.png`, `splash-dark.png`
   - `store/*.png` (this folder)
   - `public/favicon.ico`, `favicon-16.png`, `favicon-32.png`, `apple-touch-icon.png`, `icon-192.png`, `icon-512.png`, `icon-maskable-512.png`
2. `npx capacitor-assets generate` — propagates icons/splash into:
   - `android/app/src/main/res/mipmap-*` and `drawable-*`
   - `ios/App/App/Assets.xcassets/AppIcon.appiconset` and `Splash.imageset`
   - `public/icons/icon-*.webp` (PWA)

After regeneration, run `npx cap sync` if you changed native resources.

## Source files

Edit these SVGs to change the design, then re-run `npm run assets:generate`:

- `resources/icon-only.svg` — full app icon (used for iOS, store icons, web/PWA)
- `resources/icon-foreground.svg` — Android adaptive-icon foreground layer (dumbbell only, scaled into safe zone)
- `resources/icon-background.svg` — Android adaptive-icon background layer (emerald gradient)
- `resources/splash.svg` / `splash-dark.svg` — launch splash (2732×2732)
- `resources/feature-graphic.svg` — Google Play feature graphic banner (1024×500)

## Brand colors

- Primary gradient: `#34D399 → #10B981 → #059669` (PrimeNG Aura emerald)
- Dark splash: `#0B1512 → #04110C`
- Icon metal: `#FFFFFF → #E6FFF5`

## Screenshots (still TODO)

Store screenshots are not auto-generated — capture them from the running app:

- **iOS**: 6.7" (iPhone 15 Pro Max: 1290×2796), 6.5" (1242×2688), and 5.5" (1242×2208) required.
- **Android**: At least 2 phone screenshots (min 320px, max 3840px, 16:9 or 9:16).

Suggested flow to capture: use iOS Simulator / Android emulator → `⌘+S` / emulator screenshot button on these screens:
1. Dashboard
2. Workout Player (mid-session)
3. Exercise Library
4. Progress charts
5. Workout Builder
