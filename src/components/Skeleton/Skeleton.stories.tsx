import type { Meta, StoryObj } from '@storybook/react-vite';
import type { CSSProperties, ReactElement } from 'react';
import { expect, waitFor } from 'storybook/test';

import { Skeleton } from './Skeleton.js';

const meta = {
  title: 'Components/Skeleton',
  component: Skeleton,
} satisfies Meta<typeof Skeleton>;

export default meta;

type Story = StoryObj<typeof meta>;

const stack: CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: 'var(--kreo-space-2)',
};

const card: CSSProperties = {
  background: 'var(--kreo-surface-card)',
  border: 'var(--kreo-border-w) solid var(--kreo-border-default)',
  borderRadius: 'var(--kreo-radius-lg)',
  padding: 'var(--kreo-space-4)',
  width: 320,
};

/** One line of text at the surrounding size, filling the width it is given. */
export const Default: Story = {
  render: (args): ReactElement => (
    <div style={{ width: 280 }}>
      <Skeleton {...args} />
    </div>
  ),
};

/**
 * A paragraph is several lines with the last one short — the shape of text, not a grey brick.
 * Widths are the consumer's, because only the consumer knows what is loading.
 */
export const TextLines: Story = {
  render: (args): ReactElement => (
    <div style={{ ...stack, width: 320 }}>
      <Skeleton {...args} />
      <Skeleton {...args} />
      <Skeleton {...args} style={{ width: '60%' }} />
    </div>
  ),
};

/**
 * Any other shape is CSS the consumer already knows: a circle is a border radius, a heading is a
 * taller box, a button-sized block is a control height.
 */
export const Shapes: Story = {
  render: (args): ReactElement => (
    <div style={{ display: 'flex', gap: 'var(--kreo-space-4)', alignItems: 'center' }}>
      <Skeleton
        {...args}
        style={{ width: 40, height: 40, borderRadius: 'var(--kreo-radius-full)' }}
      />
      <Skeleton {...args} style={{ width: 160, height: 'var(--kreo-text-24)' }} />
      <Skeleton
        {...args}
        style={{
          width: 120,
          height: 'var(--kreo-control-h-md)',
          borderRadius: 'var(--kreo-radius-md)',
        }}
      />
    </div>
  ),
};

/** The shape a card takes while its content is on the way: an avatar, a name, and two lines. */
export const CardPlaceholder: Story = {
  render: (args): ReactElement => (
    <div style={card}>
      <div style={{ display: 'flex', gap: 'var(--kreo-space-3)', alignItems: 'center' }}>
        <Skeleton
          {...args}
          style={{ width: 40, height: 40, borderRadius: 'var(--kreo-radius-full)', flex: 'none' }}
        />
        <div style={{ ...stack, flex: 1 }}>
          <Skeleton {...args} style={{ width: '55%' }} />
          <Skeleton {...args} style={{ width: '35%' }} />
        </div>
      </div>

      <div style={{ ...stack, marginTop: 'var(--kreo-space-4)' }}>
        <Skeleton {...args} />
        <Skeleton {...args} />
        <Skeleton {...args} style={{ width: '40%' }} />
      </div>
    </div>
  ),
};

/**
 * Height follows the type it stands in — `1em`, not a fixed pixel value — so a line of a large
 * heading and a line of body text are placeholders of different heights without a prop.
 */
export const FollowsTheTypeSize: Story = {
  render: (args): ReactElement => (
    <div style={{ ...stack, width: 320 }}>
      <div style={{ font: 'var(--kreo-type-title)' }}>
        <Skeleton {...args} style={{ width: '70%' }} />
      </div>
      <div style={{ font: 'var(--kreo-type-body)' }}>
        <Skeleton {...args} />
      </div>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const [heading, body] = [...canvasElement.querySelectorAll('span')];

    // Layout, so it belongs here rather than in the jsdom tests: the two placeholders inherit
    // different font sizes and must end up different heights.
    await waitFor(() =>
      expect(heading?.getBoundingClientRect().height).toBeGreaterThan(
        body?.getBoundingClientRect().height ?? 0
      )
    );
  },
};

/** In a narrow column the default width resolves against the container rather than overflowing. */
export const NarrowContainer: Story = {
  render: (args): ReactElement => (
    <div style={{ ...stack, width: 120, border: '1px dashed var(--kreo-border-default)' }}>
      <Skeleton {...args} />
      <Skeleton {...args} />
    </div>
  ),
  play: async ({ canvasElement }) => {
    const container = canvasElement.querySelector('div');
    const line = canvasElement.querySelector('span');

    await waitFor(() =>
      expect(line?.getBoundingClientRect().width).toBeLessThanOrEqual(
        container?.getBoundingClientRect().width ?? 0
      )
    );
  },
};
