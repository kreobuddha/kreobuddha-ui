# Kreobuddha UI — Releases

## Current status

No release is authorized by this document, and **nothing has been published to npm**. The package
is still marked `private`.

What is settled: the npm package name is `@kreobuddha/ui` (ADR-0001), the licence is MIT, and the
public repository exists at `kreobuddha/kreobuddha-ui` with CI green on `master`.

What is not: ownership of the `@kreobuddha` npm scope has never been verified, and must be before
any publish attempt. Tagging, releasing, or publishing remains an external action requiring
Rustam's explicit approval for the exact action.

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

