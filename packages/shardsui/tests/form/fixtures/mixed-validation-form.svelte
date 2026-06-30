<script lang="ts">
  import { Field } from '$lib/components/field'
  import { Form } from '$lib/components/form'

  let { onFormSubmit }: { onFormSubmit?: (values: Record<string, unknown>) => void } = $props()
</script>

<Form {onFormSubmit}>
  <Field.Root name="custom" validate={() => 'custom error'}>
    <Field.Control data-testid="custom" />
  </Field.Root>
  <Field.Root name="native">
    <Field.Control data-testid="native" required />
  </Field.Root>
  <button type="submit">Submit</button>
</Form>
