import type { Meta, StoryObj } from '@storybook/react-vite';
import type { ReactElement } from 'react';
import { expect, userEvent, within } from 'storybook/test';

import { textNodeControl } from '../../docs/storyControls.js';
import { Textarea } from './Textarea.js';

const meta = {
  title: 'Components/Textarea',
  component: Textarea,
  args: { label: 'Release notes' },
  // Typed `ReactNode` so a field can carry a link, but a line of text in almost every use.
  argTypes: {
    label: textNodeControl,
    hint: textNodeControl,
    error: textNodeControl,
  },
} satisfies Meta<typeof Textarea>;

export default meta;

type Story = StoryObj<typeof meta>;

const column = {
  display: 'flex',
  flexDirection: 'column',
  gap: 'var(--kreo-space-4)',
  maxWidth: '360px',
} as const;

export const Default: Story = {
  args: { placeholder: 'What changed in this version?' },
};

export const Sizes: Story = {
  render: (args): ReactElement => (
    <div style={column}>
      <Textarea {...args} size="sm" label="Small" />
      <Textarea {...args} size="md" label="Medium" />
      <Textarea {...args} size="lg" label="Large" />
    </div>
  ),
};

/** `rows` sets the height. Nothing measures the text, so the box never moves on its own. */
export const Rows: Story = {
  render: (args): ReactElement => (
    <div style={column}>
      <Textarea {...args} rows={2} label="Two rows" />
      <Textarea {...args} rows={6} label="Six rows" />
    </div>
  ),
  play: async ({ canvasElement }): Promise<void> => {
    const [two, six] = within(canvasElement).getAllByRole('textbox');

    await expect((six as HTMLElement).getBoundingClientRect().height).toBeGreaterThan(
      (two as HTMLElement).getBoundingClientRect().height
    );
  },
};

export const WithHint: Story = {
  args: { hint: 'Markdown is supported.' },
};

/** The error is what makes the field invalid; there is no separate flag to forget to set. */
export const Invalid: Story = {
  args: {
    defaultValue: 'tbd',
    error: 'Describe the change in at least a sentence.',
    hint: 'Markdown is supported.',
  },
  play: async ({ canvasElement }): Promise<void> => {
    const control = within(canvasElement).getByRole('textbox');

    await expect(control).toHaveAttribute('aria-invalid', 'true');

    const described = (control.getAttribute('aria-describedby') ?? '').split(' ');
    const first = canvasElement.ownerDocument.getElementById(described[0] ?? '');

    await expect(first).toHaveTextContent('Describe the change in at least a sentence.');
  },
};

export const Required: Story = {
  args: { required: true, hint: 'Needed before the release can be cut.' },
};

export const Disabled: Story = {
  args: { disabled: true, defaultValue: 'Locked while the release is in flight.' },
};

export const ReadOnly: Story = {
  args: { readOnly: true, defaultValue: 'Published on 15 August.' },
};

/** `resize="none"` pins the box to exactly `rows`, for a layout that must not move. */
export const NoResize: Story = {
  args: { resize: 'none', rows: 4, placeholder: 'Fixed at four rows' },
  play: async ({ canvasElement }): Promise<void> => {
    const control = within(canvasElement).getByRole('textbox');

    await expect(getComputedStyle(control).resize).toBe('none');
  },
};

/** Dragging is offered vertically only — a wider box would break the form's column. */
export const ResizeIsVerticalOnly: Story = {
  play: async ({ canvasElement }): Promise<void> => {
    const control = within(canvasElement).getByRole('textbox');

    await expect(getComputedStyle(control).resize).toBe('vertical');
  },
};

/** Focus is drawn inside the box, so gaining it must not move anything. */
export const Focus: Story = {
  play: async ({ canvasElement }): Promise<void> => {
    const control = within(canvasElement).getByRole('textbox');
    const shell = control.parentElement as HTMLElement;
    const before = shell.getBoundingClientRect();

    await userEvent.click(control);
    await expect(control).toHaveFocus();

    const after = shell.getBoundingClientRect();

    await expect(after.width).toBeCloseTo(before.width, 1);
    await expect(after.height).toBeCloseTo(before.height, 1);
  },
};

/** A long unbroken value scrolls inside the field rather than widening it. */
export const LongValue: Story = {
  render: (args): ReactElement => (
    <div style={{ ...column, maxWidth: '240px' }}>
      <Textarea
        {...args}
        fullWidth
        defaultValue="git+https://github.com/kreobuddha/kreobuddha-ui.git and a good deal more text after it"
      />
    </div>
  ),
  play: async ({ canvasElement }): Promise<void> => {
    const control = within(canvasElement).getByRole('textbox');

    await expect(control.getBoundingClientRect().width).toBeLessThanOrEqual(240);
  },
};

export const FullWidth: Story = {
  args: { fullWidth: true, placeholder: 'What changed in this version?' },
  render: (args): ReactElement => (
    <div style={{ width: '520px' }}>
      <Textarea {...args} />
    </div>
  ),
};
