<script lang="ts">
  import { Checkbox } from '$lib/components/checkbox'
  import { CheckboxGroup } from '$lib/components/checkbox-group'
  import { Field } from '$lib/components/field'
  import { Form } from '$lib/components/form'

  let {
    onFormSubmit,
    validateGroup,
    validateOther
  }: {
    onFormSubmit: (values: Record<string, unknown>) => void
    validateGroup: (value: unknown, values: Record<string, unknown>) => null
    validateOther: (value: unknown, values: Record<string, unknown>) => null
  } = $props()

  let disabled = $state(true)
</script>

<Form {onFormSubmit}>
  <Field.Root name="fruits" validate={validateGroup}>
    <CheckboxGroup value={['apple', 'banana']}>
      <Checkbox.Root value="apple" />
      <Checkbox.Root value="banana" {disabled} />
    </CheckboxGroup>
  </Field.Root>
  <Field.Root name="other" validate={validateOther}>
    <Field.Control value="value" />
  </Field.Root>
  <button type="button" onclick={() => (disabled = false)}>Enable</button>
  <button type="submit">Submit</button>
</Form>
