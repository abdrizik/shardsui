# Checkbox

A tri-state checkable control.

:demo{name="checkbox/hero"}

## Anatomy

```svelte title="Anatomy"
<script>
  import { Checkbox } from '@shardsui/svelte/checkbox'
</script>

<Checkbox.Root>
  <Checkbox.Indicator />
</Checkbox.Root>
```

## Usage guidelines

- **Form controls must have an accessible name**: give the checkbox one by wrapping it in a `<label>`, or with `aria-label` / `aria-labelledby`.

## Examples

### Labeling a checkbox

The simplest way to name a checkbox is to wrap it in a `<label>`:

```svelte title="Wrapping a label around a checkbox"
<!-- [!code highlight] -->
<label>
  <Checkbox.Root>
    <Checkbox.Indicator>
      <!-- checkmark icon -->
    </Checkbox.Indicator>
  </Checkbox.Root>
  Accept terms and conditions
  <!-- [!code highlight] -->
</label>
```

`Checkbox.Root` renders a `<span>` by default so the wrapping `<label>` toggles the hidden `<input type="checkbox">` natively.

### Rendering as a native button

When you point a separate label at the checkbox with `for`/`id` instead of wrapping it, render it as a native button with `as="button"`:

```svelte title="Sibling label pattern with a native button"
<div>
  <label for="notifications-checkbox">Enable notifications</label>
  <Checkbox.Root id="notifications-checkbox" as="button">
    <Checkbox.Indicator />
  </Checkbox.Root>
</div>
```

### Form integration

[Field](/svelte/field) wires the label and form association:

```svelte title="Using Checkbox in a form"
<Form>
  <!-- [!code highlight] -->
  <Field.Root name="stayLoggedIn">
    <Field.Label>
      <Checkbox.Root />
      Stay logged in for 7 days
    </Field.Label>
  </Field.Root>
</Form>
```

## API reference

### Root

Represents the checkbox itself.
Renders a `<span>` element and a hidden `<input>` beside.

::table{columns="Prop,Type,Default"}

| Prop               | Type                                                                                                          | Default  | Description                                                                                                                                                                     |
| :----------------- | :------------------------------------------------------------------------------------------------------------ | :------- | :------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `as`               | `'span' \| 'button'`                                                                                          | `'span'` | HTML element to render.                                                                                                                                                         |
| `class`            | `string`                                                                                                      | —        | CSS class applied to the element.                                                                                                                                               |
| `style`            | `string`                                                                                                      | —        | Inline style applied to the element.                                                                                                                                            |
| `id`               | `string`                                                                                                      | auto     | ID of the control: the hidden input, or the root itself with `as="button"`. Used for label and field association.                                                               |
| `checked`          | `boolean`                                                                                                     | `false`  | Whether the checkbox is currently ticked. Pass an initial value for uncontrolled use, or `bind:checked` to control it.                                                          |
| `indeterminate`    | `boolean`                                                                                                     | `false`  | Whether the checkbox is in a mixed state: neither ticked, nor unticked.                                                                                                         |
| `disabled`         | `boolean`                                                                                                     | `false`  | Whether the component should ignore user interaction.                                                                                                                           |
| `readOnly`         | `boolean`                                                                                                     | `false`  | Whether the user should be unable to tick or untick the checkbox.                                                                                                               |
| `required`         | `boolean`                                                                                                     | `false`  | Whether the user must tick the checkbox before submitting a form.                                                                                                               |
| `name`             | `string`                                                                                                      | —        | Identifies the field when a form is submitted.                                                                                                                                  |
| `form`             | `string`                                                                                                      | —        | Identifies the form that owns the hidden input. Useful when the checkbox is rendered outside the form.                                                                          |
| `value`            | `string`                                                                                                      | —        | The checkbox's value. Identifies it within a Checkbox Group, falling back to `name` when omitted. A checked box submits `value`; with no `value`, it submits the native `"on"`. |
| `aria-labelledby`  | `string`                                                                                                      | —        | Accessible name for the checkbox.                                                                                                                                               |
| `aria-describedby` | `string`                                                                                                      | —        | Additional description IDs; merged with Field message IDs when wrapped in `Field.Root`.                                                                                         |
| `onCheckedChange`  | `(checked: boolean) => void`                                                                                  | —        | Event handler called when the checkbox is ticked or unticked.                                                                                                                   |
| `children`         | `Snippet<[{ touched, dirty, filled, focused, valid, checked, disabled, readOnly, required, indeterminate }]>` | —        | Content; receives the checkbox state.                                                                                                                                           |

::

| Attribute            | Description                                                        |
| :------------------- | :----------------------------------------------------------------- |
| `data-checked`       | Present when checked (and not indeterminate).                      |
| `data-unchecked`     | Present when unchecked (and not indeterminate).                    |
| `data-indeterminate` | Present when indeterminate.                                        |
| `data-disabled`      | Present when disabled.                                             |
| `data-readonly`      | Present when read-only.                                            |
| `data-required`      | Present when required.                                             |
| `data-valid`         | Present when the field is valid (wrapped in `Field.Root`).         |
| `data-invalid`       | Present when the field is invalid (wrapped in `Field.Root`).       |
| `data-touched`       | Present when the field has been touched (wrapped in `Field.Root`). |
| `data-dirty`         | Present when the value has changed (wrapped in `Field.Root`).      |
| `data-filled`        | Present when checked (wrapped in `Field.Root`).                    |
| `data-focused`       | Present when focused (wrapped in `Field.Root`).                    |

### Indicator

Indicates whether the checkbox is ticked.
Renders a `<span>` element.

::table{columns="Prop,Type,Default"}

| Prop          | Type                                                                                                                            | Default  | Description                                                                   |
| :------------ | :------------------------------------------------------------------------------------------------------------------------------ | :------- | :---------------------------------------------------------------------------- |
| `as`          | `keyof HTMLElementTagNameMap`                                                                                                   | `'span'` | HTML element to render.                                                       |
| `class`       | `string`                                                                                                                        | —        | CSS class applied to the element.                                             |
| `style`       | `string`                                                                                                                        | —        | Inline style applied to the element.                                          |
| `keepMounted` | `boolean`                                                                                                                       | `false`  | Keep in DOM when unchecked (for exit animations).                             |
| `children`    | `Snippet<[{ touched, dirty, filled, focused, valid, checked, disabled, readOnly, required, indeterminate, transitionStatus }]>` | —        | Content; receives the checkbox state plus the indicator's `transitionStatus`. |

::

Inherits the same data attributes as Root, plus:

| Attribute             | Description                                  |
| :-------------------- | :------------------------------------------- |
| `data-starting-style` | Present when the indicator is animating in.  |
| `data-ending-style`   | Present when the indicator is animating out. |
