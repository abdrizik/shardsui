<script lang="ts">
  import { Checkbox } from '$lib/components/checkbox'
  import { CheckboxGroup } from '$lib/components/checkbox-group'
  import { Field } from '$lib/components/field'
  import { Form } from '$lib/components/form'

  let { onFormSubmit }: { onFormSubmit: (values: Record<string, unknown>) => void } = $props()
</script>

<form id="external-form"></form>
<Form {onFormSubmit}>
  <Field.Root name="group">
    <CheckboxGroup value={[]}>
      <Checkbox.Root value="external" form="external-form" required />
      <Checkbox.Root value="current" />
    </CheckboxGroup>
  </Field.Root>
  <button type="submit">Submit</button>
</Form>
