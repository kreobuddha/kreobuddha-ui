import type { Meta, StoryObj } from '@storybook/react-vite';

import { BuildProbe } from './BuildProbe';

const meta = {
  title: 'Internal/BuildProbe',
  component: BuildProbe,
} satisfies Meta<typeof BuildProbe>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};
