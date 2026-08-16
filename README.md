# Kreobuddha UI

An accessible, themeable React component library for developer tools, technical products, and
data-dense frontend applications.

## Status: early, but published

**Fourteen components ship today: `Button`, `IconButton`, `TextField`, `Textarea`, `Select`, `Checkbox`, `Switch`, `FieldGroup`, `Tabs`, `Tooltip`, `Dialog`, `Badge`, `Spinner` and `Alert`.** Everything else in
[docs/ROADMAP.md](docs/ROADMAP.md) is a plan, not an available feature. The package is published so
it can be consumed normally; treat the `0.x` line as a moving target and pin what you depend on.

What exists and is verified: an ESM library build with an extracted stylesheet and external React,
TypeScript declarations, a semantic token layer with light and dark themes, strict type checking,
lint and format checks, component and accessibility tests, Storybook as the workbench, and a
package proven to install and run in a separate consumer application.

## Install

```bash
npm install @kreobuddha/ui
```

- Node.js `^20.19.0 || >=22.12.0`
- React `^19.0.0` as a peer dependency (install it yourself; the package does not bundle React)

## Usage

```tsx
import { Button } from '@kreobuddha/ui';
import '@kreobuddha/ui/styles.css';

<Button variant="filled" onClick={save}>
  Finish setup
</Button>;
```

### `Button`

| Prop        | Type                                | Default    |
| ----------- | ----------------------------------- | ---------- |
| `variant`   | `'filled' \| 'outlined' \| 'ghost'` | `'filled'` |
| `size`      | `'sm' \| 'md' \| 'lg'`              | `'md'`     |
| `danger`    | `boolean`                           | `false`    |
| `loading`   | `boolean`                           | `false`    |
| `fullWidth` | `boolean`                           | `false`    |
| `textWrap`  | `boolean`                           | `false`    |
| `icon`      | `ReactNode`                         | —          |
| `iconEnd`   | `ReactNode`                         | —          |
| `type`      | `'button' \| 'submit' \| 'reset'`   | `'button'` |

It renders a native `<button>` and forwards `ref`, `className`, `style`, and every other native
button prop to it. Use one `filled` button per view for the primary action, `outlined` for
secondary, and `ghost` for tertiary or inline actions.

`type` defaults to `button` rather than the platform default of `submit`, so placing a button in a
form never submits it unintentionally.

A `loading` button stays in the tab order, reports `aria-busy`, and refuses activation — including
form submission. Its content fades while keeping its box and a spinner is laid over it, so **the
button's size never changes**. It is deliberately not natively `disabled`: that would drop it out
of the tab order and take focus away from a keyboard user mid-action. It is also not dimmed the way
a disabled button is, which is what tells "in flight" apart from "unavailable". Use `disabled` when
the action is genuinely unavailable.

A label longer than the available width is truncated with an ellipsis; the full text stays in the
DOM, so the accessible name is unaffected, and it is offered as the browser's native tooltip while
the label is clipped. Note that a native tooltip is not reachable by keyboard or touch — a properly
accessible `Tooltip` component is a later phase. Set `textWrap` to let the label run onto several
lines and grow the button instead, in which case nothing is hidden and no tooltip appears.

Icons are `ReactNode` and are hidden from assistive technology, so the label remains the accessible
name. The library bundles no icon set.

### `IconButton`

| Prop      | Type                                | Default    |
| --------- | ----------------------------------- | ---------- |
| `label`   | `string`                            | required   |
| `icon`    | `ReactNode`                         | required   |
| `variant` | `'filled' \| 'outlined' \| 'ghost'` | `'filled'` |
| `size`    | `'xs' \| 'sm' \| 'md' \| 'lg'`      | `'md'`     |
| `danger`  | `boolean`                           | `false`    |
| `loading` | `boolean`                           | `false`    |

```tsx
<IconButton label="Close" icon={<CloseIcon />} variant="ghost" />
```

