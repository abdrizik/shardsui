# Composition

Snippets, the as prop, and detached handles.

Each part keeps its behavior — ARIA, keyboard, focus, and `data-*` state — and leaves the rest to you: the tag it renders, its attributes, and its content.

## Nesting is the API

Parts talk to each other through Svelte context, not props. A `<Menu.Root>` publishes its state to context; `<Menu.Trigger>`, `<Menu.Positioner>`, and `<Menu.Item>` read it back. That's why you nest them instead of wiring `open`/`onOpenChange` between siblings by hand — the shared state never appears in your markup at all.

```svelte title="Parts read state through context"
<script>
  import { Menu } from '@shardsui/svelte/menu'
</script>

<Menu.Root>
  <Menu.Trigger>Song</Menu.Trigger>
  <Menu.Portal>
    <Menu.Positioner>
      <Menu.Popup>
        <Menu.Item>Add to Library</Menu.Item>
      </Menu.Popup>
    </Menu.Positioner>
  </Menu.Portal>
</Menu.Root>
```

The only rule this imposes: a part must be a descendant of its Root. Depth and intervening markup don't matter — context reaches any descendant — so you're free to wrap parts in your own layout elements. When the nesting genuinely can't hold (a trigger that lives in a header, a popup that lives in a route), reach for a [handle](#detaching-parts-with-a-handle) instead.

## Content is a snippet

Whatever you put between a part's tags is its `children` snippet, rendered wherever the part decides its content belongs. Write markup, drop in icons, nest more parts — it's yours:

```svelte title="Children"
<Switch.Root bind:checked>
  <Switch.Thumb>
    <Icon name="check" />
  </Switch.Thumb>
</Switch.Root>
```

Most parts hand their own state _back_ through that snippet. Write it in the named form to receive it and branch on it in markup:

```svelte title="Stateful content"
<script>
  import { Switch } from '@shardsui/svelte/switch'
</script>

<Switch.Root>
  <Switch.Thumb>
    {#snippet children({ checked })}
      {#if checked}
        <CheckedIcon />
      {:else}
        <UncheckedIcon />
      {/if}
    {/snippet}
  </Switch.Thumb>
</Switch.Root>
```

The named form is otherwise identical to markup between the tags — it just lets you name the parameters. What a part passes is listed in its `children` row in the API reference. The same values are also emitted as `data-*` attributes, so reach for the snippet when you need different markup; for styling alone, `data-*` in CSS is simpler.

`<Dialog.Root>` passes something other than its own state: the `payload` of whichever trigger opened it.

```svelte title="A snippet that receives the trigger's payload"
<script lang="ts">
  import { Dialog } from '@shardsui/svelte/dialog'

  const confirm = new Dialog.Handle<{ name: string }>()
</script>

<Dialog.Trigger handle={confirm} payload={{ name: 'billing' }}>Delete</Dialog.Trigger>

<Dialog.Root handle={confirm}>
  {#snippet children({ payload })}
    <Dialog.Portal>
      <Dialog.Popup>
        <Dialog.Title>Delete {payload?.name}?</Dialog.Title>
      </Dialog.Popup>
    </Dialog.Portal>
  {/snippet}
</Dialog.Root>
```

## Changing the rendered element

Every part picks the element that's correct for its role, and the `as` prop swaps it. `<Menu.Item>` renders a `<div>` by default; render it as an `<a>` and it behaves like a real link while keeping its menu-item semantics:

```svelte title="Item as a link"
<!-- [!code word:as="a"] -->
<Menu.Item as="a" href="https://example.com">Add to Library</Menu.Item>
```

`as` takes an HTML tag name — `'a'`, `'button'`, `'span'`, and so on — not a component. The default is already the fitting element for the part, so reach for `as` only when a specific case, like the anchor above, calls for a different tag.

In SvelteKit a plain `<a href>` routes on the client, so an anchor like that one navigates with no link wrapper around it. `<NavigationMenu.Link>` renders an `<a>` to begin with:

```svelte title="Navigation menu link"
<NavigationMenu.Link href="/pricing">Pricing</NavigationMenu.Link>
```

## Merging your own attributes

Any attribute that isn't one of a part's own props is forwarded straight to the element it renders. In the link above, `href` isn't a `Menu.Item` prop, so it lands on the `<a>`. The same path carries event handlers, ARIA, `data-*`, and styling hooks:

