import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import axe from 'axe-core';
import { createRef, type FormEvent } from 'react';
import { describe, expect, test, vi } from 'vitest';

import { Button } from './Button.js';

/**
 * Colour contrast is excluded because jsdom does not lay out or paint, so axe cannot measure it.
 * Contrast is verified visually against the token palette instead.
 */
const expectNoAxeViolations = async (container: HTMLElement): Promise<void> => {
  const results = await axe.run(container, {
    rules: { 'color-contrast': { enabled: false } },
  });

  expect(results.violations).toEqual([]);
};

describe('semantics', () => {
  test('renders a button whose accessible name comes from its children', () => {
    render(<Button>Finish setup</Button>);

    expect(screen.getByRole('button', { name: 'Finish setup' })).toBeDefined();
  });

  test('defaults to type="button" so it never submits a form by accident', () => {
    render(<Button>Continue</Button>);

    expect(screen.getByRole('button').getAttribute('type')).toBe('button');
  });

  test('accepts an explicit type', () => {
    render(<Button type="submit">Save</Button>);

    expect(screen.getByRole('button').getAttribute('type')).toBe('submit');
  });

  test('exposes the underlying button element through ref', () => {
    const ref = createRef<HTMLButtonElement>();
    render(<Button ref={ref}>Continue</Button>);

    expect(ref.current).toBe(screen.getByRole('button'));
  });

  test('passes className and native props through to the root element', () => {
    render(
      <Button className="custom" data-testid="probe" aria-keyshortcuts="Enter">
        Continue
      </Button>
    );

    const button = screen.getByTestId('probe');
    expect(button.classList.contains('custom')).toBe(true);
    expect(button.getAttribute('aria-keyshortcuts')).toBe('Enter');
  });

  test('icons are hidden from assistive technology so the label stays the accessible name', () => {
    render(
      <Button icon={<span>+</span>} iconEnd={<span>-&gt;</span>}>
        Add member
      </Button>
    );

    expect(screen.getByRole('button', { name: 'Add member' })).toBeDefined();
  });
});

describe('activation', () => {
  test('calls onClick on pointer activation', async () => {
    const onClick = vi.fn();
    const user = userEvent.setup();
    render(<Button onClick={onClick}>Continue</Button>);

    await user.click(screen.getByRole('button'));

    expect(onClick).toHaveBeenCalledTimes(1);
  });

  test('calls onClick on keyboard activation with Enter and Space', async () => {
    const onClick = vi.fn();
    const user = userEvent.setup();
    render(<Button onClick={onClick}>Continue</Button>);

    await user.tab();
    expect(document.activeElement).toBe(screen.getByRole('button'));

    await user.keyboard('{Enter}');
    await user.keyboard(' ');

    expect(onClick).toHaveBeenCalledTimes(2);
  });

  test('does not call onClick when disabled', async () => {
    const onClick = vi.fn();
    const user = userEvent.setup();
    render(
      <Button disabled onClick={onClick}>
        Continue
      </Button>
    );

    await user.click(screen.getByRole('button'));

    expect(onClick).not.toHaveBeenCalled();
  });
});

describe('loading', () => {
  test('reports aria-busy and aria-disabled while keeping the label', () => {
    render(<Button loading>Save changes</Button>);

    const button = screen.getByRole('button', { name: 'Save changes' });
    expect(button.getAttribute('aria-busy')).toBe('true');
    expect(button.getAttribute('aria-disabled')).toBe('true');
  });

  test('stays focusable, unlike a natively disabled button', () => {
    render(<Button loading>Save changes</Button>);

    const button = screen.getByRole('button');
    button.focus();

    expect(document.activeElement).toBe(button);
    expect(button.hasAttribute('disabled')).toBe(false);
  });

  test('ignores activation', async () => {
    const onClick = vi.fn();
    const user = userEvent.setup();
    render(
      <Button loading onClick={onClick}>
        Save changes
      </Button>
    );

    await user.click(screen.getByRole('button'));

    expect(onClick).not.toHaveBeenCalled();
  });

  test('does not submit the form it belongs to', async () => {
    const onSubmit = vi.fn((event: FormEvent) => {
      event.preventDefault();
    });
    const user = userEvent.setup();
    render(
      <form onSubmit={onSubmit}>
        <Button type="submit" loading>
          Save changes
        </Button>
      </form>
    );

    await user.click(screen.getByRole('button'));

    expect(onSubmit).not.toHaveBeenCalled();
  });

  test('replaces a leading icon rather than adding a slot beside it', () => {
    const { rerender, container } = render(<Button icon={<span>+</span>}>Add member</Button>);
    const slotsBefore = container.querySelectorAll('button > span').length;

    rerender(
      <Button icon={<span>+</span>} loading>
        Add member
      </Button>
    );

    expect(container.querySelectorAll('button > span').length).toBe(slotsBefore);
  });
});

describe('accessibility', () => {
  test('has no axe violations across variants, sizes and states', async () => {
    const { container } = render(
      <div>
        <Button>Filled</Button>
        <Button variant="outlined">Outlined</Button>
        <Button variant="ghost">Ghost</Button>
        <Button size="sm">Small</Button>
        <Button size="lg">Large</Button>
        <Button danger>Delete workspace</Button>
        <Button disabled>Disabled</Button>
        <Button loading>Loading</Button>
        <Button icon={<span>+</span>}>With icon</Button>
      </div>
    );

    await expectNoAxeViolations(container);
  });
});
