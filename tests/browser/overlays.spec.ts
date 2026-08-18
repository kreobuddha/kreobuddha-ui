import { expect, test } from '@playwright/test';
import type { Page } from '@playwright/test';

import { storyUrl } from '../story-url.js';

/**
 * Overlay behaviour that belongs to the browser rather than to the DOM.
 *
 * The story runner in `vitest.config.ts` dispatches synthetic events: it computes the tab order in
 * JavaScript and fires keys from JavaScript. Neither the modal focus trap nor `Escape` on a
 * `<dialog>` works that way — both are the engine reacting to real input — so the stories can only
 * record that they were not asserted, which is what the note in `Dialog.stories.tsx` does. This
 * file sends real presses to a real engine, and it is what ADR-0010's outstanding table was
 * waiting for.
 *
 * Chromium only, like every other automated check here. That is a stated boundary rather than an
 * implied one; ADR-0010 records the one-off cross-engine run separately.
 */

/** The only `Dialog` story opened by a real trigger, so focus has somewhere to return to. */
const DIALOG_STORY = 'components-dialog--focus-returns-to-the-trigger';

/** Its `play` focuses the trigger, which is what opens the tooltip. */
const TOOLTIP_STORY = 'components-tooltip--long-content';

/**
 * A story's `play` function runs on mount, and both stories used here have one. Waiting for the
 * state it ends in is what keeps this file from racing it — the alternative, a fixed delay, is the
 * kind of flake that gets a check disabled.
 */
const openDialogFromTrigger = async (page: Page): Promise<void> => {
  await page.goto(storyUrl(DIALOG_STORY));

  const trigger = page.getByRole('button', { name: 'Delete workspace' });

  // The story opens the dialog and closes it again, ending with focus back on the trigger.
  await expect(trigger).toBeFocused();

  await trigger.click();
  await expect(page.getByRole('dialog')).toBeVisible();
};

test.describe('Dialog', () => {
  test('Escape closes it and focus returns to the trigger', async ({ page, browserName }) => {
    // The cross-engine difference ADR-0010 states rather than works around: WebKit does not
    // restore focus to the invoker when a modal `<dialog>` closes, and everything up to that point
    // in this test passes there. Recorded as an expected failure rather than skipped, so the run
    // fails on the day WebKit starts restoring focus and this note stops being true.
    test.fail(browserName === 'webkit', 'WebKit does not return focus to the dialog trigger');

    await openDialogFromTrigger(page);

    await page.keyboard.press('Escape');

    // Closed: the element stays mounted without `open`, which takes it out of the accessibility
    // tree, so the role resolves to nothing.
    await expect(page.getByRole('dialog')).toHaveCount(0);
    await expect(page.getByRole('button', { name: 'Delete workspace' })).toBeFocused();
  });

  test('Tab never reaches the page behind', async ({ page }) => {
    await openDialogFromTrigger(page);

    // Where focus is, in the only three terms that matter here.
    //
    // `none` is the wrap point and is not a defect: after the last control in the panel, Chromium
    // moves focus off the document entirely — to the browser's own UI in a headed window, and to
    // the document body in a headless one, where `document.activeElement` falls back to `<body>`.
    // Nothing in the page is focused at that moment, and the next press comes back into the panel.
    // Only `outside` would mean the trap had failed.
    const whereIsFocus = (): Promise<'inside' | 'outside' | 'none'> =>
      page.evaluate(() => {
        const active = document.activeElement;

        if (!active || active === document.body || active === document.documentElement) {
          return 'none' as const;
        }

        return active.closest('dialog[open]') ? ('inside' as const) : ('outside' as const);
      });

    // Six presses against three focusable controls, so the cycle is walked twice: a trap that held
    // for one lap and let go on the next would show here and nowhere else.
    const trail: string[] = [];

    for (let press = 0; press < 6; press += 1) {
      await page.keyboard.press('Tab');
      trail.push(await whereIsFocus());
    }

    expect(trail, 'focus reached the page behind the dialog').not.toContain('outside');
    expect(trail, 'focus never entered the panel at all').toContain('inside');
  });

  /**
   * The other half of "the page behind is not reachable", and the half `Tab` cannot show: the
   * modal makes the rest of the document inert, so even a script cannot put focus on the trigger.
   */
  test('the trigger cannot be focused while the dialog is open', async ({ page }) => {
    await openDialogFromTrigger(page);

    const focused = await page.evaluate(() => {
      const trigger = [...document.querySelectorAll('button')].find(
        (button) => button.textContent?.trim() === 'Delete workspace' && !button.closest('dialog')
      );

      trigger?.focus();

      return {
        found: Boolean(trigger),
        onTrigger: document.activeElement === trigger,
        inDialog: Boolean(document.activeElement?.closest('dialog[open]')),
      };
    });

    expect(focused.found).toBe(true);
    expect(focused.onTrigger).toBe(false);
    expect(focused.inDialog).toBe(true);
  });
});

