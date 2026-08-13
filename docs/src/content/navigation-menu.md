# Navigation Menu

A navigation menu with floating panels.

:demo{name="navigation-menu/hero"}

## Anatomy

```svelte title="Anatomy"
<script>
  import { NavigationMenu } from '@shardsui/svelte/navigation-menu'
</script>

<NavigationMenu.Root>
  <NavigationMenu.List>
    <NavigationMenu.Item>
      <NavigationMenu.Trigger>
        <NavigationMenu.Icon />
      </NavigationMenu.Trigger>
      <NavigationMenu.Content>
        <NavigationMenu.Link />
      </NavigationMenu.Content>
    </NavigationMenu.Item>
  </NavigationMenu.List>

  <NavigationMenu.Portal>
    <NavigationMenu.Backdrop />
    <NavigationMenu.Positioner>
      <NavigationMenu.Popup>
        <NavigationMenu.Arrow />
        <NavigationMenu.Viewport />
      </NavigationMenu.Popup>
    </NavigationMenu.Positioner>
  </NavigationMenu.Portal>
</NavigationMenu.Root>
```

## Examples

### Nested submenus

Nest a `<NavigationMenu.Root>` inside a `<NavigationMenu.Content>` for a second level. The nested root brings its own `Portal`, `Positioner` and `Viewport`, so the submenu floats free of the parent panel.

:demo{name="navigation-menu/nested"}

### Nested inline submenus

For second-level navigation that stays inside the same panel, give the nested root only a `List` and a `Viewport` — no `Portal` or `Positioner` — and seed the open submenu with `value`.

:demo{name="navigation-menu/nested-inline"}

### Custom links

`<NavigationMenu.Link>` renders an `<a>`, so SvelteKit's router intercepts its `href` for client-side navigation — no wrapper component needed.

```svelte title="Custom link"
<NavigationMenu.Link href="/docs">Docs</NavigationMenu.Link>
```

SvelteKit link attributes, such as preloading, pass straight through:

```svelte title="Preloading on hover"
<!-- [!code word:data-sveltekit-preload-data] -->
<NavigationMenu.Link href="/docs" data-sveltekit-preload-data="hover">Docs</NavigationMenu.Link>
```

The menu stays open after a link is clicked; add `closeOnClick` to dismiss it on navigation.

### Large menus

When a panel is taller than the space below its trigger, cap it against `--available-height` so it shrinks instead of overflowing:

```css title="Compact layout"
.content,
.popup {
  max-height: var(--available-height);
}
```

That only works if the content can compress. When it can't, let it scroll:

```css title="Scrollable layout"
.content,
.popup {
  max-height: var(--available-height);
}

.content {
  overflow-y: auto;
}
```

Native scrollbars stay visible while the panel transitions, so [Scroll Area](/svelte/scroll-area) is the better fit here — it keeps the scrollbars hidden and lets the `Arrow` stay centered.

## API reference

### Root

Groups all parts of the navigation menu.
Renders a `<nav>` element at the root, or a `<div>` element when nested.

::table{columns="Prop,Type,Default"}

| Prop                   | Type                          | Default        | Description                                                                     |
| :--------------------- | :---------------------------- | :------------- | :------------------------------------------------------------------------------ |
| `as`                   | `keyof HTMLElementTagNameMap` | `'nav'`        | HTML element to render. Renders `'div'` when nested.                            |
| `class`                | `string`                      | —              | CSS class applied to the element.                                               |
| `style`                | `string`                      | —              | Inline style applied to the element.                                            |
| `value`                | `unknown`                     | `null`         | Value of the item whose content is open, `null` when closed (use `bind:value`). |
| `onValueChange`        | `(value: unknown) => void`    | —              | Fires when the open item changes.                                               |
| `delay`                | `number`                      | `50`           | How long the pointer must rest on a trigger before it opens, in ms.             |
| `closeDelay`           | `number`                      | `50`           | How long the menu stays open after the pointer leaves, in ms.                   |
| `orientation`          | `'horizontal' \| 'vertical'`  | `'horizontal'` | Which arrow keys move focus through the list and open a trigger.                |
| `onOpenChangeComplete` | `(open: boolean) => void`     | —              | Fires after the open/close animation completes.                                 |
| `children`             | `Snippet<[{ open, nested }]>` | —              | Content; receives the navigation menu state.                                    |

::

| Attribute     | Description                                             |
| :------------ | :------------------------------------------------------ |
| `data-nested` | Present when this navigation menu is nested in another. |
| `data-open`   | Present when a menu panel is open.                      |

### List

Contains a list of navigation menu items.
Renders a `<ul>` element.

::table{columns="Prop,Type,Default"}

| Prop       | Type                          | Default | Description                          |
| :--------- | :---------------------------- | :------ | :----------------------------------- |
| `as`       | `keyof HTMLElementTagNameMap` | `'ul'`  | HTML element to render.              |
| `class`    | `string`                      | —       | CSS class applied to the element.    |
| `style`    | `string`                      | —       | Inline style applied to the element. |
| `children` | `Snippet<[{ open }]>`         | —       | Content; receives the list state.    |

::

