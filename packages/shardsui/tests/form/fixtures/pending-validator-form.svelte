<script lang="ts">
  import { Form } from '$lib/components/form'
  import { Field } from '$lib/components/field'

  let {
    validate,
    onsubmit
  }: {
    validate?: (value: unknown) => Promise<string | string[] | null>
    onsubmit?: (event: SubmitEvent) => void
  } = $props()
</script>

<Form {onsubmit}>
  <Field.Root {validate}>
    <Field.Control />
  </Field.Root>
  <button type="submit">Submit</button>
</Form>
