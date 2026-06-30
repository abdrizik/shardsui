<script lang="ts">
  import { Form } from '$lib/components/form'
  import { Field } from '$lib/components/field'
  import { Fieldset } from '$lib/components/fieldset'

  let {
    onFormSubmit
  }: {
    onFormSubmit?: (values: Record<string, unknown>) => void
  } = $props()
</script>

<Form {onFormSubmit}>
  <Fieldset.Root disabled>
    <Field.Root name="disabled">
      <Field.Control required data-testid="disabled" />
    </Field.Root>
  </Fieldset.Root>
  <Field.Root name="enabled">
    <Field.Control value="sent" data-testid="enabled" />
  </Field.Root>
  <button type="submit" data-testid="submit">Submit</button>
</Form>