A square button carrying a mark instead of a word. Variants, states and geometry match `Button`;
`xs` is the extra size, meant for marks that live inside another control.

**`label` is required and the compiler enforces it.** An icon carries no text, so there is nowhere
else an accessible name could come from, and an unlabelled icon button is the most common
accessibility failure in any component library. The label is also used as the hover tooltip,
because a symbol without a name is a guess for sighted users too — pass `title` explicitly to say
something different there.

The icon itself is hidden from assistive technology, so it never competes with the label.

### `Alert`

| Prop           | Type                                           | Default   |
| -------------- | ---------------------------------------------- | --------- |
| `tone`         | `'success' \| 'warning' \| 'danger' \| 'info'` | `'info'`  |
| `title`        | `string`                                       | —         |
| `icon`         | `ReactNode`                                    | tone mark |
| `live`         | `boolean`                                      | `false`   |
| `onDismiss`    | `() => void`                                   | —         |
| `dismissLabel` | `string`                                       | `Dismiss` |

```tsx
<Alert tone="danger" title="Save failed" live onDismiss={hide}>
  The workspace was changed by someone else.
</Alert>
```

A message about what just happened or what is currently true. Each tone brings its own mark, so the
kind of message never depends on colour alone; pass `icon` to use your own instead.

**`live` is off by default.** A banner already on screen when the page loads should not interrupt
anyone. Turn it on for a message that appears in response to something — a failed save. A `danger`
alert then interrupts (`role="alert"`); the quieter tones wait for a pause (`role="status"`).

`onDismiss` is what adds the close button; without it the alert cannot be dismissed. The supporting
text sits on the body colour rather than the tone colour, because a whole paragraph in a status
colour is harder to read than it is informative.

### `TextField`

| Prop        | Type                   | Default |
| ----------- | ---------------------- | ------- |
| `label`     | `string`               | —       |
| `size`      | `'sm' \| 'md' \| 'lg'` | `'md'`  |
| `hint`      | `ReactNode`            | —       |
| `error`     | `ReactNode`            | —       |
| `prefix`    | `ReactNode`            | —       |
| `suffix`    | `ReactNode`            | —       |
| `fullWidth` | `boolean`              | `false` |
| `className` | `string`               | —       |

Every other prop is a native `<input>` prop, including `value`, `onChange`, `type`, `disabled`,
`readOnly`, `required` and `placeholder`. `ref` points at the `<input>`; `className` goes to the
wrapper around the whole field.

```tsx
<TextField
  label="Email"
  type="email"
  value={email}
  onChange={(event) => setEmail(event.target.value)}
  hint="We only use this to send receipts."
  error={invalid ? 'Enter an address such as name@example.com.' : undefined}
  required
/>
```

**`label` is required.** A field without a visible label is unusable by anyone not looking at it,
and a placeholder is not a substitute: it disappears the moment someone starts typing.

**The `error` is what makes the field invalid.** There is no separate `invalid` prop, because a
field flagged invalid without saying why is a dead end, and two props that must agree eventually
disagree. When both are present the error is announced before the hint — the problem first, then
the guidance.

The field generates the ids that connect the label, hint and error to the input, so two fields on a
page never collide. Pass `id` to take that over for the input.

`required` renders an asterisk and sets the native attribute; the asterisk is `aria-hidden`, so the
accessible name stays the label alone. Convey the requirement in the label or hint too, since an
asterisk is a convention rather than a word.

Slots sit at the **edges** inside the border — a `prefix` against the left, a `suffix` against the
right, with the input filling everything between. A suffix does not hug the value, and cannot
without the field measuring the text, so a slot meant to read as part of the value (`.example.dev`
after a workspace name) will look detached. Units, currency marks and search glyphs are what these
are for.

Text in a slot **is** announced — `suffix="USD"` is read as part of the field. Add `aria-hidden`
yourself to a purely decorative mark.

