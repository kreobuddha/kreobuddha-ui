import type { Meta, StoryObj } from '@storybook/react-vite';
import type { ReactElement } from 'react';

import { Button } from '../components/Button/Button.js';

import accents from './accents.module.css';
import palettes from './palettes.module.css';

/**
 * Second round: the structure of palette A was accepted but its blue was not. Four blues around
 * it, then five hues that are nothing like it. Neutrals and statuses are identical everywhere,
 * so the accent is the only thing changing.
 *
 * Nothing here ships; the page goes away once a colour is picked.
 */

interface Accent {
  key: string;
  name: string;
  className: string;
  note: string;
}

const BLUES: Accent[] = [
  {
    key: 'classic',
    name: 'A — classic blue',
    className: accents.classicBlue ?? '',
    note: 'The one you saw. Bright and unmistakably clickable.',
  },
  {
    key: 'azure',
    name: 'A1 — azure',
    className: accents.azure ?? '',
    note: 'Cooler and deeper. Less "web link", more instrument panel.',
  },
  {
    key: 'steel',
    name: 'A2 — steel blue',
    className: accents.steel ?? '',
    note: 'Desaturated and quiet. The most editorial of the blues.',
  },
  {
    key: 'cobalt',
    name: 'A3 — cobalt',
    className: accents.cobalt ?? '',
    note: 'Denser and more saturated than A. More weight, same clarity.',
  },
];

const OTHERS: Accent[] = [
  {
    key: 'emerald',
    name: 'B — emerald',
    className: accents.emerald ?? '',
    note: 'Green again, but colder and sharper than the evergreen you had.',
  },
  {
    key: 'teal',
    name: 'C — teal',
    className: accents.teal ?? '',
    note: 'Between blue and green. Calm, and rare enough to be distinctive.',
  },
  {
    key: 'sand',
    name: 'D — sand',
    className: accents.sand ?? '',
    note: 'Warm bronze. Distinctive, but sits close to the warning hue.',
  },
  {
    key: 'plum',
    name: 'E — plum',
    className: accents.plum ?? '',
    note: 'Muted violet. Editorial and uncommon in developer tools.',
  },
  {
    key: 'terracotta',
    name: 'F — terracotta',
    className: accents.terracotta ?? '',
    note: 'Warm clay. Closest to the old system, and hardest to tell from danger.',
  },
];

const cx = (...values: Array<string | undefined>): string => values.filter(Boolean).join(' ');

interface FrameProps {
  accent: Accent;
  dark?: boolean;
}

const Frame = ({ accent, dark = false }: FrameProps): ReactElement => (
  <div
    className={cx(palettes.palette, accent.className, accents.frame)}
    data-kreo-theme={dark ? 'dark' : undefined}
  >
    <div className={accents.swatch} />
    <div className={accents.row}>
      <Button size="sm">Finish setup</Button>
      <Button size="sm" variant="outlined">
        Back
      </Button>
      <Button size="sm" variant="ghost">
        Skip
      </Button>
    </div>
    <div className={accents.row}>
      <span className={accents.link}>Manage members</span>
      <Button size="sm" danger>
        Delete
      </Button>
    </div>
    <div className={accents.caption}>{dark ? 'dark' : 'light'}</div>
  </div>
);

const Group = ({ title, items }: { title: string; items: Accent[] }): ReactElement => (
  <section style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
    <div style={{ font: 'var(--kreo-type-title)', color: 'var(--kreo-text-primary)' }}>{title}</div>
    {items.map((accent) => (
      <div key={accent.key} style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        <div>
          <div style={{ font: 'var(--kreo-type-heading)', color: 'var(--kreo-text-primary)' }}>
            {accent.name}
          </div>
          <div style={{ font: 'var(--kreo-type-body)', color: 'var(--kreo-text-muted)' }}>
            {accent.note}
          </div>
        </div>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          <Frame accent={accent} />
          <Frame accent={accent} dark />
        </div>
      </div>
    ))}
  </section>
);

const meta = {
  title: 'Overview/Accents',
  parameters: {
    controls: { disable: true },
  },
} satisfies Meta;

export default meta;

type Story = StoryObj<typeof meta>;

export const Candidates: Story = {
  render: (): ReactElement => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 40 }}>
      <Group title="Around A — blues" items={BLUES} />
      <Group title="Different hues" items={OTHERS} />
    </div>
  ),
};
