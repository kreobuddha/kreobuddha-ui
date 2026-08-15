import { createRef } from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { TextField } from './TextField.js';

describe('TextField', () => {
  it('associates the visible label with the input', () => {
    render(<TextField label="Email" />);

    expect(screen.getByRole('textbox', { name: 'Email' })).toBeDefined();
  });

  it('gives each instance its own ids, so two fields on a page stay independent', () => {
    render(
      <>
        <TextField label="First" hint="one" />
        <TextField label="Second" hint="two" />
      </>
    );

    const first = screen.getByRole('textbox', { name: 'First' });
    const second = screen.getByRole('textbox', { name: 'Second' });

    expect(first.id).not.toBe(second.id);
    expect(first.getAttribute('aria-describedby')).not.toBe(
      second.getAttribute('aria-describedby')
    );
  });

  it('accepts a caller-supplied id rather than overriding it', () => {
    render(<TextField label="Email" id="custom-email" />);

    expect(screen.getByRole('textbox', { name: 'Email' }).id).toBe('custom-email');
  });

  it('points aria-describedby at the hint', () => {
    render(<TextField label="Email" hint="We never share it." />);

    const input = screen.getByRole('textbox');
    const described = input.getAttribute('aria-describedby');

    expect(described).toBeTruthy();
    expect(document.getElementById(described as string)?.textContent).toBe('We never share it.');
  });

  it('sets no aria-describedby when there is nothing to describe', () => {
    render(<TextField label="Email" />);

    expect(screen.getByRole('textbox').getAttribute('aria-describedby')).toBeNull();
  });

  it('marks the field invalid when an error is given, and describes it', () => {
    render(<TextField label="Email" error="That address is not valid." />);

    const input = screen.getByRole('textbox');

    expect(input.getAttribute('aria-invalid')).toBe('true');
    expect(input.getAttribute('aria-describedby')).toBeTruthy();
    expect(screen.getByText('That address is not valid.')).toBeDefined();
  });

  it('is not invalid without an error', () => {
    render(<TextField label="Email" hint="Work address." />);

    expect(screen.getByRole('textbox').getAttribute('aria-invalid')).toBeNull();
  });

  it('describes the error before the hint, so the problem is heard before the guidance', () => {
    render(<TextField label="Email" hint="Work address." error="Required." />);

    const input = screen.getByRole('textbox');
    const [firstId = '', secondId = ''] = (input.getAttribute('aria-describedby') ?? '').split(' ');

    expect(document.getElementById(firstId)?.textContent).toBe('Required.');
    expect(document.getElementById(secondId)?.textContent).toBe('Work address.');
  });

  it('reports required through the native attribute, not through the marker alone', () => {
    render(<TextField label="Email" required />);

    const input = screen.getByRole('textbox');

    expect(input.hasAttribute('required')).toBe(true);
    // The asterisk is decorative; the accessible name must not pick it up.
    expect(screen.getByRole('textbox', { name: 'Email' })).toBe(input);
  });

  it('types into an uncontrolled field and reports every keystroke', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();

    render(<TextField label="Email" onChange={onChange} />);
    const input = screen.getByRole<HTMLInputElement>('textbox');
    await user.type(input, 'abc');

    expect(input.value).toBe('abc');
    expect(onChange).toHaveBeenCalledTimes(3);
  });

  it('honours a controlled value', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();

    render(<TextField label="Email" value="fixed" onChange={onChange} />);
    const input = screen.getByRole<HTMLInputElement>('textbox');
    await user.type(input, 'x');

    expect(input.value).toBe('fixed');
    expect(onChange).toHaveBeenCalled();
  });

  it('cannot be typed into or focused when disabled', async () => {
    const user = userEvent.setup();

    render(<TextField label="Email" disabled />);
    const input = screen.getByRole<HTMLInputElement>('textbox');
    await user.type(input, 'abc');

    expect(input.value).toBe('');
    expect(document.activeElement).not.toBe(input);
  });

  it('is focusable but unchangeable when read-only', async () => {
    const user = userEvent.setup();

    render(<TextField label="Email" readOnly defaultValue="kept" />);
    const input = screen.getByRole<HTMLInputElement>('textbox');
    await user.click(input);
    await user.type(input, 'abc');

    expect(document.activeElement).toBe(input);
    expect(input.value).toBe('kept');
  });

  it('renders the slots inside the field', () => {
    render(<TextField label="Amount" prefix={<span>$</span>} suffix={<span>USD</span>} />);

    expect(screen.getByText('$')).toBeDefined();
    expect(screen.getByText('USD')).toBeDefined();
  });

  it('passes native props and the ref to the input, and className to the wrapper', () => {
    const ref = createRef<HTMLInputElement>();

    render(
      <TextField
        label="Email"
        ref={ref}
        className="outer"
        type="email"
        placeholder="you@example.com"
        maxLength={40}
        data-testid="email"
      />
    );

    const input = screen.getByTestId<HTMLInputElement>('email');

    expect(ref.current).toBe(input);
    expect(input.type).toBe('email');
    expect(input.placeholder).toBe('you@example.com');
    expect(input.maxLength).toBe(40);
    expect(document.querySelector('.outer')?.contains(input)).toBe(true);
  });
});
