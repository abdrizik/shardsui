# Alert Dialog

A dialog requiring a response.

:demo{name="alert-dialog/hero"}

## Anatomy

```svelte title="Anatomy"
<script>
  import { AlertDialog } from '@shardsui/svelte/alert-dialog'
</script>

<AlertDialog.Root>
  <AlertDialog.Trigger />
  <AlertDialog.Portal>
    <AlertDialog.Backdrop />
    <AlertDialog.Viewport>
      <AlertDialog.Popup>
        <AlertDialog.Title />
        <AlertDialog.Description />
        <AlertDialog.Close />
      </AlertDialog.Popup>
    </AlertDialog.Viewport>
  </AlertDialog.Portal>
</AlertDialog.Root>
```

## Examples

### Open from a menu

To open an alert dialog from a menu, keep the alert dialog controlled and flip its state from the menu item's `onclick` handler.

```svelte title="Connecting a dialog to a menu"
<script>
  import { AlertDialog } from '@shardsui/svelte/alert-dialog'
  import { Menu } from '@shardsui/svelte/menu'
  let dialogOpen = $state(false)
</script>

<Menu.Root>
  <Menu.Trigger>Open menu</Menu.Trigger>
  <Menu.Portal>
    <Menu.Positioner>
      <Menu.Popup>
        <!-- Open the dialog when the menu item is clicked -->
        <!-- [!code highlight] -->
        <Menu.Item onclick={() => (dialogOpen = true)}>Open dialog</Menu.Item>
      </Menu.Popup>
    </Menu.Positioner>
  </Menu.Portal>
</Menu.Root>

<!-- Control the dialog state -->
<!-- [!code highlight] -->
<AlertDialog.Root open={dialogOpen} onOpenChange={(v) => (dialogOpen = v)}>
  <AlertDialog.Portal>
    <AlertDialog.Backdrop />
    <AlertDialog.Popup>
      <!-- Rest of the dialog -->
    </AlertDialog.Popup>
  </AlertDialog.Portal>
</AlertDialog.Root>
```

### Close confirmation

A nested confirmation dialog guards against losing work: it opens when the text typed into the parent dialog is about to be discarded.