### `Textarea`

| Prop        | Type                   | Default      |
| ----------- | ---------------------- | ------------ |
| `label`     | `string`               | —            |
| `size`      | `'sm' \| 'md' \| 'lg'` | `'md'`       |
| `hint`      | `ReactNode`            | —            |
| `error`     | `ReactNode`            | —            |
| `resize`    | `'vertical' \| 'none'` | `'vertical'` |
| `rows`      | `number`               | `3`          |
| `fullWidth` | `boolean`              | `false`      |
| `className` | `string`               | —            |

Every other prop is a native `<textarea>` prop. `ref` points at the `<textarea>`; `className` goes
to the wrapper around the whole field.

```tsx
<Textarea
  label="Release notes"
  rows={6}
  hint="Markdown is supported."
  error={tooShort ? 'Describe the change in at least a sentence.' : undefined}
/>
```

The label, hint, error, required marker and invalid contract are identical to `TextField` — a field
should not behave differently because it holds more than one line.

**Height comes from `rows` and nothing else.** The field does not measure its content or grow as
you type, so it never pushes the rest of the form down mid-sentence. The reader can drag it taller,
and `resize="none"` takes that away for a layout that must not move.

**Dragging is vertical only, and that is not configurable.** A wider box breaks the form's column
and does not make prose easier to read.

### `Select`

| Prop          | Type                   | Default |
| ------------- | ---------------------- | ------- |
| `label`       | `string`               | —       |
| `size`        | `'sm' \| 'md' \| 'lg'` | `'md'`  |
| `hint`        | `ReactNode`            | —       |
| `error`       | `ReactNode`            | —       |
| `placeholder` | `string`               | —       |
| `fullWidth`   | `boolean`              | `false` |
| `className`   | `string`               | —       |

Every other prop is a native `<select>` prop. `ref` points at the `<select>`; `className` goes to
the wrapper. `multiple` is not supported — a multi-select needs a different control, not a taller
one.

```tsx
<Select label="Timezone" placeholder="Choose a timezone" required value={tz} onChange={pick}>
  <option value="utc">UTC</option>
  <option value="cet">Central European Time</option>
</Select>
```

It is a real `<select>`. Keyboard behaviour, type-ahead and the platform's own list on touch all
come from the browser, which is the whole reason not to build a custom listbox here.

**`placeholder` becomes a disabled first option** with an empty value, selected until a choice is
made. That is what lets native `required` mean what it says: the field cannot report a value nobody
picked, and the reader cannot go back to "nothing" by accident. Leave it out when the first option
is a genuine default — then the field starts on it, which is the browser's behaviour and usually
the right one for a setting.

An explicit `defaultValue` or a controlled `value` wins over the placeholder.

The chevron is drawn by the component rather than left to the platform, which paints a different
arrow per operating system. It does not intercept clicks, so anywhere inside the border opens the
list.

### `Checkbox`

| Prop            | Type        | Default |
| --------------- | ----------- | ------- |
| `label`         | `ReactNode` | —       |
| `hint`          | `ReactNode` | —       |
| `error`         | `ReactNode` | —       |
| `indeterminate` | `boolean`   | `false` |
| `className`     | `string`    | —       |

Every other prop is a native checkbox prop, including `checked`, `defaultChecked`, `onChange`,
`name`, `value`, `required` and `disabled`.

```tsx
<Checkbox label="Send me release notes" hint="About one email a month." />
```

The label is part of the target: 18px of box is a small thing to hit, and the words beside it
toggle the same control.

**`indeterminate` has no HTML attribute**, only a DOM property, so a consumer cannot set it without
a ref of their own — which is why it is a prop here. It is a visual and assistive state only: the
box still submits as unchecked, because that is what the platform does and inventing a third value
would break every form that reads it. It also wins over `checked`, since a dash saying "some" is
more truthful than a tick claiming "all".

### `Switch`

