<script lang="ts">
  import { Field } from '$lib/components/field'
  import { Form } from '$lib/components/form'
  import type { FormErrors } from '$lib/components/form/form.svelte'

  let errors = $state<FormErrors | undefined>()

  function onFormSubmit() {
    const next: FormErrors = { first: 'First error', second: 'Second error' }
    void Promise.resolve().then(() => {
      errors = next
    })
  }
</script>

<Form {errors} {onFormSubmit}>
  <Field.Root name="first">
    <Field.Control data-testid="first" />
    <Field.Error data-testid="first-error" />
  </Field.Root>
  <Field.Root name="second">
    <Field.Control data-testid="second" />
    <Field.Error data-testid="second-error" />
  </Field.Root>
  <button type="submit">Submit</button>
</Form>
