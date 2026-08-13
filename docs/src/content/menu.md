# Menu

A menu of actions.

:demo{name="menu/hero"}

## Anatomy

```svelte title="Anatomy"
<script>
  import { Menu } from '@shardsui/svelte/menu'
</script>

<Menu.Root>
  <Menu.Trigger />
  <Menu.Portal>
    <Menu.Backdrop />
    <Menu.Positioner>
      <Menu.Popup>
        <Menu.Arrow />
        <Menu.Item />
        <Menu.LinkItem />
        <Menu.Separator />

        <Menu.SubmenuRoot>
          <Menu.SubmenuTrigger />
        </Menu.SubmenuRoot>

        <Menu.Group>
          <Menu.GroupLabel />
        </Menu.Group>

        <Menu.RadioGroup>
          <Menu.GroupLabel />
          <Menu.RadioItem>
            <Menu.RadioItemIndicator />
          </Menu.RadioItem>
        </Menu.RadioGroup>

        <Menu.CheckboxItem>
          <Menu.CheckboxItemIndicator />
        </Menu.CheckboxItem>

        <Menu.Viewport />
      </Menu.Popup>
    </Menu.Positioner>
  </Menu.Portal>
</Menu.Root>
```

## Examples

### Open on hover

Add the `openOnHover` prop to `<Menu.Trigger>` to open the menu on pointer hover. Tune the timing with `delay` (how long the pointer must rest before it opens) and `closeDelay` (how long it lingers after the pointer leaves), both in milliseconds.

:demo{name="menu/open-on-hover"}

### Checkbox items

`<Menu.CheckboxItem>` renders a menu item that toggles a setting on or off.

:demo{name="menu/checkbox-items"}

### Radio items

`<Menu.RadioGroup>` and `<Menu.RadioItem>` turn a set of items into mutually exclusive choices, like radio buttons.

:demo{name="menu/radio-items"}

### Close on click

Set `closeOnClick` to decide whether clicking an item dismisses the menu.

```svelte title="Control whether the menu closes on click"
<!-- Close the menu when a checkbox item is clicked -->
<Menu.CheckboxItem closeOnClick />

<!-- Keep the menu open when an item is clicked -->
<Menu.Item closeOnClick={false} />
```

### Group labels

`<Menu.GroupLabel>` gives a `<Menu.Group>` or `<Menu.RadioGroup>` a heading.

:demo{name="menu/group-labels"}

### Nested menu

Nest another menu inside the current one with `<Menu.SubmenuRoot>`, and mark the item that opens it with `<Menu.SubmenuTrigger>`.

```svelte title="Adding a submenu"
<Menu.Root>
  <Menu.Trigger />
  <Menu.Portal>
    <Menu.Positioner>
      <Menu.Popup>
        <Menu.Arrow />
        <Menu.Item />

        <!-- [!code highlight:11] -->
        <!-- Submenu -->
        <Menu.SubmenuRoot>
          <Menu.SubmenuTrigger />
          <Menu.Positioner>
            <Menu.Popup>
              <!-- Submenu items -->
            </Menu.Popup>
          </Menu.Positioner>
        </Menu.SubmenuRoot>
      </Menu.Popup>
    </Menu.Positioner>
  </Menu.Portal>
</Menu.Root>
```

:demo{name="menu/submenu"}

### Navigate to another page

`<Menu.LinkItem>` renders a menu item as a link.

```svelte title="A menu item that opens a link"
<Menu.LinkItem href="/projects">Go to Projects</Menu.LinkItem>
```

### Open a dialog

To open a dialog from a menu, hold the dialog's open state yourself and flip it from the item's `onclick` handler.

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
<Dialog.Root bind:open={dialogOpen}>
  <Dialog.Portal>
    <Dialog.Backdrop />
    <Dialog.Popup>
      <!-- Rest of the dialog -->
    </Dialog.Popup>
  </Dialog.Portal>
