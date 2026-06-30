<script lang="ts">
  import { Form } from '$lib/components/form'
  import { Field } from '$lib/components/field'

  let { onFormSubmit }: { onFormSubmit?: (values: Record<string, unknown>) => void } = $props()
</script>

<Form {onFormSubmit}>
  <Field.Root name="username">
    <Field.Control value="" required />
    <Field.Error data-testid="error" />
  </Field.Root>
  <button type="submit">submit</button>
</Form>