Veto the close with a [function binding](https://svelte.dev/docs/svelte/bind#Function-bindings) — `bind:open={() => open, (next) => …}`. When a close is requested the setter runs; if you don't commit the new value, the getter keeps returning the old one and the dialog stays open. Open the confirmation there instead, so the prompt appears whether the user presses Esc or hits a close button. An alert dialog is never dismissed by clicking the backdrop.

```svelte
<AlertDialog.Root
  bind:open={
    () => open,
    (next) => {
      if (!next && hasUnsavedChanges) return // veto: don't commit, dialog stays open
      open = next
    }
  }
>
```

Style the parent dialog through the `[data-nested-dialog-open]` selector and the `var(--nested-dialogs)` CSS variable. Child dialogs render their own backdrop, marked with `data-nested` — hide it with `[data-nested] { opacity: 0 }` to keep the parent visible behind the one on top.

The demo below uses [Dialog](/svelte/dialog) — the same pattern applies to AlertDialog.

:demo{name="dialog/close-confirmation"}

### Detached triggers

For a simple one-off, keep `<AlertDialog.Trigger>` inside the root, as in the example at the top of this page. When the trigger and the alert dialog's content can't sit together in the markup, detach them: render `<AlertDialog.Trigger>` wherever it fits and connect it to the root with a shared `handle` from `new AlertDialog.Handle()`.

The handle's imperative methods — `open()`, `openWithPayload()` and `close()` — only take effect while an `<AlertDialog.Root>` using the same handle is mounted. Calls made before a root mounts or after it unmounts are ignored, not queued: each mount starts from fresh state, with no replay and no open state carried over from a previous one.

```svelte title="Detached triggers"
<!-- [!code word:handle={h}] -->
<script>
  const h = new AlertDialog.Handle()
</script>

<!-- [!code highlight] -->
<AlertDialog.Trigger handle={h}>Open</AlertDialog.Trigger>

<!-- [!code highlight] -->
<AlertDialog.Root handle={h}>...</AlertDialog.Root>
```

:demo{name="alert-dialog/detached-triggers-simple"}

### Multiple triggers

Several triggers can open the same alert dialog. Share one `handle` across detached triggers, or drop multiple `<AlertDialog.Trigger>` components inside a single `<AlertDialog.Root>`.

```svelte title="Multiple triggers within the Root part"
<AlertDialog.Root>
  <AlertDialog.Trigger>Trigger 1</AlertDialog.Trigger>
  <AlertDialog.Trigger>Trigger 2</AlertDialog.Trigger>
  ...
</AlertDialog.Root>
```

```svelte title="Multiple detached triggers"
<script>
  const h = new AlertDialog.Handle()
</script>

<AlertDialog.Trigger handle={h}>Trigger 1</AlertDialog.Trigger>
<AlertDialog.Trigger handle={h}>Trigger 2</AlertDialog.Trigger>
<AlertDialog.Root handle={h}>...</AlertDialog.Root>
```

To show different content depending on which trigger opened the alert dialog, pass a `payload` to each `<AlertDialog.Trigger>` and read it through the `children` snippet on `<AlertDialog.Root>`. Give `new AlertDialog.Handle()` a type argument to type the payload:

```svelte title="Detached triggers with payload"
<!-- [!code word:payload] -->
<script>
  // [!code highlight]
  const h = new AlertDialog.Handle<{ message: string }>()
</script>

<!-- [!code word:payload] -->
<!-- [!code highlight] -->
<AlertDialog.Trigger handle={h} payload={{ message: 'Trigger 1' }}>Trigger 1</AlertDialog.Trigger>

<!-- [!code word:payload] -->
<!-- [!code highlight] -->
<AlertDialog.Trigger handle={h} payload={{ message: 'Trigger 2' }}>Trigger 2</AlertDialog.Trigger>

<AlertDialog.Root handle={h}>
  {#snippet children({ payload })}
    <AlertDialog.Portal>
      <AlertDialog.Popup>
        <AlertDialog.Title>Alert dialog</AlertDialog.Title>
        <!-- [!code word:payload] -->
        {#if payload !== undefined}
          <!-- [!code word:payload] -->
          <AlertDialog.Description>Confirming {payload.message}</AlertDialog.Description>
        {/if}
      </AlertDialog.Popup>
    </AlertDialog.Portal>
  {/snippet}
</AlertDialog.Root>
```

### Controlled mode with multiple triggers

When the alert dialog's visibility depends on your app's state, drive it with the `open` and `onOpenChange` props on `<AlertDialog.Root>`. With multiple triggers, give each `<AlertDialog.Trigger>` an `id` and add `bind:triggerId` to `<AlertDialog.Root>`: each trigger publishes its own `id` when it opens the dialog, and setting `triggerId` yourself associates the dialog with that trigger.

:demo{name="alert-dialog/detached-triggers-controlled"}

## API reference

### Root

Groups all parts of the alert dialog.
Doesn't render its own HTML element.

::table{columns="Prop,Type,Default"}

| Prop                   | Type                      | Default | Description                                                                                                                                                                         |
| :--------------------- | :------------------------ | :------ | :---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `open`                 | `boolean`                 | `false` | Whether the dialog is currently open (use `bind:open`).                                                                                                                             |
| `onOpenChange`         | `(open: boolean) => void` | —       | Event handler called when the alert dialog is opened or closed.                                                                                                                     |
| `onOpenChangeComplete` | `(open: boolean) => void` | —       | Event handler called after any animations complete when the dialog is opened or closed.                                                                                             |
| `handle`               | `AlertDialog.Handle`      | —       | A handle to associate the alert dialog with a trigger. If specified, allows external triggers to control the alert dialog's open state. Create one with `new AlertDialog.Handle()`. |
| `triggerId`            | `string \| null`          | `null`  | Active trigger id in multi-trigger scenarios (use `bind:triggerId`).                                                                                                                |
| `children`             | `Snippet<[{ payload }]>`  | —       | Content; receives the active trigger's `payload`.                                                                                                                                   |

::

### Trigger

A button that opens the alert dialog.
Renders a `<button>` element.

::table{columns="Prop,Type,Default"}

| Prop       | Type                            | Default    | Description                                                                                                                             |
| :--------- | :------------------------------ | :--------- | :-------------------------------------------------------------------------------------------------------------------------------------- |
| `as`       | `keyof HTMLElementTagNameMap`   | `'button'` | HTML element to render.                                                                                                                 |
| `class`    | `string`                        | —          | CSS class applied to the element.                                                                                                       |
| `style`    | `string`                        | —          | Inline style applied to the element.                                                                                                    |
| `disabled` | `boolean`                       | `false`    | Whether the trigger is disabled.                                                                                                        |
| `id`       | `string`                        | auto       | Custom element ID. Matched against `<AlertDialog.Root triggerId>`.                                                                      |
| `handle`   | `AlertDialog.Handle`            | —          | A handle created with `new AlertDialog.Handle()` for detached trigger usage (outside the Root).                                         |
| `payload`  | `Payload`                       | —          | Per-trigger payload forwarded to the dialog when this trigger opens it. Accessible via the `children` snippet's `{ payload }` argument. |
| `children` | `Snippet<[{ disabled, open }]>` | —          | Content; receives the trigger state.                                                                                                    |

::

| Attribute         | Description                                               |
| :---------------- | :-------------------------------------------------------- |
| `data-popup-open` | Present while the alert dialog is open from this trigger. |
| `data-disabled`   | Present when the trigger is disabled.                     |

### Portal

A portal that moves the popup out to `<body>`, clear of ancestor clipping and stacking.
Renders a `<div>` element.

::table{columns="Prop,Type,Default"}

| Prop          | Type                  | Default | Description                                                                                                   |
| :------------ | :-------------------- | :------ | :------------------------------------------------------------------------------------------------------------ |
| `container`   | `HTMLElement \| null` | —       | Parent element to render the portal into. Defaults to the nearest ancestor portal, otherwise `document.body`. |
| `keepMounted` | `boolean`             | `false` | Whether to keep the contents mounted while the popup is closed.                                               |
| `children`    | `Snippet`             | —       | Content.                                                                                                      |

::

### Backdrop

An overlay displayed beneath the popup.
Renders a `<div>` element.

::table{columns="Prop,Type,Default"}

| Prop       | Type                                    | Default | Description                           |
| :--------- | :-------------------------------------- | :------ | :------------------------------------ |
| `as`       | `keyof HTMLElementTagNameMap`           | `'div'` | HTML element to render.               |
| `class`    | `string`                                | —       | CSS class applied to the element.     |
| `style`    | `string`                                | —       | Inline style applied to the element.  |
| `children` | `Snippet<[{ open, transitionStatus }]>` | —       | Content; receives the backdrop state. |

::

| Attribute                 | Description                                                         |
| :------------------------ | :------------------------------------------------------------------ |
| `data-open`               | Present when the alert dialog is open.                              |
| `data-closed`             | Present when the alert dialog is closed.                            |
| `data-nested`             | Present when the alert dialog is nested within another dialog.      |
| `data-nested-dialog-open` | Present when the alert dialog has other open dialogs nested within. |
| `data-starting-style`     | Present when the backdrop is animating in.                          |
| `data-ending-style`       | Present when the backdrop is animating out.                         |

### Viewport

A positioning container for the dialog popup that can be made scrollable.
Renders a `<div>` element.

::table{columns="Prop,Type,Default"}

| Prop       | Type                                                              | Default | Description                           |
| :--------- | :---------------------------------------------------------------- | :------ | :------------------------------------ |
| `as`       | `keyof HTMLElementTagNameMap`                                     | `'div'` | HTML element to render.               |
| `class`    | `string`                                                          | —       | CSS class applied to the element.     |
| `style`    | `string`                                                          | —       | Inline style applied to the element.  |
| `children` | `Snippet<[{ open, transitionStatus, nested, nestedDialogOpen }]>` | —       | Content; receives the viewport state. |

::

| Attribute                 | Description                                                         |
| :------------------------ | :------------------------------------------------------------------ |
| `data-open`               | Present when the alert dialog is open.                              |
| `data-closed`             | Present when the alert dialog is closed.                            |
| `data-starting-style`     | Present when the alert dialog is animating in.                      |
| `data-ending-style`       | Present when the alert dialog is animating out.                     |
| `data-nested`             | Present when the alert dialog is nested within another dialog.      |
| `data-nested-dialog-open` | Present when the alert dialog has other open dialogs nested within. |

### Popup

A container for the dialog contents.
Renders a `<div>` element.

::table{columns="Prop,Type,Default"}

| Prop           | Type                                                                                   | Default | Description                                                                                                                                                                                                                                                                         |
| :------------- | :------------------------------------------------------------------------------------- | :------ | :---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `as`           | `keyof HTMLElementTagNameMap`                                                          | `'div'` | HTML element to render.                                                                                                                                                                                                                                                             |
| `class`        | `string`                                                                               | —       | CSS class applied to the element.                                                                                                                                                                                                                                                   |
| `style`        | `string`                                                                               | —       | Inline style applied to the element.                                                                                                                                                                                                                                                |
| `id`           | `string`                                                                               | auto    | Custom element ID. Referenced by the trigger's `aria-controls`.                                                                                                                                                                                                                     |
| `initialFocus` | `HTMLElement \| boolean \| ((type: string) => HTMLElement \| boolean \| null \| void)` | —       | Element to focus when the alert dialog opens, or a function receiving the interaction type (`'mouse'`, `'keyboard'`, `'touch'`, `'pen'`). `false` to skip; `true` focuses the first tabbable child. Defaults to the first tabbable child, or the popup itself when opened by touch. |
| `finalFocus`   | `HTMLElement \| boolean \| ((type: string) => HTMLElement \| boolean \| null \| void)` | —       | Element to focus when the alert dialog closes, or a function receiving the interaction type. `false` to skip; `true` (default) returns focus to the trigger.                                                                                                                        |
| `children`     | `Snippet<[{ open, transitionStatus, nested, nestedDialogOpen }]>`                      | —       | Content; receives the popup state.                                                                                                                                                                                                                                                  |

::

| Attribute                 | Description                                                         |
| :------------------------ | :------------------------------------------------------------------ |
| `data-open`               | Present when the alert dialog is open.                              |
| `data-closed`             | Present when the alert dialog is closed.                            |
| `data-starting-style`     | Present when the alert dialog is animating in.                      |
| `data-ending-style`       | Present when the alert dialog is animating out.                     |
| `data-nested`             | Present when the alert dialog is nested within another dialog.      |
| `data-nested-dialog-open` | Present when the alert dialog has other open dialogs nested within. |

| CSS Variable       | Description                              |
| :----------------- | :--------------------------------------- |
| `--nested-dialogs` | Number of nested dialogs currently open. |

### Title

A heading that labels the alert dialog.
Renders an `<h2>` element.

::table{columns="Prop,Type,Default"}

| Prop       | Type                          | Default | Description                          |
| :--------- | :---------------------------- | :------ | :----------------------------------- |
| `as`       | `keyof HTMLElementTagNameMap` | `'h2'`  | HTML element to render.              |
| `class`    | `string`                      | —       | CSS class applied to the element.    |
| `style`    | `string`                      | —       | Inline style applied to the element. |
| `id`       | `string`                      | auto    | Custom element ID.                   |
| `children` | `Snippet`                     | —       | Content.                             |

::

### Description

A paragraph with additional information about the alert dialog.
Renders a `<p>` element.

::table{columns="Prop,Type,Default"}

| Prop       | Type                          | Default | Description                          |
| :--------- | :---------------------------- | :------ | :----------------------------------- |
| `as`       | `keyof HTMLElementTagNameMap` | `'p'`   | HTML element to render.              |
| `class`    | `string`                      | —       | CSS class applied to the element.    |
| `style`    | `string`                      | —       | Inline style applied to the element. |
| `id`       | `string`                      | auto    | Custom element ID.                   |
| `children` | `Snippet`                     | —       | Content.                             |

::

### Close

A button that closes the dialog.
Renders a `<button>` element.

::table{columns="Prop,Type,Default"}

| Prop       | Type                          | Default    | Description                                       |
| :--------- | :---------------------------- | :--------- | :------------------------------------------------ |
| `as`       | `keyof HTMLElementTagNameMap` | `'button'` | HTML element to render.                           |
| `class`    | `string`                      | —          | CSS class applied to the element.                 |
| `style`    | `string`                      | —          | Inline style applied to the element.              |
| `disabled` | `boolean`                     | `false`    | Whether the button is disabled.                   |
| `children` | `Snippet<[{ disabled }]>`     | —          | Content; receives whether the button is disabled. |

::

| Attribute       | Description                          |
| :-------------- | :----------------------------------- |
| `data-disabled` | Present when the button is disabled. |

## Handle

Connects an `<AlertDialog.Root>` with detached `<AlertDialog.Trigger>` components, and controls the alert dialog imperatively. Pass a type argument to type the `payload`.

```ts
const alertDialog = new AlertDialog.Handle<Payload>()
```

::table{columns="Member,Type"}

| Member                     | Type                           | Description                                                                                     |
| :------------------------- | :----------------------------- | :---------------------------------------------------------------------------------------------- |
| `isOpen`                   | `boolean`                      | Whether the alert dialog is currently open (readonly).                                          |
| `open(triggerId)`          | `(id: string \| null) => void` | Opens the alert dialog. Pass a trigger `id` to associate it, or `null` to open with no trigger. |
| `openWithPayload(payload)` | `(payload: Payload) => void`   | Opens the alert dialog with a payload for the `children` snippet.                               |
| `close()`                  | `() => void`                   | Closes the alert dialog.                                                                        |

::
