# Kreobuddha UI

Kreobuddha UI is an independent, public, frontend-only React component library and design-system
portfolio project. Its purpose is to provide a reusable UI foundation for future projects while
demonstrating deliberate API design, accessibility, type safety, styling, testing, packaging,
documentation, and release discipline.

The repository is early-stage unless its current files prove otherwise. Never describe it as
production-ready, published, standards-compliant, or adopted by real consumers without evidence.

## Communication

- Discuss requirements, questions, assumptions, alternatives, plans, trade-offs, progress, review
  findings, and final results with Rustam in Russian by default.
- Keep source code, identifiers, filenames, commands, terminal output, errors, code comments, test
  names, commit messages, changesets, changelogs, Storybook content, and all public repository
  documentation in English.
- Do not switch the conversation to English merely because a prompt, source file, or official
  document is in English.
- Do not translate error messages, API names, library names, or established technical terms when
  translation would reduce precision. Explain unfamiliar terms in Russian when useful.
- If ambiguity can materially change the public API, architecture, dependencies, repository state,
  or result, explain it in Russian and ask one focused question. Otherwise, state a reasonable
  assumption in Russian and continue.
- Before a complex implementation, briefly restate the intended outcome and important constraints
  in Russian.

## Clean-room and confidentiality rules

- Private knowledge bases and files outside this repository are not project sources. They must
  never be copied, quoted, committed, linked, mentioned, or required by public project files.
- Do not copy or closely reproduce code, component APIs, names, tokens, styles, documentation,
  screenshots, assets, internal requirements, business data, repository structure, or proprietary
  details from any employer-owned source.
- Do not inspect private work repositories unless Rustam explicitly requests a narrowly scoped
  comparison.
- General frontend knowledge and patterns learned through experience may be applied only through
  an original implementation appropriate to this project.
- If the provenance of an idea or artifact is unclear, stop and ask before using it.

## Sources of truth

Use this precedence when instructions conflict:

1. Rustam's current explicit request.
2. This `CLAUDE.md`.
3. Accepted ADRs in `docs/adr/`.
4. `docs/ARCHITECTURE.md` and `docs/COMPONENT_STANDARD.md`.
5. `docs/PROJECT_BRIEF.md`, `docs/QUALITY.md`, `docs/RELEASES.md`, and `docs/ROADMAP.md`.
6. Existing implementation and tests.

Roadmap items are plans, not permission to implement every phase. A proposed ADR is not an accepted
decision. If documentation and code disagree, report the conflict instead of silently choosing one.

## Scope

- Keep Kreobuddha UI frontend-only.
- In scope: a distributable React package, CSS design tokens, component styles, Storybook, static
  examples, tests, package-consumer fixtures, and public documentation.
- Out of scope unless Rustam explicitly approves it: backend services, authentication, databases,
  remote persistence, analytics, server-side product features, a component generator, a CLI, a
  Figma integration, or a full application suite.
- Stories and examples must use deterministic local fixtures. Do not introduce a backend to make a
  demo appear more substantial.
- Keep the repository single-package until a real consumer proves that another package boundary is
  necessary. Do not add a monorepo or task orchestrator speculatively.
- Do not attempt to compete with exhaustive UI frameworks. Build a small, coherent set of components
  driven by real consumer needs.

## Evidence and assumptions

- Inspect relevant files before proposing or making changes.
- Clearly distinguish repository-verified facts, Rustam-confirmed requirements, assumptions, and
  recommendations.
- Never claim a command passed unless it was run and its result was observed.
- Never claim browser support, accessibility conformance, package compatibility, tree shaking,
  performance, bundle size, publication, or adoption without corresponding evidence.
- Verify current dependency and platform information using authoritative sources when it affects a
  decision. Do not rely on remembered version numbers.

## Working method

- For unfamiliar, architectural, dependency-heavy, public-API, or multi-file work, explore first
  and propose a concise plan before editing.
- Preserve existing user changes and avoid unrelated refactoring, dependency upgrades, formatting,
  and generated-file churn.