</Dialog.Root>
```

### Detached triggers

A menu's trigger can sit inside `<Menu.Root>` (as in the hero demo above) or somewhere else entirely. When the trigger and the menu content belong in different parts of the tree, create a `handle` with `new Menu.Handle()` and pass it to both the trigger and the root.

Only top-level menus support detached triggers; a submenu's trigger always stays inside its `SubmenuRoot`.

```svelte title="Detached triggers"
<!-- [!code word:handle={demoMenu}] -->
<script>
  import { Menu } from '@shardsui/svelte/menu'

  const demoMenu = new Menu.Handle()
</script>

<!-- [!code highlight] -->
<Menu.Trigger handle={demoMenu}>Actions</Menu.Trigger>

<!-- [!code highlight] -->
<Menu.Root handle={demoMenu}>
  <Menu.Portal>
    <Menu.Positioner>
      <Menu.Popup>
        <Menu.Item>Edit</Menu.Item>
        <Menu.Item>Share</Menu.Item>
      </Menu.Popup>
    </Menu.Positioner>
  </Menu.Portal>
</Menu.Root>
```

:demo{name="menu/detached-triggers-simple"}

### Multiple triggers

Several triggers can open the same menu. Render more than one `<Menu.Trigger>` inside a single `<Menu.Root>`, or point several detached triggers at the same `handle`.

```svelte title="Multiple triggers within the Root part"
<Menu.Root>
  <Menu.Trigger>Row actions</Menu.Trigger>
  <Menu.Trigger>Quick actions</Menu.Trigger>
  <!-- Rest of the menu -->
</Menu.Root>
```

```svelte title="Multiple detached triggers"
<script>
  const projectMenu = new Menu.Handle()
</script>

<Menu.Trigger handle={projectMenu}>Row actions</Menu.Trigger>
<Menu.Trigger handle={projectMenu}>Quick actions</Menu.Trigger>

<Menu.Root handle={projectMenu}>
  <!-- Rest of the menu -->
</Menu.Root>
```

A menu can show different content depending on which trigger opened it. Give each `<Menu.Trigger>` a `payload` prop and read it from the `payload` argument of `<Menu.Root>`'s `children` snippet (typed by the handle's type argument).

```svelte title="Detached triggers with payload"
<!-- [!code word:payload] -->
<script>
  import { Menu } from '@shardsui/svelte/menu'

  const menus = {
    course: ['Rename', 'Duplicate', 'Archive'],
    lesson: ['Add note', 'Bookmark', 'Share']
  }

  // [!code highlight]
  const demoMenu = new Menu.Handle<keyof typeof menus>()
</script>

<!-- [!code highlight] -->
<Menu.Trigger handle={demoMenu} payload={'course'}>Course</Menu.Trigger>
<!-- [!code highlight] -->
<Menu.Trigger handle={demoMenu} payload={'lesson'}>Lesson</Menu.Trigger>

