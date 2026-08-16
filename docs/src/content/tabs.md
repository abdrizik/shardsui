# Tabs

Switchable content panels.

:demo{name="tabs/hero"}

## Anatomy

```svelte title="Anatomy"
<script>
  import { Tabs } from '@shardsui/svelte/tabs'
</script>

<Tabs.Root>
  <Tabs.List>
    <Tabs.Tab value="..." />
    <Tabs.Indicator />
  </Tabs.List>

  <Tabs.Panel value="..." />
</Tabs.Root>
```

Every `Tabs.Tab` needs a `value`, and the `Tabs.Panel` it controls repeats it.

## Examples

### Animated panels

Animate panels as they activate using the `data-starting-style` and `data-ending-style` attributes. The `data-activation-direction` attribute indicates which direction the newly active tab is relative to the previously active one, letting panels slide in from the correct side.

:demo{name="tabs/animated-panels"}

### Links

When a tab navigates to a URL instead of toggling a panel, set `as="a"` on `<Tabs.Tab>`. The `href` is forwarded to the element, and the tab keeps its `role="tab"` and its place in the list's keyboard navigation.

```svelte title="Tabs as links"
<Tabs.Root>
  <Tabs.List>
    <!-- [!code word:as="a"] -->
    <!-- [!code highlight] -->
    <Tabs.Tab as="a" href="/overview" value="overview">Overview</Tabs.Tab>
  </Tabs.List>
</Tabs.Root>
```

## API reference

### Root

Groups the tabs and the corresponding panels.
Renders a `<div>` element.

::table{columns="Prop,Type,Default"}

| Prop            | Type                                              | Default        | Description                                                                                                                                                                                                          |
| :-------------- | :------------------------------------------------ | :------------- | :------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `as`            | `keyof HTMLElementTagNameMap`                     | `'div'`        | HTML element to render.                                                                                                                                                                                              |
| `class`         | `string`                                          | —              | CSS class applied to the element.                                                                                                                                                                                    |
| `style`         | `string`                                          | —              | Inline style applied to the element.                                                                                                                                                                                 |
| `value`         | `string \| number \| null`                        | —              | Value of the active tab. Use `bind:value` to control it. `null` leaves every tab inactive. When the prop is omitted, the uncontrolled fallback `0` falls back to the first enabled tab if no enabled tab carries it. |
| `orientation`   | `'horizontal' \| 'vertical'`                      | `'horizontal'` | Layout flow direction. Decides which arrow keys move focus, and marks the list `aria-orientation="vertical"`.                                                                                                        |
| `onValueChange` | `(value: string \| number \| null) => void`       | —              | Fires when the active tab changes. With `value` omitted it also fires for the initial selection, and for the automatic fallback after the active tab is removed or disabled — with `null` if no enabled tab is left. |
| `children`      | `Snippet<[{ orientation, activationDirection }]>` | —              | Content; receives the tabs state.                                                                                                                                                                                    |

::

| Attribute                   | Description                                                                        |
| :-------------------------- | :--------------------------------------------------------------------------------- |
| `data-orientation`          | Indicates the orientation of the tabs.                                             |
| `data-activation-direction` | Direction of the last activation: `'left' \| 'right' \| 'up' \| 'down' \| 'none'`. |

### List

Groups the individual tab buttons into one tab stop; arrow keys move between them.
Renders a `<div>` element with `role="tablist"`.

::table{columns="Prop,Type,Default"}

| Prop              | Type                                              | Default | Description                                                                                                |
| :---------------- | :------------------------------------------------ | :------ | :--------------------------------------------------------------------------------------------------------- |
| `as`              | `keyof HTMLElementTagNameMap`                     | `'div'` | HTML element to render.                                                                                    |
| `class`           | `string`                                          | —       | CSS class applied to the element.                                                                          |
| `style`           | `string`                                          | —       | Inline style applied to the element.                                                                       |
| `activateOnFocus` | `boolean`                                         | `false` | Activates each tab as arrow keys focus it. When `false`, the focused tab is activated with Enter or Space. |
| `loopFocus`       | `boolean`                                         | `true`  | Whether arrow-key navigation wraps from the last tab back to the first.                                    |
| `children`        | `Snippet<[{ orientation, activationDirection }]>` | —       | Content; receives the tabs state.                                                                          |

::

| Attribute                   | Description                                                                        |
| :-------------------------- | :--------------------------------------------------------------------------------- |
| `data-orientation`          | Indicates the orientation of the tabs.                                             |
| `data-activation-direction` | Direction of the last activation: `'left' \| 'right' \| 'up' \| 'down' \| 'none'`. |

### Tab

An individual interactive tab button that toggles the corresponding panel.
Renders a `<button>` element.

::table{columns="Prop,Type,Default"}

