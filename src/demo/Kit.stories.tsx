import type { Meta, StoryObj } from '@storybook/react-vite';
import type { CSSProperties, ReactElement, ReactNode } from 'react';

import { Button } from '../components/Button/Button.js';

/**
 * A single page showing everything the library currently ships, so progress is visible in one
 * place instead of one story at a time. It grows as components land. Use the Theme control in
 * the toolbar to check both themes.
 */

const page: CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: 'var(--kreo-space-8)',
  maxWidth: 720,
};

const sectionStyle: CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: 'var(--kreo-space-4)',
};

const eyebrow: CSSProperties = {
  font: 'var(--kreo-type-label)',
  letterSpacing: 'var(--kreo-tracking-label)',
  textTransform: 'uppercase',
  color: 'var(--kreo-text-subtle)',
};

const row: CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: 'var(--kreo-space-3)',
  flexWrap: 'wrap',
};

const card: CSSProperties = {
  background: 'var(--kreo-surface-card)',
  border: '1px solid var(--kreo-border-default)',
  borderRadius: 'var(--kreo-radius-lg)',
  padding: 'var(--kreo-space-6)',
  display: 'flex',
  flexDirection: 'column',
  gap: 'var(--kreo-space-4)',
};

interface SectionProps {
  title: string;
  children: ReactNode;
}

const Section = ({ title, children }: SectionProps): ReactElement => (
  <section style={sectionStyle}>
    <span style={eyebrow}>{title}</span>
    <div style={card}>{children}</div>
  </section>
);

const PlusMark = (): ReactElement => (
  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
    <path d="M7 2v10M2 7h10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
  </svg>
);

const ArrowMark = (): ReactElement => (
  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
    <path
      d="M2 7h10M8 3l4 4-4 4"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const meta = {
  title: 'Overview/Kit',
  parameters: {
    controls: { disable: true },
  },
} satisfies Meta;

export default meta;

type Story = StoryObj<typeof meta>;

export const Kit: Story = {
  render: (): ReactElement => (
    <div style={page}>
      <Section title="Type roles">
        <div style={{ font: 'var(--kreo-type-title)', color: 'var(--kreo-text-primary)' }}>
          Workspace settings
        </div>
        <div style={{ font: 'var(--kreo-type-heading)', color: 'var(--kreo-text-primary)' }}>
          Members and access
        </div>
        <p style={{ font: 'var(--kreo-type-body)', color: 'var(--kreo-text-body)', margin: 0 }}>
          Body copy sits at 14px with generous leading. Invitations go out when you finish setup.
        </p>
        <div style={{ font: 'var(--kreo-type-data)', color: 'var(--kreo-text-muted)' }}>
          3 sent · Step 2 / 4 · 128 ms
        </div>
      </Section>

      <Section title="Cyrillic coverage">
        <p style={{ font: 'var(--kreo-type-body)', color: 'var(--kreo-text-body)', margin: 0 }}>
          Съешь ещё этих мягких французских булок, да выпей чаю. Both families cover Cyrillic, so
          mixed text keeps one drawing.
        </p>
        <div style={{ font: 'var(--kreo-type-data)', color: 'var(--kreo-text-muted)' }}>
          Отправлено: 3 · Шаг 2 / 4
        </div>
      </Section>

      <Section title="Button — variants">
        <div style={row}>
          <Button variant="filled">Finish setup</Button>
          <Button variant="outlined">Back</Button>
          <Button variant="ghost">Skip for now</Button>
        </div>
      </Section>

      <Section title="Button — sizes">
        <div style={row}>
          <Button size="sm">Small</Button>
          <Button size="md">Medium</Button>
          <Button size="lg">Large</Button>
        </div>
      </Section>

      <Section title="Button — icons and states">
        <div style={row}>
          <Button icon={<PlusMark />}>Add member</Button>
          <Button iconEnd={<ArrowMark />}>Continue</Button>
          <Button loading>Save changes</Button>
          <Button disabled>Disabled</Button>
        </div>
      </Section>

      <Section title="Button — danger">
        <div style={row}>
          <Button danger>Delete workspace</Button>
          <Button danger variant="outlined">
            Delete workspace
          </Button>
          <Button danger variant="ghost">
            Delete workspace
          </Button>
        </div>
      </Section>

      <Section title="Button — long labels in a narrow column">
        <div style={{ display: 'flex', gap: 'var(--kreo-space-4)', alignItems: 'flex-start' }}>
          <div style={{ width: 200 }}>
            <Button fullWidth>Continue to workspace configuration</Button>
          </div>
          <div style={{ width: 200 }}>
            <Button fullWidth textWrap>
              Continue to workspace configuration
            </Button>
          </div>
        </div>
      </Section>
    </div>
  ),
};
