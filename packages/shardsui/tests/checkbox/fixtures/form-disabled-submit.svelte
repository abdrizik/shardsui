<script lang="ts">
  import { Checkbox } from '$lib/components/checkbox'
  import { Field } from '$lib/components/field'
  import { Form } from '$lib/components/form'

  let { onsubmit = undefined }: { onsubmit?: (event: SubmitEvent) => void } = $props()
</script>

<Form {onsubmit}>
  <Field.Root name="test-checkbox">
    <Checkbox.Root />
  </Field.Root>
  <button type="submit" disabled>Disabled</button>
  <button type="submit">Enabled</button>
</Form>
