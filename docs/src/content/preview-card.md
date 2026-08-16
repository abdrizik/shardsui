# Preview Card

A link preview opened on hover.

:demo{name="preview-card/hero"}

## Anatomy

```svelte title="Anatomy"
<script>
  import { PreviewCard } from '@shardsui/svelte/preview-card'
</script>

<PreviewCard.Root>
  <PreviewCard.Trigger />
  <PreviewCard.Portal>
    <PreviewCard.Backdrop />
    <PreviewCard.Positioner>
      <PreviewCard.Popup>
        <PreviewCard.Arrow />
        <PreviewCard.Viewport />
      </PreviewCard.Popup>
    </PreviewCard.Positioner>
  </PreviewCard.Portal>
</PreviewCard.Root>
```

## Usage guidelines

- **Popup content should reflect the link destination**: avoid placing unique or essential information in the popup unless it is also available on the linked page. Preview cards only help pointer and keyboard users; they are not accessible to touch or screen reader users.

## Examples

### Detached triggers

The trigger normally nests inside `<PreviewCard.Root>`. When the link and its card can't sit together in the markup — a link running inline in a paragraph, say — render `<PreviewCard.Trigger>` wherever the link belongs and tie it back to the root with a shared `handle` from `new PreviewCard.Handle()`.

The handle's imperative methods, `open()` and `close()`, need a `<PreviewCard.Root>` using the same handle to be mounted. Calls made before a root mounts or after it unmounts are ignored, not queued. Each root starts from fresh state when it mounts.

```svelte title="Detached triggers"
<script>
  const demoPreviewCard = new PreviewCard.Handle()
</script>

<!-- [!code word:handle={demoPreviewCard}] -->
<!-- [!code highlight] -->
<PreviewCard.Trigger handle={demoPreviewCard} href="#">Link</PreviewCard.Trigger>

<!-- [!code highlight] -->
<PreviewCard.Root handle={demoPreviewCard}>...</PreviewCard.Root>
```

:demo{name="preview-card/detached-triggers-simple"}

### Multiple triggers

One preview card can serve many links: nest several `<PreviewCard.Trigger>` elements in a single `<PreviewCard.Root>`, or point any number of detached triggers at the same `handle`.

```svelte title="Multiple triggers within the Root part"
<PreviewCard.Root>
  <PreviewCard.Trigger href="#">Trigger 1</PreviewCard.Trigger>
  <PreviewCard.Trigger href="#">Trigger 2</PreviewCard.Trigger>
  ...
</PreviewCard.Root>
```

```svelte title="Multiple detached triggers"
<script>
  const demoPreviewCard = new PreviewCard.Handle()
</script>

<PreviewCard.Trigger handle={demoPreviewCard} href="#">Trigger 1</PreviewCard.Trigger>

<PreviewCard.Trigger handle={demoPreviewCard} href="#">Trigger 2</PreviewCard.Trigger>

<PreviewCard.Root handle={demoPreviewCard}>...</PreviewCard.Root>
```

Each trigger can feed the card its own data through the `payload` prop, so one card shows a different preview per link. Read it from the `children` snippet on `<PreviewCard.Root>`. Pass a type argument to `new PreviewCard.Handle()` to type the payload:

```svelte title="Detached triggers with payload"
<script>
  // [!code highlight]
  const demoPreviewCard = new PreviewCard.Handle<{ title: string }>()
</script>

<!-- [!code word:payload] -->
<!-- [!code highlight] -->
<PreviewCard.Trigger handle={demoPreviewCard} payload={{ title: 'Trigger 1' }} href="#"
  >Trigger 1</PreviewCard.Trigger
>

<!-- [!code word:payload] -->
<!-- [!code highlight] -->
<PreviewCard.Trigger handle={demoPreviewCard} payload={{ title: 'Trigger 2' }} href="#"
  >Trigger 2</PreviewCard.Trigger
>

<PreviewCard.Root handle={demoPreviewCard}>
  <!-- [!code word:payload] -->
  {#snippet children({ payload })}
    <PreviewCard.Portal>
      <PreviewCard.Positioner sideOffset={8}>
        <PreviewCard.Popup>
          <!-- [!code word:payload] -->
          {#if payload !== undefined}
            <!-- [!code word:payload] -->
            <span>Preview card opened by {payload.title}</span>
          {/if}
        </PreviewCard.Popup>
      </PreviewCard.Positioner>
    </PreviewCard.Portal>
  {/snippet}
</PreviewCard.Root>
```