- Work in small vertical slices. Complete and verify the current slice before proposing the next.
- Build one component at a time. Do not generate the planned component catalogue in one pass.
- Do not implement the next roadmap component or phase without explicit approval.
- Prefer the smallest design that satisfies current requirements. A hypothetical future use is not
  sufficient justification for an abstraction.
- Treat exported components, types, CSS variables, DOM semantics, keyboard behavior, package
  exports, and defaults as compatibility-sensitive public API.
- Explain the concrete need and trade-offs before adding a runtime dependency.

## Component workflow

For each component:

1. Define its purpose, non-goals, public API, supported states, and composition model.
2. Define semantic HTML, accessible naming, keyboard interaction, focus behavior, and disabled,
   read-only, loading, or invalid behavior where applicable.
3. Identify the existing tokens and primitives it needs. Do not expand the token system merely for
   symmetry.
4. Implement the smallest complete version.
5. Add focused behavior, interaction, and accessibility checks.
6. Add deterministic English stories for representative states, edge cases, and composition.
7. Add concise English public documentation and intentional exports.
8. Run relevant verification and report exact evidence in Russian.

Do not batch-create placeholder components, stories, tests, or docs merely to increase component
count.

## Architecture guardrails

- Prefer native HTML semantics and platform behavior before ARIA or custom interaction models.
- Prefer composition and readable APIs over configuration-heavy components.
- Do not introduce a custom styling engine, token compiler, plugin system, schema language,
  polymorphic `as` API, or generic wrapper hierarchy without a current documented need.
- CSS class names are implementation details. Documented semantic CSS custom properties are public
  API and follow SemVer.
- Do not hand-roll complex focus management for overlays or composite widgets without an accepted
  ADR and focused keyboard/focus tests.
- Avoid `any`, broad assertions, ignored errors, disabled lint rules, and unexplained test skips.
- Accessibility is not equivalent to an automated axe result. Verify semantics, accessible names,
  keyboard behavior, focus, visible states, contrast, reduced motion, and forced-colors behavior as
  applicable.

## Verification

Use the scripts that actually exist in `package.json`. For implementation changes, normally verify:

- type checking;
- non-mutating lint and format checks;
- focused unit and interaction tests;
- package build and declaration output;
- Storybook build;
- package artifact and consumer smoke test when public exports change;
- visual inspection for UI changes;
- keyboard and accessibility behavior for interactive components.

Additional rules:

- Check whether a command mutates files before running it. Do not run repo-wide autofix or formatting
  over unrelated files.
- Do not weaken types, tests, lint rules, accessibility checks, or acceptance criteria to make a
  check pass.
- Separate failures introduced by the change from verified pre-existing failures.
- For documentation-only work, do not imply that package or UI verification was performed.
- If visual or manual accessibility verification is unavailable, state the limitation explicitly.

## Git, repository, publishing, and external actions

- The local repository directory and GitHub repository name are `kreobuddha-ui`.
- Do not create commits, branches, tags, remotes, pushes, pull requests, releases, deployments, or
  npm publications unless Rustam explicitly requests the exact action or approves the corresponding
  initialization gate in `INIT_PROMPT.md`.
- Never rewrite history, discard local changes, or use destructive Git commands.
- Before changing a lockfile or generated file, verify that the change is expected and scoped.
- Keep the package private until Rustam explicitly approves publication readiness.
- Do not upload repository content or private reference material to an external service without
  explicit permission.

## Completion report

Finish each implementation task in Russian with:

- what changed;
- changed files;
- decisions and assumptions;
- exact verification commands and results;
- remaining limitations or risks;
- the smallest sensible next step.

Do not present optional future work as approved scope.

## Context compaction

When compacting context, preserve:

- modified and uncommitted files;
- user-confirmed requirements;
- accepted public API and architecture decisions;
- rejected alternatives and reasons;
- the current phase or component slice and pending work;
- verification commands and latest results;
- known risks and unresolved questions;
- the clean-room and Russian-language rules from this file.
