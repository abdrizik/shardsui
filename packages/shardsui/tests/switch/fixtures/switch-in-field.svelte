<script lang="ts">
  import { Switch } from '$lib/components/switch'
  import { Field } from '$lib/components/field'
  let {
    disabled = false,
    name = undefined,
    required = false,
    checked = $bindable(false),
    validate = undefined,
    validationMode = undefined,
    ...rest
  } = $props()
</script>

<Field.Root {disabled} {name} {validate} {validationMode}>
  <Field.Label>Label</Field.Label>
  <Switch.Root {required} {checked} data-testid="switch" {...rest}>
    <Switch.Thumb />
  </Switch.Root>
  <Field.Description data-testid="description">Description</Field.Description>
  <Field.Error data-testid="error">Error</Field.Error>
</Field.Root>
