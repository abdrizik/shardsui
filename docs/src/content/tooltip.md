# Tooltip

A hover or focus hint.

:demo{name="tooltip/hero"}

## Anatomy

```svelte title="Anatomy"
<script>
  import { Tooltip } from '@shardsui/svelte/tooltip'
</script>

<Tooltip.Provider>
  <Tooltip.Root>
    <Tooltip.Trigger />
    <Tooltip.Portal>
      <Tooltip.Positioner>
        <Tooltip.Popup>
          <Tooltip.Viewport>
            <!-- content -->
          </Tooltip.Viewport>
          <Tooltip.Arrow />
        </Tooltip.Popup>
      </Tooltip.Positioner>
    </Tooltip.Portal>
  </Tooltip.Root>
</Tooltip.Provider>
```

## Usage guidelines

- **Prefer using tooltips as visual labels only**: alone they are not accessible to touch or screen reader users.
- **Provide an accessible name for the trigger**: a tooltip is visual-only and doesn't label its trigger. Give the trigger an `aria-label` that closely matches the tooltip's content so screen reader users get a consistent name.

## Alternatives to tooltips

Without a hover-capable pointer, there's no discoverable way to surface a tooltip before tapping its trigger. Long press isn't a way out either: iOS has no system-standard tooltip affordance, and Android's long-press gesture is already claimed by the browser's contextual menus. So tooltips stay disabled on touch devices.

### Infotips

For content that opens when hovering an info icon, use [Popover](/svelte/popover) with `openOnHover` on the trigger instead; that keeps the content reachable for touch and screen reader users. The test: when opening the overlay is the trigger's whole job, it's a popover; when the trigger does something else and the overlay is incidental, it's a tooltip.

### Description text

When a description is essential to understanding an element, keep it out of a tooltip: put it in inline text, or in a [Popover](/svelte/popover) when space is tight, so everyone can read it. Save tooltips for non-essential hints, and make icon-only triggers legible on their own, especially on mobile where the tooltip's text label never shows.

### Contextual feedback messages

For feedback tied to a specific control, use [Toast](/svelte/toast) and its anchoring — it announces the message to screen readers and handles richer content.

## Examples

### Detached triggers

The trigger usually lives inside `<Tooltip.Root>`, next to the hint it shows, as in the hero demo above.

When the two can't share a spot in the markup, render `<Tooltip.Trigger>` wherever the element belongs and connect it to the root through a shared `handle` from `new Tooltip.Handle()`.

The handle's imperative methods, `open()` and `close()`, need a `<Tooltip.Root>` using the same handle to be mounted — calls made while no root is attached (before one mounts, or after it unmounts) are ignored and not replayed. Each root starts from fresh state when it mounts; no open state carries over from a previous mount.

```svelte title="Detached triggers"
<script>
  const demoTooltip = new Tooltip.Handle()
</script>

<!-- [!code word:handle={demoTooltip}] -->
<!-- [!code highlight] -->
<Tooltip.Trigger handle={demoTooltip}>Button</Tooltip.Trigger>

<!-- [!code word:handle={demoTooltip}] -->
<!-- [!code highlight] -->
<Tooltip.Root handle={demoTooltip}>...</Tooltip.Root>
```

:demo{name="tooltip/detached-triggers-simple"}

### Multiple triggers

One tooltip can back several triggers. Give the same `handle` to a set of detached triggers, or list multiple `<Tooltip.Trigger>` elements inside a single `<Tooltip.Root>`.

```svelte title="Multiple triggers within the Root part"
<Tooltip.Root>
  <Tooltip.Trigger>Trigger 1</Tooltip.Trigger>
  <Tooltip.Trigger>Trigger 2</Tooltip.Trigger>
  ...
</Tooltip.Root>
```

Each trigger can pass its own `payload`, letting one tooltip say something different per trigger. The `children` snippet on `<Tooltip.Root>` receives the active trigger's `payload`; add a type argument to `new Tooltip.Handle()` to type it:

