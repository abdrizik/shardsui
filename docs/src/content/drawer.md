# Drawer

A panel from a screen edge.

:demo{name="drawer/hero"}

## Anatomy

```svelte title="Anatomy"
<script>
  import { Drawer } from '@shardsui/svelte/drawer'
</script>

<Drawer.Provider>
  <Drawer.IndentBackground />
  <Drawer.Indent>
    <Drawer.Root>
      <Drawer.Trigger />
      <Drawer.SwipeArea />
      <Drawer.Portal>
        <Drawer.Backdrop />
        <Drawer.Viewport>
          <Drawer.Popup>
            <Drawer.Content>
              <Drawer.Title />
              <Drawer.Description />
              <Drawer.Close />
            </Drawer.Content>
          </Drawer.Popup>
        </Drawer.Viewport>
      </Drawer.Portal>
    </Drawer.Root>
  </Drawer.Indent>
</Drawer.Provider>
```

Swipe gestures dismiss the drawer; `swipeDirection` sets which direction. `<Drawer.Viewport>` owns those gestures and the touch scroll locking, so `<Drawer.Popup>` must render inside it. `<Drawer.Content>` lets mouse users select text in its children without swipe interference; add `data-shards-ui-swipe-ignore` to a descendant to opt it out of swipe dismissal for all input types.

In Chromium on Android, the system back gesture closes the topmost open drawer.

## Usage guidelines

- **Drawer extends [Dialog](/svelte/dialog)**: it adds gesture support, snap points, and indent effects. If you don't need these, a slide-in panel is just a positioned Dialog — use Dialog instead.

## Examples

### State

By default, Drawer manages its own state.

```svelte title="Uncontrolled drawer"
<Drawer.Root>
  <Drawer.Trigger>Open</Drawer.Trigger>
  <Drawer.Portal>
    <Drawer.Viewport>
      <Drawer.Popup>
        <Drawer.Content>
          <Drawer.Title>Example drawer</Drawer.Title>
          <Drawer.Close>Close</Drawer.Close>
        </Drawer.Content>
      </Drawer.Popup>
    </Drawer.Viewport>
  </Drawer.Portal>
</Drawer.Root>
```

Drive open with `open` / `onOpenChange`, or `bind:open`.

```svelte title="Controlled drawer"
<script>
  let open = $state(false)
</script>

<Drawer.Root {open} onOpenChange={(next) => (open = next)}>
  <Drawer.Trigger>Open</Drawer.Trigger>
  <Drawer.Portal>
    <Drawer.Viewport>
      <Drawer.Popup>
        <Drawer.Content>
          <Drawer.Title>Example drawer</Drawer.Title>
          <Drawer.Close>Close</Drawer.Close>
        </Drawer.Content>
      </Drawer.Popup>
    </Drawer.Viewport>
  </Drawer.Portal>
</Drawer.Root>
```

### Position

Positioning is handled by your styles. `swipeDirection` defaults to `"down"` for bottom sheets. Use `"up"`, `"left"`, or `"right"` for other drawer positions.

```svelte title="Swipe directions"
<Drawer.Root swipeDirection="left">...</Drawer.Root>
```

:demo{name="drawer/position"}

### Nested drawers

Use the `[data-nested-drawer-open]` selector and the `--nested-drawers` CSS variable to style drawers when a nested drawer is open. This demo stacks nested drawers with a constant peek: the frontmost drawer stays anchored to the bottom while the ones behind are scaled down and lifted, using the `--drawer-height` and `--drawer-frontmost-height` CSS variables to handle varying heights.

:demo{name="drawer/nested"}

### Snap points

Use `snapPoints` to snap a bottom sheet to preset heights. Numbers up to `1` are fractions of the viewport height, numbers above `1` are pixel values, and strings support `px` and `rem` units (`'148px'`, `'30rem'`). Snap points only apply when `swipeDirection` is `"up"` or `"down"`.

```svelte title="Snap points"
<script>
  const snapPoints = ['148px', 1]
  let snapPoint = $state(snapPoints[0])
</script>

<Drawer.Root {snapPoints} bind:snapPoint>...</Drawer.Root>
```

