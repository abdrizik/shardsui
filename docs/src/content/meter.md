# Meter

A gauge within a known range.

:demo{name="meter/hero"}

## Anatomy

```svelte title="Anatomy"
<script>
  import { Meter } from '@shardsui/svelte/meter'
</script>

<Meter.Root>
  <Meter.Label />
  <Meter.Track>
    <Meter.Indicator />
  </Meter.Track>
  <Meter.Value />
</Meter.Root>
```

## API reference

### Root

Groups all parts of the meter and provides the value for screen readers.
Renders a `<div>` element with `role="meter"`.

`role="meter"` requires an accessible name: render a `Meter.Label` inside `Root`, or pass
`aria-label` to `Root`.

::table{columns="Prop,Type,Default"}

| Prop       | Type                          | Default | Description                                                                                                              |
| :--------- | :---------------------------- | :------ | :----------------------------------------------------------------------------------------------------------------------- |
| `as`       | `keyof HTMLElementTagNameMap` | `'div'` | HTML element to render.                                                                                                  |
| `class`    | `string`                      | —       | CSS class applied to the element.                                                                                        |
| `style`    | `string`                      | —       | Inline style applied to the element.                                                                                     |
| `value`    | `number`                      | —       | Required. The current value. Clamped to `min` and `max` for `aria-valuenow`, the indicator width and the displayed text. |
| `format`   | `Intl.NumberFormatOptions`    | —       | Options to format the value. Without it, the value is displayed as its percentage position in the range.                 |
| `locale`   | `Intl.LocalesArgument`        | —       | The locale used by `Intl.NumberFormat` when formatting the value. Defaults to the user's runtime locale.                 |
| `min`      | `number`                      | `0`     | The minimum value.                                                                                                       |
| `max`      | `number`                      | `100`   | The maximum value.                                                                                                       |
| `children` | `Snippet`                     | —       | Content.                                                                                                                 |

::

### Track

Contains the indicator and represents the entire range of the meter.
Renders a `<div>` element.

::table{columns="Prop,Type,Default"}

| Prop       | Type                          | Default | Description                          |
| :--------- | :---------------------------- | :------ | :----------------------------------- |
| `as`       | `keyof HTMLElementTagNameMap` | `'div'` | HTML element to render.              |
| `class`    | `string`                      | —       | CSS class applied to the element.    |
| `style`    | `string`                      | —       | Inline style applied to the element. |
| `children` | `Snippet`                     | —       | Content.                             |

::

### Indicator

Visualizes the position of the value along the range. Its `width` is set inline, from the value's
percentage position in the range.
Renders a `<div>` element.

::table{columns="Prop,Type,Default"}

| Prop       | Type                          | Default | Description                                                      |
| :--------- | :---------------------------- | :------ | :--------------------------------------------------------------- |
| `as`       | `keyof HTMLElementTagNameMap` | `'div'` | HTML element to render.                                          |
| `class`    | `string`                      | —       | CSS class applied to the element.                                |
| `style`    | `string`                      | —       | Inline style applied to the element, after the built-in `width`. |
| `children` | `Snippet`                     | —       | Content.                                                         |

::

### Value

A text element displaying the current value. Hidden from screen readers, which read the value from
`Root`.
Renders a `<span>` element.

::table{columns="Prop,Type,Default"}

| Prop       | Type                                               | Default  | Description                                                                                |
| :--------- | :------------------------------------------------- | :------- | :----------------------------------------------------------------------------------------- |
| `as`       | `keyof HTMLElementTagNameMap`                      | `'span'` | HTML element to render.                                                                    |
| `class`    | `string`                                           | —        | CSS class applied to the element.                                                          |
| `style`    | `string`                                           | —        | Inline style applied to the element.                                                       |
| `children` | `Snippet<[formattedValue: string, value: number]>` | —        | Snippet receiving the formatted value and the raw number. Defaults to the formatted value. |

::

### Label

An accessible label for the meter.
Renders a `<span>` element.

::table{columns="Prop,Type,Default"}

| Prop       | Type                          | Default  | Description                                                         |
| :--------- | :---------------------------- | :------- | :------------------------------------------------------------------ |
| `as`       | `keyof HTMLElementTagNameMap` | `'span'` | HTML element to render.                                             |
| `class`    | `string`                      | —        | CSS class applied to the element.                                   |
| `style`    | `string`                      | —        | Inline style applied to the element.                                |
| `id`       | `string`                      | auto     | Custom element ID. Associated with the meter via `aria-labelledby`. |
| `children` | `Snippet`                     | —        | Content.                                                            |

::
