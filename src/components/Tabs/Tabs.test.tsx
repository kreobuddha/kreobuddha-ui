import { useState } from 'react';
import type { ReactElement } from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { Tabs } from './Tabs.js';
import type { TabItem } from './Tabs.js';

const items: TabItem[] = [
  { id: 'overview', label: 'Overview', content: 'What this workspace is.' },
  { id: 'members', label: 'Members', content: 'Who can reach it.' },
  { id: 'billing', label: 'Billing', content: 'What it costs.' },
];

describe('Tabs', () => {
  it('renders a tab list and marks the first tab selected by default', () => {
    render(<Tabs items={items} />);

    expect(screen.getByRole('tablist')).toBeDefined();
    expect(screen.getAllByRole('tab')).toHaveLength(3);
    expect(screen.getByRole('tab', { selected: true }).textContent).toBe('Overview');
  });

  it('mounts only the selected panel', () => {
    render(<Tabs items={items} />);

    expect(screen.getAllByRole('tabpanel')).toHaveLength(1);
    expect(screen.getByText('What this workspace is.')).toBeDefined();
    expect(screen.queryByText('Who can reach it.')).toBeNull();
  });

  it('names the panel with its tab', () => {
    render(<Tabs items={items} />);

    const tab = screen.getByRole('tab', { selected: true });
    const panel = screen.getByRole('tabpanel');

    expect(panel.getAttribute('aria-labelledby')).toBe(tab.id);
    expect(tab.getAttribute('aria-controls')).toBe(panel.id);
  });

  it('honours defaultValue', () => {
    render(<Tabs items={items} defaultValue="billing" />);

    expect(screen.getByRole('tab', { selected: true }).textContent).toBe('Billing');
    expect(screen.getByText('What it costs.')).toBeDefined();
  });

  it('selects on click and reports the id', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();

    render(<Tabs items={items} onChange={onChange} />);
    await user.click(screen.getByRole('tab', { name: 'Members' }));

    expect(onChange).toHaveBeenCalledWith('members');
    expect(screen.getByText('Who can reach it.')).toBeDefined();
  });

  it('does not report a change when the selected tab is clicked again', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();

    render(<Tabs items={items} onChange={onChange} />);
    await user.click(screen.getByRole('tab', { name: 'Overview' }));

    expect(onChange).not.toHaveBeenCalled();
  });

  it('keeps only one tab stop, so Tab reaches the panel rather than every tab', async () => {
    const user = userEvent.setup();

    render(<Tabs items={items} />);

    await user.tab();
    expect(document.activeElement).toBe(screen.getByRole('tab', { name: 'Overview' }));

    await user.tab();
    expect(document.activeElement).toBe(screen.getByRole('tabpanel'));
  });

  it('selects as the arrow moves in automatic mode', async () => {
    const user = userEvent.setup();

    render(<Tabs items={items} />);
    await user.tab();
    await user.keyboard('{ArrowRight}');

    expect(screen.getByRole('tab', { selected: true }).textContent).toBe('Members');
    expect(document.activeElement).toBe(screen.getByRole('tab', { name: 'Members' }));
  });

  it('moves focus without selecting in manual mode, until Enter', async () => {
    const user = userEvent.setup();

    render(<Tabs items={items} activation="manual" />);
    await user.tab();
    await user.keyboard('{ArrowRight}');

    expect(document.activeElement).toBe(screen.getByRole('tab', { name: 'Members' }));
    expect(screen.getByRole('tab', { selected: true }).textContent).toBe('Overview');

    await user.keyboard('{Enter}');
    expect(screen.getByRole('tab', { selected: true }).textContent).toBe('Members');
  });

  it('wraps at both ends', async () => {
    const user = userEvent.setup();

    render(<Tabs items={items} />);
    await user.tab();
    await user.keyboard('{ArrowLeft}');

    expect(screen.getByRole('tab', { selected: true }).textContent).toBe('Billing');

    await user.keyboard('{ArrowRight}');
    expect(screen.getByRole('tab', { selected: true }).textContent).toBe('Overview');
  });

  it('jumps to the ends with Home and End', async () => {
    const user = userEvent.setup();

    render(<Tabs items={items} />);
    await user.tab();
    await user.keyboard('{End}');

    expect(screen.getByRole('tab', { selected: true }).textContent).toBe('Billing');

    await user.keyboard('{Home}');
    expect(screen.getByRole('tab', { selected: true }).textContent).toBe('Overview');
  });

  it('lets an arrow reach a disabled tab but never selects it', async () => {
    const user = userEvent.setup();
    const withDisabled: TabItem[] = [
      items[0] as TabItem,
      { id: 'members', label: 'Members', content: 'Who can reach it.', disabled: true },
      items[2] as TabItem,
    ];

    render(<Tabs items={withDisabled} />);
    await user.tab();
    await user.keyboard('{ArrowRight}');

    const disabled = screen.getByRole('tab', { name: 'Members' });

    // Reachable and announced as unavailable, rather than an unexplained gap in the sequence.
    expect(document.activeElement).toBe(disabled);
    expect(disabled.getAttribute('aria-disabled')).toBe('true');
    expect(screen.getByRole('tab', { selected: true }).textContent).toBe('Overview');
  });

  it('does not select a disabled tab on click either', async () => {
    const user = userEvent.setup();
    const withDisabled: TabItem[] = [
      items[0] as TabItem,
      { id: 'members', label: 'Members', content: 'Who can reach it.', disabled: true },
    ];

    render(<Tabs items={withDisabled} />);
    await user.click(screen.getByRole('tab', { name: 'Members' }));

    expect(screen.getByRole('tab', { selected: true }).textContent).toBe('Overview');
  });

  it('starts on the first selectable tab when the first one is disabled', () => {
    const withDisabled: TabItem[] = [
      { id: 'overview', label: 'Overview', content: 'What this is.', disabled: true },
      items[1] as TabItem,
    ];

    render(<Tabs items={withDisabled} />);

    expect(screen.getByRole('tab', { selected: true }).textContent).toBe('Members');
  });

  it('obeys a controlled value and does not move on its own', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();

    render(<Tabs items={items} value="overview" onChange={onChange} />);
    await user.click(screen.getByRole('tab', { name: 'Billing' }));

    expect(onChange).toHaveBeenCalledWith('billing');
    expect(screen.getByRole('tab', { selected: true }).textContent).toBe('Overview');
  });

  it('follows a controlled value that the consumer moves', async () => {
    const user = userEvent.setup();

    const Controlled = (): ReactElement => {
      const [value, setValue] = useState('overview');

      return <Tabs items={items} value={value} onChange={setValue} />;
    };

    render(<Controlled />);
    await user.click(screen.getByRole('tab', { name: 'Billing' }));

    expect(screen.getByRole('tab', { selected: true }).textContent).toBe('Billing');
    expect(screen.getByText('What it costs.')).toBeDefined();
  });

  it('gives two instances on a page their own ids', () => {
    render(
      <>
        <Tabs items={items} />
        <Tabs items={items} />
      </>
    );

    const [first, second] = screen.getAllByRole('tab', { selected: true });

    expect(first?.id).not.toBe(second?.id);
  });

  it('passes native props and className to the wrapper', () => {
    render(<Tabs items={items} className="outer" data-testid="tabs" aria-label="Workspace" />);

    const root = screen.getByTestId('tabs');

    expect(root.classList.contains('outer')).toBe(true);
    expect(root.getAttribute('aria-label')).toBe('Workspace');
  });
});
