import type { StorybookConfig } from '@storybook/react-vite';

const config: StorybookConfig = {
  stories: ['../src/**/*.stories.tsx'],
  framework: {
    name: '@storybook/react-vite',
    options: {},
  },
  // This project does not send data to external services without an explicit decision.
  core: {
    disableTelemetry: true,
  },
};

export default config;
