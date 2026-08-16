![](docs/static/favicon.svg)

# @shardsui/svelte

Headless, accessible UI components for **Svelte 5**.

Unstyled, composable component parts with full ARIA, keyboard, and focus management. Bring your own
styles.

[Documentation](https://shardsui.com) · [Quick start](https://shardsui.com/svelte/quick-start) ·
[npm](https://www.npmjs.com/package/@shardsui/svelte)

## Install

```sh
npm i @shardsui/svelte
```

Requires `svelte@^5.40` as a peer dependency.

## Usage

```svelte
<script>
  import { Dialog } from '@shardsui/svelte/dialog'
</script>

<Dialog.Root>
  <Dialog.Trigger>Open</Dialog.Trigger>
  <Dialog.Portal>
    <Dialog.Backdrop />
    <Dialog.Popup>
      <Dialog.Title>Title</Dialog.Title>
      <Dialog.Close>Close</Dialog.Close>
    </Dialog.Popup>
  </Dialog.Portal>
</Dialog.Root>
```

Every component is its own entry point, so you import only what you use. A root barrel is there when
you'd rather pull several at once:

```js
import { Combobox, Dialog, Menu } from '@shardsui/svelte'
```

## Documentation

Styling, composition, state, animation, forms, accessibility, and a page for every component live in
the [documentation](https://shardsui.com).

## Browser support

ShardsUI supports Chrome and Edge 121, Firefox 97, and Safari 18.2 — on desktop and iOS — or later.

## License

MIT — see [LICENSE](./LICENSE). Adapted from [Base UI](https://base-ui.com) (MIT © Material-UI SAS)
and rebuilt on runes with a Svelte-native API; `internal/floating/` derives from
[Floating UI](https://floating-ui.com) (MIT © Floating UI contributors).
