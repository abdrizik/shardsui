# Context Menu

A right-click menu.

:demo{name="context-menu/hero"}

## Anatomy

```svelte title="Anatomy"
<script>
  import { ContextMenu } from '@shardsui/svelte/context-menu'
</script>

<ContextMenu.Root>
  <ContextMenu.Trigger />
  <ContextMenu.Portal>
    <ContextMenu.Backdrop />
    <ContextMenu.Positioner>
      <ContextMenu.Popup>
        <ContextMenu.Arrow />
        <ContextMenu.Item />
        <ContextMenu.LinkItem />
        <ContextMenu.Separator />
        <ContextMenu.SubmenuRoot>
          <ContextMenu.SubmenuTrigger />
        </ContextMenu.SubmenuRoot>
        <ContextMenu.Group>
          <ContextMenu.GroupLabel />
        </ContextMenu.Group>
        <ContextMenu.RadioGroup>
          <ContextMenu.RadioItem>
            <ContextMenu.RadioItemIndicator />
          </ContextMenu.RadioItem>
        </ContextMenu.RadioGroup>
        <ContextMenu.CheckboxItem>
          <ContextMenu.CheckboxItemIndicator />
        </ContextMenu.CheckboxItem>
      </ContextMenu.Popup>
    </ContextMenu.Positioner>
  </ContextMenu.Portal>
</ContextMenu.Root>
```

Most parts (`Backdrop`, `Popup`, `Item`, etc.) are re-exported from the [Menu](/svelte/menu) component, so they share the same props and data attributes. `Positioner` is the exception: its `align`, offset, `arrowPadding` and `positionMethod` defaults follow the pointer instead of a trigger element, and are documented below.

## Usage guidelines

- **Use context menus as an enhancement**: they may be undiscoverable on touch devices or with assistive technology, so always pair them with a visible control for the same actions.

## Examples

