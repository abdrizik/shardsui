<script lang="ts">
  import { Field } from '$lib/components/field'
  import { Form } from '$lib/components/form'
  import type { FormErrors } from '$lib/components/form/form.svelte'

  let { errors }: { errors: FormErrors } = $props()
</script>

<Form {errors}>
  <Field.Root name="username">
    <Field.Control value="admin" />
    <Field.Error data-testid="default-error" />
  </Field.Root>
</Form>
