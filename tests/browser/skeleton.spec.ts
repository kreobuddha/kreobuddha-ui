import { expect, test } from '@playwright/test';
import type { Page } from '@playwright/test';

import { storyUrl } from '../story-url.js';

/**
 * `Skeleton` is drawn entirely by a media query in two of the three modes it has to work in, and
 * neither mode is reachable from the story runner: jsdom evaluates no media query, and a screenshot
 * of forced-colors would be a screenshot of the operating system's palette. Computed style in a
 * real engine is what is left, and it is the same number on every platform.
 */

const STORY = 'components-skeleton--default';

const skeleton = (page: Page) => page.locator('#storybook-root span').first();

test.describe('reduced motion', () => {
  test('the pulse is dropped rather than slowed', async ({ page }) => {
    // The project already runs with `reducedMotion: 'reduce'` — see `playwright.config.ts`.
    await page.goto(storyUrl(STORY));

    const reduced = await page.evaluate(
      () => matchMedia('(prefers-reduced-motion: reduce)').matches
    );
    expect(reduced, 'reduced-motion emulation is not in effect').toBe(true);

    const name = await skeleton(page).evaluate((node) => getComputedStyle(node).animationName);
    expect(name).toBe('none');
  });

  test('and is there to be dropped when nothing is preferred', async ({ page }) => {
    // Without this the assertion above would also pass on a component that never animated.
    await page.emulateMedia({ reducedMotion: 'no-preference' });
    await page.goto(storyUrl(STORY));

    const name = await skeleton(page).evaluate((node) => getComputedStyle(node).animationName);
    expect(name).not.toBe('none');
  });
});

test.describe('forced colors', () => {
  // `contextOptions` replaces the object in `playwright.config.ts` rather than merging into it, so
  // the two settings that apply everywhere else are repeated here on purpose.
  test.use({
    contextOptions: { reducedMotion: 'reduce', colorScheme: 'light', forcedColors: 'active' },
  });

  test('the placeholder keeps its shape when its fill is not painted', async ({ page }) => {
    await page.goto(storyUrl(STORY));

    const active = await page.evaluate(() => matchMedia('(forced-colors: active)').matches);
    expect(active, 'forced-colors emulation is not in effect').toBe(true);

    const border = await skeleton(page).evaluate((node) => getComputedStyle(node).borderTopWidth);
    expect(border).not.toBe('0px');
  });
});
