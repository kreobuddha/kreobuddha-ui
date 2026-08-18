import { defineConfig, devices } from '@playwright/test';

/**
 * Two runs against the built Storybook, separated by what they judge and therefore by where they
 * can run.
 *
 * `visual` judges pixels, which needs a baseline, a diff artifact and an update path that a
 * behaviour runner has no reason to carry. **It is a local check, not a CI gate.** Baselines are
 * committed for one platform, and a screenshot taken on another does not match it — the same text
 * renders differently on macOS and on Linux, which is exactly why `docs/QUALITY.md` §6 asks for a
 * fixed baseline environment. The baselines here are macOS, so the run belongs on a developer's
 * machine before merge rather than on an Ubuntu runner. The platform is in the snapshot path, so a
 * Linux set can be added later beside this one rather than replacing it.
 *
 * `browser` judges behaviour the story runner cannot reach: `Escape` and the modal focus trap are
 * the browser's, not the DOM's, and a simulated key press does not exercise either. It compares
 * nothing against a baseline, so nothing about it is platform-specific and it runs in CI.
 */
export default defineConfig({
  projects: [
    { name: 'visual', testDir: 'tests/visual' },

    // The same suite in three engines. `browser` stays Chromium so the existing command keeps
    // meaning what it meant; the other two are what turns "no browser matrix is claimed" into a
    // matrix somebody measured.
    { name: 'browser', testDir: 'tests/browser' },
    {
      name: 'browser-firefox',
      testDir: 'tests/browser',
      use: { ...devices['Desktop Firefox'], viewport: { width: 1000, height: 800 } },
    },
    {
      name: 'browser-webkit',
      testDir: 'tests/browser',
      use: { ...devices['Desktop Safari'], viewport: { width: 1000, height: 800 } },
    },

    // The third run judges neither pixels nor a component, but the example that composes them:
    // `examples/workbench`, built against the packed package and served on its own port. Like
    // `browser` it compares nothing against a baseline, so it is CI-safe.
    //
    // Its server is not a `webServer` entry below, and that is deliberate: Playwright starts every
    // entry whichever project is selected, so an entry here would make `check:visual` and
    // `check:browser` wait on a directory neither of them asked anyone to build.
    // `scripts/check-workbench.mjs` builds the example, serves it on 6008 and runs this project —
    // which is why the workbench is run through that script rather than by hand.
    {
      name: 'workbench',
      testDir: 'tests/workbench',
      use: { baseURL: 'http://localhost:6008' },
    },
  ],

  // A pixel diff that is retried is a pixel diff that is being hidden.
  retries: 0,
  forbidOnly: true,
  reporter: [['list'], ['html', { open: 'never' }]],

  snapshotPathTemplate: '{testDir}/__screenshots__/{platform}/{arg}{ext}',

  expect: {
    toHaveScreenshot: {
      // `threshold` absorbs antialiasing: it is a per-pixel colour tolerance, so a subpixel that
      // lands a shade differently between runs is not a difference.
      //
      // `maxDiffPixels` is a count, deliberately, and deliberately small. Changing
      // `--kreo-radius-md` from 4px to 10px — every button corner in the library — moves 82 pixels
      // in the variants screenshot. A geometry change is small in pixels and large in meaning, so
      // the budget has to sit below the smallest change worth catching rather than at a fraction
      // of the image, which for a screenshot this size would be hundreds of pixels. The number
      // below was chosen by making that change and confirming the run fails, then running three
      // times unchanged and confirming it does not.
      threshold: 0.2,
      maxDiffPixels: 20,
    },
  },

  use: {
    baseURL: 'http://localhost:6007',

    ...devices['Desktop Chrome'],
    viewport: { width: 1000, height: 800 },
    deviceScaleFactor: 1,

    // Reduced motion is not a convenience here: `Spinner` disables its rotation entirely under
    // this media query, which is what makes a spinner screenshot reproducible at all. It sits
    // under `contextOptions` because that is where Playwright 1.62 types it; at the top level of
    // `use` the compiler rejects it.
    contextOptions: {
      reducedMotion: 'reduce',
      colorScheme: 'light',
    },
  },

  webServer: {
    command: 'node scripts/serve-static.mjs storybook-static 6007',
    url: 'http://localhost:6007/index.html',
    reuseExistingServer: true,
    timeout: 30_000,
  },
});
