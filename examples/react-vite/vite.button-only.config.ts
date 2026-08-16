import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// A separate build, on purpose, and not a second entry of the one above.
//
// Two entries in a single build share their common code through a chunk that belongs to neither,
// so "what did this entry cost" cannot be answered by looking at the file named after it. An
// isolated build has no one to share with, which makes its whole output the answer.
export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'dist-button-only',
    rollupOptions: {
      input: 'src/button-only.tsx',
    },
  },
});
