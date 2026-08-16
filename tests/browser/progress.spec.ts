import { expect, test } from '@playwright/test';
import type { Page } from '@playwright/test';

import { storyUrl } from '../story-url.js';

/**
 * The indeterminate bar is a media query in two of the three modes it has to work in, and neither
 * is reachable from the story runner: jsdom evaluates no media query, and a forced-colors
 * screenshot would photograph the operating system's palette rather than the component.
 */

const STORY = 'components-progress--indeterminate';

const indicator = (page: Page) => page.getByRole('progressbar').locator('span');

test.describe('reduced motion', () => {
  test('the travelling segment stops rather than slows', async ({ page }) => {
    // The project already runs with `reducedMotion: 'reduce'` — see `playwright.config.ts`.
    await page.goto(storyUrl(STORY));

    const reduced = await page.evaluate(
      () => matchMedia('(prefers-reduced-motion: reduce)').matches
    );
    expect(reduced, 'reduced-motion emulation is not in effect').toBe(true);

    const name = await indicator(page).evaluate((node) => getComputedStyle(node).animationName);
    expect(name).toBe('none');
  });

  test('and the stopped segment is inside the track, not parked off the end of it', async ({
    page,
  }) => {
    await page.goto(storyUrl(STORY));

    const box = await indicator(page).boundingBox();
    const track = await page.getByRole('progressbar').boundingBox();

    expect(box).not.toBeNull();
    expect(track).not.toBeNull();

    // The static position is a `translateX`, so getting it wrong hides the segment completely
    // while every other check still passes.
    expect(box?.width ?? 0).toBeGreaterThan(0);
    expect(box?.x ?? 0).toBeGreaterThanOrEqual(track?.x ?? 0);
    expect((box?.x ?? 0) + (box?.width ?? 0)).toBeLessThanOrEqual(
      (track?.x ?? 0) + (track?.width ?? 0)
    );
  });

  test('and it does travel when nothing is preferred', async ({ page }) => {
    // Without this the assertion above would also pass on a bar that never moved.
    await page.emulateMedia({ reducedMotion: 'no-preference' });
    await page.goto(storyUrl(STORY));

    const name = await indicator(page).evaluate((node) => getComputedStyle(node).animationName);
    expect(name).not.toBe('none');
  });
});

test.describe('forced colors', () => {
  // `contextOptions` replaces the object in `playwright.config.ts` rather than merging into it, so
  // the two settings that apply everywhere else are repeated here on purpose.
  test.use({
    contextOptions: { reducedMotion: 'reduce', colorScheme: 'light', forcedColors: 'active' },
  });

  test('the track keeps its extent and the fill stays visible', async ({ page }) => {
    await page.goto(storyUrl('components-progress--default'));

    const active = await page.evaluate(() => matchMedia('(forced-colors: active)').matches);
    expect(active, 'forced-colors emulation is not in effect').toBe(true);

    const track = page.getByRole('progressbar');
    const border = await track.evaluate((node) => getComputedStyle(node).borderTopWidth);
    expect(border).not.toBe('0px');

    // Neither background survives this mode on its own; the fill is restated in a system colour,
    // and a bar whose fill matches its track is a bar with no reading.
    const [fill, background] = await track.evaluate((node) => [
      getComputedStyle(node.firstElementChild as Element).backgroundColor,
      getComputedStyle(node).backgroundColor,
    ]);
    expect(fill).not.toBe(background);
  });
});
