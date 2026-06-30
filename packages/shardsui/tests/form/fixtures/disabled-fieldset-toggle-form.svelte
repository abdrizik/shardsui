<script lang="ts">
  import { Form } from '$lib/components/form'
  import { Field } from '$lib/components/field'
  import { Fieldset } from '$lib/components/fieldset'

  let {
    onFormSubmit
  }: {
    onFormSubmit?: (values: Record<string, unknown>) => void
  } = $props()

  let disabled = $state(false)
</script>

<Form {onFormSubmit}>
  <Fieldset.Root {disabled}>
    <Field.Root name="disabled">
      <Field.Control required data-testid="control" />
      <Field.Error data-testid="error" />
    </Field.Root>
  </Fieldset.Root>
  <button type="button" data-testid="disable" onclick={() => (disabled = true)}>Disable</button>
  <button type="submit" data-testid="submit">Submit</button>
</Form>
