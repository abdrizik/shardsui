# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

Lean Svelte 5 headless UI library. Idiomatic Svelte 5 only — runes and attachments, no
`svelte/store` / `export let` / `onMount` / `createEventDispatcher`.

## Commands

Run from the repo root:

| | |
| --- | --- |
| `pnpm -C packages/shardsui check` | svelte-check the library (the main gate) |
| `pnpm test` | jsdom suite |
| `pnpm test:chromium` | real-browser suite; needed for layout, focus and animation |
| `pnpm -C packages/shardsui exec vitest run tests/select/select-item.test.ts` | one file (`-t "name"` for one case) |
| `pnpm -C docs check` | docs typecheck |
| `pnpm lint` / `pnpm format` | oxfmt check / write |
| `pnpm test:package` | build + publint; gates the release |

`test:jsdom`/`test:chromium`/`test:firefox`/`test:webkit` exist at both the root and the package and
just set `VITEST_ENV`, which also takes `all-browsers`.

## Architecture

pnpm workspace: `packages/shardsui` (library), `docs` (SvelteKit docs site).

Component directories live under `src/lib/components/`, each holding its parts (`x-part.svelte`), a
`context.ts`, and — only when the state would obscure the part — an `x.svelte.ts` state module.
Files are kebab-case, imports PascalCase. Barrels pair `index.parts.ts` with
`export * as X from './index.parts'`. The `exports` map publishes `./*` →
`dist/components/*/index.js`, so `internal/` is unreachable from outside the package. `internal/`
holds shared primitives; `internal/floating/` handles anchor positioning, focus management, hover,
dismiss, and the `Composite` roving-tabindex pair. Tests mirror the component tree under `tests/`.

## Conventions

- **Shared behavior**: hand a part `attrs` (`$derived` object) + `attach` (events only) — never
  `setAttribute` in an `$effect`. Spread order is precedence: `{...attrs} {...stateAttrs} {@attach
  attach} {...rest}`. A narrow `$effect` is fine only to remove an attribute the caller set.
- **Parts**: props type is `PartProps<Args, Tag> & {...}`; state type lives in `context.ts` or
  `x.svelte.ts`. Root parts build state, then call `XContext.set(...)` in the Root part only (never
  inside the state class) — detached handles (`dialog`/`menu`/`popover`/`preview-card`/`tooltip`)
  don't set one; wrappers also publish the context they wrap (`AlertDialogRoot` →
  `DialogContext.set(dialog)`).
- **Naming**: name a context after what it is, never the mechanism — no `ctx`/`Ctx` anywhere. The
  binding drops `Context` and the component prefix the folder implies (`SelectContext` → `select`).
  The `Context<T>('Owner.Part')` constructor string is the tag shown in the thrown error when the
  part is used outside its owner. Four reserved names: `state` (the snippet payload on a state
  class), `<component>State` (a local extending it), `stateAttrs` (always `dataAttrs(...)`), `attrs`
  (only the shared-behavior `attrs`+`attach` contract) — don't invent a fifth.
- **State**: keep it inline (`$props` → runes → markup); move to `x.svelte.ts` only when it would
  obscure the part. Read options inline as `this.#options().x`, never destructure (for freshness,
  not tracking). Class fields must use `$derived.by(() => this.#options().x)` — plain `$derived(...)`
  fails typecheck. `.getOr()` reads an optional context without throwing; never `.get()` where
  absence is legal.
- **Comments**: don't add them, even a one-line hazard note. Guard a hazard with a test instead — a
  red test is the note. The only things allowed to stay in existing code: named browser/AT/spec
  facts, magic numbers at their definition, Svelte flush/tracking hazards, TS/tooling limits,
  non-obvious side effects, one-sentence JSDoc on exported helpers.
- **Docs & demos**: `docs/src/lib/components/content/demos/<slug>/<name>/demo.svelte`, one idea
  each; only `demo.svelte` auto-registers. Style library parts under a scoped parent
  (`.wrapper :global { .part-a {...} }`) — never bare top-level `:global`.

## Footguns

- Props read inside a cleanup-returning `$effect` can churn and drop sibling registrations — gate
  with `$derived` only when measured; it dedupes by `===`, so an inlined-looking read isn't
  redundant.
- `untrack(...)` is a no-op wherever `$effect.tracking()` is false — component `<script>` setup,
  constructors, class-field initialisers, none of it tracks, not even inside `{#each}`/`{#if}`. It's
  load-bearing inside `$effect`/`$derived`/an attachment, and in the template (`{@const}` and inline
  expressions compile to a tracking `template_effect`).
- A write-back `$effect` reading `options().<field>` tracks every field and loops — `untrack` the
  read (untracking the assignment does nothing).
- `Timeout`/`AnimationFrame` need `$effect(x.disposeEffect)` at init — pass the method, don't call
  it.
- Annotate attribute-object returns with literal types (`type?: 'button' | undefined`); a widened
  `string` fails when spread onto a concrete element.
- Don't "simplify" floatingTree version counters, hover `$derived` lines, or nested rAF in
  positioners without checking memory.
- Browser facts, probe-verified: desktop Firefox and WebKit fire no `focusout` when the focused
  element is removed; Chromium does. Desktop Firefox has no `Touch`/`TouchEvent` constructor and
  WebKit's `Touch` isn't constructible — use `createTouch`/`fireTouch` from `tests/test-utils.ts`.
  Firefox and WebKit both leave `HTMLInputElement.labels` stale after the input's `id` changes.
- `test:package` (publint) gates the release; keep it green. `test:package:types` (`attw`) is
  non-gating — its `internal-resolution-error` doesn't apply to this package's exports map, don't
  chase it.

## Verify

- Component-review order, loop and triage rules live in `_/ARCHITECTURE.md` (Part III), not here.
- Never start the docs dev/preview server. Describe visual claims; let the user check.
- `pnpm -C packages/shardsui check`, then `pnpm test` (`pnpm test:chromium` when needed), then
  `pnpm -C docs check`.
- Svelte MCP autofixer on every edited `.svelte` file until clean.
