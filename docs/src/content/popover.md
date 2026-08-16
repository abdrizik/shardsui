# Popover

A floating anchored panel.

:demo{name="popover/hero"}

## Anatomy

```svelte title="Anatomy"
<script>
  import { Popover } from '@shardsui/svelte/popover'
</script>

<Popover.Root>
  <Popover.Trigger />
  <Popover.Portal>
    <Popover.Backdrop />
    <Popover.Positioner>
      <Popover.Popup>
        <Popover.Arrow />
        <Popover.Viewport>
          <Popover.Title />
          <Popover.Description />
          <Popover.Close />
        </Popover.Viewport>
      </Popover.Popup>
    </Popover.Positioner>
  </Popover.Portal>
</Popover.Root>
```

## Examples

### Opening on hover

Set `openOnHover` on the trigger to open the popover on hover as well as on click. Tune the timing with `delay` and `closeDelay`, both in milliseconds.

:demo{name="popover/open-on-hover"}

### Detached triggers

By default the trigger sits inside `<Popover.Root>`, right beside the content it opens, as at the top of this page.

When the two can't live together in the markup, detach them: render `<Popover.Trigger>` wherever it makes sense and connect it to the root with a shared `handle` from `new Popover.Handle()`.

```svelte title="Detached triggers"
<!-- [!code word:handle={demoPopover}] -->
<script>
  const demoPopover = new Popover.Handle()
</script>

<!-- [!code highlight] -->
<Popover.Trigger handle={demoPopover}>Trigger</Popover.Trigger>

<!-- [!code highlight] -->
<Popover.Root handle={demoPopover}>...</Popover.Root>
```

:demo{name="popover/detached-triggers-simple"}

### Multiple triggers

One popover can answer to several triggers: drop multiple `<Popover.Trigger>` elements inside a single `<Popover.Root>`, or give the same `handle` to any number of detached triggers.

```svelte title="Multiple triggers within the Root part"
<Popover.Root>
  <Popover.Trigger>Trigger 1</Popover.Trigger>
  <Popover.Trigger>Trigger 2</Popover.Trigger>
  ...
</Popover.Root>
```

```svelte title="Multiple detached triggers"
<script>
  const demoPopover = new Popover.Handle()
</script>

<Popover.Trigger handle={demoPopover}>Trigger 1</Popover.Trigger>

<Popover.Trigger handle={demoPopover}>Trigger 2</Popover.Trigger>

<Popover.Root handle={demoPopover}>...</Popover.Root>
```

When triggers share a popover, each one can hand the root its own data through the `payload` prop; read it back from the `children` snippet on `<Popover.Root>` to tailor what the panel shows. Pass a type argument to `new Popover.Handle()` to type the payload:

```svelte title="Detached triggers with payload"
<script>
  // [!code highlight]
  const demoPopover = new Popover.Handle<{ text: string }>()
</script>

<!-- [!code word:payload] -->
<!-- [!code highlight] -->
<Popover.Trigger handle={demoPopover} payload={{ text: 'Trigger 1' }}>Trigger 1</Popover.Trigger>

<!-- [!code word:payload] -->
<!-- [!code highlight] -->
<Popover.Trigger handle={demoPopover} payload={{ text: 'Trigger 2' }}>Trigger 2</Popover.Trigger>

<Popover.Root handle={demoPopover}>
  <!-- [!code word:payload] -->
  {#snippet children({ payload })}
    <Popover.Portal>
      <Popover.Positioner sideOffset={8}>
        <Popover.Popup>
          <Popover.Title>Popover</Popover.Title>
          <!-- [!code word:payload] -->
          {#if payload !== undefined}
            <!-- [!code word:payload] -->
            <Popover.Description>
              This has been opened by {payload.text}
            </Popover.Description>
          {/if}
        </Popover.Popup>
      </Popover.Positioner>
    </Popover.Portal>
  {/snippet}
</Popover.Root>
```

### Controlled mode with multiple triggers

To drive the popover from your own state, bind `open` and handle `onOpenChange` on `<Popover.Root>`. With several triggers, give each one an `id` and add `bind:triggerId` to `<Popover.Root>`: each trigger publishes its own `id` when it opens the popover, and setting `triggerId` yourself anchors the popover to that trigger.

