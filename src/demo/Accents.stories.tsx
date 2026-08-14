import type { Meta, StoryObj } from '@storybook/react-vite';
import type { ReactElement } from 'react';

import { Button } from '../components/Button/Button.js';

import accents from './accents.module.css';
import palettes from './palettes.module.css';

/**
 * Third round: teal and plum survived, so this page holds variations around each. Neutrals and
 * statuses are identical everywhere, and every control is neutral or accent-coloured — the danger
 * hue is deliberately absent, because a red button next to a swatch makes the accent hard to read.
 *
 * Nothing here ships; the page goes away once a colour is picked.
 */

interface Accent {
  key: string;
  name: string;
  className: string;
  note: string;
}

const TEALS: Accent[] = [
  {
    key: 'teal',
    name: 'C — teal',
    className: accents.teal ?? '',
    note: 'The one you saw. Balanced between blue and green.',
  },
  {
    key: 'petrol',
    name: 'C1 — petrol',
    className: accents.petrol ?? '',
    note: 'Pulled towards blue. Cooler, and reads as an instrument rather than a plant.',
  },
  {
    key: 'seaGreen',
    name: 'C2 — sea green',
    className: accents.seaGreen ?? '',
    note: 'Pulled towards green. Livelier, and the closest of these to the old evergreen.',
  },
  {
    key: 'forestTeal',
    name: 'C3 — deep teal',
    className: accents.forestTeal ?? '',
    note: 'Darker and denser. Very quiet; the least insistent of the four.',
  },
];

const PLUMS: Accent[] = [
  {
    key: 'plum',
    name: 'E — plum',
    className: accents.plum ?? '',
    note: 'The one you saw. Clearly purple without going bright.',
  },
  {
    key: 'mauve',
    name: 'E1 — mauve',
    className: accents.mauve ?? '',
    note: 'Desaturated and dusty. The most editorial and the least "brand colour".',
  },
  {
    key: 'aubergine',
    name: 'E2 — aubergine',
    className: accents.aubergine ?? '',
    note: 'Deeper and heavier. Reads almost as a dark neutral until you look twice.',
  },
  {
    key: 'berry',
    name: 'E3 — berry',
    className: accents.berry ?? '',
    note: 'Pulled towards magenta. Warmest and boldest — closest to conflicting with danger.',
  },
  {
    key: 'violet',
    name: 'E4 — violet',
    className: accents.violet ?? '',
    note: 'Pulled towards blue. Keeps the purple character but behaves like a blue accent.',
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
      <Button size="sm" variant="outlined">
        Delete
      </Button>
    </div>
    <div className={accents.caption}>{dark ? 'dark' : 'light'}</div>
  </div>
);

interface GroupProps {
  title: string;
  items: Accent[];
}

const Group = ({ title, items }: GroupProps): ReactElement => (
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
      <Group title="Around C — teal" items={TEALS} />
      <Group title="Around E — plum" items={PLUMS} />
    </div>
  ),
};
