# Kreobuddha UI — Migration

What a consumer has to change when upgrading, in the order the changes shipped. Each entry names
the release that made the change and the record that decided it, so the reasoning is one link away
rather than repeated here.

Nothing in this file is advice about which version to run. It is the list of edits an upgrade
requires, and where an upgrade requires none, it says so.

## Reading this file

The library follows SemVer, and the `0.x` line was a public beta in which a minor version could
break a contract. Only one release in that line actually did: `0.19.0`. Everything before it added
components, props and tokens without removing or redefining any, so an upgrade to `0.18.0` from any
earlier version needs no edit — see `CHANGELOG.md` for what each one added.

From `1.0.0` onward, a change of this kind requires a major version.

## `0.18.0` → `0.19.0`

Two decisions, both breaking, both taken deliberately before the `1.0.0` freeze rather than inside
the `1.x` line. They touch the token layer and the `size` prop; no export was removed, no component
was renamed, and no markup or keyboard behaviour changed.

### The type scale is four sizes

[ADR-0016](adr/0016-four-type-sizes-and-a-lighter-regular.md). Seven raw size tokens are gone. If
your stylesheet reads one of them directly, move to the `--kreo-type-*` role that says what the
size is _for_ — that is the interface the library treats as stable, and the raw sizes exist to
compose the roles.

| Removed | What to use |
| --- | --- |
| `--kreo-text-11` | `--kreo-text-12`, or `--kreo-type-label` for a field label or eyebrow |
| `--kreo-text-13` | `--kreo-text-12` or `--kreo-text-16`, depending on which the text is |
| `--kreo-text-14` | `--kreo-text-16`, which is now body |
| `--kreo-text-18` | `--kreo-text-16`, or `--kreo-text-24` for a section heading |
| `--kreo-text-20` | `--kreo-text-24`, or `--kreo-type-title` |
| `--kreo-text-30` | `--kreo-text-24` or `--kreo-text-36` |
| `--kreo-text-48` | `--kreo-text-36`, or `--kreo-type-display` |

The four that remain are `--kreo-text-12`, `--kreo-text-16`, `--kreo-text-24` and
`--kreo-text-36`.

### Roles that changed value

| Token | Before | After | What to do |
| --- | --- | --- | --- |
| `--kreo-type-body` | 14px | 16px | nothing, unless your layout was tuned to 14px body — check line lengths in dense columns |
| `--kreo-type-body-lg` | 16px | **removed** | replace with `--kreo-type-body`, which is now the same size |
| `--kreo-type-heading` | 18px | 16px, semibold | nothing; a heading is now told from body by weight. For a larger heading use `--kreo-type-title` |
| `--kreo-type-label` | 11px | 12px | nothing |
| `--kreo-type-button` | 14px | 16px | nothing; control heights are unchanged and 16px fits a 32px control, which was measured rather than assumed |
| `--kreo-type-data` | 14px | 16px | nothing, unless a table was sized to 14px rows |
| `--kreo-weight-regular` | `400` | `300` | nothing, unless you set 12px text in `regular` — the library never does, because a 300 stroke thins out at that size, most visibly on a dark surface |

### `size` sets geometry, not type

[ADR-0017](adr/0017-size-is-geometry-not-type.md). On `Button`, `TextField`, `Textarea` and
`Select`, `size="sm"` used to drop the text to 12px as well as shortening the control. All three
sizes are now set in `--kreo-type-body`; control heights did not change.

- **If you used `size="sm"` for a dense form**, it is still dense — the controls are still short.
  The text inside them is 16px instead of 12px, which is the intended correction rather than a
  side effect.
- **If you used `size="sm"` to get small text**, that is what no longer works. Set the type
  yourself on the surrounding element, or use `--kreo-type-label` where a caption is what you
  meant.
- **On `Textarea`**, where height comes from `rows`, `size` is the padding alone.

### Visual differences you may notice

- a `loading` button is dimmed as well as spinning
  ([ADR-0014](adr/0014-loading-is-dimmed-too.md), amending ADR-0004 §5). No API changed;
- `Tabs` no longer grows a vertical scrollbar when its tabs outrun the width.

## `0.19.0` → `1.0.0`

To be written when `1.0.0` is cut. `1.0.0` is an API freeze rather than a redesign: the public
surface it stabilizes is the one `0.19.0` already ships.
