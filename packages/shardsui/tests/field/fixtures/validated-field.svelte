<script lang="ts">
  import { Field } from '$lib/components/field'
  import type { FormValidationMode } from '$lib/components/form'
  let {
    validate = undefined,
    validationMode = 'onBlur' as FormValidationMode,
    validationDebounceTime = undefined
  } = $props()
</script>

<Field.Root {validate} {validationMode} {validationDebounceTime}>
  <Field.Label>Label</Field.Label>
  <Field.Control data-testid="control" />
  <Field.Description data-testid="description">Description</Field.Description>
  <Field.Error data-testid="error" />
</Field.Root>
