import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, test, vi } from 'vitest';

import { Alert } from './Alert.js';

describe('content', () => {
  test('renders its message', () => {
    render(<Alert>Could not reach the server</Alert>);

    expect(screen.getByText('Could not reach the server')).toBeDefined();
  });

  test('renders an optional title above the message', () => {
    render(<Alert title="Save failed">Try again in a moment</Alert>);

    expect(screen.getByText('Save failed')).toBeDefined();
    expect(screen.getByText('Try again in a moment')).toBeDefined();
  });

  test('the tone mark is hidden, so it never becomes part of the text', () => {
    const { container } = render(<Alert tone="danger">Failed</Alert>);

    expect(container.querySelector('svg')?.closest('span')?.getAttribute('aria-hidden')).toBe(
      'true'
    );
  });

  test('a supplied icon replaces the tone mark', () => {
    const { container } = render(<Alert icon={<span data-testid="own-mark" />}>Message</Alert>);

    expect(screen.getByTestId('own-mark')).toBeDefined();
    expect(container.querySelector('svg')).toBeNull();
  });
});

describe('announcement', () => {
  test('is silent by default, so a banner already on screen does not interrupt', () => {
    render(<Alert>Read-only workspace</Alert>);

    expect(screen.queryByRole('status')).toBeNull();
    expect(screen.queryByRole('alert')).toBeNull();
  });

  test('live danger interrupts', () => {
    render(
      <Alert live tone="danger">
        Could not save
      </Alert>
    );

    expect(screen.getByRole('alert')).toBeDefined();
  });

  test('live quieter tones wait for a pause', () => {
    render(
      <Alert live tone="success">
        Changes saved
      </Alert>
    );

    expect(screen.getByRole('status')).toBeDefined();
    expect(screen.queryByRole('alert')).toBeNull();
  });
});

describe('dismissal', () => {
  test('has no close button unless onDismiss is given', () => {
    render(<Alert>Message</Alert>);

    expect(screen.queryByRole('button')).toBeNull();
  });

  test('calls onDismiss and names the button', async () => {
    const onDismiss = vi.fn();
    const user = userEvent.setup();
    render(<Alert onDismiss={onDismiss}>Message</Alert>);

    await user.click(screen.getByRole('button', { name: 'Dismiss' }));

    expect(onDismiss).toHaveBeenCalledTimes(1);
  });

  test('the close button label can be changed', () => {
    render(
      <Alert onDismiss={() => {}} dismissLabel="Hide this notice">
        Message
      </Alert>
    );

    expect(screen.getByRole('button', { name: 'Hide this notice' })).toBeDefined();
  });
});

describe('api', () => {
  test('passes className and native props through to the root element', () => {
    render(
      <Alert className="custom" data-testid="probe">
        Message
      </Alert>
    );

    expect(screen.getByTestId('probe').classList.contains('custom')).toBe(true);
  });
});
