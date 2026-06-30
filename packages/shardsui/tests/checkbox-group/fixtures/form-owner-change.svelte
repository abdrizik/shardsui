<script lang="ts">
  import { Checkbox } from '$lib/components/checkbox'
  import { CheckboxGroup } from '$lib/components/checkbox-group'
  import { Field } from '$lib/components/field'
  import { Form } from '$lib/components/form'

  let { onFormSubmit }: { onFormSubmit: (values: Record<string, unknown>) => void } = $props()

  let external = $state(false)
</script>

<form id="external-form"></form>
<Form {onFormSubmit}>
  <Field.Root name="group">
    <CheckboxGroup value={[]}>
      <Checkbox.Root value="checkbox" form={external ? 'external-form' : undefined} required />
    </CheckboxGroup>
  </Field.Root>
  <button type="button" onclick={() => (external = true)}>Move</button>
  <button type="submit">Submit</button>
</Form>
