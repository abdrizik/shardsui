# Toast

A self-dismissing message.

:demo{name="toast/hero"}

## Anatomy

```svelte title="Anatomy"
<script>
  import { Toast } from '@shardsui/svelte/toast'
</script>

<Toast.Provider>
  <Toast.Portal>
    <Toast.Viewport>
      <!-- Stacked toasts -->
      <Toast.Root {toast}>
        <Toast.Content>
          <Toast.Title />
          <Toast.Description />
          <Toast.Action />
          <Toast.Close />
        </Toast.Content>
      </Toast.Root>

      <!-- Anchored toasts -->
      <Toast.Positioner {toast}>
        <Toast.Root {toast}>
          <Toast.Arrow />
          <Toast.Content>
            <Toast.Title />
            <Toast.Description />
            <Toast.Action />
            <Toast.Close />
          </Toast.Content>
        </Toast.Root>
      </Toast.Positioner>
    </Toast.Viewport>
  </Toast.Portal>
</Toast.Provider>
```

## Usage guidelines

- **Mount one provider near the root**: toasts belong to the `<Toast.Provider>` that added them, so a second provider keeps a separate queue and viewport. Use more than one only when you want those queues kept apart.
- **Rename the viewport if "Notifications" doesn't fit**: the viewport is a labelled landmark, which is what lets <kbd>F6</kbd> jump focus to it from anywhere. Pass your own `aria-label` to `<Toast.Viewport>` to change the name screen readers announce.
- **Exempt your own interactive elements from swiping**: `button`, `a`, `input`, `textarea` and `[role="button"]` never start a swipe-to-dismiss. Add `data-shards-ui-swipe-ignore` to anything else that shouldn't.

## Global manager

Create a global manager with `new Toast.Manager()` and pass it to `<Toast.Provider>`. Any part of the app, including code outside the component tree, can then queue a toast that renders through the same viewport.

The `toastManager` exposes `add`, `close`, `update`, `promise`, and `subscribe`. For a reactive list of the current toasts, read `Toast.getToastManager().toasts` inside a `<Toast.Provider>`.

```svelte title="Creating a manager instance"
<script>
  import { Toast } from '@shardsui/svelte/toast'

  const toastManager = new Toast.Manager()
</script>

<Toast.Provider {toastManager}>
  {#each Toast.getToastManager().toasts as toast (toast.id)}
    <!-- … -->
  {/each}
</Toast.Provider>
```

## Stacking and animations

Read `--toast-index` to set each toast's stacking order; index 0 sits at the front.

```css title="z-index stacking"
.toast {
  z-index: calc(1000 - var(--toast-index));
  transform: scale(calc(1 - 0.1 * var(--toast-index)));
}
```

`--toast-offset-y` gives each toast its vertical offset when toasts are positioned absolutely and translated apart. Pair it with the `data-expanded` attribute to spread the stack open.

```css title="Expanded offset"
.toast[data-expanded] {
  transform: translateY(var(--toast-offset-y));
}
```

While the stack is collapsed, clamp every toast's height to the frontmost toast with `--toast-frontmost-height`, and let `<Toast.Content>` hide the content of the toasts behind it. Combine `data-behind` with `data-expanded` so it fades back in when the viewport expands:

```css title="Collapsed content"
/* [!code word:data-behind] */
/* [!code word:data-expanded] */
.toast {
  height: var(--toast-frontmost-height, var(--toast-height));
}

.toast-content {
  overflow: hidden;
  transition: opacity 0.25s;
}

.toast-content[data-behind] {
  opacity: 0;
}

.toast-content[data-expanded] {
  opacity: 1;
}
```

`--toast-swipe-movement-x` and `--toast-swipe-movement-y` track how far the current swipe has moved; translate the toast by them so it follows the pointer.

```css title="Swipe offset"
/* [!code word:--toast-swipe-movement-x] */
/* [!code word:--toast-swipe-movement-y] */
.toast {
  transform: scale(calc(1 - 0.1 * var(--toast-index))) translateX(var(--toast-swipe-movement-x))
    translateY(calc(var(--toast-swipe-movement-y) + (var(--toast-index) * -20%)));
}
```

On dismissal, use `data-swipe-direction` to fling the toast off-screen in the direction it was swiped.

