<script lang="ts">
  import { Checkbox } from '$lib/components/checkbox'
  import { CheckboxGroup } from '$lib/components/checkbox-group'
  import { Field } from '$lib/components/field'
  import { Form } from '$lib/components/form'

  let { onFormSubmit }: { onFormSubmit: (values: Record<string, unknown>) => void } = $props()
</script>

<Form {onFormSubmit}>
  <Field.Root name="fruits">
    <CheckboxGroup value={['fruits']}>
      <Checkbox.Root />
    </CheckboxGroup>
  </Field.Root>
  <button type="submit">Submit</button>
</Form>