:demo{name="popover/detached-triggers-controlled"}

### Animating the Popover

When one popover serves several triggers, it can glide from one to the next instead of snapping. Its position, its size, and its contents animate independently.

#### Position and Size

Position lives on the **Positioner**, so transition its `left`, `right`, `top`, and `bottom`. Size lives on the **Popup**, so transition its `width` and `height`.

#### Content

The content itself can cross-fade when the active trigger changes. Wrap it in `<Popover.Viewport>`, which notices the switch and exposes a `data-activation-direction` attribute — a space-separated horizontal and vertical pair such as `right down` — so the animation can lean toward the new trigger. Match a single token with the `~=` attribute selector, such as `[data-activation-direction~='right']`.

During a transition the viewport keeps both the incoming and outgoing content mounted, each in its own wrapper:

- `data-current`: the entering content, or the sole content when nothing is transitioning.
- `data-previous`: the leaving content during a transition.

:demo{name="popover/detached-triggers-full"}

## API reference

### Root

Groups all parts of the popover.
Doesn't render its own HTML element.

::table{columns="Prop,Type,Default"}

| Prop                   | Type                      | Default | Description                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     |
| :--------------------- | :------------------------ | :------ | :---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `open`                 | `boolean`                 | `false` | Open state (use `bind:open`).                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   |
| `onOpenChange`         | `(open: boolean) => void` | —       | Fires when the open state changes.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              |
| `onOpenChangeComplete` | `(open: boolean) => void` | —       | Fires after the open/close animation completes.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 |
| `modal`                | `boolean \| 'trap-focus'` | `false` | Determines if the popover enters a modal state when open. `true`: page scroll is locked and pointer interactions on outside elements are disabled, unless the popover was opened by hover, which gets neither. `false`: interaction with the rest of the document is allowed. `'trap-focus'`: page scroll and outside pointer interactions are left alone. On touch devices, a `true` modal blocks outside taps but leaves the page scrollable unless the popup spans nearly the full viewport width, matching native iOS behavior. In both modal states, focus is trapped only while a `<Popover.Close>` is rendered inside `<Popover.Popup>`. |
| `handle`               | `Popover.Handle<Payload>` | —       | A `new Popover.Handle()` instance for detached triggers.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        |
| `triggerId`            | `string \| null`          | `null`  | Active trigger id in multi-trigger scenarios (use `bind:triggerId`).                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            |
| `children`             | `Snippet<[{ payload }]>`  | —       | Popover content; receives the active trigger's `payload`.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       |

::

### Trigger

A button that opens the popover.
Renders a `<button>` element.

::table{columns="Prop,Type,Default"}

| Prop          | Type                            | Default    | Description                                                                               |
| :------------ | :------------------------------ | :--------- | :---------------------------------------------------------------------------------------- |
| `as`          | `keyof HTMLElementTagNameMap`   | `'button'` | HTML element to render.                                                                   |
| `class`       | `string`                        | —          | CSS class applied to the element.                                                         |
| `style`       | `string`                        | —          | Inline style applied to the element.                                                      |
| `disabled`    | `boolean`                       | `false`    | Whether the trigger is disabled.                                                          |
| `id`          | `string`                        | auto       | Custom element ID.                                                                        |
| `handle`      | `Popover.Handle<Payload>`       | —          | Handle for detached trigger mode.                                                         |
| `payload`     | `Payload`                       | —          | Data passed to the `<Popover.Root>` children snippet when this trigger opens the popover. |
| `openOnHover` | `boolean`                       | `false`    | Open the popover on hover as well as on click.                                            |
| `delay`       | `number`                        | `300`      | How long the pointer must rest on the trigger before it opens, in ms.                     |
| `closeDelay`  | `number`                        | `0`        | How long the popover stays open after the pointer leaves, in ms.                          |
| `children`    | `Snippet<[{ disabled, open }]>` | —          | Trigger content; receives the trigger state.                                              |

::

