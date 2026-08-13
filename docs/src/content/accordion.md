# Accordion

Collapsible stacked sections.

:demo{name="accordion/hero"}

## Anatomy

```svelte title="Anatomy"
<script>
  import { Accordion } from '@shardsui/svelte/accordion'
</script>

<Accordion.Root>
  <Accordion.Item>
    <Accordion.Header>
      <Accordion.Trigger />
    </Accordion.Header>
    <Accordion.Panel />
  </Accordion.Item>
</Accordion.Root>
```

## Examples

### Open multiple panels

Set `multiple` to keep more than one panel open at once.

:demo{name="accordion/multiple"}

## API reference

### Root

Groups all parts of the accordion.
Renders a `<div>` element.

::table{columns="Prop,Type,Default"}

| Prop               | Type                             | Default | Description                                                                                                                                                                                             |
| :----------------- | :------------------------------- | :------ | :------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `as`               | `keyof HTMLElementTagNameMap`    | `'div'` | HTML element to render.                                                                                                                                                                                 |
| `class`            | `string`                         | —       | CSS class applied to the element.                                                                                                                                                                       |
| `style`            | `string`                         | —       | Inline style applied to the element.                                                                                                                                                                    |
| `value`            | `Value[]`                        | `[]`    | The value of the item(s) that should be expanded (use `bind:value`). `Value` is generic and defaults to `unknown`.                                                                                      |
| `disabled`         | `boolean`                        | `false` | Whether the component should ignore user interaction.                                                                                                                                                   |
| `hiddenUntilFound` | `boolean`                        | `false` | Allows the browser's built-in page search to find and expand the panel contents. Overrides the `keepMounted` prop and uses `hidden="until-found"` to hide the element without removing it from the DOM. |
| `multiple`         | `boolean`                        | `false` | Whether multiple items can be open at the same time.                                                                                                                                                    |
| `keepMounted`      | `boolean`                        | `false` | Whether to keep the element in the DOM while the panel is closed. This prop is ignored when `hiddenUntilFound` is used.                                                                                 |
| `onValueChange`    | `(value: Value[]) => void`       | —       | Event handler called when an accordion item is expanded or collapsed. Provides the new value as an argument.                                                                                            |
| `children`         | `Snippet<[{ value, disabled }]>` | —       | Content; receives the accordion state.                                                                                                                                                                  |

::

| Attribute       | Description                             |
| :-------------- | :-------------------------------------- |
| `data-disabled` | Present when the accordion is disabled. |

### Item

Groups an accordion header with the corresponding panel.
Renders a `<div>` element.

::table{columns="Prop,Type,Default"}

| Prop           | Type                                           | Default | Description                                                      |
| :------------- | :--------------------------------------------- | :------ | :--------------------------------------------------------------- |
| `as`           | `keyof HTMLElementTagNameMap`                  | `'div'` | HTML element to render.                                          |
| `class`        | `string`                                       | —       | CSS class applied to the element.                                |
| `style`        | `string`                                       | —       | Inline style applied to the element.                             |
| `value`        | `unknown`                                      | —       | A unique value identifying this item. Auto-generated if omitted. |
| `disabled`     | `boolean`                                      | `false` | Disables this item (inherits from Root if set there).            |
| `onOpenChange` | `(open: boolean) => void`                      | —       | Fires when this item's panel is opened or closed.                |
| `children`     | `Snippet<[{ value, disabled, hidden, open }]>` | —       | Content; receives the item state.                                |

::

| Attribute       | Description                                             |
| :-------------- | :------------------------------------------------------ |
| `data-open`     | Present when the accordion item is open.                |
| `data-closed`   | Present when the accordion item is closed.              |
| `data-hidden`   | Present when the panel is closed and not animating out. |
| `data-disabled` | Present when the accordion item is disabled.            |

### Header

A heading that labels the corresponding panel.
Renders an `<h3>` element.