```css title="Swipe direction"
/* [!code word:data-swipe-direction] */
&[data-ending-style] {
  opacity: 0;

  &[data-swipe-direction='up'] {
    transform: translateY(calc(var(--toast-swipe-movement-y) - 150%));
  }
  &[data-swipe-direction='down'] {
    transform: translateY(calc(var(--toast-swipe-movement-y) + 150%));
  }
  /* --offset-y derives locally from --toast-offset-y, --toast-index, and swipe movement */
  &[data-swipe-direction='left'] {
    transform: translateX(calc(var(--toast-swipe-movement-x) - 150%)) translateY(var(--offset-y));
  }
  &[data-swipe-direction='right'] {
    transform: translateX(calc(var(--toast-swipe-movement-x) + 150%)) translateY(var(--offset-y));
  }
}
```

A toast that exceeds the `limit` option gets `data-limited` and stays mounted with the HTML `inert` attribute, so you can hide it outright or animate it differently from the visible stack.

`updateKey` increments every time a toast is updated or upserted; key an animation off it to replay an effect. When a remount is acceptable, wrap the toast markup in a `{#key}` block keyed on it instead.

## Examples

### Anchored toasts

Anchor a toast to a specific element with `<Toast.Positioner>` and the `positionerProps` option passed when you add it. Useful for contextual feedback, like a transient "Copied" toast next to the button the user just clicked.

Render anchored toasts in their own `<Toast.Provider>`, separate from stacked ones. Give each provider its own global manager, and the two can be driven independently from anywhere in the app:

```svelte title="Mixing stacked and anchored toasts"
<script>
  import { Toast } from '@shardsui/svelte/toast'

  const anchoredToastManager = new Toast.Manager()
  const stackedToastManager = new Toast.Manager()
</script>

<Toast.Provider toastManager={anchoredToastManager}>
  <AnchoredToasts />
</Toast.Provider>
<Toast.Provider toastManager={stackedToastManager}>
  <StackedToasts />
</Toast.Provider>
```

```svelte title="AnchoredToasts.svelte"
<script>
  import { Toast } from '@shardsui/svelte/toast'
</script>

<Toast.Viewport>
  {#each Toast.getToastManager().toasts as toast (toast.id)}
    <Toast.Positioner {toast}>
      <Toast.Root {toast}><!-- … --></Toast.Root>
    </Toast.Positioner>
  {/each}
</Toast.Viewport>
```

Pass `positionerProps` when adding the toast. Its type is `ToastManagerPositionerProps` — the anchor-positioning props `Toast.Positioner` accepts:

```svelte title="Adding an anchored toast"
<script>
  let buttonEl = $state(null)

  function onclick() {
    anchoredToastManager.add({
      description: 'Copied',
      timeout: 1500,
      positionerProps: {
        anchor: buttonEl,
        sideOffset: 10
      }
    })
  }
</script>

<button bind:this={buttonEl} {onclick}>Copy</button>
```

:demo{name="toast/anchored"}

### Custom position

Your CSS decides where toasts sit: adjust the Viewport and Root styles to move them. A reusable toast component could accept a `data-position` attribute and let CSS handle each placement variant. The demo places the stack at bottom-center:

:demo{name="toast/position"}

### Undo action

Pass the `actionProps` option when adding a toast to configure an action button inside it.

:demo{name="toast/undo"}

### Promise

An async toast moves through `loading`, `success`, and `error` states; its `type` string reflects the current one, so you can style each state differently. Each state accepts a plain string or the same options object as the `update` method to configure that state's toast in full.

:demo{name="toast/promise"}

### Custom

Attach arbitrary typed data, values or functions alike, to a toast through the `data` option.

:demo{name="toast/custom"}

### Deduplicated toast

Upserting a toast by the same `id` bumps its `updateKey`, letting a custom renderer replay an animation. Below, alternating CSS animation names off `updateKey` keeps the toast mounted while re-triggering the pulse.

:demo{name="toast/deduplicate"}

### Varying heights

Avoid sizing `<Toast.Content>` to the root's height (such as `height: 100%`). Resizing it alongside the root cancels the root's height transition.

:demo{name="toast/varying-heights"}

## API reference

### Provider

Provides a context for creating and managing toasts.
Doesn't render its own HTML element.

::table{columns="Prop,Type,Default"}

| Prop           | Type           | Default | Description                                                |
| :------------- | :------------- | :------ | :--------------------------------------------------------- |
| `timeout`      | `number`       | `5000`  | Default timeout for toasts in milliseconds.                |
| `limit`        | `number`       | `3`     | Maximum number of toasts visible at once.                  |
| `toastManager` | `ToastManager` | —       | External toast manager created with `new Toast.Manager()`. |
| `children`     | `Snippet`      | —       | Content rendered inside the provider.                      |