| Attribute   | Description                        |
| :---------- | :--------------------------------- |
| `data-open` | Present when a menu panel is open. |

### Item

An individual navigation menu item.
Renders a `<li>` element.

::table{columns="Prop,Type,Default"}

| Prop       | Type                          | Default        | Description                          |
| :--------- | :---------------------------- | :------------- | :----------------------------------- |
| `as`       | `keyof HTMLElementTagNameMap` | `'li'`         | HTML element to render.              |
| `class`    | `string`                      | —              | CSS class applied to the element.    |
| `style`    | `string`                      | —              | Inline style applied to the element. |
| `value`    | `unknown`                     | auto-generated | Identifies this item in `value`.     |
| `children` | `Snippet`                     | —              | Content.                             |

::

### Trigger

Opens its item's content on hover or click.
Renders a `<button>` element.

::table{columns="Prop,Type,Default"}

| Prop       | Type                          | Default    | Description                                                           |
| :--------- | :---------------------------- | :--------- | :-------------------------------------------------------------------- |
| `as`       | `keyof HTMLElementTagNameMap` | `'button'` | HTML element to render.                                               |
| `class`    | `string`                      | —          | CSS class applied to the element.                                     |
| `style`    | `string`                      | —          | Inline style applied to the element.                                  |
| `disabled` | `boolean`                     | `false`    | Disables the trigger; it stays focusable and reports `aria-disabled`. |
| `children` | `Snippet<[{ open }]>`         | —          | Content; receives the trigger state.                                  |

::

| Attribute         | Description                                                          |
| :---------------- | :------------------------------------------------------------------- |
| `data-popup-open` | Present while this item's content is showing.                        |
| `data-pressed`    | Present alongside `data-popup-open`, however the content was opened. |

### Icon

An icon that indicates that the trigger button opens a menu.
Renders a `<span>` element, hidden from assistive technology, falling back to a `▼` glyph when given no children.

::table{columns="Prop,Type,Default"}

| Prop       | Type                          | Default  | Description                          |
| :--------- | :---------------------------- | :------- | :----------------------------------- |
| `as`       | `keyof HTMLElementTagNameMap` | `'span'` | HTML element to render.              |
| `class`    | `string`                      | —        | CSS class applied to the element.    |
| `style`    | `string`                      | —        | Inline style applied to the element. |
| `children` | `Snippet<[{ open }]>`         | —        | Content; receives the icon state.    |

::

| Attribute         | Description                                   |
| :---------------- | :-------------------------------------------- |
| `data-popup-open` | Present while this item's content is showing. |

### Content

The panel for an item, rendered inside `<NavigationMenu.Viewport>` while that item is active.
Renders a `<div>` element.

::table{columns="Prop,Type,Default"}

| Prop          | Type                                                         | Default | Description                                              |
| :------------ | :----------------------------------------------------------- | :------ | :------------------------------------------------------- |
| `as`          | `keyof HTMLElementTagNameMap`                                | `'div'` | HTML element to render.                                  |
| `class`       | `string`                                                     | —       | CSS class applied to the element.                        |
| `style`       | `string`                                                     | —       | Inline style applied to the element.                     |
| `keepMounted` | `boolean`                                                    | `false` | Keeps the panel mounted while inactive, rendered hidden. |
| `children`    | `Snippet<[{ open, transitionStatus, activationDirection }]>` | —       | Content; receives the content state.                     |

::

| Attribute                   | Description                                                                     |
| :-------------------------- | :------------------------------------------------------------------------------ |
| `data-open`                 | Present when this item's content is showing.                                    |
| `data-closed`               | Present when it is not.                                                         |
| `data-activation-direction` | Direction the newly activated trigger sits in: `left`, `right`, `up` or `down`. |
| `data-starting-style`       | Present when the content is animating in.                                       |
| `data-ending-style`         | Present when the content is animating out.                                      |

### Link

A link to another page or section.
Renders an `<a>` element.

::table{columns="Prop,Type,Default"}

| Prop           | Type                          | Default | Description                                                     |
| :------------- | :---------------------------- | :------ | :-------------------------------------------------------------- |
| `as`           | `keyof HTMLElementTagNameMap` | `'a'`   | HTML element to render.                                         |
| `class`        | `string`                      | —       | CSS class applied to the element.                               |
| `style`        | `string`                      | —       | Inline style applied to the element.                            |
| `href`         | `string`                      | —       | Destination of the link.                                        |
| `active`       | `boolean`                     | `false` | Marks the link as the current page; sets `aria-current="page"`. |
| `closeOnClick` | `boolean`                     | `false` | Closes the menu when the link is clicked.                       |
| `children`     | `Snippet<[{ active }]>`       | —       | Content; receives the link state.                               |

::

| Attribute     | Description                                         |
| :------------ | :-------------------------------------------------- |
| `data-active` | Present when the link is the currently active page. |

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
| `data-open`           | Present when the popup is open.             |
| `data-closed`         | Present when the popup is closed.           |
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

Positions the navigation menu against the currently active trigger.
Renders a `<div>` element.

::table{columns="Prop,Type,Default"}

