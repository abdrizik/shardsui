<script lang="ts">
  import { Checkbox } from '$lib/components/checkbox'
  import { Field } from '$lib/components/field'
  let {
    disabled = false,
    invalid = false,
    name = undefined,
    required = false,
    checked = $bindable(false),
    validate = undefined,
    validationMode = undefined
  } = $props()
</script>

<Field.Root {disabled} {invalid} {name} {validate} {validationMode}>
  <Field.Label>Label</Field.Label>
  <Checkbox.Root {required} bind:checked data-testid="checkbox">
    <Checkbox.Indicator />
  </Checkbox.Root>
  <Field.Description data-testid="description">Description</Field.Description>
  <Field.Error data-testid="error">Error</Field.Error>
</Field.Root>
