import { createRef } from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { Radio } from './Radio.js';

describe('Radio', () => {
  it('associates the visible label with the control', () => {
    render(<Radio name="deck" label="Fibonacci" />);

    expect(screen.getByRole('radio', { name: 'Fibonacci' })).toBeDefined();
  });

  it('gives each instance its own ids, so two options on a page stay independent', () => {
    render(
      <>
        <Radio name="deck" label="Fibonacci" hint="one" />
        <Radio name="deck" label="Powers of two" hint="two" />
      </>
    );

    const [first, second] = screen.getAllByRole('radio');

    expect(first?.id).not.toBe(second?.id);
  });

  it('selects on click and reports it', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();

    render(<Radio name="deck" label="Fibonacci" onChange={onChange} />);
    const option = screen.getByRole<HTMLInputElement>('radio');

    await user.click(option);

    expect(option.checked).toBe(true);
    expect(onChange).toHaveBeenCalledTimes(1);
  });

  it('selects from the label, not only from the control', async () => {
    const user = userEvent.setup();

    render(<Radio name="deck" label="Fibonacci" />);

    await user.click(screen.getByText('Fibonacci'));

    expect(screen.getByRole<HTMLInputElement>('radio').checked).toBe(true);
  });

  it('lets only one option of a name be chosen, and never unchooses it by repeating', async () => {
    const user = userEvent.setup();

    render(
      <>
        <Radio name="deck" value="fibonacci" label="Fibonacci" />
        <Radio name="deck" value="powers" label="Powers of two" />
      </>
    );

    const [first, second] = screen.getAllByRole<HTMLInputElement>('radio');

    await user.click(second!);
    expect(second!.checked).toBe(true);
    expect(first!.checked).toBe(false);

    // Clicking the chosen option again is not a toggle: a radio group has no empty state once
    // something has been picked, which is the behaviour that separates it from `Checkbox`.
    await user.click(second!);
    expect(second!.checked).toBe(true);
  });

  it('moves through the group with the arrow keys, as one tab stop', async () => {
    const user = userEvent.setup();

    render(
      <>
        <Radio name="deck" value="fibonacci" label="Fibonacci" defaultChecked />
        <Radio name="deck" value="powers" label="Powers of two" />
      </>
    );

    const [first, second] = screen.getAllByRole<HTMLInputElement>('radio');

    await user.tab();
    expect(document.activeElement).toBe(first);

    await user.keyboard('{ArrowDown}');

    expect(document.activeElement).toBe(second);
    expect(second!.checked).toBe(true);
    expect(first!.checked).toBe(false);
  });

  it('keeps two groups on one page apart', async () => {
    const user = userEvent.setup();

    render(
      <>
        <Radio name="deck" value="fibonacci" label="Fibonacci" />
        <Radio name="scale" value="days" label="Days" />
      </>
    );

    const deck = screen.getByRole<HTMLInputElement>('radio', { name: 'Fibonacci' });
    const scale = screen.getByRole<HTMLInputElement>('radio', { name: 'Days' });

    await user.click(deck);
    await user.click(scale);

    expect(deck.checked).toBe(true);
    expect(scale.checked).toBe(true);
  });

  it('honours a controlled checked state, and reports a choice it does not make itself', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();

    const { rerender } = render(
      <Radio name="deck" label="Fibonacci" checked={false} onChange={onChange} />
    );
    const option = screen.getByRole<HTMLInputElement>('radio');

    await user.click(option);

    // The consumer owns the value: the click is reported, and nothing moves until they say so.
    expect(onChange).toHaveBeenCalledTimes(1);
    expect(option.checked).toBe(false);

    rerender(<Radio name="deck" label="Fibonacci" checked onChange={onChange} />);
    expect(option.checked).toBe(true);

    // Clicking the chosen option changes no value, so the platform fires nothing — unlike a
    // checkbox, where the same click is a real change back to unchecked.
    await user.click(option);
    expect(onChange).toHaveBeenCalledTimes(1);
    expect(option.checked).toBe(true);
  });

  it('points aria-describedby at the hint', () => {
    render(<Radio name="deck" label="Fibonacci" hint="1 · 2 · 3 · 5 · 8 · 13 · 21" />);

    const described = screen.getByRole('radio').getAttribute('aria-describedby') ?? '';

    expect(document.getElementById(described)?.textContent).toBe('1 · 2 · 3 · 5 · 8 · 13 · 21');
  });

  it('marks the option invalid when an error is given', () => {
    render(<Radio name="deck" label="Fibonacci" error="This deck is not available here." />);

    expect(screen.getByRole('radio').getAttribute('aria-invalid')).toBe('true');
    expect(screen.getByText('This deck is not available here.')).toBeDefined();
  });

  it('describes the error before the hint', () => {
    render(<Radio name="deck" label="Fibonacci" hint="Seven cards." error="Not available." />);

    const [firstId = '', secondId = ''] = (
      screen.getByRole('radio').getAttribute('aria-describedby') ?? ''
    ).split(' ');

    expect(document.getElementById(firstId)?.textContent).toBe('Not available.');
    expect(document.getElementById(secondId)?.textContent).toBe('Seven cards.');
  });

  it('reports required through the native attribute, not through the marker alone', () => {
    render(<Radio name="deck" label="Fibonacci" required />);

    const option = screen.getByRole('radio');

    expect(option.hasAttribute('required')).toBe(true);
    // The asterisk is decorative; the accessible name must not pick it up.
    expect(screen.getByRole('radio', { name: 'Fibonacci' })).toBe(option);
  });

  it('cannot be chosen when disabled', async () => {
    const user = userEvent.setup();

    render(<Radio name="deck" label="Unavailable" disabled />);
    const option = screen.getByRole<HTMLInputElement>('radio');

    await user.click(option);

    expect(option.checked).toBe(false);
  });

  it('passes native props and the ref to the control, and className to the wrapper', () => {
    const ref = createRef<HTMLInputElement>();

    render(
      <Radio
        label="Fibonacci"
        ref={ref}
        className="outer"
        name="deck"
        value="fibonacci"
        data-testid="deck-option"
      />
    );

    const option = screen.getByTestId<HTMLInputElement>('deck-option');

    expect(ref.current).toBe(option);
    expect(option.name).toBe('deck');
    expect(option.value).toBe('fibonacci');
    expect(document.querySelector('.outer')?.contains(option)).toBe(true);
  });
});
