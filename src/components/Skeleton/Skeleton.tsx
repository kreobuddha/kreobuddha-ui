import type { ComponentPropsWithRef, ReactElement } from 'react';

import { cx } from '../../internal/cx.js';

import styles from './Skeleton.module.css';

/**
 * A placeholder block. It has no props of its own on purpose: its size is its only variable, and
 * a consumer already has two ways to set a size — `style` and `className` — so a `width`/`height`
 * pair would be a second, narrower spelling of what CSS does better inside a grid or a flex row.
 *
 * `children` is removed rather than forwarded. The block stands in for content that is not there
 * yet, and it is hidden from assistive technology, so anything placed inside it would be text
 * nobody can reach.
 */
export type SkeletonProps = Omit<ComponentPropsWithRef<'span'>, 'children'>;

export const Skeleton = ({ className, ...rest }: SkeletonProps): ReactElement => (
  // `aria-hidden` sits after the spread, so it is part of the contract rather than a default a
  // consumer can turn off: a skeleton has nothing to announce, and the loading state itself
  // belongs to whatever surrounds it — visible text, `aria-busy`, or a labelled `Spinner`.
  <span {...rest} aria-hidden="true" className={cx(styles.skeleton, className)} />
);
