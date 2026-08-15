// Writes the four files a component needs, with the skeleton already in place.
//
// Boilerplate generated here costs nothing; the same boilerplate typed out by hand costs time and
// context every single time. What it cannot do is decide anything — the generated component is a
// starting point that compiles and passes, not a design.
//
// Usage: npm run new:component Alert

import { mkdir, writeFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import process from 'node:process';

const name = process.argv[2];

if (!name || !/^[A-Z][A-Za-z0-9]*$/.test(name)) {
  process.stdout.write('Usage: npm run new:component Name   (PascalCase)\n');
  process.exit(1);
}

const dir = `src/components/${name}`;

if (existsSync(dir)) {
  process.stdout.write(`${dir} already exists\n`);
  process.exit(1);
}

const component = `import type { ComponentPropsWithRef, ReactElement } from 'react';

import styles from './${name}.module.css';

export interface ${name}Props extends ComponentPropsWithRef<'div'> {
  /** Describe every prop. The doc comment is what Storybook shows in the controls table. */
  tone?: 'neutral' | 'accent';
}

const cx = (...values: Array<string | false | undefined>): string =>
  values.filter(Boolean).join(' ');

export const ${name} = ({
  tone = 'neutral',
  className,
  children,
  ...rest
}: ${name}Props): ReactElement => (
  <div {...rest} className={cx(styles.root, styles[tone], className)}>
    {children}
  </div>
);
`;

const styles = `/* Component styles depend on the token layer, and declaring that dependency in CSS rather than
   from TypeScript keeps the stylesheet out of the emitted declarations, where a \`.css\` specifier
   is not resolvable. Vite inlines this into the single published \`styles.css\`. */
@import '../../styles.css';

.root {
  font: var(--kreo-type-body);
  color: var(--kreo-text-body);
}

.neutral {
  background: var(--kreo-surface-card);
}

.accent {
  background: var(--kreo-surface-accent-soft);
}
`;

const stories = `import type { Meta, StoryObj } from '@storybook/react-vite';

import { ${name} } from './${name}.js';

const meta = {
  title: 'Components/${name}',
  component: ${name},
  args: { children: '${name}' },
} satisfies Meta<typeof ${name}>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};
`;

const test = `import { render, screen } from '@testing-library/react';
import { describe, expect, test } from 'vitest';

import { ${name} } from './${name}.js';

describe('semantics', () => {
  test('renders its children', () => {
    render(<${name}>Content</${name}>);

    expect(screen.getByText('Content')).toBeDefined();
  });

  test('passes className and native props through to the root element', () => {
    render(
      <${name} className="custom" data-testid="probe">
        Content
      </${name}>
    );

    const root = screen.getByTestId('probe');
    expect(root.classList.contains('custom')).toBe(true);
  });
});
`;

await mkdir(dir, { recursive: true });

await Promise.all([
  writeFile(`${dir}/${name}.tsx`, component),
  writeFile(`${dir}/${name}.module.css`, styles),
  writeFile(`${dir}/${name}.stories.tsx`, stories),
  writeFile(`${dir}/${name}.test.tsx`, test),
]);

process.stdout.write(
  `Created ${dir} with four files.\n\n` +
    `Next, from docs/COMPONENT_RECIPE.md:\n` +
    `  1. export ${name} from src/index.ts\n` +
    `  2. add its contrast pairs to scripts/check-contrast.mjs\n` +
    `  3. update README.md, CHANGELOG.md and docs/ROADMAP.md\n` +
    `  4. npm run test:one -- ${name}\n`
);
