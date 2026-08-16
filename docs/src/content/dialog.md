# Dialog

A focus-trapping overlay.

:demo{name="dialog/hero"}

## Anatomy

```svelte title="Anatomy"
<script>
  import { Dialog } from '@shardsui/svelte/dialog'
</script>

<Dialog.Root>
  <Dialog.Trigger />
  <Dialog.Portal>
    <Dialog.Backdrop />
    <Dialog.Viewport>
      <Dialog.Popup>
        <Dialog.Title />
        <Dialog.Description />
        <Dialog.Close />
      </Dialog.Popup>
    </Dialog.Viewport>
  </Dialog.Portal>
</Dialog.Root>
```

`Dialog.Viewport` is optional. It provides a scrollable positioning container for the popup. When not needed, use `Dialog.Popup` directly with fixed positioning.

## Usage guidelines

- **Dialog doesn't support gestures**: if you need gestures or snap points, use [Drawer](/svelte/drawer). A panel that slides in from the screen edge without gestures is just a positioned Dialog.

## Examples

### State

By default, Dialog manages its own open state, and no props are required.

```svelte title="Uncontrolled dialog"
<Dialog.Root>
  <Dialog.Trigger>Open</Dialog.Trigger>
  <Dialog.Portal>
    <Dialog.Popup>
      <Dialog.Title>Example dialog</Dialog.Title>
      <Dialog.Close>Close</Dialog.Close>
    </Dialog.Popup>
  </Dialog.Portal>
</Dialog.Root>
```

Drive open with `open` / `onOpenChange`, or `bind:open`.

```svelte title="Controlled dialog"
<script>
  let open = $state(false)
</script>

<Dialog.Root {open} onOpenChange={(next) => (open = next)}>
  <Dialog.Trigger>Open</Dialog.Trigger>
  <Dialog.Portal>
    <Dialog.Popup>
      <form
        onsubmit={async () => {
          // Close the dialog once the form data is submitted
          await submitData()
          open = false
        }}
      >
        ...
      </form>
    </Dialog.Popup>
  </Dialog.Portal>
</Dialog.Root>
```

`onOpenChange` is also the place to run side effects when the dialog opens or closes. Prefer it over `$effect`.

```svelte title="Running code when dialog state changes"
<Dialog.Root
  {open}
  onOpenChange={(next) => {
    // Do stuff when the dialog is closed
    if (!next) {
      doStuff()
    }
    // Set the new state
    open = next
  }}
>
  ...
</Dialog.Root>
```

### Open from a menu

To open a dialog from a menu, keep the dialog controlled and flip its state from the menu item's `onclick` handler.

```svelte title="Connecting a dialog to a menu"
<script>
  import { Dialog } from '@shardsui/svelte/dialog'
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
<Dialog.Root open={dialogOpen} onOpenChange={(v) => (dialogOpen = v)}>
  <Dialog.Portal>
    <Dialog.Backdrop />
    <Dialog.Popup>
      <!-- Rest of the dialog -->
    </Dialog.Popup>
  </Dialog.Portal>
</Dialog.Root>
```

### Nested dialogs

Dialogs can be nested. Style the parent through the `[data-nested-dialog-open]` selector and the `var(--nested-dialogs)` CSS variable. Child dialogs render their own backdrop, marked with `data-nested`. Hide it with `[data-nested] { opacity: 0 }` to keep the parent visible behind the one on top.

:demo{name="dialog/nested"}

### Close confirmation

A nested confirmation dialog guards against losing work: it opens when the text typed into the parent dialog is about to be discarded.