<Menu.Root handle={demoMenu}>
  {#snippet children({ payload })}
    <Menu.Portal>
      <Menu.Positioner>
        <Menu.Popup>
          <Menu.Viewport>
            {#if payload}
              {#each menus[payload] as item}
                <Menu.Item>{item}</Menu.Item>
              {/each}
            {/if}
          </Menu.Viewport>
        </Menu.Popup>
      </Menu.Positioner>
    </Menu.Portal>
  {/snippet}
</Menu.Root>
```

### Controlled mode with multiple triggers

Drive the open state yourself with `open` and `onOpenChange` on `<Menu.Root>`. With several triggers, track the active one through `bind:triggerId` on `<Menu.Root>` and a matching `id` on each `<Menu.Trigger>`: the binding follows whichever trigger opened the menu, and writing an id to it selects that trigger.

:demo{name="menu/detached-triggers-controlled"}

### Arrow

`<Menu.Arrow>` renders an arrow inside the popup that points at the trigger.

:demo{name="menu/arrow"}

### Animating the Menu

When several detached triggers share one menu, you can animate its position, size, and content as it travels between them.

#### Position and Size

For position, transition the `left`, `right`, `top`, and `bottom` properties of the **Positioner** part. For size, transition the `width` and `height` of the **Popup** part.

#### Content

When different triggers swap what the menu shows, wrap the content in a `<Menu.Viewport>` to animate the change. It renders a `div` carrying `data-activation-direction` — space-separated horizontal (`left` or `right`) and vertical (`up` or `down`) values such as `right down` — so your animation can lean toward the direction of travel.

Within `<Menu.Viewport>`, each piece of content sits in a `div` tagged with a transition data attribute:

- `data-current`: the content on screen when nothing is transitioning, or the incoming content during one.
- `data-previous`: the outgoing content during a transition.

:demo{name="menu/detached-triggers-full"}

## API reference

### Root

Groups all parts of the menu.
Doesn't render its own HTML element.

::table{columns="Prop,Type,Default"}

| Prop                   | Type                         | Default      | Description                                                                                                                                 |
| :--------------------- | :--------------------------- | :----------- | :------------------------------------------------------------------------------------------------------------------------------------------ |
| `open`                 | `boolean`                    | `false`      | Open state. Use `bind:open`.                                                                                                                |
| `disabled`             | `boolean`                    | `false`      | Whether the menu is disabled.                                                                                                               |
| `modal`                | `boolean`                    | `true`       | Whether the menu is modal. Forced `false` for a submenu or a menu nested under a Menubar, and suppressed while the menu is open from hover. |
| `loopFocus`            | `boolean`                    | `true`       | Whether focus loops back around.                                                                                                            |
| `orientation`          | `'horizontal' \| 'vertical'` | `'vertical'` | Orientation of the menu list. Mirrored on the popup's `aria-orientation`.                                                                   |
| `highlightItemOnHover` | `boolean`                    | `true`       | Whether items are highlighted on hover.                                                                                                     |
| `handle`               | `Menu.Handle`                | —            | Handle from `new Menu.Handle()` for detached triggers.                                                                                      |
| `triggerId`            | `string \| null`             | `null`       | ID of the active trigger. Bindable; with multiple triggers it tracks whichever one opened the menu.                                         |
| `onOpenChange`         | `(open: boolean) => void`    | —            | Callback when the open state changes.                                                                                                       |
| `onOpenChangeComplete` | `(open: boolean) => void`    | —            | Callback when the open/close animation completes.                                                                                           |
| `closeParentOnEsc`     | `boolean`                    | `false`      | Whether pressing Escape closes the parent menu. Submenus only.                                                                              |
| `children`             | `Snippet<[{ payload }]>`     | —            | Menu content; receives the active trigger's `payload`.                                                                                      |

::

### Trigger

A button that opens the menu.
Renders a `<button>` element.

::table{columns="Prop,Type,Default"}

| Prop          | Type                            | Default    | Description                                                                                                 |
| :------------ | :------------------------------ | :--------- | :---------------------------------------------------------------------------------------------------------- |
| `as`          | `keyof HTMLElementTagNameMap`   | `'button'` | HTML element to render.                                                                                     |
| `class`       | `string`                        | —          | CSS class applied to the element.                                                                           |
| `style`       | `string`                        | —          | Inline style applied to the element.                                                                        |
| `disabled`    | `boolean`                       | `false`    | Whether the trigger is disabled.                                                                            |
| `openOnHover` | `boolean`                       | `false`    | Whether the menu opens on hover. Inside a `<Menubar>` with a sibling menu already open, defaults to `true`. |
| `delay`       | `number`                        | `100`      | Delay in ms before opening on hover.                                                                        |
| `closeDelay`  | `number`                        | `0`        | Delay in ms before closing on hover.                                                                        |
| `handle`      | `Menu.Handle`                   | —          | Handle for detached triggers (trigger lives outside Root).                                                  |
| `payload`     | `Payload`                       | —          | Data passed to the `<Menu.Root>` children snippet when this trigger opens the menu.                         |
| `id`          | `string`                        | auto       | Custom element ID.                                                                                          |
| `children`    | `Snippet<[{ disabled, open }]>` | —          | Trigger content; receives the trigger's state.                                                              |

::

| Attribute         | Description                                               |
| :---------------- | :-------------------------------------------------------- |
| `data-popup-open` | Present when the menu is open and this trigger is active. |
| `data-pressed`    | Present when the menu is open and this trigger is active. |
| `data-disabled`   | Present when the trigger is disabled.                     |

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
| `data-open`           | Present when the menu is open.              |
| `data-closed`         | Present when the menu is closed.            |
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

::

### Positioner

Positions the menu popup against the trigger.
Renders a `<div>` element.

::table{columns="Prop,Type,Default"}

| Prop                    | Type                                                                       | Default                                                                              | Description                                                       |
| :---------------------- | :------------------------------------------------------------------------- | :----------------------------------------------------------------------------------- | :---------------------------------------------------------------- |
| `as`                    | `keyof HTMLElementTagNameMap`                                              | `'div'`                                                                              | HTML element to render.                                           |
| `class`                 | `string`                                                                   | —                                                                                    | CSS class applied to the element.                                 |
| `style`                 | `string`                                                                   | —                                                                                    | Inline style applied to the element.                              |
| `side`                  | `'top' \| 'bottom' \| 'left' \| 'right' \| 'inline-start' \| 'inline-end'` | `'bottom'`, or `'inline-end'` in a submenu or vertical menubar                       | Side to position the popup on.                                    |
| `align`                 | `'start' \| 'center' \| 'end'`                                             | `'center'`, or `'start'` in any parented menu                                        | Alignment of the popup along the side.                            |
| `sideOffset`            | `number \| OffsetFunction`                                                 | `0`                                                                                  | Distance in px from the anchor.                                   |
| `alignOffset`           | `number \| OffsetFunction`                                                 | `0`                                                                                  | Offset in px along the alignment axis.                            |
| `collisionBoundary`     | `'clipping-ancestors' \| Element \| Element[] \| Rect`                     | `'clipping-ancestors'`                                                               | Boundary for collision detection.                                 |
| `collisionPadding`      | `number \| Padding`                                                        | `5`                                                                                  | Padding around the collision boundary.                            |
| `collisionAvoidance`    | `CollisionAvoidance`                                                       | `{ fallbackAxisSide: 'end' }` in a submenu, `{ fallbackAxisSide: 'none' }` otherwise | Strategy to avoid collisions.                                     |
| `sticky`                | `boolean`                                                                  | `false`                                                                              | Whether to keep the popup in view when the anchor is scrolled.    |
| `arrowPadding`          | `number`                                                                   | `5`                                                                                  | Padding between the arrow and the popup edges.                    |
| `disableAnchorTracking` | `boolean`                                                                  | `false`                                                                              | Whether to disable tracking of the anchor's position as it moves. |
| `anchor`                | `Element \| VirtualAnchorElement \| null`                                  | trigger element                                                                      | Element to anchor the positioner to.                              |
| `positionMethod`        | `'absolute' \| 'fixed'`                                                    | `'absolute'`                                                                         | CSS position strategy to use.                                     |
| `children`              | `Snippet<[{ open, side, align, anchorHidden, nested, instant }]>`          | —                                                                                    | Positioner content; receives the positioner's state.              |

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

| CSS Variable          | Description                                                                    |
| :-------------------- | :----------------------------------------------------------------------------- |
| `--available-width`   | Available width between the anchor and the viewport edge.                      |
| `--available-height`  | Available height between the anchor and the viewport edge.                     |
| `--anchor-width`      | Width of the anchor element.                                                   |
| `--anchor-height`     | Height of the anchor element.                                                  |
| `--transform-origin`  | Transform origin for scale animations.                                         |
| `--positioner-width`  | The positioner element's width. Set while a `<Menu.Viewport>` morphs content.  |
| `--positioner-height` | The positioner element's height. Set while a `<Menu.Viewport>` morphs content. |

### Popup

A container for the menu items.
Renders a `<div>` element.

::table{columns="Prop,Type,Default"}

| Prop         | Type                                                                                   | Default | Description                                                                                                                    |
| :----------- | :------------------------------------------------------------------------------------- | :------ | :----------------------------------------------------------------------------------------------------------------------------- |
| `as`         | `keyof HTMLElementTagNameMap`                                                          | `'div'` | HTML element to render.                                                                                                        |
| `class`      | `string`                                                                               | —       | CSS class applied to the element.                                                                                              |
| `style`      | `string`                                                                               | —       | Inline style applied to the element.                                                                                           |
| `finalFocus` | `boolean \| HTMLElement \| ((type: string) => HTMLElement \| boolean \| null \| void)` | —       | Element to focus when the menu closes, or a function receiving the interaction type. `false` to skip; defaults to the trigger. |
| `id`         | `string`                                                                               | auto    | Custom element ID.                                                                                                             |
| `children`   | `Snippet<[{ transitionStatus, side, align, open, nested, instant }]>`                  | —       | Popup content; receives the popup's state.                                                                                     |

::

| Attribute             | Description                                    |
| :-------------------- | :--------------------------------------------- |
| `data-open`           | Present when the menu is open.                 |
| `data-closed`         | Present when the menu is closed.               |
| `data-side`           | Which side of the anchor the popup is on.      |
| `data-align`          | How the popup is aligned relative to the side. |
| `data-starting-style` | Present when the menu is animating in.         |
| `data-ending-style`   | Present when the menu is animating out.        |
| `data-instant`        | Present when animations should be instant.     |
| `data-nested`         | Present when the menu is a submenu.            |

| CSS Variable     | Description                                                               |
| :--------------- | :------------------------------------------------------------------------ |
| `--popup-width`  | The popup element's width. Set while a `<Menu.Viewport>` morphs content.  |
| `--popup-height` | The popup element's height. Set while a `<Menu.Viewport>` morphs content. |

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
| `data-starting-style`       | Applied to the `data-current` wrapper while the incoming content is animating in.                                                                                                                 |
| `data-ending-style`         | Applied to the `data-previous` wrapper while the outgoing content is animating out.                                                                                                               |
| `data-instant`              | Present when animations should be instant.                                                                                                                                                        |

| CSS Variable     | Description                                                                                                                          |
| :--------------- | :----------------------------------------------------------------------------------------------------------------------------------- |
| `--popup-width`  | Width of the outgoing popup content, set on the `data-previous` container. Use it to freeze the popup size while the content morphs. |
| `--popup-height` | Height of the outgoing popup content, set on the `data-previous` container.                                                          |

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

### Item

An individual interactive item in the menu.
Renders a `<div>` element.

::table{columns="Prop,Type,Default"}

| Prop           | Type                                   | Default | Description                                        |
| :------------- | :------------------------------------- | :------ | :------------------------------------------------- |
| `as`           | `keyof HTMLElementTagNameMap`          | `'div'` | HTML element to render.                            |
| `class`        | `string`                               | —       | CSS class applied to the element.                  |
| `style`        | `string`                               | —       | Inline style applied to the element.               |
| `disabled`     | `boolean`                              | `false` | Whether the item is disabled.                      |
| `closeOnClick` | `boolean`                              | `true`  | Whether the menu closes when this item is clicked. |
| `id`           | `string`                               | auto    | Custom element ID.                                 |
| `children`     | `Snippet<[{ highlighted, disabled }]>` | —       | Item content; receives the item's state.           |

::

| Attribute          | Description                           |
| :----------------- | :------------------------------------ |
| `data-highlighted` | Present when the item is highlighted. |
| `data-disabled`    | Present when the item is disabled.    |

### LinkItem

A link in the menu that can be used to navigate to a different page or section.
Renders an `<a>` element.

::table{columns="Prop,Type,Default"}

| Prop           | Type                          | Default | Description                                        |
| :------------- | :---------------------------- | :------ | :------------------------------------------------- |
| `as`           | `keyof HTMLElementTagNameMap` | `'a'`   | HTML element to render.                            |
| `href`         | `string`                      | —       | URL the link points to.                            |
| `class`        | `string`                      | —       | CSS class applied to the element.                  |
| `style`        | `string`                      | —       | Inline style applied to the element.               |
| `closeOnClick` | `boolean`                     | `false` | Whether the menu closes when this item is clicked. |
| `id`           | `string`                      | auto    | Custom element ID.                                 |
| `children`     | `Snippet<[{ highlighted }]>`  | —       | Item content; receives the item's state.           |

::

| Attribute          | Description                           |
| :----------------- | :------------------------------------ |
| `data-highlighted` | Present when the item is highlighted. |

### SubmenuRoot

Groups all parts of a submenu.
Doesn't render its own HTML element.

::table{columns="Prop,Type,Default"}

| Prop                   | Type                         | Default      | Description                                                                  |
| :--------------------- | :--------------------------- | :----------- | :--------------------------------------------------------------------------- |
| `open`                 | `boolean`                    | `false`      | Open state. Use `bind:open`.                                                 |
| `disabled`             | `boolean`                    | `false`      | Whether the submenu is disabled.                                             |
| `loopFocus`            | `boolean`                    | `true`       | Whether focus loops back around.                                             |
| `orientation`          | `'horizontal' \| 'vertical'` | `'vertical'` | Orientation of the submenu list. Mirrored on the popup's `aria-orientation`. |
| `onOpenChange`         | `(open: boolean) => void`    | —            | Callback when the open state changes.                                        |
| `onOpenChangeComplete` | `(open: boolean) => void`    | —            | Callback when the open/close animation completes.                            |
| `closeParentOnEsc`     | `boolean`                    | `false`      | Whether pressing Escape closes the parent menu.                              |
| `highlightItemOnHover` | `boolean`                    | `true`       | Whether items are highlighted on hover.                                      |
| `children`             | `Snippet`                    | —            | Content.                                                                     |

::

### SubmenuTrigger

A menu item that opens a submenu.
Renders a `<div>` element.

::table{columns="Prop,Type,Default"}

| Prop          | Type                                         | Default | Description                                         |
| :------------ | :------------------------------------------- | :------ | :-------------------------------------------------- |
| `as`          | `keyof HTMLElementTagNameMap`                | `'div'` | HTML element to render.                             |
| `class`       | `string`                                     | —       | CSS class applied to the element.                   |
| `style`       | `string`                                     | —       | Inline style applied to the element.                |
| `disabled`    | `boolean`                                    | `false` | Whether the trigger is disabled.                    |
| `openOnHover` | `boolean`                                    | `true`  | Whether the submenu opens on hover.                 |
| `delay`       | `number`                                     | `100`   | Delay in ms before the submenu opens on hover.      |
| `closeDelay`  | `number`                                     | `0`     | Delay in ms before the submenu closes on hover-out. |
| `id`          | `string`                                     | auto    | Custom element ID.                                  |
| `children`    | `Snippet<[{ disabled, highlighted, open }]>` | —       | Trigger content; receives the trigger's state.      |

::

| Attribute          | Description                              |
| :----------------- | :--------------------------------------- |
| `data-popup-open`  | Present when the submenu is open.        |
| `data-highlighted` | Present when the trigger is highlighted. |
| `data-disabled`    | Present when the trigger is disabled.    |

### Group

Groups related menu items with the corresponding label.
Renders a `<div>` element.

::table{columns="Prop,Type,Default"}

| Prop    | Type                          | Default | Description                          |
| :------ | :---------------------------- | :------ | :----------------------------------- |
| `as`    | `keyof HTMLElementTagNameMap` | `'div'` | HTML element to render.              |
| `class` | `string`                      | —       | CSS class applied to the element.    |
| `style` | `string`                      | —       | Inline style applied to the element. |

::

### GroupLabel

An accessible label that is automatically associated with its parent group.
Renders a `<div>` element.

::table{columns="Prop,Type,Default"}

| Prop    | Type                          | Default | Description                          |
| :------ | :---------------------------- | :------ | :----------------------------------- |
| `as`    | `keyof HTMLElementTagNameMap` | `'div'` | HTML element to render.              |
| `class` | `string`                      | —       | CSS class applied to the element.    |
| `style` | `string`                      | —       | Inline style applied to the element. |
| `id`    | `string`                      | auto    | Custom element ID.                   |

::

### RadioGroup

Groups related radio items, labelled by a nested `<Menu.GroupLabel>`.
Renders a `<div>` element.

::table{columns="Prop,Type,Default"}

| Prop            | Type                          | Default | Description                                |
| :-------------- | :---------------------------- | :------ | :----------------------------------------- |
| `as`            | `keyof HTMLElementTagNameMap` | `'div'` | HTML element to render.                    |
| `class`         | `string`                      | —       | CSS class applied to the element.          |
| `style`         | `string`                      | —       | Inline style applied to the element.       |
| `value`         | `unknown`                     | —       | Selected value. Use `bind:value`.          |
| `onValueChange` | `(value: unknown) => void`    | —       | Callback when the value changes.           |
| `disabled`      | `boolean`                     | `false` | Whether the radio group is disabled.       |
| `children`      | `Snippet<[{ disabled }]>`     | —       | Group content; receives the group's state. |

::

| Attribute       | Description                               |
| :-------------- | :---------------------------------------- |
| `data-disabled` | Present when the radio group is disabled. |

### RadioItem

A menu item that works like a radio button in a given group.
Renders a `<div>` element.

::table{columns="Prop,Type,Default"}

| Prop           | Type                                            | Default  | Description                                        |
| :------------- | :---------------------------------------------- | :------- | :------------------------------------------------- |
| `as`           | `keyof HTMLElementTagNameMap`                   | `'div'`  | HTML element to render.                            |
| `class`        | `string`                                        | —        | CSS class applied to the element.                  |
| `style`        | `string`                                        | —        | Inline style applied to the element.               |
| `value`        | `unknown`                                       | required | Value of this radio item.                          |
| `disabled`     | `boolean`                                       | `false`  | Whether the item is disabled.                      |
| `closeOnClick` | `boolean`                                       | `false`  | Whether the menu closes when this item is clicked. |
| `id`           | `string`                                        | auto     | Custom element ID.                                 |
| `children`     | `Snippet<[{ checked, highlighted, disabled }]>` | —        | Item content; receives the item's state.           |

::

| Attribute          | Description                            |
| :----------------- | :------------------------------------- |
| `data-checked`     | Present when the item is selected.     |
| `data-unchecked`   | Present when the item is not selected. |
| `data-highlighted` | Present when the item is highlighted.  |
| `data-disabled`    | Present when the item is disabled.     |

### RadioItemIndicator

Indicates whether the radio item is selected.
Renders a `<span>` element.

::table{columns="Prop,Type,Default"}

| Prop          | Type                                                              | Default  | Description                                           |
| :------------ | :---------------------------------------------------------------- | :------- | :---------------------------------------------------- |
| `as`          | `keyof HTMLElementTagNameMap`                                     | `'span'` | HTML element to render.                               |
| `class`       | `string`                                                          | —        | CSS class applied to the element.                     |
| `style`       | `string`                                                          | —        | Inline style applied to the element.                  |
| `keepMounted` | `boolean`                                                         | `false`  | Whether to keep the indicator mounted when unchecked. |
| `children`    | `Snippet<[{ checked, disabled, highlighted, transitionStatus }]>` | —        | Indicator content; receives the indicator's state.    |

::

| Attribute             | Description                                   |
| :-------------------- | :-------------------------------------------- |
| `data-checked`        | Present when the parent item is selected.     |
| `data-unchecked`      | Present when the parent item is not selected. |
| `data-disabled`       | Present when the item is disabled.            |
| `data-highlighted`    | Present when the parent item is highlighted.  |
| `data-starting-style` | Present when the indicator is animating in.   |
| `data-ending-style`   | Present when the indicator is animating out.  |

### CheckboxItem

A menu item that toggles a setting on or off.
Renders a `<div>` element.

::table{columns="Prop,Type,Default"}

| Prop              | Type                                            | Default | Description                                        |
| :---------------- | :---------------------------------------------- | :------ | :------------------------------------------------- |
| `as`              | `keyof HTMLElementTagNameMap`                   | `'div'` | HTML element to render.                            |
| `class`           | `string`                                        | —       | CSS class applied to the element.                  |
| `style`           | `string`                                        | —       | Inline style applied to the element.               |
| `checked`         | `boolean`                                       | `false` | Checked state. Use `bind:checked`.                 |
| `onCheckedChange` | `(checked: boolean) => void`                    | —       | Callback when the checked state changes.           |
| `disabled`        | `boolean`                                       | `false` | Whether the item is disabled.                      |
| `closeOnClick`    | `boolean`                                       | `false` | Whether the menu closes when this item is clicked. |
| `id`              | `string`                                        | auto    | Custom element ID.                                 |
| `children`        | `Snippet<[{ checked, highlighted, disabled }]>` | —       | Item content; receives the item's state.           |

::

| Attribute          | Description                           |
| :----------------- | :------------------------------------ |
| `data-checked`     | Present when the item is checked.     |
| `data-unchecked`   | Present when the item is not checked. |
| `data-disabled`    | Present when the item is disabled.    |
| `data-highlighted` | Present when the item is highlighted. |

### CheckboxItemIndicator

Indicates whether the checkbox item is ticked.
Renders a `<span>` element.

::table{columns="Prop,Type,Default"}

| Prop          | Type                                                              | Default  | Description                                           |
| :------------ | :---------------------------------------------------------------- | :------- | :---------------------------------------------------- |
| `as`          | `keyof HTMLElementTagNameMap`                                     | `'span'` | HTML element to render.                               |
| `class`       | `string`                                                          | —        | CSS class applied to the element.                     |
| `style`       | `string`                                                          | —        | Inline style applied to the element.                  |
| `keepMounted` | `boolean`                                                         | `false`  | Whether to keep the indicator mounted when unchecked. |
| `children`    | `Snippet<[{ checked, disabled, highlighted, transitionStatus }]>` | —        | Indicator content; receives the indicator's state.    |

::

| Attribute             | Description                                  |
| :-------------------- | :------------------------------------------- |
| `data-checked`        | Present when the parent item is checked.     |
| `data-unchecked`      | Present when the parent item is not checked. |
| `data-disabled`       | Present when the item is disabled.           |
| `data-highlighted`    | Present when the parent item is highlighted. |
| `data-starting-style` | Present when the indicator is animating in.  |
| `data-ending-style`   | Present when the indicator is animating out. |

### Separator

A separator element accessible to screen readers.
Renders a `<div>` element.

::table{columns="Prop,Type,Default"}

| Prop          | Type                          | Default        | Description                          |
| :------------ | :---------------------------- | :------------- | :----------------------------------- |
| `as`          | `keyof HTMLElementTagNameMap` | `'div'`        | HTML element to render.              |
| `class`       | `string`                      | —              | CSS class applied to the element.    |
| `style`       | `string`                      | —              | Inline style applied to the element. |
| `orientation` | `'horizontal' \| 'vertical'`  | `'horizontal'` | The orientation of the separator.    |

::

| Attribute          | Description                                 |
| :----------------- | :------------------------------------------ |
| `data-orientation` | Indicates the orientation of the separator. |

## Handle

Connects a `<Menu.Root>` with detached `<Menu.Trigger>` components, and controls the menu imperatively. Pass a type argument to type the `payload`.

```ts
const menu = new Menu.Handle<Payload>()
```

::table{columns="Member,Type"}

| Member            | Type                   | Description                                                      |
| :---------------- | :--------------------- | :--------------------------------------------------------------- |
| `isOpen`          | `boolean`              | Whether the menu is currently open (readonly).                   |
| `open(triggerId)` | `(id: string) => void` | Opens the menu, associating it with the trigger of the given ID. |
| `close()`         | `() => void`           | Closes the menu.                                                 |

::