Apply the snap point offset in your styles when using vertical drawers:

```css title="Snap point offset"
.drawer-popup {
  transform: translateY(calc(var(--drawer-snap-point-offset) + var(--drawer-swipe-movement-y)));
}
```

:demo{name="drawer/snap-points"}

Fast swipes can skip snap points. Set `snapToSequentialPoints` to disable velocity-based skipping so drag distance determines the snap target (you can still drag past multiple points).

### Indent effect

To scale the background down whenever a drawer opens, wrap your app in `<Drawer.Provider>` and place `<Drawer.IndentBackground>` + `<Drawer.Indent>` at the top of your tree. Both parts carry `data-active` while any `<Drawer.Root>` inside the provider is open.

:demo{name="drawer/indent-provider"}

### Non-modal

Set `modal={false}` to opt out of focus trapping and `disablePointerDismissal` to keep the drawer open on outside clicks.

:demo{name="drawer/non-modal"}

### Mobile navigation

Build a full-screen mobile navigation sheet from Drawer parts, with flick-to-dismiss.

:demo{name="drawer/mobile-nav"}

### Swipe to open

Place `<Drawer.SwipeArea>` along the edge of the viewport to enable swipe-to-open gestures. It is hidden from assistive technology, so keep a `<Drawer.Trigger>` as the accessible way to open the drawer.

:demo{name="drawer/swipe-area"}

### Close confirmation

A nested confirmation dialog guards against losing work: it opens when the text typed into the drawer is about to be discarded.

