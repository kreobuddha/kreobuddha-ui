import type { StorybookConfig } from '@storybook/react-vite';

const config: StorybookConfig = {
  stories: ['../src/**/*.mdx', '../src/**/*.stories.tsx'],
  addons: ['@storybook/addon-a11y', '@storybook/addon-docs', '@storybook/addon-vitest'],
  framework: {
    name: '@storybook/react-vite',
    options: {},
  },
  // `react-docgen` is the framework default, stated here so it cannot change underneath the
  // documentation. It reads every prop this library declares, with its JSDoc and its default,
  // and leaves the inherited DOM attributes out — which is what the tables want. The alternative,
  // `react-docgen-typescript`, would add the inherited attributes and needs a prop filter and a
  // compiler run to remove them again; it buys nothing here.
  typescript: {
    reactDocgen: 'react-docgen',
  },
  // This project does not send data to external services without an explicit decision.
  core: {
    disableTelemetry: true,
  },
  viteFinal: (config) => {
    // Storybook merges the project's vite config, which is written for a library build:
    // React is declared external and the output is a preserved module tree. Applied to
    // Storybook's own app build that leaves React unresolved at runtime, so the library
    // build options are dropped here.
    const build = { ...config.build };
    delete build.lib;
    delete build.rollupOptions;

    return {
      ...config,
      build,
      // Storybook 10 on Vite 8 does not pre-bundle the React packages on its own in dev mode,
      // and React 19 is CommonJS, so the browser receives a module with no default export and
      // the preview never boots. Requesting them explicitly restores dependency optimisation.
      optimizeDeps: {
        ...config.optimizeDeps,
        include: [
          ...(config.optimizeDeps?.include ?? []),
          'react',
          'react-dom',
          'react-dom/client',
          'react/jsx-runtime',
          'react/jsx-dev-runtime',
        ],
      },
    };
  },
};

export default config;
