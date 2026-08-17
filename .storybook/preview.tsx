import type { Decorator, Preview } from '@storybook/react-vite';

import { ThemedDocsContainer } from './ThemedDocsContainer';

import '../src/fonts.css';
import '../src/styles.css';

/**
 * The library ships no page styles, so the canvas supplies the surface and body type a real
 * application would provide. Dark mode is the documented DOM contract: an attribute on an
 * ancestor, with light needing no attribute at all.
 */
const withTheme: Decorator = (Story, context) => {
  const isDark = context.globals['theme'] === 'dark';

  return (
    <div
      data-kreo-theme={isDark ? 'dark' : undefined}
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
};

const preview: Preview = {
  decorators: [withTheme],
  // Every component gets a generated Docs page. The prop tables on it come from the types, so
  // they cannot drift the way a hand-written table does.
  tags: ['autodocs'],
  initialGlobals: {
    theme: 'light',
  },
  globalTypes: {
    theme: {
      description: 'Colour theme',
      toolbar: {
        title: 'Theme',
        icon: 'circlehollow',
        items: ['light', 'dark'],
        dynamicTitle: true,
      },
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
