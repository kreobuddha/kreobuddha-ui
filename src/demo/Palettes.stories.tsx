import type { Meta, StoryObj } from '@storybook/react-vite';
import type { ReactElement } from 'react';

import { Button } from '../components/Button/Button.js';

import styles from './palettes.module.css';

/**
 * Three candidate palettes for the visual refresh, judged as working interface rather than as
 * swatches. All three share one neutral ramp and one status set, so the only thing that differs
 * between the columns is the accent.
 *
 * Nothing on this page ships. It exists to make a choice, and goes away once one is made.
 */

interface PaletteOption {
  key: string;
  name: string;
  accentClass: string;
  note: string;
}

const OPTIONS: PaletteOption[] = [
  {
    key: 'blue',
    name: 'A — classic blue',
    accentClass: styles.blue ?? '',
    note: 'Reads as "interactive" instantly. The safest and the least distinctive.',
  },
  {
    key: 'indigo',
    name: 'B — indigo',
    accentClass: styles.indigo ?? '',
    note: 'Same clarity, more personality, further from a default browser link.',
  },
  {
    key: 'ink',
    name: 'C — ink',
    accentClass: styles.ink ?? '',
    note: 'Deep navy. The most editorial and the quietest; weakest pull as a call to action.',
  },
];

const cx = (...values: Array<string | undefined>): string => values.filter(Boolean).join(' ');

interface SpecimenProps {
  option: PaletteOption;
  dark?: boolean;
}

const Specimen = ({ option, dark = false }: SpecimenProps): ReactElement => (
  <div
    className={cx(styles.palette, option.accentClass, styles.frame)}
    data-kreo-theme={dark ? 'dark' : undefined}
  >
    <div className={styles.caption}>{dark ? 'DARK' : 'LIGHT'}</div>

    <div className={styles.card}>
      <p className={styles.title}>Workspace access</p>
      <p className={styles.body}>
        Приглашения уходят, когда вы завершите настройку. Invitations go out when you finish setup.
      </p>
      <div className={styles.field}>team@example.com</div>
      <div className={styles.row}>
        <Button size="sm">Finish setup</Button>
        <Button size="sm" variant="outlined">
          Back
        </Button>
        <Button size="sm" variant="ghost">
          Skip
        </Button>
      </div>
      <div className={styles.row}>
        <Button size="sm" danger>
          Delete
        </Button>
        <span className={styles.link}>Manage members</span>
        <span className={styles.caption}>3 sent · Step 2 / 4</span>
      </div>
    </div>
  </div>
);

const meta = {
  title: 'Overview/Palettes',
  parameters: {
    controls: { disable: true },
    // The decorator's own theme would fight the per-specimen themes on this page.
    theme: { disable: true },
  },
} satisfies Meta;

export default meta;

type Story = StoryObj<typeof meta>;

export const Candidates: Story = {
  render: (): ReactElement => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
      {OPTIONS.map((option) => (
        <section key={option.key} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div>
            <div style={{ font: 'var(--kreo-type-heading)', color: 'var(--kreo-text-primary)' }}>
              {option.name}
            </div>
            <div style={{ font: 'var(--kreo-type-body)', color: 'var(--kreo-text-muted)' }}>
              {option.note}
            </div>
          </div>
          <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
            <Specimen option={option} />
            <Specimen option={option} dark />
          </div>
        </section>
      ))}
    </div>
  ),
};
