# Props & attributes

Shared props and data attributes.

Each component's API reference lists its own props and attributes; the ones that recur across the library are collected here, grouped by the part that takes them.

## Element props

Every part that renders an element accepts these.

::table{columns="Prop,Type,Default"}

| Prop       | Type                          | Default | Description                                                                                                                                                                                                                                       |
| :--------- | :---------------------------- | :------ | :------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `as`       | `keyof HTMLElementTagNameMap` | varies  | The tag the part renders. Every part already defaults to the element correct for its role. A few parts narrow it — `Field.Control` and `Combobox.Input` to `'input' \| 'textarea'`, the checkbox, radio and switch roots to `'span' \| 'button'`. |
| `class`    | `ClassValue`                  | —       | Class applied to the rendered element. Svelte's string, array and object forms all work.                                                                                                                                                          |
| `style`    | `string`                      | —       | Inline style applied to the element.                                                                                                                                                                                                              |
| `id`       | `string`                      | auto    | Overrides the element's ID. Parts that wire up ARIA relationships generate one when omitted. `Select.Item` and `Combobox.Item` forbid it.                                                                                                         |
| `children` | `Snippet`                     | —       | The part's content. Most parts pass their current state to it.                                                                                                                                                                                    |

::

Anything that isn't one of a part's own props is forwarded to the element, and your event handlers run alongside the part's rather than replacing them. See [Composition](/svelte/composition).

Every part that renders an element also exposes it through `ref`, populated once the element mounts:

```svelte
<!-- [!code word:bind\:ref] -->
<Popover.Trigger bind:ref={trigger}>Open</Popover.Trigger>
```

Providers that render no element of their own, such as `Dialog.Root`, don't.

## Availability

::table{columns="Prop,Type,Default"}

| Prop       | Type      | Default | Description                                                                                                                             |
| :--------- | :-------- | :------ | :-------------------------------------------------------------------------------------------------------------------------------------- |
| `disabled` | `boolean` | `false` | Blocks interaction and sets `data-disabled`. A root or group passes it down to its parts.                                               |
| `readOnly` | `boolean` | `false` | The value stays visible and focusable but can't be changed. On Checkbox, Switch, Radio, Radio Group, Select, Combobox and Autocomplete. |
| `required` | `boolean` | `false` | A value must be chosen before the form submits.                                                                                         |

::

## Value and selection

::table{columns="Prop,Type,Default"}

| Prop              | Type                         | Default | Description                                                                                                                                          |
| :---------------- | :--------------------------- | :------ | :--------------------------------------------------------------------------------------------------------------------------------------------------- |
| `value`           | `unknown`                    | —       | The current value; each component narrows the type. Use `bind:value`.                                                                                |
| `onValueChange`   | `(value: unknown) => void`   | —       | Runs when the value changes.                                                                                                                         |
| `multiple`        | `boolean`                    | `false` | Allows more than one selection. On `Accordion.Root`, `Select.Root`, `Combobox.Root` and `ToggleGroup` — the parts beneath them read it from context. |
| `checked`         | `boolean`                    | `false` | Checked state. Use `bind:checked`.                                                                                                                   |
| `onCheckedChange` | `(checked: boolean) => void` | —       | Runs when the checked state changes.                                                                                                                 |
| `name`            | `string`                     | —       | Names the value in form submission. Parts with no native form control render a hidden input to carry it.                                             |

::

## Open state

For overlays with open state (dialog, menu, popover, select, …).

::table{columns="Prop,Type,Default"}

| Prop                   | Type                      | Default | Description                                                                                                                                                                                                                                                                                                     |
| :--------------------- | :------------------------ | :------ | :-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `open`                 | `boolean`                 | `false` | Open state. Use `bind:open`.                                                                                                                                                                                                                                                                                    |
| `onOpenChange`         | `(open: boolean) => void` | —       | Runs when the open state changes.                                                                                                                                                                                                                                                                               |
| `onOpenChangeComplete` | `(open: boolean) => void` | —       | Runs after the open or close animation has finished.                                                                                                                                                                                                                                                            |
| `modal`                | `boolean \| 'trap-focus'` | varies  | `true` traps focus, locks page scroll and blocks pointer interaction outside. `'trap-focus'` traps focus only, and is accepted by Dialog, Drawer and Popover; Menu, Menubar, Select and Combobox take a `boolean`. Dialog, Drawer, Menu, Menubar and Select default to `true`; Popover and Combobox to `false`. |

::

## Detached triggers

