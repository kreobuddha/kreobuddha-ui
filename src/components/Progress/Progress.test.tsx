import { render, screen } from '@testing-library/react';
import { createRef } from 'react';
import { describe, expect, test } from 'vitest';

import { Progress } from './Progress.js';

// The semantics are written by hand rather than inherited from a native `<progress>`, so they are
// asserted here in full: every attribute below is one the element would have supplied for free.

describe('semantics', () => {
  test('is a progressbar with the label as its accessible name', () => {
    render(<Progress label="Uploading files" value={40} />);

    expect(screen.getByRole('progressbar', { name: 'Uploading files' })).toBeDefined();
  });

  test('reports the value and the range', () => {
    render(<Progress label="Uploading files" value={40} />);

    const bar = screen.getByRole('progressbar');
    expect(bar.getAttribute('aria-valuenow')).toBe('40');
    expect(bar.getAttribute('aria-valuemin')).toBe('0');
    expect(bar.getAttribute('aria-valuemax')).toBe('100');
  });

  test('a custom max is the ceiling, and the value is not rescaled behind the consumer', () => {
    render(<Progress label="Steps" value={3} max={7} />);

    const bar = screen.getByRole('progressbar');
    expect(bar.getAttribute('aria-valuenow')).toBe('3');
    expect(bar.getAttribute('aria-valuemax')).toBe('7');
  });

  test('without a value it reports no value at all, rather than zero', () => {
    render(<Progress label="Publishing" />);

    // The difference between "under way" and "0% done", and the whole reason the prop is optional.
    expect(screen.getByRole('progressbar').hasAttribute('aria-valuenow')).toBe(false);
  });
});

describe('the value is clamped', () => {
  test('above the ceiling', () => {
    render(<Progress label="Uploading files" value={140} />);

    expect(screen.getByRole('progressbar').getAttribute('aria-valuenow')).toBe('100');
  });

  test('below zero', () => {
    render(<Progress label="Uploading files" value={-20} />);

    expect(screen.getByRole('progressbar').getAttribute('aria-valuenow')).toBe('0');
  });

  test('a max that cannot be divided by falls back to the default', () => {
    render(<Progress label="Uploading files" value={40} max={0} />);

    const bar = screen.getByRole('progressbar');
    expect(bar.getAttribute('aria-valuemax')).toBe('100');
    expect(bar.getAttribute('aria-valuenow')).toBe('40');
  });

  test('a value that is not a number is the indeterminate state, not NaN', () => {
    render(<Progress label="Uploading files" value={Number.NaN} />);

    expect(screen.getByRole('progressbar').hasAttribute('aria-valuenow')).toBe(false);
  });
});

describe('api', () => {
  test('passes className and native props through to the root element', () => {
    render(<Progress label="Uploading files" className="custom" data-testid="probe" />);

    expect(screen.getByTestId('probe').classList.contains('custom')).toBe(true);
  });

  test('exposes the underlying element through ref', () => {
    const ref = createRef<HTMLDivElement>();
    render(<Progress label="Uploading files" ref={ref} data-testid="probe" />);

    expect(ref.current).toBe(screen.getByTestId('probe'));
  });

  test('the bar itself is not announced separately', () => {
    render(<Progress label="Uploading files" value={40} />);

    // Descendants of `progressbar` are presentational. Two announcements for one bar would be one
    // too many, and the check is cheap enough to keep.
    expect(screen.getAllByRole('progressbar')).toHaveLength(1);
  });
});
