import { expect, test } from '@playwright/test';
import type { Page } from '@playwright/test';

/**
 * The workbench, driven the way its two claims are stated: operated from the keyboard alone, and
 * laid out at 375px without pushing the page sideways.
 *
 * Both are claims a document can make and nothing can check, which is why they are here. The run
 * compares nothing against a baseline — no screenshots, no computed colours — so unlike
 * `check:visual` nothing about it is platform-specific and it is a CI gate.
 *
 * It is served from `examples/workbench/dist` on port 6008, built against the packed package by
 * `scripts/check-workbench.mjs`. Run it through `npm run check:workbench` rather than directly:
 * the server entry in `playwright.config.ts` appears only once that build exists.
 */

/** What the workbench opens on, so every test starts from the same tab. */
const openConsole = async (page: Page): Promise<void> => {
  await page.goto('/');
  await expect(page.getByRole('tab', { name: 'Settings' })).toHaveAttribute(
    'aria-selected',
    'true'
  );
};

test.describe('keyboard-only operation', () => {
  test('Tab walks the shell into the navigation, and arrows switch tabs', async ({ page }) => {
    await openConsole(page);

    // The header, in order, and then the tab list. Asserted as a sequence rather than as "the
    // navigation is reachable eventually": a control that has drifted into the middle of the
    // header is a defect a bounded search would hide.
    await page.keyboard.press('Tab');
    await expect(page.getByLabel('Theme')).toBeFocused();

    await page.keyboard.press('Tab');
    await expect(page.getByRole('button', { name: 'About Devkit Console' })).toBeFocused();

    await page.keyboard.press('Tab');
    await expect(page.getByRole('tab', { name: 'Settings' })).toBeFocused();

    // One stop for the whole tab list — the roving tabindex — with the arrows moving inside it.
    await page.keyboard.press('ArrowRight');
    await expect(page.getByRole('tab', { name: 'Diagnostics' })).toHaveAttribute(
      'aria-selected',
      'true'
    );
    await expect(page.getByRole('tabpanel')).toContainText('Checks passing');

    await page.keyboard.press('ArrowLeft');
    await expect(page.getByRole('tab', { name: 'Settings' })).toHaveAttribute(
      'aria-selected',
      'true'
    );
  });

  test('Tab continues from the tab list into the form and reaches Save', async ({ page }) => {
    await openConsole(page);

    await page.getByRole('tab', { name: 'Settings' }).focus();

    const save = page.getByRole('button', { name: 'Save settings' });

    // Bounded rather than counted: the number of fields between the tab list and Save is a detail
    // of the form, and a test that pinned it would fail on every field added. What matters is that
    // Save is reachable without a pointer, and that the walk ends rather than leaving the page.
    let reached = false;

    for (let press = 0; press < 25 && !reached; press += 1) {
      await page.keyboard.press('Tab');
      reached = await save.evaluate((node) => node === document.activeElement);
    }

    expect(reached, 'Tab never reached the save button').toBe(true);

    await page.keyboard.press('Enter');

    // The save is a real submit, and the toast is the library's, raised from the host's handler.
    // The toast region is `role="region"` with `aria-live="polite"`, so it is addressed by its
    // text rather than by a status role.
    await expect(page.getByText('Settings saved')).toBeVisible();
  });
});