Dialog, Alert Dialog, Drawer, Popover, Menu, Tooltip, and Preview Card can link a trigger to a root that isn't its ancestor, through a handle created from the component's `Handle` class. See [Composition](/svelte/composition#detaching-parts-with-a-handle).

::table{columns="Prop,Type,Default"}

| Prop        | Type                     | Default | Description                                                                              |
| :---------- | :----------------------- | :------ | :--------------------------------------------------------------------------------------- |
| `handle`    | `Handle<Payload>`        | —       | The shared handle. Pass the same instance to the root and to every detached trigger.     |
| `payload`   | `Payload`                | —       | On a trigger: data handed to the root's `children` snippet when this trigger opens it.   |
| `triggerId` | `string \| null`         | —       | The active trigger's id, controlled.                                                     |
| `children`  | `Snippet<[{ payload }]>` | —       | On a root that takes a handle: content snippet receiving the active trigger's `payload`. |

::

## Positioner

On the `Positioner` part of floating components (Popover, Menu, Select, Tooltip, …).

::table{columns="Prop,Type,Default"}

| Prop                    | Type                                                                                                      | Default                | Description                                                                                                                                                                                                                                                                                         |
| :---------------------- | :-------------------------------------------------------------------------------------------------------- | :--------------------- | :-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `side`                  | `'top' \| 'bottom' \| 'left' \| 'right' \| 'inline-start' \| 'inline-end'`                                | `'bottom'`             | Side of the anchor to place the popup on. Tooltip and Toast default to `'top'`, submenus to `'inline-end'`.                                                                                                                                                                                         |
| `align`                 | `'start' \| 'center' \| 'end'`                                                                            | `'center'`             | Alignment along that side. Menus opened from a menu, menubar or context menu default to `'start'`.                                                                                                                                                                                                  |
| `sideOffset`            | `number \| OffsetFunction`                                                                                | `0`                    | Distance in px from the anchor. A function receives the resolved side, align and the anchor and positioner sizes.                                                                                                                                                                                   |
| `alignOffset`           | `number \| OffsetFunction`                                                                                | `0`                    | Offset in px along the alignment axis.                                                                                                                                                                                                                                                              |
| `arrowPadding`          | `number`                                                                                                  | `5`                    | Minimum distance in px between the arrow and the popup's corners.                                                                                                                                                                                                                                   |
| `collisionBoundary`     | `'clipping-ancestors' \| Element \| Element[] \| { x: number; y: number; width: number; height: number }` | `'clipping-ancestors'` | Area the popup must stay inside.                                                                                                                                                                                                                                                                    |
| `collisionPadding`      | `number \| Padding`                                                                                       | `5`                    | Padding in px inset from the collision boundary.                                                                                                                                                                                                                                                    |
| `collisionAvoidance`    | `CollisionAvoidance`                                                                                      | varies                 | Per-axis strategy. `side` and `align` take `'flip'`, `'shift'` or `'none'`, both defaulting to `'flip'`; `fallbackAxisSide` picks the perpendicular side to fall back to — `'none'` on dropdowns (Select, Combobox, and any Menu or Navigation Menu that isn't a submenu), `'end'` everywhere else. |
| `sticky`                | `boolean`                                                                                                 | `false`                | Keeps the popup in view while the anchor scrolls out of it.                                                                                                                                                                                                                                         |
| `positionMethod`        | `'absolute' \| 'fixed'`                                                                                   | `'absolute'`           | CSS positioning strategy. Context menus default to `'fixed'`.                                                                                                                                                                                                                                       |
| `anchor`                | `Element \| VirtualAnchorElement \| null`                                                                 | trigger                | What to position against. A virtual anchor is any object with `getBoundingClientRect()`.                                                                                                                                                                                                            |
| `disableAnchorTracking` | `boolean`                                                                                                 | `false`                | Stops repositioning as the anchor moves or resizes.                                                                                                                                                                                                                                                 |

::

The positioner sets `--anchor-width`, `--anchor-height`, `--available-width`, `--available-height` and `--transform-origin` for the popup to size and animate against. See [Styling](/svelte/styling).

## Mounting

Overlays reach the DOM through an explicit `<*.Portal>` part, which wraps the `Backdrop` and the `Positioner` — or, for Dialog, Alert Dialog and Drawer, the `Popup`. `Toast.Portal` takes `container` only; every other `Portal` also takes `keepMounted`.

::table{columns="Prop,Type,Default"}

| Prop               | Type                  | Default | Description                                                                                                                                                                                                                       |
| :----------------- | :-------------------- | :------ | :-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `container`        | `HTMLElement \| null` | —       | Where to render the portal. Defaults to the nearest ancestor portal, otherwise `document.body`.                                                                                                                                   |
| `keepMounted`      | `boolean`             | `false` | Keeps the element in the DOM while it's inactive. On `Portal` parts, on panels (`Collapsible`, `Accordion`, `Tabs`, `NavigationMenu.Content`), and on parts that come and go with state, such as indicators and `Combobox.Clear`. |
| `hiddenUntilFound` | `boolean`             | `false` | Lets the browser's find-in-page reveal closed content, which keeps the element mounted. On `Collapsible.Panel` and `Accordion.Root` / `Accordion.Panel`.                                                                          |

::

## Triggers

Triggers render a real `<button>` wherever the pattern allows it, so `type="button"`, activation on Enter and Space, and the disabled state come from the platform. Point `as` at another tag — `<a>` for a link, `<span>` where a `<button>` can't nest — and the part adds `role="button"`, `tabindex` and the keyboard handlers a native button would have given you.

## Focus and hover

For dialogs, popups, and hover-openable components.

::table{columns="Prop,Type,Default"}

| Prop               | Type                                                                                              | Default | Description                                                                                                                                                                                    |
| :----------------- | :------------------------------------------------------------------------------------------------ | :------ | :--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `initialFocus`     | `HTMLElement \| boolean \| ((interactionType: string) => HTMLElement \| boolean \| null \| void)` | —       | What to focus when the popup opens. `false` skips focusing; a function receives how the popup was opened.                                                                                      |
| `finalFocus`       | `HTMLElement \| boolean \| ((interactionType: string) => HTMLElement \| boolean \| null \| void)` | —       | What to focus when the popup closes. `false` skips focusing.                                                                                                                                   |
| `delay`            | `number`                                                                                          | varies  | Delay in ms before opening on hover. Tooltip and Preview Card `600`, Popover `300`, Menu `100`, Navigation Menu `50`.                                                                          |
| `closeDelay`       | `number`                                                                                          | varies  | Delay in ms before closing on hover. Preview Card `300`, Navigation Menu `50`, otherwise `0`.                                                                                                  |
| `openOnHover`      | `boolean`                                                                                         | varies  | Whether hovering the trigger opens the popup. `false` on `Popover.Trigger`; `true` on `Menu.SubmenuTrigger`. `Menu.Trigger` follows its menubar, opening on hover once a sibling menu is open. |
| `closeParentOnEsc` | `boolean`                                                                                         | `false` | Whether Escape closes the parent menu too. On `Menu.Root` and `Menu.SubmenuRoot`.                                                                                                              |

::

## List navigation

For menus, lists, and composite widgets.

::table{columns="Prop,Type,Default"}

| Prop                   | Type                         | Default | Description                                                                                                                                                                                                                                                                                               |
| :--------------------- | :--------------------------- | :------ | :-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `loopFocus`            | `boolean`                    | `true`  | Whether arrow keys wrap from the last item back to the first.                                                                                                                                                                                                                                             |
| `highlightItemOnHover` | `boolean`                    | `true`  | Whether hovering an item highlights it.                                                                                                                                                                                                                                                                   |
| `closeOnClick`         | `boolean`                    | varies  | Whether activating the item closes its popup. `true` on `Menu.Item` and `Tooltip.Trigger`; `false` on menu checkbox, radio and link items and on `NavigationMenu.Link`.                                                                                                                                   |
| `orientation`          | `'horizontal' \| 'vertical'` | varies  | Which arrow keys move focus, on the root or list part — Tabs, Toolbar, Menu, Menubar, Navigation Menu, Toggle Group, Slider, and Scroll Area's scrollbar. On `Separator` it carries no focus behavior and only sets `aria-orientation`. `'vertical'` on Menu and the scrollbar, `'horizontal'` elsewhere. |

::

## Form

::table{columns="Prop,Type,Default"}

| Prop          | Type     | Default | Description                                                                     |
| :------------ | :------- | :------ | :------------------------------------------------------------------------------ |
| `form`        | `string` | —       | The `id` of the form this control submits with, when it isn't nested inside it. |
| `placeholder` | `string` | —       | Text shown while no value is selected.                                          |

::

Machinery specific to one component family — a list's `items` / `filter` / `itemToStringValue`, or a range's `min` / `max` / `format` — stays on that component's page.

For the full controlled and uncontrolled patterns, see [State](/svelte/state).

## Data attributes

Every part mirrors its live state onto its element as `data-*` attributes, so you style against state instead of tracking it yourself. See [Styling](/svelte/styling).

### Open and closed

| Attribute         | Description                                             |
| :---------------- | :------------------------------------------------------ |
| `data-open`       | Present while the element is open.                      |
| `data-closed`     | Present while the element is closed.                    |
| `data-popup-open` | Present on a trigger while its popup is open.           |
| `data-hidden`     | Present once a closed panel has finished animating out. |

### Selection and pressed

| Attribute            | Description                                                            |
| :------------------- | :--------------------------------------------------------------------- |
| `data-checked`       | Present when checked or selected.                                      |
| `data-unchecked`     | Present when not checked.                                              |
| `data-indeterminate` | Present in the indeterminate state.                                    |
| `data-selected`      | Present on the item holding the selected value.                        |
| `data-highlighted`   | Present on the item the keyboard or pointer has highlighted in a list. |
| `data-pressed`       | Present when a toggle is pressed, or a trigger's popup is open.        |
| `data-placeholder`   | Present while no value is selected.                                    |

### Availability

| Attribute       | Description             |
| :-------------- | :---------------------- |
| `data-disabled` | Present when disabled.  |
| `data-readonly` | Present when read-only. |
| `data-required` | Present when required.  |

### Field validation

Present within a [Field](/svelte/field), reflecting the control's validation state.

| Attribute      | Description                                 |
| :------------- | :------------------------------------------ |
| `data-valid`   | Present when the control is valid.          |
| `data-invalid` | Present when the control is invalid.        |
| `data-dirty`   | Present after the value has changed.        |
| `data-touched` | Present after the control has been blurred. |
| `data-filled`  | Present when the control has a value.       |
| `data-focused` | Present while the control is focused.       |

### Orientation and position

| Attribute                   | Description                                                                                                                                                                                                                                                |
| :-------------------------- | :--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `data-orientation`          | `'horizontal' \| 'vertical'` — the component's orientation.                                                                                                                                                                                                |
| `data-side`                 | The side the popup landed on relative to its anchor, after collision handling.                                                                                                                                                                             |
| `data-align`                | How the popup is aligned along that side.                                                                                                                                                                                                                  |
| `data-anchor-hidden`        | Present when the anchor has been scrolled or clipped out of view, so the popup has nothing to point at.                                                                                                                                                    |
| `data-activation-direction` | Which way the newly active item sits from the last one. Tabs and Navigation Menu emit one of `left`, `right`, `up`, `down`, and Tabs emits `none` until a tab is activated; a popup `Viewport` emits a horizontal and vertical pair, such as `right down`. |

### Animation

Set the resting styles as the default and the transitional styles behind these attributes. See [Animation](/svelte/animation).

| Attribute              | Description                                                                                               |
| :--------------------- | :-------------------------------------------------------------------------------------------------------- |
| `data-starting-style`  | Present on the frame an element mounts — the "from" of an enter transition.                               |
| `data-ending-style`    | Present while an element is leaving — the "to" of an exit transition.                                     |
| `data-instant`         | Present when the change should skip its animation. Its value names why, such as `'dismiss'` or `'focus'`. |
| `data-transitioning`   | Present on a `Viewport` while it swaps one popup's content for another's.                                 |
| `data-current`         | On the `Viewport` wrapper holding the current content.                                                    |
| `data-previous`        | On the `Viewport` wrapper holding the outgoing content, during that swap.                                 |
| `data-dragging`        | Present while the element is being dragged.                                                               |
| `data-swiping`         | Present while the element is being swiped.                                                                |
| `data-swipe-direction` | `'up' \| 'down' \| 'left' \| 'right'` — the direction of the swipe.                                       |

### Progress

| Attribute          | Description                            |
| :----------------- | :------------------------------------- |
| `data-progressing` | Present while the task is in progress. |
| `data-complete`    | Present once the task has completed.   |

### Scroll area

| Attribute               | Description                                                 |
| :---------------------- | :---------------------------------------------------------- |
| `data-scrolling`        | Present while the user is scrolling.                        |
| `data-has-overflow-x`   | Present when the content is wider than the viewport.        |
| `data-has-overflow-y`   | Present when the content is taller than the viewport.       |
| `data-overflow-x-start` | Present when content is scrolled past the horizontal start. |
| `data-overflow-x-end`   | Present when content extends past the horizontal end.       |
| `data-overflow-y-start` | Present when content is scrolled past the vertical start.   |
| `data-overflow-y-end`   | Present when content extends past the vertical end.         |

### Nesting

| Attribute                 | Description                                                    |
| :------------------------ | :------------------------------------------------------------- |
| `data-nested`             | Present when the element is nested within another of its kind. |
| `data-nested-dialog-open` | Present on a dialog while a dialog nested inside it is open.   |
