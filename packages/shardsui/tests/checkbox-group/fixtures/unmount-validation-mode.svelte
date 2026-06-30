<script lang="ts">
  import { Checkbox } from '$lib/components/checkbox'
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

  let mounted = $state(true)
  let value = $state<string[]>([])
</script>

<Form>
  <Field.Root name="group" {validationMode} {validate}>
    <CheckboxGroup {value}>
      {#if mounted}
        <Checkbox.Root value="one" />
      {/if}
    </CheckboxGroup>
  </Field.Root>
  <button type="button" onclick={() => (mounted = false)}>Remove</button>
  <button type="button" onclick={() => (value = ['one'])}>Select</button>
  <button type="submit">Submit</button>
</Form>