| Prop        | Type        | Default |
| ----------- | ----------- | ------- |
| `label`     | `ReactNode` | —       |
| `hint`      | `ReactNode` | —       |
| `error`     | `ReactNode` | —       |
| `className` | `string`    | —       |

```tsx
<Switch label="Dark theme" checked={dark} onChange={(e) => setDark(e.target.checked)} />
```

A checkbox underneath with `role="switch"` over it. The role changes what is announced — "on" and
"off" rather than "checked" — while the element keeps native keyboard handling and form
participation.

There is no `required`. A switch is always in one of its two states, so demanding one of them is a
rule about the value, not about the control.

### `FieldGroup`

| Prop          | Type                         | Default      |
| ------------- | ---------------------------- | ------------ |
| `legend`      | `string`                     | —            |
| `hint`        | `ReactNode`                  | —            |
| `error`       | `ReactNode`                  | —            |
| `orientation` | `'vertical' \| 'horizontal'` | `'vertical'` |

Every other prop is a native `<fieldset>` prop, including `disabled` and `name`.

```tsx
<FieldGroup legend="Notify me about" error={none ? 'Choose at least one.' : undefined}>
  <Checkbox label="Releases" />
  <Checkbox label="Incidents" />
</FieldGroup>
```

A real `<fieldset>` and `<legend>`, so a set of checkboxes is announced as a group and each option
is heard in the context of the question rather than on its own.

**The hint and error describe the group, not each control.** "Choose at least one" is a fault of
the set; repeating it on every box would have a screen reader read it once per option.

`disabled` switches off everything inside it — that is the fieldset doing the work, not a loop over
children. Note that `input.disabled` stays `false` on a control disabled this way; `:disabled` is
what matches.

The default fieldset border, padding and margin are cleared. Drawing a box around every set would
make a settings page look like a stack of panels.

### `Tabs`

| Prop           | Type                      | Default       |
| -------------- | ------------------------- | ------------- |
| `items`        | `TabItem[]`               | —             |
| `value`        | `string`                  | —             |
| `defaultValue` | `string`                  | first enabled |
| `onChange`     | `(id: string) => void`    | —             |
| `activation`   | `'automatic' \| 'manual'` | `'automatic'` |

`TabItem` is `{ id, label, content, disabled? }`. `label` and `content` are both `ReactNode`, so a
count or a `Badge` can sit beside the word.

```tsx
<Tabs
  items={[
    { id: 'overview', label: 'Overview', content: <Overview /> },
    {
      id: 'members',
      label: (
        <>
          Members <Badge>12</Badge>
        </>
      ),
      content: <Members />,
    },
    { id: 'billing', label: 'Billing', content: <Billing />, disabled: !paid },
  ]}
/>
```

Tabs take an array rather than compound children — `<Tabs.List>`, `<Tabs.Panel>` and so on. Only the
selected panel is mounted, so the component owns panel rendering either way, and every other
component here owns its own anatomy for the same reason.

**Arrows select as they move.** That is the WAI-ARIA recommendation when panels are cheap, and it is
fewer keystrokes. Set `activation="manual"` when a panel is expensive enough that arrowing past four
of them would fire four requests: arrows then move focus only, and `Enter` or `Space` selects.
`Home` and `End` jump to the ends, and the list wraps at both.

**The list is one tab stop.** `Tab` moves past it into the panel rather than walking through every
tab. The panel itself is focusable, so a panel with no focusable content can still be scrolled from
the keyboard.

**A disabled tab is still reachable.** It reports `aria-disabled` rather than being removed from the
sequence, so a keyboard user finds it, is told it is unavailable, and is not left with an
unexplained gap. Arrows land on it; nothing selects it.

**Hidden panels unmount.** State that must survive a switch belongs outside the panel — which is
where form state belongs anyway.

The tab list takes no label of its own. It usually sits under a heading that already names it, and
adding one would have a screen reader say the same thing twice; pass `aria-label` or
`aria-labelledby` through when there is no such heading. Tabs are horizontal only.