### Controlled mode with multiple triggers

Own the open state by binding `open` and handling `onOpenChange` on `<PreviewCard.Root>`. With more than one trigger, give each trigger an `id` and add `bind:triggerId` to `<PreviewCard.Root>`: each trigger publishes its own `id` when it opens the card, and setting `triggerId` yourself anchors the card to that trigger. Pass `triggerId` one-way instead if you want to drive it entirely from your own state.

:demo{name="preview-card/detached-triggers-controlled"}

### Animating the Preview Card

When a single card hops between triggers, it can slide across rather than pop in and out. Position, size, and contents each animate on their own.

#### Position and Size

The **Positioner** carries the card's position: transition its `left`, `right`, `top`, and `bottom`. The **Popup** carries its size, so transition `width` and `height` there.

#### Content

The contents can cross-fade too when triggers show different previews. Wrap them in `<PreviewCard.Viewport>`, which detects the trigger change and sets a `data-activation-direction` attribute marking where the new trigger sits relative to the last — a horizontal and a vertical token separated by a space, e.g. `right down`; either can be empty. Match a single token with the `~=` attribute selector, such as `[data-activation-direction~='right']`.

While a transition runs, the viewport holds both the old and new contents, each in its own wrapper:

- `data-current`: the incoming content, or the only content when nothing is transitioning.
- `data-previous`: the outgoing content during a transition.

:demo{name="preview-card/detached-triggers-full"}

## API reference

### Root

Groups all parts of the preview card.
Doesn't render its own HTML element.

::table{columns="Prop,Type,Default"}

| Prop                   | Type                          | Default | Description                                                          |
| :--------------------- | :---------------------------- | :------ | :------------------------------------------------------------------- |
| `open`                 | `boolean`                     | `false` | Open state (use `bind:open`).                                        |
| `onOpenChange`         | `(open: boolean) => void`     | —       | Fires when the open state changes.                                   |
| `onOpenChangeComplete` | `(open: boolean) => void`     | —       | Fires after the open/close animation completes.                      |
| `handle`               | `PreviewCard.Handle<Payload>` | —       | A `new PreviewCard.Handle()` instance for detached triggers.         |
| `triggerId`            | `string \| null`              | `null`  | Active trigger id in multi-trigger scenarios (use `bind:triggerId`). |
| `children`             | `Snippet<[{ payload }]>`      | —       | Preview card content; receives the active trigger's `payload`.       |

::

### Trigger

A link that opens the preview card.
Renders an `<a>` element.

::table{columns="Prop,Type,Default"}

| Prop         | Type                          | Default | Description                                                                                |
| :----------- | :---------------------------- | :------ | :----------------------------------------------------------------------------------------- |
| `as`         | `keyof HTMLElementTagNameMap` | `'a'`   | HTML element to render.                                                                    |
| `class`      | `string`                      | —       | CSS class applied to the element.                                                          |
| `style`      | `string`                      | —       | Inline style applied to the element.                                                       |
| `id`         | `string`                      | auto    | Custom element ID.                                                                         |
| `href`       | `string`                      | —       | Link destination when rendering as an `<a>`.                                               |
| `delay`      | `number`                      | `600`   | How long to wait before the preview card opens. Specified in milliseconds.                 |
| `closeDelay` | `number`                      | `300`   | How long to wait before closing the preview card. Specified in milliseconds.               |
| `handle`     | `PreviewCard.Handle<Payload>` | —       | A handle to associate the trigger with a preview card.                                     |
| `payload`    | `Payload`                     | —       | Data passed to the `<PreviewCard.Root>` children snippet when this trigger opens the card. |
| `children`   | `Snippet<[{ open }]>`         | —       | Trigger content; receives the trigger state.                                               |

::

