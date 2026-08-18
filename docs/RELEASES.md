# Kreobuddha UI — Releases

## Current status

`@kreobuddha/ui` is published to npm under the `@kreobuddha` scope with public access. The licence
is MIT and the public repository is `kreobuddha/kreobuddha-ui` with CI green on `master`. The
current release is **`0.19.0`** (2026-08-18), which is where every "reviewed at" date below should
be read against.

Publishing is still an external action: each release requires Rustam's explicit approval for the
exact version and action. See ADR-0006 for how releases are authenticated.

**The package name is settled.** `@kreobuddha/ui` has been the published name since `0.3.0`, the
scope belongs to Rustam, and npm's trusted publisher is bound to `kreobuddha/kreobuddha-ui` and
`release.yml` by name. A rename is now a migration for every consumer rather than a decision still
open, so the roadmap's "final package-name confirmation" is closed by this paragraph rather than
carried forward.

## Artifact review — 2026-08-17, at `0.17.0`

Read rather than assumed, because "public artifacts contain only intentional files" is a principle
below and a principle nobody measures is a hope. Every number here came from a command that was run.

**This review is two releases old.** It was taken at `0.17.0`; the current release is `0.19.0`,
which changed tokens and component CSS but added no build output of a new kind. The numbers below
are therefore evidence about `0.17.0` and nothing else, and Phase 8 re-takes them on the `1.0.0`
candidate rather than assuming they held.

`npm pack --dry-run --json`, before and after the one fix this review produced:

| | before | after |
| --- | --- | --- |
| files | 129 | **127** |
| packed | 152.2 kB | **152.0 kB** |
| unpacked | 419.9 kB | **419.5 kB** |

Top level is exactly what a release is allowed to contain: `dist/`, `README.md`, `LICENSE`,
`NOTICE`, `package.json`. Nothing else — no source, no tests, no stories, no configuration.

What the 127 files are:

| Kind | Count | Note |
| --- | --- | --- |
| `.d.ts` | 26 | the published types; `src` itself is not shipped |
| `.js` | 26 | the ESM build, React external |
| `.module.js` | 21 | the CSS Module class maps |
| `.js.map` | 46 | 163.6 kB unpacked — see below |
| `.css` | 1 | `dist/styles.css`, 85.0 kB, the complete stylesheet |
| `.woff2` | 2 | Inter Latin 48.3 kB and Cyrillic 18.7 kB, real files rather than inlined data |
| licence, notice, readme, manifest | 5 | including `LICENSE-inter.txt` beside the fonts |

**The one thing that should not have been there.** `dist/demo/DialogSection.d.ts` and
`dist/demo/ToastSection.d.ts` — declarations for the Storybook sections the Kit story composes —
shipped in every release from the day `src/demo/` was created up to and including `0.17.0`.
`tsconfig.build.json` excluded `src/docs` and never excluded `src/demo`. They were unreachable
(nothing in `src/index.ts` points at them) and cost 0.4 kB, so no consumer was affected; that is
precisely why nobody noticed for fourteen minor versions. Fixed by adding `src/demo` to the same
exclude list.

**Source maps stay, deliberately.** They are 46 of the 127 files and 39% of the unpacked size, and
they are the reason a consumer stepping into this library sees the original TypeScript rather than
the build output. They embed `sourcesContent`, so they are self-contained and do not point at files
the consumer lacks — which is also why `declarationMap` is off, as `tsconfig.build.json` records.
They are not downloaded by a browser unless devtools asks for them, so the cost is registry storage
and install time, not the shipped page.

`npm run check:package` — `publint`: *All good*. `attw --profile esm-only`: green for `node16 (from
ESM)` and `bundler`; `node10` and `node16 (from CJS)` fail and are excluded by that profile, which
is the ESM-only decision `README.md` states rather than an unaddressed problem.

## How a release is cut

1. `master` is green and the working tree is clean.
2. `CHANGELOG.md` gains an entry describing user-visible impact; the version in `package.json`
   matches it.
3. `npm run check:package` passes, and `npm pack --dry-run` is read — the archive must contain
   `dist`, `README.md`, `LICENSE`, `NOTICE` and the manifest, and nothing else.
4. The release runs from CI. `.github/workflows/release.yml` runs the same checks as `ci.yml`,
   checks the version against the manifest, reads the notes out of `CHANGELOG.md`, then tags the
   released commit `vX.Y.Z` and pushes the tag.
5. Only then does it publish, through npm trusted publishing (OIDC), so no npm token is stored
   anywhere — and finally it creates the GitHub release from the notes collected in step 4. None
   of this is a manual step.

   The tag deliberately precedes the publish. Publishing is the only step in the sequence that
   cannot be undone, because npm never lets a version number be reused; a tag can be deleted with
   `git push origin :refs/tags/vX.Y.Z`. Recoverable failures therefore come first. A failed tag
   push means nothing was published and the run can be repeated; a failed publish leaves a tag to
   remove before repeating it.

