import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createRef, type ReactElement } from 'react';
import { describe, expect, test, vi } from 'vitest';

import { IconButton } from './IconButton.js';

const Mark = (): ReactElement => (
  <svg width="14" height="14" viewBox="0 0 14 14" aria-hidden="true">
    <path d="M3 3l8 8M11 3l-8 8" stroke="currentColor" strokeWidth="1.5" />
  </svg>
);

describe('naming', () => {
  test('the label is the accessible name', () => {
    render(<IconButton label="Close" icon={<Mark />} />);

    expect(screen.getByRole('button', { name: 'Close' })).toBeDefined();
  });

  test('the icon is hidden, so it cannot compete with the label', () => {
    const { container } = render(<IconButton label="Close" icon={<Mark />} />);

    expect(container.querySelector('button > span')?.getAttribute('aria-hidden')).toBe('true');
  });

  test('the label doubles as the hover tooltip', () => {
    render(<IconButton label="Remove member" icon={<Mark />} />);

    expect(screen.getByRole('button').getAttribute('title')).toBe('Remove member');
  });

  test('an explicit title wins over the label', () => {
    render(<IconButton label="Close" title="Close this panel" icon={<Mark />} />);

    const button = screen.getByRole('button', { name: 'Close' });
    expect(button.getAttribute('title')).toBe('Close this panel');
  });
});

describe('semantics', () => {
  test('defaults to type="button" so it never submits a form by accident', () => {
    render(<IconButton label="Close" icon={<Mark />} />);

    expect(screen.getByRole('button').getAttribute('type')).toBe('button');
  });

  test('exposes the underlying button element through ref', () => {
    const ref = createRef<HTMLButtonElement>();
    render(<IconButton ref={ref} label="Close" icon={<Mark />} />);

    expect(ref.current).toBe(screen.getByRole('button'));
  });

  test('passes className and native props through to the root element', () => {
    render(<IconButton label="Close" icon={<Mark />} className="custom" data-testid="probe" />);

    expect(screen.getByTestId('probe').classList.contains('custom')).toBe(true);
  });
});

describe('activation', () => {
  test('calls onClick', async () => {
    const onClick = vi.fn();
    const user = userEvent.setup();
    render(<IconButton label="Close" icon={<Mark />} onClick={onClick} />);

    await user.click(screen.getByRole('button'));

    expect(onClick).toHaveBeenCalledTimes(1);
  });

  test('does not call onClick when disabled', async () => {
    const onClick = vi.fn();
    const user = userEvent.setup();
    render(<IconButton label="Close" icon={<Mark />} disabled onClick={onClick} />);

    await user.click(screen.getByRole('button'));

    expect(onClick).not.toHaveBeenCalled();
  });
});

describe('loading', () => {
  test('reports aria-busy and keeps its accessible name', () => {
    render(<IconButton label="Removing" icon={<Mark />} loading />);

    const button = screen.getByRole('button', { name: 'Removing' });
    expect(button.getAttribute('aria-busy')).toBe('true');
  });

  test('stays focusable, unlike a natively disabled button', () => {
    render(<IconButton label="Removing" icon={<Mark />} loading />);

    const button = screen.getByRole('button');
    button.focus();

    expect(document.activeElement).toBe(button);
    expect(button.hasAttribute('disabled')).toBe(false);
  });

  test('ignores activation', async () => {
    const onClick = vi.fn();
    const user = userEvent.setup();
    render(<IconButton label="Removing" icon={<Mark />} loading onClick={onClick} />);

    await user.click(screen.getByRole('button'));

    expect(onClick).not.toHaveBeenCalled();
  });

  test('keeps the mark in the DOM so the control does not change size', () => {
    const { container } = render(<IconButton label="Removing" icon={<Mark />} loading />);

    expect(container.querySelector('button > span[aria-hidden="true"] svg')).not.toBeNull();
  });
});
