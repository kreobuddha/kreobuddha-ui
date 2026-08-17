import { useEffect, useMemo, useRef, useState } from 'react';
import type { CSSProperties, ReactElement } from 'react';

import colorsCss from '../tokens/colors.css?raw';
import motionCss from '../tokens/motion.css?raw';
import shapeCss from '../tokens/shape.css?raw';
import spacingCss from '../tokens/spacing.css?raw';
import typographyCss from '../tokens/typography.css?raw';

import styles from './TokenTable.module.css';

/**
 * Documentation-only. This file lives under `src/` so it shares the project's Vite, TypeScript
 * and lint setup, but it is not exported from `src/index.ts` and `tsconfig.build.json` excludes
 * `src/docs`, so nothing here reaches `dist`.
 */

/** Which token stylesheet to list. The names match the files in `src/tokens/`. */
export type TokenSource = 'colors' | 'typography' | 'spacing' | 'shape' | 'motion';

/** How the resolved value is shown beside the token. */
export type TokenPreview = 'none' | 'swatch' | 'bar' | 'radius' | 'text';

export interface TokenTableProps {
  /** Which stylesheet's `--kreo-*` declarations to list, in the order they are declared. */
  source: TokenSource;
  /** Keep only tokens whose name starts with one of these prefixes, including `--kreo-`. */
  include?: string[];
  /** Drop tokens whose name starts with one of these prefixes. Applied after `include`. */
  exclude?: string[];
  /** The sample rendered in the third column. Defaults to no sample. */
  preview?: TokenPreview;
}

// The stylesheets are the single source of truth for what exists. Reading them as text means a
// page cannot list a token that was removed, or miss one that was added.
const sources: Record<TokenSource, string> = {
  colors: colorsCss,
  typography: typographyCss,
  spacing: spacingCss,
  shape: shapeCss,
  motion: motionCss,
};

const declarationPattern = /^\s*(--kreo-[\w-]+)\s*:/gm;

/**
 * Every `--kreo-*` custom property declared in a stylesheet, in declaration order and without
 * duplicates. A token redeclared by the dark theme is one token, listed where the light theme
 * declares it.
 */
const declaredTokens = (css: string): string[] => {
  const names: string[] = [];
  const seen = new Set<string>();

  for (const match of css.matchAll(declarationPattern)) {
    const name = match[1];

    if (name !== undefined && !seen.has(name)) {
      seen.add(name);
      names.push(name);
    }
  }

  return names;
};

const startsWithOneOf = (name: string, prefixes: string[]): boolean =>
  prefixes.some((prefix) => name.startsWith(prefix));

const sampleStyle = (name: string, preview: TokenPreview): CSSProperties | undefined => {
  switch (preview) {
    case 'swatch':
      return { background: `var(${name})` };
    case 'bar':
      return { inlineSize: `var(${name})` };
    case 'radius':
      return { borderRadius: `var(${name})` };
    case 'text':
      return { font: `var(${name})` };
    case 'none':
      return undefined;
  }
};

/**
 * Lists the tokens a stylesheet declares and resolves each value in the browser, so the page
 * shows what the current theme actually computes rather than a hand-copied duplicate. Values are
 * read from this table's own element, which means the toolbar theme switch is followed for free:
 * the preview decorator sets `data-kreo-theme` on an ancestor, and custom properties inherit.
 */
export const TokenTable = ({
  source,
  include,
  exclude,
  preview = 'none',
}: TokenTableProps): ReactElement => {
  const rootRef = useRef<HTMLTableElement>(null);

  // Joined into strings so a fresh array literal in MDX on every render does not invalidate the
  // memo, which would restart the effect below and re-enter it through its own state update.
  const includeKey = (include ?? []).join('|');
  const excludeKey = (exclude ?? []).join('|');

  const names = useMemo(() => {
    const includePrefixes = includeKey === '' ? [] : includeKey.split('|');
    const excludePrefixes = excludeKey === '' ? [] : excludeKey.split('|');

    return declaredTokens(sources[source])
      .filter((name) => includePrefixes.length === 0 || startsWithOneOf(name, includePrefixes))
      .filter((name) => !startsWithOneOf(name, excludePrefixes));
  }, [source, includeKey, excludeKey]);

  const [values, setValues] = useState<Record<string, string>>({});

  useEffect(() => {
    const read = (): void => {
      const node = rootRef.current;

      if (!node) {
        return;
      }

      const computed = getComputedStyle(node);
      const next: Record<string, string> = {};

      for (const name of names) {
        next[name] = computed.getPropertyValue(name).trim();
      }

      setValues(next);
    };

    read();

    // The theme is an attribute somewhere above this table, not a React prop, so nothing would
    // otherwise tell the component that every resolved value just changed.
    const observer = new MutationObserver(read);

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['data-kreo-theme'],
      subtree: true,
    });

    return () => {
      observer.disconnect();
    };
  }, [names]);

  return (
    <table className={styles.table} ref={rootRef}>
      <thead>
        <tr>
          <th scope="col">Token</th>
          <th scope="col">Value</th>
          {preview === 'none' ? null : <th scope="col">Sample</th>}
        </tr>
      </thead>
      <tbody>
        {names.map((name) => (
          <tr key={name}>
            <th scope="row">
              <code className={styles.name}>{name}</code>
            </th>
            <td>
              <code className={styles.value}>{values[name] ?? '…'}</code>
            </td>
            {preview === 'none' ? null : (
              <td>
                <span
                  className={styles[preview]}
                  style={sampleStyle(name, preview)}
                  aria-hidden="true"
                >
                  {preview === 'text' ? 'Handgloves 0123' : null}
                </span>
              </td>
            )}
          </tr>
        ))}
      </tbody>
    </table>
  );
};
