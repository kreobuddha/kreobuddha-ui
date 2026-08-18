import type { Decorator, Preview } from '@storybook/react-vite';

import { ThemedDocsContainer } from './ThemedDocsContainer';
// Imported for its side effect: it puts `data-kreo-theme` on the preview document and keeps it
// there. Nothing below reads the theme any more — see `.storybook/theme.ts` for why that matters.
import './theme';

import '../src/fonts.css';
import '../src/styles.css';
import './preview.css';

/**
 * The library ships no page styles, so the canvas supplies the surface and body type a real
 * application would provide. The surface stays here — as an opaque layer, which is also what keeps
 * text antialiasing identical to the visual baselines — but the theme *attribute* does not: it
 * lives on the preview document, so a documentation page keeps its colour through the rebuild
 * Storybook performs on every globals change.
 */
const withTheme: Decorator = (Story) => (
  <div
    style={{
      background: 'var(--kreo-surface-page)',
      color: 'var(--kreo-text-body)',
      font: 'var(--kreo-type-body)',
      padding: 'var(--kreo-space-6)',
    }}
  >
    <Story />
  </div>
);

const preview: Preview = {
  decorators: [withTheme],
  // Every component gets a generated Docs page. The prop tables on it come from the types, so
  // they cannot drift the way a hand-written table does.
  tags: ['autodocs'],
  initialGlobals: {
    theme: 'light',
  },
  globalTypes: {
    // Declared, but with no `toolbar`: `.storybook/manager.tsx` draws the control instead, as a
    // switch rather than a two-item dropdown. A `toolbar` here would put a second one beside it.
    theme: {
      description: 'Colour theme',
    },
  },
  parameters: {
    controls: { expanded: true },
    docs: { container: ThemedDocsContainer },
    options: {
      // Alphabetical order would open the site on `Components/Accordion`. A reader arriving for
      // the first time should get the introduction, then how to install it, then the foundations.
      storySort: {
        order: [
          'Introduction',
          'Installation',
          'Foundations',
          [
            'Theming',
            'Colour tokens',
            'Typography',
            'Spacing and shape',
            'Motion',
            'Accessibility',
            'Composition',
          ],
          'Overview',
          'Components',
        ],
      },
    },
    // Every story is scanned by axe when the story tests run, and a violation fails the build.
    a11y: { test: 'error' },
  },
};

export default preview;
