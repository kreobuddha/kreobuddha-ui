# ADR-0008: Ship Inter as a variable font

- Status: Accepted
- Date: 2026-08-15
- Decision owners: Rustam
- Amends the font packaging in [ADR-0005](0005-visual-language.md); the choice of Inter itself, and
  the rule against external requests from [ADR-0002](0002-no-external-font-or-icon-requests.md),
  are unchanged

## Context

ADR-0005 bundled two static weights, 400 and 600, on the reasoning that a variable font only pays
for itself across many weights and the library used two.

That reasoning contained a mistake, which measurement found. The type roles do not use two weights.
`--kreo-type-label` and `--kreo-type-button` both ask for `--kreo-weight-medium`, which is 500 — a
weight that was never in the package.

CSS Fonts 4 resolves this silently. For a requested weight between 400 and 500, matching first looks
upward as far as 500, then downward. With only 400 and 600 available, a request for 500 resolves to
**400**. Every button label and every field label has therefore been rendering a step lighter than
the tokens declare, with nothing failing to indicate it.

## Decision

Ship the variable font: one family, the full 100–900 range, split into Latin and Cyrillic subsets
behind a `unicode-range` exactly as before. Two files instead of four.

## Consequences

The size argument that justified static weights does not survive contact with the numbers:

| | Package | Fetched by a Latin page |
|---|---|---|
| Two static weights | 63.8 KB | 48 116 bytes |
| Variable | 67.0 KB | 48 256 bytes |
| Difference | +3.2 KB | **+140 bytes** |

The package grows by 3.2 KB, but what a page actually downloads is 140 bytes more, because
`unicode-range` already meant no page fetched everything. For that, every weight from 100 to 900
becomes available rather than two, and weight 500 renders as 500.

- The declared type scale and the shipped font now agree. This class of defect — declaring a weight
  that is not in the package — cannot recur, because every weight is present.
- `@fontsource/inter` is replaced by `@fontsource-variable/inter` as the source of the files.
- `format('woff2-variations')` is used, matching the upstream declaration.

## Alternatives considered

- **Change the tokens to 400 or 600.** Free, and it would have fixed the mismatch. Rejected because
  it fixes the symptom by removing the intent: weight 500 was chosen for those roles deliberately,
  and a medium label on a control is a real typographic decision rather than an accident.
- **Keep static and add a third file at 500.** Three files at roughly 24 KB each is worse than one
  variable file on both counts, and it leaves the same trap open for the next weight someone
  declares.

## Review trigger

Revisit if italics are ever needed — that would add a second variable file and change the balance —
or if a consumer reports the variable font failing on a platform that matters.
