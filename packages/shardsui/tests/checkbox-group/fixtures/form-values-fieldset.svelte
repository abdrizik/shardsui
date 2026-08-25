<script lang="ts">
  import { Checkbox } from '$lib/components/checkbox'
  import { CheckboxGroup } from '$lib/components/checkbox-group'
  import { Field, type FieldValidator } from '$lib/components/field'
  import { Fieldset } from '$lib/components/fieldset'
  import { Form } from '$lib/components/form'

  let {
    onFormSubmit,
    validate
  }: {
    onFormSubmit: (values: Record<string, unknown>) => void
    validate: FieldValidator
  } = $props()
</script>

<Form {onFormSubmit}>
  <Field.Root name="fruits">
    <CheckboxGroup value={['apple', 'banana']}>
      <Checkbox.Root value="apple" />
      <Fieldset.Root disabled>
        <Checkbox.Root value="banana" />
      </Fieldset.Root>
    </CheckboxGroup>
  </Field.Root>
  <Field.Root name="other" {validate}>
    <Field.Control value="value" />
  </Field.Root>
  <button type="submit">Submit</button>
</Form>
