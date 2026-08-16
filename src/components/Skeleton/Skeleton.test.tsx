import { render, screen } from '@testing-library/react';
import { createRef } from 'react';
import { describe, expect, test } from 'vitest';

import { Skeleton } from './Skeleton.js';

// jsdom neither lays out nor paints, so the size, the radius and the pulse are not asserted here.
// The two stories with `play` functions cover the layout, and `check:visual` covers the paint.

describe('semantics', () => {
  test('is hidden from assistive technology', () => {
    const { container } = render(<Skeleton />);

    expect(container.firstElementChild?.getAttribute('aria-hidden')).toBe('true');
  });

  test('carries no role of its own', () => {
    const { container } = render(<Skeleton />);

    expect(container.firstElementChild?.hasAttribute('role')).toBe(false);
  });

  test('stays hidden when a consumer tries to unhide it', () => {
    // The prop is accepted by the native span typing, so the contract has to hold at runtime
    // rather than only in the types: an announced skeleton would read as an empty element.
    const { container } = render(<Skeleton aria-hidden={false} />);

    expect(container.firstElementChild?.getAttribute('aria-hidden')).toBe('true');
  });

  test('is not focusable', () => {
    const { container } = render(<Skeleton />);

    expect(container.firstElementChild?.hasAttribute('tabindex')).toBe(false);
  });
});

describe('api', () => {
  test('passes className and native props through to the root element', () => {
    render(<Skeleton className="custom" data-testid="probe" />);

    const root = screen.getByTestId('probe');
    expect(root.classList.contains('custom')).toBe(true);
  });

  test('keeps its own class alongside the consumer class', () => {
    render(<Skeleton className="custom" data-testid="probe" />);

    expect(screen.getByTestId('probe').classList.length).toBeGreaterThan(1);
  });

  test('exposes the underlying element through ref', () => {
    const ref = createRef<HTMLSpanElement>();
    render(<Skeleton ref={ref} data-testid="probe" />);

    expect(ref.current).toBe(screen.getByTestId('probe'));
  });

  test('renders a span, so it is valid inside a paragraph', () => {
    render(<Skeleton data-testid="probe" />);

    expect(screen.getByTestId('probe').tagName).toBe('SPAN');
  });
});
