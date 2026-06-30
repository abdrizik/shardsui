<script lang="ts">
  import { Form } from '$lib/components/form'
  import { Field } from '$lib/components/field'

  let {
    onFormSubmit
  }: {
    onFormSubmit?: (values: Record<string, unknown>) => void
  } = $props()

  let disabled = $state(false)
</script>

<Form {onFormSubmit}>
  <Field.Root name="control">
    <Field.Control {disabled} required data-testid="control" />
  </Field.Root>
  <button type="button" data-testid="disable" onclick={() => (disabled = true)}>Disable</button>
  <button type="button" data-testid="enable" onclick={() => (disabled = false)}>Enable</button>
  <button type="submit" data-testid="submit">Submit</button>
</Form>
