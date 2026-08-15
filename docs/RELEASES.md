# Kreobuddha UI — Releases

## Current status

`@kreobuddha/ui` is published to npm under the `@kreobuddha` scope with public access. The licence
is MIT and the public repository is `kreobuddha/kreobuddha-ui` with CI green on `master`.

Publishing is still an external action: each release requires Rustam's explicit approval for the
exact version and action. See ADR-0006 for how releases are authenticated.

## How a release is cut

1. `master` is green and the working tree is clean.
2. `CHANGELOG.md` gains an entry describing user-visible impact; the version in `package.json`
   matches it.
3. `npm run check:package` passes, and `npm pack --dry-run` is read — the archive must contain
   `dist`, `README.md`, `LICENSE`, `NOTICE` and the manifest, and nothing else.
4. The release is published from CI. `.github/workflows/release.yml` runs the same checks as
   `ci.yml` and then publishes through npm trusted publishing (OIDC), so no npm token is stored
   anywhere.
5. The same run tags the released commit `vX.Y.Z` and publishes a GitHub release whose notes are
   read out of `CHANGELOG.md` by `scripts/release-notes.mjs`. None of this is a manual step, and
   none of it happens if the publish fails.

`0.3.0` is the exception to step 4: npm can only attach a trusted publisher to a package that
already exists, so the very first version was published by hand. Every release after it goes
through CI.

Running the release workflow: **Actions → Release → Run workflow**, entering the version being
released. The job refuses to publish if that string does not match `package.json`, because a
version number can never be reused once it reaches the registry.

`publishConfig.provenance` is on, and provenance can only be produced by a CI run with an OIDC
token. A local `npm publish` therefore fails now — deliberately. Releasing from a laptop is no
longer possible, which is what keeps step 4 honest.

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

## Changesets

Changesets is the preferred release-note and versioning candidate once the first real public API
exists. Do not add it merely to initialize an empty package.

When adopted:

- add a changeset for public package behavior changes;
- documentation, tests, and internal refactors need no changeset unless they affect shipped users;
- review version bumps and changelog text before publishing;
- keep changeset and changelog content in English.

The expected model is `changeset add` → reviewed version/release PR → verified publish. Exact scripts
must match the installed tool and current official documentation.

## Prerelease gates

A public prerelease requires:

- confirmed npm package name and ownership;
- accepted license and repository metadata;
- clean CI for type, lint, tests, package build, Storybook build, and package checks that currently
  exist;
- reviewed tarball contents;
- successful installation in an independent consumer;
- English README with honest installation and limitations;
- no private or employer-owned content;
- explicit approval from Rustam for the version and publish action.

## `1.0.0` gates

Stable `1.0.0` additionally requires:

- at least one independent application consuming a published version rather than source;
- adoption feedback resolved or documented;
- stable package and token exports;
- reviewed deprecation and migration policy;
- documented browser/React support supported by evidence;
- accessibility release checklist completed for all shipped interactive components;
- explicit API freeze review.

## Deprecation

When a compatible migration path exists:

- mark deprecated types or props with `@deprecated`;
- document the replacement and migration example;
- keep the old API for at least one planned release cycle unless a security or correctness issue
  makes that unsafe;
- remove it only in a breaking release.

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

- [Changesets versioning and publishing](https://changesets.dev/guide/versioning-and-publishing)