::

### Portal

A portal that moves the viewport out to `<body>`, clear of ancestor clipping and stacking.
Renders a `<div>` element.

::table{columns="Prop,Type,Default"}

| Prop        | Type                  | Default | Description                                                                                                   |
| :---------- | :-------------------- | :------ | :------------------------------------------------------------------------------------------------------------ |
| `container` | `HTMLElement \| null` | —       | Parent element to render the portal into. Defaults to the nearest ancestor portal, otherwise `document.body`. |
| `children`  | `Snippet`             | —       | Content rendered inside the portal.                                                                           |

::

### Viewport

A container viewport for toasts.
Renders a `<div>` element.

::table{columns="Prop,Type,Default"}

| Prop       | Type                          | Default | Description                           |
| :--------- | :---------------------------- | :------ | :------------------------------------ |
| `as`       | `keyof HTMLElementTagNameMap` | `'div'` | HTML element to render.               |
| `class`    | `string`                      | —       | CSS class applied to the element.     |
| `style`    | `string`                      | —       | Inline style applied to the element.  |
| `children` | `Snippet<[{ expanded }]>`     | —       | Content; receives the viewport state. |

::

| Attribute       | Description                                             |
| :-------------- | :------------------------------------------------------ |
| `data-expanded` | Present when toasts are expanded (hovering or focused). |

| CSS Variable               | Description                        |
| :------------------------- | :--------------------------------- |
| `--toast-frontmost-height` | The height of the frontmost toast. |

### Root

Groups all parts of an individual toast.
Renders a `<div>` element.

::table{columns="Prop,Type,Default"}

| Prop             | Type                                                                                | Default             | Description                                               |
| :--------------- | :---------------------------------------------------------------------------------- | :------------------ | :-------------------------------------------------------- |
| `as`             | `keyof HTMLElementTagNameMap`                                                       | `'div'`             | HTML element to render.                                   |
| `class`          | `string`                                                                            | —                   | CSS class applied to the element.                         |
| `style`          | `string`                                                                            | —                   | Inline style applied to the element.                      |
| `toast`          | `ToastObject`                                                                       | —                   | Required. The toast object to render.                     |
| `swipeDirection` | `'up' \| 'down' \| 'left' \| 'right' \| ('up' \| 'down' \| 'left' \| 'right')[]`    | `['down', 'right']` | Direction(s) in which the toast can be swiped to dismiss. |
| `children`       | `Snippet<[{ transitionStatus, expanded, limited, type, swiping, swipeDirection }]>` | —                   | Content; receives the toast state.                        |

::

| Attribute              | Description                                                         |
| :--------------------- | :------------------------------------------------------------------ |
| `data-expanded`        | Present when the toast viewport is expanded.                        |
| `data-limited`         | Present when removed due to exceeding the limit.                    |
| `data-type`            | The type of the toast (`string`).                                   |
| `data-swiping`         | Present when the toast is being swiped.                             |
| `data-swipe-direction` | The direction of the swipe (`'up' \| 'down' \| 'left' \| 'right'`). |
| `data-starting-style`  | Present when the toast is animating in.                             |
| `data-ending-style`    | Present when the toast is animating out.                            |

| CSS Variable               | Description                             |
| :------------------------- | :-------------------------------------- |
| `--toast-index`            | The index of the toast in the list.     |
| `--toast-offset-y`         | The vertical offset when expanded (px). |
| `--toast-height`           | The measured natural height (px).       |
| `--toast-swipe-movement-x` | Horizontal swipe movement (px).         |
| `--toast-swipe-movement-y` | Vertical swipe movement (px).           |

### Content

A container for the contents of a toast.
Renders a `<div>` element.

::table{columns="Prop,Type,Default"}

| Prop       | Type                              | Default | Description                          |
| :--------- | :-------------------------------- | :------ | :----------------------------------- |
| `as`       | `keyof HTMLElementTagNameMap`     | `'div'` | HTML element to render.              |
| `class`    | `string`                          | —       | CSS class applied to the element.    |
| `style`    | `string`                          | —       | Inline style applied to the element. |
| `children` | `Snippet<[{ expanded, behind }]>` | —       | Content; receives the content state. |

::

| Attribute       | Description                                  |
| :-------------- | :------------------------------------------- |
| `data-expanded` | Present when the toast viewport is expanded. |
| `data-behind`   | Present when behind the frontmost toast.     |

### Title