The [Menu](/svelte/menu#examples) page has more demos — most of its patterns carry over to the context menu.

### Using with Menu

A context menu should supplement a primary way to perform the same actions. This image card exposes actions through a visible menu button and reuses them in the context menu for right-click and long-press users.

:demo{name="context-menu/with-menu"}

### Nested menu

Nest `<ContextMenu.SubmenuRoot>` inside the popup to create a submenu, and use `<ContextMenu.SubmenuTrigger>` for the menu item that opens the nested menu.

:demo{name="context-menu/submenu"}

## API reference

### Root

Opens on right click or long press.
Doesn't render its own HTML element.

::table{columns="Prop,Type,Default"}

| Prop                   | Type                         | Default      | Description                                                                                                                                                             |
| :--------------------- | :--------------------------- | :----------- | :---------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `open`                 | `boolean`                    | `false`      | Open state. Use `bind:open`.                                                                                                                                            |
| `disabled`             | `boolean`                    | `false`      | Whether the component should ignore user interaction.                                                                                                                   |
| `onOpenChange`         | `(open: boolean) => void`    | —            | Event handler called when the menu is opened or closed.                                                                                                                 |
| `onOpenChangeComplete` | `(open: boolean) => void`    | —            | Event handler called after any animations complete when the menu is opened or closed.                                                                                   |
| `loopFocus`            | `boolean`                    | `true`       | Whether to loop keyboard focus back to the first item when the end of the list is reached while using the arrow keys.                                                   |
| `orientation`          | `'horizontal' \| 'vertical'` | `'vertical'` | The visual orientation of the menu. Controls whether the roving tabindex uses up/down or left/right arrow keys.                                                         |
| `highlightItemOnHover` | `boolean`                    | `true`       | Whether moving the pointer over items should highlight them. Disabling this prop allows CSS `:hover` to be differentiated from the `:focus` (`data-highlighted`) state. |
| `children`             | `Snippet`                    | —            | Content.                                                                                                                                                                |

::

### Trigger

An area that opens the menu on right click or long press.
Renders a `<div>` element.

::table{columns="Prop,Type,Default"}

| Prop       | Type                          | Default | Description                                         |
| :--------- | :---------------------------- | :------ | :-------------------------------------------------- |
| `as`       | `keyof HTMLElementTagNameMap` | `'div'` | HTML element to render.                             |
| `class`    | `string`                      | —       | CSS class applied to the element.                   |
| `style`    | `string`                      | —       | Inline style applied to the element.                |
| `children` | `Snippet<[{ open }]>`         | —       | Content; receives whether the context menu is open. |

::

| Attribute         | Description                            |
| :---------------- | :------------------------------------- |
| `data-popup-open` | Present when the context menu is open. |
| `data-pressed`    | Present when the menu is open.         |

### Positioner

Positions the context menu popup at the press point.
Renders a `<div>` element.

::table{columns="Prop,Type,Default"}

| Prop                    | Type                                                                       | Default                                                  | Description                                                                      |
| :---------------------- | :------------------------------------------------------------------------- | :------------------------------------------------------- | :------------------------------------------------------------------------------- |
| `as`                    | `keyof HTMLElementTagNameMap`                                              | `'div'`                                                  | HTML element to render.                                                          |
| `class`                 | `string`                                                                   | —                                                        | CSS class applied to the element.                                                |
| `style`                 | `string`                                                                   | —                                                        | Inline style applied to the element.                                             |
| `side`                  | `'top' \| 'bottom' \| 'left' \| 'right' \| 'inline-start' \| 'inline-end'` | `'bottom'`                                               | Side to position the popup on.                                                   |
| `align`                 | `'start' \| 'center' \| 'end'`                                             | `'start'`                                                | Alignment of the popup along the side.                                           |
| `sideOffset`            | `number \| OffsetFunction`                                                 | `-5`, or `0` once `side` is set or `align` is `'center'` | Distance in px from the anchor.                                                  |
| `alignOffset`           | `number \| OffsetFunction`                                                 | `2`, or `0` once `side` is set or `align` is `'center'`  | Offset in px along the alignment axis.                                           |
| `collisionBoundary`     | `'clipping-ancestors' \| Element \| Element[] \| Rect`                     | `'clipping-ancestors'`                                   | Boundary for collision detection.                                                |
| `collisionPadding`      | `number \| Padding`                                                        | `5`                                                      | Padding around the collision boundary.                                           |
| `collisionAvoidance`    | `CollisionAvoidance`                                                       | `{ fallbackAxisSide: 'none' }`                           | Strategy to avoid collisions.                                                    |
| `sticky`                | `boolean`                                                                  | `false`                                                  | Whether to keep the popup in view when the anchor is scrolled.                   |
| `arrowPadding`          | `number`                                                                   | `0`                                                      | Padding between the arrow and the popup edges. Always `0` inside a context menu. |
| `disableAnchorTracking` | `boolean`                                                                  | `false`                                                  | Whether to disable tracking of the anchor's position as it moves.                |
| `anchor`                | `Element \| VirtualAnchorElement \| null`                                  | press point                                              | Element to anchor the positioner to.                                             |
| `positionMethod`        | `'absolute' \| 'fixed'`                                                    | `'fixed'`                                                | CSS position strategy. Always `'fixed'` inside a context menu.                   |
| `children`              | `Snippet<[{ open, side, align, anchorHidden, nested, instant }]>`          | —                                                        | Content; receives the positioner state.                                          |

::

| Attribute            | Description                                    |
| :------------------- | :--------------------------------------------- |
| `data-open`          | Present when the popup is open.                |
| `data-closed`        | Present when the popup is closed.              |
| `data-side`          | Which side of the anchor the popup is on.      |
| `data-align`         | How the popup is aligned relative to the side. |
| `data-anchor-hidden` | Present when the anchor is hidden.             |
| `data-instant`       | Present when animations should be instant.     |
| `data-nested`        | Present when the menu is a submenu.            |

| CSS Variable         | Description                                                  |
| :------------------- | :----------------------------------------------------------- |
| `--available-width`  | Available width between the anchor and the viewport edge.    |
| `--available-height` | Available height between the anchor and the viewport edge.   |
| `--anchor-width`     | Width of the press point (`0`, or `10` after a long press).  |
| `--anchor-height`    | Height of the press point (`0`, or `10` after a long press). |
| `--transform-origin` | Transform origin for scale animations.                       |

### Other parts

`Portal`, `Backdrop`, `Popup`, `Arrow`, `Item`, `LinkItem`, `Group`, `GroupLabel`, `RadioGroup`, `RadioItem`, `RadioItemIndicator`, `CheckboxItem`, `CheckboxItemIndicator`, `SubmenuRoot`, `SubmenuTrigger`, `Separator` — see [Menu](/svelte/menu) for their props and data attributes.
