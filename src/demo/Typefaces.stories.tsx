import type { Meta, StoryObj } from '@storybook/react-vite';
import type { CSSProperties, ReactElement } from 'react';

// Candidates for the text face, loaded only here. None of these reaches the published package —
// this story exists to choose one, after which the others are removed.
import '@fontsource/inter/400.css';
import '@fontsource/inter/600.css';
import '@fontsource/source-sans-3/400.css';
import '@fontsource/source-sans-3/600.css';
import '@fontsource/golos-text/400.css';
import '@fontsource/golos-text/600.css';
import '@fontsource/onest/400.css';
import '@fontsource/onest/600.css';

/**
 * The text face is being reconsidered: the direction moved to a calm, editorial one, and IBM Plex
 * Sans pulls back towards engineering. Every candidate below covers Cyrillic and is OFL licensed.
 */

interface Candidate {
  name: string;
  stack: string;
  note: string;
}

const CANDIDATES: Candidate[] = [
  {
    name: 'IBM Plex Sans',
    stack: "'IBM Plex Sans', sans-serif",
    note: 'Current. Engineering character, real italics, pairs with the mono already bundled.',
  },
  {
    name: 'Inter',
    stack: "'Inter', sans-serif",
    note: 'The default of modern interfaces. Neutral to the point of anonymous; real italics.',
  },
  {
    name: 'Source Sans 3',
    stack: "'Source Sans 3', sans-serif",
    note: 'Humanist and warm, the most editorial of the four. Real italics.',
  },
  {
    name: 'Golos Text',
    stack: "'Golos Text', sans-serif",
    note: 'Cyrillic-first, drawn for Russian text rather than adapted to it. No italics.',
  },
  {
    name: 'Onest',
    stack: "'Onest', sans-serif",
    note: 'Contemporary Cyrillic-first, slightly geometric. No italics.',
  },
];

const page: CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: 'var(--kreo-space-8)',
  maxWidth: 720,
};

const card: CSSProperties = {
  background: 'var(--kreo-surface-card)',
  border: '1px solid var(--kreo-border-default)',
  borderRadius: 'var(--kreo-radius-lg)',
  padding: 'var(--kreo-space-6)',
  display: 'flex',
  flexDirection: 'column',
  gap: 'var(--kreo-space-3)',
};

const eyebrow: CSSProperties = {
  font: 'var(--kreo-type-label)',
  letterSpacing: 'var(--kreo-tracking-label)',
  textTransform: 'uppercase',
  color: 'var(--kreo-text-subtle)',
};

const Specimen = ({ name, stack, note }: Candidate): ReactElement => (
  <section style={card}>
    <span style={eyebrow}>{name}</span>
    <p style={{ margin: 0, font: 'var(--kreo-type-body)', color: 'var(--kreo-text-muted)' }}>
      {note}
    </p>

    <div style={{ fontFamily: stack, display: 'flex', flexDirection: 'column', gap: 12 }}>
      <div
        style={{
          fontSize: 24,
          fontWeight: 600,
          letterSpacing: '-0.015em',
          color: 'var(--kreo-text-primary)',
        }}
      >
        Настройки рабочего пространства
      </div>
      <div style={{ fontSize: 18, fontWeight: 600, color: 'var(--kreo-text-primary)' }}>
        Members and access
      </div>
      <p style={{ margin: 0, fontSize: 14, lineHeight: 1.65, color: 'var(--kreo-text-body)' }}>
        Приглашения уходят, когда вы завершите настройку. Пароль нельзя изменить после создания
        рабочего пространства — выберите тот, который не придётся восстанавливать.
      </p>
      <p style={{ margin: 0, fontSize: 14, lineHeight: 1.65, color: 'var(--kreo-text-body)' }}>
        Invitations go out when you finish setup. Twelve characters minimum; a passphrase beats a
        puzzle.
      </p>
      <div style={{ display: 'flex', gap: 16, alignItems: 'baseline' }}>
        <span style={{ fontSize: 13, fontWeight: 500 }}>Завершить настройку</span>
        <span style={{ fontSize: 13, fontWeight: 500 }}>Finish setup</span>
        <span style={{ fontSize: 13, fontWeight: 500, color: 'var(--kreo-text-muted)' }}>
          Отменить
        </span>
      </div>
    </div>
  </section>
);

const meta = {
  title: 'Overview/Typefaces',
  parameters: {
    controls: { disable: true },
  },
} satisfies Meta;

export default meta;

type Story = StoryObj<typeof meta>;

export const Candidates: Story = {
  render: (): ReactElement => (
    <div style={page}>
      {CANDIDATES.map((candidate) => (
        <Specimen key={candidate.name} {...candidate} />
      ))}
    </div>
  ),
};
