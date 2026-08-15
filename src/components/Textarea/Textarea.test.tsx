import { createRef } from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { Textarea } from './Textarea.js';

describe('Textarea', () => {
  it('associates the visible label with the control', () => {
    render(<Textarea label="Notes" />);

    expect(screen.getByRole('textbox', { name: 'Notes' })).toBeDefined();
  });

  it('gives each instance its own ids, so two fields on a page stay independent', () => {
    render(
      <>
        <Textarea label="First" hint="one" />
        <Textarea label="Second" hint="two" />
      </>
    );

    const [first, second] = screen.getAllByRole('textbox');

    expect(first?.id).not.toBe(second?.id);
  });

  it('accepts a caller-supplied id rather than overriding it', () => {
    render(<Textarea label="Notes" id="custom-notes" />);

    expect(screen.getByRole('textbox', { name: 'Notes' }).id).toBe('custom-notes');
  });

  it('points aria-describedby at the hint', () => {
    render(<Textarea label="Notes" hint="Markdown is supported." />);

    const control = screen.getByRole('textbox');
    const described = control.getAttribute('aria-describedby') ?? '';

    expect(document.getElementById(described)?.textContent).toBe('Markdown is supported.');
  });

  it('sets no aria-describedby when there is nothing to describe', () => {
    render(<Textarea label="Notes" />);

    expect(screen.getByRole('textbox').getAttribute('aria-describedby')).toBeNull();
  });

  it('marks the field invalid when an error is given', () => {
    render(<Textarea label="Notes" error="Say something." />);

    expect(screen.getByRole('textbox').getAttribute('aria-invalid')).toBe('true');
    expect(screen.getByText('Say something.')).toBeDefined();
  });

  it('is not invalid without an error', () => {
    render(<Textarea label="Notes" hint="Optional." />);

    expect(screen.getByRole('textbox').getAttribute('aria-invalid')).toBeNull();
  });

  it('describes the error before the hint, so the problem is heard before the guidance', () => {
    render(<Textarea label="Notes" hint="Markdown is supported." error="Required." />);

    const [firstId = '', secondId = ''] = (
      screen.getByRole('textbox').getAttribute('aria-describedby') ?? ''
    ).split(' ');

    expect(document.getElementById(firstId)?.textContent).toBe('Required.');
    expect(document.getElementById(secondId)?.textContent).toBe('Markdown is supported.');
  });

  it('defaults to three rows and takes the number given', () => {
    const { rerender } = render(<Textarea label="Notes" />);

    expect(screen.getByRole<HTMLTextAreaElement>('textbox').rows).toBe(3);

    rerender(<Textarea label="Notes" rows={8} />);

    expect(screen.getByRole<HTMLTextAreaElement>('textbox').rows).toBe(8);
  });

  it('reports required through the native attribute, not through the marker alone', () => {
    render(<Textarea label="Notes" required />);

    const control = screen.getByRole('textbox');

    expect(control.hasAttribute('required')).toBe(true);
    // The asterisk is decorative; the accessible name must not pick it up.
    expect(screen.getByRole('textbox', { name: 'Notes' })).toBe(control);
  });

  it('types into an uncontrolled field, newlines included', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();

    render(<Textarea label="Notes" onChange={onChange} />);
    const control = screen.getByRole<HTMLTextAreaElement>('textbox');
    await user.type(control, 'one{enter}two');

    expect(control.value).toBe('one\ntwo');
    expect(onChange).toHaveBeenCalled();
  });

  it('honours a controlled value', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();

    render(<Textarea label="Notes" value="fixed" onChange={onChange} />);
    const control = screen.getByRole<HTMLTextAreaElement>('textbox');
    await user.type(control, 'x');

    expect(control.value).toBe('fixed');
    expect(onChange).toHaveBeenCalled();
  });

  it('cannot be typed into when disabled', async () => {
    const user = userEvent.setup();

    render(<Textarea label="Notes" disabled />);
    const control = screen.getByRole<HTMLTextAreaElement>('textbox');
    await user.type(control, 'abc');

    expect(control.value).toBe('');
    expect(document.activeElement).not.toBe(control);
  });

  it('is focusable but unchangeable when read-only', async () => {
    const user = userEvent.setup();

    render(<Textarea label="Notes" readOnly defaultValue="kept" />);
    const control = screen.getByRole<HTMLTextAreaElement>('textbox');
    await user.click(control);
    await user.type(control, 'abc');

    expect(document.activeElement).toBe(control);
    expect(control.value).toBe('kept');
  });

  it('passes native props and the ref to the control, and className to the wrapper', () => {
    const ref = createRef<HTMLTextAreaElement>();

    render(
      <Textarea
        label="Notes"
        ref={ref}
        className="outer"
        placeholder="Anything worth remembering"
        maxLength={200}
        data-testid="notes"
      />
    );

    const control = screen.getByTestId<HTMLTextAreaElement>('notes');

    expect(ref.current).toBe(control);
    expect(control.placeholder).toBe('Anything worth remembering');
    expect(control.maxLength).toBe(200);
    expect(document.querySelector('.outer')?.contains(control)).toBe(true);
  });
});
