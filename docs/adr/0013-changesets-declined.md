# ADR-0013: Changesets is declined

- Status: Accepted
- Date: 2026-08-17
- Decision owners: Rustam

## Context

`docs/RELEASES.md` has carried Changesets as "the preferred release-note and versioning candidate
once the first real public API exists" since the release policy was written. That was a condition,
not a preference, and the condition has been met: `0.15.0` shipped the fifth through ninth
components, `0.17.0` ships twenty of them, and an independent application consumes the published
package rather than the source (`docs/adoption/planning-poker.md`). There is a real public API now,
so the sentence that deferred the decision no longer defers anything — it just sits there.

Two other documents point at the same undecided thing. `docs/adr/README.md` lists it in the decision
queue as "decided in principle, not implemented", which is the state this ADR directory exists to
end. `docs/COMPONENT_STANDARD.md` asks a component author for "a changeset … when the accepted
release policy requires one", a requirement that has never once been met because no release policy
has ever required it.

What the repository does instead is already built and already used. `CHANGELOG.md` is written in
prose that explains the user-visible effect of a change — why `name` is required on `Radio`, why
`node10` resolution is excluded — and `scripts/release-notes.mjs` reads a version's section straight
out of it so that the GitHub release says the same words. Version numbers arrive in a single
`chore: release X.Y.Z` commit that is reviewed like any other. Phase 7 is the phase that asks whether
each of this project's claims about itself is executed by a file; this is the claim with no file
behind it.

## Decision

Changesets is not adopted. The hand-written `CHANGELOG.md` plus `scripts/release-notes.mjs` is the
release-note mechanism of this repository, stated as the answer rather than as an interim.

There is no `.changeset/` directory, no `changeset add` step in the contribution flow, and no
versioning job in `.github/workflows/release.yml`. `docs/RELEASES.md` records the decision, and
`docs/COMPONENT_STANDARD.md` asks for the changelog entry it actually wants.

The reasons, in the order of how much they weigh:

- **The problem Changesets solves does not exist here.** Its core job is letting several pull
  requests, from several people, each declare their own version intent without knowing about the
  others, and then reconciling those intents at release time. This repository has one maintainer
  merging one slice at a time into one integration branch. There is no concurrent version intent to
  reconcile.
- **It would replace the source humans read with a source machines assemble.** A generated changelog
  is a list of merged changes. This one is an explanation, and `scripts/release-notes.mjs` already
  makes it do double duty as the GitHub release body. Adopting Changesets would either demote that
  prose to a second, unread file, or keep it and leave the repository with two changelogs.
- **The step it adds is a step that already happens.** Its value over a manual bump is that nobody
  forgets to set the version; here the version is set in a named commit that goes through a pull
  request and CI, and `release.yml` refuses to publish when the dispatched version does not match
  `package.json`. The forgetting is already caught by a machine.
- **The cost is not the install.** It is rewriting a release workflow that took a phase to get
  right — tag before publish, OIDC provenance, notes read from the changelog, `master` only. That
  workflow was just strengthened in this same phase; putting a version/release PR bot in front of it
  would mean re-earning confidence in the one action this project cannot undo.

## Consequences

- **The discipline stays manual, and that is the price.** "The changelog is updated in the same pull
  request as the change" is a rule a person follows, not a check that fails. `CONTRIBUTING.md`
  requires it and `docs/COMPONENT_RECIPE.md` §6 sequences it; nothing else prevents a release from
  reaching the registry with a changelog that does not describe it.
- The release flow is the one already documented in `docs/RELEASES.md` and nothing new needs
  learning to cut `0.18.0`.
- No new devDependency, no new bot with write access to the repository, and no second place where a
  version number lives.
- `docs/adr/README.md` loses a decision-queue entry, and the Phase 7 deliverable "Changesets/release
  flow if accepted" is answered rather than passed to Phase 8.
- If the review trigger below ever fires, the migration is more expensive than adopting it now would
  have been, because there will be more changelog history to leave behind. That is accepted: the
  alternative is paying for the tool before there is anything for it to do.

## Alternatives considered

- **Adopt Changesets now.** Rejected on the four reasons above. It is a good tool for the situation
  it was built for, and this is not that situation.
- **Keep it as a candidate.** Rejected because that is what the last four phases did, and the
  condition it waited for has now passed. An open item nobody can close is drift, and a reader of
  `docs/RELEASES.md` currently cannot tell whether the next release will use it.
- **Adopt only the changelog generation, not the versioning.** Rejected: the generated part is the
  half being declined, and `scripts/release-notes.mjs` already covers the direction this project
  actually needs — changelog to release notes, not commits to changelog.
- **Write a check that fails when a release commit does not touch `CHANGELOG.md`.** Not rejected,
  but not this decision. It would address the real cost recorded above without adopting a versioning
  tool, and it belongs to whichever phase decides to spend a slice on it rather than being smuggled
  in here.
- **Delete the mentions without a record.** Rejected. Three documents changing with no statement of
  why is the drift this directory prevents, and the manual discipline above is a real enough cost to
  be written down where the next reader finds it.

## Review trigger

Revisit when either becomes true:

- **A second regular contributor.** Not a single outside pull request — someone whose changes land
  often enough that two version intents can be open at the same time.
- **A second package in the repository.** Coordinated versions across packages is the other problem
  Changesets solves, and ADR-0001's single-package boundary is what currently makes it moot.

## Official reference

- [Changesets versioning and publishing](https://changesets.dev/guide/versioning-and-publishing) —
  what was read before declining it.
