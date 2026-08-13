# Field

A control with label and error.

:demo{name="field/hero"}

## Anatomy

```svelte title="Anatomy"
<script>
  import { Field } from '@shardsui/svelte/field'
</script>

<Field.Root>
  <Field.Label />
  <Field.Control />
  <Field.Description />
  <Field.Item />
  <Field.Error />
  <Field.Validity />
</Field.Root>
```

## API reference

### Root

Groups a control with its label, description and error.
Renders a `<div>` element.

::table{columns="Prop,Type,Default"}

| Prop                     | Type                                                              | Default      | Description                                                                                                                                                                                                  |
| :----------------------- | :---------------------------------------------------------------- | :----------- | :----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `as`                     | `keyof HTMLElementTagNameMap`                                     | `'div'`      | HTML element to render.                                                                                                                                                                                      |
| `class`                  | `string`                                                          | —            | CSS class applied to the element.                                                                                                                                                                            |
| `style`                  | `string`                                                          | —            | Inline style applied to the element.                                                                                                                                                                         |
| `name`                   | `string`                                                          | —            | Identifies the field when the form is submitted. Takes precedence over `name` on the control.                                                                                                                |
| `validate`               | `(value, formValues) => string \| string[] \| null \| Promise<…>` | `() => null` | Custom validation. Return an error message, an array of messages, or `null` when the value is valid. Async functions are supported, but they do not hold up submission under `validationMode="onSubmit"`.    |
| `validationMode`         | `'onSubmit' \| 'onBlur' \| 'onChange'`                            | —            | When the field is validated. Falls back to `validationMode` on the enclosing `<Form>`.                                                                                                                       |
| `validationDebounceTime` | `number`                                                          | `0`          | Milliseconds of inactivity to wait before running `validate`. Applies under `validationMode="onChange"`, and under `validationMode="onSubmit"` once a submit has been attempted. Skipped for an empty value. |
| `disabled`               | `boolean`                                                         | `false`      | Disables the field and every control inside it. An enclosing `Fieldset.Root` disables it too.                                                                                                                |
| `invalid`                | `boolean`                                                         | —            | Marks the field invalid whatever its native validity says. Useful when an external library owns the validation.                                                                                              |
| `dirty`                  | `boolean`                                                         | —            | Whether the value has changed from its initial value. Setting it stops the field tracking dirtiness itself.                                                                                                  |
| `touched`                | `boolean`                                                         | —            | Whether the field has been touched. Setting it stops the field tracking touches itself.                                                                                                                      |
| `children`               | `Snippet<[{ disabled, touched, dirty, valid, filled, focused }]>` | —            | Content; receives the field state.                                                                                                                                                                           |

::

| Attribute       | Description                                 |
| :-------------- | :------------------------------------------ |
| `data-disabled` | Present when the field is disabled.         |
| `data-touched`  | Present when the field has been touched.    |
| `data-dirty`    | Present when the field's value has changed. |
| `data-filled`   | Present when the field is filled.           |
| `data-focused`  | Present when the field control is focused.  |
| `data-valid`    | Present when the field is valid.            |
| `data-invalid`  | Present when the field is invalid.          |

### Label

An accessible label, associated with the field control automatically.
Renders a `<label>` element.

::table{columns="Prop,Type,Default"}

| Prop       | Type                                                              | Default   | Description                                                                                                                                                                                                                                                                   |
| :--------- | :---------------------------------------------------------------- | :-------- | :---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `as`       | `keyof HTMLElementTagNameMap`                                     | `'label'` | HTML element to render. Any tag other than `label` drops the native `for` association and forwards clicks to the registered control instead — use `span` for `<button>`-based controls such as `Select.Trigger`, where native label focus and hover behavior gets in the way. |
| `class`    | `string`                                                          | —         | CSS class applied to the element.                                                                                                                                                                                                                                             |
| `style`    | `string`                                                          | —         | Inline style applied to the element.                                                                                                                                                                                                                                          |
| `id`       | `string`                                                          | auto      | Custom element ID.                                                                                                                                                                                                                                                            |
| `children` | `Snippet<[{ disabled, touched, dirty, valid, filled, focused }]>` | —         | Content; receives the field state.                                                                                                                                                                                                                                            |

