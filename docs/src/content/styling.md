# Styling

Style parts with CSS or Tailwind.

Every part renders a real HTML element with no styles of its own. You write the CSS; the library exposes its state as `data-*` attributes and CSS variables you can target.

## The `class` and `style` props

Every part that renders an element takes a `class` prop, applied to that element. Svelte's string, array and object forms all work:

```svelte title="Switch"
<Switch.Thumb class="switch-thumb" />
```

Prefer a state selector over a class you compute yourself — most on/off state is already a `data-*` attribute (below).

Parts take a `style` prop too, for the values only the running app knows:

```svelte title="Switch"
<!-- [!code highlight] -->
<Switch.Thumb style="transform: translateX({x}px)" />
```

Parts are components, and Svelte's `class:` and `style:` directives only apply to elements, so build the string yourself rather than reaching for `style:transform`.

## State as `data-*` attributes

Each part mirrors its state onto the element as `data-*` attributes. Write one static class and style against the attribute.

[Switch](/svelte/switch) publishes `[data-checked]` and `[data-unchecked]`:

```css title="switch.css"
.switch-thumb {
  transform: translateX(0);
  transition: transform 150ms;
}

.switch-thumb[data-checked] {
  transform: translateX(1rem);
}
```

The attributes are consistent across the library:

- **On/off state** — `[data-open]` / `[data-closed]`, `[data-checked]` / `[data-unchecked]`, `[data-disabled]`, `[data-selected]`, and `[data-highlighted]` for the item the keyboard or pointer has highlighted in a list.
- **Resolved position** — `[data-side]` and `[data-align]` on a positioner and popup carry where a floating element landed _after_ collision handling, so a popup can style the edge nearest its trigger.
- **Enter and exit** — `[data-starting-style]` marks an element the frame it mounts; `[data-ending-style]` the moment before it unmounts. Set resting styles as the default and transitional styles behind these two attributes, and mount/unmount animate with a plain transition. See [Animation](/svelte/animation).

Each component's API reference lists what its own parts expose.

## CSS variables: live measurements

Where an attribute can't carry a number, a part sets a CSS variable for sizing or transform math. It updates as the layout changes.

[Accordion](/svelte/accordion) measures its panel and exposes `--accordion-panel-height`, which animates a height from `auto`:

```css title="accordion.css"
.accordion-panel {
  overflow: hidden;
  height: var(--accordion-panel-height);
  transition: height 200ms;
}

.accordion-panel[data-starting-style],
.accordion-panel[data-ending-style] {
  height: 0;
}
```

