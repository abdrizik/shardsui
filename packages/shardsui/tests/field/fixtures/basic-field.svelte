<script lang="ts">
  import { Field } from '$lib/components/field'
  let {
    name = undefined,
    invalid = undefined,
    disabled = undefined,
    validate = undefined,
    required = undefined,
    validationMode = undefined,
    validationDebounceTime = undefined,
    dirty = undefined,
    touched = undefined
  } = $props()
</script>

<Field.Root
  {name}
  {invalid}
  {disabled}
  {validate}
  {validationMode}
  {validationDebounceTime}
  {dirty}
  {touched}
>
  <Field.Label>My Label</Field.Label>
  <Field.Control {required} />
  <Field.Description>Helpful hint</Field.Description>
  <Field.Error>Error message</Field.Error>
</Field.Root>
