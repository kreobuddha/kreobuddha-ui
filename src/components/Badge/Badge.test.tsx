import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import axe from 'axe-core';
import { createRef } from 'react';
import { describe, expect, test } from 'vitest';

import { Badge } from './Badge.js';

/**
 * Colour contrast is excluded because jsdom does not lay out or paint, so axe cannot measure it.
 * Contrast is measured against the token palette by `npm run check:contrast` instead.
 */
const expectNoAxeViolations = async (container: HTMLElement): Promise<void> => {
  const results = await axe.run(container, {
    rules: { 'color-contrast': { enabled: false } },
  });

  expect(results.violations).toEqual([]);
};

describe('semantics', () => {
  test('renders its children as text', () => {
    render(<Badge>admin</Badge>);

    expect(screen.getByText('admin')).toBeDefined();
  });

  test('exposes the underlying span through ref', () => {
    const ref = createRef<HTMLSpanElement>();
    render(<Badge ref={ref}>admin</Badge>);

    expect(ref.current).toBe(screen.getByText('admin'));
    expect(ref.current?.tagName).toBe('SPAN');
  });

  test('carries no ARIA role: it is text, not a widget', () => {
    render(<Badge>admin</Badge>);

    expect(screen.getByText('admin').hasAttribute('role')).toBe(false);
  });

  test('is not reachable with the keyboard', async () => {
    const user = userEvent.setup();
    render(
      <>
        <Badge>admin</Badge>
        <button type="button">After</button>
      </>
    );

    await user.tab();

    // The first tab stop is the button after it, so the badge is outside the tab order.
    expect(document.activeElement).toBe(screen.getByRole('button', { name: 'After' }));
  });
});

describe('props', () => {
  test('className and style land on the root element', () => {
    render(
      <Badge className="custom" style={{ marginTop: '4px' }}>
        admin
      </Badge>
    );

    const badge = screen.getByText('admin');
    expect(badge.classList.contains('custom')).toBe(true);
    expect(badge.style.marginTop).toBe('4px');
  });

  test('keeps its own classes when className is given', () => {
    const { container: plain } = render(<Badge>admin</Badge>);
    const { container: custom } = render(<Badge className="custom">admin</Badge>);

    const plainClasses = plain.querySelector('span')?.className ?? '';
    for (const name of plainClasses.split(' ')) {
      expect(custom.querySelector('span')?.className).toContain(name);
    }
  });

  test('passes native props through to the root element', () => {
    render(
      <Badge id="role-badge" data-testid="probe" title="Workspace administrator">
        admin
      </Badge>
    );

    const badge = screen.getByTestId('probe');
    expect(badge.getAttribute('id')).toBe('role-badge');
    expect(badge.getAttribute('title')).toBe('Workspace administrator');
  });

  test('a tone changes the root class', () => {
    const { container: neutral } = render(<Badge>admin</Badge>);
    const { container: danger } = render(<Badge tone="danger">admin</Badge>);

    expect(danger.querySelector('span')?.className).not.toBe(
      neutral.querySelector('span')?.className
    );
  });
});

describe('dot', () => {
  test('is absent by default', () => {
    const { container } = render(<Badge>admin</Badge>);

    expect(container.querySelector('span > span')).toBeNull();
  });

  test('is rendered and hidden from assistive technology when requested', () => {
    const { container } = render(<Badge dot>passing</Badge>);

    expect(container.querySelector('span > span[aria-hidden="true"]')).not.toBeNull();
  });

  test('does not become part of the text', () => {
    render(<Badge dot>passing</Badge>);

    expect(screen.getByText('passing').textContent).toBe('passing');
  });
});

describe('accessibility', () => {
  test('has no axe violations across tones, with and without a dot', async () => {
    const { container } = render(
      <div>
        <Badge>draft</Badge>
        <Badge tone="accent">beta</Badge>
        <Badge tone="success" dot>
          passing
        </Badge>
        <Badge tone="warning" dot>
          deprecated
        </Badge>
        <Badge tone="danger" dot>
          3 failed
        </Badge>
        <Badge tone="info">read-only</Badge>
      </div>
    );

    await expectNoAxeViolations(container);
  });
});
