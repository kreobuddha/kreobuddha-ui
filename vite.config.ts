import { defineConfig } from 'vite';

export default defineConfig({
  build: {
    lib: {
      entry: 'src/index.ts',
      formats: ['es'],
      fileName: 'index',
      cssFileName: 'styles',
    },
    sourcemap: true,
    rollupOptions: {
      // The React runtime belongs to the consuming application, never to this bundle.
      external: ['react', 'react-dom', 'react/jsx-runtime'],
      output: {
        // The JS output mirrors `src` so it lines up with the declaration tree tsc emits.
        // Bundling to a single file would leave every `./components/…js` path in the .d.ts
        // files pointing at something that does not exist.
        preserveModules: true,
        preserveModulesRoot: 'src',
        entryFileNames: '[name].js',
      },
    },
  },
});