```svelte title="Detached triggers with payload"
<script>
  const demoTooltip = new Tooltip.Handle<{ text: string }>() // [!code highlight]
</script>

<!-- [!code word:payload] -->
<!-- [!code highlight] -->
<Tooltip.Trigger handle={demoTooltip} payload={{ text: 'Trigger 1' }}>Trigger 1</Tooltip.Trigger>
<!-- [!code highlight] -->
<Tooltip.Trigger handle={demoTooltip} payload={{ text: 'Trigger 2' }}>Trigger 2</Tooltip.Trigger>

<Tooltip.Root handle={demoTooltip}>
  {#snippet children({ payload })}
    <Tooltip.Portal>
      <Tooltip.Positioner sideOffset={8}>
        <Tooltip.Popup>
          {#if payload}<span>Opened by {payload.text}</span>{/if}
        </Tooltip.Popup>
      </Tooltip.Positioner>
    </Tooltip.Portal>
  {/snippet}
</Tooltip.Root>
```

### Controlled mode with multiple triggers

Drive the open state yourself with `bind:open` and `onOpenChange` on `<Tooltip.Root>`. Across multiple triggers, give each `<Tooltip.Trigger>` an `id` and add `bind:triggerId` to `<Tooltip.Root>`: each trigger publishes its own `id` when it opens the tooltip, and setting `triggerId` yourself anchors the tooltip to that trigger. Pass `triggerId` one-way instead if you want to drive it entirely from your own state.

:demo{name="tooltip/detached-triggers-controlled"}

### Animating the Tooltip

A tooltip can travel smoothly from one trigger to the next instead of blinking off and on. Position, size, and content animate independently.

#### Position and Size

Position sits on the **Positioner**: transition `left`, `right`, `top`, and `bottom`. Size sits on the **Popup**: transition `width` and `height`.

#### Content

The content can shift too when triggers carry different hints. Wrap it in `<Tooltip.Viewport>`, which spots the trigger change and writes a `data-activation-direction` attribute — a space-separated horizontal and vertical pair such as `right down`, `left`, or `up` — indicating where the new trigger falls relative to the old one. Match a single token with the `~=` attribute selector, such as `[data-activation-direction~='right']`.

Mid-transition, the viewport keeps both hints mounted, each in its own wrapper:

- `data-current`: the entering content, or the sole content when nothing is transitioning. It also carries `data-starting-style` while it animates in.
- `data-previous`: the leaving content during a transition. It also carries `data-ending-style` while it animates out.

Target these to write the enter and exit animations.

:demo{name="tooltip/detached-triggers-full"}

## API reference

### Provider

Provides a shared delay for multiple tooltips. Once one tooltip is open, siblings open with no delay.
Doesn't render its own HTML element.

::table{columns="Prop,Type,Default"}

| Prop         | Type      | Default | Description                                                                      |
| :----------- | :-------- | :------ | :------------------------------------------------------------------------------- |
| `delay`      | `number`  | —       | Delay in ms before opening any tooltip in the group.                             |
| `closeDelay` | `number`  | —       | Delay in ms before closing any tooltip in the group.                             |
| `timeout`    | `number`  | `400`   | Duration in ms after the last tooltip closes before the instant-open phase ends. |
| `children`   | `Snippet` | —       | Content.                                                                         |

::

### Root

Groups all parts of the tooltip.
Doesn't render its own HTML element.

::table{columns="Prop,Type,Default"}

| Prop                    | Type                             | Default  | Description                                                                       |
| :---------------------- | :------------------------------- | :------- | :-------------------------------------------------------------------------------- |
| `open`                  | `boolean`                        | `false`  | Open state (use `bind:open`).                                                     |
| `disabled`              | `boolean`                        | `false`  | Whether the tooltip is disabled.                                                  |
| `disableHoverablePopup` | `boolean`                        | `false`  | When `true`, moving the cursor onto the popup no longer keeps it open.            |
| `trackCursorAxis`       | `'none' \| 'x' \| 'y' \| 'both'` | `'none'` | Axis along which the tooltip tracks the cursor.                                   |
| `onOpenChange`          | `(open: boolean) => void`        | —        | Fires when the open state changes.                                                |
| `onOpenChangeComplete`  | `(open: boolean) => void`        | —        | Fires when the open/close transition completes.                                   |
| `triggerId`             | `string \| null`                 | `null`   | Controlled active trigger ID for multi-trigger tooltips.                          |
| `handle`                | `Tooltip.Handle<Payload>`        | —        | Associates the tooltip with detached triggers created via `new Tooltip.Handle()`. |
| `children`              | `Snippet<[{ payload }]>`         | —        | Tooltip content; receives the active trigger's `payload`.                         |

::

### Trigger

An element to attach the tooltip to.
Renders a `<button>` element.

