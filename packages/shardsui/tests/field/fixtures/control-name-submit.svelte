<script lang="ts">
  import { Field } from '$lib/components/field'
  import { Form } from '$lib/components/form'

  let {
    onFormSubmit,
    validate
  }: {
    onFormSubmit: (values: Record<string, unknown>) => void
    validate: (value: unknown, formValues: unknown) => null
  } = $props()
</script>

<Form {onFormSubmit}>
  <Field.Root>
    <Field.Control name="email" value="one@example.com" />
  </Field.Root>
  <Field.Root name="confirmEmail" {validate}>
    <Field.Control value="one@example.com" />
  </Field.Root>
  <button type="submit">submit</button>
</Form>
