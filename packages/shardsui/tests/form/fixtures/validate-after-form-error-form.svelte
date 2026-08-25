<script lang="ts">
  import { Form } from '$lib/components/form'
  import { Field, type FieldValidator } from '$lib/components/field'

  let { validate }: { validate?: FieldValidator } = $props()

  let errors = $state<Record<string, string | string[]>>({})

  function onsubmit(event: SubmitEvent) {
    event.preventDefault()
    const formData = new FormData(event.currentTarget as HTMLFormElement)
    const name = String(formData.get('name') ?? '')
    errors = name === 'abcde' ? { name: 'submit error' } : {}
  }
</script>

<Form {errors} {onsubmit}>
  <Field.Root name="name" {validate}>
    <Field.Control data-testid="name" />
    <Field.Error data-testid="name-error" />
  </Field.Root>
  <button type="submit">Submit</button>
</Form>
