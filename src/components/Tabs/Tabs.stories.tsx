import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import type { ReactElement } from 'react';
import { expect, userEvent, within } from 'storybook/test';

import { Badge } from '../Badge/Badge.js';
import { TextField } from '../TextField/TextField.js';

import { Tabs } from './Tabs.js';
import type { TabItem } from './Tabs.js';

const items: TabItem[] = [
  { id: 'overview', label: 'Overview', content: 'What this workspace is and who runs it.' },
  { id: 'members', label: 'Members', content: 'Everyone who can reach this workspace.' },
  { id: 'billing', label: 'Billing', content: 'The plan, the invoices and the card on file.' },
];

const meta = {
  title: 'Components/Tabs',
  component: Tabs,
  args: { items },
} satisfies Meta<typeof Tabs>;

export default meta;

type Story = StoryObj<typeof meta>;

const frame = { maxWidth: '520px' } as const;

export const Default: Story = {
  render: (args): ReactElement => (
    <div style={frame}>
      <Tabs {...args} />
    </div>
  ),
};

/** A label is a `ReactNode`, so a count can sit beside the word. */
export const LabelsWithBadges: Story = {
  args: {
    items: [
      { id: 'overview', label: 'Overview', content: 'What this workspace is.' },
      {
        id: 'members',
        label: (
          <>
            Members <Badge tone="neutral">12</Badge>
          </>
        ),
        content: 'Everyone who can reach this workspace.',
      },
      {
        id: 'incidents',
        label: (
          <>
            Incidents <Badge tone="danger">3</Badge>
          </>
        ),
        content: 'Three open incidents.',
      },
    ],
  },
  render: (args): ReactElement => (
    <div style={frame}>
      <Tabs {...args} />
    </div>
  ),
};

/** Arrows select as they move, which is the default and the fewest keystrokes. */
export const AutomaticActivation: Story = {
  render: (args): ReactElement => (
    <div style={frame}>
      <Tabs {...args} />
    </div>
  ),
  play: async ({ canvasElement }): Promise<void> => {
    const canvas = within(canvasElement);

    canvas.getByRole('tab', { name: 'Overview' }).focus();
    await userEvent.keyboard('{ArrowRight}');

    await expect(canvas.getByRole('tab', { selected: true })).toHaveTextContent('Members');
  },
};

/** Arrows move focus only. For a panel expensive enough that arrowing past it would cost a request. */
export const ManualActivation: Story = {
  args: { activation: 'manual' },
  render: (args): ReactElement => (
    <div style={frame}>
      <Tabs {...args} />
    </div>
  ),
  play: async ({ canvasElement }): Promise<void> => {
    const canvas = within(canvasElement);

    canvas.getByRole('tab', { name: 'Overview' }).focus();
    await userEvent.keyboard('{ArrowRight}');

    await expect(canvas.getByRole('tab', { name: 'Members' })).toHaveFocus();
    await expect(canvas.getByRole('tab', { selected: true })).toHaveTextContent('Overview');

    await userEvent.keyboard('{Enter}');
    await expect(canvas.getByRole('tab', { selected: true })).toHaveTextContent('Members');
  },
};

/** A disabled tab can be reached and read, so a keyboard user is never left with an unexplained gap. */
export const DisabledTab: Story = {
  args: {
    items: [
      items[0] as TabItem,
      { id: 'billing', label: 'Billing', content: 'Not on this plan.', disabled: true },
      items[1] as TabItem,
    ],
  },
  render: (args): ReactElement => (
    <div style={frame}>
      <Tabs {...args} />
    </div>
  ),
  play: async ({ canvasElement }): Promise<void> => {
    const canvas = within(canvasElement);

    canvas.getByRole('tab', { name: 'Overview' }).focus();
    await userEvent.keyboard('{ArrowRight}');

    const disabled = canvas.getByRole('tab', { name: 'Billing' });

    await expect(disabled).toHaveFocus();
    await expect(disabled).toHaveAttribute('aria-disabled', 'true');
    await expect(canvas.getByRole('tab', { selected: true })).toHaveTextContent('Overview');
  },
};

/** One tab stop for the whole list, so Tab moves past it into the panel. */
export const TabReachesThePanel: Story = {
  render: (args): ReactElement => (
    <div style={frame}>
      <Tabs {...args} />
    </div>
  ),
  play: async ({ canvasElement }): Promise<void> => {
    const canvas = within(canvasElement);

    canvas.getByRole('tab', { name: 'Overview' }).focus();
    await userEvent.tab();

    await expect(canvas.getByRole('tabpanel')).toHaveFocus();
  },
};

/** Only the selected panel is mounted, so state inside a panel has to live outside it. */
export const PanelsUnmount: Story = {
  render: (args): ReactElement => {
    const [name, setName] = useState('');

    return (
      <div style={frame}>
        <Tabs
          {...args}
          items={[
            {
              id: 'general',
              label: 'General',
              content: (
                <TextField
                  fullWidth
                  label="Workspace name"
                  value={name}
                  onChange={(event): void => setName(event.target.value)}
                  hint="Kept in the page's own state, so switching tabs does not lose it."
                />
              ),
            },
            { id: 'members', label: 'Members', content: 'Everyone who can reach this workspace.' },
          ]}
        />
      </div>
    );
  },
  play: async ({ canvasElement }): Promise<void> => {
    const canvas = within(canvasElement);

    await userEvent.type(canvas.getByRole('textbox'), 'Acme');
    await userEvent.click(canvas.getByRole('tab', { name: 'Members' }));

    await expect(canvas.queryByRole('textbox')).toBeNull();

    await userEvent.click(canvas.getByRole('tab', { name: 'General' }));
    await expect(canvas.getByRole('textbox')).toHaveValue('Acme');
  },
};

/** More tabs than room scroll sideways. Wrapping would put the indicator on another line. */
export const ManyTabs: Story = {
  args: {
    items: [
      'Overview',
      'Members',
      'Billing',
      'Integrations',
      'Audit log',
      'Notifications',
      'Danger zone',
    ].map((label) => ({ id: label.toLowerCase().replace(/ /g, '-'), label, content: label })),
  },
  render: (args): ReactElement => (
    <div style={{ width: '320px' }}>
      <Tabs {...args} />
    </div>
  ),
  play: async ({ canvasElement }): Promise<void> => {
    const list = within(canvasElement).getByRole('tablist');

    await expect(list.scrollWidth).toBeGreaterThan(list.clientWidth);
    await expect(list.getBoundingClientRect().width).toBeLessThanOrEqual(320);
  },
};

export const Controlled: Story = {
  render: (args): ReactElement => {
    const [value, setValue] = useState('members');

    return (
      <div style={frame}>
        <Tabs {...args} value={value} onChange={setValue} />
        <p style={{ font: 'var(--kreo-type-body)', color: 'var(--kreo-text-muted)' }}>
          Selected: {value}
        </p>
      </div>
    );
  },
};