| Attribute         | Description                                                                               |
| :---------------- | :---------------------------------------------------------------------------------------- |
| `data-popup-open` | Present while the popover is open from this trigger.                                      |
| `data-pressed`    | Present while the popover is open from this trigger, opened by a press rather than hover. |
| `data-disabled`   | Present when the trigger is disabled.                                                     |

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

| Attribute             | Description                                 |
| :-------------------- | :------------------------------------------ |
| `data-open`           | Present when the popover is open.           |
| `data-closed`         | Present when the popover is closed.         |
| `data-starting-style` | Present when the backdrop is animating in.  |
| `data-ending-style`   | Present when the backdrop is animating out. |

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

### Positioner

Positions the popover against the trigger.
Renders a `<div>` element.

::table{columns="Prop,Type,Default"}

| Prop                    | Type                                                                       | Default                                                    | Description                                                       |
| :---------------------- | :------------------------------------------------------------------------- | :--------------------------------------------------------- | :---------------------------------------------------------------- |
| `as`                    | `keyof HTMLElementTagNameMap`                                              | `'div'`                                                    | HTML element to render.                                           |
| `class`                 | `string`                                                                   | —                                                          | CSS class applied to the element.                                 |
| `style`                 | `string`                                                                   | —                                                          | Inline style applied to the element.                              |
| `side`                  | `'top' \| 'bottom' \| 'left' \| 'right' \| 'inline-start' \| 'inline-end'` | `'bottom'`                                                 | Side to position the popup on.                                    |
| `align`                 | `'start' \| 'center' \| 'end'`                                             | `'center'`                                                 | Alignment of the popup along the side.                            |
| `sideOffset`            | `number \| OffsetFunction`                                                 | `0`                                                        | Distance in px from the anchor.                                   |
| `alignOffset`           | `number \| OffsetFunction`                                                 | `0`                                                        | Offset in px along the alignment axis.                            |
| `collisionBoundary`     | `'clipping-ancestors' \| Element \| Element[] \| Rect`                     | `'clipping-ancestors'`                                     | Boundary for collision detection.                                 |
| `collisionPadding`      | `number \| Padding`                                                        | `5`                                                        | Padding around the collision boundary.                            |
| `collisionAvoidance`    | `CollisionAvoidance`                                                       | `{ side: 'flip', align: 'flip', fallbackAxisSide: 'end' }` | Strategy to avoid collisions.                                     |
| `sticky`                | `boolean`                                                                  | `false`                                                    | Whether to keep the popup in view when the anchor is scrolled.    |
| `arrowPadding`          | `number`                                                                   | `5`                                                        | Padding between the arrow and the popup edges.                    |
| `disableAnchorTracking` | `boolean`                                                                  | `false`                                                    | Whether to disable tracking of the anchor's position as it moves. |
| `anchor`                | `Element \| VirtualAnchorElement \| null`                                  | trigger element                                            | Element to anchor the positioner to.                              |
| `positionMethod`        | `'absolute' \| 'fixed'`                                                    | `'absolute'`                                               | CSS position strategy to use.                                     |
| `children`              | `Snippet<[{ open, side, align, anchorHidden, instant }]>`                  | —                                                          | Positioner content; receives the positioner state.                |

::

| Attribute            | Description                                    |
| :------------------- | :--------------------------------------------- |
| `data-open`          | Present when the popup is open.                |
| `data-closed`        | Present when the popup is closed.              |
| `data-side`          | Which side of the anchor the popup is on.      |
| `data-align`         | How the popup is aligned relative to the side. |
| `data-anchor-hidden` | Present when the anchor is hidden.             |
| `data-instant`       | Present when animations should be instant.     |

| CSS Variable          | Description                                                                       |
| :-------------------- | :-------------------------------------------------------------------------------- |
| `--available-width`   | Available width between the anchor and the viewport edge.                         |
| `--available-height`  | Available height between the anchor and the viewport edge.                        |
| `--anchor-width`      | Width of the anchor element.                                                      |
| `--anchor-height`     | Height of the anchor element.                                                     |
| `--transform-origin`  | Transform origin for scale animations.                                            |
| `--positioner-width`  | The positioner element's width. Set while a `<Popover.Viewport>` morphs content.  |
| `--positioner-height` | The positioner element's height. Set while a `<Popover.Viewport>` morphs content. |

