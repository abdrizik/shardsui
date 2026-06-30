<script lang="ts">
  import { Field } from '$lib/components/field'
  import { Form } from '$lib/components/form'

  let { formError = undefined }: { formError?: string } = $props()
</script>

<Form errors={formError ? { username: formError } : {}}>
  <Field.Root name="username">
    <Field.Control data-testid="control" value="admin" required />
    <Field.Error match="valueMissing" data-testid="value-missing-error"
      >Username is required.</Field.Error
    >
    <Field.Error match={false} data-testid="default-error" />
  </Field.Root>
</Form>
