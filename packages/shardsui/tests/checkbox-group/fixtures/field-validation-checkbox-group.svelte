<script lang="ts">
  import { Form } from '$lib/components/form'
  import { Field, type FieldValidator } from '$lib/components/field'
  import { Checkbox } from '$lib/components/checkbox'
  import { CheckboxGroup } from '$lib/components/checkbox-group'

  let {
    validationMode,
    validate,
    value = []
  }: {
    validationMode?: 'onSubmit' | 'onBlur' | 'onChange'
    validate?: FieldValidator
    value?: string[]
  } = $props()
</script>

<Form>
  <Field.Root {validate} {validationMode} name="test">
    <CheckboxGroup {value}>
      <Field.Item>
        <Checkbox.Root value="one" data-testid="checkbox" />
      </Field.Item>
      <Field.Item>
        <Checkbox.Root value="two" data-testid="checkbox" />
      </Field.Item>
      <Field.Item>
        <Checkbox.Root value="three" data-testid="checkbox" />
      </Field.Item>
    </CheckboxGroup>
    <Field.Error data-testid="error" />
  </Field.Root>
  <button type="submit">submit</button>
</Form>