```svelte title="Forwarded attributes"
<Menu.Item data-section="billing" aria-label="Open billing" onclick={() => console.log('selected')}>
  Billing
</Menu.Item>
```

A handler doesn't replace the part's: for every event a part handles, yours runs first and the part's runs after, so its ARIA, keyboard handling, and `data-*` state all survive.

When you need the part to stand down for one event, call `preventShardsUIHandler()` on it — an escape hatch for cases no prop covers yet:

```svelte title="Suppressing the part's handler"
<!-- [!code word:preventShardsUIHandler] -->
<Menu.Item
  onclick={(event) => {
    if (!ready) event.preventShardsUIHandler()
  }}
>
  Billing
</Menu.Item>
```

## Getting the DOM node

Bind the underlying element with `bind:ref`. It's populated after the element mounts, so read it from an effect or an event handler, never during render:

```svelte title="Reading the element"
<script lang="ts">
  import { Popover } from '@shardsui/svelte/popover'

  let triggerEl = $state<HTMLElement | null>(null)

  $effect(() => {
    if (triggerEl) console.log(triggerEl.getBoundingClientRect())
  })
</script>

<Popover.Root>
  <Popover.Trigger bind:ref={triggerEl}>Open</Popover.Trigger>
  ...
</Popover.Root>
```

Every part that renders its own element exposes `ref`. Pure providers like `Dialog.Root` don't.

## Wrapping a part in your own component

There's no render prop: to build a styled component out of a part, render the part and spread the rest of your props onto it. Destructure `ref` first if callers should be able to bind it — a spread passes values, not bindings.

```svelte title="MenuLink.svelte"
<script lang="ts">
  import type { ComponentProps } from 'svelte'
  import { Menu } from '@shardsui/svelte/menu'

  let { ref = $bindable(null), ...rest }: ComponentProps<typeof Menu.Item> = $props()
</script>

<Menu.Item as="a" class="menu-link" bind:ref {...rest} />
```

`class` sits before the spread, so a caller's own `class` wins. See [TypeScript](/svelte/typescript) for more on typing a wrapper.

## Detaching parts with a handle

When a trigger and the thing it opens can't sit together in the markup — a toolbar button and a dialog defined in a different route, say — a **handle** connects them without any shared `open` state threaded through props. Create one with the component's `Handle` class, pass it to both ends, and they find each other:

```svelte title="Detached trigger"
<!-- [!code word:handle={settings}] -->
<script>
  import { Dialog } from '@shardsui/svelte/dialog'

  const settings = new Dialog.Handle()
</script>

<Dialog.Trigger handle={settings}>Open settings</Dialog.Trigger>

<!-- ...anywhere else in the tree... -->
<Dialog.Root handle={settings}>...</Dialog.Root>
```

A handle also drives the component from your own code, no trigger required: `settings.open(triggerId)`, `settings.close()`, and a readonly `settings.isOpen`. `open` takes the `id` of a registered detached trigger so the popup knows what it was opened from — Popover, Menu, Tooltip, and Preview Card throw if no trigger with that id is registered, while Dialog, Alert Dialog, and Drawer also accept `null` for "no trigger" and add `openWithPayload(payload)`. `new Dialog.Handle<Payload>()` types the payload that flows through the trigger and into the root's `children` snippet — see [TypeScript](/svelte/typescript) for the details.

Handles are available on the overlay components where a detached trigger makes sense: `Dialog`, `AlertDialog`, `Drawer`, `Popover`, `Menu`, `Tooltip`, and `PreviewCard`.

## Providers

A provider renders no element of its own — it only publishes context to everything nested inside it. `DirectionProvider` is the one that applies to every component: wrap a subtree, or the whole app, and the components inside navigate and lay out for right-to-left reading.

```svelte title="Right-to-left subtree"
<script>
  import { DirectionProvider } from '@shardsui/svelte/direction-provider'
</script>

<DirectionProvider direction="rtl">
  <!-- components here read RTL -->
</DirectionProvider>
```

It changes component behavior only, never the DOM's own text direction — see [Reading direction](/svelte/state#reading-direction) for what that leaves you to do.

Three components ship a provider of their own: `<Tooltip.Provider>` shares one delay across the tooltips inside it, so the next one opens instantly; `<Toast.Provider>` holds the toast queue; and `<Drawer.Provider>` tracks which drawers are open, driving `<Drawer.Indent>` and `<Drawer.IndentBackground>`.
