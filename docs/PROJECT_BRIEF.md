# Kreobuddha UI — Project Brief

## Status

- Product name: Kreobuddha UI
- Local directory: `kreobuddha-ui`
- GitHub repository name: `kreobuddha-ui`
- npm package name: `@kreobuddha/ui`, accepted in ADR-0001; scope ownership not yet verified
- Product type: frontend-only React component library and design system
- Public repository language: English
- Working conversation language: Russian
- Backend: none by design
- License: MIT
- Typeface: Inter, bundled with the package; no monospace family (ADR-0005)
- Shipped components: `Button`

## Product summary

Kreobuddha UI is an original, accessible, themeable React component library for developer tools,
technical products, and data-dense frontend applications.

It has two purposes:

1. Provide a genuinely reusable UI foundation for future projects such as `session-lab` and
   `dev-atlas`.
2. Demonstrate Senior Frontend / Frontend Platform engineering through component API design,
   semantic tokens, accessibility, automated verification, packaging, documentation, and release
   discipline.

Kreobuddha UI is not a reconstruction of an employer-owned design system. Its code, public APIs,
visual language, tokens, assets, examples, and documentation must be independently designed.

## Problem

Small frontend products often choose between a large framework that controls much of the visual
language, disconnected copied components, or headless primitives that still require each product to
rebuild the same foundation.

Kreobuddha UI should be a compact middle layer: opinionated enough to produce a coherent technical
interface, small enough to understand, and rigorous about public APIs, accessibility, and package
quality.

## Target users

### Primary

- Rustam, using the library in future portfolio products.
- `session-lab`, as the first planned technical consumer.
- `dev-atlas` or another frontend-only product as a later consumer.

### Secondary

React and TypeScript developers building dashboards, developer tools, account areas, settings
screens, and diagnostic interfaces.

### Portfolio audience

Senior frontend engineers, engineering managers, and recruiters evaluating:

- component and TypeScript API design;
- semantic HTML and accessibility knowledge;
- styling and token architecture;
- isolated UI development and testing;
- package boundaries and consumer compatibility;
- documentation and maintenance discipline.

## Product principles

1. **Real reuse over showcase count.** A small component set used by another application is more
   valuable than a large catalogue of placeholders.
2. **Accessibility is a contract.** Semantics, naming, keyboard behavior, focus, contrast, motion,
   and forced-colors behavior are designed before implementation.
3. **Public APIs are deliberate.** Exports, props, types, CSS variables, DOM behavior, and defaults
   are compatibility decisions.
4. **Semantic tokens are the customization boundary.** Components do not depend directly on raw
   color values.
5. **Frontend-only by design.** Docs, tests, examples, and demos use deterministic local data.
6. **Evidence over claims.** Support and quality claims require tests, builds, manual checks, or a
   real consuming project.
7. **One vertical slice at a time.** Every component is implemented, documented, and verified
   before another begins.

## Visual direction

The direction is **calm and editorial**, settled in ADR-0005 after the first attempt at industrial
clarity was rejected in use:

- restrained surfaces with no temperature, so the accent sits on them cleanly;
- hierarchy carried by typography and spacing before colour;
- one accent, berry, used sparingly — primary actions, links, focus, selection;
- one typeface, Inter, with tabular figures instead of a second monospace family;
- near-rectangular controls at a 4px radius;
- unmistakable interaction and focus states;
- original styling that does not imitate an employer-owned or another existing library.

Colour decisions are made by measurement, not by eye: `npm run check:contrast` is the arbiter, and
every value in the palette was solved for a contrast target before being written down.

This direction is a constraint, not a finished brand system. Visual details must be validated in
real component slices and consumer screens.

## Goals

- Build a typed, tree-shakeable React package with intentional exports.
- Provide semantic CSS custom properties and original light/dark themes.
- Provide comfortable and compact density when a real component slice validates the need.
- Target WCAG 2.2 AA for documented component states without making universal compliance claims.
- Provide keyboard-complete behavior for interactive components.
- Provide static Storybook documentation that needs no backend.
- Verify the packed artifact in a consumer application rather than importing source directly.
- Establish automated type, lint, behavior, accessibility, build, and package checks.
- Use the published prerelease in at least one independent application before `1.0.0`.

## Non-goals

The initial product will not:

- compete with exhaustive frameworks such as Material UI or Ant Design;
- include backend services, authentication, databases, analytics, or remote persistence;
- include application state management or business-domain components;
- ship a custom icon library, form-state framework, schema validator, animation framework, or CSS
  runtime;
- include a data grid, charting library, date picker, rich-text editor, file uploader, command
  palette, or drag-and-drop framework;
- provide a visual theme editor, Figma synchronization, CLI, or component generator;
- promise compatibility or accessibility beyond explicitly verified versions and states;
- support multiple brands during the first consumer cycle.

## Planned component scope

This is a candidate scope for the first public beta, not authorization to generate all components.

### Actions and progress

- `Button`
- `IconButton`
- `Spinner`

### Forms

- `TextField`
- `Textarea`
- `Checkbox`
- `Switch`
- `Select` using native single-select semantics for the initial version

### Status and feedback

- `Badge`
- `Alert`

### Navigation and overlays

- `Tabs`
- `Tooltip`
- `Dialog`

`Toast`, `Popover`, `Combobox`, `Menu`, `Table`, and other components remain backlog candidates until
a consumer demonstrates a concrete need.

## Core scenarios

### Package consumer

A consumer installs a versioned package, imports one documented stylesheet, imports named React
components, and receives complete TypeScript declarations without importing internal paths.

### Technical settings screen

A consumer assembles an accessible settings or diagnostics interface using actions, fields, status
indicators, tabs, and a dialog.

### Theme and density

A host application controls theme and density through a documented DOM and CSS-variable contract.
The library does not own persistence or browser preference storage.

### Evaluation

A reviewer can inspect component states, keyboard contracts, accessibility notes, tests, package
exports, and a real consumer without requiring secrets or a backend.

## Success criteria

The project becomes a credible public beta when:

- a clean checkout follows documented install and verification steps;
- the package emits intentional ESM, CSS, and declaration artifacts;
- a consumer fixture installs the packed artifact rather than workspace source;
- every shipped component meets `docs/COMPONENT_STANDARD.md`;
- public Storybook documentation is complete for shipped components;
- automated and manual checks provide evidence for documented behavior;
- CI reproduces the relevant local verification;
- a prerelease is used in an independent frontend project;
- the repository contains no proprietary or private material.

`1.0.0` requires at least one independent consumer, resolution or documentation of adoption issues,
and an explicitly reviewed stable public API.
