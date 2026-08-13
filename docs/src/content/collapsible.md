# Collapsible

An expand-and-collapse panel.

:demo{name="collapsible/hero"}

## Anatomy

```svelte title="Anatomy"
<script>
  import { Collapsible } from '@shardsui/svelte/collapsible'
</script>

<Collapsible.Root>
  <Collapsible.Trigger />
  <Collapsible.Panel />
</Collapsible.Root>
```

## API reference

### Root

Groups all parts of the collapsible.
Renders a `<div>` element.

::table{columns="Prop,Type,Default"}

| Prop           | Type                                              | Default | Description                                                        |
| :------------- | :------------------------------------------------ | :------ | :----------------------------------------------------------------- |
| `as`           | `keyof HTMLElementTagNameMap`                     | `'div'` | HTML element to render.                                            |
| `class`        | `string`                                          | —       | CSS class applied to the element.                                  |
| `style`        | `string`                                          | —       | Inline style applied to the element.                               |
| `open`         | `boolean`                                         | `false` | Whether the collapsible panel is currently open (use `bind:open`). |
| `onOpenChange` | `(open: boolean) => void`                         | —       | Event handler called when the panel is opened or closed.           |
| `disabled`     | `boolean`                                         | `false` | Whether the component should ignore user interaction.              |
| `children`     | `Snippet<[{ open, disabled, transitionStatus }]>` | —       | Content; receives the collapsible state.                           |

::

| Attribute             | Description                                   |
| :-------------------- | :-------------------------------------------- |
| `data-open`           | Present when the collapsible panel is open.   |
| `data-closed`         | Present when the collapsible panel is closed. |
| `data-disabled`       | Present when the collapsible is disabled.     |
| `data-starting-style` | Present when the panel is animating in.       |
| `data-ending-style`   | Present when the panel is animating out.      |

### Trigger

A button that opens and closes the collapsible panel.
Renders a `<button>` element.

::table{columns="Prop,Type,Default"}

| Prop       | Type                                              | Default    | Description                                         |
| :--------- | :------------------------------------------------ | :--------- | :-------------------------------------------------- |
| `as`       | `keyof HTMLElementTagNameMap`                     | `'button'` | HTML element to render.                             |
| `class`    | `string`                                          | —          | CSS class applied to the element.                   |
| `style`    | `string`                                          | —          | Inline style applied to the element.                |
| `disabled` | `boolean`                                         | —          | Overrides Root's `disabled`. Disables this trigger. |
| `children` | `Snippet<[{ open, disabled, transitionStatus }]>` | —          | Content; receives the collapsible state.            |

::

| Attribute             | Description                                 |
| :-------------------- | :------------------------------------------ |
| `data-panel-open`     | Present when the collapsible panel is open. |
| `data-disabled`       | Present when the collapsible is disabled.   |
| `data-starting-style` | Present when the panel is animating in.     |
| `data-ending-style`   | Present when the panel is animating out.    |

### Panel

A panel with the collapsible contents.
Renders a `<div>` element.

::table{columns="Prop,Type,Default"}

| Prop               | Type                                              | Default | Description                                                                                                                                                                                             |
| :----------------- | :------------------------------------------------ | :------ | :------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `as`               | `keyof HTMLElementTagNameMap`                     | `'div'` | HTML element to render.                                                                                                                                                                                 |
| `class`            | `string`                                          | —       | CSS class applied to the element.                                                                                                                                                                       |
| `style`            | `string`                                          | —       | Inline style applied to the element.                                                                                                                                                                    |
| `id`               | `string`                                          | auto    | Custom element ID. Referenced by the trigger's `aria-controls`.                                                                                                                                         |
| `hiddenUntilFound` | `boolean`                                         | `false` | Allows the browser's built-in page search to find and expand the panel contents. Overrides the `keepMounted` prop and uses `hidden="until-found"` to hide the element without removing it from the DOM. |
| `keepMounted`      | `boolean`                                         | `false` | Whether to keep the element in the DOM while the panel is hidden. This prop is ignored when `hiddenUntilFound` is used.                                                                                 |
| `children`         | `Snippet<[{ open, disabled, transitionStatus }]>` | —       | Content; receives the collapsible state.                                                                                                                                                                |

::

| Attribute             | Description                               |
| :-------------------- | :---------------------------------------- |
| `data-open`           | Present when the panel is open.           |
| `data-closed`         | Present when the panel is closed.         |
| `data-disabled`       | Present when the collapsible is disabled. |
| `data-starting-style` | Present when the panel is animating in.   |
| `data-ending-style`   | Present when the panel is animating out.  |

| CSS Variable                 | Description                  |
| :--------------------------- | :--------------------------- |
| `--collapsible-panel-height` | The panel's computed height. |
| `--collapsible-panel-width`  | The panel's computed width.  |