| Prop       | Type                                                                | Default    | Description                                                                                                               |
| :--------- | :------------------------------------------------------------------ | :--------- | :------------------------------------------------------------------------------------------------------------------------ |
| `as`       | `keyof HTMLElementTagNameMap`                                       | `'button'` | Element to render as. Use `'a'` for link tabs.                                                                            |
| `class`    | `string`                                                            | —          | CSS class applied to the element.                                                                                         |
| `style`    | `string`                                                            | —          | Inline style applied to the element.                                                                                      |
| `value`    | `string \| number \| null`                                          | —          | Required. Identifies which Panel this Tab controls.                                                                       |
| `id`       | `string`                                                            | auto       | Custom element ID. Referenced by the panel's `aria-labelledby`.                                                           |
| `disabled` | `boolean`                                                           | `false`    | Blocks activation. The tab stays focusable and arrow-key reachable, and is marked `aria-disabled` rather than `disabled`. |
| `children` | `Snippet<[{ active, disabled, orientation, activationDirection }]>` | —          | Tab content; receives the tab state.                                                                                      |

::

| Attribute                   | Description                                                                        |
| :-------------------------- | :--------------------------------------------------------------------------------- |
| `data-active`               | Present when the tab is active.                                                    |
| `data-disabled`             | Present when the tab is disabled.                                                  |
| `data-orientation`          | Indicates the orientation of the tabs.                                             |
| `data-activation-direction` | Direction of the last activation: `'left' \| 'right' \| 'up' \| 'down' \| 'none'`. |

### Indicator

A visual indicator you style to match the position of the active tab. Place it inside `<Tabs.List>` — it is measured against the list — and position it with the CSS variables below.
Renders a `<span>` element; nothing renders while the active value is `null`.

::table{columns="Prop,Type,Default"}

| Prop       | Type                                                                                | Default  | Description                                                                                                      |
| :--------- | :---------------------------------------------------------------------------------- | :------- | :--------------------------------------------------------------------------------------------------------------- |
| `as`       | `keyof HTMLElementTagNameMap`                                                       | `'span'` | HTML element to render.                                                                                          |
| `class`    | `string`                                                                            | —        | CSS class applied to the element.                                                                                |
| `style`    | `string`                                                                            | —        | Inline style applied to the element. Merged with the CSS variables below.                                        |
| `children` | `Snippet<[{ orientation, activationDirection, activeTabPosition, activeTabSize }]>` | —        | Content; receives the indicator state. The active tab's position and size are `null` until it has been measured. |

::

| Attribute                   | Description                                                                        |
| :-------------------------- | :--------------------------------------------------------------------------------- |
| `data-orientation`          | Indicates the orientation of the tabs.                                             |
| `data-activation-direction` | Direction of the last activation: `'left' \| 'right' \| 'up' \| 'down' \| 'none'`. |

| CSS Variable          | Description                           |
| :-------------------- | :------------------------------------ |
| `--active-tab-left`   | Distance from the list's left edge.   |
| `--active-tab-right`  | Distance from the list's right edge.  |
| `--active-tab-top`    | Distance from the list's top edge.    |
| `--active-tab-bottom` | Distance from the list's bottom edge. |
| `--active-tab-width`  | Active tab width.                     |
| `--active-tab-height` | Active tab height.                    |

### Panel

A panel displayed when the corresponding tab is active.
Renders a `<div>` element.

::table{columns="Prop,Type,Default"}

| Prop          | Type                                                                        | Default | Description                                                                                                                  |
| :------------ | :-------------------------------------------------------------------------- | :------ | :--------------------------------------------------------------------------------------------------------------------------- |
| `as`          | `keyof HTMLElementTagNameMap`                                               | `'div'` | HTML element to render.                                                                                                      |
| `class`       | `string`                                                                    | —       | CSS class applied to the element.                                                                                            |
| `style`       | `string`                                                                    | —       | Inline style applied to the element.                                                                                         |
| `value`       | `string \| number \| null`                                                  | —       | Matches the controlling Tab's value.                                                                                         |
| `id`          | `string`                                                                    | auto    | Custom element ID. Referenced by the tab's `aria-controls`.                                                                  |
| `keepMounted` | `boolean`                                                                   | `false` | Keeps the panel in the DOM while inactive — `hidden` and `inert` — so its contents keep their scroll position and DOM state. |
| `children`    | `Snippet<[{ hidden, orientation, activationDirection, transitionStatus }]>` | —       | Panel content; receives the panel state.                                                                                     |

::

| Attribute                   | Description                                                                        |
| :-------------------------- | :--------------------------------------------------------------------------------- |
| `data-hidden`               | Present when the panel is inactive but kept mounted.                               |
| `data-starting-style`       | Present when the panel is animating in.                                            |
| `data-ending-style`         | Present when the panel is animating out.                                           |
| `data-orientation`          | Indicates the orientation of the tabs.                                             |
| `data-activation-direction` | Direction of the last activation: `'left' \| 'right' \| 'up' \| 'down' \| 'none'`. |

## Additional types

### TabsValue

The value identifying a tab, shared by `Tabs.Root`'s `value`, `Tabs.Tab`'s `value` and the
`Tabs.Panel` it controls.

```ts
type TabsValue = string | number | null
```

### TabsOrientation

The `orientation` of `Tabs.Root`, which decides the arrow keys that move between tabs.

```ts
type TabsOrientation = 'horizontal' | 'vertical'
```

### TabsActivationDirection

Which way the active tab moved, handed to the `children` snippet as `activationDirection` and
mirrored on `data-activation-direction`.

```ts
type TabsActivationDirection = 'left' | 'right' | 'up' | 'down' | 'none'
```