::

| Attribute       | Description                                 |
| :-------------- | :------------------------------------------ |
| `data-disabled` | Present when the field or item is disabled. |
| `data-touched`  | Present when the field has been touched.    |
| `data-dirty`    | Present when the field's value has changed. |
| `data-filled`   | Present when the field is filled.           |
| `data-focused`  | Present when the field control is focused.  |
| `data-valid`    | Present when the field is valid.            |
| `data-invalid`  | Present when the field is invalid.          |

### Control

The form control to label and validate.
Renders an `<input>` element.

::table{columns="Prop,Type,Default"}

| Prop               | Type                           | Default   | Description                                                           |
| :----------------- | :----------------------------- | :-------- | :-------------------------------------------------------------------- |
| `as`               | `'input' \| 'textarea'`        | `'input'` | HTML element to render.                                               |
| `class`            | `string`                       | —         | CSS class applied to the element.                                     |
| `style`            | `string`                       | —         | Inline style applied to the element.                                  |
| `id`               | `string`                       | auto      | Custom element ID. `Field.Label` links to it.                         |
| `name`             | `string`                       | —         | Form field name. Overridden by `Field.Root` `name`.                   |
| `value`            | `string \| number \| string[]` | —         | The value of the control (use `bind:value`).                          |
| `onValueChange`    | `(value: string) => void`      | —         | Fires on every input change.                                          |
| `disabled`         | `boolean`                      | `false`   | Disables the control. Also disabled when `Field.Root` is disabled.    |
| `autofocus`        | `boolean`                      | `false`   | Whether the control should receive focus on mount.                    |
| `aria-labelledby`  | `string`                       | —         | Accessible name IDs. Replaces the `Field.Label` association when set. |
| `aria-describedby` | `string`                       | —         | Description IDs; merged with the field's description and error IDs.   |

::

Other standard `<input>` props (`type`, `required`, `pattern`, `placeholder`, etc.) pass through, as
do `<textarea>` props (`rows`, `cols`, `wrap`) when `as="textarea"`.

| Attribute       | Description                                        |
| :-------------- | :------------------------------------------------- |
| `data-disabled` | Present when the field or the control is disabled. |
| `data-touched`  | Present when the field has been touched.           |
| `data-dirty`    | Present when the field's value has changed.        |
| `data-filled`   | Present when the field is filled.                  |
| `data-focused`  | Present when the field control is focused.         |
| `data-valid`    | Present when the field is valid.                   |
| `data-invalid`  | Present when the field is invalid.                 |

### Description

Additional information about the field, added to the control's accessible description.
Renders a `<p>` element.

::table{columns="Prop,Type,Default"}

| Prop       | Type                                                              | Default | Description                          |
| :--------- | :---------------------------------------------------------------- | :------ | :----------------------------------- |
| `as`       | `keyof HTMLElementTagNameMap`                                     | `'p'`   | HTML element to render.              |
| `class`    | `string`                                                          | —       | CSS class applied to the element.    |
| `style`    | `string`                                                          | —       | Inline style applied to the element. |
| `id`       | `string`                                                          | auto    | Custom element ID.                   |
| `children` | `Snippet<[{ disabled, touched, dirty, valid, filled, focused }]>` | —       | Content; receives the field state.   |

::

| Attribute       | Description                                 |
| :-------------- | :------------------------------------------ |
| `data-disabled` | Present when the field or item is disabled. |
| `data-touched`  | Present when the field has been touched.    |
| `data-dirty`    | Present when the field's value has changed. |
| `data-filled`   | Present when the field is filled.           |
| `data-focused`  | Present when the field control is focused.  |
| `data-valid`    | Present when the field is valid.            |
| `data-invalid`  | Present when the field is invalid.          |