A title that labels the toast.
Renders an `<h2>` element.

::table{columns="Prop,Type,Default"}

| Prop       | Type                          | Default | Description                          |
| :--------- | :---------------------------- | :------ | :----------------------------------- |
| `as`       | `keyof HTMLElementTagNameMap` | `'h2'`  | HTML element to render.              |
| `class`    | `string`                      | —       | CSS class applied to the element.    |
| `style`    | `string`                      | —       | Inline style applied to the element. |
| `id`       | `string`                      | auto    | Custom element ID.                   |
| `children` | `Snippet<[{ type }]>`         | —       | Content; receives the toast `type`.  |

::

| Attribute   | Description                       |
| :---------- | :-------------------------------- |
| `data-type` | The type of the toast (`string`). |

### Description

Secondary text for the toast.
Can be used as the default message for the toast when no title is provided.
Renders a `<p>` element.

::table{columns="Prop,Type,Default"}

| Prop       | Type                          | Default | Description                          |
| :--------- | :---------------------------- | :------ | :----------------------------------- |
| `as`       | `keyof HTMLElementTagNameMap` | `'p'`   | HTML element to render.              |
| `class`    | `string`                      | —       | CSS class applied to the element.    |
| `style`    | `string`                      | —       | Inline style applied to the element. |
| `id`       | `string`                      | auto    | Custom element ID.                   |
| `children` | `Snippet<[{ type }]>`         | —       | Content; receives the toast `type`.  |

::

| Attribute   | Description                       |
| :---------- | :-------------------------------- |
| `data-type` | The type of the toast (`string`). |

### Action

Performs an action when clicked.
Renders a `<button>` element.

::table{columns="Prop,Type,Default"}

| Prop       | Type                          | Default    | Description                                |
| :--------- | :---------------------------- | :--------- | :----------------------------------------- |
| `as`       | `keyof HTMLElementTagNameMap` | `'button'` | HTML element to render.                    |
| `class`    | `string`                      | —          | CSS class applied to the element.          |
| `style`    | `string`                      | —          | Inline style applied to the element.       |
| `disabled` | `boolean`                     | `false`    | Whether the button is disabled.            |
| `children` | `Snippet<[{ type }]>`         | —          | Button content; receives the toast `type`. |

::

| Attribute   | Description                       |
| :---------- | :-------------------------------- |
| `data-type` | The type of the toast (`string`). |

### Close

Closes the toast when clicked.
Renders a `<button>` element.

::table{columns="Prop,Type,Default"}

| Prop       | Type                          | Default    | Description                                |
| :--------- | :---------------------------- | :--------- | :----------------------------------------- |
| `as`       | `keyof HTMLElementTagNameMap` | `'button'` | HTML element to render.                    |
| `class`    | `string`                      | —          | CSS class applied to the element.          |
| `style`    | `string`                      | —          | Inline style applied to the element.       |
| `disabled` | `boolean`                     | `false`    | Whether the button is disabled.            |
| `children` | `Snippet<[{ type }]>`         | —          | Button content; receives the toast `type`. |

::

| Attribute   | Description                       |
| :---------- | :-------------------------------- |
| `data-type` | The type of the toast (`string`). |

### Positioner

Positions the toast against the anchor.
Renders a `<div>` element.

::table{columns="Prop,Type,Default"}

