import { createRef } from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { Switch } from './Switch.js';

describe('Switch', () => {
  it('reports the switch role, not the checkbox role', () => {
    render(<Switch label="Dark theme" />);

    expect(screen.getByRole('switch', { name: 'Dark theme' })).toBeDefined();
    expect(screen.queryByRole('checkbox')).toBeNull();
  });

  it('toggles on click and reports it', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();

    render(<Switch label="Dark theme" onChange={onChange} />);
    const control = screen.getByRole<HTMLInputElement>('switch');

    await user.click(control);

    expect(control.checked).toBe(true);
    expect(onChange).toHaveBeenCalledTimes(1);
  });

  it('toggles from the label', async () => {
    const user = userEvent.setup();

    render(<Switch label="Dark theme" />);

    await user.click(screen.getByText('Dark theme'));

    expect(screen.getByRole<HTMLInputElement>('switch').checked).toBe(true);
  });

  it('toggles with the space key, which the native element gives us', async () => {
    const user = userEvent.setup();

    render(<Switch label="Dark theme" />);
    const control = screen.getByRole<HTMLInputElement>('switch');

    await user.tab();
    expect(document.activeElement).toBe(control);

    await user.keyboard(' ');
    expect(control.checked).toBe(true);
  });

  it('honours a controlled state', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();

    render(<Switch label="Locked on" checked onChange={onChange} />);
    const control = screen.getByRole<HTMLInputElement>('switch');

    await user.click(control);

    expect(control.checked).toBe(true);
    expect(onChange).toHaveBeenCalled();
  });

  it('points aria-describedby at the hint', () => {
    render(<Switch label="Dark theme" hint="Follows the system by default." />);

    const described = screen.getByRole('switch').getAttribute('aria-describedby') ?? '';

    expect(document.getElementById(described)?.textContent).toBe('Follows the system by default.');
  });

  it('marks the switch invalid when an error is given', () => {
    render(<Switch label="Two-factor" error="Turn this on before inviting anyone." />);

    expect(screen.getByRole('switch').getAttribute('aria-invalid')).toBe('true');
    expect(screen.getByText('Turn this on before inviting anyone.')).toBeDefined();
  });

  it('describes the error before the hint', () => {
    render(<Switch label="Two-factor" hint="Uses an app." error="Required." />);

    const [firstId = '', secondId = ''] = (
      screen.getByRole('switch').getAttribute('aria-describedby') ?? ''
    ).split(' ');

    expect(document.getElementById(firstId)?.textContent).toBe('Required.');
    expect(document.getElementById(secondId)?.textContent).toBe('Uses an app.');
  });

  it('cannot be toggled when disabled', async () => {
    const user = userEvent.setup();

    render(<Switch label="Unavailable" disabled />);
    const control = screen.getByRole<HTMLInputElement>('switch');

    await user.click(control);

    expect(control.checked).toBe(false);
  });

  it('passes native props and the ref to the control, and className to the wrapper', () => {
    const ref = createRef<HTMLInputElement>();

    render(<Switch label="Dark theme" ref={ref} className="outer" name="theme" data-testid="sw" />);

    const control = screen.getByTestId<HTMLInputElement>('sw');

    expect(ref.current).toBe(control);
    expect(control.name).toBe('theme');
    expect(document.querySelector('.outer')?.contains(control)).toBe(true);
  });
});
