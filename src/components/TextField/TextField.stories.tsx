import type { Meta, StoryObj } from '@storybook/react-vite';
import type { ReactElement } from 'react';
import { expect, userEvent, within } from 'storybook/test';

import { textNodeControl } from '../../docs/storyControls.js';
import { TextField } from './TextField.js';

const meta = {
  title: 'Components/TextField',
  component: TextField,
  args: { label: 'Email' },
  // Typed `ReactNode` so a field can carry a link, but a line of text in almost every use.
  argTypes: {
    label: textNodeControl,
    hint: textNodeControl,
    error: textNodeControl,
    prefix: textNodeControl,
    suffix: textNodeControl,
  },
} satisfies Meta<typeof TextField>;

export default meta;

type Story = StoryObj<typeof meta>;

const column = {
  display: 'flex',
  flexDirection: 'column',
  gap: 'var(--kreo-space-4)',
  maxWidth: '320px',
} as const;

export const Default: Story = {
  args: { placeholder: 'you@example.com' },
};

/**
 * Heights match `Button` on the same scale, so a field and a button sit level side by side. Only
 * the box changes: the text is `--kreo-type-body` in all three, so a dense form and a roomy one
 * are the same form at different sizes rather than two different type treatments.
 */
export const Sizes: Story = {
  render: (args): ReactElement => (
    <div style={column}>
      <TextField {...args} size="sm" label="Small" />
      <TextField {...args} size="md" label="Medium" />
      <TextField {...args} size="lg" label="Large" />
    </div>
  ),
};

export const WithHint: Story = {
  args: { hint: 'We only use this to send receipts.' },
};

/** The error is what makes the field invalid; there is no separate flag to forget to set. */
export const Invalid: Story = {
  args: {
    defaultValue: 'not-an-address',
    error: 'Enter an email address, such as name@example.com.',
    hint: 'We only use this to send receipts.',
  },
  play: async ({ canvasElement }): Promise<void> => {
    const input = within(canvasElement).getByRole('textbox');

    // The error must be reachable from the input, not merely visible near it.
    await expect(input).toHaveAttribute('aria-invalid', 'true');

    const described = (input.getAttribute('aria-describedby') ?? '').split(' ');
    const first = canvasElement.ownerDocument.getElementById(described[0] ?? '');

    await expect(first).toHaveTextContent('Enter an email address, such as name@example.com.');
  },
};

export const Required: Story = {
  args: { required: true, hint: 'Needed before you can continue.' },
};

export const Disabled: Story = {
  args: { disabled: true, defaultValue: 'you@example.com' },
};

export const ReadOnly: Story = {
  args: { readOnly: true, defaultValue: 'you@example.com' },
};

/**
 * Slots sit at the edges inside the border, not against the value — the field would have to
 * measure the text to do that. Text in a slot is announced; hide a decorative mark yourself.
 */
export const WithSlots: Story = {
  render: (args): ReactElement => (
    <div style={column}>
      <TextField {...args} label="Amount" prefix="$" suffix="USD" defaultValue="1200" />
      <TextField {...args} label="Search" prefix="⌕" placeholder="Filter components" />
    </div>
  ),
};

/** Focus is drawn inside the box, so gaining it must not move anything. */
export const Focus: Story = {
  args: { placeholder: 'you@example.com' },
  play: async ({ canvasElement }): Promise<void> => {
    const input = within(canvasElement).getByRole('textbox');
    const shell = input.parentElement as HTMLElement;
    const before = shell.getBoundingClientRect();

    await userEvent.click(input);
    await expect(input).toHaveFocus();

    const after = shell.getBoundingClientRect();

    await expect(after.width).toBeCloseTo(before.width, 1);
    await expect(after.height).toBeCloseTo(before.height, 1);
  },
};

/** Clicking the padding near the edge is still a click on the input, without a click handler. */
export const EdgeClickFocuses: Story = {
  args: { placeholder: 'you@example.com', size: 'lg' },
  play: async ({ canvasElement }): Promise<void> => {
    const input = within(canvasElement).getByRole('textbox');
    const box = input.getBoundingClientRect();

    await userEvent.pointer({
      target: input,
      coords: { clientX: box.left + 3, clientY: box.top + box.height / 2 },
      keys: '[MouseLeft]',
    });

    await expect(input).toHaveFocus();
  },
};

/** A long value is scrolled by the input rather than allowed to widen the field. */
export const LongValue: Story = {
  render: (args): ReactElement => (
    <div style={{ ...column, maxWidth: '220px' }}>
      <TextField
        {...args}
        fullWidth
        label="Repository"
        defaultValue="git+https://github.com/kreobuddha/kreobuddha-ui.git"
        hint="A long value never widens the field; it scrolls inside it."
      />
    </div>
  ),
  play: async ({ canvasElement }): Promise<void> => {
    const input = within(canvasElement).getByRole('textbox');

    await expect(input.getBoundingClientRect().width).toBeLessThanOrEqual(220);
  },
};

export const FullWidth: Story = {
  args: { fullWidth: true, placeholder: 'you@example.com' },
  render: (args): ReactElement => (
    <div style={{ width: '480px' }}>
      <TextField {...args} />
    </div>
  ),
};