### Item

Groups one item of a checkbox or radio group with its own label and description.
Renders a `<div>` element.

::table{columns="Prop,Type,Default"}

| Prop       | Type                                                              | Default | Description                                                                                     |
| :--------- | :---------------------------------------------------------------- | :------ | :---------------------------------------------------------------------------------------------- |
| `as`       | `keyof HTMLElementTagNameMap`                                     | `'div'` | HTML element to render.                                                                         |
| `class`    | `string`                                                          | —       | CSS class applied to the element.                                                               |
| `style`    | `string`                                                          | —       | Inline style applied to the element.                                                            |
| `disabled` | `boolean`                                                         | `false` | Disables the checkbox or radio inside the item. A disabled `Field.Root` disables it regardless. |
| `children` | `Snippet<[{ disabled, touched, dirty, valid, filled, focused }]>` | —       | Content; receives the field state.                                                              |

::

| Attribute       | Description                                 |
| :-------------- | :------------------------------------------ |
| `data-disabled` | Present when the field or item is disabled. |
| `data-touched`  | Present when the field has been touched.    |
| `data-dirty`    | Present when the field's value has changed. |
| `data-filled`   | Present when the field is filled.           |
| `data-focused`  | Present when the field control is focused.  |
| `data-valid`    | Present when the field is valid.            |
| `data-invalid`  | Present when the field is invalid.          |

### Error

An error message shown when the field fails validation. While visible, it is part of the control's
accessible description.
Renders a `<div>` element.

::table{columns="Prop,Type,Default"}

| Prop       | Type                                                                                | Default | Description                                                                                                                                                                                                                         |
| :--------- | :---------------------------------------------------------------------------------- | :------ | :---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `as`       | `keyof HTMLElementTagNameMap`                                                       | `'div'` | HTML element to render.                                                                                                                                                                                                             |
| `class`    | `string`                                                                            | —       | CSS class applied to the element.                                                                                                                                                                                                   |
| `style`    | `string`                                                                            | —       | Inline style applied to the element.                                                                                                                                                                                                |
| `id`       | `string`                                                                            | auto    | Custom element ID.                                                                                                                                                                                                                  |
| `match`    | `boolean \| keyof ValidityState`                                                    | —       | `true` = always render. `false` or omitted = render when the field is invalid or has a form error, unless the field is disabled. A `ValidityState` key (e.g. `"valueMissing"`) = render only when that native validity flag is set. |
| `children` | `Snippet<[{ disabled, touched, dirty, valid, filled, focused, transitionStatus }]>` | —       | Content; receives the field error state.                                                                                                                                                                                            |

::

Without `children`, the part renders the current error message, or a `<ul>` of them when there is
more than one.

| Attribute             | Description                                      |
| :-------------------- | :----------------------------------------------- |
| `data-disabled`       | Present when the field is disabled.              |
| `data-touched`        | Present when the field has been touched.         |
| `data-dirty`          | Present when the field's value has changed.      |
| `data-filled`         | Present when the field is filled.                |
| `data-focused`        | Present when the field control is focused.       |
| `data-valid`          | Present when the field is valid.                 |
| `data-invalid`        | Present when the field is invalid.               |
| `data-starting-style` | Present when the error message is animating in.  |
| `data-ending-style`   | Present when the error message is animating out. |

### Validity

Renders custom content from the field's validity state.
Doesn't render its own HTML element.

::table{columns="Prop,Type,Default"}

| Prop       | Type                                                                            | Default | Description                                                                                                                         |
| :--------- | :------------------------------------------------------------------------------ | :------ | :---------------------------------------------------------------------------------------------------------------------------------- |
| `children` | `Snippet<[{ validity, error, errors, value, initialValue, transitionStatus }]>` | —       | Required. Content; receives the field validity state. See [Showing the error](/svelte/forms#showing-the-error) for a usage example. |

::