| Attribute         | Description                                          |
| :---------------- | :--------------------------------------------------- |
| `data-popup-open` | Present when the corresponding preview card is open. |

### Backdrop

An overlay displayed beneath the popup. It never receives pointer events, so hovering the page through it still works.
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
| `data-open`           | Present when the preview card is open.      |
| `data-closed`         | Present when the preview card is closed.    |
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

Positions the popup against the trigger.
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

| CSS Variable          | Description                                                                           |
| :-------------------- | :------------------------------------------------------------------------------------ |
| `--available-width`   | Available width between the anchor and the viewport edge.                             |
| `--available-height`  | Available height between the anchor and the viewport edge.                            |
| `--anchor-width`      | Width of the anchor element.                                                          |
| `--anchor-height`     | Height of the anchor element.                                                         |
| `--transform-origin`  | Transform origin for scale animations.                                                |
| `--positioner-width`  | The positioner element's width. Set while a `<PreviewCard.Viewport>` morphs content.  |
| `--positioner-height` | The positioner element's height. Set while a `<PreviewCard.Viewport>` morphs content. |

### Popup

A container for the preview card contents.
Renders a `<div>` element.

::table{columns="Prop,Type,Default"}

| Prop       | Type                                                          | Default | Description                              |
| :--------- | :------------------------------------------------------------ | :------ | :--------------------------------------- |
| `as`       | `keyof HTMLElementTagNameMap`                                 | `'div'` | HTML element to render.                  |
| `class`    | `string`                                                      | —       | CSS class applied to the element.        |
| `style`    | `string`                                                      | —       | Inline style applied to the element.     |
| `children` | `Snippet<[{ open, side, align, instant, transitionStatus }]>` | —       | Popup content; receives the popup state. |

::

| Attribute             | Description                                     |
| :-------------------- | :---------------------------------------------- |
| `data-open`           | Present when the preview card is open.          |
| `data-closed`         | Present when the preview card is closed.        |
| `data-side`           | Which side of the anchor the popup is on.       |
| `data-align`          | How the popup is aligned relative to the side.  |
| `data-starting-style` | Present when the preview card is animating in.  |
| `data-ending-style`   | Present when the preview card is animating out. |
| `data-instant`        | Present when animations should be instant.      |

| CSS Variable     | Description                                                                      |
| :--------------- | :------------------------------------------------------------------------------- |
| `--popup-width`  | The popup element's width. Set while a `<PreviewCard.Viewport>` morphs content.  |
| `--popup-height` | The popup element's height. Set while a `<PreviewCard.Viewport>` morphs content. |

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
| `data-instant`              | Present when animations should be instant. Value is `'dismiss'` or `'focus'`.                                                                                                                     |
| `data-starting-style`       | Applied to the `data-current` wrapper while the incoming content is animating in.                                                                                                                 |
| `data-ending-style`         | Applied to the `data-previous` wrapper while the outgoing content is animating out.                                                                                                               |

| CSS Variable     | Description                                                                                                                          |
| :--------------- | :----------------------------------------------------------------------------------------------------------------------------------- |
| `--popup-width`  | Width of the outgoing popup content, set on the `data-previous` container. Use it to freeze the popup size while the content morphs. |
| `--popup-height` | Height of the outgoing popup content, set on the `data-previous` container.                                                          |

Set `width: var(--positioner-width)` and `height: var(--positioner-height)` on the `Positioner` so its box is frozen to the measured size during the transition; otherwise content-driven resizing can make the popup thrash or flip to another side.

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

## Handle

Connects a `<PreviewCard.Root>` with detached `<PreviewCard.Trigger>` components, and controls the preview card imperatively. Pass a type argument to type the `payload`.

```ts
const previewCard = new PreviewCard.Handle<Payload>()
```

::table{columns="Member,Type"}

| Member            | Type                   | Description                                                              |
| :---------------- | :--------------------- | :----------------------------------------------------------------------- |
| `isOpen`          | `boolean`              | Whether the preview card is currently open (readonly).                   |
| `open(triggerId)` | `(id: string) => void` | Opens the preview card, associating it with the trigger of the given ID. |
| `close()`         | `() => void`           | Closes the preview card.                                                 |

::
