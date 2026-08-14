import { render, screen } from '@testing-library/react';
import { expect, test } from 'vitest';

import { BuildProbe } from './BuildProbe';

test('renders its default label', () => {
  render(<BuildProbe />);

  expect(screen.getByText('kreobuddha-ui build probe')).toBeDefined();
});

test('renders a provided label', () => {
  render(<BuildProbe label="custom" />);

  expect(screen.getByText('custom')).toBeDefined();
});
