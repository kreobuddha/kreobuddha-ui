import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// The workbench is served from the root of its own port by `scripts/serve-static.mjs`, so the
// default base is correct and deliberately not changed.
export default defineConfig({
  plugins: [react()],
});
