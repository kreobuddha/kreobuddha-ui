import type { Meta, StoryObj } from '@storybook/react-vite';
import type { ReactElement } from 'react';

import { IconButton } from './IconButton.js';

/** A local mark, not an icon set. Icons are `ReactNode`, so consumers bring their own. */
const CloseMark = (): ReactElement => (
  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
    <path d="M3 3l8 8M11 3l-8 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
  </svg>
);

const meta = {
  title: 'Components/IconButton',
  component: IconButton,
  args: { label: 'Close', icon: <CloseMark /> },
} satisfies Meta<typeof IconButton>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Variants: Story = {
  render: (args): ReactElement => (
    <div style={{ display: 'flex', gap: 'var(--kreo-space-3)', alignItems: 'center' }}>
      <IconButton {...args} variant="filled" />
      <IconButton {...args} variant="outlined" />
      <IconButton {...args} variant="ghost" />
    </div>
  ),
};

/** `xs` is for marks that live inside another control — a clear button in a field. */
export const Sizes: Story = {
  render: (args): ReactElement => (
    <div style={{ display: 'flex', gap: 'var(--kreo-space-3)', alignItems: 'center' }}>
      <IconButton {...args} size="xs" />
      <IconButton {...args} size="sm" />
      <IconButton {...args} size="md" />
      <IconButton {...args} size="lg" />
    </div>
  ),
};

export const Danger: Story = {
  args: { label: 'Delete workspace' },
  render: (args): ReactElement => (
    <div style={{ display: 'flex', gap: 'var(--kreo-space-3)', alignItems: 'center' }}>
      <IconButton {...args} danger />
      <IconButton {...args} danger variant="outlined" />
      <IconButton {...args} danger variant="ghost" />
    </div>
  ),
};

/** Loading keeps the control's exact size: the mark fades and the spinner lies over it. */
export const Loading: Story = {
  args: { label: 'Removing member', loading: true },
  render: (args): ReactElement => (
    <div style={{ display: 'flex', gap: 'var(--kreo-space-3)', alignItems: 'center' }}>
      <IconButton {...args} />
      <IconButton {...args} variant="outlined" />
    </div>
  ),
};

export const Disabled: Story = {
  args: { disabled: true },
  render: (args): ReactElement => (
    <div style={{ display: 'flex', gap: 'var(--kreo-space-3)', alignItems: 'center' }}>
      <IconButton {...args} />
      <IconButton {...args} variant="outlined" />
      <IconButton {...args} variant="ghost" />
    </div>
  ),
};
