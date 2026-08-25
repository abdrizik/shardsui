<script lang="ts">
  import { Form } from '$lib/components/form'
  import { Field } from '$lib/components/field'

  let errors = $state<Record<string, string | string[]>>({})

  function onsubmit(event: SubmitEvent) {
    event.preventDefault()
    const formData = new FormData(event.currentTarget as HTMLFormElement)
    const name = String(formData.get('name') ?? '')
    const age = String(formData.get('age') ?? '')
    errors = {
      ...(name === '' && { name: 'Name is required' }),
      ...(age === '' && { age: 'Age is required' })
    }
  }
</script>

<Form {errors} {onsubmit}>
  <Field.Root name="name">
    <Field.Control data-testid="name" />
    <Field.Error data-testid="name-error" />
  </Field.Root>
  <Field.Root name="age">
    <Field.Control data-testid="age" />
    <Field.Error data-testid="age-error" />
  </Field.Root>
  <button type="submit">Submit</button>
</Form>
