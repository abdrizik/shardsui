# Quick start

Install ShardsUI, set up portals, and compose a first component.

## Install

```bash title="Terminal"
npm install @shardsui/svelte
```

ShardsUI requires Svelte 5.40 or later. It ships as one package, and each component is its own entry point, so you import only what you use:

```svelte
<script>
  import { Popover } from '@shardsui/svelte/popover'
</script>
```

### Browser support

ShardsUI supports Chrome and Edge 121, Firefox 97, and Safari 18.2 — on desktop and iOS — or later.

## Set up

### Portals

Overlay components render their content through a **portal** so they escape clipping or a parent **stacking context**. Every overlay wraps its contents in a `<Component.Portal>` part, which appends them to the document body — pass `container` to send them somewhere else.

Give your layout root its own stacking context, and no `z-index` deeper in the tree can paint over a portalled overlay:

```svelte title="+layout.svelte"
<script>
  import './app.css'

  let { children } = $props()
</script>

<div class="root">
  {@render children()}
</div>
```

```css title="app.css"
.root {
  isolation: isolate;
}
```

### Full-viewport backdrops

Some browsers now render content edge-to-edge beneath collapsing browser chrome (iOS 26+ Safari, for example), so a `position: fixed` backdrop — a dialog's, say — can leave a gap once the page scrolls. Switching such a backdrop to `position: absolute` covers the whole visual viewport, and it needs the body as its containing block to stay put after a scroll:

```css title="app.css"
body {
  position: relative;
}
```

## Compose a component

Parts ship behavior and accessibility; you assemble them and bring the styles. Nest a [Popover](/svelte/popover)'s parts and style them with Tailwind, plain CSS, or a global stylesheet:

:demo{name="popover/hero"}

## Wrap the parts once

Rather than repeat the same classes at every call site, [wrap each part once](/svelte/composition#wrapping-a-part-in-your-own-component) in a component of your own and import that instead.

## Next steps

The [Styling](/svelte/styling), [Animation](/svelte/animation), and [Composition](/svelte/composition) guides cover appearance and structure. Or jump straight to a [component](/svelte/accordion).