::table{columns="Prop,Type,Default"}

| Prop           | Type                          | Default           | Description                                                                                   |
| :------------- | :---------------------------- | :---------------- | :-------------------------------------------------------------------------------------------- |
| `as`           | `keyof HTMLElementTagNameMap` | `'button'`        | HTML element to render.                                                                       |
| `class`        | `string`                      | —                 | CSS class applied to the element.                                                             |
| `style`        | `string`                      | —                 | Inline style applied to the element.                                                          |
| `disabled`     | `boolean`                     | Root's `disabled` | Stops the tooltip opening from this trigger. Does not set the element's `disabled` attribute. |
| `id`           | `string`                      | auto              | Custom element ID.                                                                            |
| `delay`        | `number`                      | `600`             | Delay in ms before opening the tooltip. Falls back to `<Tooltip.Provider delay>`.             |
| `closeDelay`   | `number`                      | `0`               | Delay in ms before closing the tooltip. Falls back to `<Tooltip.Provider closeDelay>`.        |
| `closeOnClick` | `boolean`                     | `true`            | Whether clicking the trigger closes the tooltip.                                              |
| `handle`       | `Tooltip.Handle<Payload>`     | —                 | Associates a detached trigger with a tooltip.                                                 |
| `payload`      | `Payload`                     | —                 | Data passed to the `<Tooltip.Root>` children snippet when this trigger opens the tooltip.     |
| `children`     | `Snippet<[{ open }]>`         | —                 | Trigger content; receives the trigger state.                                                  |

::

| Attribute               | Description                                     |
| :---------------------- | :---------------------------------------------- |
| `data-popup-open`       | Present when the corresponding tooltip is open. |
| `data-trigger-disabled` | Present when the trigger is disabled.           |

### Portal

A portal that moves the popup out to `<body>`, clear of ancestor clipping and stacking.
Renders a `<div>` element.

::table{columns="Prop,Type,Default"}

| Prop          | Type                  | Default | Description                                                                                                   |
| :------------ | :-------------------- | :------ | :------------------------------------------------------------------------------------------------------------ |
| `container`   | `HTMLElement \| null` | —       | Parent element to render the portal into. Defaults to the nearest ancestor portal, otherwise `document.body`. |
| `keepMounted` | `boolean`             | `false` | Whether to keep the contents mounted while the popup is closed.                                               |

::

### Positioner

Positions the tooltip against the trigger.
Renders a `<div>` element.

::table{columns="Prop,Type,Default"}

| Prop                    | Type                                                                       | Default                                                    | Description                                                       |
| :---------------------- | :------------------------------------------------------------------------- | :--------------------------------------------------------- | :---------------------------------------------------------------- |
| `as`                    | `keyof HTMLElementTagNameMap`                                              | `'div'`                                                    | HTML element to render.                                           |
| `class`                 | `string`                                                                   | —                                                          | CSS class applied to the element.                                 |
| `style`                 | `string`                                                                   | —                                                          | Inline style applied to the element.                              |
| `side`                  | `'top' \| 'bottom' \| 'left' \| 'right' \| 'inline-start' \| 'inline-end'` | `'top'`                                                    | Side to position the popup on.                                    |
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

| Attribute            | Description                                                                                                                                             |
| :------------------- | :------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `data-open`          | Present when the popup is open.                                                                                                                         |
| `data-closed`        | Present when the popup is closed.                                                                                                                       |
| `data-side`          | Which side of the anchor the popup is on.                                                                                                               |
| `data-align`         | How the popup is aligned relative to the side.                                                                                                          |
| `data-anchor-hidden` | Present when the anchor is hidden.                                                                                                                      |
| `data-instant`       | Present when animations should be instant. Value is `'tracking-cursor'` while `trackCursorAxis` is set, otherwise `'focus'`, `'dismiss'`, or `'delay'`. |

| CSS Variable          | Description                                                                       |
| :-------------------- | :-------------------------------------------------------------------------------- |
| `--available-width`   | Available width between the anchor and the viewport edge.                         |
| `--available-height`  | Available height between the anchor and the viewport edge.                        |
| `--anchor-width`      | Width of the anchor element.                                                      |
| `--anchor-height`     | Height of the anchor element.                                                     |
| `--transform-origin`  | Transform origin for scale animations.                                            |
| `--positioner-width`  | The positioner element's width. Set while a `<Tooltip.Viewport>` morphs content.  |
| `--positioner-height` | The positioner element's height. Set while a `<Tooltip.Viewport>` morphs content. |

