<script lang="ts">
  import { Form } from '$lib/components/form'
  import { Field } from '$lib/components/field'

  let { onsubmit }: { onsubmit?: (event: SubmitEvent) => void } = $props()
</script>

<Form {onsubmit}>
  <Field.Root>
    <Field.Control required />
    <Field.Error data-testid="error" />
  </Field.Root>
  <button>Submit</button>
</Form>
