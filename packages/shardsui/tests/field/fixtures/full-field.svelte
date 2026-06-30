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
  data-testid="root"
  {name}
  {invalid}
  {disabled}
  {validate}
  {validationMode}
  {validationDebounceTime}
  {dirty}
  {touched}
>
  <Field.Label data-testid="label">Label</Field.Label>
  <Field.Control data-testid="control" {required} />
  <Field.Description data-testid="description">Description</Field.Description>
  <Field.Error data-testid="error">Error message</Field.Error>
</Field.Root>
