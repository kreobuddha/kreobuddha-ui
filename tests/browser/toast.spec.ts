import { expect, test } from '@playwright/test';
import type { Page } from '@playwright/test';

import { isMacOS } from '../host-platform.js';
import { storyUrl } from '../story-url.js';

/**
 * What a real engine adds here is everything `Toast` claims about the top layer, the corner it is
 * pinned to, and a pointer that really rests on something. None of it is observable in jsdom: it
 * lays out nothing and implements no popover, so the unit tests cover the queue and the timers and
 * stop there honestly.
 *
 * The modal-dialog block at the bottom is the record of ADR-0011 §3. It asserts a limitation
 * rather than a feature, which is the point — if an engine changes any of the three, this is where
 * it is noticed rather than in a consumer's application.
 */

const region = (page: Page) => page.getByRole('region', { name: 'Notifications' });

const toasts = (page: Page) => page.locator('[popover] li');

/** `goto` resolves on load and Storybook renders the story after that. */
const openStory = async (page: Page, id: string): Promise<void> => {
  await page.goto(storyUrl(id));
  await expect(region(page)).toBeAttached();
};

test('the region is in the top layer, and named, before anything is raised', async ({ page }) => {
  await openStory(page, 'components-toast--pauses-under-the-pointer');

  // A live region has to be there before its first message: it announces what changes inside it,
  // and one that arrives with its first toast announces nothing.
  await expect(toasts(page)).toHaveCount(0);

  const inTopLayer = await region(page).evaluate((node) => node.matches(':popover-open'));
  expect(inTopLayer).toBe(true);

  // The accessible name as the browser computes it, which the jsdom tests cannot ask for.
  await expect(region(page)).toHaveAttribute('aria-live', 'polite');
});

test('the stack sits in the bottom inline-end corner, newest nearest it', async ({ page }) => {
  await openStory(page, 'components-toast--tones');

  await expect(toasts(page)).toHaveCount(4);

  const viewport = page.viewportSize();
  const box = await region(page).boundingBox();

  expect(viewport).not.toBeNull();
  expect(box).not.toBeNull();

  const gap = 16;
  expect(Math.abs((viewport?.height ?? 0) - ((box?.y ?? 0) + (box?.height ?? 0)))).toBeLessThan(
    gap + 2
  );
  expect(Math.abs((viewport?.width ?? 0) - ((box?.x ?? 0) + (box?.width ?? 0)))).toBeLessThan(
    gap + 2
  );

  // The story raises success, info, warning and danger in that order, so the last one raised is
  // the one nearest the corner.
  const first = await toasts(page).first().boundingBox();
  const last = await toasts(page).last().boundingBox();

  expect(last?.y ?? 0).toBeGreaterThan(first?.y ?? 0);
  await expect(toasts(page).last()).toContainText('Save failed');
});

test('a pointer resting on the stack stops the timer, and leaving restarts it', async ({
  page,
}) => {
  await openStory(page, 'components-toast--pauses-under-the-pointer');

  await page.getByRole('button', { name: 'Save' }).click();
  await expect(toasts(page)).toHaveCount(1);

  await toasts(page).first().hover();

  // Well past the five seconds the toast was given. A dispatched `pointerenter` would prove
  // nothing here; a real pointer that is really over the element is the whole point of this file.
  await page.waitForTimeout(6000);
  await expect(toasts(page)).toHaveCount(1);

  await page.mouse.move(5, 5);
  await expect(toasts(page)).toHaveCount(0, { timeout: 7000 });
});

test('the close button is reachable by keyboard, and a real Enter dismisses', async ({
  page,
  browserName,
}) => {
  // Safari does not put buttons in the tab order unless the reader turns on "Press Tab to
  // highlight each item on a webpage", and Playwright's macOS WebKit inherits that default. It is
  // the platform's keyboard model rather than this library's markup — the button is a real
  // `<button>` and Enter dismisses everywhere — but the sentence in the test name is not true
  // there, so it is recorded as a failure rather than quietly passed.
  //
  // The Ubuntu build does put buttons in the tab order, which CI proved by failing with "Expected
  // to fail, but passed" when this condition was on the engine alone.
  test.fail(
    browserName === 'webkit' && isMacOS,
    'macOS Safari omits buttons from the tab order by default'
  );

  await openStory(page, 'components-toast--long-message');

  await expect(toasts(page)).toHaveCount(1);

  const dismiss = page.getByRole('button', { name: 'Dismiss' });

  // From the last control of the page rather than from wherever the story's `play` left focus:
  // what is being asserted is that the region is in the tab order after the page, which is what
  // ADR-0011 §6 accepts instead of claiming a hotkey from every application that embeds this.
  await page.getByRole('button', { name: 'Save' }).focus();

  await page.keyboard.press('Tab');
  await expect(dismiss).toBeFocused();

  await page.keyboard.press('Enter');

  await expect(toasts(page)).toHaveCount(0);
});

test.describe('over a modal dialog', () => {
  // ADR-0011 §3, asserted rather than remembered. The story opens the dialog and raises a toast
  // from inside it, which is the situation the rule exists for: a save failing while a modal is
  // open.
  const open = async (page: Page): Promise<void> => {
    await page.goto(storyUrl('components-toast--over-a-modal-dialog'));
    await expect(toasts(page)).toHaveCount(1);
  };

  test('showModal() does not close the popover', async ({ page }) => {
    await open(page);

    const bothOpen = await page.evaluate(() => ({
      dialog: document.querySelector('dialog')?.matches(':modal') ?? false,
      toasts: document.querySelector('[popover]')?.matches(':popover-open') ?? false,
    }));

    expect(bothOpen).toEqual({ dialog: true, toasts: true });
  });

  test('but the toast cannot be clicked, because a modal is modal', async ({ page }) => {
    await open(page);

    const box = await toasts(page).first().boundingBox();
    expect(box).not.toBeNull();

    const covering = await page.evaluate(
      ([x, y]) =>
        document
          .elementsFromPoint(x ?? 0, y ?? 0)
          .map((node) => node.tagName.toLowerCase())
          .slice(0, 1),
      [(box?.x ?? 0) + (box?.width ?? 0) / 2, (box?.y ?? 0) + (box?.height ?? 0) / 2]
    );

    // Everything outside a modal dialog is blocked by it, the toast included. This is the platform
    // being consistent, not a defect to work around: the toast is seen and announced, and it goes
    // away on its own timer rather than by the reader's hand.
    expect(covering).toEqual(['dialog']);
  });
});

test.describe('forced colors', () => {
  // `contextOptions` replaces the object in `playwright.config.ts` rather than merging into it, so
  // the two settings that apply everywhere else are repeated here on purpose.
  test.use({
    contextOptions: { reducedMotion: 'reduce', colorScheme: 'light', forcedColors: 'active' },
  });

  test('a toast keeps a visible edge', async ({ page }) => {
    await openStory(page, 'components-toast--tones');

    const active = await page.evaluate(() => matchMedia('(forced-colors: active)').matches);
    expect(active, 'forced-colors emulation is not in effect').toBe(true);

    // Neither the tint nor the shadow is painted in this mode, so the border is the only thing
    // separating a toast from the content it floats over.
    const border = await toasts(page)
      .first()
      .evaluate((node) => getComputedStyle(node).borderTopWidth);

    expect(border).not.toBe('0px');
  });
});
