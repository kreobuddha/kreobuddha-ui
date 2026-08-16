# Security policy

## Supported versions

Kreobuddha UI is pre-`1.0`. Only the latest published minor line receives fixes; there are no
backports to earlier `0.x` lines. Pin the version you depend on and upgrade deliberately — the
`0.x` line is a moving target, as `README.md` says.

| Version            | Supported |
| ------------------ | --------- |
| latest `0.x` minor | yes       |
| any earlier `0.x`  | no        |

## Reporting a vulnerability

**Do not open a public issue for a security problem.**

Use GitHub's private vulnerability reporting on this repository:
[Report a vulnerability](https://github.com/kreobuddha/kreobuddha-ui/security/advisories/new).
It opens a private thread visible only to the maintainer.

If that is unavailable to you, email <kreobuddha@gmail.com> with `kreobuddha-ui security` in the
subject line.

Please include what you need to make the problem reproducible: the package version, the consuming
environment, and the smallest example that demonstrates it.

## What to expect

This is a single-maintainer project, so the honest answer is best effort rather than a guaranteed
response time. Expect an acknowledgement within a week. If a report is accepted, the fix ships in a
new minor version with the advisory published alongside it; if it is declined, you get the reasoning
rather than silence.

## Scope

This package ships browser-facing React components, CSS and two font files. It has no runtime
dependencies, makes no network requests, reads no storage, and executes nothing at import time —
which is verified by the package checks in `docs/QUALITY.md`.

The most plausible reports are therefore about the published artifact rather than about component
behaviour: something reaching the tarball that should not be there, a build or release workflow that
can be influenced by an untrusted input, or a bundled font file that does not match its stated
licence and provenance in [NOTICE](NOTICE).

Findings in the repository's own tooling — Storybook, tests, CI — matter when they can affect a
published artifact. A vulnerability in a devDependency that never reaches consumers is worth an
ordinary issue, not a private report.
