# Progress

A bar showing task progress.

:demo{name="progress/hero"}

## Anatomy

```svelte title="Anatomy"
<script>
  import { Progress } from '@shardsui/svelte/progress'
</script>

<Progress.Root>
  <Progress.Label />
  <Progress.Track>
    <Progress.Indicator />
  </Progress.Track>
  <Progress.Value />
</Progress.Root>
```

## API reference

### Root

Groups all parts of the progress bar and reports the task's status to screen readers.
Renders a `<div>` element with `role="progressbar"`.

`role="progressbar"` requires an accessible name: render a `Progress.Label` inside `Root`, or pass
`aria-label` to `Root`.

::table{columns="Prop,Type,Default"}

| Prop       | Type                          | Default | Description                                                                                              |
| :--------- | :---------------------------- | :------ | :------------------------------------------------------------------------------------------------------- |
| `as`       | `keyof HTMLElementTagNameMap` | `'div'` | HTML element to render.                                                                                  |
| `class`    | `string`                      | —       | CSS class applied to the element.                                                                        |
| `style`    | `string`                      | —       | Inline style applied to the element.                                                                     |
| `value`    | `number \| null`              | —       | Required. The current value, or `null` while it is indeterminate.                                        |
| `format`   | `Intl.NumberFormatOptions`    | —       | Options to format the value. Without it, the value is displayed as its percentage position in the range. |
| `locale`   | `Intl.LocalesArgument`        | —       | The locale used by `Intl.NumberFormat` when formatting the value. Defaults to the user's runtime locale. |
| `min`      | `number`                      | `0`     | The minimum value.                                                                                       |
| `max`      | `number`                      | `100`   | The maximum value. Reaching it puts the progress bar in the `complete` status.                           |
| `children` | `Snippet<[{ status }]>`       | —       | Content; receives the progress `status`.                                                                 |

::

| Attribute            | Description                                              |
| :------------------- | :------------------------------------------------------- |
| `data-progressing`   | Present while the value is a finite number below `max`.  |
| `data-complete`      | Present when the value reaches or exceeds `max`.         |
| `data-indeterminate` | Present when the value is `null` or not a finite number. |

### Track

Contains the progress bar indicator and represents the whole task.
Renders a `<div>` element.

::table{columns="Prop,Type,Default"}

| Prop       | Type                          | Default | Description                                    |
| :--------- | :---------------------------- | :------ | :--------------------------------------------- |
| `as`       | `keyof HTMLElementTagNameMap` | `'div'` | HTML element to render.                        |
| `class`    | `string`                      | —       | CSS class applied to the element.              |
| `style`    | `string`                      | —       | Inline style applied to the element.           |
| `children` | `Snippet<[{ status }]>`       | —       | Track content; receives the progress `status`. |

::

| Attribute            | Description                                              |
| :------------------- | :------------------------------------------------------- |
| `data-progressing`   | Present while the value is a finite number below `max`.  |
| `data-complete`      | Present when the value reaches or exceeds `max`.         |
| `data-indeterminate` | Present when the value is `null` or not a finite number. |

### Indicator

Visualizes how much of the task is done. Its `width` is set inline, from the value's percentage
position between `min` and `max`; in the indeterminate status no width is set.
Renders a `<div>` element.

::table{columns="Prop,Type,Default"}

| Prop       | Type                          | Default | Description                                                      |
| :--------- | :---------------------------- | :------ | :--------------------------------------------------------------- |
| `as`       | `keyof HTMLElementTagNameMap` | `'div'` | HTML element to render.                                          |
| `class`    | `string`                      | —       | CSS class applied to the element.                                |
| `style`    | `string`                      | —       | Inline style applied to the element, after the built-in `width`. |
| `children` | `Snippet<[{ status }]>`       | —       | Indicator content; receives the progress `status`.               |

::

| Attribute            | Description                                              |
| :------------------- | :------------------------------------------------------- |
| `data-progressing`   | Present while the value is a finite number below `max`.  |
| `data-complete`      | Present when the value reaches or exceeds `max`.         |
| `data-indeterminate` | Present when the value is `null` or not a finite number. |

### Value

A text element displaying the current value. Hidden from screen readers, which read the value from
`Root`.
Renders a `<span>` element.

::table{columns="Prop,Type,Default"}

| Prop       | Type                                                       | Default  | Description                                                                                                                                                                                                             |
| :--------- | :--------------------------------------------------------- | :------- | :---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `as`       | `keyof HTMLElementTagNameMap`                              | `'span'` | HTML element to render.                                                                                                                                                                                                 |
| `class`    | `string`                                                   | —        | CSS class applied to the element.                                                                                                                                                                                       |
| `style`    | `string`                                                   | —        | Inline style applied to the element.                                                                                                                                                                                    |
| `children` | `Snippet<[formattedValue: string, value: number \| null]>` | —        | Snippet receiving the formatted value and the raw number; `formattedValue` is `'indeterminate'` while the progress is indeterminate. Without it, the part renders the formatted value, and nothing while indeterminate. |

::

| Attribute            | Description                                              |
| :------------------- | :------------------------------------------------------- |
| `data-progressing`   | Present while the value is a finite number below `max`.  |
| `data-complete`      | Present when the value reaches or exceeds `max`.         |
| `data-indeterminate` | Present when the value is `null` or not a finite number. |

### Label

An accessible label for the progress bar.
Renders a `<span>` element.

::table{columns="Prop,Type,Default"}

| Prop       | Type                          | Default  | Description                                                                |
| :--------- | :---------------------------- | :------- | :------------------------------------------------------------------------- |
| `as`       | `keyof HTMLElementTagNameMap` | `'span'` | HTML element to render.                                                    |
| `class`    | `string`                      | —        | CSS class applied to the element.                                          |
| `style`    | `string`                      | —        | Inline style applied to the element.                                       |
| `id`       | `string`                      | auto     | Custom element ID. Associated with the progress bar via `aria-labelledby`. |
| `children` | `Snippet<[{ status }]>`       | —        | Label content; receives the progress `status`.                             |

::

| Attribute            | Description                                              |
| :------------------- | :------------------------------------------------------- |
| `data-progressing`   | Present while the value is a finite number below `max`.  |
| `data-complete`      | Present when the value reaches or exceeds `max`.         |
| `data-indeterminate` | Present when the value is `null` or not a finite number. |

## Additional types

### ProgressStatus

The `status` carried by the object handed to the `children` snippet of `Root`, `Track`, `Indicator` and `Label`.

```ts
type ProgressStatus = 'indeterminate' | 'progressing' | 'complete'
```
