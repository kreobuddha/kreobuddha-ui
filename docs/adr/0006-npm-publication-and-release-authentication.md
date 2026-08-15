# ADR-0006: npm publication and release authentication

- Status: Accepted
- Date: 2026-08-14
- Decision owners: Rustam

## Context

The library had one consumer, and it installed the package straight from GitHub
(`github:kreobuddha/kreobuddha-ui#v0.2.0`, ADR-less mechanism recorded in `docs/RELEASES.md`). That
worked, but it costs every consumer the full build toolchain at install time, cannot express a
version range, and does not scale past a project or two.

`RELEASES.md` had also listed prerelease gates that were, by then, already satisfied: the licence
and repository metadata are settled, CI covers format, lint, types, tests, contrast, build,
Storybook and package checks on two Node versions, the tarball has been reviewed, and the package
has been installed and exercised in an independent application. What remained was the decision
itself, plus an npm account — which now exists as `~kreobuddha`.

Two constraints shaped how the first release could happen:

- Scoped packages default to **restricted** access, which requires a paid plan. A public scoped
  package must say so explicitly.
- npm trusted publishing (OIDC) attaches a trusted publisher to an **existing** package. A package
  that has never been published has no settings page to attach it to, so the first version cannot
  be published that way (npm/cli#8544).

## Decision

1. Publish `@kreobuddha/ui` to npm with **public access**, declared as
   `publishConfig.access: "public"` in the manifest rather than as a flag someone has to remember.
2. `private: true` is removed. It had served as a deliberate guard while publication was ungated;
   the gate is now this ADR.
3. The first published version is **`0.3.0`**. `0.1.0` and `0.2.0` existed only as git tags and
   were never in a registry; reusing either number would make the git tag and the registry
   disagree about what that version contains.
4. **`0.3.0` is published manually**, once, because of the bootstrap constraint above.
5. Every release after `0.3.0` is published **from CI through trusted publishing (OIDC)**. No npm
   token is created, stored in GitHub secrets, or kept on a developer machine. Releases therefore
   carry provenance attestation.
6. Version numbers stay below `1.0.0` until the `1.0.0` gates in `RELEASES.md` are met, and
   breaking changes are called out in `CHANGELOG.md` rather than treated as disposable `0.x` churn.

## Consequences

- Consumers install `@kreobuddha/ui` normally and can express ranges such as `^0.3.0`. The install
  no longer builds the library, so it is far faster and no longer drags in Storybook or Playwright.
- Publication is irreversible in practice: npm allows unpublishing only within a narrow window, and
  a version number is never reusable. The release procedure in `RELEASES.md` therefore inspects the
  tarball before publishing rather than after.
- Sourcemaps ship with `sourcesContent`, so consumers can step through the library's own source
  while debugging. This is intentional: the repository is public and MIT-licensed.
- The manual first publish is a one-off exception and is recorded as such in `RELEASES.md`, so it
  does not become an informal precedent for releasing from a laptop.
- If npm later allows configuring a trusted publisher before a package exists, point 4 becomes
  unnecessary; nothing else in this decision changes.