### Popup

A container for the popover contents.
Renders a `<div>` element.

::table{columns="Prop,Type,Default"}

| Prop           | Type                                                                                   | Default | Description                                                                                                                                                                                                                                                                  |
| :------------- | :------------------------------------------------------------------------------------- | :------ | :--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `as`           | `keyof HTMLElementTagNameMap`                                                          | `'div'` | HTML element to render.                                                                                                                                                                                                                                                      |
| `class`        | `string`                                                                               | —       | CSS class applied to the element.                                                                                                                                                                                                                                            |
| `style`        | `string`                                                                               | —       | Inline style applied to the element.                                                                                                                                                                                                                                         |
| `id`           | `string`                                                                               | auto    | Custom element ID.                                                                                                                                                                                                                                                           |
| `initialFocus` | `HTMLElement \| boolean \| ((type: string) => HTMLElement \| boolean \| null \| void)` | —       | Element to focus when the popup opens, or a function receiving the interaction type (`'mouse'`, `'keyboard'`, `'touch'`, `'pen'`). `false` to skip; `true` focuses the first tabbable child. Defaults to the first tabbable child, or the popup itself when opened by touch. |
| `finalFocus`   | `HTMLElement \| boolean \| ((type: string) => HTMLElement \| boolean \| null \| void)` | —       | Element to focus when the popup closes, or a function receiving the interaction type. `false` to skip; `true` (default) to return focus to the trigger.                                                                                                                      |
| `children`     | `Snippet<[{ open, side, align, instant, transitionStatus }]>`                          | —       | Popup content; receives the popup state.                                                                                                                                                                                                                                     |

::

| Attribute             | Description                                    |
| :-------------------- | :--------------------------------------------- |
| `data-open`           | Present when the popover is open.              |
| `data-closed`         | Present when the popover is closed.            |
| `data-side`           | Which side of the anchor the popup is on.      |
| `data-align`          | How the popup is aligned relative to the side. |
| `data-starting-style` | Present when the popover is animating in.      |
| `data-ending-style`   | Present when the popover is animating out.     |
| `data-instant`        | Present when animations should be instant.     |

| CSS Variable     | Description                                                                  |
| :--------------- | :--------------------------------------------------------------------------- |
| `--popup-width`  | The popup element's width. Set while a `<Popover.Viewport>` morphs content.  |
| `--popup-height` | The popup element's height. Set while a `<Popover.Viewport>` morphs content. |

### Arrow

Displays an element positioned against the anchor.
Renders a `<div>` element.

::table{columns="Prop,Type,Default"}

| Prop       | Type                                           | Default | Description                          |
| :--------- | :--------------------------------------------- | :------ | :----------------------------------- |
| `as`       | `keyof HTMLElementTagNameMap`                  | `'div'` | HTML element to render.              |
| `class`    | `string`                                       | —       | CSS class applied to the element.    |
| `style`    | `string`                                       | —       | Inline style applied to the element. |
| `children` | `Snippet<[{ open, side, align, uncentered }]>` | —       | Content; receives the arrow state.   |

::

| Attribute         | Description                                    |
| :---------------- | :--------------------------------------------- |
| `data-open`       | Present when the popup is open.                |
| `data-closed`     | Present when the popup is closed.              |
| `data-side`       | Which side of the anchor the popup is on.      |
| `data-align`      | How the popup is aligned relative to the side. |
| `data-uncentered` | Present when the arrow cannot be centered.     |

### Title

A heading that labels the popover.
Renders an `<h2>` element.

::table{columns="Prop,Type,Default"}

| Prop       | Type                          | Default | Description                          |
| :--------- | :---------------------------- | :------ | :----------------------------------- |
| `as`       | `keyof HTMLElementTagNameMap` | `'h2'`  | HTML element to render.              |
| `class`    | `string`                      | —       | CSS class applied to the element.    |
| `style`    | `string`                      | —       | Inline style applied to the element. |
| `id`       | `string`                      | auto    | Custom element ID.                   |
| `children` | `Snippet`                     | —       | Title content.                       |

::

### Description

