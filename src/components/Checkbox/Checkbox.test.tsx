import { createRef } from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { Checkbox } from './Checkbox.js';

describe('Checkbox', () => {
  it('associates the visible label with the control', () => {
    render(<Checkbox label="Send me release notes" />);

    expect(screen.getByRole('checkbox', { name: 'Send me release notes' })).toBeDefined();
  });

  it('gives each instance its own ids, so two boxes on a page stay independent', () => {
    render(
      <>
        <Checkbox label="First" hint="one" />
        <Checkbox label="Second" hint="two" />
      </>
    );

    const [first, second] = screen.getAllByRole('checkbox');

    expect(first?.id).not.toBe(second?.id);
  });

  it('toggles on click and reports it', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();

    render(<Checkbox label="Send me release notes" onChange={onChange} />);
    const box = screen.getByRole<HTMLInputElement>('checkbox');

    await user.click(box);

    expect(box.checked).toBe(true);
    expect(onChange).toHaveBeenCalledTimes(1);
  });

  it('toggles from the label, not only from the box', async () => {
    const user = userEvent.setup();

    render(<Checkbox label="Send me release notes" />);
    const box = screen.getByRole<HTMLInputElement>('checkbox');

    await user.click(screen.getByText('Send me release notes'));

    expect(box.checked).toBe(true);
  });

  it('toggles with the space key', async () => {
    const user = userEvent.setup();

    render(<Checkbox label="Send me release notes" />);
    const box = screen.getByRole<HTMLInputElement>('checkbox');

    await user.tab();
    expect(document.activeElement).toBe(box);

    await user.keyboard(' ');
    expect(box.checked).toBe(true);
  });

  it('honours a controlled checked state', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();

    render(<Checkbox label="Locked on" checked onChange={onChange} />);
    const box = screen.getByRole<HTMLInputElement>('checkbox');

    await user.click(box);

    expect(box.checked).toBe(true);
    expect(onChange).toHaveBeenCalled();
  });

  it('sets the indeterminate DOM property, which has no HTML attribute', () => {
    const { rerender } = render(<Checkbox label="Select all" indeterminate />);
    const box = screen.getByRole<HTMLInputElement>('checkbox');

    expect(box.indeterminate).toBe(true);
    expect(box.checked).toBe(false);

    rerender(<Checkbox label="Select all" />);

    expect(box.indeterminate).toBe(false);
  });

  it('points aria-describedby at the hint', () => {
    render(<Checkbox label="Send me release notes" hint="About one email a month." />);

    const described = screen.getByRole('checkbox').getAttribute('aria-describedby') ?? '';

    expect(document.getElementById(described)?.textContent).toBe('About one email a month.');
  });

  it('marks the box invalid when an error is given', () => {
    render(<Checkbox label="Accept the terms" error="You have to accept them to continue." />);

    expect(screen.getByRole('checkbox').getAttribute('aria-invalid')).toBe('true');
    expect(screen.getByText('You have to accept them to continue.')).toBeDefined();
  });

  it('describes the error before the hint', () => {
    render(<Checkbox label="Accept the terms" hint="Version 3." error="Required." />);

    const [firstId = '', secondId = ''] = (
      screen.getByRole('checkbox').getAttribute('aria-describedby') ?? ''
    ).split(' ');

    expect(document.getElementById(firstId)?.textContent).toBe('Required.');
    expect(document.getElementById(secondId)?.textContent).toBe('Version 3.');
  });

  it('reports required through the native attribute, not through the marker alone', () => {
    render(<Checkbox label="Accept the terms" required />);

    const box = screen.getByRole('checkbox');

    expect(box.hasAttribute('required')).toBe(true);
    // The asterisk is decorative; the accessible name must not pick it up.
    expect(screen.getByRole('checkbox', { name: 'Accept the terms' })).toBe(box);
  });

  it('cannot be toggled when disabled', async () => {
    const user = userEvent.setup();

    render(<Checkbox label="Unavailable" disabled />);
    const box = screen.getByRole<HTMLInputElement>('checkbox');

    await user.click(box);

    expect(box.checked).toBe(false);
  });

  it('passes native props and the ref to the control, and className to the wrapper', () => {
    const ref = createRef<HTMLInputElement>();

    render(
      <Checkbox
        label="Send me release notes"
        ref={ref}
        className="outer"
        name="notes"
        value="yes"
        data-testid="notes"
      />
    );

    const box = screen.getByTestId<HTMLInputElement>('notes');

    expect(ref.current).toBe(box);
    expect(box.name).toBe('notes');
    expect(box.value).toBe('yes');
    expect(document.querySelector('.outer')?.contains(box)).toBe(true);
  });
});
