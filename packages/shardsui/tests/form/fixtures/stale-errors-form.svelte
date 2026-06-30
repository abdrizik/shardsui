<script lang="ts">
  import { Field } from '$lib/components/field'
  import { Form } from '$lib/components/form'

  let {
    errors,
    onFormSubmit
  }: {
    errors?: Record<string, string | string[]>
    onFormSubmit?: (values: Record<string, unknown>) => void
  } = $props()
</script>

<Form {errors} {onFormSubmit}>
  <Field.Root name="name">
    <Field.Control data-testid="name" />
    <Field.Error data-testid="name-error" />
  </Field.Root>
  <button type="submit">Submit</button>
</Form>
