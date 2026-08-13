# Input

A text entry field.

:demo{name="input/hero"}

## Anatomy

```svelte title="Anatomy"
<script>
  import { Input } from '@shardsui/svelte/input'
</script>

<Input />
```

## Usage guidelines

- **Form controls must have an accessible name**: give the input a `<label>` element, or wrap it in the `Field` parts. See the [forms guide](/svelte/forms).
- **`Input` is `Field.Control`** under a shorter import: inside a `<Field.Root>` it picks up the label association, validation state and error bindings documented in [Field](/svelte/field). Outside one it is a plain `<input>`.

## API reference

::table{columns="Prop,Type,Default"}

| Prop               | Type                           | Default   | Description                                                           |
| :----------------- | :----------------------------- | :-------- | :-------------------------------------------------------------------- |
| `as`               | `'input' \| 'textarea'`        | `'input'` | HTML element to render.                                               |
| `class`            | `string`                       | —         | CSS class applied to the element.                                     |
| `style`            | `string`                       | —         | Inline style applied to the element.                                  |
| `id`               | `string`                       | auto      | Custom element ID. `Field.Label` links to it.                         |
| `name`             | `string`                       | —         | Form field name. Overridden by `Field.Root` `name`.                   |
| `value`            | `string \| number \| string[]` | —         | The input's value (use `bind:value`).                                 |
| `onValueChange`    | `(value: string) => void`      | —         | Fires with the new value on every input event.                        |
| `disabled`         | `boolean`                      | `false`   | Disables the input. Also disabled when `Field.Root` is disabled.      |
| `autofocus`        | `boolean`                      | `false`   | Focuses the input on mount.                                           |
| `aria-labelledby`  | `string`                       | —         | Accessible name IDs. Replaces the `Field.Label` association when set. |
| `aria-describedby` | `string`                       | —         | Description IDs; merged with the field's description and error IDs.   |

::

Other standard `<input>` props (`type`, `required`, `pattern`, `placeholder`, etc.) pass through, as
do `<textarea>` props (`rows`, `cols`, `wrap`) when `as="textarea"`.

Outside a `<Field.Root>` only `data-disabled` and a forwarded `aria-describedby` are emitted.

| Attribute       | Description                                      |
| :-------------- | :----------------------------------------------- |
| `data-disabled` | Present when the field or the input is disabled. |
| `data-touched`  | Present when the field has been touched.         |
| `data-dirty`    | Present when the field's value has changed.      |
| `data-filled`   | Present when the field is filled.                |
| `data-focused`  | Present when the field control is focused.       |
| `data-valid`    | Present when the field is valid.                 |
| `data-invalid`  | Present when the field is invalid.               |