test.describe('Tooltip', () => {
  test('Escape closes it without moving focus', async ({ page }) => {
    await page.goto(storyUrl(TOOLTIP_STORY));

    const trigger = page.getByRole('button', { name: 'Copy link' });
    const tip = page.locator('[role="tooltip"]');

    await expect(tip).toHaveAttribute('data-open');
    await expect(trigger).toBeFocused();

    await page.keyboard.press('Escape');

    await expect(tip).not.toHaveAttribute('data-open');

    // The reader is still on the control they were reading about. Moving them off it would be a
    // worse outcome than leaving the tooltip open.
    await expect(trigger).toBeFocused();
  });
});

/**
 * ADR-0007 required a border on overlays *in addition to* the shadow, and ADR-0010 put that into
 * effect: forced-colors mode paints no shadow at all, so a panel resting on one alone loses its
 * edge against whatever is behind it.
 *
 * The assertions are on computed style rather than on a screenshot, deliberately. The forced-colors
 * palette comes from the operating system, so a baseline taken on macOS would not match one taken
 * on Ubuntu — which is the exact trap that keeps `check:visual` out of CI. A border width is the
 * same number everywhere.
 */
test.describe('forced colors', () => {
  // `contextOptions` replaces the object in `playwright.config.ts` rather than merging into it, so
  // the two settings that apply everywhere else are repeated here on purpose.
  test.use({
    contextOptions: { reducedMotion: 'reduce', colorScheme: 'light', forcedColors: 'active' },
  });

  /** Without this the assertions below would pass in ordinary mode and prove nothing. */
  const expectForcedColors = async (page: Page): Promise<void> => {
    const active = await page.evaluate(() => matchMedia('(forced-colors: active)').matches);
    expect(active, 'forced-colors emulation is not in effect').toBe(true);
  };

  test('the Dialog panel keeps a visible edge', async ({ page }) => {
    await page.goto(storyUrl('components-dialog--default'));
    await expectForcedColors(page);

    const dialog = page.getByRole('dialog');
    await expect(dialog).toBeVisible();

    // The panel is the dialog's only child; its class name is a hashed implementation detail.
    const panel = dialog.locator('div').first();
    await expect(panel).toBeVisible();

    const border = await panel.evaluate((node) => getComputedStyle(node).borderTopWidth);
    expect(border).not.toBe('0px');
  });

  test('the Tooltip bubble keeps a visible edge', async ({ page }) => {
    await page.goto(storyUrl(TOOLTIP_STORY));
    await expectForcedColors(page);

    const tip = page.locator('[role="tooltip"]');
    await expect(tip).toHaveAttribute('data-open');
    await expect(tip).toBeVisible();

    const border = await tip.evaluate((node) => getComputedStyle(node).borderTopWidth);
    expect(border).not.toBe('0px');
  });
});
