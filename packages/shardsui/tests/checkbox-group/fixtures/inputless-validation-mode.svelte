<script lang="ts">
  import { CheckboxGroup } from '$lib/components/checkbox-group'
  import { Field } from '$lib/components/field'
  import { Form } from '$lib/components/form'

  let {
    validationMode,
    validate
  }: {
    validationMode: 'onSubmit' | 'onBlur'
    validate: () => string | null
  } = $props()

  let value = $state<string[]>([])
</script>

<Form>
  <Field.Root name="group" {validationMode} {validate}>
    <CheckboxGroup {value} />
  </Field.Root>
  <button type="button" onclick={() => (value = ['one'])}>Select one</button>
  <button type="button" onclick={() => (value = ['two'])}>Select two</button>
  <button type="submit">Submit</button>
</Form>