| Prop                    | Type                                                                       | Default                       | Description                                                                    |
| :---------------------- | :------------------------------------------------------------------------- | :---------------------------- | :----------------------------------------------------------------------------- |
| `as`                    | `keyof HTMLElementTagNameMap`                                              | `'div'`                       | HTML element to render.                                                        |
| `class`                 | `string`                                                                   | —                             | CSS class applied to the element.                                              |
| `style`                 | `string`                                                                   | —                             | Inline style applied to the element.                                           |
| `toast`                 | `ToastObject`                                                              | —                             | Required. The toast object (reads `positionerProps` from it).                  |
| `side`                  | `'top' \| 'bottom' \| 'left' \| 'right' \| 'inline-start' \| 'inline-end'` | `'top'`                       | Side to position the popup on.                                                 |
| `align`                 | `'start' \| 'center' \| 'end'`                                             | `'center'`                    | Alignment of the popup along the side.                                         |
| `sideOffset`            | `number \| OffsetFunction`                                                 | `0`                           | Distance in px from the anchor.                                                |
| `alignOffset`           | `number \| OffsetFunction`                                                 | `0`                           | Offset in px along the alignment axis.                                         |
| `collisionBoundary`     | `'clipping-ancestors' \| Element \| Element[] \| Rect`                     | `'clipping-ancestors'`        | Boundary for collision detection.                                              |
| `collisionPadding`      | `number \| Padding`                                                        | `5`                           | Padding around the collision boundary.                                         |
| `collisionAvoidance`    | `CollisionAvoidance`                                                       | `{ fallbackAxisSide: 'end' }` | Strategy to avoid collisions.                                                  |
| `sticky`                | `boolean`                                                                  | `false`                       | Whether to keep the popup in view when the anchor is scrolled.                 |
| `arrowPadding`          | `number`                                                                   | `5`                           | Padding between the arrow and the popup edges.                                 |
| `disableAnchorTracking` | `boolean`                                                                  | `false`                       | Whether to disable tracking of the anchor's position as it moves.              |
| `anchor`                | `Element \| null`                                                          | —                             | Element to anchor the positioner to. Overrides `toast.positionerProps.anchor`. |
| `positionMethod`        | `'absolute' \| 'fixed'`                                                    | `'absolute'`                  | CSS position strategy to use.                                                  |
| `children`              | `Snippet<[{ side, align, anchorHidden }]>`                                 | —                             | Content; receives the positioner state.                                        |

::

Props can also be passed via `toast.positionerProps` when calling `toastManager.add()`.

| Attribute            | Description                                    |
| :------------------- | :--------------------------------------------- |
| `data-side`          | Which side of the anchor the popup is on.      |
| `data-align`         | How the popup is aligned relative to the side. |
| `data-anchor-hidden` | Present when the anchor is hidden.             |

| CSS Variable         | Description                                                |
| :------------------- | :--------------------------------------------------------- |
| `--available-width`  | Available width between the anchor and the viewport edge.  |
| `--available-height` | Available height between the anchor and the viewport edge. |
| `--anchor-width`     | Width of the anchor element.                               |
| `--anchor-height`    | Height of the anchor element.                              |
| `--transform-origin` | Transform origin for scale animations.                     |
| `--toast-index`      | Index of this toast in the stack.                          |

### Arrow

Displays an element positioned against the anchor.
Renders a `<div>` element.

::table{columns="Prop,Type,Default"}

| Prop       | Type                                     | Default | Description                          |
| :--------- | :--------------------------------------- | :------ | :----------------------------------- |
| `as`       | `keyof HTMLElementTagNameMap`            | `'div'` | HTML element to render.              |
| `class`    | `string`                                 | —       | CSS class applied to the element.    |
| `style`    | `string`                                 | —       | Inline style applied to the element. |
| `children` | `Snippet<[{ side, align, uncentered }]>` | —       | Content; receives the arrow state.   |

::

| Attribute         | Description                                    |
| :---------------- | :--------------------------------------------- |
| `data-side`       | Which side of the anchor the popup is on.      |
| `data-align`      | How the popup is aligned relative to the side. |
| `data-uncentered` | Present when the arrow cannot be centered.     |

## Toast.getToastManager

Manages toasts; call it inside a `<Toast.Provider>`.

```svelte title="Usage"
<script>
  import { Toast } from '@shardsui/svelte/toast'

  const toastManager = Toast.getToastManager()
</script>
```

Returns `{ toasts, add, close, update, promise }`.

### `add` method

Adds a toast to the list and returns its `toastId`, which you can later hand to `update` or `close`. Reuse an existing `id` and the matching toast is updated in place rather than duplicated.

```ts title="Usage"
const toastId = toastManager.add({
  title: 'Hello',
  description: 'Hello, world!'
})
```

For high-priority toasts (`priority: 'high'`), screen readers announce the `title` and `description` strings through a hidden `role="alert"` live region. Other markup inside `<Toast.Root>`, including the `<Toast.Title>` and `<Toast.Description>` components, stays silent unless the user navigates into the toast viewport.

### `update` method

Updates the toast with new options.

```ts title="Usage"
toastManager.update(toastId, {
  description: 'New description'
})
```

### `close` method

Closes the toast, removing it from the toast list after any animations complete.

```ts title="Usage"
toastManager.close(toastId) // Close one
toastManager.close() // Close all
```

### `promise` method

Creates an asynchronous toast with three possible states: `loading`, `success`, and `error`.

```ts title="Description configuration"
toastManager.promise(fetch('/api/data'), {
  loading: 'Loading…',
  success: (data) => `Loaded ${data.length} items`,
  error: (err) => `Error: ${err.message}`
})
```