### Popup

A container for the tooltip contents.
Renders a `<div>` element.

::table{columns="Prop,Type,Default"}

| Prop       | Type                                                          | Default | Description                              |
| :--------- | :------------------------------------------------------------ | :------ | :--------------------------------------- |
| `as`       | `keyof HTMLElementTagNameMap`                                 | `'div'` | HTML element to render.                  |
| `class`    | `string`                                                      | —       | CSS class applied to the element.        |
| `style`    | `string`                                                      | —       | Inline style applied to the element.     |
| `children` | `Snippet<[{ open, side, align, instant, transitionStatus }]>` | —       | Popup content; receives the popup state. |

::

| Attribute             | Description                                    |
| :-------------------- | :--------------------------------------------- |
| `data-open`           | Present when the tooltip is open.              |
| `data-closed`         | Present when the tooltip is closed.            |
| `data-side`           | Which side of the anchor the popup is on.      |
| `data-align`          | How the popup is aligned relative to the side. |
| `data-starting-style` | Present when the tooltip is animating in.      |
| `data-ending-style`   | Present when the tooltip is animating out.     |
| `data-instant`        | Present when animations should be instant.     |

| CSS Variable     | Description                                                                  |
| :--------------- | :--------------------------------------------------------------------------- |
| `--popup-width`  | The popup element's width. Set while a `<Tooltip.Viewport>` morphs content.  |
| `--popup-height` | The popup element's height. Set while a `<Tooltip.Viewport>` morphs content. |

### Arrow

Displays an element positioned against the anchor.
Renders a `<div>` element.

::table{columns="Prop,Type,Default"}

| Prop       | Type                                                    | Default | Description                          |
| :--------- | :------------------------------------------------------ | :------ | :----------------------------------- |
| `as`       | `keyof HTMLElementTagNameMap`                           | `'div'` | HTML element to render.              |
| `class`    | `string`                                                | —       | CSS class applied to the element.    |
| `style`    | `string`                                                | —       | Inline style applied to the element. |
| `children` | `Snippet<[{ open, side, align, uncentered, instant }]>` | —       | Content; receives the arrow state.   |

::

| Attribute         | Description                                    |
| :---------------- | :--------------------------------------------- |
| `data-open`       | Present when the popup is open.                |
| `data-closed`     | Present when the popup is closed.              |
| `data-side`       | Which side of the anchor the popup is on.      |
| `data-align`      | How the popup is aligned relative to the side. |
| `data-uncentered` | Present when the arrow cannot be centered.     |
| `data-instant`    | Present when animations should be instant.     |

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
| `data-instant`              | Present when animations should be instant.                                                                                                                                                        |
| `data-starting-style`       | Applied to the `data-current` wrapper while the incoming content is animating in.                                                                                                                 |
| `data-ending-style`         | Applied to the `data-previous` wrapper while the outgoing content is animating out.                                                                                                               |

| CSS Variable     | Description                                                                                                                          |
| :--------------- | :----------------------------------------------------------------------------------------------------------------------------------- |
| `--popup-width`  | Width of the outgoing popup content, set on the `data-previous` container. Use it to freeze the popup size while the content morphs. |
| `--popup-height` | Height of the outgoing popup content, set on the `data-previous` container.                                                          |

Reach for the Viewport only when a single popup is opened by multiple triggers, its content differs per trigger, and the switch between them is animated. When you do, set `width: var(--positioner-width)` and `height: var(--positioner-height)` on the `Positioner` so its box is frozen to the measured size during the transition; otherwise content-driven resizing can make the popup thrash or flip to another side.

## Handle

Connects a `<Tooltip.Root>` with detached `<Tooltip.Trigger>` components, and controls the tooltip imperatively. Pass a type argument to type the `payload`.

```ts
const tooltip = new Tooltip.Handle<Payload>()
```

::table{columns="Member,Type"}

| Member            | Type                   | Description                                                         |
| :---------------- | :--------------------- | :------------------------------------------------------------------ |
| `isOpen`          | `boolean`              | Whether the tooltip is currently open (readonly).                   |
| `open(triggerId)` | `(id: string) => void` | Opens the tooltip, associating it with the trigger of the given ID. |
| `close()`         | `() => void`           | Closes the tooltip.                                                 |

::
