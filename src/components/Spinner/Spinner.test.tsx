import { render, screen } from '@testing-library/react';
import { createRef } from 'react';
import { describe, expect, test } from 'vitest';

import { Spinner } from './Spinner.js';

describe('announcement', () => {
  test('is decorative by default, with no role and hidden from assistive technology', () => {
    const { container } = render(<Spinner />);

    expect(screen.queryByRole('status')).toBeNull();
    expect(container.firstElementChild?.getAttribute('aria-hidden')).toBe('true');
  });

  test('a label makes it a status with that accessible name', () => {
    render(<Spinner label="Loading members" />);

    expect(screen.getByRole('status', { name: 'Loading members' })).toBeDefined();
  });

  test('a labelled spinner is not also hidden', () => {
    const { container } = render(<Spinner label="Loading" />);

    expect(container.firstElementChild?.hasAttribute('aria-hidden')).toBe(false);
  });
});

describe('api', () => {
  test('sizes render distinct root classes', () => {
    const { container: sm } = render(<Spinner size="sm" />);
    const { container: lg } = render(<Spinner size="lg" />);

    expect(sm.firstElementChild?.className).not.toBe(lg.firstElementChild?.className);
  });

  test('passes className and native props through to the root element', () => {
    render(<Spinner className="custom" data-testid="probe" />);

    const root = screen.getByTestId('probe');
    expect(root.classList.contains('custom')).toBe(true);
  });

  test('exposes the underlying element through ref', () => {
    const ref = createRef<HTMLSpanElement>();
    render(<Spinner ref={ref} data-testid="probe" />);

    expect(ref.current).toBe(screen.getByTestId('probe'));
  });
});
