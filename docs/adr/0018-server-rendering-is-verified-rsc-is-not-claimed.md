# ADR-0018: Server rendering is verified, React Server Components are not claimed

- Status: Accepted
- Date: 2026-08-18
- Decision owners: Rustam

## Context

`ARCHITECTURE.md` has said since Phase 0 that importing the package must not touch a browser
global and that browser APIs are used only in effects and handlers. Nothing said what that adds up
to for a consumer, and two different questions were sitting behind one sentence:

1. **does the package render on a server** — Node with no DOM, `renderToStaticMarkup`, the model a
   Vite or Express application uses for SSR;
2. **does the package work in a React Server Component tree** — Next.js App Router and anything
   else that splits a build into server and client graphs, where a module using hooks must carry
   the `'use client'` directive or the framework refuses it.

The first was already checked, though narrowly: `scripts/check-consumer.mjs` rendered eight of the
twenty-one exports on the server. The second was never addressed at all. No file in `src/` carries
`'use client'`, and sixteen of the twenty components use a hook, a context or an event handler,
so a Next.js App Router page importing `Button` directly fails at build time.

Phase 8 freezes public contracts. A contract nobody stated is the one most likely to be assumed.

## Decision

**Server rendering is a verified claim. RSC compatibility is not claimed, and no directive is
added.**

- `check:consumer` now renders **every export** on the server — twenty components plus `useToast`,
  which runs inside `ToastProvider` because a hook has nowhere else to run — and fails when an
  export is not in that list. Adding a component without rendering it there fails the check rather
  than quietly narrowing it;
- the package ships no `'use client'` directive. A consumer inside a Server Component tree wraps
  the import in their own client module, which is one file they write once;
- `README.md` and the documentation site say this in the same words, next to what else the library
  does not promise.

## Consequences

- an SSR consumer gets a claim with a runner behind it, on every export rather than a sample;
- an App Router consumer does extra work: a `'use client'` re-export of what they use. That cost is
  written down rather than discovered;
- the four components that use no hook — `Badge`, `Progress`, `Skeleton`, `Spinner` — would be
  usable directly from a server component if the package were split that way. It is not, because a
  split entry point is a public API decision made for a consumer who does not exist;
- if the directive were added later at the entry, it would mark the whole library as client code.
  That is a change in how a consumer's build treats the package, so it is a major-version decision
  rather than a convenience.

## Alternatives considered

- **`'use client'` at the entry now.** Rejected: it decides for every consumer, including the ones
  who never touch RSC, and it would need build work to preserve a directive Rollup otherwise drops
  — all for a framework nobody here uses today.
- **Per-component `'use client'` on the sixteen that need it.** Rejected for the same reason plus
  a maintenance obligation on every new component, with no way to verify the result without an RSC
  build in CI.
- **Claiming RSC support because SSR passes.** Rejected: they are different mechanisms, and the
  project does not claim what it has not observed.

## Review trigger

A consumer building on an RSC framework — Next.js App Router or equivalent. At that point the
decision is which boundary the directive sits on, and the evidence is that consumer's build rather
than an argument.