A paragraph with additional information about the popover.
Renders a `<p>` element.

::table{columns="Prop,Type,Default"}

| Prop       | Type                          | Default | Description                          |
| :--------- | :---------------------------- | :------ | :----------------------------------- |
| `as`       | `keyof HTMLElementTagNameMap` | `'p'`   | HTML element to render.              |
| `class`    | `string`                      | —       | CSS class applied to the element.    |
| `style`    | `string`                      | —       | Inline style applied to the element. |
| `id`       | `string`                      | auto    | Custom element ID.                   |
| `children` | `Snippet`                     | —       | Description content.                 |

::

### Close

A button that closes the popover.
Renders a `<button>` element.

::table{columns="Prop,Type,Default"}

| Prop       | Type                          | Default    | Description                          |
| :--------- | :---------------------------- | :--------- | :----------------------------------- |
| `as`       | `keyof HTMLElementTagNameMap` | `'button'` | HTML element to render.              |
| `class`    | `string`                      | —          | CSS class applied to the element.    |
| `style`    | `string`                      | —          | Inline style applied to the element. |
| `disabled` | `boolean`                     | `false`    | Whether the button is disabled.      |
| `children` | `Snippet`                     | —          | Close button content.                |

::

### Viewport

A viewport for displaying content transitions.
This component is only required if one popup can be opened by multiple triggers, its content
changes based on the trigger, and switching between them is animated.
Renders a `<div>` element.

::table{columns="Prop,Type,Default"}

| Prop       | Type                                                         | Default | Description                           |
| :--------- | :----------------------------------------------------------- | :------ | :------------------------------------ |
| `as`       | `keyof HTMLElementTagNameMap`                                | `'div'` | HTML element to render.               |
| `class`    | `string`                                                     | —       | CSS class applied to the element.     |
| `style`    | `string`                                                     | —       | Inline style applied to the element.  |
| `children` | `Snippet<[{ activationDirection, transitioning, instant }]>` | —       | Content; receives the viewport state. |

::

| Attribute                   | Description                                                                                                                                                                                       |
| :-------------------------- | :------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `data-activation-direction` | Direction the popup was activated from. A horizontal and a vertical token separated by a space, e.g. `right down`; either can be empty, so match one with `[data-activation-direction~='right']`. |
| `data-transitioning`        | Present while a content transition is in progress.                                                                                                                                                |
| `data-current`              | Applied to the wrapper of the current content.                                                                                                                                                    |
| `data-previous`             | Applied to the wrapper of the outgoing content, present only during a transition.                                                                                                                 |
| `data-instant`              | Present when animations should be instant. Value is `'click'`, `'dismiss'`, `'focus'`, or `'trigger-change'`.                                                                                     |
| `data-starting-style`       | Applied to the `data-current` wrapper while the incoming content is animating in.                                                                                                                 |
| `data-ending-style`         | Applied to the `data-previous` wrapper while the outgoing content is animating out.                                                                                                               |

| CSS Variable     | Description                                                                                                                          |
| :--------------- | :----------------------------------------------------------------------------------------------------------------------------------- |
| `--popup-width`  | Width of the outgoing popup content, set on the `data-previous` container. Use it to freeze the popup size while the content morphs. |
| `--popup-height` | Height of the outgoing popup content, set on the `data-previous` container.                                                          |

When using the Viewport, set `width: var(--positioner-width)` and `height: var(--positioner-height)` on the Positioner so its box is frozen to the measured size during the transition; otherwise content-driven resizing can make the popup thrash or flip to another side.

## Handle

Connects a `<Popover.Root>` with detached `<Popover.Trigger>` components, and controls the popover imperatively. Pass a type argument to type the `payload`.

```ts
const popover = new Popover.Handle<Payload>()
```

::table{columns="Member,Type"}

| Member            | Type                   | Description                                                         |
| :---------------- | :--------------------- | :------------------------------------------------------------------ |
| `isOpen`          | `boolean`              | Whether the popover is currently open (readonly).                   |
| `open(triggerId)` | `(id: string) => void` | Opens the popover, associating it with the trigger of the given ID. |
| `close()`         | `() => void`           | Closes the popover.                                                 |

::
