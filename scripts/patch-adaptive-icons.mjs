/**
 * patch-adaptive-icons.mjs
 *
 * Runs AFTER `capacitor-assets generate` to fix the adaptive-icon XMLs.
 * @capacitor/assets overwrites mipmap-anydpi-v26/ic_launcher*.xml with a
 * template that references the (faint) PNG mipmap foreground.  We replace it
 * with a reference to the hand-crafted vector drawable in drawable-v24/
 * ic_launcher_foreground.xml, which renders a crisp, fully-opaque dumbbell.
 */
import { writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, '..');
const R = (p) => resolve(root, p);

const ADAPTIVE_ICON_XML = `<?xml version="1.0" encoding="utf-8"?>
<adaptive-icon xmlns:android="http://schemas.android.com/apk/res/android">
    <background android:drawable="@mipmap/ic_launcher_background" />
    <foreground android:drawable="@drawable/ic_launcher_foreground" />
</adaptive-icon>
`;

async function main() {
  const targets = [
    R('android/app/src/main/res/mipmap-anydpi-v26/ic_launcher.xml'),
    R('android/app/src/main/res/mipmap-anydpi-v26/ic_launcher_round.xml'),
  ];

  for (const t of targets) {
    await writeFile(t, ADAPTIVE_ICON_XML, 'utf8');
    console.log(`✓ Patched ${t}`);
  }

  console.log(
    '\nAdaptive icons now use @drawable/ic_launcher_foreground (vector dumbbell).'
  );
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
