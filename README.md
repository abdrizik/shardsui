![](docs/static/favicon.svg)

# @shardsui/svelte

Headless, accessible UI components for **Svelte 5**.

Unstyled, composable component parts with full ARIA, keyboard, and focus management.

[Documentation](https://shardsui.com)

## Install

```sh
npm i @shardsui/svelte
```

Requires `svelte@^5.40`

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

## Browser support

Chrome and Edge 121, Firefox 97, and Safari 18.2 or later.

## License

MIT — see [LICENSE](./LICENSE). Adapted from [Base UI](https://base-ui.com) (MIT © Material-UI SAS)
and rebuilt on runes with a Svelte-native API; `internal/floating/` derives from
[Floating UI](https://floating-ui.com) (MIT © Floating UI contributors).
