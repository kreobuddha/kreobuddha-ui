# Kreobuddha UI

Kreobuddha UI is an independent, public, frontend-only React component library and design-system
portfolio project. Its purpose is to provide a reusable UI foundation for future projects while
demonstrating deliberate API design, accessibility, type safety, styling, testing, packaging,
documentation, and release discipline.

The repository is early-stage unless its current files prove otherwise. Never describe it as
production-ready, published, standards-compliant, or adopted by real consumers without evidence.

## Communication

- **Talk to Rustam in Russian. Write the repository in English** — code, identifiers, filenames,
  commands, comments, test names, commit messages, changelog, Storybook, and every public document.
  An English prompt or source file does not switch the conversation.
- Do not translate error messages, API or library names, or established terms when translating
  would cost precision. Explain an unfamiliar term in Russian when it helps.
- Ambiguity that could change the public API, architecture, dependencies or repository state: one
  focused question. Anything else: state the assumption and continue.
- Before a complex implementation, restate the intended outcome and constraints briefly.

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
5. `docs/PROJECT_BRIEF.md`, `docs/QUALITY.md`, `docs/RELEASES.md`, `docs/ROADMAP.md`, and
   `docs/CODE_STYLE.md`.
6. Existing implementation and tests.

Roadmap items are plans, not permission to implement every phase. A proposed ADR is not an accepted
decision. If documentation and code disagree, report the conflict instead of silently choosing one.

## The design source is disconnected

The visual foundation was originally authored in a separate Claude Design project. Its values were
ported into `src/tokens/`, recorded in ADR-0001, and **that project is no longer consulted.** Do not
read from it, sync to it, or cite it when justifying a change. Where older ADRs mention it, they are
recording history, not pointing at a live dependency.

This repository is self-contained and is the single source of truth. Rustam gives instructions here,
in plain language, and the loop is:

1. He describes what he wants changed about how something looks or behaves.
2. Translate it into token or component changes — **measure the result rather than judging it by
   eye**, using `npm run check:contrast` and the story tests.
3. Show it in Storybook. `Overview → Kit` renders everything the library ships, in either theme.
4. Anything that changes a public token, a public prop, or a documented visual contract gets an ADR.

Several values now deliberately differ from what that project specified — the sans family, the focus
ring on filled buttons, the control border, the danger palette, density. Each divergence exists
because measurement or verification demanded it, and each is recorded in an ADR. Never "restore" one
of those values to close a perceived gap.

## Scope

`docs/PROJECT_BRIEF.md` lists what is in and out of scope; `docs/ROADMAP.md` holds the deferred
list. The rules that decide day-to-day questions:

- Frontend-only. Anything Rustam has not approved — a backend, auth, analytics, a CLI, a Figma
  integration — is out, and a demo is never a reason to add one.
- Stories and examples use deterministic local fixtures.
- Single package until a real consumer proves another boundary is necessary. No monorepo or task
  orchestrator on speculation.
- A small coherent set driven by real needs, not coverage of an exhaustive framework.

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

- Explore and propose a plan before editing anything unfamiliar, architectural, dependency-heavy,
  public-API or multi-file.
- Preserve Rustam's uncommitted changes. No unrelated refactoring, upgrades, reformatting or
  generated-file churn.
- One small vertical slice at a time, verified before the next is proposed. One component at a
  time, and never the next roadmap item without explicit approval.
- Smallest design that satisfies the requirement now. A hypothetical future use does not justify an
  abstraction.
- Exported components, types, `--kreo-` variables, DOM semantics, keyboard behaviour, package
  exports and defaults are compatibility-sensitive public API.
- A runtime dependency needs its concrete need and trade-offs stated first. There are none today.

## Component workflow

`docs/COMPONENT_STANDARD.md` says what a good component is; `docs/COMPONENT_RECIPE.md` says what to
type, step by step, and `npm run new:component Name` prints the checklist. Follow the recipe rather
than reconstructing it.

Two rules the recipe does not carry:

- Design before code — purpose, non-goals, public API, states, and the semantics, keyboard and
  focus behaviour — and do not expand the token system for symmetry.
- Do not batch-create placeholder components, stories, tests or docs to raise the component count.

## Architecture guardrails

`docs/ARCHITECTURE.md` holds the package boundary, the styling model and the token layers, and
ADR-0010 settles overlays and composite widgets. What is easiest to get wrong:

- Native HTML semantics and platform behaviour before ARIA or a custom interaction model.
- Composition and readable APIs over configuration-heavy components.
- No styling engine, token compiler, plugin system, schema language, polymorphic `as` API or
  generic wrapper hierarchy without a documented need now.
- Class names are implementation details; documented `--kreo-` custom properties are public API
  under SemVer.
- No `any`, broad assertions, swallowed errors, disabled lint rules or unexplained skips.
- **Accessibility is not an axe result.** Verify semantics, accessible names, keyboard behaviour,
  focus, visible states, contrast, reduced motion and forced-colors where they apply.

## Verification

Use the scripts that exist in `package.json`. `docs/QUALITY.md` holds the change-to-check matrix —
which kind of change owes which evidence — and the CI stage list.

Rules:

- **Cheap check first.** `verify:fast` is ~10s, `verify` is ~70s and rebuilds, packs and
  screenshots everything. Use `verify:fast` while working and `verify` once, before the pull
  request. After a failure, re-run the check that failed — not the whole chain.
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
  npm publications unless Rustam explicitly requests the exact action.
- Never rewrite history, discard local changes, or use destructive Git commands.
- Before changing a lockfile or generated file, verify that the change is expected and scoped.
- The package is published. A version number on npm can never be reused, which makes publishing the
  one action here that cannot be undone: releases, tags and `npm publish` happen only when Rustam
  asks for that exact release.
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
