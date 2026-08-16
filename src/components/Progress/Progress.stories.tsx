import type { Meta, StoryObj } from '@storybook/react-vite';
import type { CSSProperties, ReactElement } from 'react';
import { expect, waitFor, within } from 'storybook/test';

import { Progress } from './Progress.js';

const meta = {
  title: 'Components/Progress',
  component: Progress,
  args: { label: 'Uploading files', value: 60 },
} satisfies Meta<typeof Progress>;

export default meta;

type Story = StoryObj<typeof meta>;

const column: CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: 'var(--kreo-space-4)',
  inlineSize: 320,
};

const caption: CSSProperties = {
  font: 'var(--kreo-type-body)',
  color: 'var(--kreo-text-muted)',
  marginBlockEnd: 'var(--kreo-space-2)',
};

/** The bar fills the width it is given; the label is heard, not seen. */
export const Default: Story = {
  render: (args): ReactElement => (
    <div style={{ inlineSize: 320 }}>
      <Progress {...args} />
    </div>
  ),
};

/** Empty, part way and complete — the three points where the geometry can go wrong. */
export const States: Story = {
  render: (args): ReactElement => (
    <div style={column}>
      <Progress {...args} label="Nothing yet" value={0} />
      <Progress {...args} label="Uploading files" value={40} />
      <Progress {...args} label="Finished" value={100} />
      <Progress {...args} label="Publishing" value={undefined} />
    </div>
  ),
};

/**
 * Without a `value` the bar is indeterminate: a segment travelling the track, and no
 * `aria-valuenow`, so nothing announces a percentage that was never measured. Under
 * `prefers-reduced-motion` the segment stops in the middle of the track and stays there.
 */
export const Indeterminate: Story = {
  args: { label: 'Publishing the workspace', value: undefined },
  render: (args): ReactElement => (
    <div style={{ inlineSize: 320 }}>
      <Progress {...args} />
    </div>
  ),
  play: async ({ canvasElement }) => {
    const bar = within(canvasElement).getByRole('progressbar');

    await waitFor(() => expect(bar).not.toHaveAttribute('aria-valuenow'));
  },
};

/** `max` is the value that counts as complete, so a count of steps needs no arithmetic. */
export const StepsRatherThanPercent: Story = {
  args: { label: 'Importing repositories', value: 3, max: 7 },
  render: (args): ReactElement => (
    <div style={{ inlineSize: 320 }}>
      <p style={caption}>Importing repositories — 3 of 7</p>
      <Progress {...args} />
    </div>
  ),
  play: async ({ canvasElement }) => {
    const bar = within(canvasElement).getByRole('progressbar');

    // Layout, so it belongs here rather than in the jsdom tests: 3 of 7 has to be drawn as 3 of 7.
    const shareOfTrack = (): number => {
      const track = bar.getBoundingClientRect().width;

      return (bar.firstElementChild?.getBoundingClientRect().width ?? 0) / track;
    };

    await waitFor(() => expect(shareOfTrack()).toBeGreaterThan(0.38));
    await waitFor(() => expect(shareOfTrack()).toBeLessThan(0.46));
  },
};

/**
 * The bar says how much; the words say what of. Nothing here draws the number, because only the
 * consumer knows whether "3 of 7 files" or "42%" is the honest way to put it.
 */
export const WithVisibleText: Story = {
  render: (args): ReactElement => (
    <div style={{ inlineSize: 320 }}>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          font: 'var(--kreo-type-body)',
          color: 'var(--kreo-text-body)',
          marginBlockEnd: 'var(--kreo-space-2)',
        }}
      >
        <span>Uploading files</span>
        <span style={{ fontVariantNumeric: 'var(--kreo-numeric-tabular)' }}>60%</span>
      </div>
      <Progress {...args} />
    </div>
  ),
};

/** In a narrow column the track shortens rather than overflowing, and the fill follows it. */
export const NarrowContainer: Story = {
  render: (args): ReactElement => (
    <div style={{ inlineSize: 120 }}>
      <Progress {...args} value={70} />
    </div>
  ),
  play: async ({ canvasElement }) => {
    const bar = within(canvasElement).getByRole('progressbar');

    await waitFor(() => expect(bar.getBoundingClientRect().width).toBeLessThanOrEqual(120));
  },
};
