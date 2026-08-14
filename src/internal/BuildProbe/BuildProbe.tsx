import styles from './BuildProbe.module.css';

export interface BuildProbeProps {
  /** Text rendered inside the probe. */
  label?: string;
}

/**
 * Toolchain probe, not a component of this library.
 *
 * It exists only so Phase 0 can prove that JSX compilation, CSS Modules, CSS extraction,
 * declaration emit, package exports, and consumer installation all work end to end.
 * It is scheduled for removal in Phase 1, when the first real component lands.
 */
export function BuildProbe({ label = 'kreobuddha-ui build probe' }: BuildProbeProps) {
  return <span className={styles.probe}>{label}</span>;
}