### `Tooltip`

| Prop        | Type                                     | Default |
| ----------- | ---------------------------------------- | ------- |
| `content`   | `ReactNode`                              | —       |
| `children`  | `ReactElement`                           | —       |
| `placement` | `'top' \| 'bottom' \| 'left' \| 'right'` | `'top'` |
| `className` | `string`                                 | —       |

```tsx
<Tooltip content="Copies the link to your clipboard">
  <IconButton label="Copy link" icon={<CopyIcon />} />
</Tooltip>
```

> **A tooltip may only carry what the reader can do without.**
>
> It opens on hover and on focus, which means it **does not exist on a touchscreen** — there is no
> hover there. This is inherent to the pattern, not a gap to be closed later. Anything a reader
> needs belongs in a label, a hint, or visible text. See
> [ADR-0010](docs/adr/0010-overlay-and-composite-strategy.md).

`children` must be a single element that accepts a `ref` and DOM props. The tooltip's id is put on
that element as `aria-describedby`, so the description is announced with the control rather than
floating beside it.

**Opening on hover waits about 400ms; focus opens at once.** A pointer crossing a row of buttons
should not set off a chain of tooltips, and there is no such thing as a passing focus. Closing never
waits — a tooltip that lingers after the pointer has left is in the way.

`Escape` closes it without moving focus: the reader is still on the control.

It enters the browser's top layer through the `popover` attribute, so nothing on the page can cover
it, and no portal is involved. Placement is CSS anchor positioning — no measuring, no scroll
listener, no runtime dependency. The browser flips it when there is no room; on Safari 18.2–18.3
placement is correct but the flip does not happen.

The tooltip never receives pointer events. Moving towards one is the most common way to lose the
thing you were reading.

### `Dialog`

| Prop                | Type                   | Default |
| ------------------- | ---------------------- | ------- |
| `open`              | `boolean`              | —       |
| `onClose`           | `() => void`           | —       |
| `title`             | `string`               | —       |
| `size`              | `'sm' \| 'md' \| 'lg'` | `'md'`  |
| `description`       | `ReactNode`            | —       |
| `footer`            | `ReactNode`            | —       |
| `dismissible`       | `boolean`              | `true`  |
| `dismissLabel`      | `string`               | `Close` |
| `dismissOnBackdrop` | `boolean`              | `true`  |

```tsx
<Dialog
  open={open}
  onClose={() => setOpen(false)}
  title="Delete workspace"
  description="Everything in it goes with it, including the audit log."
  footer={
    <>
      <Button variant="outlined" onClick={() => setOpen(false)}>
        Keep it
      </Button>
      <Button danger onClick={remove}>
        Delete
      </Button>
    </>
  }
>
  This cannot be undone.
</Dialog>
```

It is a real `<dialog>`, opened with `showModal()`. **The focus trap, the inert page behind, the
top layer and `Escape` are the browser's**, not a reimplementation — which is the point of
[ADR-0010](docs/adr/0010-overlay-and-composite-strategy.md). Focus moves into the panel on open and
returns to whatever opened it on close, and neither is done by hand.

**One known limitation, and it follows from that.** On WebKit, closing the dialog does not return
focus to the trigger — focus lands on the document instead, whether you close with `Escape` or with
the button. Chromium and Firefox return it. This is the engine's behaviour and it is not worked
around here, because the alternative is a focus-restoration path of our own to keep in agreement
with the two engines that already get it right. It was observed in Playwright's WebKit build rather
than in shipping Safari; ADR-0010 records what would reopen the decision.

**`title` is required.** It becomes the accessible name through `aria-labelledby`, and a dialog
without one leaves a screen reader announcing nothing but "dialog".

**It is controlled.** `open` and `onClose`, like everything else here. Every way of closing —
`Escape`, the close button, the backdrop — calls `onClose` rather than closing on its own, so the
element and your state can never disagree about what is on screen.