`0.3.0` is the exception to step 4: npm can only attach a trusted publisher to a package that
already exists, so the very first version was published by hand. Every release after it goes
through CI.

Running the release workflow: **Actions → Release → Run workflow**, entering the version being
released. The job refuses to publish if that string does not match `package.json`, because a
version number can never be reused once it reaches the registry.

`publishConfig.provenance` is on, and provenance can only be produced by a CI run with an OIDC
token. A local `npm publish` therefore fails now — deliberately. Releasing from a laptop is no
longer possible, which is what keeps step 4 honest.

### Branches

The repository deletes a branch when its pull request merges. A merged branch that stays around
still looks like work in progress, and the one real incident this project has had came from exactly
that confusion: a pull request merged into a stale branch eleven seconds after that branch had gone
to `master`, and the commit sat in a branch nobody would merge again.

The tag is the recovery point, not the branch. Once a release is tagged, its branch holds nothing
the tag does not.

Do not stack pull requests on top of each other without a reason. If you do, merge bottom-up and
check that each one retargets `master` before merging it.

### One-time setup on npmjs.com

Package settings → **Publishing access** → add a trusted publisher, with:

| Field | Value |
|---|---|
| Organization or user | `kreobuddha` |
| Repository | `kreobuddha-ui` |
| Workflow filename | `release.yml` |
| Environment | leave empty |

Every field is case-sensitive, and npm does not validate them when saved — a typo surfaces only as
a failed publish.

## Installing from git (superseded)

Kept for reference. Since `0.3.0` the package is on npm, so `npm install @kreobuddha/ui` is the
supported way to consume it and the mechanism below is no longer needed.

Before publication, consumers installed straight from GitHub:

```jsonc
// consumer package.json
"@kreobuddha/ui": "github:kreobuddha/kreobuddha-ui#v0.2.0"
```

This works only because `prepare` runs `npm run build`: npm executes that script when a dependency
is installed from a git remote, and `dist/` is not committed. Pin a tag rather than a branch, so a
consumer's install is reproducible.

Two costs, both accepted as temporary:

- npm installs the library's full devDependencies in the consumer's tree, because the build needs
  them. Installing from GitHub is therefore much slower and heavier than installing from npm.
- The tag, not the branch, is the contract. Moving a tag silently changes what consumers get, so
  cut a new version instead.

This is a stopgap, not the release model. It does not satisfy the prerelease gates below, and it
does not make the package published.

## Release principles

- Releases are generated from a clean, verified protected branch.
- Public artifacts contain only intentional files.
- Changelog entries describe user-visible impact in English.
- Package behavior, public types, exports, semantic CSS variables, and documented keyboard behavior
  are versioned contracts.
- Publication is never used as a test of whether a package is configured correctly; tarball and
  consumer checks happen first.
- A release does not claim browser support, accessibility conformance, or adoption beyond collected
  evidence.

## Versioning

Use SemVer after the package name and publication plan are accepted.

- **Patch**: a compatible bug fix that restores documented behavior.
- **Minor**: a new component, prop, variant, public type, or semantic token; a compatible capability.
- **Major**: removal or rename of an export, prop, token, or stylesheet path; required migration;
  incompatible DOM semantics, keyboard behavior, or default visual contract.

Before `1.0.0`, the project should still communicate breaking changes explicitly instead of treating
all `0.x` changes as disposable.

## Changesets — declined

This document held Changesets as the preferred candidate "once the first real public API exists".
That API exists, so the condition was resolved rather than left standing: **Changesets is not
adopted.** See [ADR-0013](adr/0013-changesets-declined.md) for the decision, its cost, and the two
pieces of evidence that would reopen it.

What this repository does instead:

- `CHANGELOG.md` is written by hand, in prose, and describes user-visible impact in English;
- it is updated in the same pull request as the change it describes — `CONTRIBUTING.md` requires
  this, and nothing enforces it, which ADR-0013 records as the price of this decision;
- `scripts/release-notes.mjs` reads a version's section out of it, so the GitHub release and the
  changelog cannot disagree;
- the version is set in one reviewed `chore: release X.Y.Z` commit, and `release.yml` refuses to
  publish when the dispatched version does not match `package.json`.

## Prerelease gates

A public prerelease requires the eight things below. This list stood for four phases without ever
saying whether any of them held, which made it a wish rather than a gate. Reviewed at `0.18.0`, each
one now carries the file or the command that shows its state — and where a gate is not met, it says
so instead of rounding up.

**The state below was observed at `0.18.0`.** `0.19.0` did not reopen any of these gates: it added
no export, no file kind in the tarball and no external dependency, and CI stayed green on `master`
at `6c2d806`. What it did change is the token surface, which is the subject of the `1.0.0` gates
further down rather than of these.

