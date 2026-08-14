# Kreobuddha UI Initialization Prompt

Open Claude Code in the directory that contains this file and use this prompt to initialize the
project.

---

We are creating **Kreobuddha UI**, an independent, public, frontend-only React component library and
design system intended both for real reuse and as evidence of senior frontend engineering skills.

The local directory and future GitHub repository must be named `kreobuddha-ui`.

Communicate with me in Russian. Keep source code, identifiers, commands, errors, commit messages,
tests, Storybook content, and all public repository artifacts in English.

## Mandatory context

The current directory must be named `kreobuddha-ui`. Treat it as the target directory and preserve
the planning files already stored in it.

Read these files completely before proposing any action:

- `CLAUDE.md`
- `docs/PROJECT_BRIEF.md`
- `docs/ARCHITECTURE.md`
- `docs/COMPONENT_STANDARD.md`
- `docs/QUALITY.md`
- `docs/RELEASES.md`
- `docs/ROADMAP.md`
- `docs/adr/README.md`

Follow their source-of-truth order. Private sibling files and former-employer material are not
project inputs and must not be inspected, copied, quoted, linked, mentioned, or included in
repository history.

## Pass 1 — discovery and plan only

Do not edit files, install dependencies, initialize Git, create a GitHub repository, or generate a
project during the first pass.

1. Inspect the current target directory, its Git state, and all existing non-generated files inside
   it. You may check the parent only to resolve the target path and directory basename; do not list,
   inspect, or read sibling files or projects.
2. Confirm that the current directory name is exactly `kreobuddha-ui` and that initialization will
   not overwrite unrelated content.
3. Report what is actually present, separating verified facts from assumptions.
4. Validate the proposed Phase 0 architecture against current official documentation and mutually
   compatible stable dependency versions. Do not rely on remembered version numbers.
5. Identify only decisions that genuinely block Phase 0, especially:
   - final npm package name and scope; `@kreobuddha/ui` is a proposal, not yet a fact;
   - package manager (default proposal: npm);
   - license (default proposal: MIT);
   - supported React peer range;
   - declaration-build approach;
   - whether Storybook belongs in Phase 0 or immediately after the package foundation.
6. For each recommended tool, state the concrete present need, the simpler alternative, and what
   should be deferred.
7. Propose an exact, bounded Phase 0 plan including files, commands, verification, and expected
   generated output.
8. Ask only focused questions whose answers materially change the initial architecture, public API,
   or external repository state.
9. Stop and wait for approval. Do not solve later roadmap phases in advance.

## Pass 2 — local repository and Phase 0

After I approve the Phase 0 plan, initialize only the local project foundation.

Repository creation is part of the approved Phase 0 scope:

1. Preserve and use the existing planning files in the current `kreobuddha-ui` directory.
2. Initialize Git with `master` as the initial branch if `.git` is absent.
   Do not reinitialize or alter an existing repository.
3. Do not create a remote, commit, or push during this pass.

Implement only the approved minimal foundation. It may include:

- minimal package metadata, with accidental publication prevented;
- npm lockfile and documented runtime requirements;
- strict TypeScript configuration;
- Vite library build and intentional package exports;
- a minimal source entry point used only to prove the package toolchain;
- agreed non-mutating lint, format-check, and test foundations;
- minimal Storybook setup only if explicitly approved for Phase 0;
- package artifact inspection and a minimal consumer smoke check;
- an honest English `README.md`, `.gitignore`, and agreed community files.

Do not implement production components, themes, a token catalogue, a documentation site, release
automation, a monorepo, a CLI, or a backend during Phase 0. A trivial internal smoke export is
allowed only when required to verify the build and must not be presented as a finished component.

After implementation:

1. run the approved verification;
2. inspect all generated and changed files for scope and private-material leaks;
3. report exact results in Russian;
4. show the repository status and proposed first commit contents;
5. stop and wait for a separate approval before committing or creating any remote repository.

## Pass 3 — GitHub repository gate

After Phase 0 passes and I explicitly approve external repository creation:

1. Verify the authenticated GitHub account and show it to me.
2. Confirm whether `kreobuddha-ui` should be public or private. The long-term intent is public, but
   do not assume visibility at execution time.
3. Show the exact proposed GitHub CLI or API action before running it.
4. Create the GitHub repository with the exact name `kreobuddha-ui` and connect it as `origin`.
5. Create the initial commit and push `master` only if those actions are included in the same
   explicit approval.
6. Verify the remote URL and branch state, then stop. Do not configure Pages, npm publishing,
   release automation, branch protection, or external services unless separately approved.

Never create a differently named remote repository as a fallback. If the name is unavailable or the
authenticated account is wrong, stop and report the problem.

## Phase 1 — first vertical slice

Phase 1 requires separate approval. It should deliver a minimal token foundation and exactly one
complete component, normally `Button`.

Before implementation, present:

- purpose and non-goals;
- proposed public API and exported types;
- semantic HTML and accessibility contract;
- keyboard and focus behavior;
- required semantic tokens;
- stories and test cases;
- explicitly deferred features.

Implement, document, visually inspect, and verify this component before proposing another. Do not
generate the roadmap component catalogue.

## Definition of a good initialization

A good result is the smallest verified foundation that:

- has an explicit product purpose and clean-room boundary;
- has understandable public package boundaries;
- can build and type-check a package artifact;
- can support one component being built well;
- avoids speculative architecture;
- contains no employer-owned or private material;
- accurately documents only what works today.

Do not commit, push, publish, release, deploy, or create external resources except at the explicit
gate described above.
