import { storybookTest } from '@storybook/addon-vitest/vitest-plugin';
import { playwright } from '@vitest/browser-playwright';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    projects: [
      // Behaviour and semantics, fast, no browser.
      {
        test: {
          name: 'unit',
          environment: 'jsdom',
          include: ['src/**/*.test.{ts,tsx}', 'tests/**/*.test.{ts,tsx}'],
          setupFiles: ['./tests/setup.ts'],
        },
      },
      // Every story runs in a real browser: its `play` function is executed and its rendered
      // output is scanned by axe. This is the layer jsdom cannot provide — real layout, real
      // painting, and therefore real colour contrast and focus behaviour.
      {
        plugins: [storybookTest({ configDir: '.storybook' })],
        test: {
          name: 'storybook',
          browser: {
            enabled: true,
            headless: true,
            provider: playwright(),
            instances: [{ browser: 'chromium' }],
          },
        },
      },
    ],
  },
});
