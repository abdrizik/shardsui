# Form

A validated form.

:demo{name="form/hero"}

## Anatomy

Pair Form with [Field](/svelte/field):

```svelte title="Anatomy"
<script>
  import { Form } from '@shardsui/svelte/form'
  import { Field } from '@shardsui/svelte/field'
</script>

<Form>
  <Field.Root>
    <Field.Label />
    <Field.Control />
    <Field.Error />
  </Field.Root>
</Form>
```

## Examples

### Validating from code

The component instance, obtained with `bind:this`, exposes `validate()`. It runs every field; pass
a field `name` to run just that one.

```svelte title="Triggering validation without submitting"
<script>
  let form = $state()
</script>

<Form bind:this={form}>
  <Field.Root name="email">
    <Field.Control type="email" required />
    <Field.Error />
  </Field.Root>
  <button type="button" onclick={() => form.validate('email')}>Check email</button>
</Form>
```

The `name` matched is the one on `Field.Root`, falling back to the `name` on the control.

## API reference

Renders a `<form>` element. Submitting validates every field first; if one fails, the native submit
is cancelled and focus moves to the first invalid control, selecting its text when it is an
`<input>`.

::table{columns="Prop,Type,Default"}

| Prop             | Type                                   | Default      | Description                                                                                                                                  |
| :--------------- | :------------------------------------- | :----------- | :------------------------------------------------------------------------------------------------------------------------------------------- |
| `as`             | `keyof HTMLElementTagNameMap`          | `'form'`     | HTML element to render.                                                                                                                      |
| `class`          | `string`                               | —            | CSS class applied to the element.                                                                                                            |
| `style`          | `string`                               | —            | Inline style applied to the element.                                                                                                         |
| `novalidate`     | `boolean`                              | `true`       | Disables native browser validation. Set `false` to re-enable it.                                                                             |
| `validationMode` | `'onSubmit' \| 'onBlur' \| 'onChange'` | `'onSubmit'` | When fields are validated. `validationMode` on `Field.Root` overrides it.                                                                    |
| `errors`         | `Record<string, string \| string[]>`   | —            | Errors supplied from outside, typically by a server or a form action. Keyed by field `name`; an error clears when its field's value changes. |
| `onsubmit`       | `(event: SubmitEvent) => void`         | —            | Native submit handler. Runs only after validation passes.                                                                                    |
| `onFormSubmit`   | `(values: FormValues) => void`         | —            | Receives every named field's value as a plain object. Calls `preventDefault()` on the native submit event.                                   |
| `children`       | `Snippet`                              | —            | Content.                                                                                                                                     |

::

The component instance, obtained with `bind:this`, exposes:

| Method                         | Description                                                                                                                                                |
| :----------------------------- | :--------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `validate(fieldName?: string)` | Runs validation. With `fieldName`, only that field — matched against `Field.Root`'s `name`, falling back to the control's `name`. Without it, every field. |

`<Form>` is generic over `FormValues extends Record<string, unknown>`, which defaults to `Record<string, unknown>`. Set it to type the object `onFormSubmit` receives.

Other standard `<form>` attributes (`method`, `action`, `target`, `enctype`) pass through.
