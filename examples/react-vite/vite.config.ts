import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// The application build: every public export, used the way a consumer would.
export default defineConfig({
  plugins: [react()],
});