test.describe('the unsaved-changes guard', () => {
  /** Types into the first field with real key presses, leaving the draft different from the save. */
  const editProjectName = async (page: Page): Promise<void> => {
    await page.getByLabel('Project name').focus();
    await page.keyboard.press('End');
    await page.keyboard.type(' 2');

    // Scoped to the panel: the guard dialog's heading says the same words, deliberately, and an
    // unscoped locator would match both the moment it opens.
    await expect(page.getByRole('tabpanel').getByText('Unsaved changes')).toBeVisible();
  };

  test('leaving the tab opens the dialog, and Escape returns focus to the tab', async ({
    page,
  }) => {
    await openConsole(page);
    await editProjectName(page);

    await page.getByRole('tab', { name: 'Settings' }).focus();
    await page.keyboard.press('ArrowRight');

    const dialog = page.getByRole('dialog');
    await expect(dialog).toBeVisible();
    await expect(dialog).toContainText('Leaving the tab now throws the edits away');

    // The tab change was refused, not merely questioned: `Tabs` is controlled here, so the
    // selection is still where the reader left it while the dialog is up.
    await expect(page.getByRole('tab', { name: 'Settings' })).toHaveAttribute(
      'aria-selected',
      'true'
    );

    await page.keyboard.press('Escape');

    await expect(page.getByRole('dialog')).toHaveCount(0);

    // `<dialog>` returns focus to whatever had it when the modal opened, which is the tab the
    // arrow had just moved to. Nobody is dropped at the top of the page.
    await expect(page.getByRole('tab', { name: 'Diagnostics' })).toBeFocused();
  });

  test('discarding lets the tab change through and puts the field back', async ({ page }) => {
    await openConsole(page);
    await editProjectName(page);

    await page.getByRole('tab', { name: 'Settings' }).focus();
    await page.keyboard.press('ArrowRight');

    await page.getByRole('button', { name: 'Discard the changes' }).press('Enter');

    await expect(page.getByRole('dialog')).toHaveCount(0);
    await expect(page.getByRole('tab', { name: 'Diagnostics' })).toHaveAttribute(
      'aria-selected',
      'true'
    );

    await page.getByRole('tab', { name: 'Settings' }).click();
    await expect(page.getByLabel('Project name')).toHaveValue('Atlas');
  });
});

/**
 * The theme is the host's half of the library's one theming contract: `@kreobuddha/ui` reads the
 * attribute and stores nothing, so the workbench is what has to set it and remember it.
 */
test('the chosen theme is applied to the document and survives a reload', async ({ page }) => {
  await openConsole(page);

  await page.getByLabel('Theme').selectOption('dark');
  await expect(page.locator('html')).toHaveAttribute('data-kreo-theme', 'dark');

  await page.reload();

  await expect(page.locator('html')).toHaveAttribute('data-kreo-theme', 'dark');
  await expect(page.getByLabel('Theme')).toHaveValue('dark');

  await page.getByLabel('Theme').selectOption('light');
  await expect(page.locator('html')).not.toHaveAttribute('data-kreo-theme', /.*/);
});

test.describe('a 375px viewport', () => {
  test.use({ viewport: { width: 375, height: 800 } });

  /** Nothing on the page may be wider than the page. */
  const expectNoHorizontalOverflow = async (page: Page): Promise<void> => {
    const overflow = await page.evaluate(() => {
      const root = document.documentElement;
      return { scrollWidth: root.scrollWidth, clientWidth: root.clientWidth };
    });

    expect(
      overflow.scrollWidth,
      `the document scrolls sideways: ${overflow.scrollWidth} > ${overflow.clientWidth}`
    ).toBeLessThanOrEqual(overflow.clientWidth);
  };

  test('the shell fits, and its controls stay reachable', async ({ page }) => {
    await openConsole(page);

    await expectNoHorizontalOverflow(page);

    // Reachable means on the page and operable, not merely present in the DOM.
    for (const control of [
      page.getByLabel('Theme'),
      page.getByRole('button', { name: 'About Devkit Console' }),
      page.getByRole('tab', { name: 'Settings' }),
      page.getByRole('button', { name: 'Save settings' }),
    ]) {
      await expect(control).toBeVisible();

      const box = await control.boundingBox();
      expect(box, 'the control has no box to be seen in').not.toBeNull();
      expect(box?.x ?? 0).toBeGreaterThanOrEqual(0);
      expect((box?.x ?? 0) + (box?.width ?? 0)).toBeLessThanOrEqual(375);
    }
  });

  test('the diagnostics list fits, long identifiers and all', async ({ page }) => {
    await openConsole(page);

    await page.getByRole('tab', { name: 'Diagnostics' }).click();
    await expect(page.getByRole('tabpanel')).toContainText('Checks passing');

    await expectNoHorizontalOverflow(page);
  });

  test('the activity list fits', async ({ page }) => {
    await openConsole(page);

    await page.getByRole('tab', { name: 'Activity' }).click();
    await expect(page.getByRole('tabpanel')).toContainText('entries shown');

    await expectNoHorizontalOverflow(page);
  });
});