Veto the close with a [function binding](https://svelte.dev/docs/svelte/bind#Function-bindings) — `bind:open={() => open, (next) => …}`. When a close is requested the setter runs; if you don't commit the new value, the getter keeps returning the old one and the drawer stays open. Open the confirmation there instead, so the prompt appears whether the user clicks the backdrop, presses Esc, hits a close button, or swipes to dismiss.

```svelte
<Drawer.Root
  bind:open={
    () => open,
    (next) => {
      if (!next && hasUnsavedChanges) return // veto: don't commit, drawer stays open
      open = next
    }
  }
>
```

:demo{name="drawer/close-confirmation"}

### Action sheet with separate destructive action

An action sheet pairing a grouped list of actions with a separate, destructive action button.

:demo{name="drawer/uncontained"}

### Detached triggers

For a simple one-off, keep `<Drawer.Trigger>` inside `<Drawer.Root>`. When the content can't sit beside its trigger, detach it: create a handle with `new Drawer.Handle()` and pass it to both `<Drawer.Trigger handle={...}>` and `<Drawer.Root handle={...}>`. They stay linked no matter where each lives in the tree.

```svelte title="Detached triggers"
<!-- [!code word:handle={demoDrawer}] -->
<script>
  const demoDrawer = new Drawer.Handle()
</script>

<!-- [!code highlight] -->
<Drawer.Trigger handle={demoDrawer}>Open</Drawer.Trigger>

<!-- [!code highlight] -->
<Drawer.Root handle={demoDrawer}>
  <Drawer.Portal>
    <Drawer.Viewport>
      <Drawer.Popup>
        <Drawer.Content>
          <Drawer.Title>Drawer</Drawer.Title>
          <Drawer.Close>Close</Drawer.Close>
        </Drawer.Content>
      </Drawer.Popup>
    </Drawer.Viewport>
  </Drawer.Portal>
</Drawer.Root>
```

To show different content depending on which trigger opened the drawer, pass a `payload` to each `<Drawer.Trigger>` and read it through the `children` snippet on `<Drawer.Root>`. Give `new Drawer.Handle()` a type argument to type the payload:

```svelte title="Detached triggers with payload"
<script>
  // [!code highlight]
  const demoDrawer = new Drawer.Handle<{ title: string }>()
</script>

<!-- [!code word:payload] -->
<!-- [!code highlight] -->
<Drawer.Trigger handle={demoDrawer} payload={{ title: 'Profile' }}>Profile</Drawer.Trigger>

<!-- [!code word:payload] -->
<!-- [!code highlight] -->
<Drawer.Trigger handle={demoDrawer} payload={{ title: 'Settings' }}>Settings</Drawer.Trigger>

<Drawer.Root handle={demoDrawer}>
  <!-- [!code word:payload] -->
  {#snippet children({ payload })}
    <Drawer.Portal>
      <Drawer.Viewport>
        <Drawer.Popup>
          <Drawer.Content>
            <!-- [!code word:payload] -->
            {#if payload !== undefined}
              <Drawer.Title>{payload.title}</Drawer.Title>
            {/if}
            <Drawer.Close>Close</Drawer.Close>
          </Drawer.Content>
        </Drawer.Popup>
      </Drawer.Viewport>
    </Drawer.Portal>
  {/snippet}
</Drawer.Root>
```

### Stacking and animations

Use CSS transitions or animations to animate drawer opening, closing, swipe interactions, and nested stacking. `data-starting-style` is applied when a drawer starts to open, `data-ending-style` when it starts to close.

The `--nested-drawers` CSS variable gives the stack depth; the frontmost drawer has index `0`.

```css title="Stack depth"
.drawer-popup {
  --stack-step: 0.05;
  --stack-scale: calc(1 - (var(--nested-drawers) * var(--stack-step)));
  transform: translateY(var(--drawer-swipe-movement-y)) scale(var(--stack-scale));
}
```

When stacked drawers have varying heights, use `--drawer-height` and `--drawer-frontmost-height` to keep collapsed drawers aligned with the frontmost one.

```css title="Variable-height stacking"
.drawer-popup {
  --bleed: 3rem;
  --stack-height: max(
    0px,
    calc(var(--drawer-frontmost-height, var(--drawer-height)) - var(--bleed))
  );
  height: var(--drawer-height, auto);
}

.drawer-popup[data-nested-drawer-open] {
  height: calc(var(--stack-height) + var(--bleed));
  overflow: hidden;
}
```

The `data-nested-drawer-open` attribute marks drawers behind the frontmost drawer. Use it with `data-nested-drawer-swiping` to fade parent drawer content to zero opacity, so it stays mounted and laid out during nested swipe interactions.

```css title="Nested content visibility"
/* [!code word:data-nested-drawer-open] */
.drawer-content {
  transition: opacity 300ms;
}

.drawer-popup[data-nested-drawer-open] .drawer-content {
  opacity: 0;
}

/* [!code word:data-nested-drawer-swiping] */
.drawer-popup[data-nested-drawer-open][data-nested-drawer-swiping] .drawer-content {
  opacity: 1;
}
```

Use the `--drawer-swipe-movement-x`, `--drawer-swipe-movement-y`, and `--drawer-snap-point-offset` CSS variables for drag and snap offsets:

```css title="Swipe and snap offset"
.drawer-popup[data-swipe-direction='right'] {
  /* [!code word:--drawer-swipe-movement-x] */
  transform: translateX(var(--drawer-swipe-movement-x));
}

.drawer-popup[data-swipe-direction='down'] {
  /* [!code word:--drawer-swipe-movement-y] */
  transform: translateY(calc(var(--drawer-snap-point-offset) + var(--drawer-swipe-movement-y)));
}
```

Combine `data-swipe-direction` with `data-ending-style` to animate directional dismissal:

```css title="Swipe dismissal direction"
.drawer-popup[data-ending-style][data-swipe-direction='right'] {
  transform: translateX(100%);
}

.drawer-popup[data-ending-style][data-swipe-direction='down'] {
  transform: translateY(100%);
}
```

Use `--drawer-swipe-progress` to fade the backdrop as the drawer is swiped, and `--drawer-swipe-strength` to scale release transition durations based on swipe velocity.

```css title="Backdrop and release timing"
.drawer-backdrop {
  --backdrop-opacity: 0.2;
  opacity: calc(var(--backdrop-opacity) * (1 - var(--drawer-swipe-progress)));
}

.drawer-popup[data-ending-style],
.drawer-backdrop[data-ending-style] {
  transition-duration: calc(var(--drawer-swipe-strength) * 400ms);
}

.drawer-popup[data-swiping],
.drawer-backdrop[data-swiping] {
  transition-duration: 0ms;
}
```

## API reference

### Provider

Tracks the open state of every drawer inside it, driving `<Drawer.Indent>` and `<Drawer.IndentBackground>`.
Doesn't render its own HTML element.

::table{columns="Prop,Type,Default"}

| Prop       | Type      | Default | Description |
| :--------- | :-------- | :------ | :---------- |
| `children` | `Snippet` | —       | Content.    |

::

### IndentBackground

A background layer placed before `<Drawer.Indent>`, shown behind the app while a drawer indents it.
Renders a `<div>` element.

::table{columns="Prop,Type,Default"}

| Prop       | Type                          | Default | Description                                                   |
| :--------- | :---------------------------- | :------ | :------------------------------------------------------------ |
| `as`       | `keyof HTMLElementTagNameMap` | `'div'` | HTML element to render.                                       |
| `class`    | `string`                      | —       | CSS class applied to the element.                             |
| `style`    | `string`                      | —       | Inline style applied to the element.                          |
| `children` | `Snippet<[{ active }]>`       | —       | Content; receives whether any drawer in the provider is open. |

::

| Attribute       | Description                                                             |
| :-------------- | :---------------------------------------------------------------------- |
| `data-active`   | Present when any drawer within the nearest `<Drawer.Provider>` is open. |
| `data-inactive` | Present when no drawer is open.                                         |

### Indent

A wrapper element intended to contain your app's main UI.
Renders a `<div>` element.

::table{columns="Prop,Type,Default"}

| Prop       | Type                          | Default | Description                                                   |
| :--------- | :---------------------------- | :------ | :------------------------------------------------------------ |
| `as`       | `keyof HTMLElementTagNameMap` | `'div'` | HTML element to render.                                       |
| `class`    | `string`                      | —       | CSS class applied to the element.                             |
| `style`    | `string`                      | —       | Inline style applied to the element.                          |
| `children` | `Snippet<[{ active }]>`       | —       | Content; receives whether any drawer in the provider is open. |

::

| Attribute       | Description                                      |
| :-------------- | :----------------------------------------------- |
| `data-active`   | Present when any drawer in the provider is open. |
| `data-inactive` | Present when no drawer is open.                  |

| CSS Variable              | Description                               |
| :------------------------ | :---------------------------------------- |
| `--drawer-swipe-progress` | 0–1, swipe progress of the active drawer. |
| `--drawer-height`         | Height of the frontmost open drawer.      |

### Root

Groups all parts of the drawer.
Doesn't render its own HTML element.

::table{columns="Prop,Type,Default"}

| Prop                      | Type                                            | Default         | Description                                                                                                                                                                                                                                                                                                                                                                                                                                         |
| :------------------------ | :---------------------------------------------- | :-------------- | :-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `open`                    | `boolean`                                       | `false`         | Whether the drawer is currently open.                                                                                                                                                                                                                                                                                                                                                                                                               |
| `modal`                   | `boolean \| 'trap-focus'`                       | `true`          | Determines if the drawer enters a modal state when open. `true`: user interaction is limited to just the drawer: focus is trapped, document page scroll is locked, and pointer interactions on outside elements are disabled. `false`: user interaction with the rest of the document is allowed. `'trap-focus'`: focus is trapped inside the drawer, but document page scroll is not locked and pointer interactions outside of it remain enabled. |
| `onOpenChange`            | `(open: boolean) => void`                       | —               | Event handler called when the drawer is opened or closed.                                                                                                                                                                                                                                                                                                                                                                                           |
| `onOpenChangeComplete`    | `(open: boolean) => void`                       | —               | Event handler called after any animations complete when the drawer is opened or closed.                                                                                                                                                                                                                                                                                                                                                             |
| `disablePointerDismissal` | `boolean`                                       | `false`         | Whether to prevent the drawer from closing on outside presses. For non-modal drawers, this also prevents the drawer from closing when focus moves outside of it.                                                                                                                                                                                                                                                                                    |
| `swipeDirection`          | `'up' \| 'down' \| 'left' \| 'right'`           | `'down'`        | The swipe direction used to dismiss the drawer.                                                                                                                                                                                                                                                                                                                                                                                                     |
| `snapPoints`              | `(number \| string)[]`                          | —               | Snap points used to position the drawer. Numbers up to `1` are fractions of the viewport height, numbers above `1` are pixel values, and strings use `px`/`rem` units.                                                                                                                                                                                                                                                                              |
| `snapToSequentialPoints`  | `boolean`                                       | `false`         | Disables velocity-based snap skipping so drag distance determines the next snap point.                                                                                                                                                                                                                                                                                                                                                              |
| `snapPoint`               | `number \| string \| null`                      | `snapPoints[0]` | The currently active snap point. Bindable; closing the drawer resets it to its initial value.                                                                                                                                                                                                                                                                                                                                                       |
| `onSnapPointChange`       | `(snapPoint: number \| string \| null) => void` | —               | Callback fired when the snap point changes.                                                                                                                                                                                                                                                                                                                                                                                                         |
| `handle`                  | `Drawer.Handle`                                 | —               | A handle created with `new Drawer.Handle()` that links detached triggers to this root.                                                                                                                                                                                                                                                                                                                                                              |
| `triggerId`               | `string \| null`                                | `null`          | ID of the trigger the drawer is associated with. Bindable; useful with `open` to create a controlled drawer with multiple triggers.                                                                                                                                                                                                                                                                                                                 |
| `children`                | `Snippet<[{ payload }]>`                        | —               | Content; receives the active trigger's `payload`.                                                                                                                                                                                                                                                                                                                                                                                                   |

::

### Trigger

A button that opens the drawer.
Renders a `<button>` element.

::table{columns="Prop,Type,Default"}

| Prop       | Type                            | Default    | Description                                                                                                         |
| :--------- | :------------------------------ | :--------- | :------------------------------------------------------------------------------------------------------------------ |
| `as`       | `keyof HTMLElementTagNameMap`   | `'button'` | HTML element to render.                                                                                             |
| `class`    | `string`                        | —          | CSS class applied to the element.                                                                                   |
| `style`    | `string`                        | —          | Inline style applied to the element.                                                                                |
| `disabled` | `boolean`                       | `false`    | Whether the trigger is disabled.                                                                                    |
| `id`       | `string`                        | auto       | Custom element ID.                                                                                                  |
| `handle`   | `Drawer.Handle`                 | —          | A handle created with `new Drawer.Handle()` that links this trigger to a detached `<Drawer.Root>`.                  |
| `payload`  | `Payload`                       | —          | Arbitrary data passed to the drawer when this trigger opens it. Read via the `children` snippet on `<Drawer.Root>`. |
| `children` | `Snippet<[{ disabled, open }]>` | —          | Content; receives the trigger state.                                                                                |

::

| Attribute         | Description                                         |
| :---------------- | :-------------------------------------------------- |
| `data-popup-open` | Present while the drawer is open from this trigger. |
| `data-disabled`   | Present when the trigger is disabled.               |

### SwipeArea

An invisible area that listens for swipe gestures to open the drawer.
Renders a `<div>` element.

::table{columns="Prop,Type,Default"}

| Prop             | Type                                                     | Default                                    | Description                                                            |
| :--------------- | :------------------------------------------------------- | :----------------------------------------- | :--------------------------------------------------------------------- |
| `as`             | `keyof HTMLElementTagNameMap`                            | `'div'`                                    | HTML element to render.                                                |
| `class`          | `string`                                                 | —                                          | CSS class applied to the element.                                      |
| `style`          | `string`                                                 | —                                          | Inline style applied to the element.                                   |
| `disabled`       | `boolean`                                                | `false`                                    | Disables the open gesture and stops the area receiving pointer events. |
| `swipeDirection` | `'up' \| 'down' \| 'left' \| 'right'`                    | opposite of `Drawer.Root` `swipeDirection` | The swipe direction that opens the drawer.                             |
| `id`             | `string`                                                 | auto                                       | Custom element ID.                                                     |
| `children`       | `Snippet<[{ open, swiping, swipeDirection, disabled }]>` | —                                          | Content; receives the swipe area state.                                |

::

| Attribute              | Description                                                         |
| :--------------------- | :------------------------------------------------------------------ |
| `data-open`            | Present when the drawer is open.                                    |
| `data-closed`          | Present when the drawer is closed.                                  |
| `data-swiping`         | Present when the drawer is being swiped.                            |
| `data-swipe-direction` | The direction of the swipe (`'up' \| 'down' \| 'left' \| 'right'`). |
| `data-disabled`        | Present when the swipe area is disabled.                            |

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

| Attribute                 | Description                                                        |
| :------------------------ | :----------------------------------------------------------------- |
| `data-open`               | Present when the drawer is open.                                   |
| `data-closed`             | Present when the drawer is closed.                                 |
| `data-nested`             | Present when the drawer is nested within another dialog or drawer. |
| `data-nested-dialog-open` | Present when the drawer has other open dialogs nested within it.   |
| `data-starting-style`     | Present when the backdrop is animating in.                         |
| `data-ending-style`       | Present when the backdrop is animating out.                        |
| `data-swiping`            | Present while the drawer is being swiped.                          |
| `data-swipe-dismiss`      | Present when the drawer is dismissed by swiping.                   |

| CSS Variable              | Description                                                                      |
| :------------------------ | :------------------------------------------------------------------------------- |
| `--drawer-swipe-progress` | 0–1, fades the backdrop with swipe progress.                                     |
| `--drawer-height`         | The height of the frontmost open drawer, while swiping.                          |
| `--drawer-swipe-strength` | Always `1` on the backdrop, so rules shared with the popup resolve here as well. |

### Viewport

A positioning container for the drawer popup that can be made scrollable.
Owns the swipe gestures and the touch scroll locking, so `<Drawer.Popup>` must render inside it.
Renders a `<div>` element.

::table{columns="Prop,Type,Default"}

| Prop       | Type                                                              | Default | Description                           |
| :--------- | :---------------------------------------------------------------- | :------ | :------------------------------------ |
| `as`       | `keyof HTMLElementTagNameMap`                                     | `'div'` | HTML element to render.               |
| `class`    | `string`                                                          | —       | CSS class applied to the element.     |
| `style`    | `string`                                                          | —       | Inline style applied to the element.  |
| `children` | `Snippet<[{ open, transitionStatus, nested, nestedDialogOpen }]>` | —       | Content; receives the viewport state. |

::

| Attribute             | Description                                              |
| :-------------------- | :------------------------------------------------------- |
| `data-open`           | Present when the drawer is open.                         |
| `data-closed`         | Present when the drawer is closed.                       |
| `data-starting-style` | Present when the drawer is animating in.                 |
| `data-ending-style`   | Present when the drawer is animating out.                |
| `data-nested`         | Present when the drawer is nested within another drawer. |

### Popup

A container for the drawer contents.
Renders a `<div>` element.

::table{columns="Prop,Type,Default"}

| Prop           | Type                                                                                                                      | Default | Description                                                                                                                                                                                                                         |
| :------------- | :------------------------------------------------------------------------------------------------------------------------ | :------ | :---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `as`           | `keyof HTMLElementTagNameMap`                                                                                             | `'div'` | HTML element to render.                                                                                                                                                                                                             |
| `class`        | `string`                                                                                                                  | —       | CSS class applied to the element.                                                                                                                                                                                                   |
| `style`        | `string`                                                                                                                  | —       | Inline style applied to the element.                                                                                                                                                                                                |
| `id`           | `string`                                                                                                                  | auto    | Custom element ID. Referenced by the trigger's `aria-controls`.                                                                                                                                                                     |
| `initialFocus` | `HTMLElement \| boolean \| ((type: string) => HTMLElement \| boolean \| null \| void)`                                    | —       | Element to focus when the drawer opens, or a function receiving the interaction type (`'mouse'`, `'keyboard'`, `'touch'`, `'pen'`). `false` to skip; `true` focuses the first tabbable child. Defaults to the popup element itself. |
| `finalFocus`   | `HTMLElement \| boolean \| ((type: string) => HTMLElement \| boolean \| null \| void)`                                    | —       | Element to focus when the drawer closes, or a function receiving the interaction type. `false` to skip; `true` (default) to return focus to the trigger.                                                                            |
| `children`     | `Snippet<[{ open, transitionStatus, expanded, nested, nestedDrawerOpen, nestedDrawerSwiping, swipeDirection, swiping }]>` | —       | Content; receives the popup state.                                                                                                                                                                                                  |

::

| Attribute                    | Description                                                         |
| :--------------------------- | :------------------------------------------------------------------ |
| `data-open`                  | Present when the drawer is open.                                    |
| `data-closed`                | Present when the drawer is closed.                                  |
| `data-starting-style`        | Present when the drawer is animating in.                            |
| `data-ending-style`          | Present when the drawer is animating out.                           |
| `data-expanded`              | Present when the active snap point is the full-height (`1`) state.  |
| `data-nested`                | Present when the drawer is nested within another dialog or drawer.  |
| `data-nested-drawer-open`    | Present when a nested drawer is open.                               |
| `data-nested-drawer-swiping` | Present when a nested drawer is being swiped.                       |
| `data-swipe-dismiss`         | Present when the drawer is dismissed by swiping.                    |
| `data-swipe-direction`       | The direction of the swipe (`'up' \| 'down' \| 'left' \| 'right'`). |
| `data-swiping`               | Present when the drawer is being swiped.                            |

| CSS Variable                 | Description                                                                 |
| :--------------------------- | :-------------------------------------------------------------------------- |
| `--nested-drawers`           | The number of nested drawers that are currently open.                       |
| `--drawer-height`            | The height of the drawer popup.                                             |
| `--drawer-frontmost-height`  | The height of the frontmost open drawer in the current nested drawer stack. |
| `--drawer-swipe-movement-x`  | The swipe movement on the X axis.                                           |
| `--drawer-swipe-movement-y`  | The swipe movement on the Y axis.                                           |
| `--drawer-snap-point-offset` | The snap point offset used for translating the drawer.                      |
| `--drawer-swipe-strength`    | Scalar (0.1–1) used to scale the swipe release transition duration in CSS.  |
| `--drawer-swipe-progress`    | 0–1, swipe progress of the nested drawer stacked on top of this one.        |

### Content

An inner container whose children can be selected with a mouse or pen without starting a swipe.
Renders a `<div>` element.

::table{columns="Prop,Type,Default"}

| Prop       | Type                          | Default | Description                          |
| :--------- | :---------------------------- | :------ | :----------------------------------- |
| `as`       | `keyof HTMLElementTagNameMap` | `'div'` | HTML element to render.              |
| `class`    | `string`                      | —       | CSS class applied to the element.    |
| `style`    | `string`                      | —       | Inline style applied to the element. |
| `children` | `Snippet`                     | —       | Content.                             |

::

| Attribute             | Description                            |
| :-------------------- | :------------------------------------- |
| `data-drawer-content` | Always present; marks the content box. |

### Title

A heading that labels the drawer.
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

A paragraph with additional information about the drawer.
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

A button that closes the drawer.
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

Connects a `<Drawer.Root>` with detached `<Drawer.Trigger>` components, and controls the drawer imperatively. Pass a type argument to type the `payload`.

```ts
const drawer = new Drawer.Handle<Payload>()
```

::table{columns="Member,Type"}

| Member                     | Type                           | Description                                                                               |
| :------------------------- | :----------------------------- | :---------------------------------------------------------------------------------------- |
| `isOpen`                   | `boolean`                      | Whether the drawer is currently open (readonly).                                          |
| `open(triggerId)`          | `(id: string \| null) => void` | Opens the drawer. Pass a trigger `id` to associate it, or `null` to open with no trigger. |
| `openWithPayload(payload)` | `(payload: Payload) => void`   | Opens the drawer with a payload for the `children` snippet.                               |
| `close()`                  | `() => void`                   | Closes the drawer.                                                                        |

::
