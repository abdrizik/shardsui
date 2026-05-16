![](https://raw.githubusercontent.com/abdrizik/shardsui/main/docs/static/favicon.svg)

# @shardsui/svelte

Headless, accessible UI components for **Svelte 5**.

Unstyled, composable component parts with full ARIA, keyboard, and focus management. Bring your own styles.

## Install

```sh
npm i @shardsui/svelte
```

## Usage

Import per component (tree-shakeable):

```js
import { Dialog } from '@shardsui/svelte/dialog'
```

Then compose the parts: `Dialog.Root`, `Dialog.Trigger`, `Dialog.Portal`, `Dialog.Backdrop`,
`Dialog.Popup`, `Dialog.Title`, `Dialog.Close`, and so on. Popovers and other anchored overlays use `Positioner` (with `portal` on by default) instead of a separate `Portal` part.

A root barrel is also available:

```js
import { Dialog, Menu, Combobox } from '@shardsui/svelte'
```

Helpers are exposed on the component namespace that owns them — `Combobox.createFilter` and `Autocomplete.createFilter`.

## Peer dependencies

- `svelte` `^5`

## Browser support

| Browser               | Minimum version |
| --------------------- | --------------- |
| Chrome, Edge          | 121             |
| Firefox               | 97              |
| Safari, Safari on iOS | 18.2            |

## License

MIT — see [LICENSE](./LICENSE). Adapted from [Base UI](https://base-ui.com) (MIT © Material-UI SAS)
and rebuilt on runes with a Svelte-native API; the internal floating layer derives from
[Floating UI](https://floating-ui.com) (MIT © Floating UI contributors).
