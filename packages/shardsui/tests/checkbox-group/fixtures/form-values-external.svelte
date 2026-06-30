<script lang="ts">
  import { Checkbox } from '$lib/components/checkbox'
  import { CheckboxGroup } from '$lib/components/checkbox-group'
  import { Field } from '$lib/components/field'
  import { Form } from '$lib/components/form'

  let { onFormSubmit }: { onFormSubmit: (values: Record<string, unknown>) => void } = $props()
</script>

<form id="external-form"></form>
<Form {onFormSubmit}>
  <Field.Root name="fruits">
    <CheckboxGroup value={['apple', 'banana']}>
      <Checkbox.Root value="apple" />
      <Checkbox.Root value="banana" form="external-form" />
    </CheckboxGroup>
  </Field.Root>
  <button type="submit">Submit</button>
</Form>
