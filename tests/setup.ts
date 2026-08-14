import { cleanup } from '@testing-library/react';
import { afterEach } from 'vitest';

// Testing Library only registers its own automatic cleanup when Vitest globals are enabled.
// This project keeps globals off, so unmounting between tests is wired up explicitly.
afterEach(() => {
  cleanup();
});