Floating parts publish measurements the same way. A [Select](/svelte/select) or [Popover](/svelte/popover) positioner sets `--anchor-width` / `--anchor-height` (the trigger's size), `--available-width` / `--available-height` (room before the viewport edge), and `--transform-origin` (the point nearest the anchor). They sit on the positioner and inherit down, so the popup can read them:

```css title="select.css"
.select-popup {
  min-width: var(--anchor-width);
  max-height: var(--available-height);
  transform-origin: var(--transform-origin);
}
```

Every [Dialog](/svelte/dialog) popup sets `--nested-dialogs` — how many dialogs are open inside it — paired with `[data-nested-dialog-open]`, so a parent can shrink or dim as children stack on top.

## Tailwind

Pass utilities through each part's `class` prop, and key state variants off the same `data-*` attributes with Tailwind's `data-*` syntax (`data-highlighted:…`, `data-starting-style:…`). Read a CSS variable with the `(--var)` shorthand, as in `origin-(--transform-origin)`:

```svelte title="Menu"
<script>
  import { Menu } from '@shardsui/svelte/menu'
</script>

<Menu.Root>
  <Menu.Trigger
    class="flex h-8 items-center justify-center rounded-md border border-gray-950 bg-white px-3 text-sm text-gray-950 select-none hover:bg-gray-100 focus-visible:outline-2 focus-visible:-outline-offset-1 focus-visible:outline-gray-950 active:bg-gray-200 data-popup-open:bg-gray-100"
  >
    Song
  </Menu.Trigger>
  <Menu.Portal>
    <Menu.Positioner class="outline-hidden" sideOffset={8}>
      <Menu.Popup
        class="origin-(--transform-origin) border border-gray-950 bg-white py-1 text-gray-950 outline-hidden transition data-ending-style:scale-95 data-ending-style:opacity-0 data-starting-style:scale-95 data-starting-style:opacity-0"
      >
        <Menu.Item
          class="flex py-2 pr-8 pl-4 text-sm/4 outline-hidden select-none data-highlighted:bg-gray-950 data-highlighted:text-white"
        >
          Add to Library
        </Menu.Item>
        <Menu.Item
          class="flex py-2 pr-8 pl-4 text-sm/4 outline-hidden select-none data-highlighted:bg-gray-950 data-highlighted:text-white"
        >
          Add to Playlist
        </Menu.Item>
      </Menu.Popup>
    </Menu.Positioner>
  </Menu.Portal>
</Menu.Root>
```

## Plain CSS

Give each part a `class`, then write the rules in a stylesheet. The same `data-*` attributes and CSS variables work from these selectors (`.menu-item[data-highlighted]`, `.menu-popup[data-starting-style]`):

```svelte title="Menu"
<script>
  import './menu.css'
  import { Menu } from '@shardsui/svelte/menu'
</script>

<Menu.Root>
  <Menu.Trigger class="menu-trigger">Song</Menu.Trigger>
  <Menu.Portal>
    <Menu.Positioner class="menu-positioner" sideOffset={8}>
      <Menu.Popup class="menu-popup">
        <Menu.Item class="menu-item">Add to Library</Menu.Item>
        <Menu.Item class="menu-item">Add to Playlist</Menu.Item>
      </Menu.Popup>
    </Menu.Positioner>
  </Menu.Portal>
</Menu.Root>
```

```css title="menu.css"
.menu-trigger {
  display: flex;
  height: 2rem;
  align-items: center;
  border: 1px solid var(--color-gray-950);
  background-color: white;
  padding-inline: 0.75rem;
}

.menu-popup {
  transform-origin: var(--transform-origin);
  border: 1px solid var(--color-gray-950);
  background-color: white;
  padding-block: 0.25rem;
}

.menu-item {
  display: flex;
  padding: 0.5rem 2rem 0.5rem 1rem;
  user-select: none;
}

.menu-item[data-highlighted] {
  background-color: var(--color-gray-950);
  color: white;
}
```

## Scoped `<style>` reaches your markup, not the parts

Scoped `<style>` stamps a hash onto the elements you write directly in a component and adds that hash to every selector. A `class` you pass to a part lands on the part's own element, deeper in the library — that element never gets your hash, so a scoped selector never matches it. This holds for every part, portalled or not.

So this rule does nothing:

```svelte
<style>
  /* Never matches — the Popup isn't scoped to this component. */
  .menu-popup {
    border: 1px solid var(--color-gray-950);
  }
</style>
```

Two ways through:

1. Put the rules in a stylesheet (above).
2. Opt the class out of scoping with `:global`. Alone, `:global(.menu-popup)` matches that class anywhere on the page. Anchor it to a wrapper you author and Svelte hashes the leading selector, so only what's inside `:global` stays global:

```svelte title="Accordion"
<div class="faq">
  <Accordion.Root>
    <Accordion.Item>
      <Accordion.Header>
        <Accordion.Trigger>Shipping</Accordion.Trigger>
      </Accordion.Header>
      <Accordion.Panel class="accordion-panel">Ships in 2–3 days.</Accordion.Panel>
    </Accordion.Item>
  </Accordion.Root>
</div>

<style>
  /* `.faq` is scoped to this component, so the rule only reaches
     panels rendered inside it. */
  .faq :global(.accordion-panel) {
    overflow: hidden;
  }
</style>
```

Styling several parts under one wrapper, the block form keeps the globals together: `.faq :global { .accordion-panel { … } .accordion-trigger { … } }`.

This reaches only parts that stay in your markup. A portalled part (dialog, tooltip, menu, …) is moved out of the wrapper, so an ancestor selector no longer matches it; use a bare `:global(.menu-popup)` or a stylesheet for those.