| Prop                    | Type                                                                       | Default                                                                             | Description                                                       |
| :---------------------- | :------------------------------------------------------------------------- | :---------------------------------------------------------------------------------- | :---------------------------------------------------------------- |
| `as`                    | `keyof HTMLElementTagNameMap`                                              | `'div'`                                                                             | HTML element to render.                                           |
| `class`                 | `string`                                                                   | —                                                                                   | CSS class applied to the element.                                 |
| `style`                 | `string`                                                                   | —                                                                                   | Inline style applied to the element.                              |
| `side`                  | `'top' \| 'bottom' \| 'left' \| 'right' \| 'inline-start' \| 'inline-end'` | `'bottom'`                                                                          | Side to position the popup on.                                    |
| `align`                 | `'start' \| 'center' \| 'end'`                                             | `'center'`                                                                          | Alignment of the popup along the side.                            |
| `sideOffset`            | `number \| OffsetFunction`                                                 | `0`                                                                                 | Distance in px from the anchor.                                   |
| `alignOffset`           | `number \| OffsetFunction`                                                 | `0`                                                                                 | Offset in px along the alignment axis.                            |
| `collisionBoundary`     | `'clipping-ancestors' \| Element \| Element[] \| Rect`                     | `'clipping-ancestors'`                                                              | Boundary for collision detection.                                 |
| `collisionPadding`      | `number \| Padding`                                                        | `5`                                                                                 | Padding around the collision boundary.                            |
| `collisionAvoidance`    | `CollisionAvoidance`                                                       | `{ fallbackAxisSide: 'end' }` when nested, `{ fallbackAxisSide: 'none' }` otherwise | Strategy to avoid collisions.                                     |
| `sticky`                | `boolean`                                                                  | `false`                                                                             | Whether to keep the popup in view when the anchor is scrolled.    |
| `arrowPadding`          | `number`                                                                   | `5`                                                                                 | Padding between the arrow and the popup edges.                    |
| `disableAnchorTracking` | `boolean`                                                                  | `false`                                                                             | Whether to disable tracking of the anchor's position as it moves. |
| `anchor`                | `Element \| VirtualAnchorElement \| null`                                  | active trigger                                                                      | Element to anchor the positioner to.                              |
| `positionMethod`        | `'absolute' \| 'fixed'`                                                    | `'absolute'`                                                                        | CSS position strategy to use.                                     |
| `children`              | `Snippet<[{ open, side, align, anchorHidden, instant }]>`                  | —                                                                                   | Content; receives the positioner state.                           |

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
| `--positioner-width`  | The current panel's width in pixels. Set for as long as the navigation menu is open.  |
| `--positioner-height` | The current panel's height in pixels. Set for as long as the navigation menu is open. |

### Popup

A container for the navigation menu contents.
Renders a `<nav>` element.

::table{columns="Prop,Type,Default"}

| Prop       | Type                                                               | Default | Description                          |
| :--------- | :----------------------------------------------------------------- | :------ | :----------------------------------- |
| `as`       | `keyof HTMLElementTagNameMap`                                      | `'nav'` | HTML element to render.              |
| `class`    | `string`                                                           | —       | CSS class applied to the element.    |
| `style`    | `string`                                                           | —       | Inline style applied to the element. |
| `id`       | `string`                                                           | auto    | Custom element ID.                   |
| `children` | `Snippet<[{ open, transitionStatus, side, align, anchorHidden }]>` | —       | Content; receives the popup state.   |

::

| Attribute             | Description                                    |
| :-------------------- | :--------------------------------------------- |
| `data-open`           | Present when the popup is open.                |
| `data-closed`         | Present when the popup is closed.              |
| `data-anchor-hidden`  | Present when the anchor is hidden.             |
| `data-align`          | How the popup is aligned relative to the side. |
| `data-side`           | Which side of the anchor the popup is on.      |
| `data-starting-style` | Present when the popup is animating in.        |
| `data-ending-style`   | Present when the popup is animating out.       |

| CSS Variable     | Description                                                                                                                                                 |
| :--------------- | :---------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `--popup-width`  | The popup element's width: a pixel value while `<NavigationMenu.Viewport>` morphs between panels and again while the popup closes, `auto` once it settles.  |
| `--popup-height` | The popup element's height: a pixel value while `<NavigationMenu.Viewport>` morphs between panels and again while the popup closes, `auto` once it settles. |

### Viewport

The clipping viewport of the navigation menu's current content.
Renders a `<div>` element.

::table{columns="Prop,Type,Default"}

| Prop       | Type                          | Default | Description                                  |
| :--------- | :---------------------------- | :------ | :------------------------------------------- |
| `as`       | `keyof HTMLElementTagNameMap` | `'div'` | HTML element to render.                      |
| `class`    | `string`                      | —       | CSS class applied to the element.            |
| `style`    | `string`                      | —       | Inline style applied to the element.         |
| `id`       | `string`                      | auto    | Custom element ID.                           |
| `children` | `Snippet`                     | —       | Content rendered alongside the active panel. |

::

The active `<NavigationMenu.Content>` is rendered here, along with the previous one while it
animates out. Both carry the data attributes listed under [Content](#api-reference-content).

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
