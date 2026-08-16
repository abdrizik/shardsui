# Slider

A value picked along a range.

:demo{name="slider/hero"}

## Anatomy

```svelte title="Anatomy"
<script>
  import { Slider } from '@shardsui/svelte/slider'
</script>

<Slider.Root>
  <Slider.Label />
  <Slider.Value />
  <Slider.Control>
    <Slider.Track>
      <Slider.Indicator />
      <Slider.Thumb />
    </Slider.Track>
  </Slider.Control>
</Slider.Root>
```

## Usage guidelines

- **Form controls must have an accessible name**: a `<Slider.Label>` usually does the job; when the design has no visible label, give each `<Slider.Thumb>` its own `aria-label` instead. See [Labeling a slider](#examples-labeling-a-slider) and the [forms guide](/svelte/forms).

## Examples

### Range slider

Build a range slider in two steps:

1. Pass an array of values, and render one `<Slider.Thumb>` per value in that array
2. For server-side rendering, also give each thumb a numeric `index` matching the position of its value in the array

When two thumbs meet under the pointer, `thumbCollisionBehavior` on `<Slider.Root>` decides what happens next.

:demo{name="slider/range-slider"}

### Formatting the value

`format` and `locale` reach both `<Slider.Value>` and the thumbs' `aria-valuetext`. Pass a `children` snippet to `Value` to compose the text yourself:

```svelte title="Composing the value text"
<Slider.Value>
  {#snippet children(formattedValues)}
    <!-- [!code word:formattedValues] -->
    {formattedValues[0]} to {formattedValues[1]}
  {/snippet}
</Slider.Value>
```

### Thumb alignment

With the default `"center"` alignment, a thumb at `min` or `max` overhangs the ends of the control; `thumbAlignment="edge"` insets it so its edge lines up with the control's edge.

:demo{name="slider/edge-alignment"}

### Labeling a slider

When a single-thumb slider has no visible label — a volume control, say — put an `aria-label` on the `<Slider.Thumb>`:

```svelte title="Slider with invisible label"
<Slider.Root>
  <Slider.Control>
    <Slider.Track>
      <Slider.Indicator />
      <!-- [!code highlight] -->
      <Slider.Thumb aria-label="Volume" />
    </Slider.Track>
  </Slider.Control>
</Slider.Root>
```

If the label should be visible instead, render `<Slider.Label>`:

```svelte title="Slider with visible label"
<Slider.Root>
  <!-- [!code highlight] -->
  <Slider.Label>Volume</Slider.Label>
  <Slider.Control>
    <Slider.Track>
      <Slider.Indicator />
      <Slider.Thumb />
    </Slider.Track>
  </Slider.Control>
</Slider.Root>
```

A multi-thumb range slider needs both: keep the visible `<Slider.Label>`, and give each `<Slider.Thumb>` its own `aria-label` so screen readers can tell one thumb from another:

```svelte title="Labeling multi-thumb range sliders"
<Slider.Root value={[25, 75]}>
  <Slider.Label>Price range</Slider.Label>
  <Slider.Control>
    <Slider.Track>
      <Slider.Indicator />
      <!-- [!code highlight] -->
      <Slider.Thumb index={0} aria-label="Minimum price" />
      <!-- [!code highlight] -->
      <Slider.Thumb index={1} aria-label="Maximum price" />
    </Slider.Track>
  </Slider.Control>
</Slider.Root>
```

### Vertical

For a vertical slider, pass `orientation="vertical"` to `<Slider.Root>`.

:demo{name="slider/vertical"}

### Form integration

Give `<Slider.Root>` a `name` and its value is submitted with the surrounding form:

```svelte title="Using Slider in a form"
<Form>
  <!-- [!code highlight] -->
  <Slider.Root name="volume">
    <Slider.Label>Volume</Slider.Label>
    <Slider.Control>
      <Slider.Track>
        <Slider.Indicator />
        <Slider.Thumb />
      </Slider.Track>
    </Slider.Control>
  </Slider.Root>
</Form>
```

For a grouped multi-thumb range slider in a form, nest it in a [Fieldset](/svelte/fieldset): the legend names the group while each thumb keeps its own `aria-label`:

```svelte title="Using Fieldset with a multi-thumb slider"
<Field.Root>
  <!-- [!code highlight] -->
  <Fieldset.Root>
    <!-- [!code highlight] -->
    <Fieldset.Legend>Price range</Fieldset.Legend>
    <Slider.Root value={[25, 75]}>
      <Slider.Control>
        <Slider.Track>
          <Slider.Indicator />
          <!-- [!code highlight] -->
          <Slider.Thumb index={0} aria-label="Minimum price" />
          <!-- [!code highlight] -->
          <Slider.Thumb index={1} aria-label="Maximum price" />
        </Slider.Track>
      </Slider.Control>
    </Slider.Root>
  </Fieldset.Root>
</Field.Root>
```

## API reference

### Root

Groups all parts of the slider.
Renders a `<div>` element with `role="group"`.

::table{columns="Prop,Type,Default"}

| Prop                     | Type                                                                                                                                                      | Default        | Description                                                                                                                                               |
| :----------------------- | :-------------------------------------------------------------------------------------------------------------------------------------------------------- | :------------- | :-------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `as`                     | `keyof HTMLElementTagNameMap`                                                                                                                             | `'div'`        | HTML element to render.                                                                                                                                   |
| `class`                  | `string`                                                                                                                                                  | —              | CSS class applied to the element.                                                                                                                         |
| `style`                  | `string`                                                                                                                                                  | —              | Inline style applied to the element.                                                                                                                      |
| `id`                     | `string`                                                                                                                                                  | auto           | Custom element ID.                                                                                                                                        |
| `value`                  | `number \| readonly number[]`                                                                                                                             | `min`          | The slider value; an array makes it a range slider. Pass an initial value for uncontrolled use, or `bind:value` to control it.                            |
| `min`                    | `number`                                                                                                                                                  | `0`            | Minimum allowed value.                                                                                                                                    |
| `max`                    | `number`                                                                                                                                                  | `100`          | Maximum allowed value.                                                                                                                                    |
| `step`                   | `number`                                                                                                                                                  | `1`            | Granularity the value changes by.                                                                                                                         |
| `largeStep`              | `number`                                                                                                                                                  | `10`           | Granularity for `PageUp`/`PageDown` and `Shift + Arrow`.                                                                                                  |
| `orientation`            | `'horizontal' \| 'vertical'`                                                                                                                              | `'horizontal'` | Axis the slider runs along.                                                                                                                               |
| `disabled`               | `boolean`                                                                                                                                                 | `false`        | Disables the thumb inputs, stops pointer interaction, and blurs the slider if it holds focus.                                                             |
| `minStepsBetweenValues`  | `number`                                                                                                                                                  | `0`            | Minimum number of steps between neighbouring thumbs on a range slider.                                                                                    |
| `thumbCollisionBehavior` | `'push' \| 'swap' \| 'none'`                                                                                                                              | `'push'`       | What a dragged thumb does when it reaches its neighbour: push it along, swap places with it — focus follows the swap — or stop against it.                |
| `thumbAlignment`         | `'center' \| 'edge'`                                                                                                                                      | `'center'`     | How the thumb aligns to the track. `'center'` centres the thumb on its value; `'edge'` insets it so its edge meets the control's edge at `min` and `max`. |
| `name`                   | `string`                                                                                                                                                  | —              | Name submitted with the form, applied to every thumb input. Inside `Field.Root`, the field's `name` wins.                                                 |
| `form`                   | `string`                                                                                                                                                  | —              | ID of the form the thumb inputs belong to when rendered outside it.                                                                                       |
| `format`                 | `Intl.NumberFormatOptions`                                                                                                                                | —              | Options to format the value. Used by `Slider.Value` and the thumbs' `aria-valuetext`.                                                                     |
| `locale`                 | `Intl.LocalesArgument`                                                                                                                                    | —              | The locale used by `Intl.NumberFormat` when formatting the value. Defaults to the user's runtime locale.                                                  |
| `aria-labelledby`        | `string`                                                                                                                                                  | —              | ID of the element naming the slider. Takes precedence over `Slider.Label`.                                                                                |
| `aria-describedby`       | `string`                                                                                                                                                  | —              | ID of the element describing the slider; merged with Field message IDs when wrapped in `Field.Root`.                                                      |
| `onValueChange`          | `(value: number \| number[]) => void`                                                                                                                     | —              | Fires whenever the value changes.                                                                                                                         |
| `onValueCommitted`       | `(value: number \| number[]) => void`                                                                                                                     | —              | Fires when the value settles: on pointer release, or right after a keyboard or input change.                                                              |
| `children`               | `Snippet<[{ touched, dirty, filled, focused, valid, activeThumbIndex, disabled, dragging, orientation, max, min, minStepsBetweenValues, step, values }]>` | —              | Content; receives the slider state.                                                                                                                       |

::

| Attribute          | Description                                                             |
| :----------------- | :---------------------------------------------------------------------- |
| `data-dragging`    | Present while the user is dragging.                                     |
| `data-orientation` | Indicates the orientation of the slider.                                |
| `data-disabled`    | Present when the slider is disabled.                                    |
| `data-valid`       | Present when the field is valid (when wrapped in `Field.Root`).         |
| `data-invalid`     | Present when the field is invalid (when wrapped in `Field.Root`).       |
| `data-touched`     | Present when the field has been touched (when wrapped in `Field.Root`). |
| `data-dirty`       | Present when the value has changed (when wrapped in `Field.Root`).      |
| `data-focused`     | Present when focused (when wrapped in `Field.Root`).                    |

### Label

An accessible label for the slider, associated with every thumb. Clicking it focuses the thumb of a
single-thumb slider. Its ID defaults to one derived from the root's, and can be overridden with `id`.
Renders a `<div>` element.

::table{columns="Prop,Type,Default"}

| Prop       | Type                                                                                                                                                      | Default | Description                               |
| :--------- | :-------------------------------------------------------------------------------------------------------------------------------------------------------- | :------ | :---------------------------------------- |
| `as`       | `keyof HTMLElementTagNameMap`                                                                                                                             | `'div'` | HTML element to render.                   |
| `class`    | `string`                                                                                                                                                  | —       | CSS class applied to the element.         |
| `style`    | `string`                                                                                                                                                  | —       | Inline style applied to the element.      |
| `children` | `Snippet<[{ touched, dirty, filled, focused, valid, activeThumbIndex, disabled, dragging, orientation, max, min, minStepsBetweenValues, step, values }]>` | —       | Label content; receives the slider state. |

::

| Attribute          | Description                                                             |
| :----------------- | :---------------------------------------------------------------------- |
| `data-dragging`    | Present while the user is dragging.                                     |
| `data-orientation` | Indicates the orientation of the slider.                                |
| `data-disabled`    | Present when the slider is disabled.                                    |
| `data-valid`       | Present when the field is valid (when wrapped in `Field.Root`).         |
| `data-invalid`     | Present when the field is invalid (when wrapped in `Field.Root`).       |
| `data-touched`     | Present when the field has been touched (when wrapped in `Field.Root`). |
| `data-dirty`       | Present when the value has changed (when wrapped in `Field.Root`).      |
| `data-focused`     | Present when focused (when wrapped in `Field.Root`).                    |

### Value

Displays the current value of the slider as text.
Renders an `<output>` element pointing at the thumb inputs through `for`.

::table{columns="Prop,Type,Default"}

| Prop        | Type                                                     | Default    | Description                                                                                                                     |
| :---------- | :------------------------------------------------------- | :--------- | :------------------------------------------------------------------------------------------------------------------------------ |
| `as`        | `keyof HTMLElementTagNameMap`                            | `'output'` | HTML element to render.                                                                                                         |
| `class`     | `string`                                                 | —          | CSS class applied to the element.                                                                                               |
| `style`     | `string`                                                 | —          | Inline style applied to the element.                                                                                            |
| `aria-live` | `'off' \| 'polite' \| 'assertive'`                       | `'off'`    | Politeness of the `<output>` live region. Off by default, since each thumb already reports its own value.                       |
| `children`  | `Snippet<[formattedValues: string[], values: number[]]>` | —          | Snippet receiving the formatted values and the raw numbers. Without it, the formatted values are rendered joined by an en dash. |

::

| Attribute          | Description                                                             |
| :----------------- | :---------------------------------------------------------------------- |
| `data-dragging`    | Present while the user is dragging.                                     |
| `data-orientation` | Indicates the orientation of the slider.                                |
| `data-disabled`    | Present when the slider is disabled.                                    |
| `data-valid`       | Present when the field is valid (when wrapped in `Field.Root`).         |
| `data-invalid`     | Present when the field is invalid (when wrapped in `Field.Root`).       |
| `data-touched`     | Present when the field has been touched (when wrapped in `Field.Root`). |
| `data-dirty`       | Present when the value has changed (when wrapped in `Field.Root`).      |
| `data-focused`     | Present when focused (when wrapped in `Field.Root`).                    |

### Control

The interactive area of the slider: pressing anywhere inside it moves the nearest enabled thumb to
that position and starts a drag.
Renders a `<div>` element.

::table{columns="Prop,Type,Default"}

| Prop       | Type                                                                                                                                                      | Default | Description                                 |
| :--------- | :-------------------------------------------------------------------------------------------------------------------------------------------------------- | :------ | :------------------------------------------ |
| `as`       | `keyof HTMLElementTagNameMap`                                                                                                                             | `'div'` | HTML element to render.                     |
| `class`    | `string`                                                                                                                                                  | —       | CSS class applied to the element.           |
| `style`    | `string`                                                                                                                                                  | —       | Inline style applied to the element.        |
| `children` | `Snippet<[{ touched, dirty, filled, focused, valid, activeThumbIndex, disabled, dragging, orientation, max, min, minStepsBetweenValues, step, values }]>` | —       | Control content; receives the slider state. |

::

| Attribute          | Description                                                             |
| :----------------- | :---------------------------------------------------------------------- |
| `data-dragging`    | Present while the user is dragging.                                     |
| `data-orientation` | Indicates the orientation of the slider.                                |
| `data-disabled`    | Present when the slider is disabled.                                    |
| `data-valid`       | Present when the field is valid (when wrapped in `Field.Root`).         |
| `data-invalid`     | Present when the field is invalid (when wrapped in `Field.Root`).       |
| `data-touched`     | Present when the field has been touched (when wrapped in `Field.Root`). |
| `data-dirty`       | Present when the value has changed (when wrapped in `Field.Root`).      |
| `data-focused`     | Present when focused (when wrapped in `Field.Root`).                    |

### Track

Contains the indicator and the thumbs, and represents the entire range of the slider. `position:
relative` is set inline so the thumbs can be positioned against it.
Renders a `<div>` element.

::table{columns="Prop,Type,Default"}

| Prop       | Type                                                                                                                                                      | Default | Description                                                         |
| :--------- | :-------------------------------------------------------------------------------------------------------------------------------------------------------- | :------ | :------------------------------------------------------------------ |
| `as`       | `keyof HTMLElementTagNameMap`                                                                                                                             | `'div'` | HTML element to render.                                             |
| `class`    | `string`                                                                                                                                                  | —       | CSS class applied to the element.                                   |
| `style`    | `string`                                                                                                                                                  | —       | Inline style applied to the element, after the built-in `position`. |
| `children` | `Snippet<[{ touched, dirty, filled, focused, valid, activeThumbIndex, disabled, dragging, orientation, max, min, minStepsBetweenValues, step, values }]>` | —       | Track content; receives the slider state.                           |

::

| Attribute          | Description                                                             |
| :----------------- | :---------------------------------------------------------------------- |
| `data-dragging`    | Present while the user is dragging.                                     |
| `data-orientation` | Indicates the orientation of the slider.                                |
| `data-disabled`    | Present when the slider is disabled.                                    |
| `data-valid`       | Present when the field is valid (when wrapped in `Field.Root`).         |
| `data-invalid`     | Present when the field is invalid (when wrapped in `Field.Root`).       |
| `data-touched`     | Present when the field has been touched (when wrapped in `Field.Root`). |
| `data-dirty`       | Present when the value has changed (when wrapped in `Field.Root`).      |
| `data-focused`     | Present when focused (when wrapped in `Field.Root`).                    |

### Indicator

Visualizes the current value of the slider. Its offset and length along the track are set inline,
from the values' percentage positions between `min` and `max`.
Renders a `<div>` element.

::table{columns="Prop,Type,Default"}

| Prop       | Type                                                                                                                                                      | Default | Description                                                          |
| :--------- | :-------------------------------------------------------------------------------------------------------------------------------------------------------- | :------ | :------------------------------------------------------------------- |
| `as`       | `keyof HTMLElementTagNameMap`                                                                                                                             | `'div'` | HTML element to render.                                              |
| `class`    | `string`                                                                                                                                                  | —       | CSS class applied to the element.                                    |
| `style`    | `string`                                                                                                                                                  | —       | Inline style applied to the element, after the built-in positioning. |
| `children` | `Snippet<[{ touched, dirty, filled, focused, valid, activeThumbIndex, disabled, dragging, orientation, max, min, minStepsBetweenValues, step, values }]>` | —       | Indicator content; receives the slider state.                        |

::

| Attribute          | Description                                                             |
| :----------------- | :---------------------------------------------------------------------- |
| `data-dragging`    | Present while the user is dragging.                                     |
| `data-orientation` | Indicates the orientation of the slider.                                |
| `data-disabled`    | Present when the slider is disabled.                                    |
| `data-valid`       | Present when the field is valid (when wrapped in `Field.Root`).         |
| `data-invalid`     | Present when the field is invalid (when wrapped in `Field.Root`).       |
| `data-touched`     | Present when the field has been touched (when wrapped in `Field.Root`). |
| `data-dirty`       | Present when the value has changed (when wrapped in `Field.Root`).      |
| `data-focused`     | Present when focused (when wrapped in `Field.Root`).                    |

### Thumb

The draggable part of the slider at the tip of the indicator. Its offset along the track is set
inline.
Renders a `<div>` wrapping a visually hidden `<input type="range">`, which takes focus and carries
the thumb's value and ARIA.

::table{columns="Prop,Type,Default"}

| Prop               | Type                                                                                                                                                      | Default | Description                                                                                                           |
| :----------------- | :-------------------------------------------------------------------------------------------------------------------------------------------------------- | :------ | :-------------------------------------------------------------------------------------------------------------------- |
| `as`               | `keyof HTMLElementTagNameMap`                                                                                                                             | `'div'` | HTML element to render.                                                                                               |
| `class`            | `string`                                                                                                                                                  | —       | CSS class applied to the element.                                                                                     |
| `style`            | `string`                                                                                                                                                  | —       | Inline style applied to the element, after the built-in positioning.                                                  |
| `id`               | `string`                                                                                                                                                  | auto    | Custom element ID, applied to the thumb element.                                                                      |
| `index`            | `number`                                                                                                                                                  | —       | The thumb's index in the values array. Needed on a server-rendered range slider; otherwise it is read from DOM order. |
| `aria-label`       | `string`                                                                                                                                                  | —       | Accessible name for the thumb's input.                                                                                |
| `aria-labelledby`  | `string`                                                                                                                                                  | —       | Forwarded to the input. Falls back to `Slider.Label` when no `aria-label` is set.                                     |
| `aria-describedby` | `string`                                                                                                                                                  | —       | Forwarded to the input; merged with Field message IDs when wrapped in `Field.Root`.                                   |
| `aria-valuetext`   | `string`                                                                                                                                                  | —       | Forwarded to the input. Without it, a two-thumb slider announces `<value> start range` and `<value> end range`.       |
| `disabled`         | `boolean`                                                                                                                                                 | `false` | Disables this thumb's input and takes it out of pointer targeting.                                                    |
| `tabindex`         | `number`                                                                                                                                                  | —       | Forwarded to the input.                                                                                               |
| `onfocus`          | `(event: FocusEvent) => void`                                                                                                                             | —       | Focus handler forwarded to the input.                                                                                 |
| `onblur`           | `(event: FocusEvent) => void`                                                                                                                             | —       | Blur handler forwarded to the input.                                                                                  |
| `onkeydown`        | `(event: KeyboardEvent) => void`                                                                                                                          | —       | Keydown handler forwarded to the input, run before the slider's own handling.                                         |
| `children`         | `Snippet<[{ touched, dirty, filled, focused, valid, activeThumbIndex, disabled, dragging, orientation, max, min, minStepsBetweenValues, step, values }]>` | —       | Thumb content; receives the slider state.                                                                             |

::

| Attribute          | Description                                                             |
| :----------------- | :---------------------------------------------------------------------- |
| `data-index`       | The thumb's index in the values array (`0` on single-thumb sliders).    |
| `data-dragging`    | Present while the user is dragging.                                     |
| `data-orientation` | Indicates the orientation of the slider.                                |
| `data-disabled`    | Present when the slider is disabled.                                    |
| `data-valid`       | Present when the field is valid (when wrapped in `Field.Root`).         |
| `data-invalid`     | Present when the field is invalid (when wrapped in `Field.Root`).       |
| `data-touched`     | Present when the field has been touched (when wrapped in `Field.Root`). |
| `data-dirty`       | Present when the value has changed (when wrapped in `Field.Root`).      |
| `data-focused`     | Present when focused (when wrapped in `Field.Root`).                    |

**Keyboard:**

| Key                       | Action                                                                |
| :------------------------ | :-------------------------------------------------------------------- |
| `ArrowRight` / `ArrowUp`  | Increment by `step`.                                                  |
| `ArrowLeft` / `ArrowDown` | Decrement by `step`.                                                  |
| `Shift + Arrow`           | Increment/decrement by `largeStep`.                                   |
| `PageUp`                  | Increment by `largeStep`.                                             |
| `PageDown`                | Decrement by `largeStep`.                                             |
| `Home`                    | Set to `min` (or to the neighbouring thumb's bound on range sliders). |
| `End`                     | Set to `max` (or to the neighbouring thumb's bound on range sliders). |

`ArrowLeft` and `ArrowRight` are swapped in right-to-left text direction.