Veto the close with a [function binding](https://svelte.dev/docs/svelte/bind#Function-bindings) — `bind:open={() => open, (next) => …}`. When a close is requested the setter runs; if you don't commit the new value, the getter keeps returning the old one and the dialog stays open. Open the confirmation there instead, so the prompt appears whether the user clicks the backdrop, presses Esc, or hits a close button.

```svelte
<Dialog.Root
  bind:open={
    () => open,
    (next) => {
      if (!next && hasUnsavedChanges) return // veto: don't commit, dialog stays open
      open = next
    }
  }
>
```

:demo{name="dialog/close-confirmation"}

### Custom focus management

Control where focus goes when the dialog opens and closes with the `initialFocus` and `finalFocus` props on `<Dialog.Popup>`.

:demo{name="dialog/focus-management"}

### Outside scroll dialog

For long content, make `<Dialog.Viewport>` the outer scrollable container and let `<Dialog.Popup>` extend past the bottom edge. The scrollable area draws custom scrollbars with the [Scroll Area component](/svelte/scroll-area).

:demo{name="dialog/outside-scroll"}

### Inside scroll dialog

Here the popup stays fully on screen and an inner container scrolls instead. `<Dialog.Viewport>` positions `<Dialog.Popup>`, and the inner scrollable area is built with the [Scroll Area component](/svelte/scroll-area).

:demo{name="dialog/inside-scroll"}

### Placing elements outside the popup

To place elements "outside" the colored popup area, still render them inside `<Dialog.Popup>` and move the popup styles onto a child element. This preserves tab order and correct screen-reader announcements.

`<Dialog.Popup>` uses `pointer-events: none` while its inner content — the colored popup and close button — uses `pointer-events: auto`, so backdrop clicks still register.

:demo{name="dialog/uncontained"}

### Detached triggers

Keep `<Dialog.Trigger>` inside the root, as in the example at the top of this page. When the trigger and the dialog's content can't sit together in the markup, detach them: connect the trigger to a `<Dialog.Root>` with a shared `handle` from `new Dialog.Handle()`, with no shared `open` state needed.

```svelte title="Detached triggers"
<!-- [!code word:handle={myDialog}] -->
<script>
  const myDialog = new Dialog.Handle()
</script>

<!-- [!code highlight] -->
<Dialog.Trigger handle={myDialog}>Open</Dialog.Trigger>

<!-- [!code highlight] -->
<Dialog.Root handle={myDialog}>...</Dialog.Root>
```

:demo{name="dialog/detached-triggers-simple"}

### Multiple triggers

Several triggers can open the same dialog. Share one `handle` across detached triggers, or drop multiple `<Dialog.Trigger>` components inside a single `<Dialog.Root>`.

```svelte title="Multiple triggers within the Root part"
<Dialog.Root>
  <Dialog.Trigger>Trigger 1</Dialog.Trigger>
  <Dialog.Trigger>Trigger 2</Dialog.Trigger>
  ...
</Dialog.Root>
```

```svelte title="Multiple detached triggers"
<script>
  const demoDialog = new Dialog.Handle()
</script>

<Dialog.Trigger handle={demoDialog}>Trigger 1</Dialog.Trigger>
<Dialog.Trigger handle={demoDialog}>Trigger 2</Dialog.Trigger>
<Dialog.Root handle={demoDialog}>...</Dialog.Root>
```

To show different content depending on which trigger opened the dialog, pass a `payload` to each `<Dialog.Trigger>` and read it through the `children` snippet on `<Dialog.Root>`. Give `new Dialog.Handle()` a type argument to type the payload:

```svelte title="Detached triggers with payload"
<script>
  // [!code highlight]
  const demoDialog = new Dialog.Handle<{ text: string }>()
</script>

<!-- [!code word:payload] -->
<!-- [!code highlight] -->
<Dialog.Trigger handle={demoDialog} payload={{ text: 'Trigger 1' }}>Trigger 1</Dialog.Trigger>

<!-- [!code word:payload] -->
<!-- [!code highlight] -->
<Dialog.Trigger handle={demoDialog} payload={{ text: 'Trigger 2' }}>Trigger 2</Dialog.Trigger>

<Dialog.Root handle={demoDialog}>
  <!-- [!code word:payload] -->
  {#snippet children({ payload })}
    <Dialog.Portal>
      <Dialog.Popup>
        <Dialog.Title>Dialog</Dialog.Title>
        <!-- [!code word:payload] -->
        {#if payload !== undefined}
          <!-- [!code word:payload] -->
          <Dialog.Description>This has been opened by {payload.text}</Dialog.Description>
        {/if}
      </Dialog.Popup>
    </Dialog.Portal>
  {/snippet}
</Dialog.Root>
```

### Controlled mode with multiple triggers

With multiple triggers, track the active one with `bind:triggerId` on `<Dialog.Root>` and the `id` prop on each `<Dialog.Trigger>`. The dialog writes back the `id` of the trigger that opened it.

:demo{name="dialog/detached-triggers-controlled"}

## API reference

### Root

Groups all parts of the dialog.
Doesn't render its own HTML element.

::table{columns="Prop,Type,Default"}

| Prop                      | Type                      | Default | Description                                                                                                                                                                                                                                                                                                                                                                                                                                         |
| :------------------------ | :------------------------ | :------ | :-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `open`                    | `boolean`                 | `false` | Whether the dialog is currently open.                                                                                                                                                                                                                                                                                                                                                                                                               |
| `modal`                   | `boolean \| 'trap-focus'` | `true`  | Determines if the dialog enters a modal state when open. `true`: user interaction is limited to just the dialog: focus is trapped, document page scroll is locked, and pointer interactions on outside elements are disabled. `false`: user interaction with the rest of the document is allowed. `'trap-focus'`: focus is trapped inside the dialog, but document page scroll is not locked and pointer interactions outside of it remain enabled. |
| `disablePointerDismissal` | `boolean`                 | `false` | Whether to prevent the dialog from closing on outside presses.                                                                                                                                                                                                                                                                                                                                                                                      |
| `onOpenChange`            | `(open: boolean) => void` | —       | Event handler called when the dialog is opened or closed.                                                                                                                                                                                                                                                                                                                                                                                           |
| `onOpenChangeComplete`    | `(open: boolean) => void` | —       | Event handler called after any animations complete when the dialog is opened or closed.                                                                                                                                                                                                                                                                                                                                                             |
| `handle`                  | `Dialog.Handle<Payload>`  | —       | A handle to associate the dialog with a trigger. If specified, allows external triggers to control the dialog's open state. Create one with `new Dialog.Handle()`.                                                                                                                                                                                                                                                                                  |
| `triggerId`               | `string \| null`          | `null`  | ID of the trigger that the dialog is associated with. This is useful in conjunction with the `open` prop to create a controlled dialog.                                                                                                                                                                                                                                                                                                             |
| `children`                | `Snippet<[{ payload }]>`  | —       | Content; receives the active trigger's `payload`.                                                                                                                                                                                                                                                                                                                                                                                                   |

::

### Trigger

A button that opens the dialog.
Renders a `<button>` element.

::table{columns="Prop,Type,Default"}

| Prop       | Type                            | Default    | Description                                                                                                                                                 |
| :--------- | :------------------------------ | :--------- | :---------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `as`       | `keyof HTMLElementTagNameMap`   | `'button'` | HTML element to render.                                                                                                                                     |
| `class`    | `string`                        | —          | CSS class applied to the element.                                                                                                                           |
| `style`    | `string`                        | —          | Inline style applied to the element.                                                                                                                        |
| `disabled` | `boolean`                       | `false`    | Whether the trigger is disabled.                                                                                                                            |
| `id`       | `string`                        | auto       | Custom element ID. Matched against `<Dialog.Root triggerId>`.                                                                                               |
| `handle`   | `Dialog.Handle<Payload>`        | —          | A handle created with `new Dialog.Handle()`. When supplied, this trigger does not need to live inside `<Dialog.Root>` (detached trigger pattern).           |
| `payload`  | `Payload`                       | —          | Per-trigger payload forwarded to the Root's `children` snippet when this trigger opens the dialog. Used with the `handle` prop for multi-trigger scenarios. |
| `children` | `Snippet<[{ disabled, open }]>` | —          | Content; receives the trigger state.                                                                                                                        |

::

| Attribute         | Description                                         |
| :---------------- | :-------------------------------------------------- |
| `data-popup-open` | Present while the dialog is open from this trigger. |
| `data-disabled`   | Present when the trigger is disabled.               |

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

| Attribute                 | Description                                                      |
| :------------------------ | :--------------------------------------------------------------- |
| `data-open`               | Present when the dialog is open.                                 |
| `data-closed`             | Present when the dialog is closed.                               |
| `data-nested`             | Present when the dialog is nested within another dialog.         |
| `data-nested-dialog-open` | Present when the dialog has other open dialogs nested within it. |
| `data-starting-style`     | Present when the backdrop is animating in.                       |
| `data-ending-style`       | Present when the backdrop is animating out.                      |

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

| Attribute                 | Description                                                      |
| :------------------------ | :--------------------------------------------------------------- |
| `data-open`               | Present when the dialog is open.                                 |
| `data-closed`             | Present when the dialog is closed.                               |
| `data-nested`             | Present when the dialog is nested within another dialog.         |
| `data-nested-dialog-open` | Present when the dialog has other open dialogs nested within it. |
| `data-starting-style`     | Present when the dialog is animating in.                         |
| `data-ending-style`       | Present when the dialog is animating out.                        |

### Popup

A container for the dialog contents.
Renders a `<div>` element.

::table{columns="Prop,Type,Default"}

| Prop           | Type                                                                                   | Default | Description                                                                                                                                                                                                                                                                   |
| :------------- | :------------------------------------------------------------------------------------- | :------ | :---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `as`           | `keyof HTMLElementTagNameMap`                                                          | `'div'` | HTML element to render.                                                                                                                                                                                                                                                       |
| `class`        | `string`                                                                               | —       | CSS class applied to the element.                                                                                                                                                                                                                                             |
| `style`        | `string`                                                                               | —       | Inline style applied to the element.                                                                                                                                                                                                                                          |
| `id`           | `string`                                                                               | auto    | Custom element ID. Referenced by the trigger's `aria-controls`.                                                                                                                                                                                                               |
| `initialFocus` | `HTMLElement \| boolean \| ((type: string) => HTMLElement \| boolean \| null \| void)` | —       | Element to focus when the dialog opens, or a function receiving the interaction type (`'mouse'`, `'keyboard'`, `'touch'`, `'pen'`). `false` to skip; `true` focuses the first tabbable child. Defaults to the first tabbable child, or the popup itself when opened by touch. |
| `finalFocus`   | `HTMLElement \| boolean \| ((type: string) => HTMLElement \| boolean \| null \| void)` | —       | Element to focus when the dialog closes, or a function receiving the interaction type. `false` to skip; `true` (default) to return focus to the trigger.                                                                                                                      |
| `children`     | `Snippet<[{ open, transitionStatus, nested, nestedDialogOpen }]>`                      | —       | Content; receives the popup state.                                                                                                                                                                                                                                            |

::

| Attribute                 | Description                                                      |
| :------------------------ | :--------------------------------------------------------------- |
| `data-open`               | Present when the dialog is open.                                 |
| `data-closed`             | Present when the dialog is closed.                               |
| `data-nested`             | Present when the dialog is nested within another dialog.         |
| `data-nested-dialog-open` | Present when the dialog has other open dialogs nested within it. |
| `data-starting-style`     | Present when the dialog is animating in.                         |
| `data-ending-style`       | Present when the dialog is animating out.                        |

| CSS Variable       | Description                                   |
| :----------------- | :-------------------------------------------- |
| `--nested-dialogs` | Indicates how many dialogs are nested within. |

### Title

A heading that labels the dialog.
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

A paragraph with additional information about the dialog.
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

Connects a `<Dialog.Root>` with detached `<Dialog.Trigger>` components, and controls the dialog imperatively. Pass a type argument to type the `payload`.

```ts
const dialog = new Dialog.Handle<Payload>()
```

::table{columns="Member,Type"}

| Member                     | Type                           | Description                                                                               |
| :------------------------- | :----------------------------- | :---------------------------------------------------------------------------------------- |
| `isOpen`                   | `boolean`                      | Whether the dialog is currently open (readonly).                                          |
| `open(triggerId)`          | `(id: string \| null) => void` | Opens the dialog. Pass a trigger `id` to associate it, or `null` to open with no trigger. |
| `openWithPayload(payload)` | `(payload: Payload) => void`   | Opens the dialog with a payload for the `children` snippet.                               |
| `close()`                  | `() => void`                   | Closes the dialog.                                                                        |

::
