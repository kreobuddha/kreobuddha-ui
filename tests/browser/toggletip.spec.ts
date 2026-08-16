import { expect, test } from '@playwright/test';
import type { Page } from '@playwright/test';

import { storyUrl } from '../story-url.js';

/**
 * What a real engine adds here is the top layer and the anchor positioning: the bubble has to end
 * up beside its trigger and above everything else on the page. Neither is observable in jsdom,
 * which computes no layout and implements no popover — the unit tests cover the behaviour instead,
 * and stop there honestly.
 */

const STORY = 'components-toggletip--open';

const bubble = (page: Page) => page.locator('[role="status"]');

/** `goto` resolves on load and Storybook renders after that; the story's `play` opens the bubble. */
const openStory = async (page: Page, id: string): Promise<void> => {
  await page.goto(storyUrl(id));
  await expect(bubble(page)).toHaveAttribute('data-open');
};

test('the bubble is placed against its trigger, not centred in the viewport', async ({ page }) => {
  await openStory(page, STORY);

  const trigger = await page.getByRole('button').boundingBox();
  const tip = await bubble(page).boundingBox();

  expect(trigger).not.toBeNull();
  expect(tip).not.toBeNull();

  // The story asks for `bottom`, so the bubble sits under the trigger and overlaps its column.
  // Without anchor positioning the UA would centre it in the viewport, which this catches.
  expect(tip?.y ?? 0).toBeGreaterThan(trigger?.y ?? 0);
  expect(tip?.x ?? 0).toBeLessThan((trigger?.x ?? 0) + (trigger?.width ?? 0));
});

test('it enters the top layer, so nothing on the page covers it', async ({ page }) => {
  await openStory(page, STORY);

  const inTopLayer = await bubble(page).evaluate((node) => node.matches(':popover-open'));

  expect(inTopLayer).toBe(true);
});

test('Escape closes it and returns focus to the trigger', async ({ page }) => {
  await openStory(page, STORY);

  const trigger = page.getByRole('button');

  await page.keyboard.press('Escape');

  await expect(bubble(page)).not.toHaveAttribute('data-open');

  // A real press, not a dispatched event — the same reason `tests/browser/` exists at all.
  await expect(trigger).toBeFocused();
  await expect(trigger).toHaveAttribute('aria-expanded', 'false');
});

test('a click outside closes it, and one inside does not', async ({ page }) => {
  await openStory(page, STORY);

  await bubble(page).click();
  await expect(bubble(page)).toHaveAttribute('data-open');

  await page.mouse.click(5, 5);
  await expect(bubble(page)).not.toHaveAttribute('data-open');
});

test.describe('forced colors', () => {
  // `contextOptions` replaces the object in `playwright.config.ts` rather than merging into it, so
  // the two settings that apply everywhere else are repeated here on purpose.
  test.use({
    contextOptions: { reducedMotion: 'reduce', colorScheme: 'light', forcedColors: 'active' },
  });

  test('the bubble keeps a visible edge', async ({ page }) => {
    await openStory(page, STORY);

    const active = await page.evaluate(() => matchMedia('(forced-colors: active)').matches);
    expect(active, 'forced-colors emulation is not in effect').toBe(true);

    // No shadow is painted in this mode, so the border is all that separates the bubble from what
    // it covers. It comes from the shared overlay stylesheet, which is what this also protects.
    const border = await bubble(page).evaluate((node) => getComputedStyle(node).borderTopWidth);
    expect(border).not.toBe('0px');
  });
});