**A click on the backdrop closes it, by default.** That is what people expect from a modal on the
web, and it is the most common way to lose something typed. Set `dismissOnBackdrop={false}` on any
dialog holding a form; nothing warns first otherwise.

Only the body scrolls when the content is taller than the viewport, so the heading and the actions
never scroll away from a reader who needs them.

In a test environment without the `<dialog>` methods — jsdom has neither, as of version 30 — the
`open` attribute is set directly instead, so the dialog is still present and queryable in your own
tests. The top layer, the backdrop and the focus trap are absent there, because jsdom has no notion
of any of them.

### `Badge`

| Prop   | Type                                                                    | Default     |
| ------ | ----------------------------------------------------------------------- | ----------- |
| `tone` | `'neutral' \| 'accent' \| 'success' \| 'warning' \| 'danger' \| 'info'` | `'neutral'` |
| `dot`  | `boolean`                                                               | `false`     |

```tsx
import { Badge } from '@kreobuddha/ui';

<Badge tone="warning" dot>
  deprecated
</Badge>;
```

A short label for a status or a category — `admin`, `beta`, `3 failed`. It renders a plain
`<span>` and forwards `ref`, `className`, `style`, and every other native span prop to it.

It is deliberately **not interactive**: it has no role, no ARIA state, and no place in the tab
order, because it is text rather than a widget. It is not a dismissible chip, not a count bubble
laid over an icon, and not a live region — announcing a change as it happens is a different
component's job.

`tone` is an outline and a text colour, never the meaning by itself: the wording has to say what
the badge says with the colour removed. `dot` adds a decorative mark that repeats the label, so it
is hidden from assistive technology. A label wider than the space available wraps rather than being
clipped — nothing here could offer hidden text back.

### `Spinner`

| Prop    | Type                   | Default |
| ------- | ---------------------- | ------- |
| `size`  | `'sm' \| 'md' \| 'lg'` | `'md'`  |
| `label` | `string`               | —       |

```tsx
import { Spinner } from '@kreobuddha/ui';

<Spinner label="Loading members" />;
```

A ring that turns while something is in flight. It takes its colour from the surrounding text, so
it works on any surface, and it stops turning under `prefers-reduced-motion` — a static ring still
reads as an indicator.

**It is decorative unless you give it a `label`.** Without one it carries no role and is hidden
from assistive technology, which is correct whenever something nearby already says work is in
progress: visible text, or a container with `aria-busy`. A label turns it into a `status` with that
accessible name. Making the announcement opt-in is what stops a screen reader hearing the same
thing twice, which is the usual failure when a spinner sits beside the word "Loading".

`Button` uses it internally for its own loading state, where the button already carries `aria-busy`
and the spinner stays decorative.

## Theming

Dark mode is an attribute on any ancestor, normally `<html>`:

```html
<html data-kreo-theme="dark"></html>
```

Light is the default and needs no attribute. The library never stores a theme preference and never
reads the system preference — that state belongs to the application.

Customisation happens through the semantic tokens, not through component classes. Every
`--kreo-*` custom property in the published stylesheet is public API under SemVer; CSS Module class
names are private implementation details.

Three conventions are worth knowing before overriding anything:

- **A status has two colours, not one.** `--kreo-text-success` and its siblings are readable text
  at 4.5:1; `--kreo-icon-success` and its siblings are brighter marks for dots, icons and borders,
  which need only 3:1. Using one value for both is what turns an amber into a brown.
- **The dark theme runs at lower saturation than the light one.** At equal contrast a colour reads
  louder on a dark surface.
- **A tinted surface needs its own label colour.** `--kreo-surface-success-soft` and its siblings
  are the tints message components sit on; `--kreo-text-on-success-soft` and its siblings are the
  labels measured against those tints. The ordinary status text is tuned against the page and does
  not survive being placed on its own tint in the light theme — see
  [ADR-0007](docs/adr/0007-component-foundations.md).

