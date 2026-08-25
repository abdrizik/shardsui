<script lang="ts">
  import { Form } from '$lib/components/form'
  import { Field, type FieldValidator } from '$lib/components/field'

  let {
    validate,
    onsubmit
  }: {
    validate?: FieldValidator
    onsubmit?: (event: SubmitEvent) => void
  } = $props()
</script>

<Form {onsubmit}>
  <Field.Root {validate}>
    <Field.Control />
  </Field.Root>
  <button type="submit">Submit</button>
</Form>
