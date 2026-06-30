<script lang="ts">
  import { Checkbox } from '$lib/components/checkbox'
  import { CheckboxGroup } from '$lib/components/checkbox-group'
  import { Field } from '$lib/components/field'
  import { Form } from '$lib/components/form'

  let {
    onFormSubmit,
    validate
  }: {
    onFormSubmit: (values: Record<string, unknown>) => void
    validate: (value: unknown) => string | null
  } = $props()

  let mounted = $state(true)
</script>

<Form {onFormSubmit}>
  <Field.Root name="group" {validate}>
    <CheckboxGroup value={[]}>
      {#if mounted}
        <Checkbox.Root value="one" data-testid="checkbox" />
      {/if}
    </CheckboxGroup>
  </Field.Root>
  <button type="button" onclick={() => (mounted = false)}>Remove</button>
  <button type="submit">Submit</button>
</Form>