`--kreo-shadow-overlay` is reserved for things that float — menus, dialogs, tooltips. Overlays keep
a border as well, because forced-colors mode paints no shadow at all and a panel relying on one
would lose its edge exactly where an edge matters most.

If you override the palette, keep the pairs contrastable: `npm run check:contrast` measures every
pairing the components put on screen, in both themes, and fails below the WCAG 2.2 target — 4.5:1
for text, 3:1 for control borders, marks and the focus ring.

## Fonts

**The font is bundled and no external request is made.** Importing `styles.css` is enough: Inter
ships inside the package, so the library renders as intended with no host setup, no CDN, and no
network dependency.

Inter ships as a variable font covering the whole 100–900 weight range, split into a Latin and a
Cyrillic file behind a `unicode-range`, so a Latin-only page never downloads the Cyrillic subset.
About 67 KB in total, none of it on the JavaScript path — and 48 KB of that is what a Latin page
actually fetches, within 140 bytes of what two static weights cost.

**No monospace family is bundled.** Numerals that must line up in columns use
`--kreo-numeric-tabular`, which switches Inter to its tabular figures — the actual requirement
behind reaching for a mono. Apply it alongside a type role, since `font-variant-numeric` is a
separate property from the `font` shorthand:

```css
font: var(--kreo-type-data);
font-variant-numeric: var(--kreo-numeric-tabular);
```

Inter is licensed under the SIL Open Font License 1.1; see [NOTICE](NOTICE) and the licence file
published beside it. The reasoning is in [ADR-0005](docs/adr/0005-visual-language.md).

## Package boundary

| Export         | Contents                                      |
| -------------- | --------------------------------------------- |
| `.`            | named React components and their public types |
| `./styles.css` | the complete supported stylesheet             |

The package is **ESM-only**. CommonJS consumers must use a dynamic `import()`, and Node 10 style
resolution is not supported.

Importing `@kreobuddha/ui/styles.css` from TypeScript requires that your project already declares
types for CSS side-effect imports — in a Vite project, `"types": ["vite/client"]` in `tsconfig.json`.
Without it, TypeScript 6 reports `TS2882` for the stylesheet import. This is a property of your
build setup, not of this package.

## Development

```bash
npm install
npm run typecheck
npm run lint
npm run lint:css
npm run format:check
npm test
npm run check:contrast
npm run build
npm run check:package
npm run check:consumer
npm run check:visual
npm run storybook
```

`npm run check:consumer` packs the package, installs the tarball into `examples/react-vite` — an
independent application with its own lockfile and no alias back to `src` — and checks it there:
that the published declarations type-check, that the build works, that importing one component does
not pull in the others, that React is not bundled, that the fonts are real files rather than inlined
data, and that the package renders on a server with no DOM at all.

`npm run check:visual` compares the protected visual states against committed baselines, over the
built Storybook. It runs as part of `npm run verify` and stands down on CI, because the baselines
are macOS and the runners are Ubuntu, where the same text does not render identically. Review the
diff when it fails, and use `npm run check:visual:update` to accept an intended change.

`npm run verify:fast` is the inner loop — format, lint, stylelint, types and the unit tests, a few
seconds. `npm run verify` is the full gate and what CI runs; use it before opening a pull request,
not after every edit.

`npm run storybook` opens the workbench. **Overview → Kit** is a single page showing everything the
library currently ships, in either theme — the quickest way to see the whole kit at once.

[CONTRIBUTING.md](CONTRIBUTING.md) describes how a change gets in and what it has to clear.
Note that components land one at a time as agreed slices, so an unsolicited pull request adding one
is likely to be declined — open an issue first.

## Security

Report a vulnerability privately rather than in a public issue; [SECURITY.md](SECURITY.md) explains
how and what is in scope.

## License

[MIT](LICENSE)
