<script lang="ts">
  import { Form } from '$lib/components/form'
  import { Field } from '$lib/components/field'

  let { errors }: { errors?: Record<string, string | string[]> } = $props()
</script>

<Form {errors}>
  <Field.Root name="name">
    <Field.Label>Name</Field.Label>
    <Field.Control data-testid="name" />
    <Field.Error data-testid="name-error" />
  </Field.Root>
</Form>