| Requirement | State | Evidence |
| --- | --- | --- |
| confirmed npm package name and ownership | **met** | "Current status" above: published as `@kreobuddha/ui` since `0.3.0`, scope owned by Rustam, trusted publisher bound to `kreobuddha/kreobuddha-ui` + `release.yml`; [ADR-0006](adr/0006-npm-publication-and-release-authentication.md) |
| accepted license and repository metadata | **met** | `LICENSE` (MIT) and `NOTICE` in the tarball; `package.json` carries `license`, `repository`, `homepage`, `bugs`, `author`, `description`, `engines`, `exports`, `publishConfig.provenance`; `npm run check:package` reports `publint`: *All good* |
| clean CI for type, lint, tests, package build, Storybook build, and package checks | **met, with two stated limits** | `.github/workflows/ci.yml` on Node 22.x and 24.x, green on `master` at `ae583b5` (run `32027376386`, 2026-08-17) and on every pull request of this phase; the stage list is in [QUALITY.md](QUALITY.md#ci-stages). The limits: story and browser checks run in **Chromium only**, and visual regression runs in `verify` but is **skipped on CI** because its baselines are macOS |
| reviewed tarball contents | **met** | "Artifact review — 2026-08-17" above: 127 files, 152.0 kB packed, 419.5 kB unpacked, read from `npm pack --dry-run --json` rather than assumed. The review found and removed two files that had shipped since `src/demo/` existed |
| successful installation in an independent consumer | **met** | [`docs/adoption/planning-poker.md`](adoption/planning-poker.md) — `kreobuddha/kreobuddhas-planning-poker`, a separate public repository, running the **published** package and measured in the browser. It is on `0.16.0`: the gate asks that an independent consumer install a published version, and it does, but no consumer outside this repository has yet run the version being released |
| English README with honest installation and limitations | **met** | `README.md` "Status: public beta" names four things the beta does not promise; `src/docs/Installation.mdx` and `src/docs/Accessibility.mdx` say the same in the same words, checked page by page in the built Storybook during this phase |
| no private or employer-owned content | **met as a rule, unverifiable as a check** | The clean-room rules in `CLAUDE.md` govern every change, and `CONTRIBUTING.md` repeats them. Nothing automated can confirm the absence of proprietary material — the gate is held by review discipline, and saying otherwise would be the kind of unsupported claim this document forbids |
| explicit approval from Rustam for the version and publish action | **version approved; publish pending, by design** | `0.18.0` was chosen before this phase began — the beta is the whole `0.x` line, so no prerelease suffix or `next` dist-tag is created. The publish itself is a separate explicit request per release, as ADR-0006 requires; this gate is the only one that closes at release time rather than before it |

Seven gates are met before the release runs. The eighth is the release.

## `1.0.0` gates

Where each of these stands today, and which slice closes it, is the gate table under Phase 8 in
[ROADMAP.md](ROADMAP.md).

Stable `1.0.0` additionally requires:

- at least one independent application consuming a published version rather than source;
- adoption feedback resolved or documented;
- stable package and token exports;
- reviewed deprecation and migration policy;
- documented browser/React support supported by evidence;
- accessibility release checklist completed for all shipped interactive components;
- explicit API freeze review.

## Deprecation

**This policy has never been applied, and `0.19.0` is why that is worth writing down.** Seven
`--kreo-text-*` tokens and `--kreo-type-body-lg` were removed in one release without ever being
marked deprecated or carried through a cycle. That was deliberate — a custom property cannot carry
a `@deprecated` annotation a consumer would ever see, the beta says in `README.md` that a minor
version may remove a `--kreo-*` property, and the removal was the point of the release rather than
a side effect. Recording it plainly matters more than a policy that describes a project that does
not exist yet.

From `1.0.0` the policy below binds, because a stable line is exactly what makes a deprecation
period meaningful. When a compatible migration path exists:

- mark deprecated types or props with `@deprecated`, which the generated prop tables surface;
- document the replacement and migration example in [`MIGRATION.md`](MIGRATION.md);
- keep the old API for at least one planned release cycle unless a security or correctness issue
  makes that unsafe;
- remove it only in a breaking release.

A `--kreo-*` custom property cannot be annotated, so its deprecation is announced in
`MIGRATION.md` and in the changelog, and the old name keeps resolving — as an alias of its
replacement — for the same one cycle.

## Publishing security

If npm publishing is automated later, prefer short-lived trusted/OIDC publishing over a long-lived
repository token, subject to current npm and GitHub requirements. The publishing job must:

- run only from the intended protected repository and branch/environment;
- use minimum permissions;
- rerun relevant package verification;
- publish an already reviewed version;
- create verifiable provenance when supported;
- never execute for untrusted pull requests.

This is a future decision requiring an ADR and explicit external-service configuration approval.

## Recovery

Do not overwrite an existing release. For a bad release:

- stop further publication;
- document the affected version and impact;
- prefer a corrective release;
- deprecate an unsafe npm version when appropriate;
- use unpublish only when registry policy and risk justify it;
- record the incident and add a regression check.

## Official reference

- [ADR-0006](adr/0006-npm-publication-and-release-authentication.md) — how a release is authenticated.
- [ADR-0013](adr/0013-changesets-declined.md) — why the changelog is written rather than generated.

