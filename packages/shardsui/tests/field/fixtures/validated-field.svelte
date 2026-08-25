<script lang="ts">
  import { Field, type FieldValidator } from '$lib/components/field'
  import type { FormValidationMode } from '$lib/components/form'
  let {
    validate,
    validationMode = 'onBlur',
    validationDebounceTime
  }: {
    validate?: FieldValidator
    validationMode?: FormValidationMode
    validationDebounceTime?: number
  } = $props()
</script>

<Field.Root {validate} {validationMode} {validationDebounceTime}>
  <Field.Label>Label</Field.Label>
  <Field.Control data-testid="control" />
  <Field.Description data-testid="description">Description</Field.Description>
  <Field.Error data-testid="error" />
</Field.Root>
