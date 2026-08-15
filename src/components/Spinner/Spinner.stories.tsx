import type { Meta, StoryObj } from '@storybook/react-vite';
import type { ReactElement } from 'react';
import { expect, waitFor, within } from 'storybook/test';

import { Button } from '../Button/Button.js';

import { Spinner } from './Spinner.js';

const meta = {
  title: 'Components/Spinner',
  component: Spinner,
} satisfies Meta<typeof Spinner>;

export default meta;

type Story = StoryObj<typeof meta>;

/** Decorative by default: no role, hidden from assistive technology. */
export const Default: Story = {};

export const Sizes: Story = {
  render: (args): ReactElement => (
    <div style={{ display: 'flex', gap: 'var(--kreo-space-4)', alignItems: 'center' }}>
      <Spinner {...args} size="sm" />
      <Spinner {...args} size="md" />
      <Spinner {...args} size="lg" />
    </div>
  ),
};

/**
 * A label turns the spinner into a status with that accessible name. Use it when the spinner is
 * the only sign that work is in progress.
 */
export const Labelled: Story = {
  args: { label: 'Loading members' },
  play: async ({ canvasElement }) => {
    const status = within(canvasElement).getByRole('status');

    await waitFor(() => expect(status).toHaveAccessibleName('Loading members'));
  },
};

/**
 * Beside text that already says what is happening, the spinner stays decorative — otherwise a
 * screen reader hears the same thing twice.
 */
export const BesideText: Story = {
  render: (args): ReactElement => (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 'var(--kreo-space-2)',
        font: 'var(--kreo-type-body)',
        color: 'var(--kreo-text-body)',
      }}
    >
      <Spinner {...args} size="sm" />
      Publishing the workspace…
    </span>
  ),
};

/** It takes its colour from the text around it, so it works on any surface. */
export const OnAccent: Story = {
  render: (args): ReactElement => (
    <div style={{ display: 'flex', gap: 'var(--kreo-space-3)', alignItems: 'center' }}>
      <Button loading>Save changes</Button>
      <span
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 'var(--kreo-space-2)',
          background: 'var(--kreo-accent-500)',
          color: 'var(--kreo-text-on-accent)',
          padding: 'var(--kreo-space-2) var(--kreo-space-3)',
          borderRadius: 'var(--kreo-radius-md)',
          font: 'var(--kreo-type-body)',
        }}
      >
        <Spinner {...args} size="sm" />
        On a filled surface
      </span>
    </div>
  ),
};