::table{columns="Prop,Type,Default"}

| Prop       | Type                                           | Default | Description                          |
| :--------- | :--------------------------------------------- | :------ | :----------------------------------- |
| `as`       | `keyof HTMLElementTagNameMap`                  | `'h3'`  | HTML element to render.              |
| `class`    | `string`                                       | —       | CSS class applied to the element.    |
| `style`    | `string`                                       | —       | Inline style applied to the element. |
| `children` | `Snippet<[{ value, disabled, hidden, open }]>` | —       | Content; receives the item state.    |

::

| Attribute       | Description                                             |
| :-------------- | :------------------------------------------------------ |
| `data-open`     | Present when the accordion item is open.                |
| `data-closed`   | Present when the accordion item is closed.              |
| `data-hidden`   | Present when the panel is closed and not animating out. |
| `data-disabled` | Present when the accordion item is disabled.            |

### Trigger

A button that opens and closes the corresponding panel.
Renders a `<button>` element.

::table{columns="Prop,Type,Default"}

| Prop       | Type                                           | Default    | Description                                                     |
| :--------- | :--------------------------------------------- | :--------- | :-------------------------------------------------------------- |
| `as`       | `keyof HTMLElementTagNameMap`                  | `'button'` | HTML element to render.                                         |
| `class`    | `string`                                       | —          | CSS class applied to the element.                               |
| `style`    | `string`                                       | —          | Inline style applied to the element.                            |
| `id`       | `string`                                       | auto       | Custom element ID. Referenced by the panel's `aria-labelledby`. |
| `disabled` | `boolean`                                      | —          | Disables this trigger (also disabled when Item or Root is).     |
| `children` | `Snippet<[{ value, disabled, hidden, open }]>` | —          | Content; receives the item state.                               |

::

| Attribute         | Description                                             |
| :---------------- | :------------------------------------------------------ |
| `data-panel-open` | Present when the accordion panel is open.               |
| `data-hidden`     | Present when the panel is closed and not animating out. |
| `data-disabled`   | Present when the accordion item is disabled.            |

### Panel

A collapsible panel with the accordion item contents.
Renders a `<div>` element.

::table{columns="Prop,Type,Default"}

| Prop               | Type                                                             | Default | Description                                                                                             |
| :----------------- | :--------------------------------------------------------------- | :------ | :------------------------------------------------------------------------------------------------------ |
| `as`               | `keyof HTMLElementTagNameMap`                                    | `'div'` | HTML element to render.                                                                                 |
| `class`            | `string`                                                         | —       | CSS class applied to the element.                                                                       |
| `style`            | `string`                                                         | —       | Inline style applied to the element.                                                                    |
| `id`               | `string`                                                         | auto    | Custom element ID.                                                                                      |
| `keepMounted`      | `boolean`                                                        | —       | Overrides Root's setting. Keeps this panel in the DOM when closed.                                      |
| `hiddenUntilFound` | `boolean`                                                        | —       | Overrides Root's setting. Uses `hidden="until-found"` so in-page search can find and reveal this panel. |
| `children`         | `Snippet<[{ value, disabled, hidden, open, transitionStatus }]>` | —       | Content; receives the panel state.                                                                      |

::

| CSS Variable               | Description                  |
| :------------------------- | :--------------------------- |
| `--accordion-panel-height` | The panel's computed height. |
| `--accordion-panel-width`  | The panel's computed width.  |

| Attribute             | Description                                             |
| :-------------------- | :------------------------------------------------------ |
| `data-open`           | Present when the accordion panel is open.               |
| `data-closed`         | Present when the accordion panel is closed.             |
| `data-hidden`         | Present when the panel is closed and not animating out. |
| `data-disabled`       | Present when the accordion item is disabled.            |
| `data-starting-style` | Present when the panel is animating in.                 |
| `data-ending-style`   | Present when the panel is animating out.                |
